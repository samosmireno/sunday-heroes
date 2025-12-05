FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
COPY apps/server/package*.json ./apps/server/
COPY packages/*/package*.json ./packages/*/
RUN npm install
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app

# Accept build arguments for frontend environment variables
ARG VITE_MODE=production
ARG VITE_CLIENT_ID
ARG VITE_SERVER_PROD_URL
ARG VITE_SERVER_DEV_URL

# Set environment variables for the build process
ENV VITE_MODE=$VITE_MODE
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_SERVER_PROD_URL=$VITE_SERVER_PROD_URL
ENV VITE_SERVER_DEV_URL=$VITE_SERVER_DEV_URL

COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/client/node_modules ./apps/client/node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Build packages first
RUN npm run build -w packages/shared-types

# Try to rebuild node_modules links after building shared-types
RUN npm install --workspaces

# Build client
RUN npm run build -w apps/client

# Generate Prisma client
RUN cd /app/apps/server && npx prisma generate

# Apply migrations (only if you want migrations during build)
RUN cd /app/apps/server && npx prisma migrate deploy

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

# Copy package files first
COPY --from=builder --chown=sundayheroes:nodejs /app/apps/server/package*.json ./

# Copy built application
COPY --from=builder --chown=sundayheroes:nodejs /app/apps/server/dist ./

# Copy node_modules for runtime dependencies
COPY --from=builder --chown=sundayheroes:nodejs /app/node_modules ./node_modules

# Copy the built shared-types package to ensure it's available at runtime
COPY --from=builder --chown=sundayheroes:nodejs /app/packages/shared-types/dist ./node_modules/@repo/shared-types/dist

# Ensure the package.json for shared-types is also available
COPY --from=builder --chown=sundayheroes:nodejs /app/packages/shared-types/package.json ./node_modules/@repo/shared-types/package.json


USER sundayheroes

EXPOSE 5000

ENV PORT=5000

CMD ["node", "src/index.js"]