# -------------------------
# 1. Development stage
# -------------------------
FROM node:20-alpine AS development

WORKDIR /app

COPY lib/package*.json ./lib/
COPY frontend/package*.json ./frontend/

RUN npm ci --prefix lib --omit=dev && \
    npm ci --prefix frontend

COPY lib ./lib
COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]


# -------------------------
# 2. Build stage (clean & correct)
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# copy only package files first (better caching)
COPY lib/package*.json ./lib/
COPY frontend/package*.json ./frontend/

RUN npm ci --prefix lib && \
    npm ci --prefix frontend

# now copy source
COPY lib ./lib
COPY frontend ./frontend

WORKDIR /app/frontend

RUN npm run build


# -------------------------
# 3. Production stage
# -------------------------
FROM nginx:alpine AS production

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]