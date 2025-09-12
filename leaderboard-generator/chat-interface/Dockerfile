# Multi-stage build for the Leaderboard Generator Chat Interface

# Stage 1: Build the frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.js ./

# Build the frontend
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine as backend-builder

WORKDIR /app/backend

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source code
COPY backend/src ./src

# Stage 3: Final image
FROM node:18-alpine

WORKDIR /app

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy backend files from stage 2
COPY --from=backend-builder /app/backend ./

# Copy the leaderboard-generator library
COPY ../lib ./lib
COPY ../templates ./templates

# Create necessary directories
RUN mkdir -p data/sessions data/configs data/previews

# Expose the port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Start the application
CMD ["node", "src/index.js"]