
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  fetchOrders,
  cancelOrder,
  clearCancelMessages,
} from "../slices/orderSlice";

import ProfileSidebar from "../../users/components/ProfileSidebar";
import LoadingState from "../../home/components/LoadingState";
import ErrorState from "../../home/components/ErrorState";
import OrderFilters from "../components/OrderFilters";
import OrderCard from "../components/OrderCard";
import OrderDetailModal from "../components/OrderDetailModel";
import CancelConfirmModal from "../components/CancelConfirmModel";
import EmptyOrders from "../components/EmptyOrders";

import "../css/MyOrders.css";

export default function MyOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error, cancelling, cancelSuccess, cancelError } =
    useSelector((s) => s.orders);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [detailOrder, setDetailOrder] = useState(null);   
  const [cancelTarget, setCancelTarget] = useState(null); 

  
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

 
  useEffect(() => {
    if (cancelSuccess) {
      toast.success(cancelSuccess);
      dispatch(clearCancelMessages());
    }
    if (cancelError) {
      toast.error("Failed to cancel order. Please try again.");
      dispatch(clearCancelMessages());
    }
  }, [cancelSuccess, cancelError, dispatch]);


  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "ALL" ||
        o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

      const matchDate =
        !dateFilter ||
        (o.orderDate && o.orderDate.startsWith(dateFilter)); 

      return matchStatus && matchDate;
    });
  }, [orders, statusFilter, dateFilter]);

 
  function handleFilterChange(type, value) {
    if (type === "status") setStatusFilter(value);
    if (type === "date")   setDateFilter(value);
  }

  function handleCancelConfirm() {
    if (!cancelTarget) return;
    dispatch(cancelOrder(cancelTarget.orderId)).then(() => {
      setCancelTarget(null);
      if (detailOrder?.orderId === cancelTarget.orderId) {
        setDetailOrder(null);
      }
    });
  }


  return (
    
    <div className="my-orders-page">

     
      <div className="orders-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep"> &gt; </span>
          <span className="active">My Orders</span>
        </div>
      </div>

      
      <section className="orders-main">
        <div className="container">

          {loading && <LoadingState />}
          {!loading && error && <ErrorState error={error?.message || error} />}

          {!loading && !error && (
            <div className="orders-layout">

             
              <aside className="orders-sidebar-col">
                <ProfileSidebar activeLink="orders" />
              </aside>

             
              <div className="orders-content-col">
                <div className="orders-card">

                 
                  <div className="orders-header">
                    <h5 className="orders-title">MY ORDERS</h5>
                    <OrderFilters
                      statusFilter={statusFilter}
                      dateFilter={dateFilter}
                      onChange={handleFilterChange}
                    />
                  </div>

                
                  {filtered.length === 0 && (
                    <EmptyOrders filtered={statusFilter !== "ALL" || !!dateFilter} />
                  )}

                  {filtered.length > 0 && (
                    <div className="orders-list">
                      {filtered.map((order, idx) => (
                        <OrderCard
                          key={order.orderId}
                          order={order}
                          index={idx}
                          onViewDetails={setDetailOrder}
                          onCancelClick={setCancelTarget}
                        />
                      ))}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onCancelClick={(o) => { setCancelTarget(o); setDetailOrder(null); }}
        />
      )}

     
      {cancelTarget && (
        <CancelConfirmModal
          order={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}