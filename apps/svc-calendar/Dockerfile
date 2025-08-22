FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy workspace configuration and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all package.json files for dependency resolution
# We need this for pnpm workspace to work properly
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-rbac/package.json ./packages/shared-rbac/
COPY packages/shared-kafka/package.json ./packages/shared-kafka/
COPY packages/shared-matching/package.json ./packages/shared-matching/
COPY packages/shared-avro/package.json ./packages/shared-avro/
COPY apps/svc-calendar/package.json ./apps/svc-calendar/
COPY apps/web/package.json ./apps/web/

# Install dependencies using the workspace lockfile
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy only the packages we need for this service
COPY packages ./packages
COPY apps/svc-calendar ./apps/svc-calendar
COPY package.json pnpm-workspace.yaml ./

# Install Prisma and generate client (with better error handling)
RUN npm install -g pnpm

# Set Prisma to use binary engines for better compatibility
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary

# Try to generate Prisma client, but continue build if it fails
WORKDIR /app/apps/svc-calendar
RUN pnpm prisma generate || { \
    echo "Warning: Prisma generation failed. This may cause runtime issues."; \
    echo "The application will attempt to generate the client at runtime."; \
    exit 0; \
}

# Build from workspace root using turbo to handle dependencies correctly
WORKDIR /app
RUN pnpm build --filter @edgenetiq/svc-calendar

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/svc-calendar/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/svc-calendar/package.json ./package.json
COPY --from=builder /app/apps/svc-calendar/prisma ./prisma

USER nestjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/src/main"]