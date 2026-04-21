import { createPortal } from "react-dom";
import "./css/Modal.css";

export default function Modal({ title, titleColor, onClose, size = "md", children }) {
  return createPortal(
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className={`admin-modal admin-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <span
            className="admin-modal-title-txt"
            style={titleColor ? { color: titleColor } : {}}
          >
            {title}
          </span>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}