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

# Build the PWA (replace 'npm run build' with your actual build command)
RUN npm run build:pwa

# Stage 2: Runtime Phase
FROM nginx

# Copy the built PWA files from the builder stage
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# Before/after screenshots (scripts/side-by-side), a static page at /side-by-side
COPY deploy/side-by-side /usr/share/nginx/html/side-by-side

# History-mode routing: serve the app for any path that isn't a file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port your app will run on
EXPOSE 80
