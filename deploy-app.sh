#!/bin/bash

# ============================================================
# School Management System - Application Deployment Script
# ============================================================
# Run this AFTER deploy-vps.sh
# This deploys the actual application
# ============================================================

set -e

echo "============================================================"
echo "  School Management System - Application Deployment"
echo "============================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/opt/school-management"
BACKEND_DIR="$APP_DIR/backend"
ADMIN_DIR="$APP_DIR/admin-web"

# ============================================================
# 1. BUILD BACKEND
# ============================================================
echo -e "${GREEN}[1/5] Building Spring Boot Backend...${NC}"
cd $BACKEND_DIR

# Build with Maven Wrapper
chmod +x mvnw
./mvnw clean package -DskipTests

if [ -f "target/*.jar" ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi

# ============================================================
# 2. BUILD ADMIN WEB
# ============================================================
echo -e "${GREEN}[2/5] Building Admin Web Application...${NC}"
cd $ADMIN_DIR

# Install dependencies
npm install

# Build for production
npm run build

if [ -d "build" ]; then
    echo -e "${GREEN}✓ Admin web built successfully${NC}"
else
    echo -e "${RED}✗ Admin web build failed${NC}"
    exit 1
fi

# ============================================================
# 3. CONFIGURE PM2 FOR BACKEND
# ============================================================
echo -e "${GREEN}[3/5] Configuring PM2 for backend...${NC}"

cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'school-backend',
      cwd: '/opt/school-management/backend',
      script: 'java',
      args: '-jar target/school-management-system-1.0.0.jar',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        JAVA_OPTS: '-Xmx512m -Xms256m'
      }
    }
  ]
};
EOF

# Start backend with PM2
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ Backend started with PM2${NC}"

# ============================================================
# 4. CONFIGURE NGINX
# ============================================================
echo -e "${GREEN}[4/5] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/school-management << 'EOF'
# Backend API
server {
    listen 80;
    server_name _;

    # Admin Web Frontend
    location / {
        root /opt/school-management/admin-web/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/school-management /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx configured and started${NC}"

# ============================================================
# 5. INSERT DUMMY DATA
# ============================================================
echo -e "${GREEN}[5/5] Inserting dummy data into Oracle...${NC}"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 30

# Insert dummy data
su - oracle -c "sqlplus school_admin/school_admin@localhost:1521/XE" << 'EOSQL'
@/opt/school-management/backend/oracle_dummy_data.sql
EXIT;
EOSQL

echo -e "${GREEN}✓ Dummy data inserted${NC}"

# ============================================================
# DEPLOYMENT COMPLETE
# ============================================================
echo ""
echo "============================================================"
echo -e "${GREEN}  Deployment Completed Successfully! 🎉${NC}"
echo "============================================================"
echo ""
echo "Your application is now running:"
echo ""
echo "  Admin Web:    http://YOUR_VPS_IP"
echo "  Backend API:  http://YOUR_VPS_IP/api"
echo ""
echo "Default Login Credentials:"
echo "  Admin:"
echo "    Username: admin"
echo "    Password: admin123"
echo ""
echo "  Teacher:"
echo "    Username: teacher1"
echo "    Password: teacher123"
echo ""
echo "  Parent:"
echo "    Username: parent1"
echo "    Password: parent123"
echo ""
echo "Service Management:"
echo "  View logs:    pm2 logs school-backend"
echo "  Restart:      pm2 restart school-backend"
echo "  Stop:         pm2 stop school-backend"
echo "  Status:       pm2 status"
echo ""
echo "Nginx Management:"
echo "  Restart:      systemctl restart nginx"
echo "  Status:       systemctl status nginx"
echo "  Logs:         tail -f /var/log/nginx/error.log"
echo ""
echo "Oracle Management:"
echo "  Connect:      sqlplus school_admin/school_admin@localhost:1521/XE"
echo "  Status:       systemctl status oracle-xe-21c"
echo ""
echo "============================================================"
echo ""
echo -e "${YELLOW}IMPORTANT SECURITY NOTES:${NC}"
echo "1. Change default passwords immediately!"
echo "2. Configure firewall properly"
echo "3. Set up SSL/HTTPS with Let's Encrypt"
echo "4. Configure Oracle backup"
echo "5. Set up monitoring"
echo ""
echo "============================================================"
