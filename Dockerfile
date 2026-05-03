# =========================
# Build Stage
# =========================
FROM node:lts-alpine AS build-stage

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy rest of project files
COPY . .

# Build Vite app (output => /app/dist)
RUN npm run build-dev


# =========================
# Production Stage
# =========================
FROM nginx:stable-alpine AS production-stage

# Copy build output from previous stage to nginx directory
COPY --from=build-stage /app/dist /var/www

# Copy your custom nginx.conf into place
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 3000 (since your nginx.conf listens on 3000)
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
