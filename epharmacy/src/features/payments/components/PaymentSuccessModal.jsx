import "../css/PaymentSuccessModal.css";
import { useNavigate } from "react-router-dom";
import { getInvoice } from "../service/paymentService";
import { useState } from "react";

export default function PaymentSuccessModal({ orderId, amount, method, onGoHome }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadInvoice() {
    setDownloading(true);
    try {
      const invoice = await getInvoice(orderId);
      generateInvoicePDF(invoice);
    } catch (err) {
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function generateInvoicePDF(inv) {
    const rows = inv.items?.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.medicineName}<br/><span style="font-size:11px;color:#666">${item.brand || ""}</span></td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">₹${item.unitPrice?.toFixed(2)}</td>
        <td style="text-align:right">₹${item.subtotal?.toFixed(2)}</td>
      </tr>
    `).join("") || "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Invoice - Order #${inv.orderId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 32px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 800; color: #28a745; letter-spacing: 2px; }
          .brand-sub { font-size: 11px; color: #666; margin-top: 2px; }
          .invoice-title { font-size: 18px; font-weight: 700; color: #333; text-align: right; }
          .invoice-meta { font-size: 11px; color: #666; text-align: right; margin-top: 4px; }
          .divider { border: none; border-top: 2px solid #28a745; margin: 16px 0; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .info-box h4 { font-size: 11px; text-transform: uppercase; color: #28a745; margin-bottom: 6px; letter-spacing: 1px; }
          .info-box p { font-size: 12px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          thead tr { background: #28a745; color: white; }
          thead th { padding: 9px 10px; text-align: left; font-size: 12px; }
          tbody tr:nth-child(even) { background: #f9f9f9; }
          tbody td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #eee; }
          .totals { margin-left: auto; width: 260px; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
          .totals-row.final { font-weight: 700; font-size: 15px; color: #28a745; border-top: 2px solid #28a745; padding-top: 8px; margin-top: 4px; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; }
          .status-pill { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;
            background: #d4edda; color: #155724; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">EPHARMACY</div>
            <div class="brand-sub">Uttharappan Nagar, Salem - 636010</div>
            <div class="brand-sub">epharmacy@gmail.com</div>
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">Order #${inv.orderId}</div>
            <div class="invoice-meta">Date: ${inv.orderDate}</div>
            <div class="invoice-meta">
              <span class="status-pill">${inv.paymentStatus}</span>
            </div>
          </div>
        </div>

        <hr class="divider"/>

        <div class="info-grid">
          <div class="info-box">
            <h4>Bill To</h4>
            <p><strong>${inv.customerName}</strong></p>
            <p>${inv.customerPhone}</p>
            <p>${inv.address || "N/A"}</p>
          </div>
          <div class="info-box">
            <h4>Payment Info</h4>
            <p>Method: <strong>${inv.paymentMethod}</strong></p>
            <p>Transaction ID: <strong>${inv.transactionId || "N/A"}</strong></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Unit Price</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>₹${inv.totalAmount?.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Delivery Charge</span>
            <span>₹${inv.deliveryCharge?.toFixed(2)}</span>
          </div>
          <div class="totals-row final">
            <span>Total Paid</span>
            <span>₹${inv.finalAmount?.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          Thank you for shopping with E-Pharmacy! &nbsp;|&nbsp; This is a computer-generated invoice.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `Invoice_Order_${inv.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="popup-overlay show">
      <div className="success-popup">
        <div className="success-icon-ring">
          <div className="checkmark-wrapper">
            <svg viewBox="0 0 52 52" className="checkmark-svg">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14 27 l8 8 16-16" />
            </svg>
          </div>
        </div>

        <h4 className="popup-title">Payment Successful!</h4>
        <p className="popup-msg">
          Your order has been placed successfully.<br />
          Thank you for shopping with E-Pharmacy!
        </p>
        <div className="popup-order">
          Order ID: <strong>{orderId}</strong>
        </div>
        <div className="popup-amount">
          Amount Paid:{" "}
          <strong>
            ₹{amount?.toFixed(2)}
            {method === "Cash on Delivery" ? " (COD)" : ""}
          </strong>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
          <button className="btn-go-home" onClick={() => navigate("/")}>
            Go to Home
          </button>
          <button
            className="btn-go-home"
            style={{ background: "linear-gradient(135deg, #0d6efd, #0a58ca)" }}
            onClick={handleDownloadInvoice}
            disabled={downloading}
          >
            {downloading ? "Preparing…" : "⬇ Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}