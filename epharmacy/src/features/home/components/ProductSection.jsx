import ProductGrid from "../../../components/ui/ProductGrid";

export default function ProductSection({ title, products }) {
  return (
    <section className="container my-5">
      {title && (
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginTop: 30,
            marginBottom: 20,
          }}
        >
          {title}
        </h3>
      )}

      <ProductGrid products={products} />
    </section>
  );
}