import React from "react";
import "./css/DataTable.css"

export default function DataTable({
  columns = [],
  data = [],
  renderRow,
  loading = false,
  error = null,
  emptyMessage = "No data found",
}) {
  return (
    <div className="tbl-wrap">
      {loading ? (
        <div className="tbl-empty">Loading...</div>
      ) : error ? (
        <div className="tbl-empty tbl-error">
          {error?.message || "Something went wrong"}
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="tbl-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => renderRow(row, index))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}