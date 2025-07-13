# Multi-stage build for ARCON e-Ad Approval Portal
# Production-ready Docker configuration

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies with clean cache
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]