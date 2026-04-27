// features/prescriptions/components/UploadPrescriptionModal.jsx
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { scanPrescription, } from "../slices/prescriptionThunks";
import { clearOcrResult} from "../slices/prescriptionSlice";
import DropZoneStep  from "./upload/DropZoneStep";
import ScanningStep  from "./upload/ScanningStep";
import ReviewStep    from "./upload/ReviewStep";

import "../css/UploadPrescriptionModal.css"

/**
 * Three-step modal:
 *  1. DropZone   — user drops / selects file
 *  2. Scanning   — OCR in progress (or error)
 *  3. Review     — pre-filled editable form
 *
 * Props:
 *   onSubmit(dto)  — called with the final PrescriptionRequestDTO
 *   onClose()      — close the modal
 *   uploading      — boolean from redux (final submit in progress)
 */
export default function UploadPrescriptionModal({ onSubmit, onClose, uploading }) {
  const dispatch = useDispatch();
  const { scanning, ocrResult, scanError } = useSelector(
    (s) => s.userPrescriptions
  );
  const overlayRef = useRef(null);

  /* Clear OCR state when modal unmounts */
  useEffect(() => {
    return () => dispatch(clearOcrResult());
  }, [dispatch]);

  /* Close on overlay click */
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  /* Step 1 → 2: user picked a file */
  function handleFile(file) {
    dispatch(scanPrescription(file));
  }

  /* Error retry → back to step 1 */
  function handleRetry() {
    dispatch(clearOcrResult());
  }

  /* Determine which step to show */
  const step = ocrResult ? "review" : scanning || scanError ? "scanning" : "drop";

  return (
    <div
      className="upload-modal__overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="upload-modal__dialog" role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className="upload-modal__header">
          <div className="upload-modal__header-left">
            <div>
              <h2 className="upload-modal__title">Upload Prescription</h2>
              <p className="upload-modal__subtitle">
                {step === "drop"     && "Upload an image or PDF — we'll scan it automatically."}
                {step === "scanning" && "Scanning your prescription with OCR…"}
                {step === "review"   && "Review the extracted data before submitting."}
              </p>
            </div>
          </div>

          <button
            className="upload-modal__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <div className="upload-modal__steps">
          {["Upload", "Scan", "Review"].map((label, i) => {
            const stepNum = i + 1;
            const currentNum =
              step === "drop" ? 1 : step === "scanning" ? 2 : 3;
            const done = currentNum > stepNum;
            const active = currentNum === stepNum;
            return (
              <div
                key={label}
                className={`upload-modal__step ${active ? "active" : ""} ${done ? "done" : ""}`}
              >
                <div className="upload-modal__step-circle">
                  {done ? "✓" : stepNum}
                </div>
                <span className="upload-modal__step-label">{label}</span>
                {i < 2 && <div className="upload-modal__step-connector" />}
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="upload-modal__body">
          {step === "drop" && (
            <DropZoneStep onFile={handleFile} />
          )}

          {step === "scanning" && (
            <ScanningStep
              fileName="your file"
              error={scanError}
              onRetry={handleRetry}
            />
          )}

          {step === "review" && (
            <ReviewStep
              ocrResult={ocrResult}
              uploading={uploading}
              onSubmit={onSubmit}
              onBack={handleRetry}
            />
          )}
        </div>

      </div>
    </div>
  );
}