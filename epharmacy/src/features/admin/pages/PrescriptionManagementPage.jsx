// pages/admin/PrescriptionManagementPage.jsx
import AdminLayout    from "../layouts/AdminLayout";
import StatisticsCard from "../components/StatisticsCard";
import DataTable      from "../components/DataTable";
import DataRow        from "../components/DataRow";
import ActionMenu     from "../components/ActionMenu";
import Modal          from "../components/Modal";
import Pagination     from "../components/Pagination";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPrescriptions, fetchPrescriptionStats, updatePrescriptionStatus,
} from "../../prescriptions/slices/prescriptionAdminSlice";

import TableToolbar  from "../components/TableToolbar";
import StatusBadge   from "../components/StatusBadge";

const PER_PAGE = 10;

const COLUMNS = [
  { header: "Pres. ID" }, { header: "User ID" }, { header: "Doctor Name" },
  { header: "Reg. ID" }, { header: "Uploaded Date" }, { header: "Validation" },
  { header: "Status" }, { header: "Actions" },
];

function applyFilter(prescriptions, search, statusFilter, dateFilter) {
  return prescriptions.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (p.doctorName || "").toLowerCase().includes(q) ||
      (p.doctorRegisteredId || "").toLowerCase().includes(q) ||
      String(p.userId || "").includes(q) ||
      String(p.prescriptionId).includes(q);
    const matchStatus = !statusFilter || (p.approvalStatus || "").toLowerCase() === statusFilter.toLowerCase();
    const matchDate   = !dateFilter   || p.uploadedDate === dateFilter;
    return matchSearch && matchStatus && matchDate;
  });
}

function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : "—"; }

export default function PrescriptionManagementPage() {

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
  const { prescriptions, stats, loading, adminLoading, adminError } = useSelector((s) => s.prescriptions);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter,   setDateFilter]   = useState("");
  const [page,         setPage]         = useState(1);

  const [viewModal, setViewModal] = useState({ open: false, prescription: null });

 

  useEffect(() => {
    dispatch(fetchPrescriptions());
    dispatch(fetchPrescriptionStats());
  }, [dispatch]);

  const filtered   = applyFilter(prescriptions, search, statusFilter, dateFilter).slice().reverse();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PER_PAGE;
  const pageSlice  = filtered.slice(start, start + PER_PAGE);

  useEffect(() => { setPage(1); }, [search, statusFilter, dateFilter]);

  function renderRow(p) {
    const status = (p.approvalStatus || "pending").toLowerCase();
    const v      = p._validation;

    const valBadge = v
      ? v.valid
        ? <span className="val-badge val-valid">✓ Valid</span>
        : <span className="val-badge val-invalid">✗ Invalid</span>
      : <span style={{ color: "#ccc", fontSize: 13 }}>—</span>;

    const actions = [{ label: "View", className: "dd-view", onClick: () => setViewModal({ open: true, prescription: p }) }];

    return (
      <DataRow key={p.prescriptionId}>
        <td><span className="id-badge">#{p.prescriptionId}</span></td>
        <td style={{ fontWeight: 700, color: "var(--text-dark)" }}>User #{p.userId}</td>
        <td style={{ fontWeight: 600, color: "var(--text-dark)" }}>{p.doctorName}</td>
        <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "var(--text-mid)" }}>{p.doctorRegisteredId}</td>
        <td>{fmtDate(p.uploadedDate)}</td>
        <td>{valBadge}</td>
        <td><StatusBadge status={status} preset="prescription" /></td>
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
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      type: "date",
      value: dateFilter,
      onChange: (v) => { setDateFilter(v); setPage(1); },
      title: "Filter by upload date",
    },
  ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="page-heading">
          <h1 className="page-title">Prescription Management</h1>
        </div>

        <section className="stats-grid">
          <StatisticsCard icon="📋" value={stats?.total    ?? prescriptions.length}                                                                label="Total Prescriptions" color="#52a468" />
          <StatisticsCard icon="⏳" value={stats?.pending  ?? prescriptions.filter((p) => (p.approvalStatus||"").toLowerCase()==="pending").length}  label="Pending Review"     color="#e67e22" />
          <StatisticsCard icon="✅" value={stats?.approved ?? prescriptions.filter((p) => (p.approvalStatus||"").toLowerCase()==="approved").length} label="Approved"           color="#27ae60" />
          <StatisticsCard icon="❌" value={stats?.rejected ?? prescriptions.filter((p) => (p.approvalStatus||"").toLowerCase()==="rejected").length} label="Rejected"           color="#e74c3c" />
        </section>

        <div className="table-card">
          {/* ── shared TableToolbar ── */}
          <TableToolbar
            title="All Prescriptions"
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search doctor, ID or user…"
            filters={toolbarFilters}
          />

          <DataTable columns={COLUMNS} data={pageSlice} renderRow={renderRow} loading={loading} error={adminError?{message:adminError}:null} emptyMessage="No prescriptions found." />
          <Pagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PER_PAGE} onPageChange={setPage} itemLabel="prescriptions" />
        </div>
      </main>

      {/* VIEW MODAL */}
      {viewModal.open && viewModal.prescription && (() => {
        const p      = viewModal.prescription;
        const status = (p.approvalStatus || "pending").toLowerCase();
        const v      = p._validation;
        return (
          <Modal title={`Prescription #${p.prescriptionId} — Details`} onClose={() => setViewModal({ open: false, prescription: null })} size="lg">
            <div className="pres-detail-grid">
              {[
                ["Prescription ID", `#${p.prescriptionId}`],
                ["User ID", `User #${p.userId}`],
                ["Doctor Name", p.doctorName],
                ["Doctor Registered ID", p.doctorRegisteredId],
                ["Uploaded Date", fmtDate(p.uploadedDate)],
                ["Prescribed Date", fmtDate(p.prescribedDate)],
              ].map(([label, val]) => (
                <div className="pres-detail-item" key={label}>
                  <span className="pres-detail-label">{label}</span>
                  <span className="pres-detail-val" style={label==="Doctor Registered ID"?{fontFamily:"monospace"}:{}}>{val}</span>
                </div>
              ))}
              <div className="pres-detail-item">
                <span className="pres-detail-label">Current Status</span>
                <StatusBadge status={status} preset="prescription" />
              </div>
            </div>

            <div className="pres-section-label">Prescription File</div>
            <div className="file-path-box">📄 {p.filePath}</div>

            {Array.isArray(p.prescriptionMedicines) && p.prescriptionMedicines.length > 0 && (
              <>
                <div className="pres-section-label" style={{ marginTop: 18 }}>Medicines Prescribed</div>
                <table className="pres-medicines-table">
                  <thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th></tr></thead>
                  <tbody>
                    {p.prescriptionMedicines.map((m, i) => (
                      <tr key={i}><td>{m.medicineName}</td><td>{m.dosage||"—"}</td><td>{m.duration||"—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {v && (
              <>
                <div className={`validation-banner ${v.valid ? "banner-valid" : "banner-invalid"}`}>
                  <span className="banner-icon">{v.valid ? "✅" : "⚠️"}</span>
                  <div>
                    <div className="banner-title">{v.valid ? "Prescription is VALID" : "Prescription is INVALID"}</div>
                    <div className="banner-reason">{v.reason}</div>
                  </div>
                </div>
                <div className="pres-section-label">Validation Checklist</div>
                <ul className="val-checklist">
                  {v.checks.map((c, i) => (
                    <li key={i}><span className={c.pass ? "val-check" : "val-cross"}>{c.pass ? "✓" : "✗"}</span>{c.label}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="admin-modal-footer">
            </div>
          </Modal>
        );
      })()}

      <div className={`toast${toast.show ? " show" : ""}`} style={toast.error ? { background: "#c62828" } : {}}>{toast.msg}</div>
    </AdminLayout>
  );
}