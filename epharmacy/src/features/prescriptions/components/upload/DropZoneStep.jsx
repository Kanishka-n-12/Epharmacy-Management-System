// features/prescriptions/components/upload/DropZoneStep.jsx
import { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_MB = 20;

/**
 * Step 1 — drag-and-drop / click-to-browse file picker.
 *
 * Props:
 *   onFile(file: File) — called when a valid file is chosen
 */
export default function DropZoneStep({ onFile }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  function validate(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Only JPG, PNG, WEBP or PDF files are accepted.");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be smaller than ${MAX_SIZE_MB} MB.`);
      return false;
    }
    setFileError("");
    return true;
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && validate(file)) onFile(file);
  }

  function handleChange(e) {
    const file = e.target.files[0];
    if (file && validate(file)) onFile(file);
  }

  return (
    <div className="upload-modal__dropzone-step">
      <div
        className={`upload-modal__dropzone ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          style={{ display: "none" }}
          onChange={handleChange}
        />

        <div className="upload-modal__dropzone-icon">📋</div>
        <p className="upload-modal__dropzone-title">
          Drop your prescription here
        </p>
        <p className="upload-modal__dropzone-sub">
          or <span className="upload-modal__browse-link">browse files</span>
        </p>
        <p className="upload-modal__dropzone-hint">
          JPG · PNG · WEBP · PDF &nbsp;|&nbsp; Max {MAX_SIZE_MB} MB
        </p>
      </div>

      {fileError && (
        <p className="upload-modal__field-error">{fileError}</p>
      )}
    </div>
  );
}