#!/usr/bin/env node

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function hashPassword() {
  rl.question('Enter password to hash: ', (password) => {
    if (!password) {
      console.log('❌ Password is required');
      rl.close();
      return;
    }
    
    if (password.length < 6) {
      console.log('❌ Password should be at least 6 characters long');
      rl.close();
      return;
    }
    
    try {
      const saltRounds = 12;
      const hash = bcrypt.hashSync(password, saltRounds);
      
      console.log('\n✅ Password hashed successfully!');
      console.log('\nHashed password:');
      console.log(hash);
      console.log('\nYou can use this hash in your database or environment variables.');
      console.log('\nFor example, to update an admin password directly in the database:');
      console.log(`UPDATE admins SET passHash = '${hash}' WHERE username = 'admin';`);
      
    } catch (error) {
      console.error('❌ Error hashing password:', error.message);
    }
    
    rl.close();
  });
}

function showUsage() {
  console.log('🔐 CMS Password Hasher');
  console.log('');
  console.log('Usage: npm run hash');
  console.log('       node scripts/hash-password.js');
  console.log('');
  console.log('This utility helps you generate bcrypt hashes for admin passwords.');
  console.log('The generated hash can be used when creating admin users or updating passwords.');
  console.log('');
}

// Show usage and start the process
showUsage();
hashPassword();