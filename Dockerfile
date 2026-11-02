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
# SIDE_BY_SIDE=1 (staging only) ships the before/after screenshots at /side-by-side
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
