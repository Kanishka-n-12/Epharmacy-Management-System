export default function SavedItem({ item, onMoveToCart, onDelete }) {
  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      <img
        src={item.imageUrl || "/assets/images/placeholder.webp"}
        alt={item.medicineName}
        style={{ width: 60, height: 60, objectFit: "contain", borderRadius: 8, background: "#f8f8f8" }}
      />
      <div className="flex-grow-1">
        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.medicineName}</div>
        <div style={{ fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>₹{item.price?.toFixed(2)}</div>
        <div className="d-flex gap-2 mt-1">
          <button onClick={onMoveToCart} style={{
            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
            border: "1.5px solid #2e7d32", background: "#fff", color: "#2e7d32", cursor: "pointer"
          }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <polyline points="17 4 20 7 17 10" />
    <line x1="9" y1="7" x2="20" y2="7" />
  </svg></button>
          <button onClick={onDelete} style={{
            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
            border: "1.5px solid #e53935", background: "#fff", color: "#e53935", cursor: "pointer"
          }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg></button>
        </div>
      </div>
    </div>
  );
}