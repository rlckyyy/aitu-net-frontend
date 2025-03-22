# ---- Stage 1: Build ----
FROM node:22.9.0-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Next.js application
RUN npm run build

# ---- Stage 2: Production ----
FROM node:22.9.0-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["npm", "start"]
