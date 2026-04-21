
import "./css/Pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = "items",
}) {
  const safePage = Math.min(currentPage, totalPages);

  const startItem = totalItems ? (safePage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  return (
    <div className="pagination-bar">
      <span className="pg-info">
        Showing {startItem}–{endItem} of {totalItems} {itemLabel}
      </span>

      <div className="pg-btns">
       
        <button
          className="pg-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          ‹
        </button>

        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}