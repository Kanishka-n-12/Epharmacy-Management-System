import SavedItem from "./SavedItem";

export default function SavedList({ items, onMove, onDelete }) {
  if (items.length === 0) return null;

  return (
    <>
      <div className="mt-4">Saved for Later ({items.length})</div>

      {items.map((item, idx) => (
        <SavedItem
          key={idx}
          item={item}
          onMoveToCart={() => onMove(item.medicineId)}
          onDelete={() => onDelete(item.medicineId)}
        />
      ))}
    </>
  );
}