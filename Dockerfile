FROM node:26-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/bot/package.json ./apps/bot/
COPY packages/env/package.json ./packages/env/
COPY packages/qr/package.json ./packages/qr/
COPY packages/qr-encoder/package.json ./packages/qr-encoder/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# Build
#
# Configuration is read at runtime, so the image does not depend on the
# deployment it runs in.
# ---------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/bot/node_modules ./apps/bot/node_modules
COPY --from=deps /app/packages/env/node_modules ./packages/env/node_modules
COPY --from=deps /app/packages/qr/node_modules ./packages/qr/node_modules
COPY --from=deps /app/packages/qr-encoder/node_modules ./packages/qr-encoder/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .

RUN pnpm --filter @kyuar/web build

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
