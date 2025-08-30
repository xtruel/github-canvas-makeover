const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const { marked } = require('marked');
const RSS = require('rss');
const mime = require('mime-types');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure required directories exist
const requiredDirs = [
  './data',
  './uploads', 
  './uploads/media',
  './uploads/thumbnails',
  './backups'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Database setup
const db = new Database(process.env.DB_PATH || './data/cms.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Database initialization and migrations
function initializeDatabase() {
  try {
    // Media table
    db.exec(`
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('image', 'video', 'youtube')),
        description TEXT,
        filePath TEXT,
        thumbPath TEXT,
        webpPath TEXT,
        youtubeId TEXT,
        category TEXT,
        tags TEXT,
        isPrivate BOOLEAN DEFAULT 0,
        mediaMeta TEXT,
        publishAt INTEGER,
        createdAt INTEGER DEFAULT (strftime('%s', 'now')),
        deletedAt INTEGER NULL
      )
    `);

    // Articles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        body TEXT NOT NULL,
        coverPath TEXT,
        category TEXT,
        tags TEXT,
        publishAt INTEGER,
        createdAt INTEGER DEFAULT (strftime('%s', 'now')),
        deletedAt INTEGER NULL
      )
    `);

    // Admins table
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passHash TEXT NOT NULL,
        role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
        createdAt INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Audit table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin TEXT NOT NULL,
        action TEXT NOT NULL,
        targetType TEXT NOT NULL,
        targetId INTEGER,
        details TEXT,
        createdAt INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // API Keys table
    db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL,
        apiKey TEXT UNIQUE NOT NULL,
        active BOOLEAN DEFAULT 1,
        createdAt INTEGER DEFAULT (strftime('%s', 'now')),
        lastUsed INTEGER NULL
      )
    `);

    // Full-text search for articles
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS article_fts USING fts5(
        title, body, category, tags, content=articles, content_rowid=id
      )
    `);

    // FTS triggers
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
        INSERT INTO article_fts(rowid, title, body, category, tags) 
        VALUES (new.id, new.title, new.body, new.category, new.tags);
      END
    `);

    db.exec(`
      CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
        INSERT INTO article_fts(article_fts, rowid, title, body, category, tags) 
        VALUES('delete', old.id, old.title, old.body, old.category, old.tags);
      END
    `);

    db.exec(`
      CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
        INSERT INTO article_fts(article_fts, rowid, title, body, category, tags) 
        VALUES('delete', old.id, old.title, old.body, old.category, old.tags);
        INSERT INTO article_fts(rowid, title, body, category, tags) 
        VALUES (new.id, new.title, new.body, new.category, new.tags);
      END
    `);

    // Create default admin if none exists
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();
    if (adminCount.count === 0) {
      const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const hashedPassword = bcrypt.hashSync(defaultPassword, 12);
      
      db.prepare(`
        INSERT INTO admins (username, passHash, role) 
        VALUES (?, ?, 'admin')
      `).run(defaultUsername, hashedPassword);
      
      console.log(`✅ Default admin created: ${defaultUsername} / ${defaultPassword}`);
      console.log('⚠️  Please change the default password immediately!');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Initialize database
initializeDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT) || 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.WRITE_RATE_LIMIT) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.SEARCH_RATE_LIMIT) || 50,
  message: { error: 'Too many search requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: { error: 'API rate limit exceeded, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for valid API keys
    return req.validApiKey === true;
  }
});

// CSRF token generation
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

// Admin role check
function requireAdmin(req, res, next) {
  if (req.session && req.session.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin role required' });
}

// CSRF protection
function requireCSRF(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

// API Key validation middleware
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  try {
    const key = db.prepare('SELECT * FROM api_keys WHERE apiKey = ? AND active = 1').get(apiKey);
    
    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Update last used timestamp
    db.prepare('UPDATE api_keys SET lastUsed = ? WHERE id = ?')
      .run(Math.floor(Date.now() / 1000), key.id);
    
    req.validApiKey = true;
    req.apiKeyInfo = key;
    next();
  } catch (error) {
    res.status(500).json({ error: 'API key validation failed' });
  }
}

// Audit logging
function logAudit(admin, action, targetType, targetId, details = '') {
  try {
    db.prepare(`
      INSERT INTO audit (admin, action, targetType, targetId, details) 
      VALUES (?, ?, ?, ?, ?)
    `).run(admin, action, targetType, targetId, details);
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/media');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE) || 50) * 1024 * 1024, // MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_MEDIA_TYPES?.split(',') || [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));
app.use('/', express.static('public'));

// SSE clients storage
const sseClients = new Set();

// SSE endpoint
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  res.write('data: {"type": "connected"}\n\n');

  const clientId = Date.now();
  const client = { id: clientId, res };
  sseClients.add(client);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

// SSE broadcast function
function broadcastSSE(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(data);
    } catch (error) {
      sseClients.delete(client);
    }
  });
}

// Media processing helper
async function processImage(filePath, filename) {
  try {
    const baseName = path.parse(filename).name;
    const maxWidth = parseInt(process.env.MAX_IMAGE_WIDTH) || 1920;
    const maxHeight = parseInt(process.env.MAX_IMAGE_HEIGHT) || 1080;
    const thumbnailSize = parseInt(process.env.THUMBNAIL_SIZE) || 300;
    const webpQuality = parseInt(process.env.WEBP_QUALITY) || 80;
    const jpegQuality = parseInt(process.env.JPEG_QUALITY) || 85;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Auto-rotate based on EXIF
    image.rotate();

    // Resize main image if needed
    const mainPath = path.join('./uploads/media', `${baseName}_main.jpg`);
    await image
      .resize(maxWidth, maxHeight, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: jpegQuality })
      .toFile(mainPath);

    // Create thumbnail
    const thumbPath = path.join('./uploads/thumbnails', `${baseName}_thumb.jpg`);
    await image
      .resize(thumbnailSize, thumbnailSize, { 
        fit: 'cover', 
        position: 'center' 
      })
      .jpeg({ quality: jpegQuality })
      .toFile(thumbPath);

    // Create WebP version
    const webpPath = path.join('./uploads/media', `${baseName}_main.webp`);
    await image
      .resize(maxWidth, maxHeight, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: webpQuality })
      .toFile(webpPath);

    return {
      mainPath: mainPath.replace('./uploads/', '/uploads/'),
      thumbPath: thumbPath.replace('./uploads/', '/uploads/'),
      webpPath: webpPath.replace('./uploads/', '/uploads/'),
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: fs.statSync(filePath).size,
        exif: metadata.exif || null
      }
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
}

// Utility functions
function sanitizeTags(tags) {
  if (!tags) return '';
  return tags.split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .join(',');
}

function generateSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

function sanitizeContent(html) {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 'del',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'blockquote': ['cite'],
      'table': ['class'],
      'td': ['colspan', 'rowspan'],
      'th': ['colspan', 'rowspan']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  });
}

// Authentication endpoints
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    
    if (!admin || !bcrypt.compareSync(password, admin.passHash)) {
      logAudit(username, 'login_failed', 'admin', null, req.ip);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.adminId = admin.id;
    req.session.username = admin.username;
    req.session.role = admin.role;
    req.session.csrfToken = generateCSRFToken();
    
    logAudit(admin.username, 'login_success', 'admin', admin.id, req.ip);
    
    res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      csrfToken: req.session.csrfToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', requireAuth, (req, res) => {
  const username = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    logAudit(username, 'logout', 'admin', null);
    res.json({ success: true });
  });
});

app.get('/api/me', requireAuth, (req, res) => {
  const admin = db.prepare('SELECT id, username, role FROM admins WHERE id = ?')
    .get(req.session.adminId);
  
  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  
  // Generate new CSRF token if needed
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  res.json({
    admin,
    csrfToken: req.session.csrfToken
  });
});

// Public API endpoints
app.get('/api/media', apiLimiter, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const tag = req.query.tag;
    const category = req.query.category;
    const now = Math.floor(Date.now() / 1000);
    
    let query = `
      SELECT id, title, type, description, category, tags, 
             CASE 
               WHEN isPrivate = 1 THEN NULL 
               ELSE filePath 
             END as filePath,
             CASE 
               WHEN isPrivate = 1 THEN NULL 
               ELSE thumbPath 
             END as thumbPath,
             CASE 
               WHEN isPrivate = 1 THEN NULL 
               ELSE webpPath 
             END as webpPath,
             youtubeId, createdAt
      FROM media 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
        AND isPrivate = 0
    `;
    
    const params = [now];
    
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const media = db.prepare(query).all(...params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM media 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
        AND isPrivate = 0
    `;
    const countParams = [now];
    
    if (tag) {
      countQuery += ' AND tags LIKE ?';
      countParams.push(`%${tag}%`);
    }
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    const { total } = db.prepare(countQuery).get(...countParams);
    
    res.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Media fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

app.get('/api/articles', apiLimiter, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const tag = req.query.tag;
    const category = req.query.category;
    const now = Math.floor(Date.now() / 1000);
    
    let query = `
      SELECT id, title, slug, body, coverPath, category, tags, createdAt
      FROM articles 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
    `;
    
    const params = [now];
    
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const articles = db.prepare(query).all(...params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total FROM articles 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
    `;
    const countParams = [now];
    
    if (tag) {
      countQuery += ' AND tags LIKE ?';
      countParams.push(`%${tag}%`);
    }
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    const { total } = db.prepare(countQuery).get(...countParams);
    
    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Articles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/search/articles', searchLimiter, (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const now = Math.floor(Date.now() / 1000);
    
    const searchQuery = `
      SELECT a.id, a.title, a.slug, a.coverPath, a.category, a.tags, a.createdAt,
             snippet(article_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
      FROM article_fts 
      JOIN articles a ON article_fts.rowid = a.id
      WHERE article_fts MATCH ? 
        AND a.deletedAt IS NULL 
        AND (a.publishAt IS NULL OR a.publishAt <= ?)
      ORDER BY rank
      LIMIT ? OFFSET ?
    `;
    
    const articles = db.prepare(searchQuery).all(query, now, limit, offset);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM article_fts 
      JOIN articles a ON article_fts.rowid = a.id
      WHERE article_fts MATCH ? 
        AND a.deletedAt IS NULL 
        AND (a.publishAt IS NULL OR a.publishAt <= ?)
    `;
    
    const { total } = db.prepare(countQuery).get(query, now);
    
    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      query
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Private media access with token
app.get('/api/media/private', (req, res) => {
  try {
    const { token, id } = req.query;
    
    if (!token || !id) {
      return res.status(400).json({ error: 'Token and media ID required' });
    }
    
    // Verify token
    const [mediaId, expiry, signature] = token.split('.');
    
    if (mediaId !== id || !expiry || !signature) {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    
    if (parseInt(expiry) < Math.floor(Date.now() / 1000)) {
      return res.status(400).json({ error: 'Token expired' });
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.TOKEN_SECRET)
      .update(`${mediaId}.${expiry}`)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid token signature' });
    }
    
    // Get media
    const media = db.prepare('SELECT * FROM media WHERE id = ? AND isPrivate = 1 AND deletedAt IS NULL')
      .get(id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    res.json({
      id: media.id,
      title: media.title,
      type: media.type,
      description: media.description,
      filePath: media.filePath,
      thumbPath: media.thumbPath,
      webpPath: media.webpPath,
      youtubeId: media.youtubeId,
      category: media.category,
      tags: media.tags,
      createdAt: media.createdAt
    });
  } catch (error) {
    console.error('Private media access error:', error);
    res.status(500).json({ error: 'Access failed' });
  }
});

// Admin API endpoints
app.post('/api/admin/media', requireAuth, writeLimiter, requireCSRF, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, tags, isPrivate, youtubeId, publishAt } = req.body;
    let type = 'image';
    let filePath = null;
    let thumbPath = null;
    let webpPath = null;
    let mediaMeta = null;
    
    if (youtubeId) {
      type = 'youtube';
    } else if (req.file) {
      type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      filePath = `/uploads/media/${req.file.filename}`;
      
      if (type === 'image') {
        try {
          const processed = await processImage(req.file.path, req.file.filename);
          filePath = processed.mainPath;
          thumbPath = processed.thumbPath;
          webpPath = processed.webpPath;
          mediaMeta = JSON.stringify(processed.metadata);
        } catch (error) {
          console.error('Image processing failed:', error);
          return res.status(500).json({ error: 'Image processing failed' });
        }
      }
    } else {
      return res.status(400).json({ error: 'File or YouTube ID required' });
    }
    
    const sanitizedTags = sanitizeTags(tags);
    const publishAtTimestamp = publishAt ? Math.floor(new Date(publishAt).getTime() / 1000) : null;
    
    const result = db.prepare(`
      INSERT INTO media (title, type, description, filePath, thumbPath, webpPath, youtubeId, 
                        category, tags, isPrivate, mediaMeta, publishAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, type, description, filePath, thumbPath, webpPath, youtubeId,
      category || null, sanitizedTags, isPrivate === 'true' ? 1 : 0, mediaMeta, publishAtTimestamp
    );
    
    logAudit(req.session.username, 'create', 'media', result.lastInsertRowid, title);
    
    // Broadcast SSE event
    broadcastSSE({
      type: 'media:new',
      data: { id: result.lastInsertRowid, title, type }
    });
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Media creation error:', error);
    res.status(500).json({ error: 'Failed to create media' });
  }
});

app.get('/api/admin/media', requireAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    let query = 'SELECT * FROM media';
    const params = [];
    
    if (!includeDeleted) {
      query += ' WHERE deletedAt IS NULL';
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const media = db.prepare(query).all(...params);
    
    const countQuery = includeDeleted ? 
      'SELECT COUNT(*) as total FROM media' :
      'SELECT COUNT(*) as total FROM media WHERE deletedAt IS NULL';
    
    const { total } = db.prepare(countQuery).get();
    
    res.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin media fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

app.put('/api/admin/media/:id', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, isPrivate, publishAt } = req.body;
    
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    const sanitizedTags = sanitizeTags(tags);
    const publishAtTimestamp = publishAt ? Math.floor(new Date(publishAt).getTime() / 1000) : null;
    
    db.prepare(`
      UPDATE media 
      SET title = ?, description = ?, category = ?, tags = ?, isPrivate = ?, publishAt = ?
      WHERE id = ?
    `).run(title, description, category || null, sanitizedTags, isPrivate ? 1 : 0, publishAtTimestamp, id);
    
    logAudit(req.session.username, 'update', 'media', id, title);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Media update error:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

app.delete('/api/admin/media/:id', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    if (permanent === 'true') {
      // Permanent delete - remove files
      if (media.filePath && fs.existsSync(`./uploads${media.filePath.replace('/uploads', '')}`)) {
        fs.unlinkSync(`./uploads${media.filePath.replace('/uploads', '')}`);
      }
      if (media.thumbPath && fs.existsSync(`./uploads${media.thumbPath.replace('/uploads', '')}`)) {
        fs.unlinkSync(`./uploads${media.thumbPath.replace('/uploads', '')}`);
      }
      if (media.webpPath && fs.existsSync(`./uploads${media.webpPath.replace('/uploads', '')}`)) {
        fs.unlinkSync(`./uploads${media.webpPath.replace('/uploads', '')}`);
      }
      
      db.prepare('DELETE FROM media WHERE id = ?').run(id);
      
      logAudit(req.session.username, 'purge', 'media', id, media.title);
      
      broadcastSSE({
        type: 'media:purge',
        data: { id, title: media.title }
      });
    } else {
      // Soft delete
      db.prepare('UPDATE media SET deletedAt = ? WHERE id = ?')
        .run(Math.floor(Date.now() / 1000), id);
      
      logAudit(req.session.username, 'delete', 'media', id, media.title);
      
      broadcastSSE({
        type: 'media:delete',
        data: { id, title: media.title }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

app.post('/api/admin/media/:id/restore', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    
    const media = db.prepare('SELECT * FROM media WHERE id = ? AND deletedAt IS NOT NULL').get(id);
    if (!media) {
      return res.status(404).json({ error: 'Deleted media not found' });
    }
    
    db.prepare('UPDATE media SET deletedAt = NULL WHERE id = ?').run(id);
    
    logAudit(req.session.username, 'restore', 'media', id, media.title);
    
    broadcastSSE({
      type: 'media:restore',
      data: { id, title: media.title }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Media restore error:', error);
    res.status(500).json({ error: 'Failed to restore media' });
  }
});

// Articles endpoints
app.post('/api/admin/articles', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { title, body, coverPath, category, tags, publishAt } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    
    const slug = generateSlug(title);
    const sanitizedBody = sanitizeContent(body);
    const sanitizedTags = sanitizeTags(tags);
    const publishAtTimestamp = publishAt ? Math.floor(new Date(publishAt).getTime() / 1000) : null;
    
    // Check for duplicate slug
    const existingArticle = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
    if (existingArticle) {
      return res.status(400).json({ error: 'Article with this title already exists' });
    }
    
    const result = db.prepare(`
      INSERT INTO articles (title, slug, body, coverPath, category, tags, publishAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, slug, sanitizedBody, coverPath || null, category || null, sanitizedTags, publishAtTimestamp);
    
    logAudit(req.session.username, 'create', 'article', result.lastInsertRowid, title);
    
    broadcastSSE({
      type: 'article:new',
      data: { id: result.lastInsertRowid, title, slug }
    });
    
    res.json({ success: true, id: result.lastInsertRowid, slug });
  } catch (error) {
    console.error('Article creation error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

app.get('/api/admin/articles', requireAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    let query = 'SELECT * FROM articles';
    const params = [];
    
    if (!includeDeleted) {
      query += ' WHERE deletedAt IS NULL';
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const articles = db.prepare(query).all(...params);
    
    const countQuery = includeDeleted ? 
      'SELECT COUNT(*) as total FROM articles' :
      'SELECT COUNT(*) as total FROM articles WHERE deletedAt IS NULL';
    
    const { total } = db.prepare(countQuery).get();
    
    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin articles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/admin/articles/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

app.put('/api/admin/articles/:id', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, coverPath, category, tags, publishAt } = req.body;
    
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    let slug = article.slug;
    if (title !== article.title) {
      slug = generateSlug(title);
      
      // Check for duplicate slug
      const existingArticle = db.prepare('SELECT id FROM articles WHERE slug = ? AND id != ?').get(slug, id);
      if (existingArticle) {
        return res.status(400).json({ error: 'Article with this title already exists' });
      }
    }
    
    const sanitizedBody = sanitizeContent(body);
    const sanitizedTags = sanitizeTags(tags);
    const publishAtTimestamp = publishAt ? Math.floor(new Date(publishAt).getTime() / 1000) : null;
    
    db.prepare(`
      UPDATE articles 
      SET title = ?, slug = ?, body = ?, coverPath = ?, category = ?, tags = ?, publishAt = ?
      WHERE id = ?
    `).run(title, slug, sanitizedBody, coverPath || null, category || null, sanitizedTags, publishAtTimestamp, id);
    
    logAudit(req.session.username, 'update', 'article', id, title);
    
    res.json({ success: true, slug });
  } catch (error) {
    console.error('Article update error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/admin/articles/:id', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    if (permanent === 'true') {
      db.prepare('DELETE FROM articles WHERE id = ?').run(id);
      
      logAudit(req.session.username, 'purge', 'article', id, article.title);
      
      broadcastSSE({
        type: 'article:purge',
        data: { id, title: article.title }
      });
    } else {
      db.prepare('UPDATE articles SET deletedAt = ? WHERE id = ?')
        .run(Math.floor(Date.now() / 1000), id);
      
      logAudit(req.session.username, 'delete', 'article', id, article.title);
      
      broadcastSSE({
        type: 'article:delete',
        data: { id, title: article.title }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Article delete error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

app.post('/api/admin/articles/:id/restore', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    
    const article = db.prepare('SELECT * FROM articles WHERE id = ? AND deletedAt IS NOT NULL').get(id);
    if (!article) {
      return res.status(404).json({ error: 'Deleted article not found' });
    }
    
    db.prepare('UPDATE articles SET deletedAt = NULL WHERE id = ?').run(id);
    
    logAudit(req.session.username, 'restore', 'article', id, article.title);
    
    broadcastSSE({
      type: 'article:restore',
      data: { id, title: article.title }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Article restore error:', error);
    res.status(500).json({ error: 'Failed to restore article' });
  }
});

// RSS Feed
app.get('/feed.xml', (req, res) => {
  try {
    const siteName = process.env.SITE_NAME || 'CMS';
    const siteDescription = process.env.SITE_DESCRIPTION || 'Content Management System';
    const siteUrl = process.env.SITE_BASE_URL || 'http://localhost:3000';
    const now = Math.floor(Date.now() / 1000);
    
    const feed = new RSS({
      title: siteName,
      description: siteDescription,
      feed_url: `${siteUrl}/feed.xml`,
      site_url: siteUrl,
      language: 'en',
      ttl: 60
    });
    
    const articles = db.prepare(`
      SELECT title, slug, body, createdAt 
      FROM articles 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
      ORDER BY createdAt DESC 
      LIMIT 20
    `).all(now);
    
    articles.forEach(article => {
      feed.item({
        title: article.title,
        description: article.body.substring(0, 500) + '...',
        url: `${siteUrl}/article/${article.slug}`,
        guid: `${siteUrl}/article/${article.slug}`,
        date: new Date(article.createdAt * 1000)
      });
    });
    
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed.xml());
  } catch (error) {
    console.error('RSS generation error:', error);
    res.status(500).json({ error: 'RSS generation failed' });
  }
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  try {
    const siteUrl = process.env.SITE_BASE_URL || 'http://localhost:3000';
    const now = Math.floor(Date.now() / 1000);
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
    
    const articles = db.prepare(`
      SELECT slug, createdAt 
      FROM articles 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
      ORDER BY createdAt DESC
    `).all(now);
    
    articles.forEach(article => {
      const date = new Date(article.createdAt * 1000).toISOString().split('T')[0];
      sitemap += `
  <url>
    <loc>${siteUrl}/article/${article.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
    
    sitemap += '\n</urlset>';
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Sitemap generation failed' });
  }
});

// Scheduled publishing poller
function startPublishingPoller() {
  const interval = parseInt(process.env.PUBLISH_POLL_INTERVAL) || 30000;
  
  setInterval(() => {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Check for media to publish
      const mediaToPublish = db.prepare(`
        SELECT * FROM media 
        WHERE publishAt IS NOT NULL 
          AND publishAt <= ? 
          AND deletedAt IS NULL
      `).all(now);
      
      mediaToPublish.forEach(media => {
        db.prepare('UPDATE media SET publishAt = NULL WHERE id = ?').run(media.id);
        
        broadcastSSE({
          type: 'media:publish',
          data: { id: media.id, title: media.title, type: media.type }
        });
      });
      
      // Check for articles to publish
      const articlesToPublish = db.prepare(`
        SELECT * FROM articles 
        WHERE publishAt IS NOT NULL 
          AND publishAt <= ? 
          AND deletedAt IS NULL
      `).all(now);
      
      articlesToPublish.forEach(article => {
        db.prepare('UPDATE articles SET publishAt = NULL WHERE id = ?').run(article.id);
        
        broadcastSSE({
          type: 'article:publish',
          data: { id: article.id, title: article.title, slug: article.slug }
        });
      });
      
    } catch (error) {
      console.error('Publishing poller error:', error);
    }
  }, interval);
}

// API Keys management
app.get('/api/admin/api-keys', requireAuth, requireAdmin, (req, res) => {
  try {
    const keys = db.prepare('SELECT id, label, apiKey, active, createdAt, lastUsed FROM api_keys ORDER BY createdAt DESC').all();
    res.json(keys);
  } catch (error) {
    console.error('API keys fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

app.post('/api/admin/api-keys', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { label } = req.body;
    
    if (!label) {
      return res.status(400).json({ error: 'Label is required' });
    }
    
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const result = db.prepare('INSERT INTO api_keys (label, apiKey) VALUES (?, ?)').run(label, apiKey);
    
    logAudit(req.session.username, 'create', 'api_key', result.lastInsertRowid, label);
    
    res.json({ success: true, id: result.lastInsertRowid, apiKey });
  } catch (error) {
    console.error('API key creation error:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

app.put('/api/admin/api-keys/:id', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    db.prepare('UPDATE api_keys SET active = ? WHERE id = ?').run(active ? 1 : 0, id);
    
    logAudit(req.session.username, 'update', 'api_key', id, `active: ${active}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('API key update error:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

app.delete('/api/admin/api-keys/:id', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
    if (!key) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
    
    logAudit(req.session.username, 'delete', 'api_key', id, key.label);
    
    res.json({ success: true });
  } catch (error) {
    console.error('API key deletion error:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// Admin user management
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, role, createdAt FROM admins ORDER BY createdAt DESC').all();
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (!['admin', 'editor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const existingUser = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    const result = db.prepare('INSERT INTO admins (username, passHash, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
    
    logAudit(req.session.username, 'create', 'admin', result.lastInsertRowid, username);
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    
    if (parseInt(id) === req.session.adminId) {
      return res.status(400).json({ error: 'Cannot modify your own account' });
    }
    
    const user = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let updates = [];
    let values = [];
    
    if (username && username !== user.username) {
      const existingUser = db.prepare('SELECT id FROM admins WHERE username = ? AND id != ?').get(username, id);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      updates.push('username = ?');
      values.push(username);
    }
    
    if (password) {
      updates.push('passHash = ?');
      values.push(bcrypt.hashSync(password, 12));
    }
    
    if (role && ['admin', 'editor'].includes(role)) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      
      logAudit(req.session.username, 'update', 'admin', id, user.username);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.session.adminId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = db.prepare('SELECT * FROM admins WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    
    logAudit(req.session.username, 'delete', 'admin', id, user.username);
    
    res.json({ success: true });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Tags and categories management
app.get('/api/meta/tags', (req, res) => {
  try {
    const type = req.query.type || 'both'; // 'media', 'articles', or 'both'
    
    let mediaTags = [];
    let articleTags = [];
    
    if (type === 'media' || type === 'both') {
      const mediaRows = db.prepare('SELECT DISTINCT tags FROM media WHERE tags IS NOT NULL AND tags != "" AND deletedAt IS NULL').all();
      mediaTags = [...new Set(mediaRows.flatMap(row => row.tags.split(',').map(tag => tag.trim())))].filter(Boolean);
    }
    
    if (type === 'articles' || type === 'both') {
      const articleRows = db.prepare('SELECT DISTINCT tags FROM articles WHERE tags IS NOT NULL AND tags != "" AND deletedAt IS NULL').all();
      articleTags = [...new Set(articleRows.flatMap(row => row.tags.split(',').map(tag => tag.trim())))].filter(Boolean);
    }
    
    const allTags = [...new Set([...mediaTags, ...articleTags])];
    
    res.json({
      tags: allTags.sort(),
      mediaTags: mediaTags.sort(),
      articleTags: articleTags.sort()
    });
  } catch (error) {
    console.error('Tags fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

app.get('/api/meta/categories', (req, res) => {
  try {
    const type = req.query.type || 'both';
    
    let mediaCategories = [];
    let articleCategories = [];
    
    if (type === 'media' || type === 'both') {
      mediaCategories = db.prepare('SELECT DISTINCT category FROM media WHERE category IS NOT NULL AND category != "" AND deletedAt IS NULL').all()
        .map(row => row.category);
    }
    
    if (type === 'articles' || type === 'both') {
      articleCategories = db.prepare('SELECT DISTINCT category FROM articles WHERE category IS NOT NULL AND category != "" AND deletedAt IS NULL').all()
        .map(row => row.category);
    }
    
    const allCategories = [...new Set([...mediaCategories, ...articleCategories])];
    
    res.json({
      categories: allCategories.sort(),
      mediaCategories: mediaCategories.sort(),
      articleCategories: articleCategories.sort()
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/admin/meta/tags/rename', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { oldTag, newTag, type } = req.body;
    
    if (!oldTag || !newTag) {
      return res.status(400).json({ error: 'Old and new tag names are required' });
    }
    
    const sanitizedOldTag = oldTag.trim().toLowerCase();
    const sanitizedNewTag = newTag.trim().toLowerCase();
    
    if (sanitizedOldTag === sanitizedNewTag) {
      return res.status(400).json({ error: 'Old and new tags are the same' });
    }
    
    const db_transaction = db.transaction(() => {
      if (type === 'media' || type === 'both') {
        const mediaItems = db.prepare('SELECT id, tags FROM media WHERE tags LIKE ?').all(`%${sanitizedOldTag}%`);
        
        mediaItems.forEach(item => {
          const tags = item.tags.split(',').map(tag => {
            const trimmed = tag.trim().toLowerCase();
            return trimmed === sanitizedOldTag ? sanitizedNewTag : trimmed;
          });
          const newTags = [...new Set(tags)].join(',');
          
          db.prepare('UPDATE media SET tags = ? WHERE id = ?').run(newTags, item.id);
        });
      }
      
      if (type === 'articles' || type === 'both') {
        const articles = db.prepare('SELECT id, tags FROM articles WHERE tags LIKE ?').all(`%${sanitizedOldTag}%`);
        
        articles.forEach(article => {
          const tags = article.tags.split(',').map(tag => {
            const trimmed = tag.trim().toLowerCase();
            return trimmed === sanitizedOldTag ? sanitizedNewTag : trimmed;
          });
          const newTags = [...new Set(tags)].join(',');
          
          db.prepare('UPDATE articles SET tags = ? WHERE id = ?').run(newTags, article.id);
        });
      }
    });
    
    db_transaction();
    
    logAudit(req.session.username, 'rename_tag', 'meta', null, `${oldTag} -> ${newTag}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Tag rename error:', error);
    res.status(500).json({ error: 'Failed to rename tag' });
  }
});

app.post('/api/admin/meta/tags/merge', requireAuth, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { sourceTags, targetTag, type } = req.body;
    
    if (!sourceTags || !Array.isArray(sourceTags) || !targetTag) {
      return res.status(400).json({ error: 'Source tags array and target tag are required' });
    }
    
    const sanitizedSourceTags = sourceTags.map(tag => tag.trim().toLowerCase());
    const sanitizedTargetTag = targetTag.trim().toLowerCase();
    
    const db_transaction = db.transaction(() => {
      if (type === 'media' || type === 'both') {
        sanitizedSourceTags.forEach(sourceTag => {
          const mediaItems = db.prepare('SELECT id, tags FROM media WHERE tags LIKE ?').all(`%${sourceTag}%`);
          
          mediaItems.forEach(item => {
            const tags = item.tags.split(',').map(tag => {
              const trimmed = tag.trim().toLowerCase();
              return sanitizedSourceTags.includes(trimmed) ? sanitizedTargetTag : trimmed;
            });
            const newTags = [...new Set(tags)].join(',');
            
            db.prepare('UPDATE media SET tags = ? WHERE id = ?').run(newTags, item.id);
          });
        });
      }
      
      if (type === 'articles' || type === 'both') {
        sanitizedSourceTags.forEach(sourceTag => {
          const articles = db.prepare('SELECT id, tags FROM articles WHERE tags LIKE ?').all(`%${sourceTag}%`);
          
          articles.forEach(article => {
            const tags = article.tags.split(',').map(tag => {
              const trimmed = tag.trim().toLowerCase();
              return sanitizedSourceTags.includes(trimmed) ? sanitizedTargetTag : trimmed;
            });
            const newTags = [...new Set(tags)].join(',');
            
            db.prepare('UPDATE articles SET tags = ? WHERE id = ?').run(newTags, article.id);
          });
        });
      }
    });
    
    db_transaction();
    
    logAudit(req.session.username, 'merge_tags', 'meta', null, `${sourceTags.join(', ')} -> ${targetTag}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Tag merge error:', error);
    res.status(500).json({ error: 'Failed to merge tags' });
  }
});

// Audit log
app.get('/api/admin/audit', requireAuth, requireAdmin, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;
    
    const logs = db.prepare('SELECT * FROM audit ORDER BY createdAt DESC LIMIT ? OFFSET ?').all(limit, offset);
    const { total } = db.prepare('SELECT COUNT(*) as total FROM audit').get();
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Audit fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.delete('/api/admin/audit', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { before } = req.query;
    
    if (before) {
      const beforeTimestamp = Math.floor(new Date(before).getTime() / 1000);
      db.prepare('DELETE FROM audit WHERE createdAt < ?').run(beforeTimestamp);
    } else {
      db.prepare('DELETE FROM audit').run();
    }
    
    logAudit(req.session.username, 'purge_audit', 'audit', null, before || 'all');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Audit purge error:', error);
    res.status(500).json({ error: 'Failed to purge audit logs' });
  }
});

// Recycle bin endpoints
app.get('/api/admin/recycle', requireAuth, (req, res) => {
  try {
    const type = req.query.type || 'both';
    let deletedItems = [];
    
    if (type === 'media' || type === 'both') {
      const deletedMedia = db.prepare('SELECT *, "media" as itemType FROM media WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC').all();
      deletedItems = deletedItems.concat(deletedMedia);
    }
    
    if (type === 'articles' || type === 'both') {
      const deletedArticles = db.prepare('SELECT *, "article" as itemType FROM articles WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC').all();
      deletedItems = deletedItems.concat(deletedArticles);
    }
    
    // Sort by deletedAt
    deletedItems.sort((a, b) => b.deletedAt - a.deletedAt);
    
    res.json({ items: deletedItems });
  } catch (error) {
    console.error('Recycle bin fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch deleted items' });
  }
});

app.post('/api/admin/recycle/purge-all', requireAuth, requireAdmin, writeLimiter, requireCSRF, (req, res) => {
  try {
    const { type } = req.body;
    
    const db_transaction = db.transaction(() => {
      if (type === 'media' || type === 'both') {
        const deletedMedia = db.prepare('SELECT * FROM media WHERE deletedAt IS NOT NULL').all();
        
        deletedMedia.forEach(media => {
          // Remove files
          if (media.filePath && fs.existsSync(`./uploads${media.filePath.replace('/uploads', '')}`)) {
            fs.unlinkSync(`./uploads${media.filePath.replace('/uploads', '')}`);
          }
          if (media.thumbPath && fs.existsSync(`./uploads${media.thumbPath.replace('/uploads', '')}`)) {
            fs.unlinkSync(`./uploads${media.thumbPath.replace('/uploads', '')}`);
          }
          if (media.webpPath && fs.existsSync(`./uploads${media.webpPath.replace('/uploads', '')}`)) {
            fs.unlinkSync(`./uploads${media.webpPath.replace('/uploads', '')}`);
          }
        });
        
        db.prepare('DELETE FROM media WHERE deletedAt IS NOT NULL').run();
      }
      
      if (type === 'articles' || type === 'both') {
        db.prepare('DELETE FROM articles WHERE deletedAt IS NOT NULL').run();
      }
    });
    
    db_transaction();
    
    logAudit(req.session.username, 'purge_all', 'recycle', null, type);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Recycle purge all error:', error);
    res.status(500).json({ error: 'Failed to purge recycle bin' });
  }
});

// Public API endpoints with API key authentication
app.get('/api/public/media', validateApiKey, apiLimiter, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const now = Math.floor(Date.now() / 1000);
    
    const media = db.prepare(`
      SELECT id, title, type, description, filePath, thumbPath, webpPath, youtubeId, category, tags, createdAt
      FROM media 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
        AND isPrivate = 0
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).all(now, limit, offset);
    
    const { total } = db.prepare(`
      SELECT COUNT(*) as total FROM media 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
        AND isPrivate = 0
    `).get(now);
    
    res.json({
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Public media API error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

app.get('/api/public/articles', validateApiKey, apiLimiter, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const now = Math.floor(Date.now() / 1000);
    
    const articles = db.prepare(`
      SELECT id, title, slug, body, coverPath, category, tags, createdAt
      FROM articles 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `).all(now, limit, offset);
    
    const { total } = db.prepare(`
      SELECT COUNT(*) as total FROM articles 
      WHERE deletedAt IS NULL 
        AND (publishAt IS NULL OR publishAt <= ?)
    `).get(now);
    
    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Public articles API error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 CMS Server running on port ${PORT}`);
  console.log(`📝 Admin interface: http://localhost:${PORT}/admin.html`);
  console.log(`🌐 Public site: http://localhost:${PORT}/`);
  
  // Start publishing poller
  startPublishingPoller();
  console.log('⏰ Publishing poller started');
});