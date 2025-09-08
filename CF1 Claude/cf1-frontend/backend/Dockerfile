# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for ts-node-dev)
RUN npm ci

# Install global packages
RUN npm install -g ts-node typescript ts-node-dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application using ts-node with transpile-only (skip type checking)
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]