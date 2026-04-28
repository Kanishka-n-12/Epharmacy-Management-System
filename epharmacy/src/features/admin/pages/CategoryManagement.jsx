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
} from "../../categories/slices/categoryAdminThunks";

import TableToolbar      from "../components/TableToolbar";
import AdminConfirmModal from "../components/AdminConfirmModal";
import StatusBadge       from "../components/StatusBadge";

const PER_PAGE = 10;

const COLUMNS = [
  { header: "#" }, { header: "Category Name" },
  { header: "Status" }, { header: "Actions" },
];

const EMPTY_FORM = { name: "", status: "" };

export default function CategoryManagement() {

  const dispatch = useDispatch();
  const { loading, adminLoading } = useSelector((s) => s.categories);

  const [toast,           setToast]           = useState({ show: false, msg: "", error: false });
  const [localCategories, setLocalCategories] = useState([]);
  const [localTotalPages, setLocalTotalPages] = useState(1);
  const [localTotal,      setLocalTotal]      = useState(0);
  const [localStats,      setLocalStats]      = useState({ total: 0, activeCount: 0, inactiveCount: 0 });

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [deactivateModal, setDeactivateModal] = useState({ open: false, id: null, name: "" });

  function showToast(msg, error = false) {
    setToast({ show: true, msg, error });
    setTimeout(() => setToast({ show: false, msg: "", error: false }), 3000);
  }

  function refreshData() {
  dispatch(fetchCategories({
    page: page - 1,
    size: PER_PAGE,
    search,
    status: statusFilter,
  })).then((result) => {
    if (fetchCategories.fulfilled.match(result)) {
      const data = result.payload;
      const raw  = data?.content ?? (Array.isArray(data) ? data : []);
      setLocalCategories([...raw]);
      setLocalTotalPages(data?.totalPages    ?? 1);
      setLocalTotal(     data?.totalElements ?? 0);
    }
  });

  dispatch(fetchCategoryStats()).then((result) => {
    if (fetchCategoryStats.fulfilled.match(result)) {
      setLocalStats(result.payload);
    }
  });
}

  useEffect(() => {
  refreshData();
}, [dispatch, page, search, statusFilter]);

  const slice = localCategories;

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
        refreshData();
      } else {
        showToast(result.payload || "Update failed", true);
      }
    } else {
      const result = await dispatch(addCategory({ categoryName: form.name.trim() }));
      if (addCategory.fulfilled.match(result)) {
        showToast("Category added successfully");
        refreshData();
      } else {
        showToast(result.payload || "Add failed", true);
      }
    }
    closeEditModal();
  }

  async function confirmDeactivate() {
    try {
      await dispatch(
        updateCategoryStatus({ id: deactivateModal.id, status: "inactive" })
      ).unwrap();
      showToast(`"${deactivateModal.name}" has been deactivated`);
      refreshData();
      setDeactivateModal({ open: false, id: null, name: "" });
    } catch (err) {
      showToast(err || "Failed to deactivate category", true);
    }
  }

  async function handleActivate(cat) {
    try {
      await dispatch(
        updateCategoryStatus({ id: cat.id, status: "active" })
      ).unwrap();
      showToast(`"${cat.name}" has been activated`);
      refreshData();
    } catch (err) {
      showToast(err || "Failed to activate category", true);
    }
  }

  function renderRow(cat, index) {
    const isActive = cat.status?.toLowerCase() === "active";
    const idx = (page - 1) * PER_PAGE + index + 1;
    const actions = [
      { label: "Edit", onClick: () => openEditModal(cat) },
      isActive
        ? { label: "Deactivate", className: "dd-deactivate", onClick: () => setDeactivateModal({ open: true, id: cat.id, name: cat.name }) }
        : { label: "Activate",   className: "dd-activate",   onClick: () => handleActivate(cat) },
    ];

    return (
      <DataRow key={cat.id}>
        <td className="td-num">{idx}</td>
        <td className="td-name">{cat.name}</td>
        <td><StatusBadge status={cat.status} preset="user" /></td>
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
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <button onClick={openAddModal} style={{
              backgroundColor: "#52a468", color: "#fff", border: "none",
              padding: "8px 16px", borderRadius: "6px", fontWeight: "600", cursor: "pointer",
            }}>
              + Add Category
            </button>
          </div>
        </div>

        <section className="stats-grid">
          <StatisticsCard icon="📄" value={localStats.total         ?? 0} label="Total Categories" color="#52a468" />
          <StatisticsCard icon="✓"  value={localStats.activeCount   ?? 0} label="Active"           color="#2980b9" />
          <StatisticsCard icon="⊘"  value={localStats.inactiveCount ?? 0} label="Inactive"         color="#e74c3c" />
        </section>

        <div className="table-card">
          <TableToolbar
            title="All Categories"
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search category name…"
            filters={toolbarFilters}
          />

          <DataTable
            columns={COLUMNS} data={slice} renderRow={renderRow}
            loading={loading} error={null}
            emptyMessage="No categories found."
          />

          <Pagination
            currentPage={page}
            totalPages={localTotalPages}
            totalItems={localTotal}
            itemsPerPage={PER_PAGE}
            onPageChange={setPage}
            itemLabel="categories"
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
            <>Are you sure you want to deactivate{" "}
              <strong style={{ color: "#c62828" }}>{deactivateModal.name}</strong>?
            </>
          }
        />
      )}

      <div className={`toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
    </AdminLayout>
  );
}