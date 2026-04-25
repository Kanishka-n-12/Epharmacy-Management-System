import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
  clearAddressMessages,
} from "../slice/addressSlice";

import {  placeOrder } from "../../cart/slice/cartThunks"

import {setPendingOrderId} from "../../cart/slice/cartSlice"


import ProgressSteps   from "../components/ProgressSteps";
import AddressCard      from "../components/AddressCard";
import EmptyAddresses   from "../components/EmptyAddress";
import AddressModal     from "../components/AddressModal";
import OrderSummary     from "../components/OrderSummary";

import "./DeliveryPage.css";

export default function DeliveryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addresses, loading, submitting, error, successMessage } =
    useSelector((s) => s.address);
  const summary = useSelector((s) => s.cart.summary);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast,      setToast]      = useState(null);

  /* ── Fetch on mount ── */
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      dispatch(clearAddressMessages());
      setModalOpen(false);
      setEditTarget(null);
    }
    if (error) {
      showToast(error, "error");
      dispatch(clearAddressMessages());
    }
  }, [successMessage, error, dispatch]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal  = () => { setEditTarget(null); setModalOpen(true); };
  const openEditModal = (addr) => { setEditTarget(addr); setModalOpen(true); };
  const closeModal    = () => { setModalOpen(false); setEditTarget(null); };

  const handleSelect = (addr) => {
    if (!addr.isSelected) dispatch(selectAddress(addr.addressId));
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this address?")) dispatch(deleteAddress(id));
  };

  const handleProceed = async () => {
  if (!selectedAddr) {
    showToast("Please select a delivery address.", "error");
    return;
  }

  try {
    console.log("=== STEP 1: Starting place order ===");
    console.log("Selected address:", selectedAddr);

    const result = await dispatch(
      placeOrder({ addressId: selectedAddr.addressId })
    ).unwrap();

    console.log("=== STEP 2: Order success ===");
    console.log("Full result:", result);
    dispatch(setPendingOrderId(result.orderId));
    navigate("/payments");

  } catch (err) {
    console.log("=== STEP 3: Order FAILED ===");
    console.log("Error object:", err);
    console.log("Error message:", err?.message);
    console.log("Error status:", err?.status);
    showToast(err?.message || String(err) || "Failed to place order.", "error");
  }
};

  const selectedAddr = addresses.find((a) => a.isSelected);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="mt-2 text-muted">Loading addresses...</p>
      </div>
    );

  return (
    <div className="delivery-page">
      <div className="container">

        <ProgressSteps current={1} />

        <button className="btn-back" onClick={() => navigate("/cart")}>
          ← Back to Cart
        </button>

        <div className="delivery-grid">

          {/* ── Left column: address list ── */}
          <div>
            <div className="dp-card">
              <p className="dp-section-title">Select Delivery Address</p>

              {addresses.length === 0 ? (
                <EmptyAddresses />
              ) : (
                addresses.map((addr) => (
                  <AddressCard
                    key={addr.addressId}
                    addr={addr}
                    onSelect={() => handleSelect(addr)}
                    onEdit={() => openEditModal(addr)}
                    onDelete={() => handleDelete(addr.addressId)}
                  />
                ))
              )}

              {addresses.length < 10 && (
                <button className="btn-add-address" onClick={openAddModal}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
                  ADD NEW ADDRESS
                </button>
              )}
            </div>
          </div>

          <div className="summary-panel">
            <OrderSummary
              summary={summary}
              selectedAddr={selectedAddr}
              submitting={submitting}
              onProceed={handleProceed}
            />
          </div>

        </div>
      </div>

      {modalOpen && (
        <AddressModal
          initial={editTarget}
          submitting={submitting}
          onClose={closeModal}
          onSave={(dto) => {
            if (editTarget) {
              dispatch(updateAddress({ id: editTarget.addressId, dto }));
            } else {
              dispatch(createAddress(dto));
            }
          }}
        />
      )}

      {toast && (
        <div className={`dp-toast ${toast.type === "error" ? "error" : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}