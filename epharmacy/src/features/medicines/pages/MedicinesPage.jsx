

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchAllMedicines }   from "../slices/medicineThunks";
import ProductGrid             from "../../../components/ui/ProductGrid";
import HeroBanner              from "../../home/components/HeroBanner";

export default function MedicinesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { allMedicines, loading, error } = useSelector((s) => s.medicines);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllMedicines(search || undefined));
  }, [search, dispatch]);

  function toCardProps(medicine) {
    return {
      productId:   medicine.id,
      name:        medicine.name,
      desc:        medicine.description,
      price:       medicine.finalPrice,
      savings:     medicine.discount ?? 0,
      imageSrc:    medicine.imageUrl || "/assets/images/placeholder.webp",
      onCardClick: () => navigate(`/medicines/${medicine.id}`),
    };
  }

  return (
    <div className="container my-5">

      <HeroBanner onSearch={setSearch} />

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
        All Available Medicines
      </h3>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-2 text-muted">Loading medicines...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          Failed to load medicines: {error}
        </div>
      )}

      {!loading && allMedicines.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: "3rem" }}>🔍</div>
          <p className="text-muted mt-2">
            No medicines found {search && <span>for <strong>"{search}"</strong></span>}
          </p>
        </div>
      )}

      {!loading && allMedicines.length > 0 && (
        <ProductGrid products={allMedicines.map(toCardProps)} />
      )}

    </div>
  );
} 