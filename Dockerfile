FROM node:22.9.0 AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

FROM node:22.9.0 as builder
WORKDIR /app
COPY . .
COPY --from=base /app/node_modules ./node_modules
RUN npm run build
RUN ls -la .next/BUILD_ID || (echo "Build failed! BUILD_ID is not present in .next/" && exit 1)

FROM node:22.9.0 as runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules


RUN ls -la .next || (echo "Build not found! Run 'next build' before starting." && exit 1)

EXPOSE 3000

CMD ["sh", "-c", "ls -la .next && npx next start"]