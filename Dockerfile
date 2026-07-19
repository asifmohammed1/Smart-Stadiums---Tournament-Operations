# Stage 1: Build stage (optional for static sites — keeps image clean)
FROM nginx:1.27-alpine AS runtime

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy project files into nginx web root
COPY index.html        /usr/share/nginx/html/
COPY sw.js             /usr/share/nginx/html/
COPY manifest.json     /usr/share/nginx/html/
COPY css/              /usr/share/nginx/html/css/
COPY js/               /usr/share/nginx/html/js/
COPY tests/            /usr/share/nginx/html/tests/
COPY README.md         /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requires the container to listen on $PORT (default 8080)
EXPOSE 8080

# Run nginx in foreground (required for containers)
CMD ["nginx", "-g", "daemon off;"]
