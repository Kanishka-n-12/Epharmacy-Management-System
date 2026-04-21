// pages/admin/DeliveryManagementPage.jsx
import AdminLayout    from "../layouts/AdminLayout";
import StatisticsCard from "../components/StatisticsCard";
import DataTable      from "../components/DataTable";
import DataRow        from "../components/DataRow";
import ActionMenu     from "../components/ActionMenu";
import Modal          from "../components/Modal";
import Pagination     from "../components/Pagination";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeliveries, fetchDeliveryStats } from "../../deliveries/slice/deliverySlice";

// ── Shared components ──────────────────────────────────────────────
import TableToolbar      from "../components/TableToolbar";
import AdminConfirmModal from "../components/AdminConfirmModal";
import StatusBadge       from "../components/StatusBadge";

const PER_PAGE = 10;

const COLUMNS = [
  { header: "Delivery ID" }, { header: "Order ID" }, { header: "User ID" },
  { header: "Address ID" }, { header: "Tracking No." }, { header: "Est. Delivery" },
  { header: "Status" }, { header: "Actions" },
];

const STATUS_OPTIONS = ["placed", "shipped", "delivered", "cancelled"];

function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : "—"; }

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function applyFilter(deliveries, search, statusFilter, dateFilter) {
  return deliveries.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      String(d.deliveryId ?? "").includes(q) || String(d.orderId ?? "").includes(q) ||
      String(d.userId ?? "").includes(q)     || (d.trackingNumber ?? "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || (d.orderStatus ?? "").toLowerCase() === statusFilter;
    const matchDate   = !dateFilter   || d.estimatedDeliveryDate === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });
}

export default function DeliveryManagementPage() {

  function showToast(msg, error = false) {
  setToast({ show: true, msg, error });

  setTimeout(() => {
    setToast({ show: false, msg: "", error: false });
  }, 3000);
}

   const [toast, setToast] = useState({
    show: false,
    msg: "",
    error: false,
  });

  
  const dispatch = useDispatch();

  const rawDeliveries = useSelector((s) => s.deliveries?.deliveries);
  const deliveries    = Array.isArray(rawDeliveries) ? rawDeliveries : [];
  const { stats, loading, adminLoading, adminError } = useSelector((s) => s.deliveries);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter,   setDateFilter]   = useState("");
  const [page,         setPage]         = useState(1);

  const [viewModal,   setViewModal]   = useState({ open: false, delivery: null });
  const [statusModal, setStatusModal] = useState({ open: false, delivery: null, newStatus: "" });
  const [cancelModal, setCancelModal] = useState({ open: false, delivery: null });


  useEffect(() => {
    dispatch(fetchDeliveries());
    dispatch(fetchDeliveryStats());
  }, [dispatch]);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFilter]);

  const filtered   = applyFilter(deliveries, search, statusFilter, dateFilter).slice().reverse();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PER_PAGE;
  const pageSlice  = filtered.slice(start, start + PER_PAGE);

  async function saveStatus() {
    const { delivery, newStatus } = statusModal;
    if (!delivery) return;
    if (newStatus === "cancelled") {
      setStatusModal((m) => ({ ...m, open: false }));
      setCancelModal({ open: true, delivery });
      return;
    }
    showToast(`Delivery #${delivery.deliveryId} updated to ${cap(newStatus)}`);
    dispatch(fetchDeliveries()); dispatch(fetchDeliveryStats());
    setStatusModal({ open: false, delivery: null, newStatus: "" });
  }

  async function confirmCancel() {
    const { delivery } = cancelModal;
    if (!delivery) return;
    showToast(`Delivery #${delivery.deliveryId} cancelled — Order #${delivery.orderId} also cancelled`, true);
    dispatch(fetchDeliveries()); dispatch(fetchDeliveryStats());
    setCancelModal({ open: false, delivery: null });
  }

  function renderRow(delivery) {
    const status    = (delivery.orderStatus ?? "").toLowerCase();
    const canUpdate = status !== "delivered" && status !== "cancelled";

    const actions = canUpdate
      ? [
          { label: "View Details",    onClick: () => setViewModal({ open: true, delivery }) },
          { label: "Update Status",   onClick: () => setStatusModal({ open: true, delivery, newStatus: status }) },
          { label: "Cancel Delivery", className: "dd-cancel", onClick: () => setCancelModal({ open: true, delivery }) },
        ]
      : [{ label: "View Details", onClick: () => setViewModal({ open: true, delivery }) }];

    return (
      <DataRow key={delivery.deliveryId}>
        <td><span className="id-badge">#{delivery.deliveryId}</span></td>
        <td><span className="id-badge">#{delivery.orderId ?? "—"}</span></td>
        <td style={{ fontWeight: 600 }}>User #{delivery.userId ?? "—"}</td>
        <td style={{ color: "var(--text-mid)" }}>Addr #{delivery.addressId ?? "—"}</td>
        <td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{delivery.trackingNumber ?? "—"}</span></td>
        <td style={{ color: "var(--text-mid)" }}>{fmtDate(delivery.estimatedDeliveryDate)}</td>
        <td><StatusBadge status={status} preset="delivery" /></td>
        <td><ActionMenu actions={actions} /></td>
      </DataRow>
    );
  }

 
  const toolbarFilters = [
    {
      type: "select",
      value: statusFilter,
      onChange: (v) => { setStatusFilter(v); setPage(1); },
      options: [
        { value: "", label: "All Status" },
        ...STATUS_OPTIONS.map((s) => ({ value: s, label: cap(s) })),
      ],
    },
    {
      type: "date",
      value: dateFilter,
      onChange: (v) => { setDateFilter(v); setPage(1); },
      title: "Filter by estimated delivery date",
    },
  ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="page-heading">
          <h1 className="page-title">Delivery Management</h1>
        </div>

        <section className="stats-grid">
          <StatisticsCard icon="🚛" value={stats?.total     ?? deliveries.length} label="Total Deliveries" color="#52a468" />
          <StatisticsCard icon="📦" value={stats?.placed    ?? 0}                 label="Placed"           color="#3498db" />
          <StatisticsCard icon="🚚" value={stats?.shipped   ?? 0}                 label="Shipped"          color="#9b59b6" />
          <StatisticsCard icon="✅" value={stats?.delivered ?? 0}                 label="Delivered"        color="#27ae60" />
          <StatisticsCard
            icon="❌"
            value={stats?.cancelled ?? deliveries.filter((d) => (d.orderStatus ?? "").toLowerCase() === "cancelled").length}
            label="Cancelled"
            color="#e74c3c"
          />
        </section>

        <div className="table-card">
          {/* ── shared TableToolbar ── */}
          <TableToolbar
            title="All Deliveries"
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search tracking no, order, user…"
            filters={toolbarFilters}
          />

          <DataTable columns={COLUMNS} data={pageSlice} renderRow={renderRow} loading={loading} error={adminError?{message:adminError}:null} emptyMessage="No deliveries found." />
          <Pagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PER_PAGE} onPageChange={setPage} itemLabel="deliveries" />
        </div>
      </main>

      {/* VIEW MODAL */}
      {viewModal.open && viewModal.delivery && (
        <Modal title={`Delivery #${viewModal.delivery.deliveryId} — Details`} onClose={() => setViewModal({ open: false, delivery: null })} size="md">
          <div className="detail-grid">
            {[
              ["Delivery ID",        `#${viewModal.delivery.deliveryId}`],
              ["Order ID",           `#${viewModal.delivery.orderId ?? "—"}`],
              ["User ID",            `User #${viewModal.delivery.userId ?? "—"}`],
              ["Address ID",         `Addr #${viewModal.delivery.addressId ?? "—"}`],
              ["Tracking Number",    viewModal.delivery.trackingNumber ?? "—"],
              ["Est. Delivery Date", fmtDate(viewModal.delivery.estimatedDeliveryDate)],
            ].map(([label, val]) => (
              <div className="detail-item" key={label}>
                <span className="detail-label">{label}</span>
                <span className="detail-val" style={label==="Tracking Number"?{fontFamily:"monospace",fontSize:13}:{}}>{val}</span>
              </div>
            ))}
            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
              <span className="detail-label">Delivery Status</span>
              <StatusBadge status={(viewModal.delivery.orderStatus ?? "").toLowerCase()} preset="delivery" />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button className="btn-cancel" onClick={() => setViewModal({ open: false, delivery: null })}>Close</button>
          </div>
        </Modal>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModal.open && statusModal.delivery && (
        <Modal title="Update Delivery Status" onClose={() => setStatusModal({ open: false, delivery: null, newStatus: "" })} size="md">
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
            Delivery #{statusModal.delivery.deliveryId} · Order #{statusModal.delivery.orderId ?? "—"} · {statusModal.delivery.trackingNumber}
          </p>
          <div className="mfield">
            <label className="mlabel">Delivery Status <span style={{ color: "var(--red)" }}>*</span></label>
            <select className="mselect" value={statusModal.newStatus} onChange={(e) => setStatusModal((m) => ({ ...m, newStatus: e.target.value }))}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
            </select>
          </div>
          {statusModal.newStatus === "cancelled" && (
            <div style={{ background:"#fff8e1", border:"1.5px solid #ffe082", borderRadius:8, padding:"10px 14px", fontSize:12, fontWeight:600, color:"#b45309", marginTop:14 }}>
              Setting status to <strong>Cancelled</strong> will also cancel the linked Order.
            </div>
          )}
          <div className="admin-modal-footer">
            <button className="btn-cancel" onClick={() => setStatusModal({ open: false, delivery: null, newStatus: "" })}>Discard</button>
            <button className="btn-save" onClick={saveStatus} disabled={adminLoading}>{adminLoading ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}

      {cancelModal.open && cancelModal.delivery && (
        <AdminConfirmModal
          title="Cancel Delivery"
          confirmLabel="Yes, Cancel"
          loading={adminLoading}
          onClose={() => setCancelModal({ open: false, delivery: null })}
          onConfirm={confirmCancel}
          message={
            <>
              <p style={{ margin: "0 0 16px", color: "var(--text-mid)", fontSize: 14 }}>
                Are you sure you want to cancel this delivery? The linked order will also be cancelled.
              </p>
              <div style={{ background:"#fef3c7", border:"1px solid #d32b2b", borderRadius:8, padding:"12px 14px", fontSize:13 }}>
                <div style={{ marginBottom: 6 }}><strong>Delivery:</strong> #{cancelModal.delivery.deliveryId}</div>
                <div style={{ marginBottom: 6 }}><strong>Order:</strong> #{cancelModal.delivery.orderId ?? "—"}</div>
                <div><strong>Tracking:</strong> {cancelModal.delivery.trackingNumber ?? "—"}</div>
              </div>
            </>
          }
        />
      )}

      <div className={`toast${toast.show ? " show" : ""}`} style={toast.error ? { background: "#d03434" } : {}}>{toast.msg}</div>
    </AdminLayout>
  );
}