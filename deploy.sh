#!/bin/bash

# ===============================
# Deployment Script for Next.js
# ===============================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Exit on any error
set -e

# Load .env.production safely
print_status "Loading environment variables from .env.production..."
if [ -f .env.production ]; then
    set -o allexport
    source .env.production
    set +o allexport
else
    print_warning ".env.production file not found!"
fi

# Set defaults if not defined in .env
APP_NAME=${APP_NAME:-internal_dev_frontend_testing}
PORT=${PORT:-4040}
EXTERNAL_PORT=${EXTERNAL_PORT:-4050}
GIT_BRANCH=${GIT_BRANCH:-development}

print_status "Starting deployment for ${APP_NAME} on external port ${EXTERNAL_PORT}..."

# Pull latest code from Git branch
print_status "Pulling latest code from branch '${GIT_BRANCH}'..."
git fetch origin
git checkout ${GIT_BRANCH}
git pull origin ${GIT_BRANCH}

# Install dependencies
print_status "Installing dependencies..."
npm install --force

# Build the application
print_status "Building application..."
npm run build

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Stop existing PM2 process
print_status "Stopping existing PM2 process '${APP_NAME}'..."
pm2 stop ${APP_NAME} 2>/dev/null || true

# Delete existing PM2 process
print_status "Deleting existing PM2 process '${APP_NAME}'..."
pm2 delete ${APP_NAME} 2>/dev/null || true

# Create PM2 configuration file
print_status "Creating PM2 configuration for port ${PORT}..."
cat > pm2.config.js << EOF
module.exports = {
  apps: [
    {
      name: '${APP_NAME}',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: '${NODE_ENV:-production}',
        PORT: '${PORT}',
        EXTERNAL_PORT: '${EXTERNAL_PORT}'
      },
      env_file: '.env.production',
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      autorestart: true,
      kill_timeout: 5000,
      listen_timeout: 10000
    }
  ]
};
EOF

# Start PM2 process
print_status "Starting PM2 process '${APP_NAME}'..."
pm2 start pm2.config.js

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

print_status "🎉 Deployment completed! App running on http://$(hostname -I | awk '{print $1}'):${EXTERNAL_PORT}"

# Show PM2 status
print_status "Current PM2 status:"
pm2 status
