# Multi-stage build for optimal image size

# Stage 1: Build stage with explicit cleanup
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies with clean install
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Explicit cleanup before build
RUN rm -rf dist .cache node_modules/.cache

# Build the application with timestamp
RUN npm run build && \
    echo "Build completed at: $(date)" > /app/dist/build-info.txt

# Stage 2: Production stage with Nginx
FROM nginx:alpine AS production

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Development stage with hot reload and cleanup
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Clean development artifacts
RUN rm -rf dist .cache node_modules/.cache

# Create volume for node_modules to persist across container restarts
VOLUME [ "/app/node_modules" ]

# Expose Vite dev server port
EXPOSE 5173

# Use this script to start dev server with cleanup
CMD ["sh", "-c", "rm -rf dist .cache && npm run dev"]