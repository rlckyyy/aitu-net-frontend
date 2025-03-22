# Build Stage
FROM node:22.9.0-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code and build the project
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && ls -la .next && ls -la .next/server

# Production Stage
FROM node:22.9.0-alpine

WORKDIR /app

# Copy only necessary files for production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Set environment variable to production mode
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
