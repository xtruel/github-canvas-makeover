# Multi-stage Dockerfile for backend service
# Stage 1: dependencies & build
FROM node:20-alpine AS build
WORKDIR /app

# Install system deps if ever needed (uncomment as requirements grow)
# RUN apk add --no-cache python3 make g++

# Copy only backend package manifests first for better layer caching
COPY backend/package*.json ./
COPY backend/prisma ./prisma

RUN npm install --legacy-peer-deps

# Copy backend source
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript -> dist
RUN npm run build || npx tsc

# Stage 2: runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy package files to install only prod deps
COPY backend/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy prisma schema (needed at runtime for migrations / introspection if used)
COPY backend/prisma ./prisma
# Copy built artifacts and any other needed assets
COPY --from=build /app/dist ./dist

# Create uploads directory (bind mount in dev / ephemeral in prod)
RUN mkdir -p /app/uploads

EXPOSE 4000
CMD ["node", "dist/src/index.js"]