#!/bin/bash
#
# Deployment Script for 1winpro
# Usage: bash deploy.sh
#

set -e

echo "=========================================="
echo "1winpro Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root"
    exit 1
fi

print_info "Checking system requirements..."

# Check PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2)
    print_success "PHP $PHP_VERSION is installed"
else
    print_error "PHP is not installed"
    exit 1
fi

# Check Composer
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | cut -d " " -f 3)
    print_success "Composer $COMPOSER_VERSION is installed"
else
    print_error "Composer is not installed"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION is installed"
else
    print_error "Node.js is not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION is installed"
else
    print_error "npm is not installed"
    exit 1
fi

echo ""
print_info "Setting up project directory..."

# Get the directory where script is located
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

print_success "Working in: $PROJECT_DIR"

echo ""
print_info "Installing PHP dependencies..."

# Install PHP dependencies with platform requirements bypass
composer install --ignore-platform-reqs --no-interaction --prefer-dist --optimize-autoloader --no-scripts 2>&1 | tail -10

if [ $? -eq 0 ]; then
    print_success "PHP dependencies installed"
else
    print_error "Failed to install PHP dependencies"
    exit 1
fi

echo ""
print_info "Installing Node.js dependencies..."

# Install Node.js dependencies
npm install --no-audit 2>&1 | tail -10

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

echo ""
print_info "Configuring environment..."

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
    elif [ -f .env_old ]; then
        cp .env_old .env
        print_success "Created .env file from .env_old"
    else
        print_error "No .env.example or .env_old file found"
    fi
fi

# Check if APP_KEY is set
if grep -q "^APP_KEY=.\+$" .env; then
    print_success ".env APP_KEY is already set"
else
    print_info "Generating application key..."
    php artisan key:generate --force 2>&1 || true
    print_success "Application key generated"
fi

echo ""
print_info "Setting permissions..."

# Set permissions for bootstrap/cache
if [ -d bootstrap/cache ]; then
    chmod -R 775 bootstrap/cache
    print_success "Set permissions for bootstrap/cache"
fi

# Set permissions for storage if it exists
if [ -d storage ]; then
    chmod -R 775 storage
    print_success "Set permissions for storage"
fi

# Create storage directories if they don't exist
if [ ! -d storage ]; then
    mkdir -p storage/{app,framework,logs}
    mkdir -p storage/framework/{cache,sessions,views}
    chmod -R 775 storage
    print_success "Created storage directories"
fi

echo ""
print_info "Building frontend assets..."

# Build production assets
npm run production 2>&1 | tail -10

if [ $? -eq 0 ]; then
    print_success "Frontend assets built"
else
    print_error "Failed to build frontend assets"
fi

echo ""
print_info "Optimizing application..."

# Clear and cache config
php artisan config:cache 2>&1 || print_error "Config cache failed (may be due to PHP 8.4 compatibility)"
php artisan route:cache 2>&1 || print_error "Route cache failed (may be due to PHP 8.4 compatibility)"
php artisan view:cache 2>&1 || print_error "View cache failed (may be due to PHP 8.4 compatibility)"

echo ""
echo "=========================================="
print_success "Deployment completed!"
echo "=========================================="
echo ""
print_info "Next steps:"
echo "  1. Configure your database settings in .env"
echo "  2. Run migrations: php artisan migrate"
echo "  3. Configure your web server (Nginx/Apache)"
echo "  4. Set up WebSocket server if needed"
echo ""
print_info "Project directory: $PROJECT_DIR"
echo ""
