import CartItem from "./CartItem";

export default function CartList({ items, onUpdateQty, onRemove, onSave }) {
  return (
    <div className="card p-3 shadow-sm">
      <h6 className="fw-bold mb-3">Items In Your Cart</h6>

      {items.map((item) => (
  <CartItem
    key={item.medicineId}   
    item={item}
    onUpdateQty={onUpdateQty}
    onRemove={onRemove}
    onSaveForLater={onSave}   
  />
))}
    </div>
  );
}