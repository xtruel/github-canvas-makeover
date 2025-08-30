# GitHub Canvas Makeover CMS

A complete self-hosted Content Management System built with Express.js, SQLite, and vanilla JavaScript. This CMS provides a full-featured admin interface for managing media, articles, and content with real-time updates.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

### Installation & Setup

1. **Navigate to the CMS directory:**
   ```bash
   cd cms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment** (edit `.env` file):
   ```bash
   # IMPORTANT: Change these secrets in production!
   SESSION_SECRET=your-super-secret-session-key-change-this-in-production
   TOKEN_SECRET=your-super-secret-token-key-change-this-in-production
   
   # Optional: Change default admin credentials
   DEFAULT_ADMIN_USERNAME=admin
   DEFAULT_ADMIN_PASSWORD=change-this-password
   ```

5. **Start the CMS server:**
   ```bash
   npm start
   ```

6. **Access your CMS:**
   - Public site: http://localhost:3000/
   - Admin login: http://localhost:3000/login.html
   - Default credentials: `admin` / `change-this-password`

> ⚠️ **IMPORTANT**: Change the default admin password immediately after first login!

## 📋 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `SESSION_SECRET` | Session encryption key | - | **Yes** |
| `TOKEN_SECRET` | Token signing key | - | **Yes** |
| `SITE_BASE_URL` | Base URL for site | `http://localhost:3000` | No |
| `SITE_NAME` | Site name | `GitHub Canvas Makeover CMS` | No |
| `SITE_DESCRIPTION` | Site description | - | No |
| `DB_PATH` | SQLite database path | `./data/cms.db` | No |
| `UPLOADS_DIR` | Uploads directory | `./uploads` | No |
| `MAX_FILE_SIZE` | Max upload size (MB) | `50` | No |
| `ALLOWED_MEDIA_TYPES` | Allowed MIME types | See below | No |
| `MAX_IMAGE_WIDTH` | Max image width | `1920` | No |
| `MAX_IMAGE_HEIGHT` | Max image height | `1080` | No |
| `THUMBNAIL_SIZE` | Thumbnail size | `300` | No |
| `WEBP_QUALITY` | WebP quality (0-100) | `80` | No |
| `JPEG_QUALITY` | JPEG quality (0-100) | `85` | No |
| `LOGIN_RATE_LIMIT` | Login attempts per 15min | `5` | No |
| `WRITE_RATE_LIMIT` | Write requests per 15min | `100` | No |
| `SEARCH_RATE_LIMIT` | Search requests per min | `50` | No |
| `API_RATE_LIMIT` | API requests per min | `100` | No |
| `PUBLISH_POLL_INTERVAL` | Polling interval (ms) | `30000` | No |
| `BACKUP_DIR` | Backup directory | `./backups` | No |
| `BACKUP_RETENTION_DAYS` | Backup retention | `30` | No |

### Default Allowed Media Types
```
image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm
```

## 🎯 Features

### Core Functionality
- **Media Management**: Upload, resize, and organize images and videos
- **Article System**: Full-featured article editor with Markdown support
- **Search**: Full-text search with snippet highlighting (SQLite FTS5)
- **Real-time Updates**: Server-sent events for live content updates
- **Scheduling**: Schedule content for future publication
- **User Management**: Admin and editor roles with permissions
- **API Access**: RESTful API with key-based authentication

### Media Features
- **Image Processing**: Auto-resize, WebP conversion, thumbnail generation
- **EXIF Handling**: Auto-rotation based on EXIF data
- **Multiple Formats**: Support for images, videos, and YouTube embeds
- **Private Media**: Token-based access for private content
- **Metadata**: Comprehensive metadata storage and search

### Content Features
- **Markdown Editor**: WYSIWYG toggle with preview
- **Categories & Tags**: Flexible organization with rename/merge tools
- **Soft Delete**: Recycle bin with restore and purge options
- **Scheduling**: Future publication with automatic publishing
- **SEO**: Auto-generated sitemaps and RSS feeds

### Security Features
- **Authentication**: Session-based with bcrypt password hashing
- **CSRF Protection**: Required for all state-changing operations
- **Rate Limiting**: Configurable limits for different endpoints
- **Input Sanitization**: HTML sanitization and validation
- **Audit Logging**: Complete activity tracking
- **Role-based Access**: Admin and editor permissions

### Technical Features
- **SQLite Database**: Fast, reliable, and self-contained
- **Real-time Events**: Server-sent events for live updates
- **Responsive Design**: Mobile-friendly admin interface
- **Theme Support**: Light and dark themes
- **Backup System**: Automated backup with retention
- **Docker Support**: Optional containerization

## 📖 Usage Guide

### Admin Interface

1. **Login**: Access `/login.html` with your admin credentials
2. **Dashboard**: Overview of content statistics and recent activity
3. **Media Management**: Upload, edit, and organize media files
4. **Article Management**: Create and edit articles with markdown
5. **Tag Management**: Organize and manage tags and categories
6. **API Keys**: Generate keys for external API access
7. **User Management**: Add and manage admin users (admin only)
8. **Audit Log**: View all system activity (admin only)
9. **Recycle Bin**: Restore or permanently delete content

### Public Interface

1. **Gallery**: Browse all published media
2. **Articles**: Read published articles
3. **Search**: Full-text search across all content
4. **Filters**: Filter by categories, tags, and content types
5. **Real-time**: Live updates when new content is published

### API Usage

#### Public Endpoints (API Key Required)
```bash
# Get media
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/public/media

# Get articles
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/public/articles
```

#### Admin Endpoints (Authentication Required)
```bash
# Login
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}' \
  http://localhost:3000/api/login

# Create article (with CSRF token)
curl -X POST -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-csrf-token" \
  -b "session-cookie" \
  -d '{"title":"New Article","body":"Content here"}' \
  http://localhost:3000/api/admin/articles
```

## 🛠️ Available Scripts

### Primary Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with auto-reload
npm run hash       # Generate password hash for admin users
npm run backup     # Create backup of database and uploads
```

### Management Commands
```bash
# Create password hash
npm run hash
# Enter password when prompted

# Create system backup
npm run backup
# Backup saved to ./backups/cms-backup-TIMESTAMP/

# Development mode with auto-reload
npm run dev
```

## 🗄️ Database Schema

### Core Tables
- **media**: Media files with metadata and processing info
- **articles**: Articles with content, metadata, and publishing info
- **admins**: Admin users with roles and authentication
- **audit**: Activity log for all system actions
- **api_keys**: API keys for external access
- **article_fts**: Full-text search index

### Key Features
- **SQLite WAL Mode**: Better concurrency and performance
- **Foreign Keys**: Data integrity enforcement
- **FTS5 Search**: Fast full-text search with snippets
- **Soft Deletes**: Recoverable deletion with timestamps
- **Auto Migrations**: Schema updates on startup

## 🔧 Configuration

### Image Processing
```env
MAX_IMAGE_WIDTH=1920      # Maximum width for processed images
MAX_IMAGE_HEIGHT=1080     # Maximum height for processed images
THUMBNAIL_SIZE=300        # Thumbnail size (square)
WEBP_QUALITY=80          # WebP compression quality (0-100)
JPEG_QUALITY=85          # JPEG compression quality (0-100)
```

### Rate Limiting
```env
LOGIN_RATE_LIMIT=5       # Login attempts per 15 minutes
WRITE_RATE_LIMIT=100     # Write operations per 15 minutes
SEARCH_RATE_LIMIT=50     # Search requests per minute
API_RATE_LIMIT=100       # API requests per minute
```

### File Uploads
```env
MAX_FILE_SIZE=50         # Maximum file size in MB
UPLOADS_DIR=./uploads    # Upload directory path
```

## 🔄 Backup & Restore

### Creating Backups
```bash
# Manual backup
npm run backup

# Automated backups (set in environment)
BACKUP_RETENTION_DAYS=30  # Keep backups for 30 days
```

### Backup Contents
- SQLite database file
- Complete uploads inventory with checksums
- Backup manifest with restore instructions
- Automatic cleanup of old backups

### Restore Process
1. Stop the CMS server
2. Copy database file from backup to `data/` directory
3. Restore uploads using the inventory file
4. Restart the CMS server
5. Verify all content is accessible

## 🐳 Docker Deployment

### Basic Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  cms:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./backups:/app/backups
    environment:
      - SESSION_SECRET=your-session-secret
      - TOKEN_SECRET=your-token-secret
```

## 🔒 Security Considerations

### Production Deployment
1. **Change Default Credentials**: Update admin username/password
2. **Generate Strong Secrets**: Use secure random strings for tokens
3. **HTTPS**: Always use HTTPS in production
4. **File Permissions**: Restrict access to data and uploads directories
5. **Regular Backups**: Automate backup process
6. **Updates**: Keep dependencies updated

### Environment Security
```bash
# Secure file permissions
chmod 600 .env
chmod 700 data/
chmod 700 uploads/
chmod 700 backups/
```

## 🚀 Performance Optimization

### Database
- SQLite WAL mode for better concurrency
- Automatic vacuum and optimization
- Indexed searches with FTS5

### Media Processing
- Lazy image processing
- WebP format generation
- Thumbnail caching
- EXIF auto-rotation

### Caching
- Static file serving with proper headers
- Session optimization
- Rate limiting with memory store

## 🐛 Troubleshooting

### Common Issues

**Cannot start server - Port in use**
```bash
# Check what's using the port
lsof -i :3000

# Change port in .env
PORT=3001
```

**Database locked error**
```bash
# Stop all CMS processes
pkill -f "node server.js"

# Restart the server
npm start
```

**Upload fails - File too large**
```bash
# Increase file size limit in .env
MAX_FILE_SIZE=100  # 100MB
```

**Sharp/image processing errors**
```bash
# Reinstall sharp for your platform
npm rebuild sharp
```

### Debug Mode
```env
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 📝 API Reference

### Authentication Endpoints
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `GET /api/me` - Get current user info

### Public Endpoints
- `GET /api/media` - Get published media (paginated)
- `GET /api/articles` - Get published articles (paginated)
- `GET /api/search/articles` - Search articles with snippets
- `GET /feed.xml` - RSS feed
- `GET /sitemap.xml` - XML sitemap

### Admin Endpoints
- `GET /api/admin/media` - List all media (with deleted)
- `POST /api/admin/media` - Upload new media
- `PUT /api/admin/media/:id` - Update media
- `DELETE /api/admin/media/:id` - Delete/purge media
- `POST /api/admin/media/:id/restore` - Restore deleted media

- `GET /api/admin/articles` - List all articles
- `POST /api/admin/articles` - Create new article
- `GET /api/admin/articles/:id` - Get article by ID
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete/purge article
- `POST /api/admin/articles/:id/restore` - Restore article

### Meta Endpoints
- `GET /api/meta/tags` - Get all tags
- `GET /api/meta/categories` - Get all categories
- `POST /api/admin/meta/tags/rename` - Rename tag
- `POST /api/admin/meta/tags/merge` - Merge tags

## 📄 License

This project is licensed under the MIT License. See the main repository license for details.

## 🤝 Contributing

This CMS is part of the GitHub Canvas Makeover project. Please refer to the main repository for contribution guidelines.

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review the troubleshooting section
3. Check the audit log for error details
4. Open an issue in the main repository

---

**Built with ❤️ for the GitHub Canvas Makeover project**