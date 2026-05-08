--------------------------------------------------
HƯỚNG DẪN KHỞI CHẠY DỰ ÁN (DOCKER & MYSQL)
Dự án: Hệ thống Quản lý Ghi chú Thông minh
--------------------------------------------------

1. YÊU CẦU HỆ THỐNG
- Docker Desktop (Đã cài đặt và đang chạy).
- Đảm bảo các cổng 8000, 8081, và 3307 đang trống.

2. CÁC ĐỊA CHỈ TRUY CẬP
- Ứng dụng: http://localhost:8000
- Quản lý DB (phpMyAdmin): http://localhost:8081
  + Server: db
  + Username: root
  + Password: root

3. CÁCH CHẠY DỰ ÁN (Mỗi khi bắt đầu)
B1: Mở Terminal tại thư mục DeployWeb.
B2: Chạy lệnh khởi động các container:
    docker-compose up -d

4. CÁC LỆNH CÀI ĐẶT (Chỉ chạy khi cài mới hoặc reset)
B1: Cài đặt thư viện PHP:
    docker-compose exec app composer install
B2: Tạo bảng dữ liệu:
    docker-compose exec app php artisan migrate
B3: Cài đặt thư viện JS và Build giao diện (Chạy ở máy thật):
    npm install
    npm run build
B4: Vào địa chỉ: http://localhost:8000

5. THÔNG TIN KẾT NỐI DATABASE (Dành cho Navicat/Workbench)
- Host: 127.0.0.1
- Port: 3307 (Lưu ý: Cổng ngoài là 3307 để tránh xung đột)
- User: root
- Pass: root
- Database: laravel

6. LƯU Ý VỀ TỐC ĐỘ (DÀNH CHO WINDOWS)
Hệ thống đã được tối ưu bằng "Named Volumes". 
Nếu vẫn thấy chậm, hãy kiểm tra Docker Desktop Settings -> Resources và tăng RAM lên tối thiểu 4GB.

--------------------------------------------------
Trường hợp muốn dừng dự án: docker-compose stop
--------------------------------------------------
