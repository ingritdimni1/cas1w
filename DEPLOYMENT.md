# Deployment Guide for 1winpro

This guide provides instructions for deploying the 1winpro project to your server at `root@72.60.111.154`.

## Prerequisites

Your server must have the following installed:

- **PHP** 7.2 or higher (PHP 8.x recommended)
- **Composer** (PHP dependency manager)
- **Node.js** 14.x or higher
- **npm** (Node package manager)
- **MySQL/MariaDB** (Database)
- **Nginx or Apache** (Web server)
- **Git** (Version control)

## Installation Methods

### Method 1: Automated Deployment (Recommended)

1. **Connect to your server:**
   ```bash
   ssh root@72.60.111.154
   ```

2. **Clone the repository:**
   ```bash
   cd /var/www
   git clone https://github.com/vrasvare/1winpro.git
   cd 1winpro
   git checkout claude/setup-installation-ytX2k
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   The script will automatically:
   - Check system requirements
   - Install PHP dependencies
   - Install Node.js dependencies
   - Configure environment file
   - Set proper permissions
   - Build frontend assets
   - Optimize the application

### Method 2: Manual Deployment

1. **Connect to your server:**
   ```bash
   ssh root@72.60.111.154
   ```

2. **Navigate to web directory:**
   ```bash
   cd /var/www
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/vrasvare/1winpro.git
   cd 1winpro
   git checkout claude/setup-installation-ytX2k
   ```

4. **Install PHP dependencies:**
   ```bash
   composer install --ignore-platform-reqs --no-interaction --prefer-dist --optimize-autoloader --no-scripts
   ```

5. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

6. **Configure environment:**
   ```bash
   cp .env.example .env
   # Or use existing .env file
   php artisan key:generate
   ```

7. **Edit .env file with your database credentials:**
   ```bash
   nano .env
   ```

   Update the following:
   ```
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password
   ```

8. **Create storage directories and set permissions:**
   ```bash
   mkdir -p storage/{app,framework,logs}
   mkdir -p storage/framework/{cache,sessions,views}
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

9. **Build frontend assets:**
   ```bash
   npm run production
   ```

10. **Run database migrations:**
    ```bash
    php artisan migrate --force
    ```

11. **Optimize application:**
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```

## Web Server Configuration

### Nginx Configuration

Create a new site configuration:

```bash
nano /etc/nginx/sites-available/1winpro
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/1winpro/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site and restart Nginx:

```bash
ln -s /etc/nginx/sites-available/1winpro /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Apache Configuration

Create a new virtual host:

```bash
nano /etc/apache2/sites-available/1winpro.conf
```

Add the following configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/1winpro/public

    <Directory /var/www/1winpro/public>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/1winpro-error.log
    CustomLog ${APACHE_LOG_DIR}/1winpro-access.log combined
</VirtualHost>
```

Enable the site and required modules:

```bash
a2ensite 1winpro.conf
a2enmod rewrite
systemctl restart apache2
```

## WebSocket Server Setup

The project includes a WebSocket server in the `PTWebSocket` directory.

1. **Install WebSocket dependencies:**
   ```bash
   cd /var/www/1winpro/PTWebSocket
   npm install
   ```

2. **Start the WebSocket server:**
   ```bash
   node Server.js &
   ```

3. **Create a systemd service for the WebSocket server:**
   ```bash
   nano /etc/systemd/system/1winpro-websocket.service
   ```

   Add the following:
   ```ini
   [Unit]
   Description=1winpro WebSocket Server
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/1winpro/PTWebSocket
   ExecStart=/usr/bin/node /var/www/1winpro/PTWebSocket/Server.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start the service:
   ```bash
   systemctl daemon-reload
   systemctl enable 1winpro-websocket
   systemctl start 1winpro-websocket
   ```

## Security Recommendations

1. **Set proper file permissions:**
   ```bash
   chown -R www-data:www-data /var/www/1winpro
   chmod -R 755 /var/www/1winpro
   chmod -R 775 /var/www/1winpro/storage
   chmod -R 775 /var/www/1winpro/bootstrap/cache
   ```

2. **Secure your .env file:**
   ```bash
   chmod 600 /var/www/1winpro/.env
   ```

3. **Set up SSL/TLS with Let's Encrypt:**
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

4. **Configure firewall:**
   ```bash
   ufw allow 'Nginx Full'
   ufw allow OpenSSH
   ufw enable
   ```

## Troubleshooting

### PHP 8.4 Compatibility Issues

If you encounter errors related to PHP 8.4 strict typing:

1. Use PHP 8.0 or 8.1 if possible
2. Install dependencies with `--ignore-platform-reqs` flag
3. Disable error reporting for deprecations in production:
   ```bash
   # In .env
   APP_DEBUG=false
   ```

### Permission Issues

```bash
sudo chown -R www-data:www-data /var/www/1winpro
sudo chmod -R 775 /var/www/1winpro/storage
sudo chmod -R 775 /var/www/1winpro/bootstrap/cache
```

### Database Connection Issues

1. Verify database credentials in `.env`
2. Check MySQL is running: `systemctl status mysql`
3. Create database if it doesn't exist:
   ```sql
   CREATE DATABASE your_database_name;
   ```

### Clear Application Cache

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Post-Deployment

1. **Test the application:**
   - Visit your domain in a web browser
   - Check logs: `tail -f storage/logs/laravel.log`

2. **Set up monitoring:**
   - Configure application monitoring
   - Set up log rotation
   - Enable backups

3. **Update regularly:**
   ```bash
   cd /var/www/1winpro
   git pull origin claude/setup-installation-ytX2k
   composer install --ignore-platform-reqs --no-scripts
   npm install
   npm run production
   php artisan migrate --force
   php artisan config:cache
   ```

## Support

For issues or questions, refer to the project repository:
https://github.com/vrasvare/1winpro

---

**Note:** This project requires PHP dependencies to be installed with `--ignore-platform-reqs` due to PHP 8.4 compatibility. Some artisan commands may fail due to deprecation warnings in Symfony components.
