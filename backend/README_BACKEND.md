# Backend API Documentation

This is the backend API for the Github Canvas Makeover project, providing authentication, media upload, and article management functionality.

## Features

- **JWT Authentication** with admin role support
- **Media Upload** endpoints for images and videos (admin only)
- **Article CRUD** operations with media association
- **Environment Validation** with strict configuration checking
- **File Storage** with size limits and MIME type filtering
- **Admin Bootstrap** automatic admin user creation

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration (IMPORTANT: Change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Admin Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-secure-password"

# Server Configuration
PORT="3001"
NODE_ENV="development"

# Media Upload Configuration
MEDIA_LOCAL_DIR="uploads"
MAX_IMAGE_SIZE_MB="10"
MAX_VIDEO_SIZE_MB="100"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/gif,image/webp"
ALLOWED_VIDEO_TYPES="video/mp4,video/webm,video/quicktime"
```

### 3. Database Setup

Initialize and generate Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### `POST /auth/login`
Login with username and password to receive a JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### Media Upload (Admin Only)

All media endpoints require authentication with `Authorization: Bearer <token>` header and admin role.

#### `POST /media/image`
Upload an image file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file)

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "photo-1234567890-987654321.jpg",
    "originalName": "photo.jpg",
    "mimetype": "image/jpeg",
    "size": 2048576,
    "path": "/media/photo-1234567890-987654321.jpg",
    "uploadedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### `POST /media/video`
Upload a video file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `video` (file)

**Response:** Same format as image upload.

### Articles

#### `POST /articles` (Admin Only)
Create a new article with optional media attachments.

**Request:**
```json
{
  "title": "Article Title",
  "content": "Article content goes here...",
  "media": [
    {
      "filename": "photo-1234567890-987654321.jpg",
      "originalName": "photo.jpg",
      "mimetype": "image/jpeg",
      "size": 2048576,
      "path": "/media/photo-1234567890-987654321.jpg",
      "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "published": true
}
```

#### `GET /articles`
Get all articles. Add `?published=true` to get only published articles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "article-id",
      "title": "Article Title",
      "content": "Article content...",
      "media": [...],
      "published": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### `GET /articles/:id`
Get a specific article by ID.

### Health Check

#### `GET /health`
Check server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## Testing the API

### 1. Start the server
```bash
npm run dev
```

### 2. Login to get a token
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### 3. Upload an image
```bash
curl -X POST http://localhost:3001/media/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/your/image.jpg"
```

### 4. Create an article
```bash
curl -X POST http://localhost:3001/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Article","content":"Test content","published":true}'
```

### 5. Get articles
```bash
curl http://localhost:3001/articles
```

## Security Notes

- Change `JWT_SECRET` to a secure random string in production
- Update `ADMIN_PASSWORD` to a strong password
- Use HTTPS in production
- Configure appropriate CORS settings for your frontend domain
- Consider implementing rate limiting for production use

## File Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── middleware.ts     # JWT and admin middleware
│   │   └── routes.ts         # Login endpoint and admin bootstrap
│   ├── media/
│   │   ├── storage.ts        # Multer configuration
│   │   └── routes.ts         # Media upload endpoints
│   ├── articles/
│   │   └── routes.ts         # Article CRUD endpoints
│   ├── config.ts             # Environment validation
│   ├── prisma.ts             # Database client
│   ├── hash.ts               # Password hashing utilities
│   ├── jwt.ts                # JWT utilities
│   └── index.ts              # Server bootstrap
├── prisma/
│   └── schema.prisma         # Database schema
├── uploads/                  # Media upload directory (created at runtime)
├── .env.example              # Environment variables example
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```