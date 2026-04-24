export default function CartItem({ item, onUpdateQty, onRemove, onSaveForLater }) {
  return (
    <div className="d-flex align-items-start gap-3 py-3 border-bottom">
      <div style={{
        width: 80, height: 80, borderRadius: 8,
        background: "#f9f9f9", border: "1px solid #eee",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0
      }}>
        <img
          src={item.imageUrl || "/assets/images/placeholder.webp"}
          alt={item.medicineName}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div className="flex-grow-1">
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>
          {item.medicineName}
        </div>
        {item.composition && (
          <div style={{ fontSize: 12, color: "#888" }}>{item.composition}</div>
        )}
        <div className="d-flex align-items-center gap-2 mt-1">
          <span style={{ fontSize: 15, fontWeight: 700 }}>₹{item.price?.toFixed(2)}</span>
          {item.discountPercentage > 0 && (
            <span style={{
              background: "#e8f5e9", color: "#2e7d32",
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20
            }}>{item.discountPercentage}% OFF</span>
          )}
        </div>

       
        <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
        
          <div className="d-flex align-items-center gap-2">
            <button
  onClick={() =>
    item.quantity > 1
      ? onUpdateQty(item.medicineId, item.quantity - 1)
      : onRemove(item.medicineId)
  }
  style={{
    width: 28, height: 28, borderRadius: "50%",
    border: "1.5px solid #2e7d32", background: "#fff",
    color: "#2e7d32", fontWeight: 700, cursor: "pointer"
  }}
>
  −
</button>

<span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>
  {item.quantity}
</span>

<button
  onClick={() => onUpdateQty(item.medicineId, item.quantity + 1)}
  style={{
    width: 28, height: 28, borderRadius: "50%",
    border: "1.5px solid #2e7d32", background: "#fff",
    color: "#2e7d32", fontWeight: 700, cursor: "pointer"
  }}
>
  +
</button>
          </div>

          <button onClick={() => onRemove(item.medicineId)} style={{
            fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6,
            border: "1px solid #e53935", background: "#fff", color: "#e53935", cursor: "pointer"
          }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg></button>

          <button onClick={() => onSaveForLater(item.medicineId)} style={{
            fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
            border: "1.5px solid #1565c0", background: "#fff", color: "#1565c0", cursor: "pointer"
          }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg></button>
        </div>
      </div>
    </div>
  );
}
