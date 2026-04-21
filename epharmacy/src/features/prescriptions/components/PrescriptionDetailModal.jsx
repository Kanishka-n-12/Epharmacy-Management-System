// features/prescriptions/components/PrescriptionDetailModal.jsx
import PrescriptionStatusBadge from "./PrescriptionStatusBadge";

export default function PrescriptionDetailModal({ prescription, onClose }) {
  if (!prescription) return null;

  const {
    prescriptionId,
    filePath,
    doctorName,
    doctorRegisteredId,
    uploadedDate,
    prescribedDate,
    approvalStatus,
    medicines = [],
  } = prescription;

  const formattedUpload = uploadedDate
    ? new Date(uploadedDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const formattedPrescribed = prescribedDate
    ? new Date(prescribedDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filePath || "");

  return (
    <div className="rx-overlay" onClick={onClose}>
      <div className="rx-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="rx-modal-header">
          <div>
            <h5 className="rx-modal-title">
              Prescription #{String(prescriptionId).padStart(6, "0")}
            </h5>
            <div className="rx-modal-meta">
              <span>Uploaded: {formattedUpload}</span>
              <PrescriptionStatusBadge status={approvalStatus} />
            </div>
          </div>
          <button className="rx-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="rx-modal-body">

          {/* Doctor Info */}
          <p className="rx-modal-section-title">Doctor Information</p>
          <div className="rx-detail-grid">
            <div className="rx-detail-row">
              <span className="rx-detail-label">Doctor Name</span>
              <span className="rx-detail-value">{doctorName || "—"}</span>
            </div>
            <div className="rx-detail-row">
              <span className="rx-detail-label">Registration ID</span>
              <span className="rx-detail-value">{doctorRegisteredId || "—"}</span>
            </div>
            <div className="rx-detail-row">
              <span className="rx-detail-label">Prescribed On</span>
              <span className="rx-detail-value">{formattedPrescribed}</span>
            </div>
          </div>

          {/* File Preview */}
          <p className="rx-modal-section-title" style={{ marginTop: 18 }}>
            Prescription File
          </p>
          {isImage && filePath ? (
            <div className="rx-preview-wrap">
              <img
                src={filePath}
                alt="Prescription"
                className="rx-preview-img"
              />
              <a href={filePath} target="_blank" rel="noreferrer" className="rx-download-link">
                Open in new tab ↗
              </a>
            </div>
          ) : (
            <div className="rx-pdf-preview">
              <span style={{ fontSize: 40 }}>📄</span>
              <span className="rx-pdf-name">
                {filePath ? filePath.split("/").pop() : "No file attached"}
              </span>
              {filePath && (
                <a href={filePath} target="_blank" rel="noreferrer" className="rx-download-link">
                  Open / Download ↗
                </a>
              )}
            </div>
          )}

          {/* Medicines */}
          {medicines.length > 0 && (
            <>
              <p className="rx-modal-section-title" style={{ marginTop: 18 }}>
                Medicines Listed
              </p>
              <div className="rx-medicines-table-wrap">
                <table className="rx-medicines-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{m.medicineName}</td>
                        <td>{m.dosage || "—"}</td>
                        <td>{m.duration || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}