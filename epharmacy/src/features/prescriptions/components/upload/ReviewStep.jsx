// features/prescriptions/components/upload/ReviewStep.jsx
import { useState } from "react";


export default function ReviewStep({ ocrResult, uploading, onSubmit, onBack }) {
  const [form, setForm] = useState({
    doctorName:        ocrResult.doctorName        || "",
    doctorRegisteredId: ocrResult.doctorRegisteredId || "",
    prescribedDate:    ocrResult.prescribedDate    || "",
    medicines: (ocrResult.medicines || []).length > 0
      ? ocrResult.medicines.map((m) => ({ ...m }))
      : [{ medicineName: "", dosage: "", duration: "" }],
  });

  const [errors, setErrors] = useState({});
  const [showRaw, setShowRaw] = useState(false);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setMed(i, key, val) {
    setForm((prev) => {
      const meds = [...prev.medicines];
      meds[i] = { ...meds[i], [key]: val };
      return { ...prev, medicines: meds };
    });
  }

  function addMed() {
    setForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: "", dosage: "", duration: "" }],
    }));
  }

  function removeMed(i) {
    setForm((prev) => {
      const meds = prev.medicines.filter((_, idx) => idx !== i);
      return { ...prev, medicines: meds.length ? meds : [{ medicineName: "", dosage: "", duration: "" }] };
    });
  }


  function validate() {
    const errs = {};
    if (!form.doctorName.trim())         errs.doctorName        = "Doctor name is required.";
    if (!form.doctorRegisteredId.trim()) errs.doctorRegisteredId = "Registration ID is required.";
    if (!form.prescribedDate)            errs.prescribedDate    = "Prescribed date is required.";
    if (new Date(form.prescribedDate) > new Date()) {
      errs.prescribedDate = "Date cannot be in the future.";
    }
    const medErrs = form.medicines.map((m) => ({
      medicineName: !m.medicineName.trim() ? "Medicine name required." : "",
      dosage:       !m.dosage.trim()       ? "Dosage required."        : "",
    }));
    const hasMedErr = medErrs.some((e) => e.medicineName || e.dosage);
    if (hasMedErr) errs.medicines = medErrs;
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      filePath:           ocrResult.filePath,
      doctorName:         form.doctorName.trim(),
      doctorRegisteredId: form.doctorRegisteredId.trim(),
      prescribedDate:     form.prescribedDate,
      medicines:          form.medicines.map((m) => ({
        medicineName: m.medicineName.trim(),
        dosage:       m.dosage.trim(),
        duration:     m.duration.trim(),
      })),
    });
  }

  const ocrConfidence = [
    ocrResult.doctorName,
    ocrResult.doctorRegisteredId,
    ocrResult.prescribedDate,
  ].filter(Boolean).length;

  return (
    <div className="upload-modal__review-step">

     
      <div className={`upload-modal__ocr-banner confidence-${ocrConfidence}`}>
        <span className="upload-modal__ocr-icon">
          {ocrConfidence === 3 ? "✅" : ocrConfidence >= 1 ? "⚠️" : "❌"}
        </span>
        <span>
          {ocrConfidence === 3
            ? "OCR extracted all fields — please verify before submitting."
            : ocrConfidence >= 1
            ? "OCR partially extracted data — fill in the missing fields."
            : "OCR could not extract data — please fill in all fields manually."}
        </span>
        <button
          className="upload-modal__raw-toggle"
          onClick={() => setShowRaw((v) => !v)}
          type="button"
        >
          {showRaw ? "Hide" : "Show"} raw text
        </button>
      </div>

     
      {showRaw && (
        <pre className="upload-modal__raw-text">{ocrResult.rawText || "(empty)"}</pre>
      )}

     
      <div className="upload-modal__section-title">Doctor Details</div>

      <div className="upload-modal__field-row">
        <div className="upload-modal__field">
          <label>Doctor Name *</label>
          <input
            type="text"
            value={form.doctorName}
            onChange={(e) => setField("doctorName", e.target.value)}
            placeholder="Dr. Firstname Lastname"
            className={errors.doctorName ? "field-error" : ""}
          />
          {errors.doctorName && (
            <span className="upload-modal__field-error">{errors.doctorName}</span>
          )}
        </div>

        <div className="upload-modal__field">
          <label>Doctor Registration ID *</label>
          <input
            type="text"
            value={form.doctorRegisteredId}
            onChange={(e) => setField("doctorRegisteredId", e.target.value)}
            placeholder="MCI-XXXX / Reg No."
            className={errors.doctorRegisteredId ? "field-error" : ""}
          />
          {errors.doctorRegisteredId && (
            <span className="upload-modal__field-error">{errors.doctorRegisteredId}</span>
          )}
        </div>
      </div>

      <div className="upload-modal__field">
        <label>Prescribed Date *</label>
        <input
          type="date"
          value={form.prescribedDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setField("prescribedDate", e.target.value)}
          className={errors.prescribedDate ? "field-error" : ""}
        />
        {errors.prescribedDate && (
          <span className="upload-modal__field-error">{errors.prescribedDate}</span>
        )}
      </div>

      {/* ── Medicines ── */}
      <div className="upload-modal__section-title">
        Medicines
        <button
          className="upload-modal__add-med-btn"
          type="button"
          onClick={addMed}
        >
          ＋ Add
        </button>
      </div>

      {form.medicines.map((med, i) => (
        <div key={i} className="upload-modal__med-row">
          <span className="upload-modal__med-num">{i + 1}</span>

          <div className="upload-modal__field upload-modal__med-name">
            <input
              type="text"
              value={med.medicineName}
              onChange={(e) => setMed(i, "medicineName", e.target.value)}
              placeholder="Medicine name"
              className={errors.medicines?.[i]?.medicineName ? "field-error" : ""}
            />
            {errors.medicines?.[i]?.medicineName && (
              <span className="upload-modal__field-error">
                {errors.medicines[i].medicineName}
              </span>
            )}
          </div>

          <div className="upload-modal__field upload-modal__med-dosage">
            <input
              type="text"
              value={med.dosage}
              onChange={(e) => setMed(i, "dosage", e.target.value)}
              placeholder="Dosage (e.g. 500mg)"
              className={errors.medicines?.[i]?.dosage ? "field-error" : ""}
            />
            {errors.medicines?.[i]?.dosage && (
              <span className="upload-modal__field-error">
                {errors.medicines[i].dosage}
              </span>
            )}
          </div>

          <div className="upload-modal__field upload-modal__med-duration">
            <input
              type="text"
              value={med.duration}
              onChange={(e) => setMed(i, "duration", e.target.value)}
              placeholder="Duration (e.g. 7 days)"
            />
          </div>

          {form.medicines.length > 1 && (
            <button
              className="upload-modal__remove-med-btn"
              type="button"
              onClick={() => removeMed(i)}
              title="Remove"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* ── Footer ── */}
      <div className="upload-modal__review-footer">
        <button
          className="upload-modal__back-btn"
          type="button"
          onClick={onBack}
          disabled={uploading}
        >
          ← Re-upload
        </button>

        <button
          className="upload-modal__submit-btn"
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <span className="upload-modal__spinner" />
          ) : (
            "✓ Submit Prescription"
          )}
        </button>
      </div>
    </div>
  );
}