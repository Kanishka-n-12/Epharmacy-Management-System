import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, updateQty, removeItem } from "../../features/cart/slice/cartThunks";
import Toast from "../../features/admin/components/Toast";

export default function ProductCard({
  productId,
  name,
  desc,
  price,
  savings,
  imageSrc,
  onCardClick
}) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);

  const cartItem = items.find(

    (i) => i.medicineId === productId && i.itemType === "cart"
  );
  const qty = cartItem?.quantity || 0;

  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  function showToast(msg, type = "success") {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type }), 3000);
  }

  function handleAdd() {
    if (!isAuthenticated) {
      showToast("Please login to add to cart", "error");
      return;
    }
    dispatch(addToCart({ medicineId: productId, quantity: 1 }));
    showToast(`${name} added to cart!`);
  }

  function handlePlus() {
    dispatch(updateQty({ medicineId: productId, quantity: qty + 1 }));
  }

  function handleMinus() {
    if (qty > 1) {
      dispatch(updateQty({ medicineId: productId, quantity: qty - 1 }));
    } else {
      dispatch(removeItem(productId));
      showToast(`${name} removed from cart`, "error");
    }
  }

  

  return (
    <>
      <Toast show={toast.show} msg={toast.msg} type={toast.type} />

      <div className="card product-card">
        <div
          className="img-container"
          onClick={() => onCardClick?.(productId)}
          style={{ cursor: onCardClick ? "pointer" : "default" }}
        >
          <img src={imageSrc} alt={name} />
        </div>
        <div className="card-body">
          <h6>{name}</h6>
          {desc && <p className="desc">{desc}</p>}
          <p className="price">
            Rs.{price} <span className="savings">(save upto {savings}%)</span>
          </p>
          <div className="qty-cart-wrapper">
            {qty > 0 ? (
              <div className="qty-selector">
                <button className="qty-btn minus" onClick={handleMinus}>−</button>
                <span className="qty-count">{qty}</span>
                <button className="qty-btn plus" onClick={handlePlus}>+</button>
              </div>
            ) : (
              <button className="btn btn-add-cart" onClick={handleAdd}>
                ADD TO CART
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}