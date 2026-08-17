FROM node:20-alpine AS base
# Install libc6-compat for process.dlopen and openssl for Prisma
RUN apk update && apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Install turbo globally
RUN npm install turbo --global

FROM base AS builder
# Use turbo prune to only install dependencies for the target app
COPY . .
RUN turbo prune patient-portal --docker

FROM base AS installer
# Install dependencies
COPY --from=builder /app/out/json/ .
RUN npm install --ignore-scripts

# Copy source code
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/eslint.config.mjs ./eslint.config.mjs
COPY --from=builder /app/eslint-local-rules.js ./eslint-local-rules.js

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Provide dummy DB URL for Next.js static generation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Build the project
RUN turbo build --filter=patient-portal...

FROM base AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from installer
COPY --from=installer /app/apps/patient-portal/next.config.mjs .
COPY --from=installer /app/apps/patient-portal/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/patient-portal/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/patient-portal/.next/static ./apps/patient-portal/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/patient-portal/public ./apps/patient-portal/public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Note: standalone output creates server.js
CMD ["node", "apps/patient-portal/server.js"]
