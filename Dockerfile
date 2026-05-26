# Stage 1: Build Phase
FROM node:24 AS builder

WORKDIR /app

COPY package*.json ./

# Install application dependencies
RUN npm install -g @quasar/cli
RUN npm install

# Copy the application code to the container
COPY . .

# Build embed.js SDK (outputs to public/ before PWA build copies it)
RUN npm run build:embed

# Build the PWA
RUN npm run build:pwa

# Stage 2: Runtime Phase
FROM nginx

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built PWA files from the builder stage
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# Expose the port your app will run on
EXPOSE 80
