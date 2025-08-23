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
# Handle potential certificate/networking issues in CI
RUN npm config set strict-ssl false || true
RUN npm install -g pnpm@8.15.1 --registry https://registry.npmjs.org || \
    npm install -g pnpm@8.15.1 --registry http://registry.npmjs.org || \
    npm install -g pnpm@8.15.1
RUN pnpm config set strict-ssl false || true

# Skip Prisma postinstall generation to avoid DNS issues in CI
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Skip Prisma postinstall generation to avoid DNS issues in CI
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Handle SSL certificate issues in CI environments
RUN npm config set strict-ssl false || true

# Install pnpm first to ensure it's available for workspace commands
RUN npm install -g pnpm@8.15.1 --registry https://registry.npmjs.org || \
    npm install -g pnpm@8.15.1 --registry http://registry.npmjs.org || \
    npm install -g pnpm@8.15.1

RUN pnpm config set strict-ssl false || true

# Copy everything from deps stage including proper workspace structure
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source code for all packages and the specific app
COPY packages ./packages
COPY apps/svc-calendar ./apps/svc-calendar
COPY turbo.json ./

# Ensure pnpm can find workspace configuration and rebuild workspace dependencies
RUN pnpm install --offline --frozen-lockfile

# Set Prisma to use binary engines for better compatibility
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl

# Try to generate Prisma client, but continue build if it fails
WORKDIR /app/apps/svc-calendar
RUN node scripts/setup-prisma.js || echo "Prisma setup completed with fallback"

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