import "../css/AddressCard.css";

export default function AddressCard({ addr, onSelect, onEdit, onDelete }) {
  const typeCls =
    addr.addressType?.toLowerCase() === "home"
      ? "HOME"
      : addr.addressType?.toLowerCase() === "work"
      ? "WORK"
      : "OTHER";

  return (
    <div
      className={`addr-card ${addr.isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
     
      <div className="selected-check">
        <svg viewBox="0 0 16 16">
          <polyline points="2,8 6,13 14,4" />
        </svg>
      </div>

      <div className="addr-card-header">
        <div className="addr-radio">
          <div className="addr-radio-dot" />
        </div>

        <div className="addr-info">
          <div className="addr-name-row">
            <span className="addr-name">{addr.name}</span>
            <span className={`addr-type-badge ${typeCls}`}>
              {addr.addressType}
            </span>
          </div>
          <div className="addr-phone">{addr.phone}</div>
          <div className="addr-line">{addr.line}</div>
          <div className="addr-pincode">
            {addr.city}, {addr.state} – {addr.pincode}
          </div>
        </div>
      </div>

      
      <div className="addr-actions" onClick={(e) => e.stopPropagation()}>
        <button className="addr-btn edit" onClick={onEdit}>
          ✎ EDIT
        </button>
        <button className="addr-btn remove" onClick={onDelete}>
          ✕ REMOVE
        </button>
      </div>
    </div>
  );
}