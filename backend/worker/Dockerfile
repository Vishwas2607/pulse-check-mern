# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/worker/package*.json ./
RUN npm ci

COPY backend/worker ./worker
COPY backend/shared ./shared

RUN npm prune --omit=dev


# Stage 2: Runtime
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/node_modules ./
COPY --from=builder /app/worker ./worker
COPY --from=builder /app/shared ./shared

RUN chown -R app:app /app

USER app
WORKDIR /app/worker

CMD ["node", "src/index.js"]