# 1. Используем официальный образ Node.js
FROM node:22.9.0 AS builder

# 2. Устанавливаем зависимости
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# 3. Копируем исходный код и собираем Next.js
COPY . .
RUN npm run build

# 4. Чистый продакшен-образ
FROM node:22.9.0 AS runner
WORKDIR /app

# 5. Копируем только нужные файлы из builder-образа
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 6. Оптимизируем производительность
ENV NODE_ENV=production

# 7. Открываем порт
EXPOSE 3000

# 8. Запускаем Next.js в продакшен-режиме
CMD ["npm", "run", "start"]