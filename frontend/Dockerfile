FROM nginx:1.25-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy static files
COPY admin/index.html  /usr/share/nginx/html/admin/index.html
COPY widget/index.html /usr/share/nginx/html/widget/index.html

# Copy nginx config
COPY ../nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
