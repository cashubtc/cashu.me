# Stage 1: Build Phase
FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./

# Install application dependencies
RUN npm install -g @quasar/cli
RUN npm install

# Copy the application code to the container
COPY . .

ARG DESIGN_SYSTEM
# SIDE_BY_SIDE=1 (staging only) ships the before/after deck at /side-by-side (built by
# scripts/side-by-side into deploy/side-by-side before the image is built)
ARG SIDE_BY_SIDE

# Build the PWA (replace 'npm run build' with your actual build command)
RUN npm run build:pwa
RUN if [ "$SIDE_BY_SIDE" = "1" ]; then cp -r deploy/side-by-side dist/pwa/side-by-side; fi

# Stage 2: Runtime Phase
FROM nginx

# Copy the built PWA files from the builder stage
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# History-mode routing: serve the app for any path that isn't a file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port your app will run on
EXPOSE 80
