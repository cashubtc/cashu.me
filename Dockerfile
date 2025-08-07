# Stage 1: Build Phase - Install dependencies and build the Quasar PWA
FROM node:20-alpine AS builder

# Enable pnpm, which is included with this version of Node.js
RUN corepack enable

WORKDIR /app

# Copy the package manifests and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm. --frozen-lockfile ensures it uses the exact versions from the lockfile.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the PWA using the pnpm script
RUN pnpm run build:pwa

# Stage 2: Production Phase - Serve the built assets with Nginx
FROM nginx:alpine

# Copy the built PWA files from the builder stage to the Nginx public directory
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Nginx will automatically start and serve the files when the container runs
