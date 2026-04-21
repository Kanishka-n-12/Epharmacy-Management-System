
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
  fetchCategories, fetchCategoryStats, addCategory,
  updateCategory, updateCategoryStatus,
} from "../../categories/slices/categoryAdminSlice";

import TableToolbar      from "../components/TableToolbar";
import AdminConfirmModal from "../components/AdminConfirmModal";
import StatusBadge       from "../components/StatusBadge";
import Required from "../../../components/ui/Required";

const PER_PAGE = 10;

const COLUMNS = [
  { header: "#" }, { header: "Category Name" },
  { header: "Status" }, { header: "Actions" },
];

const EMPTY_FORM = { name: "", status: "" };

function applyFilter(categories, search, statusFilter) {
  return categories.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });
}


export default function CategoryManagement() {

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
  const { categories, stats, loading, adminLoading, adminError } = useSelector(
    (s) => s.categories
  );

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [deactivateModal, setDeactivateModal] = useState({ open: false, id: null, name: "" });

  

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCategoryStats());
  }, [dispatch]);

  const filtered   = applyFilter(categories, search, statusFilter).slice().reverse();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const start      = (safePage - 1) * PER_PAGE;
  const pageSlice  = filtered.slice(start, start + PER_PAGE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  function openAddModal() {
    setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true);
  }

  function openEditModal(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, status: cat.status?.toLowerCase() });
    setFormErrors({}); setModalOpen(true);
  }

  function closeEditModal() {
    setModalOpen(false); setEditingId(null); setForm(EMPTY_FORM); setFormErrors({});
  }

  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Category name is required.";
    if (!form.status) errors.status = "Please select a status.";
    return errors;
  }

  async function handleSave() {
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    if (editingId) {
      const result = await dispatch(updateCategory({ id: editingId, payload: { name: form.name.trim(), status: form.status } }));
      if (updateCategory.fulfilled.match(result)) {
        showToast("Category updated successfully");
        dispatch(fetchCategoryStats()); dispatch(fetchCategories());
      } else {
        showToast(result.payload || "Update failed", true);
      }
    } else {
      const result = await dispatch(addCategory({ categoryName: form.name.trim() }));
      if (addCategory.fulfilled.match(result)) {
        showToast("Category added successfully");
        dispatch(fetchCategoryStats()); dispatch(fetchCategories());
      } else {
        showToast(result.payload || "Add failed", true);
      }
    }
    closeEditModal();
  }

  async function confirmDeactivate() {
    const result = await dispatch(updateCategoryStatus({ id: deactivateModal.id, status: "inactive" }));
    if (updateCategoryStatus.fulfilled.match(result)) {
      showToast(`"${deactivateModal.name}" has been deactivated`);
      dispatch(fetchCategoryStats()); dispatch(fetchCategories());
    }
    setDeactivateModal({ open: false, id: null, name: "" });
  }

  async function handleActivate(cat) {
    const result = await dispatch(updateCategoryStatus({ id: cat.id, status: "active" }));
    if (updateCategoryStatus.fulfilled.match(result)) {
      showToast(`"${cat.name}" has been activated`);
      dispatch(fetchCategoryStats()); dispatch(fetchCategories());
    }
  }

  function renderRow(cat, index) {
    const isActive = cat.status?.toLowerCase() === "active";
    const actions = [
      { label: "Edit", onClick: () => openEditModal(cat) },
      isActive
        ? { label: "Deactivate", className: "dd-deactivate", onClick: () => setDeactivateModal({ open: true, id: cat.id, name: cat.name }) }
        : { label: "Activate",   className: "dd-activate",   onClick: () => handleActivate(cat) },
    ];

    return (
      <DataRow key={cat.id}>
        <td className="td-num">{start + index + 1}</td>
        <td className="td-name">{cat.name}</td>
        <td>
          {/* ── shared StatusBadge ── */}
          <StatusBadge status={cat.status} preset="user" />
        </td>
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
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="page-heading">
          <h1 className="page-title">Category Management</h1>
          <button
            onClick={openAddModal}
            style={{ backgroundColor:"#52a468", color:"#fff", border:"none",
              padding:"8px 16px", borderRadius:"6px", fontWeight:"600", cursor:"pointer" }}
          >
            + Add Category
          </button>
        </div>

        <section className="stats-grid">
          <StatisticsCard icon="📄" value={stats?.total    ?? categories.length}                                                          label="Total Categories" color="#52a468" />
          <StatisticsCard icon="✓"  value={stats?.active   ?? categories.filter((c) => c.status?.toLowerCase() === "active").length}   label="Active"           color="#2980b9" />
          <StatisticsCard icon="⊘"  value={stats?.inactive ?? categories.filter((c) => c.status?.toLowerCase() === "inactive").length} label="Inactive"         color="#e74c3c" />
        </section>

        <div className="table-card">
          {/* ── shared TableToolbar ── */}
          <TableToolbar
            title="All Categories"
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search category name…"
            filters={toolbarFilters}
          />

          <DataTable
            columns={COLUMNS} data={pageSlice} renderRow={renderRow}
            loading={loading} error={adminError ? { message: adminError } : null}
            emptyMessage="No categories found."
          />

          <Pagination
            currentPage={safePage} totalPages={totalPages} totalItems={filtered.length}
            itemsPerPage={PER_PAGE} onPageChange={setPage} itemLabel="categories"
          />
        </div>
      </main>

      {modalOpen && (
        <Modal title={editingId ? "Edit Category" : "Add Category"} onClose={closeEditModal} size="md">
          <div className="mfield">
            <label className="mlabel">Category Name <span style={{ color: "var(--red)" }}>*</span></label>
            <input
              className={`minput${formErrors.name ? " err" : ""}`}
              placeholder="Enter category name"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); if (formErrors.name) setFormErrors((fe) => ({ ...fe, name: "" })); }}
            />
            {formErrors.name && <div className="merr show">{formErrors.name}</div>}
          </div>

          <div className="mfield">
            <label className="mlabel">Status <span style={{ color: "var(--red)" }}>*</span></label>
            <select
              className={`mselect${formErrors.status ? " err" : ""}`}
              value={form.status}
              onChange={(e) => { setForm((f) => ({ ...f, status: e.target.value })); if (formErrors.status) setFormErrors((fe) => ({ ...fe, status: "" })); }}
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {formErrors.status && <div className="merr show">{formErrors.status}</div>}
          </div>

          <div className="admin-modal-footer">
            <button className="btn-cancel" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }}>Reset</button>
            <button className="btn-save" onClick={handleSave} disabled={adminLoading}>
              {adminLoading ? "Saving…" : "Save Category"}
            </button>
          </div>
        </Modal>
      )}

      {deactivateModal.open && (
        <AdminConfirmModal
          title="Deactivate Category"
          loading={adminLoading}
          confirmLabel="Yes, Deactivate"
          onClose={() => setDeactivateModal({ open: false, id: null, name: "" })}
          onConfirm={confirmDeactivate}
          message={
            <>
              Are you sure you want to deactivate{" "}
              <strong style={{ color: "#c62828" }}>{deactivateModal.name}</strong>?
            </>
          }
        />
      )}

      <div className={`toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
    </AdminLayout>
  );
}