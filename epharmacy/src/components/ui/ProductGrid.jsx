import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  onAddToCart,
  onUpdateQty,
  onRemove,
  onCardClick,
}) {
  return (
    <div className="row g-4 justify-content-center">
      {products.map((p, index) => {
        const key = p.productId != null ? p.productId : `fallback-${index}`;
        
        if (p.productId == null) {
          console.warn("ProductGrid: item at index", index, "has no id →", p);
          
        }

        return (
          <div key={key} className="col-6 col-md-3">
            <ProductCard
              productId={p.productId}
              name={p.name}
              desc={p.desc}
              price={p.price}
              savings={p.savings}
              imageSrc={p.imageSrc}
              onAddToCart={onAddToCart}
              onUpdateQty={onUpdateQty}
              onRemove={onRemove}
              onCardClick={p.onCardClick}
            />
          </div>
        );
      })}
    </div>
  );
}