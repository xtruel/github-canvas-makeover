#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './data/cms.db';
const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';

function createBackup() {
  try {
    console.log('🗄️  Starting CMS backup...');
    
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `cms-backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Backup database
    console.log('📊 Backing up database...');
    if (fs.existsSync(DB_PATH)) {
      const dbBackupPath = path.join(backupPath, 'cms.db');
      fs.copyFileSync(DB_PATH, dbBackupPath);
      console.log(`✅ Database backed up to: ${dbBackupPath}`);
    } else {
      console.log('⚠️  Database file not found, skipping database backup');
    }
    
    // Create uploads inventory
    console.log('📁 Creating uploads inventory...');
    const uploadsInventory = createUploadsInventory();
    const inventoryPath = path.join(backupPath, 'uploads-inventory.json');
    fs.writeFileSync(inventoryPath, JSON.stringify(uploadsInventory, null, 2));
    console.log(`✅ Uploads inventory created: ${inventoryPath}`);
    
    // Create backup manifest
    const manifest = createBackupManifest(uploadsInventory);
    const manifestPath = path.join(backupPath, 'backup-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Backup manifest created: ${manifestPath}`);
    
    // Cleanup old backups if enabled
    if (process.env.BACKUP_RETENTION_DAYS) {
      cleanupOldBackups();
    }
    
    console.log('');
    console.log('🎉 Backup completed successfully!');
    console.log(`📁 Backup location: ${backupPath}`);
    console.log(`📊 Database size: ${getFileSize(DB_PATH)}`);
    console.log(`📂 Total files: ${uploadsInventory.files.length}`);
    console.log(`💾 Total uploads size: ${formatBytes(uploadsInventory.totalSize)}`);
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

function createUploadsInventory() {
  const inventory = {
    createdAt: new Date().toISOString(),
    uploadsDir: UPLOADS_DIR,
    files: [],
    totalSize: 0,
    totalFiles: 0
  };
  
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('⚠️  Uploads directory not found, creating empty inventory');
    return inventory;
  }
  
  function scanDirectory(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativeFilePath);
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        const fileInfo = {
          path: relativeFilePath.replace(/\\/g, '/'), // Normalize path separators
          size: stats.size,
          modified: stats.mtime.toISOString(),
          created: stats.ctime.toISOString(),
          checksum: calculateFileChecksum(fullPath)
        };
        
        inventory.files.push(fileInfo);
        inventory.totalSize += stats.size;
        inventory.totalFiles++;
      }
    }
  }
  
  scanDirectory(UPLOADS_DIR);
  
  return inventory;
}

function createBackupManifest(uploadsInventory) {
  const manifest = {
    version: '1.0',
    type: 'cms-backup',
    createdAt: new Date().toISOString(),
    createdBy: 'CMS Backup Script',
    database: {
      path: DB_PATH,
      exists: fs.existsSync(DB_PATH),
      size: fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0
    },
    uploads: {
      directory: UPLOADS_DIR,
      totalFiles: uploadsInventory.totalFiles,
      totalSize: uploadsInventory.totalSize,
      inventoryFile: 'uploads-inventory.json'
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    },
    instructions: {
      restore: [
        '1. Stop the CMS server',
        '2. Copy cms.db to the data directory',
        '3. Restore uploads using the inventory file',
        '4. Restart the CMS server',
        '5. Verify all content is accessible'
      ],
      verification: [
        '1. Check database integrity',
        '2. Verify all media files are accessible',
        '3. Test admin login functionality',
        '4. Verify all articles display correctly'
      ]
    }
  };
  
  return manifest;
}

function calculateFileChecksum(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.warn(`⚠️  Could not calculate checksum for ${filePath}:`, error.message);
    return null;
  }
}

function getFileSize(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return formatBytes(stats.size);
    }
    return 'File not found';
  } catch (error) {
    return 'Error reading file';
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanupOldBackups() {
  try {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    console.log(`🧹 Cleaning up backups older than ${retentionDays} days...`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      return;
    }
    
    const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true });
    let deletedCount = 0;
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('cms-backup-')) {
        const backupPath = path.join(BACKUP_DIR, entry.name);
        const stats = fs.statSync(backupPath);
        
        if (stats.ctime.getTime() < cutoffTime) {
          console.log(`🗑️  Deleting old backup: ${entry.name}`);
          fs.rmSync(backupPath, { recursive: true, force: true });
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
    } else {
      console.log('✅ No old backups to clean up');
    }
    
  } catch (error) {
    console.warn('⚠️  Error during backup cleanup:', error.message);
  }
}

function showUsage() {
  console.log('💾 CMS Backup Utility');
  console.log('');
  console.log('Usage: npm run backup');
  console.log('       node scripts/backup.js');
  console.log('');
  console.log('This utility creates a complete backup of your CMS including:');
  console.log('• SQLite database');
  console.log('• Uploads inventory with checksums');
  console.log('• Backup manifest with restore instructions');
  console.log('');
  console.log('Environment Variables:');
  console.log('• DB_PATH: Path to SQLite database (default: ./data/cms.db)');
  console.log('• UPLOADS_DIR: Path to uploads directory (default: ./uploads)');
  console.log('• BACKUP_DIR: Path to backup directory (default: ./backups)');
  console.log('• BACKUP_RETENTION_DAYS: Days to keep old backups (optional)');
  console.log('');
}

// Main execution
if (require.main === module) {
  showUsage();
  createBackup();
}

module.exports = {
  createBackup,
  createUploadsInventory,
  createBackupManifest
};