# Canvas Backend API

A TypeScript Node.js backend service providing Canvas CRUD operations with health monitoring endpoints.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Testing**: Vitest + Supertest
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for database)
- npm

### Development Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Start PostgreSQL database**
   ```bash
   docker compose up -d db
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed - defaults should work for local development
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on http://localhost:3000

### Available Endpoints

#### Health Endpoints
- `GET /health/liveness` - Returns `{ status: 'alive' }`
- `GET /health/readiness` - Returns `{ status: 'ready' }`

#### Canvas API
- `POST /api/canvas` - Create a new canvas
  ```json
  { "name": "My Canvas" }
  ```
- `GET /api/canvas` - List all canvases
- `GET /api/canvas/:id` - Get canvas by ID

### Testing

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run
```

### Building

```bash
# Build TypeScript to dist/
npm run build

# Start production server
npm start
```

### Docker Development

For full containerized development:

```bash
# From repository root
docker compose up -d db  # Start only database
# OR
docker compose up        # Start database + backend (uncomment backend service first)
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── server.ts             # Express app configuration
├── services/
│   └── prisma.ts         # Prisma client setup
├── modules/
│   ├── health/
│   │   └── health.router.ts    # Health check endpoints
│   └── canvas/
│       └── canvas.router.ts    # Canvas CRUD operations
└── middleware/
    └── error.ts          # Centralized error handling
```

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `CORS_ORIGINS` - Allowed CORS origins
- `JWT_DEV` - Development JWT secret

## Database Schema

### Canvas Model
```prisma
model Canvas {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## TODO / Future Enhancements

- [ ] **Authentication**: Implement proper auth middleware for protected routes
- [ ] **OpenAPI Documentation**: Auto-generate API documentation from code
- [ ] **Logging**: Structured logging with request correlation IDs
- [ ] **Metrics**: Application metrics and monitoring
- [ ] **Rate Limiting**: Implement rate limiting for API endpoints
- [ ] **Input Sanitization**: Enhanced security validation
- [ ] **Database Health Check**: Add DB connectivity check to readiness endpoint
- [ ] **Comprehensive Testing**: Integration tests with test database
- [ ] **Linting**: Add ESLint/Prettier configuration

## Contributing

1. Follow the existing code structure and patterns
2. Add tests for new features
3. Update this README for significant changes
4. Ensure all tests pass before submitting PRs

## License

See repository root for license information.