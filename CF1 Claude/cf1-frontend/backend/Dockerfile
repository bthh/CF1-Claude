# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install required packages for SQLite and compilation
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install all dependencies (needed for TypeScript compilation)
RUN npm ci --silent && npm cache clean --force

# Copy source code
COPY . .

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Ensure ts-node and TypeScript are available
RUN npm install -g ts-node typescript

# Set environment for Railway
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" \
  || exit 1

# Start the application using ts-node with transpile-only (skip type checking)
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]