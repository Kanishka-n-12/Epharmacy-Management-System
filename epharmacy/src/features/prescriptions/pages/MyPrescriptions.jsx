// features/prescriptions/pages/MyPrescriptions.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
  fetchPrescriptions,
  uploadPrescription,
  deletePrescription,
  
} from "../slices/prescriptionThunks";

import {clearUploadMessages,
  clearDeleteMessages,} from "../slices/prescriptionSlice";

import prescriptionService from "../services/prescriptionService";

// ── Reused from existing features ──
import ProfileSidebar from "../../users/components/ProfileSidebar";
import LoadingState from "../../home/components/LoadingState";
import ErrorState from "../../home/components/ErrorState";
import DataTable from "../../admin/components/DataTable";
import DataRow from "../../admin/components/DataRow";
import EmptyOrders from "../../orders/components/EmptyOrders";

// ── Prescription-specific components ──
import PrescriptionStatusBadge from "../components/PrescriptionStatusBadge";
import PrescriptionDetailModal from "../components/PrescriptionDetailModal";
import UploadPrescriptionModal from "../components/UploadPrescriptionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

import "../css/MyPrescriptions.css";

const COLUMNS = [
  { header: "#"          },
  { header: "File"       },
  { header: "Doctor"     },
  { header: "Prescribed" },
  { header: "Uploaded"   },
  { header: "Status"     },
  { header: "Actions"    },
];

export default function MyPrescriptions() {
  const dispatch = useDispatch();
  const {
    prescriptions,
    loading,
    error,
    uploading,
    uploadSuccess,
    uploadError,
    deleting,
    deleteSuccess,
    deleteError,
  } = useSelector((s) => s.userPrescriptions);

  const [detailPrescription, setDetailPrescription] = useState(null);
  const [deleteTarget, setDeleteTarget]             = useState(null);
  const [showUploadModal, setShowUploadModal]       = useState(false);

  /* ── Fetch on mount ── */
  useEffect(() => {
    dispatch(fetchPrescriptions());
  }, [dispatch]);

  /* ── Toast on upload result ── */
  useEffect(() => {
    if (uploadSuccess) {
      toast.success(uploadSuccess);
      dispatch(clearUploadMessages());
      setShowUploadModal(false);
    }
    if (uploadError) {
      toast.error(
        typeof uploadError === "string"
          ? uploadError
          : uploadError?.message || "Upload failed. Please try again."
      );
      dispatch(clearUploadMessages());
    }
  }, [uploadSuccess, uploadError, dispatch]);

  /* ── Toast on delete result ── */
  useEffect(() => {
    if (deleteSuccess) {
      toast.success(deleteSuccess);
      dispatch(clearDeleteMessages());
    }
    if (deleteError) {
      toast.error("Failed to delete prescription. Please try again.");
      dispatch(clearDeleteMessages());
    }
  }, [deleteSuccess, deleteError, dispatch]);

  /* ── Handlers ── */
  function handleUploadSubmit(dto) {
    dispatch(uploadPrescription(dto));
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    dispatch(deletePrescription(deleteTarget.prescriptionId)).then(() => {
      setDeleteTarget(null);
      if (detailPrescription?.prescriptionId === deleteTarget.prescriptionId) {
        setDetailPrescription(null);
      }
    });
  }

  /* ── Row renderer for DataTable ── */
  function renderRow(prescription, index) {
    const {
      prescriptionId,
      filePath,
      doctorName,
      uploadedDate,
      prescribedDate,
      approvalStatus,
    } = prescription;

    const fileName = filePath
      ? filePath.split("/").pop()
      : `Prescription #${prescriptionId}`;

    const isImage = /\.(jpg|jpeg|png|webp)$/i.test(filePath || "");

    const fmtDate = (d) =>
      d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";

    return (
      <DataRow key={prescriptionId}>
        <td>{index + 1}</td>
        <td>
  <a
    href={prescriptionService.getFileUrl(filePath)}
    target="_blank"
    rel="noopener noreferrer"
    className="rx-filename-cell"
    title={fileName}
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <span>{isImage ? "🖼️" : "📄"}</span>
    {fileName}
  </a>
</td>
        <td>{doctorName || "—"}</td>
        <td>{fmtDate(prescribedDate)}</td>
        <td>{fmtDate(uploadedDate)}</td>
        <td>
          <PrescriptionStatusBadge status={approvalStatus} />
        </td>
        <td>
          <div className="rx-tbl-actions">
            <button
              className="rx-btn-view"
              onClick={() => setDetailPrescription(prescription)}
            >
              👁️ View
            </button>
            <button
              className="rx-btn-delete"
              onClick={() => setDeleteTarget(prescription)}
            >
              🗑️
            </button>
          </div>
        </td>
      </DataRow>
    );
  }

  return (
    <div className="my-prescriptions-page">

      {/* ── Breadcrumb ── */}
      <div className="prescriptions-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span className="sep"> &gt; </span>
          <span className="active">My Prescriptions</span>
        </div>
      </div>

      {/* ── Main ── */}
      <section className="prescriptions-main">
        <div className="container">

          {loading && <LoadingState />}
          {!loading && error && <ErrorState error={error?.message || error} />}

          {!loading && !error && (
            <div className="prescriptions-layout">

              {/* Sidebar */}
              <aside className="prescriptions-sidebar-col">
                <ProfileSidebar activeLink="prescriptions" />
              </aside>

              {/* Content */}
              <div className="prescriptions-content-col">
                <div className="prescriptions-card">

                  {/* Header */}
                  <div className="prescriptions-header">
                    <h5 className="prescriptions-title">MY PRESCRIPTIONS</h5>
                    <button
                      className="rx-upload-btn"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <span>＋</span> Upload Prescription
                    </button>
                  </div>

                  {/* Empty state — reusing EmptyOrders */}
                  {prescriptions.length === 0 ? (
                    <EmptyOrders filtered={false} />
                  ) : (
                    <DataTable
                      columns={COLUMNS}
                      data={prescriptions}
                      renderRow={renderRow}
                    />
                  )}

                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <UploadPrescriptionModal
          onSubmit={handleUploadSubmit}
          onClose={() => setShowUploadModal(false)}
          uploading={uploading}
        />
      )}

      {/* ── Detail Modal ── */}
      {detailPrescription && (
        <PrescriptionDetailModal
          prescription={detailPrescription}
          onClose={() => setDetailPrescription(null)}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          prescription={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}