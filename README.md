# ARCON e-Ad Approval Demo Portal

> **Professional advertisement approval platform for the Advertising Regulatory Council of Nigeria (ARCON)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Workflow](#workflow)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The ARCON e-Ad Approval Demo Portal is a comprehensive web-based platform designed to streamline the advertisement approval process for the Advertising Regulatory Council of Nigeria. This demo showcases a complete digital workflow from submission to approval, including QR-enabled e-certificate generation and public verification.

### Project Objectives

- **Digitize** the traditional ad approval process
- **Streamline** submission and review workflows
- **Enhance** transparency with real-time tracking
- **Generate** verifiable e-certificates with QR codes
- **Provide** public verification capabilities

## ✨ Features

### For Advertisers
- **📝 Easy Submission**: Intuitive form-based ad submission process
- **📊 Real-time Tracking**: Live status updates for all submissions
- **📄 Digital Certificates**: Instant download of QR-enabled e-certificates
- **💬 Communication**: Direct feedback channel with ARCON reviewers
- **📱 Mobile Responsive**: Full functionality across all devices

### For ARCON Reviewers
- **🔍 Efficient Review**: Streamlined review interface with all submission details
- **✅ Quick Actions**: One-click approve/reject with comment system
- **📋 Queue Management**: Organized review queue with priority handling
- **📈 Analytics**: Review performance metrics and insights
- **🔄 Workflow Integration**: Seamless handoff between review stages

### For Public Users
- **🔍 Certificate Verification**: QR code and ID-based verification
- **📱 Mobile Scanner**: Built-in QR code scanner for instant verification
- **🛡️ Authenticity Check**: Comprehensive certificate validation
- **📊 Public Registry**: Browse approved advertisements

### System Features
- **🔐 Role-based Authentication**: JWT-based secure authentication
- **☁️ Cloud Storage**: Secure file upload and management
- **📊 Real-time Updates**: Live notifications and status changes
- **🎨 Professional UI**: Modern, accessible design system
- **📱 Progressive Web App**: Offline capabilities and mobile optimization

## 🏗️ Architecture

### Frontend Stack
```
├── React 18 (TypeScript)       # Core framework with type safety
├── Vite                        # Build tool and development server
├── Tailwind CSS               # Utility-first CSS framework
├── Shadcn/ui                  # Professional component library
├── React Router               # Client-side routing
├── React Hook Form            # Form management and validation
├── Lucide React              # Professional icon library
└── Tanstack Query            # Data fetching and state management
```

### Backend Requirements (For Full Implementation)
```
├── Supabase                   # Backend-as-a-Service
│   ├── PostgreSQL            # Primary database
│   ├── Authentication        # User management and JWT
│   ├── Storage               # File uploads and management
│   ├── Edge Functions        # PDF generation and QR codes
│   └── Real-time             # Live updates and notifications
├── PDF Generation            # Certificate creation
├── QR Code Generation        # Verification codes
└── Email Service            # Notifications
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/arcon-ad-approval-portal.git
   cd arcon-ad-approval-portal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit environment variables
   nano .env.local
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Access the Application**
   - Frontend: `http://localhost:8080`
   - Development tools available in browser dev tools

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration (Required for full functionality)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME=ARCON e-Ad Approval Portal
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Optional: External Services
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## 🌐 Deployment

### Netlify Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Environment variables**: Add your `.env` variables

3. **Custom Domain (Optional)**
   - Add your custom domain in Netlify dashboard
   - Configure DNS settings as provided

### Render Deployment

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Connect your GitHub account

2. **Create Web Service**
   - Select your repository
   - Configure settings:
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run preview`

3. **Environment Variables**
   - Add all required environment variables in Render dashboard

### Manual Server Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Install Serve**
   ```bash
   npm install -g serve
   ```

3. **Serve Application**
   ```bash
   serve -s dist -l 3000
   ```

## 🐳 Docker Deployment

### Development Environment

1. **Create Dockerfile**
   ```dockerfile
   # Development Dockerfile
   FROM node:18-alpine AS development
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci
   
   # Copy source code
   COPY . .
   
   # Expose port
   EXPOSE 8080
   
   # Start development server
   CMD ["npm", "run", "dev", "--", "--host"]
   ```

2. **Docker Compose for Development**
   ```yaml
   # docker-compose.dev.yml
   version: '3.8'
   
   services:
     arcon-portal-dev:
       build:
         context: .
         dockerfile: Dockerfile
       ports:
         - "8080:8080"
       volumes:
         - .:/app
         - /app/node_modules
       environment:
         - NODE_ENV=development
       command: npm run dev
   ```

3. **Run Development Container**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

### Production Deployment

1. **Production Dockerfile**
   ```dockerfile
   # Multi-stage build for production
   FROM node:18-alpine AS builder
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   
   # Install dependencies
   RUN npm ci --only=production && npm cache clean --force
   
   # Copy source code
   COPY . .
   
   # Build application
   RUN npm run build
   
   # Production stage
   FROM nginx:alpine AS production
   
   # Copy built files
   COPY --from=builder /app/dist /usr/share/nginx/html
   
   # Copy nginx configuration
   COPY nginx.conf /etc/nginx/nginx.conf
   
   # Expose port
   EXPOSE 80
   
   # Health check
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost/ || exit 1
   
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Nginx Configuration**
   ```nginx
   # nginx.conf
   events {
     worker_connections 1024;
   }
   
   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;
     
     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;
       
       # Handle React Router
       location / {
         try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options DENY;
       add_header X-Content-Type-Options nosniff;
       add_header X-XSS-Protection "1; mode=block";
       
       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
     }
   }
   ```

3. **Production Docker Compose**
   ```yaml
   # docker-compose.prod.yml
   version: '3.8'
   
   services:
     arcon-portal:
       build:
         context: .
         dockerfile: Dockerfile
         target: production
       ports:
         - "80:80"
       restart: unless-stopped
       environment:
         - NODE_ENV=production
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost/"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

4. **Deploy to Production**
   ```bash
   # Build and run production container
   docker-compose -f docker-compose.prod.yml up -d --build
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Scale if needed
   docker-compose -f docker-compose.prod.yml up -d --scale arcon-portal=3
   ```

### Server Deployment with Docker

1. **Prepare Server**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**
   ```bash
   # Clone repository on server
   git clone https://github.com/your-org/arcon-ad-approval-portal.git
   cd arcon-ad-approval-portal
   
   # Set up environment
   cp .env.example .env.production
   nano .env.production
   
   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up Reverse Proxy (Optional)**
   ```bash
   # Install Caddy for automatic HTTPS
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update
   sudo apt install caddy
   ```

   Create Caddyfile:
   ```
   your-domain.com {
     reverse_proxy localhost:80
   }
   ```

## 👥 User Roles

### Advertiser
- **Registration**: Email-based account creation with verification
- **Submissions**: Upload campaign materials and documentation
- **Tracking**: Monitor approval status in real-time
- **Certificates**: Download approved e-certificates
- **Communication**: Receive feedback from reviewers

### ARCON Reviewer
- **Review Queue**: Access prioritized list of pending submissions
- **Detailed Review**: View all submission materials and metadata
- **Actions**: Approve, reject, or request changes with comments
- **Reporting**: Generate review statistics and performance metrics

### Administrator
- **User Management**: Manage advertiser and reviewer accounts
- **System Oversight**: Monitor platform performance and usage
- **Configuration**: Adjust system settings and approval workflows
- **Analytics**: Access comprehensive platform analytics

### Public User
- **Verification**: Verify certificate authenticity via QR or ID
- **Registry**: Browse publicly approved advertisements
- **Search**: Find specific campaigns or advertisers

## 📊 Workflow

### Submission Process
```
1. Account Creation → 2. Profile Completion → 3. Campaign Submission
     ↓                      ↓                        ↓
4. Document Upload → 5. Payment (Demo) → 6. Submission Review
```

### Review Process
```
1. Queue Assignment → 2. Material Review → 3. Compliance Check
     ↓                      ↓                    ↓
4. Decision Making → 5. Certificate Generation → 6. Notification
```

### Verification Process
```
1. QR Code Scan → 2. Certificate Lookup → 3. Authenticity Check
     ↓                ↓                      ↓
4. Result Display → 5. Details View → 6. Public Record
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Component Testing
```bash
npm run test:components
```

## 📝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Email**: support@intelligenceindex.com
- **Documentation**: [docs.arcon-portal.com](https://docs.arcon-portal.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/arcon-ad-approval-portal/issues)

---

**Built with ❤️ by Intelligence Index Limited for ARCON Nigeria**