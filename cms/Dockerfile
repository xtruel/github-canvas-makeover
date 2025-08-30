# Multi-stage Dockerfile for GitHub Canvas Makeover CMS
# Production-ready build with minimal footprint

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Create directories that might be needed
RUN mkdir -p data uploads backups

# Production stage
FROM node:18-alpine AS production

# Add metadata
LABEL maintainer="GitHub Canvas Makeover CMS" \
      version="1.0.0" \
      description="Self-hosted CMS with Express.js and SQLite"

# Create app user for security
RUN addgroup -g 1001 -S cmsuser && \
    adduser -S cmsuser -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files from builder
COPY --from=builder --chown=cmsuser:cmsuser /app/server.js ./
COPY --from=builder --chown=cmsuser:cmsuser /app/scripts ./scripts/
COPY --from=builder --chown=cmsuser:cmsuser /app/public ./public/
COPY --from=builder --chown=cmsuser:cmsuser /app/.env.example ./

# Create required directories with proper permissions
RUN mkdir -p data uploads uploads/media uploads/thumbnails backups && \
    chown -R cmsuser:cmsuser /app

# Create volumes for persistent data
VOLUME ["/app/data", "/app/uploads", "/app/backups"]

# Switch to non-root user
USER cmsuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "server.js"]