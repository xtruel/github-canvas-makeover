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
## License
(Define here if needed.)

---
## 8. Mobile Viewport Height Handling

This project implements a robust solution for mobile viewport height issues that affect Android Chrome and iOS Safari browsers.

### Problem Statement

Mobile browsers dynamically show/hide UI elements (URL bars, toolbars) which causes layout issues:
- **iOS Safari**: `100vh` includes area behind dynamic toolbar, causing content to jump when toolbar appears/disappears
- **Android Chrome**: URL bar collapse/expansion changes available viewport height
- **Keyboard**: Virtual keyboard appearance can dramatically shrink viewport height, causing unwanted layout shifts

### Solution

We use a JavaScript-driven viewport utility with CSS custom properties that provides:

1. **Dynamic Height Detection**: Uses `visualViewport` API when available, falls back to `window.innerHeight`
2. **Smart Keyboard Handling**: Suppresses height updates when virtual keyboard is detected to prevent layout jumps
3. **CSS Custom Properties**: Exposes `--app-vh`, `--app-height`, and `--app-vh-initial` for use in stylesheets
4. **Modern Fallback Chain**: Uses `100dvh` as progressive enhancement with JS-driven fallback

### CSS Utilities

```css
/* Dynamic viewport height - updates with browser UI changes */
.h-screen-dvh {
  min-height: calc(var(--app-vh, 1vh) * 100);
  min-height: 100dvh; /* Modern browsers progressive enhancement */
}

/* Fixed height - uses initial captured height (stable during keyboard) */
.h-screen-fixed {
  min-height: var(--app-height, 100vh);
}

/* Safe area utilities for devices with notches */
.pad-safe-t { padding-top: env(safe-area-inset-top); }
.pad-safe-b { padding-bottom: env(safe-area-inset-bottom); }
.pad-safe-l { padding-left: env(safe-area-inset-left); }
.pad-safe-r { padding-right: env(safe-area-inset-right); }
.pad-safe { /* all safe areas */ }
```

### Implementation

The viewport utility is initialized in `src/main.tsx` before React renders:

```typescript
import { initViewportHeight } from './lib/viewport'
initViewportHeight();
```

Key features in `src/lib/viewport.ts`:
- Debounced updates using `requestAnimationFrame`
- Keyboard detection heuristic (height < 75% of initial = keyboard likely open)
- Event listeners for `resize`, `orientationchange`, `visibilitychange`, and `visualViewport` events
- HMR (Hot Module Replacement) cleanup support
- Optional debug logging with `?vhdebug` query parameter

### Usage Guidelines

- **Full-screen layouts**: Use `.h-screen-dvh` for responsive layouts that should adapt to browser UI changes
- **Fixed layouts**: Use `.h-screen-fixed` for layouts that should remain stable during keyboard interaction
- **Safe areas**: Add `.pad-safe-t`, `.pad-safe-b` etc. for proper spacing on devices with notches
- **Hero sections**: Combine with safe area padding: `className="h-screen-dvh pad-safe-t"`

### CSS Custom Properties Reference

| Property | Description | Example Value |
|----------|-------------|---------------|
| `--app-vh` | Dynamic viewport height unit (1% of current height) | `8.12px` |
| `--app-height` | Full dynamic viewport height in pixels | `812px` |
| `--app-vh-initial` | Initial viewport height unit (captured at load) | `8.12px` |

### Debug Mode

Add `?vhdebug` to any URL to enable console logging of viewport height changes:

```
[ViewportHeight] Initialized viewport height {height: 812, reason: initialization, timestamp: ...}
[ViewportHeight] Updated viewport height {height: 768, reason: normal_update, timestamp: ...}
[ViewportHeight] Suppressing height update due to keyboard {height: 400, reason: keyboard_detected, timestamp: ...}
```

### Browser Support

- **Modern browsers**: Uses `100dvh` with progressive enhancement
- **iOS Safari 13+**: Uses `visualViewport` API for accurate height detection
- **Android Chrome 61+**: Uses `visualViewport` API for URL bar handling
- **Fallback**: Uses `window.innerHeight` for older browsers

### References

- [CSS viewport units and mobile browsers](https://web.dev/viewport-units/)
- [Visual Viewport API](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API)
- [CSS env() function for safe areas](https://developer.mozilla.org/en-US/docs/Web/CSS/env())