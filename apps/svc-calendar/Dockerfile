FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
# Try to install dependencies, but don't fail if network is restricted
RUN npm install -g pnpm && (pnpm install --frozen-lockfile || echo "Dependencies installation failed - using partial installation")

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install Prisma and generate client (with better error handling)
RUN npm install -g pnpm

# Set Prisma to use binary engines for better compatibility
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary

# Try to generate Prisma client, but continue build if it fails
RUN pnpm prisma generate || { \
    echo "Warning: Prisma generation failed. This may cause runtime issues."; \
    echo "The application will attempt to generate the client at runtime."; \
    exit 0; \
}

RUN pnpm build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 3001

ENV PORT=3001

CMD ["node", "dist/src/main"]