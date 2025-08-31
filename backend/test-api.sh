#!/bin/bash

# Canvas Media Posts API Test Suite
# Run this script to test all Canvas API endpoints

BASE_URL="http://localhost:4001"
echo "🧪 Testing Canvas Media Posts API"
echo "Base URL: $BASE_URL"
echo

# Test 1: Create a Canvas
echo "📋 Test 1: Creating a Canvas"
CANVAS_RESPONSE=$(curl -s -X POST $BASE_URL/api/canvas \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Canvas", "description": "A test canvas for API validation"}')

echo "Response: $CANVAS_RESPONSE"
CANVAS_ID=$(echo $CANVAS_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Canvas ID: $CANVAS_ID"
echo

# Test 2: Create a text post
echo "📝 Test 2: Creating a text post"
TEXT_POST_RESPONSE=$(curl -s -X POST $BASE_URL/api/canvas/$CANVAS_ID/post \
  -H "Content-Type: application/json" \
  -d '{"type": "TEXT", "content": "Hello, this is my first text post!"}')

echo "Response: $TEXT_POST_RESPONSE"
echo

# Test 3: Create test image file
echo "🖼️ Test 3: Creating test image and uploading"
echo -e "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-image.png

IMAGE_POST_RESPONSE=$(curl -s -X POST $BASE_URL/api/canvas/$CANVAS_ID/post \
  -F "type=IMAGE" \
  -F "file=@/tmp/test-image.png")

echo "Response: $IMAGE_POST_RESPONSE"
echo

# Test 4: Get all posts for the canvas
echo "📋 Test 4: Getting all posts for canvas"
POSTS_RESPONSE=$(curl -s $BASE_URL/api/canvas/$CANVAS_ID/posts)
echo "Response: $POSTS_RESPONSE"
echo

# Test 5: List all canvases
echo "🗂️ Test 5: Listing all canvases"
CANVASES_RESPONSE=$(curl -s $BASE_URL/api/canvas)
echo "Response: $CANVASES_RESPONSE"
echo

# Test 6: Test validation - empty text content
echo "❌ Test 6: Testing validation (empty text content)"
VALIDATION_RESPONSE=$(curl -s -X POST $BASE_URL/api/canvas/$CANVAS_ID/post \
  -H "Content-Type: application/json" \
  -d '{"type": "TEXT", "content": ""}')

echo "Response: $VALIDATION_RESPONSE"
echo

# Test 7: Test validation - invalid canvas ID
echo "❌ Test 7: Testing validation (invalid canvas ID)"
INVALID_RESPONSE=$(curl -s -X POST $BASE_URL/api/canvas/invalid_id/post \
  -H "Content-Type: application/json" \
  -d '{"type": "TEXT", "content": "test"}')

echo "Response: $INVALID_RESPONSE"
echo

# Test 8: Verify uploaded file is accessible
echo "🔗 Test 8: Checking if uploaded files are accessible"
FILE_URL=$(echo $IMAGE_POST_RESPONSE | grep -o '"/uploads/[^"]*"' | tr -d '"')
if [ ! -z "$FILE_URL" ]; then
  echo "Testing file access: $BASE_URL$FILE_URL"
  curl -s -I $BASE_URL$FILE_URL | head -n 1
else
  echo "No file URL found in response"
fi
echo

echo "✅ All tests completed!"
echo
echo "💡 To run these tests:"
echo "1. Start the test server: node test-server.js"
echo "2. Run this script: bash test-api.sh"