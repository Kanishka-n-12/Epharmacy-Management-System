
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchUserStats, createUser, updateUser, toggleUserStatus } from "../../users/slice/userThunks"

import AdminLayout    from "../layouts/AdminLayout";
import StatisticsCard from "../components/StatisticsCard";
import DataTable      from "../components/DataTable";
import DataRow        from "../components/DataRow";
import Pagination     from "../components/Pagination";
import ActionMenu     from "../components/ActionMenu";
import Modal          from "../components/Modal";
import UserForm       from "../components/UserForm";
import UserViewDetail from "../components/UserViewDetail";
import Toast          from "../components/Toast";

import TableToolbar      from "../components/TableToolbar";
import AdminConfirmModal from "../components/AdminConfirmModal";
import StatusBadge       from "../components/StatusBadge";

const PER_PAGE = 10;

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", phone: "",
  gender: "", roleId: "", status: "", username: "", password: "",
};

const columns = [
  { header: "#" }, { header: "User" }, { header: "Phone" },
  { header: "Gender" }, { header: "Role" }, { header: "Status" },
  { header: "Joined" }, { header: "Actions" },
];

const VALIDATION = {
  firstName: (v) => {
    if (!v) return "First name is required.";
    if (!/^[A-Za-z\s'\-]+$/.test(v)) return "Letters only.";
    if (v.length < 2) return "Min 2 characters.";
    if (v.length > 50) return "Max 50 characters.";
    return null;
  },
  lastName: (v) => {
    if (!v) return "Last name is required.";
    if (!/^[A-Za-z\s'\-]+$/.test(v)) return "Letters only.";
    if (v.length > 50) return "Max 50 characters.";
    return null;
  },
  email: (v) => {
    if (!v) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email.";
    return null;
  },
  phone: (v) => {
  if (!v) return "Phone is required.";
  if (!/^[6-9]\d{9}$/.test(v)) 
    return "Must start with 6-9 and be exactly 10 digits.";
  return null;
},
  gender:   (v) => (!v ? "Please select a gender." : null),
  roleId:   (v) => (!v ? "Please select a role."   : null),
  status:   (v) => (!v ? "Please select a status."  : null),
  password: (v) => {
    if (!v) return "Password is required.";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v))
      return "Min 8 chars, 1 Upper, 1 Lower, 1 Number, 1 Special.";
    return null;
  },
};

const fullName = (u) =>
  u?.firstName ? `${u.firstName} ${u.lastName}`.trim() : `(${u?.phone})`;

const initial = (u) =>
  u?.firstName ? u.firstName[0].toUpperCase() : (u?.phone || "?")[0];

export default function UserManagementPage() {

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
 
const { users, loading, error, totalPages, totalElements, stats: userStats = { total: 0, active: 0, inactive: 0, admin: 0, newToday: 0 } } = useSelector((s) => s.users);


  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [page,         setPage]         = useState(1);

  const [viewUser,         setViewUser]         = useState(null);
  const [editModal,        setEditModal]         = useState(false);
  const [editingId,        setEditingId]         = useState(null);
  const [deactivateTarget, setDeactivateTarget]  = useState(null);

  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [savingForm, setSavingForm] = useState(false);


  useEffect(() => {
  dispatch(fetchUsers({ page: page - 1, size: PER_PAGE, search, status: statusFilter, role: roleFilter }));
}, [dispatch, page, search, statusFilter, roleFilter]);

useEffect(() => {
  dispatch(fetchUserStats());
}, [dispatch]);

  const slice = users;   

  const today = new Date().toISOString().slice(0, 10);
  const stats = [
  { icon: "👥", value: userStats.total,    label: "Total Users",    color: "#52a468" },
  { icon: "✅", value: userStats.active,   label: "Active Users",   color: "#2980b9" },
  { icon: "🚫", value: userStats.inactive, label: "Inactive Users", color: "#e74c3c" },
  { icon: "👑", value: userStats.admin,    label: "Admins",         color: "#8e44ad" },
  { icon: "🆕", value: userStats.newToday, label: "Added Today",    color: "#e67e22" },
];  

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (VALIDATION[field]) {
      const err = VALIDATION[field](value);
      setFormErrors((e) => ({ ...e, [field]: err }));
    }
  };

  

  const validateAll = (isEdit) => {
    const fields = ["firstName", "lastName", "email", "phone", "gender", "roleId", "status"];
    if (!isEdit) fields.push("password");
    const errs = {};
    fields.forEach((f) => {
      if (VALIDATION[f]) {
        const msg = VALIDATION[f](form[f]);
        if (msg) errs[f] = msg;
      }
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd = () => {
    setEditingId(null); setForm(EMPTY_FORM); setFormErrors({}); setEditModal(true);
  };

  const openEdit = (u) => {
    setEditingId(u.userId);
    setForm({
      firstName: u.firstName || "", lastName: u.lastName  || "",
      email: u.email || "", phone: u.phone || "", gender: u.gender || "",
      roleId: String(u.roleId ?? u.role ?? ""), status: u.status || "",
      username: u.username || "", password: "",
    });
    setFormErrors({}); setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false); setEditingId(null); setForm(EMPTY_FORM); setFormErrors({});
  };

  const handleSave = async () => {
    const isEdit = !!editingId;
    if (!validateAll(isEdit)) return;
    setSavingForm(true);
    try {
      const payload = {
        ...form, roleId: parseInt(form.roleId),
        username: form.username || `${form.firstName}_${form.phone}`,
      };
      if (isEdit) {
        const { password, ...rest } = payload;
        await dispatch(updateUser({ id: editingId, data: rest })).unwrap();
        showToast("User updated successfully ✓");
      } else {
        await dispatch(createUser(payload)).unwrap();
        showToast("User added successfully ✓");
      }
      closeEditModal();
      dispatch(fetchUserStats());
    } catch (e) {
      showToast(e?.message || "Something went wrong.", true);
    } finally {
      setSavingForm(false);
    }
  };

  const handleToggle = async (u) => {
    try {
      await dispatch(toggleUserStatus({ id: u.userId, currentStatus: u.status })).unwrap();
      const next = u.status === "active" ? "deactivated" : "activated";
      showToast(`${fullName(u)} ${next} ✓`);
      dispatch(fetchUserStats());
    } catch {
      showToast("Status update failed.", true);
    }
    setDeactivateTarget(null);
  };

  const renderRow = (u, i) => {
    const roleId   = u.roleId ?? u.role;
    const isActive = u.status === "active";
    const idx = (page - 1) * PER_PAGE + i + 1;

    const actions = [
      { label: "View", onClick: () => setViewUser(u) },
      { label: "Edit", onClick: () => openEdit(u) },
      {
        label:     isActive ? "Deactivate" : "Activate",
        className: isActive ? "dd-del"     : "dd-act",
        onClick:   () => isActive ? setDeactivateTarget(u) : handleToggle(u),
      },
    ];

    return (
      <DataRow key={u.userId}>
        <td className="td-idx">{idx}</td>
        <td>
          <div className="user-cell">
            <div className="avatar-cell">{initial(u)}</div>
            <div>
              <div className="user-cell-name">{fullName(u)}</div>
              <div className="user-cell-email">{u.email || "—"}</div>
            </div>
          </div>
        </td>
        <td>{u.phone}</td>
        <td className="td-cap">{u.gender || "—"}</td>
        <td><span className="role-text">{roleId === 1 ? "Admin" : "User"}</span></td>
        <td>
          <StatusBadge status={u.status} preset="user" />
        </td>
        <td>{(u.createdAt || u.created || "").slice(0, 10) || "—"}</td>
        <td><ActionMenu actions={actions} /></td>
      </DataRow>
    );
  };

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
    {
      type: "select",
      value: roleFilter,
      onChange: (v) => { setRoleFilter(v); setPage(1); },
      options: [
        { value: "", label: "All Roles" },
        { value: "1", label: "Admin" },
        { value: "2", label: "User" },
      ],
    },
  ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="page-heading">
          <h1 className="page-title">User Management</h1>
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
  <button
    onClick={openAdd}
    style={{
      backgroundColor: "#52a468",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      fontWeight: "600",
      cursor: "pointer"
    }}
  >
    + Add User
  </button>
</div>
        </div>

        <section className="stats-grid">
          {stats.map((s) => <StatisticsCard key={s.label} {...s} />)}
        </section>

        <div className="table-card">
          <TableToolbar
            title="All Users"
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search name, email, phone…"
            filters={toolbarFilters}
          />

          <DataTable
            columns={columns} data={slice} renderRow={renderRow}
            loading={loading} error={error} emptyMessage="No users found."
          />

          <Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalElements}
  itemsPerPage={PER_PAGE}
  onPageChange={setPage}
  itemLabel="users"
/>
        </div>
      </main>

   
      {viewUser && (
        <Modal title="User Details" onClose={() => setViewUser(null)} size="lg">
          <UserViewDetail u={viewUser} />
        </Modal>
      )}

     
      {editModal && (
        <Modal title={editingId ? "Edit User" : "Add New User"} onClose={closeEditModal} size="lg">
          <UserForm form={form} errors={formErrors} isEdit={!!editingId} onChange={handleFormChange} />
          <div className="modal-footer">
            <button className="btn-cancel btn btn-danger" style = {{margin:"10px"}}  onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }}>Reset</button>
            <button className="btn-save" onClick={handleSave} disabled={savingForm}>
              {savingForm ? "Saving…" : "Save User"}
            </button>
          </div>
        </Modal>
      )}

      {deactivateTarget && (
        <AdminConfirmModal
          title="Deactivate User"
          confirmLabel="Yes, Deactivate"
          onClose={() => setDeactivateTarget(null)}
          onConfirm={() => handleToggle(deactivateTarget)}
          message={
            <>
              Are you sure you want to deactivate{" "}
              <strong>{fullName(deactivateTarget)}</strong>?<br />
              The account will be set to <em>Inactive</em>. You can reactivate it anytime.
            </>
          }
        />
      )}

      <Toast show={toast.show} msg={toast.msg} />
    </AdminLayout>
  );
}