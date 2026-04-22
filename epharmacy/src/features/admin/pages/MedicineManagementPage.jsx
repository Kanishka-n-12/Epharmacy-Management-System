
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
  fetchMedicineStats, createMedicine, editMedicine, changeMedicineAvailability,
  fetchBatches, createBatch, editBatch, removeBatch,
  fetchCategories, fetchAllMedicinesForAdmin,
} from "../../medicines/slices/medicineSlice";

import TableToolbar      from "../components/TableToolbar";
import AdminConfirmModal from "../components/AdminConfirmModal";
import StatusBadge       from "../components/StatusBadge";

const PER_PAGE = 10;

const MED_COLUMNS = [
  { header: "#" }, { header: "Medicine" }, { header: "Category" },
  { header: "Price (₹)" }, { header: "Discount" }, { header: "Final Price" },
  { header: "Rx Required" }, { header: "Status" }, { header: "Batches" }, { header: "Actions" },
];

const BATCH_COLUMNS = [
  { header: "Batch No." }, { header: "Expiry Date" },
  { header: "Qty" }, { header: "Stock Status" }, { header: "Actions" },
];

const EMPTY_MED_FORM = {
  name: "", brand: "", composition: "", strength: "", price: "",
  prescriptionRequired: false, categoryId: "", manufacturerId: "",
  storageInstructions: "", dosageForm: "", scheduleType: "",
  taxPercentage: "", discountPercentage: "", description: "",
  uses: "", sideEffects: "", imageUrl: "",
};

const EMPTY_BATCH_FORM = { batchNumber: "", expiryDate: "", quantity: "" };

function applyFilter(medicines, search, statusFilter) {
  return medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.categoryName?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || m.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });
}

function expiryStatus(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in90  = new Date(); in90.setDate(today.getDate() + 90);
  const exp   = new Date(dateStr);
  if (exp < today) return "expired";
  if (exp <= in90)  return "soon";
  return "ok";
}
function expiryLabel(s) {
  if (s === "expired") return "Expired";
  if (s === "soon")    return "Expiring Soon";
  return "Valid";
}
function batchStockLabel(qty) {
  if (qty === 0)  return "Out of Stock";
  if (qty <= 5)   return "Critical";
  if (qty <= 50)  return "Low Stock";
  return "In Stock";
}
function batchStockClass(qty) {
  if (qty === 0)  return "bstock-out";
  if (qty <= 5)   return "bstock-critical";
  if (qty <= 50)  return "bstock-low";
  return "bstock-ok";
}
function todayISO() { return new Date().toISOString().split("T")[0]; }

function validateMedForm(form, isEdit) {
  const e = {};

  if (!form.name.trim()) {
    e.name = "Medicine name is required.";
  } else if (form.name.trim().length < 2 || form.name.trim().length > 50) {
    e.name = "Name must be 2–50 characters.";
  } else if (!/^[A-Za-z0-9 ]{2,50}$/.test(form.name.trim())) {
    e.name = "Name can only contain letters, numbers and spaces.";
  }

  if (!isEdit) {
    if (!form.brand.trim()) {
      e.brand = "Brand name is required.";
    } else if (!/^[A-Za-z ]{2,100}$/.test(form.brand.trim())) {
      e.brand = "Brand must be 2–100 letters only, no numbers.";
    }

    if (!form.composition.trim()) {
      e.composition = "Composition is required.";
    } else if (!/^[A-Za-z0-9+., ]{3,255}$/.test(form.composition.trim())) {
      e.composition = "Use letters, numbers and + . , only (min 3 chars).";
    }

    if (!form.strength.trim()) {
      e.strength = "Strength is required (e.g. 500mg, 5ml, 1g).";
    } else if (!/^\d+(mg|ml|g)$/i.test(form.strength.trim())) {
      e.strength = "Format must be like 500mg, 5ml or 1g.";
    }
  }

  if (form.price === "" || form.price === null || form.price === undefined) {
    e.price = "Price is required.";
  } else if (isNaN(form.price) || Number(form.price) <= 0) {
    e.price = "Price must be a number greater than 0.";
  }

  if (form.taxPercentage === "" || form.taxPercentage === null || form.taxPercentage === undefined) {
    e.taxPercentage = "Tax percentage is required.";
  } else {
    const t = Number(form.taxPercentage);
    if (isNaN(t) || t < 0 || t > 99) {
      e.taxPercentage = "Tax must be between 0 and 99.";
    }
  }

  if (form.discountPercentage === "" || form.discountPercentage === null || form.discountPercentage === undefined) {
    e.discountPercentage = "Discount percentage is required.";
  } else {
    const d = Number(form.discountPercentage);
    if (isNaN(d) || d < 0 || d > 99) {
      e.discountPercentage = "Discount must be between 0 and 99.";
    }
  }

  if (!isEdit && !form.categoryId) {
    e.categoryId = "Category is required.";
  }

  if (form.manufacturerId !== "") {
    if (isNaN(form.manufacturerId) || Number(form.manufacturerId) <= 0) {
      e.manufacturerId = "Enter a valid positive manufacturer ID.";
    }
  } else if (!isEdit) {
    e.manufacturerId = "Manufacturer ID is required.";
  }

  if (!isEdit && !form.scheduleType) {
    e.scheduleType = "Schedule type is required.";
  }

  if (!isEdit && !form.dosageForm) {
    e.dosageForm = "Dosage form is required.";
  } else if (form.dosageForm && !["tablet", "syrup", "injection"].includes(form.dosageForm.toLowerCase())) {
    e.dosageForm = "Select a valid dosage form (Tablet, Syrup or Injection).";
  }

  if (!isEdit) {
    if (!form.storageInstructions.trim()) {
      e.storageInstructions = "Storage instructions are required.";
    } else if (!/^[A-Za-z0-9 ,.-]{3,100}$/.test(form.storageInstructions.trim())) {
      e.storageInstructions = "Min 3 chars, letters/numbers/, . - only.";
    }

    if (!form.description.trim()) {
      e.description = "Description is required.";
    }

    if (!form.uses.trim()) {
      e.uses = "Uses field is required.";
    }

    if (!form.sideEffects.trim()) {
      e.sideEffects = "Side effects field is required.";
    }
  } else if (form.description.trim() && form.description.trim().length < 5) {
    e.description = "Description must be at least 5 characters.";
  }

  if (form.imageUrl && !/^https?:\/\/.+\..+/.test(form.imageUrl.trim())) {
    e.imageUrl = "Enter a valid URL starting with http:// or https://.";
  }

  return e;
}

function Req() { return <span style={{ color: "var(--red)" }}>*</span>; }
function FieldWrap({ children, error, full }) {
  return (
    <div className={`mfield-wrap${full ? " full" : ""}`} style={full ? { gridColumn: "1 / -1" } : {}}>
      {children}
      {error && <div className="merr show">{error}</div>}
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MedicineManagementPage() {

  function showToast(msg, error = false) {
    setToast({ show: true, msg, error });
    setTimeout(() => {
      setToast({ show: false, msg: "", error: false });
    }, 3000);
  }

  const [toast, setToast] = useState({ show: false, msg: "", error: false });

  const dispatch = useDispatch();
  const { adminMedicines, stats, batchMap, categories, loading, adminLoading, adminError } =
    useSelector((s) => s.medicines);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);

  const [expandedRows, setExpandedRows] = useState(new Set());
  const [batchFetched, setBatchFetched] = useState(new Set());

  const [medModal,     setMedModal]     = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [medForm,      setMedForm]      = useState(EMPTY_MED_FORM);
  const [medErrors,    setMedErrors]    = useState({});

  const [availModal, setAvailModal] = useState({ open: false, id: null, name: "", action: "" });

  const [batchModal,     setBatchModal]     = useState(false);
  const [batchMedId,     setBatchMedId]     = useState(null);
  const [batchMedName,   setBatchMedName]   = useState("");
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [batchForm,      setBatchForm]      = useState(EMPTY_BATCH_FORM);
  const [batchErrors,    setBatchErrors]    = useState({});

  const [deleteBatchModal, setDeleteBatchModal] = useState({ open: false, medicineId: null, batchId: null, label: "" });

  useEffect(() => {
    const load = async () => {
      const result = await dispatch(fetchAllMedicinesForAdmin());
      dispatch(fetchMedicineStats());
      dispatch(fetchCategories());
      if (fetchAllMedicinesForAdmin.fulfilled.match(result)) {
        const meds = result.payload;
        if (Array.isArray(meds)) {
          meds.forEach((m) => dispatch(fetchBatches(m.id)));
          setBatchFetched(new Set(meds.map((m) => m.id)));
        }
      }
    };
    load();
  }, [dispatch]);

  const filtered   = applyFilter(adminMedicines, search, statusFilter).slice().reverse();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PER_PAGE;
  const pageSlice  = filtered.slice(start, start + PER_PAGE);

  useEffect(() => setPage(1), [search, statusFilter]);

  function setField(key, value) {
    setMedForm((f) => ({ ...f, [key]: value }));
    if (medErrors[key]) setMedErrors((e) => ({ ...e, [key]: "" }));
  }

  function openAddMed() {
    setEditingMedId(null);
    setMedForm(EMPTY_MED_FORM);
    setMedErrors({});
    setMedModal(true);
  }

  function openEditMed(med) {
    setEditingMedId(med.id);
    setMedForm({
      ...EMPTY_MED_FORM,
      name:               med.name               ?? "",
      price:              med.price               ?? "",
      taxPercentage:      med.taxPercentage       ?? "",
      discountPercentage: med.discount            ?? "",
    });
    setMedErrors({});
    setMedModal(true);
  }

  function closeMedModal() {
    setMedModal(false);
    setEditingMedId(null);
    setMedForm(EMPTY_MED_FORM);
    setMedErrors({});
  }

  async function handleSaveMed() {
    const errors = validateMedForm(medForm, !!editingMedId);
    if (Object.keys(errors).length) { setMedErrors(errors); return; }

    const dto = {
      ...medForm,
      price:              parseFloat(medForm.price),
      categoryId:         medForm.categoryId         ? parseInt(medForm.categoryId)         : null,
      manufacturerId:     medForm.manufacturerId     ? parseInt(medForm.manufacturerId)     : null,
      taxPercentage:      medForm.taxPercentage      !== "" ? parseInt(medForm.taxPercentage)      : null,
      discountPercentage: medForm.discountPercentage !== "" ? parseInt(medForm.discountPercentage) : null,
    };

    if (editingMedId) {
      const updateDto = {
        name:               dto.name,
        price:              dto.price,
        taxPercentage:      dto.taxPercentage,
        discountPercentage: dto.discountPercentage,
      };
      const result = await dispatch(editMedicine({ id: editingMedId, dto: updateDto }));
      if (editMedicine.fulfilled.match(result)) {
        showToast("Medicine updated successfully");
        dispatch(fetchMedicineStats());
        dispatch(fetchAllMedicinesForAdmin());
      } else {
        showToast(result.payload || "Update failed", true);
      }
    } else {
      const result = await dispatch(createMedicine(dto));
      if (createMedicine.fulfilled.match(result)) {
        showToast("Medicine added successfully");
        dispatch(fetchMedicineStats());
        const newMed = result.payload;
        if (newMed?.id) dispatch(fetchBatches(newMed.id));
        dispatch(fetchAllMedicinesForAdmin());
      } else {
        showToast(result.payload || "Add failed", true);
      }
    }
    closeMedModal();
  }

  async function confirmAvailability() {
    const result = await dispatch(changeMedicineAvailability({ id: availModal.id, status: availModal.action }));
    if (changeMedicineAvailability.fulfilled.match(result)) {
      const label = availModal.action === "available" ? "available" : "unavailable";
      showToast(`"${availModal.name}" marked as ${label}`);
      dispatch(fetchMedicineStats());
      dispatch(fetchAllMedicinesForAdmin());
    } else {
      showToast("Status update failed", true);
    }
    setAvailModal({ open: false, id: null, name: "", action: "" });
  }

  function toggleExpand(med) {
    const next = new Set(expandedRows);
    if (next.has(med.id)) {
      next.delete(med.id);
    } else {
      next.add(med.id);
      if (!batchFetched.has(med.id)) {
        dispatch(fetchBatches(med.id));
        setBatchFetched((prev) => new Set(prev).add(med.id));
      }
    }
    setExpandedRows(next);
  }

  function openAddBatch(med)  {
    setBatchMedId(med.id);
    setBatchMedName(med.name);
    setEditingBatchId(null);
    setBatchForm(EMPTY_BATCH_FORM);
    setBatchErrors({});
    setBatchModal(true);
  }

  function openEditBatch(med, batch) {
    setBatchMedId(med.id);
    setBatchMedName(med.name);
    setEditingBatchId(batch.batchId);
    setBatchForm({ batchNumber: batch.batchNumber, expiryDate: batch.expiryDate, quantity: batch.quantity });
    setBatchErrors({});
    setBatchModal(true);
  }

  function closeBatchModal() {
    setBatchModal(false);
    setEditingBatchId(null);
    setBatchForm(EMPTY_BATCH_FORM);
    setBatchErrors({});
  }

  function setBatchField(key, value) {
    setBatchForm((f) => ({ ...f, [key]: value }));
    if (batchErrors[key]) setBatchErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateBatchForm() {
    const e = {};
    if (!batchForm.batchNumber.trim()) { e.batchNumber = "Batch number is required."; }
    else if (batchForm.batchNumber.trim().length < 2) { e.batchNumber = "Batch number must be at least 2 characters."; }
    if (!batchForm.expiryDate) { e.expiryDate = "Expiry date is required."; }
    else if (batchForm.expiryDate <= todayISO()) { e.expiryDate = "Expiry date must be in the future."; }
    if (batchForm.quantity === "") { e.quantity = "Quantity is required."; }
    else if (isNaN(batchForm.quantity) || Number(batchForm.quantity) < 0) { e.quantity = "Quantity must be 0 or more."; }
    return e;
  }

  async function handleSaveBatch() {
    const errors = validateBatchForm();
    if (Object.keys(errors).length) { setBatchErrors(errors); return; }
    const dto = { batchNumber: batchForm.batchNumber.trim(), expiryDate: batchForm.expiryDate, quantity: parseInt(batchForm.quantity) };
    if (editingBatchId) {
      const result = await dispatch(editBatch({ medicineId: batchMedId, batchId: editingBatchId, dto }));
      showToast(editBatch.fulfilled.match(result) ? "Batch updated successfully" : result.payload || "Batch update failed", !editBatch.fulfilled.match(result));
    } else {
      const result = await dispatch(createBatch({ medicineId: batchMedId, dto }));
      showToast(createBatch.fulfilled.match(result) ? "Batch added successfully" : result.payload || "Batch add failed", !createBatch.fulfilled.match(result));
    }
    closeBatchModal();
  }

  async function confirmDeleteBatch() {
    const result = await dispatch(removeBatch({ medicineId: deleteBatchModal.medicineId, batchId: deleteBatchModal.batchId }));
    showToast(removeBatch.fulfilled.match(result) ? "Batch deleted successfully" : "Delete failed", !removeBatch.fulfilled.match(result));
    setDeleteBatchModal({ open: false, medicineId: null, batchId: null, label: "" });
  }

  function renderRow(med, index) {
    const isAvailable = med.status?.toLowerCase() === "available";
    const expanded    = expandedRows.has(med.id);
    const medBatches  = batchMap[med.id] ?? [];
    const batchLoaded = batchMap[med.id] !== undefined;

    const actions = [
      { label: "Edit", onClick: () => openEditMed(med) },
      isAvailable
        ? { label: "Mark Unavailable", className: "dd-deactivate", onClick: () => setAvailModal({ open: true, id: med.id, name: med.name, action: "not_available" }) }
        : { label: "Mark Available",   className: "dd-activate",   onClick: () => setAvailModal({ open: true, id: med.id, name: med.name, action: "available" }) },
    ];

    return (
      <>
        <DataRow key={med.id}>
          <td className="td-num">{start + index + 1}</td>
          <td>
            <div className="med-cell">
              <div className="med-icon">{med.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="med-name">{med.name}</div>
                {med.description && (
                  <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>
                    {med.description.length > 40 ? med.description.slice(0, 40) + "…" : med.description}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td style={{ color: "var(--text-muted)", fontSize: 11 }}>{med.categoryName || "—"}</td>
          <td className="price-cell">₹{med.price?.toFixed(2) ?? "—"}</td>
          <td>{med.discount != null ? <span className="badge" style={{ background: "#e8f5e9", color: "#2e7d32" }}>{med.discount}%</span> : "—"}</td>
          <td className="price-cell">{med.finalPrice != null ? `₹${med.finalPrice.toFixed(2)}` : "—"}</td>
          <td>
            <span className={`badge ${med.prescriptionRequired ? "badge-h15" : "badge-otc"}`}>
              {med.prescriptionRequired ? "Rx" : "OTC"}
            </span>
          </td>
          <td>
            <StatusBadge status={med.status} preset="availability" />
          </td>
          <td>
            <button onClick={() => toggleExpand(med)} style={{ display:"inline-flex", alignItems:"center", gap:5, background:"none", border:"none", cursor:"pointer" }}>
              <span className="batch-count-pill">{batchLoaded ? medBatches.length : "…"}</span>
              <span style={{ display:"inline-block", fontSize:14, color:"var(--green-dark)", transition:"transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
          </td>
          <td><ActionMenu actions={actions} /></td>
        </DataRow>

        {expanded && (
          <tr key={`batch-${med.id}`}>
            <td colSpan={MED_COLUMNS.length} style={{ padding: 0, background: "#f8fdf9", borderBottom: "2px solid var(--green-light)" }}>
              <div style={{ padding: "16px 24px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, flexWrap:"wrap", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:13 }}>
                    <span>📦</span>
                    <span>Batch Records — <strong>{med.name}</strong></span>
                    <span style={{ background:"#e8f5e9", color:"#2e7d32", fontSize:11, fontWeight:600, padding:"3px 12px", borderRadius:20 }}>
                      Total Stock: <strong>{medBatches.reduce((s, b) => s + (b.quantity || 0), 0)}</strong>
                    </span>
                  </div>
                  <button onClick={() => openAddBatch(med)}
                    style={{ backgroundColor:"#52a468", color:"#fff", border:"none", padding:"6px 16px", borderRadius:"6px", fontWeight:"600", cursor:"pointer", fontSize:12 }}>
                    + Add Batch
                  </button>
                </div>
                <div style={{ borderRadius:10, border:"1px solid #d4edda", overflow:"hidden", background:"#fff" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ background:"#d4edda" }}>
                        {BATCH_COLUMNS.map((c) => (
                          <th key={c.header} style={{ padding:"8px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--green-dark)", textTransform:"uppercase", letterSpacing:0.5, whiteSpace:"nowrap" }}>{c.header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {!batchLoaded ? (
                        <tr><td colSpan={5} style={{ textAlign:"center", padding:20, color:"#888", fontStyle:"italic", fontSize:12 }}>Loading batches…</td></tr>
                      ) : medBatches.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign:"center", padding:20, color:"#888", fontStyle:"italic", fontSize:12 }}>No batches added yet.</td></tr>
                      ) : (
                        medBatches.map((b) => {
                          const expSt  = expiryStatus(b.expiryDate);
                          const expDate = new Date(b.expiryDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
                          const stkCls = batchStockClass(b.quantity);
                          const stkLbl = batchStockLabel(b.quantity);
                          return (
                            <tr key={b.batchId} style={{ borderBottom:"1px solid #edf7ee" }}>
                              <td style={{ padding:"9px 14px" }}>
                                <span style={{ fontWeight:700, color:"var(--text-dark)", background:"var(--green-bg)", padding:"2px 10px", borderRadius:6, fontSize:11.5 }}>{b.batchNumber}</span>
                              </td>
                              <td style={{ padding:"9px 14px" }}>
                                <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:6, fontSize:11, fontWeight:700, background: expSt==="ok"?"#e8f5e9":expSt==="soon"?"#fff3e0":"#fce4ec", color: expSt==="ok"?"#2e7d32":expSt==="soon"?"#e65100":"#880e4f" }}>{expDate}</span>
                                <span style={{ display:"block", fontSize:9.5, color:"#888", marginTop:2 }}>{expiryLabel(expSt)}</span>
                              </td>
                              <td style={{ padding:"9px 14px", fontWeight:700, fontSize:13 }}>{b.quantity}</td>
                              <td style={{ padding:"9px 14px" }}><span className={`batch-stock-badge ${stkCls}`}>{stkLbl}</span></td>
                              <td style={{ padding:"9px 14px" }}>
                                <div style={{ display:"flex", gap:6 }}>
                                  <button onClick={() => openEditBatch(med, b)} className="batch-icon-btn batch-edit-btn" title="Edit Batch">✎</button>
                                  <button onClick={() => setDeleteBatchModal({ open:true, medicineId:med.id, batchId:b.batchId, label:`${med.name} — Batch ${b.batchNumber}` })} className="batch-icon-btn batch-del-btn" title="Delete Batch">✕</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  const toolbarFilters = [
    {
      type: "select",
      value: statusFilter,
      onChange: (v) => { setStatusFilter(v); setPage(1); },
      options: [
        { value: "", label: "All Status" },
        { value: "available", label: "Available" },
        { value: "not_available", label: "Unavailable" },
      ],
    },
  ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="page-heading">
          <div>
            <h1 className="page-title">Medicine Management</h1>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>Click ▾ on any row to view &amp; manage its batches</p>
          </div>
          <button onClick={openAddMed}
            style={{ backgroundColor:"#52a468", color:"#fff", border:"none", padding:"8px 16px", borderRadius:"6px", fontWeight:"600", cursor:"pointer" }}>
            + Add Medicine
          </button>
        </div>

        <section className="stats-grid" style={{ gridTemplateColumns:"repeat(3, 1fr)" }}>
          <StatisticsCard icon="💊" value={stats?.total        ?? adminMedicines.length}                                                            label="Total Medicines" color="#52a468" />
          <StatisticsCard icon="✓"  value={stats?.available    ?? adminMedicines.filter((m) => m.status?.toLowerCase() === "available").length}    label="Available"       color="#2980b9" />
          <StatisticsCard icon="✕"  value={stats?.notAvailable ?? adminMedicines.filter((m) => m.status?.toLowerCase() !== "available").length}    label="Unavailable"     color="#e74c3c" />
        </section>

        <div className="table-card">
          <TableToolbar
            title="All Medicines"
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search medicine…"
            filters={toolbarFilters}
          />

          <DataTable columns={MED_COLUMNS} data={pageSlice} renderRow={renderRow} loading={loading} error={adminError ? { message: adminError } : null} emptyMessage="No medicines found." />
          <Pagination currentPage={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={PER_PAGE} onPageChange={setPage} itemLabel="medicines" />
        </div>
      </main>

      {medModal && (
        <Modal title={editingMedId ? "Edit Medicine" : "Add Medicine"} onClose={closeMedModal} size={editingMedId ? "sm" : "lg"}>
          {editingMedId ? (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px" }}>
              <FieldWrap error={medErrors.name} full>
                <label className="mlabel">Medicine Name <Req /></label>
                <input className={`minput${medErrors.name?" err":""}`} placeholder="e.g. Paracetamol" value={medForm.name} onChange={(e) => setField("name", e.target.value)} />
              </FieldWrap>
              <FieldWrap error={medErrors.price}>
                <label className="mlabel">Price (₹) <Req /></label>
                <input className={`minput${medErrors.price?" err":""}`} type="number" step="0.01" min="0.01" placeholder="0.00" value={medForm.price} onChange={(e) => setField("price", e.target.value)} />
              </FieldWrap>
              <FieldWrap error={medErrors.taxPercentage}>
                <label className="mlabel">Tax % <Req /></label>
                <input className={`minput${medErrors.taxPercentage?" err":""}`} type="number" min="0" max="99" placeholder="e.g. 12" value={medForm.taxPercentage} onChange={(e) => setField("taxPercentage", e.target.value)} />
              </FieldWrap>
              <FieldWrap error={medErrors.discountPercentage} full>
                <label className="mlabel">Discount % <Req /></label>
                <input className={`minput${medErrors.discountPercentage?" err":""}`} type="number" min="0" max="99" placeholder="e.g. 10" value={medForm.discountPercentage} onChange={(e) => setField("discountPercentage", e.target.value)} />
              </FieldWrap>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px" }}>
              <FieldWrap error={medErrors.name}><label className="mlabel">Medicine Name <Req /></label><input className={`minput${medErrors.name?" err":""}`} placeholder="e.g. Paracetamol" value={medForm.name} onChange={(e) => setField("name", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.brand}><label className="mlabel">Brand Name <Req /></label><input className={`minput${medErrors.brand?" err":""}`} placeholder="e.g. Calpol" value={medForm.brand} onChange={(e) => setField("brand", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.composition} full><label className="mlabel">Composition <Req /></label><input className={`minput${medErrors.composition?" err":""}`} placeholder="e.g. Paracetamol 500mg" value={medForm.composition} onChange={(e) => setField("composition", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.strength}><label className="mlabel">Strength <Req /></label><input className={`minput${medErrors.strength?" err":""}`} placeholder="e.g. 500mg, 5ml, 1g" value={medForm.strength} onChange={(e) => setField("strength", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.dosageForm}><label className="mlabel">Dosage Form <Req /></label><select className={`mselect${medErrors.dosageForm?" err":""}`} value={medForm.dosageForm} onChange={(e) => setField("dosageForm", e.target.value)}><option value="">Select form</option><option value="tablet">Tablet</option><option value="syrup">Syrup</option><option value="injection">Injection</option></select></FieldWrap>
              <FieldWrap error={medErrors.price}><label className="mlabel">Price (₹) <Req /></label><input className={`minput${medErrors.price?" err":""}`} type="number" step="0.01" min="0.01" placeholder="0.00" value={medForm.price} onChange={(e) => setField("price", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.taxPercentage}><label className="mlabel">Tax % <Req /></label><input className={`minput${medErrors.taxPercentage?" err":""}`} type="number" min="0" max="99" placeholder="e.g. 12" value={medForm.taxPercentage} onChange={(e) => setField("taxPercentage", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.discountPercentage}><label className="mlabel">Discount %</label><input className={`minput${medErrors.discountPercentage?" err":""}`} type="number" min="0" max="99" placeholder="e.g. 10" value={medForm.discountPercentage} onChange={(e) => setField("discountPercentage", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.categoryId}><label className="mlabel">Category <Req /></label><select className={`mselect${medErrors.categoryId?" err":""}`} value={medForm.categoryId} onChange={(e) => setField("categoryId", e.target.value)} disabled={adminLoading && categories.length === 0}><option value="">{adminLoading && categories.length === 0 ? "Loading categories…" : "Select category"}</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></FieldWrap>
              <FieldWrap error={medErrors.manufacturerId}><label className="mlabel">Manufacturer ID <Req /></label><input className={`minput${medErrors.manufacturerId?" err":""}`} type="number" placeholder="e.g. 1" value={medForm.manufacturerId} onChange={(e) => setField("manufacturerId", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.scheduleType}><label className="mlabel">Schedule Type <Req /></label><select className={`mselect${medErrors.scheduleType?" err":""}`} value={medForm.scheduleType} onChange={(e) => setField("scheduleType", e.target.value)}><option value="">Select type</option><option value="otc">OTC (Over the Counter)</option><option value="h1">H1 (Prescription)</option><option value="h2">H2 (Hospital Only)</option><option value="x">Schedule X (Controlled)</option></select></FieldWrap>
              <FieldWrap><div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:18 }}><input type="checkbox" id="rxRequired" checked={medForm.prescriptionRequired} onChange={(e) => setField("prescriptionRequired", e.target.checked)} style={{ width:16, height:16, accentColor:"var(--green)" }} /><label htmlFor="rxRequired" className="mlabel" style={{ marginBottom:0 }}>Prescription Required</label></div></FieldWrap>
              <FieldWrap error={medErrors.storageInstructions} full><label className="mlabel">Storage Instructions <Req /></label><input className={`minput${medErrors.storageInstructions?" err":""}`} placeholder="e.g. Store below 25°C" value={medForm.storageInstructions} onChange={(e) => setField("storageInstructions", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.description} full><label className="mlabel">Description <Req /></label><input className={`minput${medErrors.description?" err":""}`} placeholder="Short description" value={medForm.description} onChange={(e) => setField("description", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.uses} full><label className="mlabel">Uses <Req /></label><input className={`minput${medErrors.uses?" err":""}`} placeholder="e.g. Used for fever and pain relief" value={medForm.uses} onChange={(e) => setField("uses", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.sideEffects} full><label className="mlabel">Side Effects <Req /></label><input className={`minput${medErrors.sideEffects?" err":""}`} placeholder="e.g. Nausea, dizziness" value={medForm.sideEffects} onChange={(e) => setField("sideEffects", e.target.value)} /></FieldWrap>
              <FieldWrap error={medErrors.imageUrl} full><label className="mlabel">Image URL</label><input className={`minput${medErrors.imageUrl?" err":""}`} placeholder="https://…" value={medForm.imageUrl} onChange={(e) => setField("imageUrl", e.target.value)} /></FieldWrap>
            </div>
          )}
          <div className="admin-modal-footer">
            <button className="btn-cancel" onClick={() => { setMedForm(EMPTY_MED_FORM); setMedErrors({}); }}>Reset</button>
            <button className="btn-save" onClick={handleSaveMed} disabled={adminLoading}>
              {adminLoading ? "Saving…" : editingMedId ? "Update Medicine" : "Save Medicine"}
            </button>
          </div>
        </Modal>
      )}

      {availModal.open && (
        <AdminConfirmModal
          title={availModal.action === "not_available" ? "Mark as Unavailable" : "Mark as Available"}
          titleColor={availModal.action === "not_available" ? "#c62828" : "#2e7d32"}
          confirmLabel="Yes, Confirm"
          confirmStyle={{ background: availModal.action === "not_available" ? "#e67e22" : "var(--green)" }}
          loading={adminLoading}
          onClose={() => setAvailModal({ open: false, id: null, name: "", action: "" })}
          onConfirm={confirmAvailability}
          message={
            <>
              Are you sure you want to mark{" "}
              <strong style={{ color: availModal.action === "not_available" ? "#c62828" : "#2e7d32" }}>{availModal.name}</strong>{" "}
              as <strong>{availModal.action === "not_available" ? "unavailable" : "available"}</strong>?
            </>
          }
        />
      )}

      {batchModal && (
        <Modal title={`${editingBatchId ? "Edit" : "Add"} Batch — ${batchMedName}`} onClose={closeBatchModal} size="sm">
          <FieldWrap error={batchErrors.batchNumber}><label className="mlabel">Batch Number <Req /></label><input className={`minput${batchErrors.batchNumber?" err":""}`} placeholder="e.g. BT-101" value={batchForm.batchNumber} onChange={(e) => setBatchField("batchNumber", e.target.value)} /></FieldWrap>
          <FieldWrap error={batchErrors.expiryDate}><label className="mlabel">Expiry Date <Req /></label><input className={`minput${batchErrors.expiryDate?" err":""}`} type="date" min={todayISO()} value={batchForm.expiryDate} onChange={(e) => setBatchField("expiryDate", e.target.value)} /></FieldWrap>
          <FieldWrap error={batchErrors.quantity}><label className="mlabel">Quantity <Req /></label><input className={`minput${batchErrors.quantity?" err":""}`} type="number" min="0" placeholder="e.g. 100" value={batchForm.quantity} onChange={(e) => setBatchField("quantity", e.target.value)} /></FieldWrap>
          <div className="admin-modal-footer">
            <button className="btn-cancel" onClick={closeBatchModal}>Cancel</button>
            <button className="btn-save" onClick={handleSaveBatch} disabled={adminLoading}>{adminLoading ? "Saving…" : editingBatchId ? "Update Batch" : "Save Batch"}</button>
          </div>
        </Modal>
      )}

      {deleteBatchModal.open && (
        <AdminConfirmModal
          title="Delete Batch"
          confirmLabel="Yes, Delete"
          loading={adminLoading}
          onClose={() => setDeleteBatchModal({ open: false, medicineId: null, batchId: null, label: "" })}
          onConfirm={confirmDeleteBatch}
          message={
            <>
              Are you sure you want to delete the batch for{" "}
              <strong style={{ color: "#c62828" }}>{deleteBatchModal.label}</strong>?<br />
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>This will reduce the total stock count.</span>
            </>
          }
        />
      )}

      <style>{`
        .batch-stock-badge { display:inline-block; padding:2px 10px; border-radius:20px; font-size:10.5px; font-weight:700; white-space:nowrap; }
        .bstock-ok       { background:#e8f5e9; color:#2e7d32; }
        .bstock-low      { background:#fff3e0; color:#e65100; }
        .bstock-critical { background:#fce4ec; color:#c62828; }
        .bstock-out      { background:#f5f5f5; color:#757575; }
        .med-icon { width:34px; height:34px; border-radius:10px; background:var(--green-pale); color:var(--green-dark); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; flex-shrink:0; }
        .med-cell { display:flex; align-items:center; gap:10px; }
        .med-name { font-weight:700; color:var(--text-dark); font-size:12.5px; }
        .badge-otc { background:#e3f2fd; color:#1565c0; }
        .badge-h15 { background:#fff3e0; color:#e65100; }
        .batch-count-pill { background:var(--green-pale); color:var(--green-dark); font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; min-width:22px; text-align:center; }
        .batch-icon-btn { width:28px; height:28px; border-radius:7px; font-size:14px; display:flex; align-items:center; justify-content:center; border:1.5px solid #e0e0e0; background:#fff; cursor:pointer; color:#888; transition:all 0.15s; }
        .batch-edit-btn:hover { background:var(--green-bg); color:var(--green-dark); border-color:var(--green); }
        .batch-del-btn:hover  { background:#fce4e4; color:#c62828; border-color:#e57373; }
        .mfield-wrap { margin-bottom: 10px; }
        .mfield-wrap.full { grid-column: 1 / -1; }
      `}</style>

      <div className={`toast${toast.show ? " show" : ""}`} style={toast.error ? { background: "#c62828" } : {}}>{toast.msg}</div>
    </AdminLayout>
  );
}