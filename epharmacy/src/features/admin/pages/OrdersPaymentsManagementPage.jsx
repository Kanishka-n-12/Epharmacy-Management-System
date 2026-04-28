// pages/admin/OrdersPaymentManagementPage.jsx
import AdminLayout    from "../layouts/AdminLayout";
import StatisticsCard from "../components/StatisticsCard";
import DataTable      from "../components/DataTable";
import DataRow        from "../components/DataRow";
import ActionMenu     from "../components/ActionMenu";
import Modal          from "../components/Modal";
import Pagination     from "../components/Pagination";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders, fetchOrderStats, updateOrderStatus,
  fetchAllPayments, fetchPaymentStats, updatePaymentStatus,
} from "../../orders/slices/ordersPaymentsThunks";
import TableToolbar from "../components/TableToolbar";
import StatusBadge  from "../components/StatusBadge";

const PER_PAGE = 10;

const ORDER_COLUMNS = [
  { header: "Order ID" }, { header: "Order Date" }, { header: "Phone" },
  { header: "Total Amount" }, { header: "Order Status" },
  { header: "Payment Status" }, { header: "Actions" },
];

const PAYMENT_COLUMNS = [
  { header: "Pay ID" }, { header: "Order ID" }, { header: "Transaction ID" },
  { header: "Method" }, { header: "Amount (₹)" }, { header: "Status" },
  { header: "Date" }, { header: "Actions" },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "—";
}





export default function OrdersPaymentManagementPage() {

  const [toast, setToast] = useState({ show: false, msg: "", error: false });
  function showToast(msg, error = false) {
    setToast({ show: true, msg, error });
    setTimeout(() => setToast({ show: false, msg: "", error: false }), 3000);
  }

  const dispatch = useDispatch();
  const {
    orders, orderStats, ordersLoading, ordersError,
    payments, paymentStats, paymentsLoading, paymentsError,
    actionLoading,
  } = useSelector((s) => s.ordersPayments);

  // orders / payments are now page objects: { content, totalPages, totalElements, number }
  const orderContent   = orders?.content   ?? [];
  const paymentContent = payments?.content ?? [];

  const [activeTab, setActiveTab] = useState("orders");

  // Order filters + server page
  const [oSearch,       setOSearch]       = useState("");
  const [oStatusFilter, setOStatusFilter] = useState("");
  const [oPayFilter,    setOPayFilter]    = useState("");
  const [oDateFilter,   setODateFilter]   = useState("");
  const [oPage,         setOPage]         = useState(0); // 0-indexed for Spring

  // Payment filters + server page
  const [pSearch,       setPSearch]       = useState("");
  const [pStatusFilter, setPStatusFilter] = useState("");
  const [pMethodFilter, setPMethodFilter] = useState("");
  const [pDateFilter,   setPDateFilter]   = useState("");
  const [pPage,         setPPage]         = useState(0); // 0-indexed for Spring

  // Modals
  const [viewOrderModal, setViewOrderModal] = useState({ open: false, order: null });
  const [updateModal,    setUpdateModal]    = useState({ open: false, order: null });
  const [newOrderStatus, setNewOrderStatus] = useState("PLACED");
  const [viewPayModal,   setViewPayModal]   = useState({ open: false, payment: null });

  // ── Fetch on page change ──
useEffect(() => {
  dispatch(fetchAllOrders({ page: oPage, size: PER_PAGE, search: oSearch, orderStatus: oStatusFilter, paymentStatus: oPayFilter, date: oDateFilter }));
}, [dispatch, oPage, oSearch, oStatusFilter, oPayFilter, oDateFilter]);

useEffect(() => {
  dispatch(fetchAllPayments({ page: pPage, size: PER_PAGE, search: pSearch, status: pStatusFilter, method: pMethodFilter, date: pDateFilter }));
}, [dispatch, pPage, pSearch, pStatusFilter, pMethodFilter, pDateFilter]);

  useEffect(() => {
    dispatch(fetchOrderStats());
    dispatch(fetchPaymentStats());
  }, [dispatch]);

  // Reset to first page when filters change
  useEffect(() => { setOPage(0); }, [oSearch, oStatusFilter, oPayFilter, oDateFilter]);
  useEffect(() => { setPPage(0); }, [pSearch, pStatusFilter, pMethodFilter, pDateFilter]);

  // ── Orders ──
const filteredOrders   = orderContent;
  const oTotalPages    = orders?.totalPages ?? 1;
  const oTotalItems    = orders?.totalElements ?? 0;

  async function confirmOrderStatus() {
    if (!updateModal.order) return;
    const result = await dispatch(updateOrderStatus({ id: updateModal.order.orderId, status: newOrderStatus }));
    if (updateOrderStatus.fulfilled.match(result)) {
      showToast(`Order #${updateModal.order.orderId} updated to ${cap(newOrderStatus)}`);
      dispatch(fetchAllOrders({ page: oPage, size: PER_PAGE }));
      dispatch(fetchOrderStats());
    } else {
      showToast(result.payload || "Update failed", true);
    }
    setUpdateModal({ open: false, order: null });
  }

  function renderOrderRow(o) {
    const oStatus = (o.orderStatus || "").toLowerCase();
    const pStatus = (o.paymentStatus || "").toLowerCase();
    const actions = [
      { label: "View Order",    className: "dd-view", onClick: () => setViewOrderModal({ open: true, order: o }) },
      { label: "Update Status", className: "dd-edit", onClick: () => { setNewOrderStatus((o.orderStatus || "PLACED").toUpperCase()); setUpdateModal({ open: true, order: o }); } },
    ];
    return (
      <DataRow key={o.orderId}>
        <td><span className="id-badge">#{o.orderId}</span></td>
        <td>{fmtDate(o.orderDate)}</td>
        <td style={{ fontWeight: 700, color: "var(--text-dark)" }}>{o.phoneNumber || "—"}</td>
        <td className="amount-cell">₹{Number(o.totalAmount ?? 0).toFixed(2)}</td>
        <td><StatusBadge status={oStatus} preset="order" /></td>
        <td><StatusBadge status={pStatus} preset="payment" /></td>
        <td><ActionMenu actions={actions} /></td>
      </DataRow>
    );
  }

  // ── Payments ──
  
const filteredPayments = paymentContent;
  const pTotalPages      = payments?.totalPages ?? 1;
  const pTotalItems      = payments?.totalElements ?? 0;

  function renderPaymentRow(p) {
    const pStatus = (p.paymentStatus || "").toLowerCase();
    const orderId = p.orderId;
    const actions = [{ label: "View Details", className: "dd-view", onClick: () => setViewPayModal({ open: true, payment: p }) }];
    return (
      <DataRow key={p.paymentId}>
        <td><span className="id-badge">#{p.paymentId}</span></td>
        <td><span className="id-badge">#{orderId ?? "—"}</span></td>
        <td style={{ fontSize: 11.5, fontFamily: "monospace", color: "var(--text-mid)" }}>{p.transactionId || "—"}</td>
        <td><span className="method-chip">{p.paymentMethod || "—"}</span></td>
        <td className="amount-cell">₹{Number(p.paymentAmount ?? 0).toFixed(2)}</td>
        <td><StatusBadge status={pStatus} preset="payment" /></td>
        <td>{fmtDate(p.paymentDate)}</td>
        <td><ActionMenu actions={actions} /></td>
      </DataRow>
    );
  }

  // ── Toolbar filter configs ──
  const orderFilters = [
    { type: "select", value: oStatusFilter, onChange: (v) => setOStatusFilter(v), options: [{ value: "", label: "All Order Status" }, { value: "placed", label: "Placed" }, { value: "shipped", label: "Shipped" }, { value: "delivered", label: "Delivered" }, { value: "cancelled", label: "Cancelled" }] },
    { type: "select", value: oPayFilter,    onChange: (v) => setOPayFilter(v),    options: [{ value: "", label: "All Payment" }, { value: "success", label: "Success" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }] },
    { type: "date",   value: oDateFilter,   onChange: (v) => setODateFilter(v),   title: "Filter by order date" },
  ];
  const paymentFilters = [
    { type: "select", value: pStatusFilter, onChange: (v) => setPStatusFilter(v), options: [{ value: "", label: "All Status" }, { value: "success", label: "Success" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }] },
    { type: "select", value: pMethodFilter, onChange: (v) => setPMethodFilter(v), options: [{ value: "", label: "All Methods" }, { value: "upi", label: "UPI" }, { value: "card", label: "Card" }, { value: "netbanking", label: "NetBanking" }, { value: "cod", label: "COD" }] },
    { type: "date",   value: pDateFilter,   onChange: (v) => setPDateFilter(v),   title: "Filter by payment date" },
  ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="tab-bar">
          <button
            className={`tab-btn${activeTab === "orders" ? "  active" : ""}`}
            onClick={() => setActiveTab("orders")}
            style={{ backgroundColor: "#52a468", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
          >📦 Orders Management</button>
          <button
            className={`tab-btn${activeTab === "payments" ? " active" : ""}`}
            onClick={() => setActiveTab("payments")}
            style={{ backgroundColor: "#52a468", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginLeft: "20px" }}
          >💰 Payment Management</button>
        </div>

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <>
            <div className="page-heading"><h1 className="page-title">Orders Management</h1></div>
            <section className="stats-grid stats-5">
              <StatisticsCard icon="📦" value={orderStats.total}     label="Total Orders" color="#52a468" />
              <StatisticsCard icon="📋" value={orderStats.placed}    label="Placed"       color="#2980b9" />
              <StatisticsCard icon="🚚" value={orderStats.shipped}   label="Shipped"      color="#8e44ad" />
              <StatisticsCard icon="✅" value={orderStats.delivered} label="Delivered"    color="#27ae60" />
              <StatisticsCard icon="❌" value={orderStats.cancelled} label="Cancelled"    color="#e74c3c" />
            </section>
            <div className="table-card">
              <TableToolbar
                title="All Orders"
                search={oSearch}
                onSearch={(v) => { setOSearch(v); setOPage(0); }}
                placeholder="Search order ID or phone…"
                filters={orderFilters}
              />
              <DataTable
                columns={ORDER_COLUMNS}
                data={filteredOrders}
                renderRow={renderOrderRow}
                loading={ordersLoading}
                error={ordersError ? { message: ordersError } : null}
                emptyMessage="No orders found."
              />
              {/* Pagination uses 1-indexed display; convert to/from 0-indexed Spring pages */}
              <Pagination
                currentPage={oPage + 1}
                totalPages={oTotalPages}
                totalItems={oTotalItems}
                itemsPerPage={PER_PAGE}
                onPageChange={(p) => setOPage(p - 1)}
                itemLabel="orders"
              />
            </div>
          </>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === "payments" && (
          <>
            <div className="page-heading"><h1 className="page-title">Payment Management</h1></div>
            <section className="stats-grid stats-4">
              <StatisticsCard icon="💰" value={paymentStats.total}   label="Total Transactions" color="#52a468" />
              <StatisticsCard icon="✓"  value={paymentStats.success} label="Successful"         color="#27ae60" />
              <StatisticsCard icon="⏳" value={paymentStats.pending} label="Pending"            color="#e67e22" />
              <StatisticsCard icon="❌" value={paymentStats.failed}  label="Failed"             color="#e74c3c" />
            </section>
            <div className="table-card">
              <TableToolbar
                title="All Payments"
                search={pSearch}
                onSearch={(v) => { setPSearch(v); setPPage(0); }}
                placeholder="Search TXN ID or order…"
                filters={paymentFilters}
              />
              <DataTable
                columns={PAYMENT_COLUMNS}
                data={filteredPayments}
                renderRow={renderPaymentRow}
                loading={paymentsLoading}
                error={paymentsError ? { message: paymentsError } : null}
                emptyMessage="No payments found."
              />
              <Pagination
                currentPage={pPage + 1}
                totalPages={pTotalPages}
                totalItems={pTotalItems}
                itemsPerPage={PER_PAGE}
                onPageChange={(p) => setPPage(p - 1)}
                itemLabel="payments"
              />
            </div>
          </>
        )}
      </main>

      {/* VIEW ORDER MODAL */}
      {viewOrderModal.open && viewOrderModal.order && (() => {
        const o = viewOrderModal.order;
        return (
          <Modal title={`Order #${o.orderId} — Details`} onClose={() => setViewOrderModal({ open: false, order: null })} size="lg">
            <div className="order-detail-header">
              {[["Order ID", `#${o.orderId}`], ["Order Date", fmtDate(o.orderDate)], ["Phone", o.phoneNumber || "—"], ["Total Amount", `₹${Number(o.totalAmount ?? 0).toFixed(2)}`]].map(([label, val]) => (
                <div className="odh-row" key={label}><span className="odh-label">{label}</span><span className="odh-val">{val}</span></div>
              ))}
              <div className="odh-row"><span className="odh-label">Order Status</span><StatusBadge status={(o.orderStatus || "").toLowerCase()} preset="order" /></div>
              <div className="odh-row"><span className="odh-label">Payment Status</span><StatusBadge status={(o.paymentStatus || "").toLowerCase()} preset="payment" /></div>
            </div>
          </Modal>
        );
      })()}

      {/* UPDATE ORDER STATUS MODAL */}
      {updateModal.open && updateModal.order && (
        <Modal title={`Update Status — Order #${updateModal.order.orderId}`} onClose={() => setUpdateModal({ open: false, order: null })} size="sm">
          <div className="mfield">
            <label className="mlabel">Order Status <span style={{ color: "var(--red)" }}>*</span></label>
            <select className="mselect" value={newOrderStatus} onChange={(e) => setNewOrderStatus(e.target.value)}>
              <option value="PLACED">Placed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="admin-modal-footer">
            <button className="btn-save" onClick={confirmOrderStatus} disabled={actionLoading}>
              {actionLoading ? "Updating…" : "Update Status"}
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW PAYMENT MODAL */}
      {viewPayModal.open && viewPayModal.payment && (() => {
        const p = viewPayModal.payment;
        const orderId = p.orderId ?? "—";
        return (
          <Modal title="Payment Details" onClose={() => setViewPayModal({ open: false, payment: null })} size="md">
            <div className="pay-detail-grid">
              {[
                ["Payment ID", `#${p.paymentId}`],
                ["Order ID", `#${orderId}`],
                ["Transaction ID", p.transactionId || "—"],
                ["Payment Method", p.paymentMethod || "—"],
                ["Amount", `₹${Number(p.paymentAmount ?? 0).toFixed(2)}`],
                ["Payment Date", fmtDate(p.paymentDate)],
              ].map(([label, val]) => (
                <div className="pay-detail-item" key={label}>
                  <span className="pay-detail-label">{label}</span>
                  <span className="pay-detail-val" style={label === "Transaction ID" ? { fontSize: 12, fontFamily: "monospace" } : {}}>{val}</span>
                </div>
              ))}
              <div className="pay-detail-item" style={{ gridColumn: "1 / -1" }}>
                <span className="pay-detail-label">Status</span>
                <StatusBadge status={(p.paymentStatus || "").toLowerCase()} preset="payment" />
              </div>
            </div>
          </Modal>
        );
      })()}

      <div className={`toast${toast.show ? " show" : ""}`} style={toast.error ? { background: "#c62828" } : {}}>{toast.msg}</div>
    </AdminLayout>
  );
}