# Базовый образ на Ubuntu
FROM node:22.9.0 AS base

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y \
    g++ \
    make \
    python3-pip \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Открываем порт 3000
EXPOSE 3000

# Сборка приложения
FROM base AS builder
COPY . .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

# Устанавливаем только продакшен-зависимости
RUN npm ci --omit=dev

# Создаем пользователя nextjs для безопасности
RUN groupadd -g 1001 nodejs && useradd -m -u 1001 -g nodejs nextjs
USER nextjs

# Копируем только необходимые файлы
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

CMD ["npm", "start"]

# Development stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]