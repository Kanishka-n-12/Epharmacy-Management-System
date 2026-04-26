// features/prescriptions/services/prescriptionService.js
import api from "../../../api";

const prescriptionService = {

  getPrescriptions: () =>
    api.get("/prescriptions").then((r) => r.data),

  getPrescription: (id) =>
    api.get(`/prescriptions/${id}`).then((r) => r.data),

  /**
   * Upload a file for OCR scanning.
   * Returns OcrResultDTO: { rawText, filePath, doctorName,
   *   doctorRegisteredId, prescribedDate, medicines[] }
   */
  scanPrescription: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post("/prescriptions/ocr", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  /**
   * Submit the reviewed/corrected prescription data.
   * dto = { filePath, doctorName, doctorRegisteredId,
   *         prescribedDate, medicines[] }
   */
  uploadPrescription: (dto) =>
    api.post("/prescriptions", dto).then((r) => r.data),

  deletePrescription: (id) =>
    api.delete(`/prescriptions/${id}`).then((r) => r.data),


  getFileUrl: (prescriptionId) => {
  if (!prescriptionId) return null;
  return `http://localhost:8080/api/prescriptions/${prescriptionId}/file`;
},
};

export default prescriptionService;