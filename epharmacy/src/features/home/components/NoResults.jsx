export default function NoResults({ query }) {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: "3rem" }}>🔍</div>
      <p className="text-muted mt-2" style={{ fontSize: 14 }}>
        No products found for <strong>"{query}"</strong>
      </p>
    </div>
  );
}