#!/usr/bin/env node

/**
 * Test script to verify Canvas API structure and validation
 * Run with: node test-canvas-api.js
 */

import { z } from 'zod';

// Test Zod schemas (same as in canvas.ts)
const textPostSchema = z.object({
  type: z.literal('TEXT'),
  content: z.string().min(1, 'Content is required for text posts')
});

const mediaPostSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO'])
});

console.log('🧪 Testing Canvas API Validation Schemas...\n');

// Test text post validation
console.log('📝 Testing text post validation:');
try {
  const validText = textPostSchema.parse({ type: 'TEXT', content: 'Hello world!' });
  console.log('✅ Valid text post:', validText);
} catch (e) {
  console.log('❌ Text validation failed:', e.message);
}

try {
  const invalidText = textPostSchema.parse({ type: 'TEXT', content: '' });
  console.log('❌ Should have failed for empty content');
} catch (e) {
  console.log('✅ Correctly rejected empty content:', e.issues[0].message);
}

// Test media post validation  
console.log('\n🖼️ Testing media post validation:');
try {
  const validImage = mediaPostSchema.parse({ type: 'IMAGE' });
  console.log('✅ Valid image post:', validImage);
} catch (e) {
  console.log('❌ Image validation failed:', e.message);
}

try {
  const validVideo = mediaPostSchema.parse({ type: 'VIDEO' });
  console.log('✅ Valid video post:', validVideo);
} catch (e) {
  console.log('❌ Video validation failed:', e.message);
}

try {
  const invalidType = mediaPostSchema.parse({ type: 'INVALID' });
  console.log('❌ Should have failed for invalid type');
} catch (e) {
  console.log('✅ Correctly rejected invalid type:', e.issues[0].message);
}

// Test file type validation
console.log('\n📁 Testing file type validation:');
const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

const testFiles = [
  { mimetype: 'image/jpeg', expected: true },
  { mimetype: 'image/png', expected: true },
  { mimetype: 'video/mp4', expected: true },
  { mimetype: 'text/plain', expected: false },
  { mimetype: 'application/pdf', expected: false },
];

testFiles.forEach(({ mimetype, expected }) => {
  const isValid = allowedTypes.includes(mimetype);
  const result = isValid === expected ? '✅' : '❌';
  console.log(`${result} ${mimetype}: ${isValid ? 'allowed' : 'rejected'}`);
});

// Test file size validation logic
console.log('\n📊 Testing file size validation:');
const testSizes = [
  { type: 'IMAGE', size: 5 * 1024 * 1024, expected: true }, // 5MB image
  { type: 'IMAGE', size: 15 * 1024 * 1024, expected: false }, // 15MB image  
  { type: 'VIDEO', size: 30 * 1024 * 1024, expected: true }, // 30MB video
  { type: 'VIDEO', size: 60 * 1024 * 1024, expected: false }, // 60MB video
];

testSizes.forEach(({ type, size, expected }) => {
  const sizeInMB = size / (1024 * 1024);
  const isValid = (type === 'IMAGE' && sizeInMB <= 10) || (type === 'VIDEO' && sizeInMB <= 50);
  const result = isValid === expected ? '✅' : '❌';
  console.log(`${result} ${type} ${sizeInMB}MB: ${isValid ? 'allowed' : 'rejected'}`);
});

console.log('\n🎉 Canvas API validation tests completed!');
console.log('\n💡 To test the actual API:');
console.log('1. Run the database migration: npm run prisma:migrate');
console.log('2. Start the server: npm run dev');
console.log('3. Use the curl examples from the README');