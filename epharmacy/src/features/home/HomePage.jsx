import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import HeroBanner from "./components/HeroBanner";
import PromoCarousel from "./components/PromoCarousel";
import ProductSection from "./components/ProductSection";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import NoResults from "./components/NoResults";
import ToastMessage from "../../components/ui/ToastMessage"

import { fetchNewLaunches } from "../medicines/slices/medicineThunks";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { newLaunches, loading, error } = useSelector((s) => s.medicines);

  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchNewLaunches());
  }, [dispatch]);

  const filtered = query.trim()
    ? newLaunches.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase())
      )
    : newLaunches;

  const firstFour = filtered.slice(0, 4);
  const lastFour = filtered.slice(4);

  function toCardProps(medicine) {
    return {
    productId: medicine.id,
    name: medicine.name,
    desc: medicine.description,
    price: medicine.finalPrice,
    savings: medicine.discount ?? 0,
    imageSrc: medicine.imageUrl,
    onCardClick: () => navigate(`/medicines/${medicine.id}`),
  };
  }

  return (  
    <>
      <HeroBanner onSearch={setQuery} />

      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}

      {!loading && firstFour.length > 0 && (
        <ProductSection
          title="VIEW MEDICINES TO PLACE ORDERS..."
          products={firstFour.map(toCardProps)}
        />
      )}

      {!query.trim() && <PromoCarousel />}

      {!loading && lastFour.length > 0 && (
        <ProductSection products={lastFour.map(toCardProps)} />
      )}

      {!loading && query.trim() && filtered.length === 0 && (
        <NoResults query={query} />
      )}

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
}