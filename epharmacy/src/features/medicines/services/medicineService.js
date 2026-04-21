import api from "../../../api";

export const getAllMedicines = (search) =>
  api.get("/medicines", { params: search ? { search } : {} }).then((r) => r.data);

export const getMedicineById = (id) =>
  api.get(`/medicines/${id}`).then((r) => r.data);

export const getNewLaunches = () =>
  api.get("/medicines/new-launches").then((r) => r.data);

export const getMedicineStats = () =>
  api.get("/admin/medicines/stats").then((r) => r.data);

export const addMedicine = (dto) =>
  api.post("/admin/medicines", dto).then((r) => r.data);

export const getMedicineForAdmin = (dto) =>
  api.get("/admin/all-medicines", dto).then((r) => r.data);

export const updateMedicine = (id, dto) =>
  api.put(`/admin/medicines/${id}`, dto).then((r) => r.data);

export const updateMedicineAvailability = (id, status) =>
  api
    .patch(`/admin/medicines/${id}/availability`, { status })
    .then((r) => r.data);

export const getBatchesByMedicine = (medicineId) =>
  api.get(`/admin/medicines/${medicineId}/batches`).then((r) => r.data);

export const addBatch = (medicineId, dto) =>
  api.post(`/admin/medicines/${medicineId}/batches`, dto).then((r) => r.data);

export const updateBatch = (medicineId, batchId, dto) =>
  api
    .put(`/admin/medicines/${medicineId}/batches/${batchId}`, dto)
    .then((r) => r.data);

export const deleteBatch = (medicineId, batchId) =>
  api
    .patch(`/admin/medicines/${medicineId}/batches/${batchId}`)
    .then((r) => r.data);