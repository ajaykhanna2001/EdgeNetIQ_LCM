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
COPY apps/web ./apps/web
COPY package.json pnpm-workspace.yaml ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install -g pnpm
WORKDIR /app/apps/web
RUN pnpm build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 reactjs

COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./package.json

USER reactjs

EXPOSE 5173

ENV PORT=5173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]