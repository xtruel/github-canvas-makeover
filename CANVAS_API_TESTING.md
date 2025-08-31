# Canvas API Testing Guide

## Prerequisites

1. Ensure backend dependencies are installed:
   ```bash
   cd backend
   npm install
   ```

2. Configure Prisma (when network allows):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

## Manual API Testing

### 1. Create some Canvas records (for testing pagination)

Since the current implementation only has GET, PUT, DELETE endpoints, you would need to add Canvas records directly to the database or add a POST endpoint temporarily for testing.

If you have database access, you can insert test data:
```sql
INSERT INTO Canvas (id, name, description, createdAt, updatedAt) VALUES
  ('canvas1', 'My First Canvas', 'A test canvas for development', datetime('now'), datetime('now')),
  ('canvas2', 'Second Canvas', NULL, datetime('now'), datetime('now')),
  ('canvas3', 'Third Canvas', 'Another test canvas', datetime('now'), datetime('now'));
```

### 2. Test GET /api/canvas (Pagination)

```bash
# Get all canvases (default pagination)
curl http://localhost:4000/api/canvas

# Test pagination
curl "http://localhost:4000/api/canvas?limit=2&offset=0"
curl "http://localhost:4000/api/canvas?limit=2&offset=1"

# Test limit clamping
curl "http://localhost:4000/api/canvas?limit=150"  # Should clamp to 100
```

Expected response:
```json
{
  "data": [
    {
      "id": "canvas1",
      "name": "My First Canvas",
      "description": "A test canvas for development",
      "createdAt": "2024-12-31T00:00:00.000Z",
      "updatedAt": "2024-12-31T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "count": 1
  }
}
```

### 3. Test PUT /api/canvas/:id (Update)

```bash
# Update both name and description
curl -X PUT http://localhost:4000/api/canvas/canvas1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Canvas Name", "description": "Updated description"}'

# Update only name
curl -X PUT http://localhost:4000/api/canvas/canvas1 \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name Only"}'

# Update only description
curl -X PUT http://localhost:4000/api/canvas/canvas1 \
  -H "Content-Type: application/json" \
  -d '{"description": "New description only"}'

# Test error cases
curl -X PUT http://localhost:4000/api/canvas/canvas1 \
  -H "Content-Type: application/json" \
  -d '{}'  # Should return 400

curl -X PUT http://localhost:4000/api/canvas/canvas1 \
  -H "Content-Type: application/json" \
  -d '{"name": ""}'  # Should return 400

curl -X PUT http://localhost:4000/api/canvas/nonexistent \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'  # Should return 404
```

### 4. Test DELETE /api/canvas/:id

```bash
# Delete a canvas (returns 204 No Content)
curl -X DELETE http://localhost:4000/api/canvas/canvas1

# Try to delete non-existent canvas (should return 404)
curl -X DELETE http://localhost:4000/api/canvas/nonexistent
```

### 5. Verify DELETE worked

```bash
# Try to get the deleted canvas - should return 404 or empty result
curl http://localhost:4000/api/canvas
```

## Running Tests

```bash
cd backend
npm test
```

All 10 tests should pass:
- GET /api/canvas pagination tests
- PUT /api/canvas validation and success tests  
- DELETE /api/canvas success and error tests

## Note for Production

The current implementation is ready for production once:
1. Prisma client generation works (network connectivity for binaries)
2. Database migration is applied: `npx prisma migrate dev`
3. Canvas records can be created (either add POST endpoint or seed data)

The implementation follows all the requirements:
- ✅ Pagination with limit/offset 
- ✅ Validation for PUT requests
- ✅ Hard delete (not soft delete)
- ✅ 204 response for DELETE
- ✅ Proper error handling (400, 404, 500)
- ✅ Consistent ordering (createdAt desc)
- ✅ No total count in pagination (as requested)