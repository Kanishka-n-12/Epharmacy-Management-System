import Modal from "./Modal";
import "./css/Modal.css";

export default function ConfirmModal({
  title = "Confirm",
  titleColor = "#c62828",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} titleColor={titleColor} onClose={onClose} size="sm">
      <div className="del-msg">{message}</div>
      <div className="modal-footer">
        <button className="btn-cancel" onClick={onClose}>
          {cancelLabel}
        </button>
        <button className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}