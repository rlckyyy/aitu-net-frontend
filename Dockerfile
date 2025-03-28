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

FROM base AS dev
ENV NODE_ENV=production

RUN npm install
COPY . .
CMD ["npm", "run", "dev"]