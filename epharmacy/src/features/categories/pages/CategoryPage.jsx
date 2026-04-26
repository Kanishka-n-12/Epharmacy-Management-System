import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, fetchMedicinesByCategory } from "../slices/categoryThunks";
import ProductGrid from "../../../components/ui/ProductGrid";
import HeroBanner from "../../home/components/HeroBanner";
import { useState } from "react"; 

export default function CategoryPage() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");

  const catSlug = searchParams.get("cat") || "";

  const categories       = useSelector((s) => s.categories.categories);
  const categoryMedicines = useSelector((s) => s.categories.categoryMedicines);
  const categoryLoading  = useSelector((s) => s.categories.categoryLoading);
  const categoryError    = useSelector((s) => s.categories.categoryError);

  
  function toSlug(name) {
    return (name || "").toLowerCase().replace(/\s+/g, "-");
  }

  const matchedCategory = categories?.find(
    (c) => (c.slug || toSlug(c.name)) === catSlug
  );

  const filtered = search.trim()
  ? categoryMedicines.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    )
  : categoryMedicines;

  
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch]);

 
  useEffect(() => {
    if (matchedCategory?.id) {
      dispatch(fetchMedicinesByCategory(matchedCategory.slug || toSlug(matchedCategory.name)));
    }
  }, [matchedCategory?.id, dispatch]);

 
  function toCardProps(medicine) {
    return {
      productId: medicine.id,       
    name:      medicine.name,
    desc:      medicine.description,
    price:     medicine.finalPrice,
    savings:   medicine.discount ?? 0,
    imageSrc:  medicine.imageUrl || "/assets/images/placeholder.webp",
    onCardClick: () => navigate(`/medicines/${medicine.id}`),
    };
  }

  function handleAddToCart(productId, qty) {
    const product = categoryMedicines.find((p) => p.id === productId);
    if (!product) return;
    dispatch(addOrUpdate({
      product: {
        id:          product.id,
        name:        product.name,
        description: product.description,
        price:       product.finalPrice,
        discount:    product.discount,
        image:       product.imageUrl,
      },
      qty,
    }));
  }

  function handleCardClick(productId) {
    navigate(`/medicines/${productId}`);
  }

  return (
  <div className="container my-5">

    <HeroBanner onSearch={setSearch} />

    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
      {matchedCategory?.name || catSlug} — Medicines
    </h3>

    {categoryLoading && (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-2 text-muted">Loading medicines...</p>
      </div>
    )}
    {categoryError && (
      <div className="alert alert-danger">
        Failed to load medicines: {categoryError}
      </div>
    )}

  
    {!categoryLoading && filtered.length === 0 && (
      <div className="text-center py-5">
        <div style={{ fontSize: "3rem" }}></div>
        <p className="text-muted mt-2">No medicines found in this category.</p>
      </div>
    )}

    
    {!categoryLoading && filtered.length > 0 && (
      <ProductGrid
        products={filtered.map(toCardProps)}
        onAddToCart={handleAddToCart}
        onUpdateQty={handleAddToCart}
        onRemove={(id) => dispatch(removeItem(id))}
        onCardClick={handleCardClick}
      />
    )}
  </div>
);
}