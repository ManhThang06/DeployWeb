<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 20px;
        }
        .note-preview {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .note-title {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 5px;
            color: #065f46;
        }
        .note-excerpt {
            color: #065f46;
            opacity: 0.8;
            font-style: italic;
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            background-color: #f9fafb;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            margin-top: 20px;
            box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
        }
        .btn:hover {
            background-color: #059669;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ghi chú mới được chia sẻ</h1>
        </div>
        <div class="content">
            <p>Chào bạn,</p>
            <p><strong>{{ $owner->display_name }}</strong> ({{ $owner->email }}) vừa chia sẻ một ghi chú với bạn trên <strong>NotePro</strong>.</p>
            
            <div class="note-preview">
                <div class="note-title">{{ $note->title ?: 'Không tiêu đề' }}</div>
                <div class="note-excerpt">
                    {{ Str::limit($note->content, 100, '...') }}
                </div>
            </div>
            
            <p>Bạn có thể xem và chỉnh sửa (nếu được cấp quyền) ghi chú này ngay bây giờ.</p>
            
            <div style="text-align: center;">
                <a href="{{ route('notes.shared-with-me', ['open' => $note->id]) }}" class="btn">Xem ghi chú</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} NotePro. Designed by Nguyen Manh Thang.
        </div>
    </div>
</body>
</html>
