// features/prescriptions/services/prescriptionService.js
import api from "../../../api";

const prescriptionService = {

  getPrescriptions: () => api.get("/prescriptions").then((r) => r.data),

  getPrescription: (id) => api.get(`/prescriptions/${id}`).then((r) => r.data),

  uploadPrescription: (dto) => api.post("/prescriptions", dto).then((r) => r.data),

  deletePrescription: (id) => api.delete(`/prescriptions/${id}`).then((r) => r.data),

};

export default prescriptionService;