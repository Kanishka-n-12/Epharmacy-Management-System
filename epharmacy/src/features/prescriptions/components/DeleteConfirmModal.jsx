// features/prescriptions/components/DeleteConfirmModal.jsx
// Reuses the same structure as CancelConfirmModal
import "../css/DeleteConfirmModal.css";

export default function DeleteConfirmModal({ prescription, onConfirm, onClose, deleting }) {
  if (!prescription) return null;

  const fileName = prescription.filePath
    ? prescription.filePath.split("/").pop()
    : `Prescription #${prescription.prescriptionId}`;

  return (
    <div className="delete-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="delete-header">
          <h5 className="delete-title">Delete Prescription</h5>
          <button className="delete-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="delete-body">
          <p className="delete-msg">Are you sure you want to delete</p>
          <p className="delete-target-name">{fileName}</p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>

        {/* Footer */}
        <div className="delete-footer">
          <button className="btn-keep" onClick={onClose} disabled={deleting}>
            Keep It
          </button>
          <button
            className="btn-confirm-delete"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}