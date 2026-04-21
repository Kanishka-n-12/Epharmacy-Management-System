import "../css/EmptyAddress.css";

export default function EmptyAddresses() {
  return (
    <div className="empty-addresses">
      <div className="icon">📍</div>
      <h6>No saved addresses</h6>
      <p>Add your first delivery address below.</p>
    </div>
  );
}