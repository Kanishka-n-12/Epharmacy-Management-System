
import "./css/Pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "items",
}) {
  const safeTotalPages = totalPages || 1;
  const safePage = Math.min(Math.max(currentPage || 1, 1), safeTotalPages);
  const safeTotalItems = totalItems || 0;

  const startItem = safeTotalItems ? (safePage - 1) * itemsPerPage + 1 : 0;
  const endItem   = Math.min(safePage * itemsPerPage, safeTotalItems);

  return (
    <div className="pagination-bar">
      <span className="pg-info">
        Showing {startItem}–{endItem} of {safeTotalItems} {itemLabel}
      </span>

      <div className="pg-btns">
        <button
          className="pg-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          ‹
        </button>

        {Array.from({ length: safeTotalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={`pg-btn${n === safePage ? " active" : ""}`}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        ))}

        <button
          className="pg-btn"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}