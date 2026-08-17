FROM node:20-alpine

# Install libc6-compat for process.dlopen and openssl for Prisma
RUN apk update && apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copy the rest of the monorepo
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

ENV NODE_ENV=production

CMD ["npx", "tsx", "workers/escalation.worker.ts"]
