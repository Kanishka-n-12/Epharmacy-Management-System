export default function ErrorState({ error }) {
  return (
    <div className="container my-3">
      <div className="alert alert-danger">
        Failed to load medicines: {error}
      </div>
    </div>
  );
}