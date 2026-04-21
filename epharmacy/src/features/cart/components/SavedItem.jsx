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
          }}>MOVE TO CART</button>
          <button onClick={onDelete} style={{
            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
            border: "1.5px solid #e53935", background: "#fff", color: "#e53935", cursor: "pointer"
          }}>REMOVE ✕</button>
        </div>
      </div>
    </div>
  );
}