export default function EmptyCart({ onBrowse }) {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: 48 }}>🛒</div>
      <h5>Your cart is empty!</h5>
      <button className="btn btn-success mt-2" onClick={onBrowse}>
        BROWSE MEDICINES
      </button>
    </div>
  );
}