# Use the official Node.js runtime as the base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Install without running postinstall scripts; Prisma generate will run later in builder after sources are copied
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN npx prisma generate

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Install utilities needed at runtime (curl for healthcheck, psql for DB bootstrap)
RUN apk add --no-cache curl postgresql-client

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy full node_modules to ensure Prisma CLI deps (e.g., @prisma/config and 'effect') are present
COPY --from=deps /app/node_modules ./node_modules

# --- Prisma runtime requirements ---
# Copy generated Prisma client and engines from builder stage
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy Prisma CLI (devDependency) from deps stage for runtime migrations
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
# Copy the entire .bin directory to include prisma and its wasm/shims
COPY --from=deps /app/node_modules/.bin ./node_modules/.bin
# Workaround for Prisma WASM path expected by the CLI in some environments
RUN if [ -d node_modules/prisma/prisma-schema-wasm ]; then cp node_modules/prisma/prisma-schema-wasm/*.wasm node_modules/.bin/; fi
RUN if [ -d node_modules/@prisma/prisma-schema-wasm ]; then cp node_modules/@prisma/prisma-schema-wasm/*.wasm node_modules/.bin/; fi

# Copy Prisma seeds (JSON + seed.js)
COPY --from=builder /app/prisma ./prisma

# Add entrypoint that runs migrations/seed then starts the app
COPY ./docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Ensure non-root user can write needed paths (/app, /tmp)
RUN mkdir -p /app/node_modules /tmp && chown -R nextjs:nodejs /app /tmp

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Entrypoint runs Prisma migrations/seed, then starts Next.js
ENTRYPOINT ["./docker-entrypoint.sh"]
