# ARCON e-Ad Approval Portal - Deployment Guide

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Configuration](#environment-configuration)
- [Cloud Deployment](#cloud-deployment)
- [Docker Deployment](#docker-deployment)
- [Server Deployment](#server-deployment)
- [SSL Configuration](#ssl-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn v1.22.0+)
- **Docker**: v20.10.0+ (for containerized deployment)
- **Docker Compose**: v2.0.0+

### Required Services
- **Database**: PostgreSQL 13+ (for production)
- **Cache**: Redis 6+ (optional, for session management)
- **File Storage**: AWS S3 or compatible service
- **Email Service**: SMTP server or service (for notifications)

## 🚀 Local Development

### Quick Start
```bash
# Clone repository
git clone https://github.com/your-org/arcon-ad-approval-portal.git
cd arcon-ad-approval-portal

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Development with Docker
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🔐 Environment Configuration

### Frontend Environment Variables
Create `.env.local` file:

```env
# Application
VITE_APP_NAME=ARCON e-Ad Approval Portal
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Supabase (Required for full functionality)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional Services
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Backend Environment Variables (Supabase)
Configure in Supabase dashboard:

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h

# File Storage
STORAGE_BUCKET=arcon-portal-files
MAX_FILE_SIZE=10MB

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# External APIs
PDF_GENERATOR_API_KEY=your-pdf-api-key
QR_SERVICE_URL=https://api.qrserver.com
```

## ☁️ Cloud Deployment

### Netlify Deployment

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Connect GitHub repository
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Environment variables: Add all `VITE_*` variables

3. **Custom Domain Setup**
   ```bash
   # Add custom domain in Netlify dashboard
   # Update DNS records:
   # CNAME: www -> your-site.netlify.app
   # A: @ -> 75.2.60.5
   ```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configuration** (`vercel.json`)
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Render Deployment

1. **Create Web Service**
   - Connect repository
   - Build command: `npm install && npm run build`
   - Start command: `npm run preview`

2. **Environment Variables**
   - Add all required variables in Render dashboard

## 🐳 Docker Deployment

### Production Deployment

1. **Build and Run**
   ```bash
   # Build production image
   docker build -t arcon-portal .
   
   # Run container
   docker run -d \
     --name arcon-portal \
     -p 80:80 \
     --env-file .env.production \
     arcon-portal
   ```

2. **Docker Compose Production**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Scale application
   docker-compose up -d --scale arcon-portal=3
   
   # View logs
   docker-compose logs -f arcon-portal
   ```

3. **Health Monitoring**
   ```bash
   # Check container health
   docker ps --format "table {{.Names}}\t{{.Status}}"
   
   # Monitor resource usage
   docker stats arcon-portal
   ```

## 🖥️ Server Deployment

### Ubuntu/Debian Server Setup

1. **System Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install required packages
   sudo apt install -y curl git nginx certbot python3-certbot-nginx
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/arcon-ad-approval-portal.git
   cd arcon-ad-approval-portal
   
   # Set up production environment
   cp .env.example .env.production
   nano .env.production
   
   # Build and deploy
   docker-compose -f docker-compose.yml up -d
   ```

3. **Nginx Reverse Proxy**
   ```bash
   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/arcon-portal
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
   
       location / {
           proxy_pass http://localhost:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/arcon-portal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### CentOS/RHEL Server Setup

1. **System Preparation**
   ```bash
   # Update system
   sudo yum update -y
   
   # Install EPEL repository
   sudo yum install -y epel-release
   
   # Install required packages
   sudo yum install -y curl git nginx certbot python3-certbot-nginx
   
   # Install Node.js
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   
   # Install Docker
   sudo yum install -y docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

2. **Follow similar deployment steps as Ubuntu**

## 🔒 SSL Configuration

### Automatic SSL with Certbot

1. **Install SSL Certificate**
   ```bash
   # For Nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   
   # For Apache
   sudo certbot --apache -d your-domain.com -d www.your-domain.com
   ```

2. **Auto-renewal Setup**
   ```bash
   # Test auto-renewal
   sudo certbot renew --dry-run
   
   # Add to crontab
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Manual SSL Configuration

1. **Generate SSL Certificate**
   ```bash
   # Self-signed certificate (development only)
   sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/ssl/private/arcon-portal.key \
     -out /etc/ssl/certs/arcon-portal.crt
   ```

2. **Update Nginx Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
   
       ssl_certificate /etc/ssl/certs/arcon-portal.crt;
       ssl_certificate_key /etc/ssl/private/arcon-portal.key;
   
       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
       ssl_prefer_server_ciphers on;
   
       location / {
           proxy_pass http://localhost:80;
           # ... other proxy settings
       }
   }
   
   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

## 📊 Monitoring & Maintenance

### Health Checks

1. **Application Health**
   ```bash
   # Check application status
   curl -f http://localhost/health
   
   # Docker health check
   docker health arcon-portal
   ```

2. **Database Monitoring**
   ```bash
   # PostgreSQL status
   docker exec arcon-postgres pg_isready -U arcon_user
   
   # Redis status
   docker exec arcon-redis redis-cli ping
   ```

### Log Management

1. **Application Logs**
   ```bash
   # Docker logs
   docker-compose logs -f --tail=100 arcon-portal
   
   # Nginx logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Log Rotation**
   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/arcon-portal
   ```

   ```
   /var/log/arcon-portal/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   ```

### Backup Strategy

1. **Database Backup**
   ```bash
   # PostgreSQL backup
   docker exec arcon-postgres pg_dump -U arcon_user arcon_portal > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Automated backup script
   #!/bin/bash
   BACKUP_DIR="/var/backups/arcon-portal"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   docker exec arcon-postgres pg_dump -U arcon_user arcon_portal > $BACKUP_DIR/db_backup_$DATE.sql
   gzip $BACKUP_DIR/db_backup_$DATE.sql
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
   ```

2. **Application Backup**
   ```bash
   # Backup application files
   tar -czf arcon-portal-backup-$(date +%Y%m%d).tar.gz \
     --exclude=node_modules \
     --exclude=.git \
     /path/to/arcon-portal
   ```

### Performance Optimization

1. **Nginx Optimization**
   ```nginx
   # Add to nginx.conf
   worker_processes auto;
   worker_connections 4096;
   
   # Enable compression
   gzip on;
   gzip_comp_level 6;
   gzip_types text/plain text/css application/json application/javascript;
   
   # Cache static files
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

2. **Database Optimization**
   ```sql
   -- PostgreSQL optimization
   -- Add to postgresql.conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   default_statistics_target = 100
   ```

### Scaling Considerations

1. **Horizontal Scaling**
   ```bash
   # Scale with Docker Compose
   docker-compose up -d --scale arcon-portal=3
   
   # Load balancer configuration
   upstream arcon_backend {
       server localhost:8001;
       server localhost:8002;
       server localhost:8003;
   }
   ```

2. **Database Scaling**
   ```bash
   # Read replicas setup
   # Configure in PostgreSQL for read-only queries
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Clear Docker cache
   docker system prune -f
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

2. **SSL Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew --force-renewal
   ```

3. **Performance Issues**
   ```bash
   # Monitor resource usage
   docker stats
   htop
   
   # Check disk space
   df -h
   
   # Check memory usage
   free -h
   ```

For additional support, refer to the main README.md or contact the development team.