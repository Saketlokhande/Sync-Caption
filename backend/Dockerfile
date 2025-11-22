# Use Node.js 20 LTS with Debian (includes apt for FFMPEG installation)
# Node 20+ required for OpenAI SDK File API support
FROM node:20-bullseye

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

# Copy Remotion source directory to dist - Remotion bundler needs source TSX/TS files
# TypeScript compiles .ts but Remotion bundler processes source files directly
RUN cp -r src/remotion dist/ 2>/dev/null || true

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Create necessary directories
RUN mkdir -p public/uploads public/outputs

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]

