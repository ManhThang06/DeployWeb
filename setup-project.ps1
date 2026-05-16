# Script thiết lập project Laravel cho mọi máy (Windows)
Write-Host "--- Bắt đầu thiết lập project ---" -ForegroundColor Cyan

# 1. Kiểm tra .env
if (-not (Test-Path .env)) {
    Write-Host "Đang tạo file .env từ .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}

# 2. Khởi động Docker
Write-Host "Đang khởi động Docker containers..." -ForegroundColor Yellow
docker compose up -d

# 3. Cài đặt dependencies (PHP)
Write-Host "Đang cài đặt Composer dependencies..." -ForegroundColor Yellow
docker compose exec app composer install

# 4. Thiết lập Laravel
Write-Host "Đang thiết lập Laravel (Key, Migrate)..." -ForegroundColor Yellow
docker compose exec app php artisan key:generate --ansi
docker compose exec app php artisan migrate --force

# 5. Cài đặt dependencies (JS) và Build
Write-Host "Đang cài đặt npm dependencies..." -ForegroundColor Yellow
npm install
Write-Host "Đang build assets..." -ForegroundColor Yellow
npm run build

Write-Host "--- THIẾT LẬP HOÀN TẤT ---" -ForegroundColor Green
Write-Host "Bạn có thể truy cập trang web tại: http://localhost:8000" -ForegroundColor Cyan
