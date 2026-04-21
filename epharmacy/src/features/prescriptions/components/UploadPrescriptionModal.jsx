// features/prescriptions/components/UploadPrescriptionModal.jsx
import { useState } from "react";

const EMPTY_FORM = {
  doctorName: "",
  doctorRegisteredId: "",
  prescribedDate: "",
  filePath: "",
  medicines: [{ medicineName: "", dosage: "", duration: "" }],
};

export default function UploadPrescriptionModal({ onSubmit, onClose, uploading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ── Field handlers ── */
  function handleField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  }

  function handleMedicine(index, e) {
    const { name, value } = e.target;
    setForm((f) => {
      const meds = [...f.medicines];
      meds[index] = { ...meds[index], [name]: value };
      return { ...f, medicines: meds };
    });
  }

  function addMedicine() {
    setForm((f) => ({
      ...f,
      medicines: [...f.medicines, { medicineName: "", dosage: "", duration: "" }],
    }));
  }

  function removeMedicine(index) {
    setForm((f) => ({
      ...f,
      medicines: f.medicines.filter((_, i) => i !== index),
    }));
  }

  /* ── Validation ── */
  function validate() {
    const e = {};
    if (!form.doctorName.trim()) e.doctorName = "Doctor name is required";
    if (!form.doctorRegisteredId.trim()) e.doctorRegisteredId = "Doctor registration ID is required";
    if (!form.prescribedDate) e.prescribedDate = "Prescribed date is required";
    if (form.prescribedDate && new Date(form.prescribedDate) > new Date())
      e.prescribedDate = "Prescribed date cannot be in the future";
    if (!form.filePath.trim()) e.filePath = "File URL / path is required";
    const hasMed = form.medicines.some((m) => m.medicineName.trim());
    if (!hasMed) e.medicines = "At least one medicine name is required";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const dto = {
      doctorName: form.doctorName.trim(),
      doctorRegisteredId: form.doctorRegisteredId.trim(),
      prescribedDate: form.prescribedDate,
      filePath: form.filePath.trim(),
      medicines: form.medicines
        .filter((m) => m.medicineName.trim())
        .map((m) => ({
          medicineName: m.medicineName.trim(),
          dosage: m.dosage.trim() || null,
          duration: m.duration.trim() || null,
        })),
    };

    onSubmit(dto);
  }

  return (
    <div className="rx-overlay" onClick={onClose}>
      <div className="rx-upload-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="rx-modal-header">
          <h5 className="rx-modal-title">Upload Prescription</h5>
          <button className="rx-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="rx-modal-body rx-upload-body">

          {/* Doctor Info */}
          <p className="rx-modal-section-title">Doctor Details</p>
          <div className="rx-form-grid">
            <div className="rx-form-group">
              <label>Doctor Name <span className="rx-required">*</span></label>
              <input
                name="doctorName"
                value={form.doctorName}
                onChange={handleField}
                placeholder="e.g. Dr. Priya Sharma"
                className={errors.doctorName ? "rx-input error" : "rx-input"}
              />
              {errors.doctorName && <span className="rx-err">{errors.doctorName}</span>}
            </div>

            <div className="rx-form-group">
              <label>Registration ID <span className="rx-required">*</span></label>
              <input
                name="doctorRegisteredId"
                value={form.doctorRegisteredId}
                onChange={handleField}
                placeholder="e.g. MCI-12345"
                className={errors.doctorRegisteredId ? "rx-input error" : "rx-input"}
              />
              {errors.doctorRegisteredId && (
                <span className="rx-err">{errors.doctorRegisteredId}</span>
              )}
            </div>

            <div className="rx-form-group">
              <label>Prescribed Date <span className="rx-required">*</span></label>
              <input
                type="date"
                name="prescribedDate"
                value={form.prescribedDate}
                onChange={handleField}
                max={new Date().toISOString().split("T")[0]}
                className={errors.prescribedDate ? "rx-input error" : "rx-input"}
              />
              {errors.prescribedDate && (
                <span className="rx-err">{errors.prescribedDate}</span>
              )}
            </div>

            <div className="rx-form-group">
              <label>File URL / Path <span className="rx-required">*</span></label>
              <input
                name="filePath"
                value={form.filePath}
                onChange={handleField}
                placeholder="https://... or cloudinary URL"
                className={errors.filePath ? "rx-input error" : "rx-input"}
              />
              {errors.filePath && <span className="rx-err">{errors.filePath}</span>}
            </div>
          </div>

          {/* Medicines */}
          <div className="rx-medicines-header">
            <p className="rx-modal-section-title" style={{ margin: 0 }}>
              Medicines <span className="rx-required">*</span>
            </p>
            <button type="button" className="rx-btn-add-med" onClick={addMedicine}>
              + Add Medicine
            </button>
          </div>
          {errors.medicines && <span className="rx-err">{errors.medicines}</span>}

          {form.medicines.map((med, i) => (
            <div key={i} className="rx-medicine-row">
              <div className="rx-medicine-fields">
                <input
                  name="medicineName"
                  value={med.medicineName}
                  onChange={(e) => handleMedicine(i, e)}
                  placeholder="Medicine name *"
                  className="rx-input"
                />
                <input
                  name="dosage"
                  value={med.dosage}
                  onChange={(e) => handleMedicine(i, e)}
                  placeholder="Dosage (optional)"
                  className="rx-input"
                />
                <input
                  name="duration"
                  value={med.duration}
                  onChange={(e) => handleMedicine(i, e)}
                  placeholder="Duration (optional)"
                  className="rx-input"
                />
              </div>
              {form.medicines.length > 1 && (
                <button
                  type="button"
                  className="rx-btn-remove-med"
                  onClick={() => removeMedicine(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="rx-modal-footer">
          <button className="rx-btn-cancel-modal" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button className="rx-btn-upload-submit" onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}