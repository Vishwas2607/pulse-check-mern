# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY lib/package*.json ./lib/

# Install all deps (including dev for build if needed)
RUN npm ci --prefix lib && \
    npm ci --prefix backend

# Copy source
COPY backend ./backend
COPY lib ./lib


RUN npm prune --omit=dev --prefix backend && \
    npm prune --omit=dev --prefix lib

# Stage 2: Runtime
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Security: non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy only needed files
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/lib ./lib

RUN chown -R app:app /app

USER app
WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "server.js"]