import { useState } from 'react';

export default function ConfirmationModal({ show, onConfirm, onCancel, title, message }) {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1080 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header border-0 d-flex justify-content-between align-items-center p-4 pb-0">
                        <h5 className="modal-title fw-bold m-0">{title}</h5>
                        <button type="button" className="btn bg-danger text-white rounded-3 shadow-sm d-flex align-items-center justify-content-center p-0" style={{ width: '32px', height: '32px', border: 'none' }} onClick={onCancel}>
                            <i className="bi bi-x fs-5"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-light" onClick={onCancel}>Hủy</button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
