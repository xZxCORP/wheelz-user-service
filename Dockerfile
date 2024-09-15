FROM node:20 AS base

FROM base AS builder

WORKDIR /app

COPY package*json tsconfig.json wait-for-it.sh .env src ./
RUN npm ci && \
    npm run build && \
    npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/.env /app/.env
COPY --from=builder --chown=hono:nodejs /app/wait-for-it.sh /app/wait-for-it.sh

USER hono

CMD ["sh", "-c", "./wait-for-it.sh db:3306 -- npm run start:docker"]
