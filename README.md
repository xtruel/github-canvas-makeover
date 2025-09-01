# Project: Roma Data + Community Platform

## Sections
1. Roma Matches Data Pipeline (OpenFootball)
2. Community Backend (Express + Prisma + SQLite)
3. Media Upload (local presign/finalize flow)
4. Development & Devcontainer
5. Docker & CI Workflows
6. Roadmap (Next Features)
7. Local Development Quick Start

---
## 1. Roma Matches Data Pipeline
(Existing from main branch)

Zero-keys Roma matches data pipeline using OpenFootball community data.

### Features
- **No API Keys Required**: Uses open-source [OpenFootball](https://github.com/openfootball/italy)
- **Automated Updates**: GitHub Actions workflow updates matches every 6 hours
- **Fallback System**: Falls back to Supabase data if unavailable
- **Non-Live Data**: Accepts slower updates in exchange for no API dependencies

See original section for file references:
- `scripts/updateRomaOpenfootball.ts`
- `scripts/openfootball/parseSerieA.ts`
- `.github/workflows/roma-openfootball.yml`
- `data/roma-matches.json` -> `public/data/roma-matches.json`

---
## 2. Community Backend
Implemented on branch `feature/community-backend`.

### Stack
- Node.js + Express
- Prisma ORM (SQLite for dev)
- TypeScript
- Simple cookie-based dev auth (dev-login) – not for production

### Data Model (prisma/schema.prisma)
- User (role: USER | ADMIN)
- Article (draft/published, cover media)
- CommunityPost (TEXT | IMAGE | VIDEO, status PUBLISHED | HIDDEN)
- MediaAsset (IMAGE | VIDEO, status PENDING | READY)

### Key Endpoints
Auth:
- `POST /auth/dev-login` { email, role? } → sets `sessionUserId` cookie (only if NODE_ENV !== production)
- `POST /auth/logout`

Health:
- `GET /health`

Media:
- `POST /media/presign` (auth) – create MediaAsset (PENDING)
- `POST /admin/media/presign` (admin)
- `PUT /uploads/:id` raw file upload
- `POST /media/:id/finalize` (auth) → mark READY, store dimensions
- `POST /admin/media/:id/finalize`

Articles (admin):
- `GET /articles` (public published)
- `POST /admin/articles` create (DRAFT or PUBLISHED)

Posts:
- `GET /posts?limit=20&cursor=` – cursor pagination
- `POST /posts` (auth) create post (validation by type)

### Auth (Dev Mode Only)
Cookie `sessionUserId` looked up each request. Use dev-login to simulate users/admins.

---
## 3. Media Upload Flow
1. Client calls `/media/presign` with filename, mimeType, type (IMAGE/VIDEO)
2. Server creates MediaAsset (status PENDING) → returns `assetId`, `uploadUrl`
3. Client `PUT` file to `uploadUrl`
4. Client `POST /media/:id/finalize` with optional width/height
5. Asset becomes READY and accessible at `/uploads/:id`

Current storage: local filesystem `backend/uploads/`. Future: S3 / MinIO.

---
## 4. Development Environment & Devcontainer
A `.devcontainer/devcontainer.json` is provided so you can open a GitHub Codespace or local VS Code Dev Container:
- Installs Node 20
- Runs `npm install` in root and backend
- You can then run backend + frontend concurrently.

---
## 5. Docker & CI
### Backend Dockerfile
Multi-stage build producing a production image that runs `node dist/server.js`.

### docker-compose.yml (dev convenience)
Runs backend container exposing port 4000 with local volume for uploads.

### GitHub Actions CI (`.github/workflows/ci.yml`)
- Trigger: push & PR (main / feature/*)
- Steps: checkout, setup node, install, prisma generate, build backend
- Placeholder for future: tests, image publish, deploy.

Future planned workflow: build & push Docker image (needs GHCR permissions + secrets).

---
## 6. Roadmap (High-Level)
(Will be created as GitHub Issues)

MVP Enhancements:
- Media preview inline in post list
- Post detail page `/post/:id`
- Comments model + API + UI
- Infinite scroll (cursor based)
- Edit / soft delete own posts

Moderation & Features:
- Hide/unhide (admin), user flagging
- Link posts (type LINK + metadata fetch)
- Markdown editor + sanitization
- Proper auth (email+password, then OAuth)
- Rate limiting

Media & Infra:
- Server-side size/MIME validation
- S3-compatible storage (MinIO dev → S3 prod)
- Video transcoding + thumbnails

DevOps & Quality:
- Docker Compose with Postgres (future)
- CI: lint, test, type-check, build
- Deploy workflow & preview environment
- Structured logging & centralized error handler
- Env validation (zod)

UX:
- User profile pages
- Reactions / upvotes
- Notifications (comment on your post)
- Full-text search (SQLite FTS5 → Postgres)

Security:
- Input sanitization
- helmet + stricter headers
- CSRF strategy (if forms) / JWT alternative

Analytics:
- Event tracking pipeline

---
## 7. Local Development Quick Start

Frontend (assuming existing root setup):
```bash
npm install
npm run dev
# Opens Vite dev server (e.g. :5173)
```

Backend:
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev   # runs on http://localhost:4000
```

Dev Login (user):
```bash
curl -X POST http://localhost:4000/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'
```
Admin:
```bash
curl -X POST http://localhost:4000/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","role":"ADMIN"}'
```

Create Post (TEXT example):
```bash
curl -X POST http://localhost:4000/posts \
  -H 'Content-Type: application/json' \
  --cookie "sessionUserId=<ID_FROM_DEV_LOGIN>" \
  -d '{"type":"TEXT","title":"Ciao Roma","body":"Forza!"}'
```

Media Upload (manual sample):
```bash
# 1 presign
curl -X POST http://localhost:4000/media/presign \
  -H 'Content-Type: application/json' \
  --cookie "sessionUserId=<ID>" \
  -d '{"filename":"test.png","mimeType":"image/png","type":"IMAGE"}'
# Response → assetId, uploadUrl
# 2 upload file
curl -X PUT http://localhost:4000/uploads/<assetId> --data-binary @test.png
# 3 finalize
curl -X POST http://localhost:4000/media/<assetId>/finalize \
  -H 'Content-Type: application/json' \
  --cookie "sessionUserId=<ID>" \
  -d '{"width":800,"height":600}'
```

---
## Preview / Deployment Notes
A direct automated deployment isn’t configured yet (needs container registry + host secrets). Recommended interim preview path:
1. Open repository in GitHub → Code → Codespaces → Create (uses devcontainer) – run backend & frontend.
2. (Next) Add workflow to build & push image to GHCR and deploy to Render/Fly (requires secrets: RENDER_API_KEY / FLY_API_TOKEN, etc.).

---
## Mobile viewport height handling

This project includes a workaround for the Android Chrome viewport height issue, where the collapsing/expanding URL bar causes layout jumpiness when using `100vh`.

### Implementation

The solution uses a custom CSS property `--app-vh` that is dynamically calculated from `window.innerHeight` and updates on:
- Window resize
- Orientation change  
- Visibility change (when page becomes visible)

### Usage

Use the `h-screen-dvh` utility class instead of `h-screen` for full-height containers:

```tsx
// Instead of this:
<div className="min-h-screen">

// Use this:
<div className="h-screen-dvh flex flex-col">
```

The `h-screen-dvh` class provides:
- `min-height: calc(var(--app-vh, 1vh) * 100)` - Uses the dynamic viewport height
- `min-height: 100dvh` - Progressive enhancement fallback for supporting browsers

### Technical Details

- **Custom property**: `--app-vh` is set to `window.innerHeight * 0.01 + 'px'`
- **Event listeners**: Automatically updates on resize, orientation change, and visibility change
- **HMR support**: Properly cleans up event listeners during Vite hot module reload
- **Fallback**: Uses `1vh` if the custom property is not available

This ensures stable layout height on mobile devices without the jumpiness caused by the collapsing URL bar.

---
## License
(Define here if needed.)