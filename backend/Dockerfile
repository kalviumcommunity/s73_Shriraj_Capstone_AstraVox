# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
