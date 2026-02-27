#!/bin/bash

# ============================================================
# School Management System - VPS Deployment Script
# ============================================================
# Run this script on your VPS server (Ubuntu/Debian)
# Usage: bash deploy-vps.sh
# ============================================================

set -e  # Exit on error

echo "============================================================"
echo "  School Management System - VPS Deployment"
echo "============================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================
# 1. UPDATE SYSTEM
# ============================================================
echo -e "${GREEN}[1/8] Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y

# ============================================================
# 2. INSTALL JAVA 17
# ============================================================
echo -e "${GREEN}[2/8] Installing Java 17...${NC}"
apt-get install -y openjdk-17-jdk

java -version
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Java 17 installed successfully${NC}"
else
    echo -e "${RED}✗ Java installation failed${NC}"
    exit 1
fi

# ============================================================
# 3. INSTALL NODE.JS AND NPM
# ============================================================
echo -e "${GREEN}[3/8] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

node --version
npm --version
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node.js and npm installed successfully${NC}"
else
    echo -e "${RED}✗ Node.js installation failed${NC}"
    exit 1
fi

# ============================================================
# 4. INSTALL ORACLE DATABASE XE
# ============================================================
echo -e "${GREEN}[4/8] Installing Oracle Database XE 21c...${NC}"

# Download Oracle XE
echo "Downloading Oracle XE..."
cd /tmp
wget https://download.oracle.com/otn-pub/otn_software/db-express/oracle-database-xe-21c-1.0-1.ol7.x86_64.rpm

# Install alien to convert RPM to DEB
apt-get install -y alien libaio1 unixodbc

# Convert RPM to DEB
alien --scripts oracle-database-xe-21c-1.0-1.ol7.x86_64.rpm

# Install Oracle XE
dpkg -i oracle-database-xe-21c_1.0-2_amd64.deb

# Configure Oracle
echo -e "${YELLOW}Configuring Oracle Database...${NC}"
/etc/init.d/oracle-xe-21c configure << EOF
oracle
oracle
y
EOF

# Set environment variables
echo "export ORACLE_HOME=/opt/oracle/product/21c/dbhomeXE" >> /etc/profile
echo "export ORACLE_SID=XE" >> /etc/profile
echo "export PATH=\$PATH:\$ORACLE_HOME/bin" >> /etc/profile
source /etc/profile

echo -e "${GREEN}✓ Oracle Database XE installed${NC}"

# ============================================================
# 5. SETUP APPLICATION USER
# ============================================================
echo -e "${GREEN}[5/8] Creating application user...${NC}"
useradd -m -s /bin/bash schoolapp || echo "User already exists"

# Create application directory
mkdir -p /opt/school-management
chown -R schoolapp:schoolapp /opt/school-management

# ============================================================
# 6. INSTALL PM2 (Process Manager)
# ============================================================
echo -e "${GREEN}[6/8] Installing PM2...${NC}"
npm install -g pm2

# ============================================================
# 7. INSTALL NGINX (Reverse Proxy)
# ============================================================
echo -e "${GREEN}[7/8] Installing Nginx...${NC}"
apt-get install -y nginx

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 8080
ufw --force enable

echo -e "${GREEN}✓ Nginx installed${NC}"

# ============================================================
# 8. SETUP ORACLE DATABASE
# ============================================================
echo -e "${GREEN}[8/8] Setting up Oracle database...${NC}"

# Wait for Oracle to be ready
sleep 10

# Run setup script
su - oracle -c "sqlplus / as sysdba" << 'EOSQL'
@/opt/school-management/backend/oracle_setup.sql
EXIT;
EOSQL

echo -e "${GREEN}✓ Database setup completed${NC}"

# ============================================================
# INSTALLATION COMPLETE
# ============================================================
echo ""
echo "============================================================"
echo -e "${GREEN}  VPS Setup Completed Successfully!${NC}"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Upload your application files to /opt/school-management"
echo "2. Run: bash /opt/school-management/deploy-app.sh"
echo ""
echo "Installed components:"
echo "  ✓ Java 17"
echo "  ✓ Node.js 20 & npm"
echo "  ✓ Oracle Database XE 21c"
echo "  ✓ PM2 Process Manager"
echo "  ✓ Nginx Web Server"
echo ""
echo "Oracle Connection:"
echo "  Host: localhost"
echo "  Port: 1521"
echo "  SID: XE"
echo "  User: school_admin"
echo "  Password: school_admin"
echo ""
echo "============================================================"
