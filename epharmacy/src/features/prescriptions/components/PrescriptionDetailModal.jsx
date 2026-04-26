import { useEffect, useState } from "react";
import PrescriptionStatusBadge from "./PrescriptionStatusBadge";
import api from "../../../api";

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

  const [fileObjectUrl, setFileObjectUrl] = useState(null);
  const [fileLoading,   setFileLoading]   = useState(false);
  const [fileError,     setFileError]     = useState(false);

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filePath || "");
  const isPdf   = /\.pdf$/i.test(filePath || "");

  useEffect(() => {
    if (!filePath) return;
    setFileLoading(true);
    setFileError(false);
    api
      .get(`/prescriptions/${prescriptionId}/file`, { responseType: "blob" })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        setFileObjectUrl(url);
      })
      .catch(() => setFileError(true))
      .finally(() => setFileLoading(false));

    return () => {
      if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    };
  }, [prescriptionId]);

  const formattedUpload = uploadedDate
    ? new Date(uploadedDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  const formattedPrescribed = prescribedDate
    ? new Date(prescribedDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

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

          {!filePath ? (
            <div className="rx-pdf-preview">
              <span style={{ fontSize: 40 }}>📎</span>
              <span className="rx-pdf-name">No file attached</span>
            </div>

          ) : fileLoading ? (
            <div className="rx-pdf-preview">
              <span style={{ fontSize: 32 }}>⏳</span>
              <span className="rx-pdf-name">Loading file…</span>
            </div>

          ) : fileError ? (
            <div className="rx-pdf-preview">
              <span style={{ fontSize: 32 }}>⚠️</span>
              <span className="rx-pdf-name">Could not load file.</span>
            </div>

          ) : isImage ? (
            <div className="rx-preview-wrap">
              <img
                src={fileObjectUrl}
                alt="Prescription"
                className="rx-preview-img"
              />
            </div>

          ) : isPdf ? (
            <div className="rx-pdf-preview">
              <iframe
                src={fileObjectUrl}
                title="Prescription PDF"
                style={{
                  width: "100%", height: 420,
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                }}
              />
            </div>

          ) : (
            <div className="rx-pdf-preview">
              <span style={{ fontSize: 40 }}>📄</span>
              <span className="rx-pdf-name">{filePath.split("/").pop()}</span>
              {fileObjectUrl && (
                <a
                  href={fileObjectUrl}
                  download={filePath.split("/").pop()}
                  className="rx-download-link"
                >
                  Download ↓
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