// components/AdminConfirmModal.jsx
import Modal from "./Modal";


export default function AdminConfirmModal({
  title,
  titleColor = "#c62828",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmStyle = {},
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Modal title={title} titleColor={titleColor} onClose={onClose} size="sm">
      <div className="del-msg">{message}</div>

      <div className="admin-modal-footer">
        <button className="btn-cancel" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </button>

        <button
          className="btn-deactivate"
          onClick={onConfirm}
          disabled={loading}
          style={{
            background: "#c62828",
            color: "#fff",
            padding: "9px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            ...confirmStyle,
          }}
        >
          {loading ? "Processing…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}