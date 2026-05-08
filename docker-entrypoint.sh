#!/bin/sh
set -e

# Chạy storage:link thủ công để đảm bảo đường dẫn tương đối (không phụ thuộc vào package symfony/filesystem)
echo "Fixing storage symlink..."
rm -rf /var/www/public/storage
ln -s ../storage/app/public /var/www/public/storage

# Đảm bảo quyền ghi cho thư mục storage và bootstrap/cache
echo "Setting permissions..."
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Tiếp tục lệnh mặc định (php-fpm)
exec "$@"
