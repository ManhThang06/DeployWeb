#!/bin/sh
set -e

# Chạy storage:link thủ công để đảm bảo đường dẫn tương đối (không phụ thuộc vào package symfony/filesystem)
echo "Fixing storage symlink..."
rm -rf /var/www/public/storage
ln -s ../storage/app/public /var/www/public/storage

# Đảm bảo quyền ghi cho thư mục storage và bootstrap/cache
echo "Setting permissions..."
# Sử dụng 777 để đảm bảo ghi được trên mọi hệ điều hành khi dùng volume
chmod -R 777 /var/www/storage /var/www/bootstrap/cache
if [ -f /var/www/storage/logs/laravel.log ]; then
    chmod 666 /var/www/storage/logs/laravel.log
fi

# Tiếp tục lệnh mặc định (php-fpm)
exec "$@"
