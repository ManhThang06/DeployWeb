#!/bin/bash
# Script thiết lập project Laravel cho mọi máy (Linux/Mac)
echo -e "\e[36m--- Bắt đầu thiết lập project ---\e[0m"

# 1. Kiểm tra .env
if [ ! -f .env ]; then
    echo -e "\e[33mĐang tạo file .env từ .env.example...\e[0m"
    cp .env.example .env
fi

# 2. Khởi động Docker
echo -e "\e[33mĐang khởi động Docker containers...\e[0m"
docker compose up -d

# 3. Cài đặt dependencies (PHP)
echo -e "\e[33mĐang cài đặt Composer dependencies...\e[0m"
docker compose exec app composer install

# 4. Thiết lập Laravel
echo -e "\e[33mĐang thiết lập Laravel (Key, Migrate)...\e[0m"
docker compose exec app php artisan key:generate --ansi
docker compose exec app php artisan migrate --force

# 5. Cài đặt dependencies (JS) và Build
echo -e "\e[33mĐang cài đặt npm dependencies...\e[0m"
npm install
echo -e "\e[33mĐang build assets...\e[0m"
npm run build

echo -e "\e[32m--- THIẾT LẬP HOÀN TẤT ---\e[0m"
echo -e "\e[36mBạn có thể truy cập trang web tại: http://localhost:8000\e[0m"
