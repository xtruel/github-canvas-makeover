# Backend service Dockerfile (multi-stage)
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Install deps (backend workspace)
FROM base AS deps
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm ci

FROM deps AS build
COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend
# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=deps /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/prisma ./prisma
COPY backend/package.json ./package.json
COPY backend/scripts ./scripts
RUN chmod +x ./scripts/migrate-and-start.sh
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["./scripts/migrate-and-start.sh"]
