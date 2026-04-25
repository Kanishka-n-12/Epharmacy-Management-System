
import api from "../../../api";

const userService = {
  fetchAll: (page = 0, size = 10) =>
  api.get(`/admin/users?page=${page}&size=${size}`).then(r => r.data),
  
  fetchStats: () =>
    api.get("/admin/users/stats").then(r => r.data),

  create: (userData) =>
    api
      .post("/admin/users", {
        ...userData,
        password: userData.password || "Default@123",
        roleId: userData.roleId ?? 2,
        status: userData.status || "active",
      })
      .then((r) => r.data),

  update: (id, data) => api.put(`/admin/users/${id}`, data).then((r) => r.data),

  setStatus: (id, newStatus) =>
    api.patch(`/admin/users/${id}/${newStatus}`).then((r) => r.data),
};

export default userService;