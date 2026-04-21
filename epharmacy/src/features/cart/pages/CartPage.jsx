import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchCart, fetchCartSummary,
  removeItem, updateQty,
  saveForLater, moveToCart, deleteSaved
} from "../slice/cartSlice";

import ProgressSteps from "../../deliveries/components/ProgressSteps";
import CartList from "../components/CartList";
import SavedList from "../components/SavedList";
import CartSummary from "../components/CartSummary";
import EmptyCart from "../components/EmptyCart";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, summary, loading, error } = useSelector((s) => s.cart);

  const cartItems  = items.filter(i => i.itemType?.toLowerCase() === "cart");
  const savedItems = items.filter(i => i.itemType?.toLowerCase() === "saved");

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchCartSummary());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" />
        <p className="mt-2 text-muted">Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">Failed to load cart: {error}</p>
        <button className="btn btn-outline-success mt-2" onClick={() => dispatch(fetchCart())}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">

      <ProgressSteps current={0} />

      <div className="row g-4">

        <div className="col-lg-7">

          {cartItems.length === 0 ? (
            <EmptyCart onBrowse={() => navigate("/medicines")} />
          ) : (
            <CartList
              items={cartItems}
              onUpdateQty={(id, qty) => dispatch(updateQty({ medicineId: id, quantity: qty }))}
              onRemove={(id) => dispatch(removeItem(id))}
              onSave={(id) => dispatch(saveForLater(id))}
            />
          )}

          {savedItems.length > 0 && (
            <SavedList
              items={savedItems}
              onMove={(id) => dispatch(moveToCart(id))}
              onDelete={(id) => dispatch(deleteSaved(id))}
            />
          )}

        </div>

        <div className="col-lg-5">
          <CartSummary
            summary={summary}
            disabled={cartItems.length === 0}
            onProceed={() => navigate("/delivery")}
          />
        </div>

      </div>

      <div className="mt-4">
        <button
          className="btn btn-outline-success"
          onClick={() => navigate("/medicines")}
        >
          CONTINUE SHOPPING
        </button>
      </div>

    </div>
  );
}