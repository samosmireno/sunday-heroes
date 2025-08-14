FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
COPY apps/server/package*.json ./apps/server/
COPY packages/*/package*.json ./packages/*/
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/client/node_modules ./apps/client/node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules

# Build packages first
RUN npm run build -w packages/shared-types
RUN npm run build -w packages/config-typescript
RUN npm run build -w packages/config-eslint

# Build client
RUN npm run build -w apps/client

# Build server
RUN npm run build -w apps/server

# Copy client build to server dist
RUN mkdir -p apps/server/dist/client && cp -r apps/client/dist/* apps/server/dist/client/

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sundayheroes

# Copy built application
COPY --from=builder --chown=sundayheroes:nodejs /app/apps/server/dist ./
COPY --from=builder --chown=sundayheroes:nodejs /app/apps/server/package*.json ./
COPY --from=builder --chown=sundayheroes:nodejs /app/apps/server/node_modules ./node_modules

USER sundayheroes

EXPOSE 5000

ENV PORT=5000

CMD ["node", "index.js"]