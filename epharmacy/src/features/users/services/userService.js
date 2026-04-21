// features/users/userService.js
import api from "../../../api";

const userService = {
  /** GET /admin/users */
  fetchAll: () => api.get("/admin/users").then((r) => r.data),

  /** POST /admin/users */
  create: (userData) =>
    api
      .post("/admin/users", {
        ...userData,
        password: userData.password || "Default@123",
        roleId: userData.roleId ?? 2,
        status: userData.status || "active",
      })
      .then((r) => r.data),

  /** PUT /admin/users/:id */
  update: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),

  /** PATCH /admin/users/:id/active|inactive */
  setStatus: (id, newStatus) =>
    api.patch(`/admin/users/${id}/${newStatus}`).then((r) => r.data),
};

export default userService;