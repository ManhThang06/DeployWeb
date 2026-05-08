import Swal from 'sweetalert2';

export const confirmDestructive = (title, text) => {
    return Swal.fire({
        title: title || 'Bạn có chắc chắn?',
        text: text || "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        reverseButtons: true
    });
};

export const confirmAction = (title, text) => {
    return Swal.fire({
        title: title || 'Xác nhận?',
        text: text || "",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Tiếp tục',
        cancelButtonText: 'Quay lại',
        reverseButtons: true
    });
};

export const notifySuccess = (title, text) => {
    return Swal.fire({
        title: title || 'Thành công!',
        text: text || "",
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
};

export const notifyError = (title, text) => {
    return Swal.fire({
        title: title || 'Lỗi!',
        text: text || "Đã có lỗi xảy ra.",
        icon: 'error'
    });
};
