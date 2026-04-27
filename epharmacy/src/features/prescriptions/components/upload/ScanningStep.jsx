
export default function ScanningStep({ fileName, error, onRetry }) {
  if (error) {
    return (
      <div className="upload-modal__scanning-step">
        <div className="upload-modal__scan-error-icon"></div>
        <p className="upload-modal__scan-error-title">OCR Scan Failed</p>
        <p className="upload-modal__scan-error-body">{error}</p>
        <button className="upload-modal__retry-btn" onClick={onRetry}>
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="upload-modal__scanning-step">
      <div className="upload-modal__scan-animation">
        <div className="upload-modal__scan-doc">
          <div className="upload-modal__scan-beam" />
          <div className="upload-modal__scan-line" style={{ top: "20%" }} />
          <div className="upload-modal__scan-line" style={{ top: "35%" }} />
          <div className="upload-modal__scan-line" style={{ top: "50%" }} />
          <div className="upload-modal__scan-line" style={{ top: "65%" }} />
          <div className="upload-modal__scan-line short" style={{ top: "80%" }} />
        </div>
      </div>

      <p className="upload-modal__scan-title">Scanning prescription…</p>
      <p className="upload-modal__scan-file">{fileName}</p>
      <p className="upload-modal__scan-sub">
        Reading doctor details, medicines &amp; dates with OCR
      </p>
    </div>
  );
}