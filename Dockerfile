FROM node:22.9.0 AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

FROM node:22.9.0 as builder
WORKDIR /app
COPY . .
COPY --from=base /app/node_modules ./node_modules
RUN npm run build

FROM node:22.9.0 as runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /coassemble-ui/public ./public
COPY --from=builder /coassemble-ui/package.json ./package.json
COPY --from=builder /coassemble-ui/.next ./.next
COPY --from=builder /coassemble-ui/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run" , "start"]