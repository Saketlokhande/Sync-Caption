# Use Node.js 18 with Debian (includes apt for FFMPEG installation)
FROM node:18-bullseye

# Install FFMPEG (required for video processing)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Create necessary directories
RUN mkdir -p public/uploads public/outputs

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]

