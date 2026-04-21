export default function LoadingState() {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-success" role="status" />
      <p className="mt-2 text-muted">Loading medicines...</p>
    </div>
  );
}