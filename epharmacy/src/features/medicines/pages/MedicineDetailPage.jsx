
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchMedicineById } from "../slices/medicineThunks";
import { addToCart, updateQty, removeItem } from "../../cart/slice/cartThunks";
import Toast from "../../admin/components/Toast";

import "../css/MedicineDetailPage.css";

export default function MedicineDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedMedicine: medicine, detailLoading, detailError } = useSelector(
    (s) => s.medicines
  );
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);

  const [localQty, setLocalQty] = useState(1);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const cartItem = items.find(
    (i) => i.medicineId === Number(id) && i.itemType === "cart"
  );
  const cartQty = cartItem?.quantity || 0;

  useEffect(() => {
    if (id) dispatch(fetchMedicineById(id));
  }, [dispatch, id]);

  function showToast(msg, type = "success") {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  }

  function handleAddToCart() {
    if (!isAuthenticated) {
      showToast("Please login to add to cart", "error");
      return;
    }
    dispatch(addToCart({ medicineId: Number(id), quantity: localQty }));
    showToast(`${localQty} × ${medicine.name} added to cart!`);
  }

  function handleCartPlus() {
    dispatch(updateQty({ medicineId: Number(id), quantity: cartQty + 1 }));
  }

  function handleCartMinus() {
    if (cartQty > 1) {
      dispatch(updateQty({ medicineId: Number(id), quantity: cartQty - 1 }));
    } else {
      dispatch(removeItem(Number(id)));
      showToast(`${medicine.name} removed from cart`, "error");
    }
  }

  // ── Loading state ──
  if (detailLoading) {
    return (
      <div className="detail-loading">
        <div className="spinner" />
        <p>Loading medicine details...</p>
      </div>
    );
  }

  // ── Error state ──
  if (detailError) {
    return (
      <div className="detail-error">
        <p>Failed to load medicine. Please try again.</p>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  if (!medicine) return null;

  // ── Price calculations (safe null guards) ──
  const mrpPrice   = medicine.price      ?? 0;
  const offerPrice = medicine.finalPrice ?? mrpPrice;
  const discount   = medicine.discount   ?? 0;
  const savedAmount = (mrpPrice - offerPrice).toFixed(2);

  return (
    <>
      <Toast show={toast.show} msg={toast.msg} type={toast.type} />

      <div className="container my-4">

        {/* Back button */}
        <button className="btn-back mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="row g-4">

          {/* ── LEFT: Product detail card ── */}
          <div className="col-lg-7">
            <div className="product-detail-card">
              <div className="product-detail-inner">

                {/* Product image */}
                <div className="product-img-box">
                  <img
                    src={medicine.imageUrl || "/assets/images/placeholder.png"}
                    alt={medicine.name}
                    id="mainProductImg"
                    onError={(e) => {
                      e.target.src = "/assets/images/placeholder.png";
                    }}
                  />
                </div>

                {/* Product info */}
                <div className="product-info">
                  <h5 className="product-title">{medicine.name}</h5>

                  {medicine.brand && (
                    <p className="product-brand">
                      <strong>Brand:</strong> {medicine.brand}
                    </p>
                  )}

                  {medicine.strength && (
                    <p className="product-strength">
                      <strong>Strength:</strong> {medicine.strength}
                    </p>
                  )}

                  {medicine.dosageForm && (
                    <p className="product-strength">
                      <strong>Dosage Form:</strong> {medicine.dosageForm}
                    </p>
                  )}

                  {/* Price row */}
                  <div className="price-row">
                    <span className="product-price">Rs.{offerPrice}</span>
                    {discount > 0 && (
                      <span className="product-mrp">Rs.{mrpPrice}</span>
                    )}
                    {discount > 0 && (
                      <span className="discount-badge">{discount}% OFF</span>
                    )}
                  </div>
                  <p className="inclusive-text">(Inclusive of all taxes)</p>

                  {/* Prescription required */}
                  {medicine.prescriptionRequired === true && (
                    <p className="rx-required">🩺 Prescription Required</p>
                  )}

                

                  {medicine.status === "available" && (
                    cartQty === 0 ? (
                      <>
                        <div className="qty-selector-detail d-flex align-items-center gap-3 mb-3">
                          <button
                            className="qty-btn-detail"
                            onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
                          >
                            −
                          </button>
                          <span className="qty-count-detail">{localQty}</span>
                          <button
                            className="qty-btn-detail"
                            onClick={() => setLocalQty((q) => q + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button className="btn-add-to-cart" onClick={handleAddToCart}>
                          ADD TO CART
                        </button>
                      </>
                    ) : (
                      <div className="qty-selector-detail d-flex align-items-center gap-3 mb-3">
                        <button className="qty-btn-detail" onClick={handleCartMinus}>−</button>
                        <span className="qty-count-detail">{cartQty}</span>
                        <button className="qty-btn-detail" onClick={handleCartPlus}>+</button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* ── Description section ── */}
              <div className="description-section">

                {medicine.description && (
                  <>
                    <h6 className="desc-heading">Description</h6>
                    <p className="desc-text">{medicine.description}</p>
                  </>
                )}

                {medicine.uses && (
                  <>
                    <h6 className="desc-heading mt-3">Uses</h6>
                    <p className="desc-text">{medicine.uses}</p>
                  </>
                )}

                {medicine.sideEffects && (
                  <>
                    <h6 className="desc-heading mt-3">Side Effects</h6>
                    <p className="desc-text">{medicine.sideEffects}</p>
                  </>
                )}

                {medicine.storageInstructions && (
                  <>
                    <h6 className="desc-heading mt-3">Storage Instructions</h6>
                    <p className="desc-text">{medicine.storageInstructions}</p>
                  </>
                )}

                {medicine.composition && (
                  <>
                    <h6 className="desc-heading mt-3">Composition</h6>
                    <p className="desc-text">{medicine.composition}</p>
                  </>
                )}

                {medicine.scheduleType && (
                  <p className="desc-text mt-2">
                    <strong>Schedule:</strong> {medicine.scheduleType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Product summary ── */}
          <div className="col-lg-5">
            <div className="summary-card">
              <h6 className="summary-title">PRODUCT SUMMARY</h6>
              <table className="summary-table">
                <tbody>

                  <tr>
                    <td className="summary-label">MRP</td>
                    <td className="summary-value">Rs.{mrpPrice}</td>
                  </tr>

                  <tr>
                    <td className="summary-label">Offer Price</td>
                    <td className="summary-value">Rs.{offerPrice}</td>
                  </tr>

                  {discount > 0 && (
                    <tr>
                      <td className="summary-label">Discount</td>
                      <td className="summary-value save-value">{discount}%</td>
                    </tr>
                  )}

                  {discount > 0 && (
                    <tr>
                      <td className="summary-label">You Save</td>
                      <td className="summary-value save-value">Rs.{savedAmount}</td>
                    </tr>
                  )}

                  {medicine.categoryName && (
                    <tr>
                      <td className="summary-label">Category</td>
                      <td className="summary-value">{medicine.categoryName}</td>
                    </tr>
                  )}

                  {medicine.taxPercentage != null && (
                    <tr>
                      <td className="summary-label">Tax</td>
                      <td className="summary-value">{medicine.taxPercentage}%</td>
                    </tr>
                  )}

                  <tr>
                    <td className="summary-label">Availability</td>
                    <td className="summary-value">
                      <span
                        className={
                          medicine.status === "AVAILABLE"
                            ? "status-available"
                            : "status-unavailable"
                        }
                      >
                        {medicine.status ?? "--"}
                      </span>
                    </td>
                  </tr>

                  {medicine.prescriptionRequired === true && (
                    <tr>
                      <td className="summary-label">Prescription</td>
                      <td className="summary-value">Required 🩺</td>
                    </tr>
                  )}

                </tbody>
              </table>

              <div className="d-flex gap-2 mt-3">
                <button className="btn-view-cart w-100" onClick={() => navigate("/cart")}>
                  VIEW CART
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}