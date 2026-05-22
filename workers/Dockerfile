/**
 * Workers Dockerfile — runs Node.js workers
 */
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies for worker runtime
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Copy worker code
COPY workers/ ./workers/
COPY services/ ./services/
COPY lib/ ./lib/
COPY packages/db/generated/ ./packages/db/generated/
COPY types/ ./types/

ENV NODE_ENV=production

CMD ["node", "workers/escalation.worker.js"]
