FROM node:22.9.0 AS base

RUN apt-get update && apt-get install -y \
    g++ \
    make \
    python3-pip \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

EXPOSE 3000

FROM base AS builder
COPY . .
RUN npm run build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

RUN npm ci --omit=dev

RUN groupadd -g 1001 nodejs && useradd -m -u 1001 -g nodejs nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

CMD ["npm", "start"]

FROM base AS dev
ENV NODE_ENV=production
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]