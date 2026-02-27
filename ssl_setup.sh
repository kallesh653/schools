#!/bin/bash
# SSL Setup Script for schoolm.aksoftware.tech

LOG="/tmp/ssl_setup.log"
echo "=== SSL Setup Starting ===" > $LOG
date >> $LOG

# Update nginx config first
cat > /etc/nginx/sites-available/school << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name schoolm.aksoftware.tech;
    root /var/www/school-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
}
NGINXEOF

echo "Nginx config updated" >> $LOG

# Test nginx
nginx -t >> $LOG 2>&1
if [ $? -ne 0 ]; then
    echo "NGINX config test FAILED" >> $LOG
    exit 1
fi

# Reload nginx
systemctl reload nginx >> $LOG 2>&1
echo "Nginx reloaded" >> $LOG

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..." >> $LOG
    apt-get update -qq >> $LOG 2>&1
    apt-get install -y certbot python3-certbot-nginx >> $LOG 2>&1
    echo "Certbot installed" >> $LOG
fi

certbot --version >> $LOG 2>&1

# Get SSL certificate
echo "Running certbot..." >> $LOG
certbot --nginx \
    -d schoolm.aksoftware.tech \
    --non-interactive \
    --agree-tos \
    --email admin@aksoftware.tech \
    --redirect \
    --keep-until-expiring >> $LOG 2>&1

CERT_EXIT=$?
echo "Certbot exit code: $CERT_EXIT" >> $LOG

if [ $CERT_EXIT -eq 0 ]; then
    echo "=== SSL SETUP SUCCESS ===" >> $LOG
    systemctl reload nginx >> $LOG 2>&1
else
    echo "=== SSL SETUP FAILED ===" >> $LOG
fi

cat $LOG
