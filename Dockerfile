FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER hono
EXPOSE 3000
CMD ["sh", "-c", "npm run start:docker:prod"]

FROM base AS development
RUN apk add --no-cache bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["sh", "-c", "./wait-for-it.sh user_db:5432 -- npm run start:docker"]
