import AdminLayout from "../layouts/AdminLayout";
import { useEffect, useState, useCallback } from "react";
import api from "../../../api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Tooltip, Legend, Filler
);

/* ── API calls — no days param anymore ── */
const fetchSales         = () => api.get("/admin/reports/sales").then((r) => r.data);
const fetchOrders        = () => api.get("/admin/reports/orders").then((r) => r.data);
const fetchInventory     = () => api.get("/admin/reports/batches").then((r) => r.data);
const fetchPrescriptions = () => api.get("/admin/reports/prescriptions").then((r) => r.data);
const fetchDelivery      = () => api.get("/admin/reports/delivery").then((r) => r.data);
const fetchUsers         = () => api.get("/admin/reports/users").then((r) => r.data);

const TABS = [
  { id: "sales",         label: "Sales & Revenue" },
  { id: "orders",        label: "Orders"           },
  { id: "inventory",     label: "Inventory"        },
  { id: "prescriptions", label: "Prescriptions"    },
  { id: "delivery",      label: "Delivery"         },
  { id: "users",         label: "Users"            },
];

const GREEN   = "#52a468";
const BLUE    = "#3498db";
const ORANGE  = "#e67e22";
const RED     = "#e74c3c";
const PURPLE  = "#9b59b6";
const TEAL    = "#1abc9c";
const PALETTE = [GREEN, BLUE, ORANGE, PURPLE, RED, TEAL];
const DONUT_P = [GREEN, BLUE, ORANGE, RED, PURPLE];

/* ── Chart option factories ── */
const mkBarOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa", maxRotation: 0 } },
    y: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa" }, beginAtZero: true },
  },
});

const mkGroupedBarOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: "top", labels: { font: { family: "Poppins", size: 11 }, padding: 14, boxWidth: 12 } },
  },
  scales: {
    x: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa", maxRotation: 0 } },
    y: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa" }, beginAtZero: true },
  },
});

const mkLineOpts = (prefix = "") => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: true, position: "top", labels: { font: { family: "Poppins", size: 11 }, padding: 14, boxWidth: 12 } },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${prefix}${Number(ctx.raw).toLocaleString("en-IN")}`,
      },
    },
  },
  scales: {
    x: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa" } },
    y: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa" }, beginAtZero: true },
  },
});

const DONUT_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "62%",
  plugins: {
    legend: { display: true, position: "bottom", labels: { font: { family: "Poppins", size: 11 }, padding: 14, boxWidth: 12 } },
  },
};

/* ── Chart builders ── */
function mkBar(labels, values, colors) {
  return {
    labels,
    datasets: [{ data: values, backgroundColor: colors || PALETTE, borderRadius: 7, borderSkipped: false }],
  };
}

function mkGroupedBar(labels, datasets) {
  return {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label, data: d.data,
      backgroundColor: d.color, borderRadius: 5, borderSkipped: false,
    })),
  };
}

function mkLine(labels, datasets) {
  return {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label, data: d.data,
      borderColor: d.color, backgroundColor: d.color + "18",
      fill: true, tension: 0.45,
      pointBackgroundColor: d.color, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2.5,
    })),
  };
}

function mkDonut(labels, values) {
  return {
    labels,
    datasets: [{ data: values, backgroundColor: DONUT_P, borderWidth: 0, hoverOffset: 6 }],
  };
}

/* ── Helpers ── */
function fromList(list = []) {
  return { labels: list.map((s) => cap(s.status)), values: list.map((s) => Number(s.count) || 0) };
}

function fromMonthly(list = []) {
  return { labels: list.map((m) => m.month), values: list.map((m) => Number(m.value) || 0) };
}

function findCount(list = [], key) {
  const found = list.find((s) => s.status?.toLowerCase() === key);
  return found ? Number(found.count) : 0;
}

function fmt(n)  { return Number(n || 0).toLocaleString("en-IN"); }
function fmtC(n) { return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 }); }
function pct(n)  { return Number(n || 0).toFixed(1) + "%"; }
function cap(s)  { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "—"; }

/* ── Badge ── */
const BADGE_MAP = {
  placed: ["#e3f2fd","#1565c0"], shipped: ["#f3e5f5","#6a1b9a"],
  delivered: ["#e8f5e9","#2e7d32"], cancelled: ["#fce4e4","#c62828"],
  success: ["#e8f5e9","#2e7d32"], pending: ["#fff8e1","#f57f17"],
  failed: ["#fce4e4","#c62828"], approved: ["#e8f5e9","#2e7d32"],
  rejected: ["#fce4e4","#c62828"], low: ["#fff3e0","#e65100"],
  expiring: ["#fff8e1","#f57f17"], available: ["#e8f5e9","#2e7d32"],
  not_available: ["#fce4e4","#c62828"],
};

function Badge({ status }) {
  const [bg, color] = BADGE_MAP[status?.toLowerCase()] || ["#f5f5f5","#555"];
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap", background:bg, color }}>
      {cap(status?.replace("_"," "))}
    </span>
  );
}

/* ── Layout components ── */
function KpiGrid({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>{children}</div>;
}

function KpiCard({ label, value, sub, pos }) {
  const dc = pos === true ? "#2e7d32" : pos === false ? "#c62828" : "#888";
  return (
    <div className="stat-card">
      <div className="stat-info" style={{ width:"100%" }}>
        <div style={{ fontSize:11, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>{label}</div>
        <div className="stat-val" style={{ fontSize:22 }}>{value ?? "—"}</div>
        {sub && <div style={{ fontSize:11.5, fontWeight:600, color:dc, marginTop:4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ChartsRow({ children, cols = "1fr 1fr" }) {
  return <div style={{ display:"grid", gridTemplateColumns:cols, gap:18, marginBottom:22 }}>{children}</div>;
}

function ChartCard({ title, sub, span1, height = 260, children }) {
  return (
    <div className="table-card" style={{ padding:"20px 22px", borderRadius:16, gridColumn: span1 ? "1 / -1" : undefined }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:13.5, fontWeight:700, color:"var(--text-dark)" }}>{title}</span>
        {sub && <span style={{ fontSize:11, color:"var(--text-muted)", background:"#f4f4f4", padding:"3px 10px", borderRadius:20 }}>{sub}</span>}
      </div>
      <div style={{ position:"relative", height }}>{children}</div>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"6px 0 16px" }}>
      <div style={{ width:4, height:18, background:GREEN, borderRadius:3 }} />
      <span style={{ fontSize:12.5, fontWeight:700, color:"var(--text-dark)", textTransform:"uppercase", letterSpacing:"0.4px" }}>{label}</span>
      <div style={{ flex:1, height:1, background:"var(--border)" }} />
    </div>
  );
}

function SummaryTable({ title, badge, badgeDanger, columns, rows }) {
  return (
    <div className="table-card" style={{ marginBottom:22, overflow:"hidden" }}>
      <div className="table-toolbar" style={{ padding:"14px 20px" }}>
        <span className="table-toolbar-title">{title}</span>
        {badge && (
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, background: badgeDanger ? "#fce4e4" : "#e3f2fd", color: badgeDanger ? "#c62828" : "#1565c0" }}>
            {badge}
          </span>
        )}
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={columns.length} style={{ textAlign:"center", padding:24, color:"#aaa", fontStyle:"italic" }}>No data available.</td></tr>
              : rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockBar({ value }) {
  const p = Math.min(100, Math.round(((value || 0) / 50) * 100));
  const c = !value || value === 0 ? RED : value <= 10 ? RED : value <= 25 ? ORANGE : "#f0c040";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:6, background:"#f0f0f0", borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${p}%`, height:"100%", background:c, borderRadius:4 }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color:c, minWidth:28, textAlign:"right" }}>{value ?? 0}</span>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding:"56px 0", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>Loading report data…
    </div>
  );
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CY = new Date().getFullYear();

/* ═══════════════════════════════════════════
   PAGE
═══════════════════════════════════════════ */
export default function ReportsAnalyticsPage() {
  const [tab,     setTab]     = useState("sales");
  const [sales,   setSales]   = useState(null);
  const [orders,  setOrders]  = useState(null);
  const [inv,     setInv]     = useState(null);
  const [pres,    setPres]    = useState(null);
  const [del,     setDel]     = useState(null);
  const [users,   setUsers]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async (t) => {
    setLoading(true); setError(null);
    try {
      if      (t === "sales")         setSales  (await fetchSales());
      else if (t === "orders")        setOrders (await fetchOrders());
      else if (t === "inventory")     setInv    (await fetchInventory());
      else if (t === "prescriptions") setPres   (await fetchPrescriptions());
      else if (t === "delivery")      setDel    (await fetchDelivery());
      else if (t === "users")         setUsers  (await fetchUsers());
    } catch {
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const salesPS   = fromList(sales?.paymentStatus);
  const ordStatus = fromList(orders?.orderStatus);
  const delStatus = fromList(del?.status);

  const monthRevVals = fromMonthly(sales?.monthlyRevenue).values;
  const monthAvgVals = fromMonthly(sales?.monthlyAvgOrderValue).values;
  const monthOrdVals = fromMonthly(orders?.monthlyOrders).values;
  const monthDelVals = fromMonthly(orders?.monthlyDelivered).values;
  const monthCanVals = fromMonthly(orders?.monthlyCancelled).values;

  return (
    <AdminLayout>
      <main className="content">

        {/* Header */}
        <div className="page-heading">
          <div>
            <h1 className="page-title">Reports &amp; Analytics</h1>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>
              Yearly overview — sales, orders, inventory, prescriptions &amp; deliveries
            </p>
          </div>
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"#f0faf3", border:`1.5px solid ${GREEN}44`,
            borderRadius:10, padding:"7px 16px", fontSize:12, fontWeight:600, color:GREEN,
          }}>
            📅 {CY} — Full Year View
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", borderBottom:"2px solid var(--border)", marginBottom:24 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"9px 20px", fontSize:12.5,
              fontWeight: tab === t.id ? 700 : 600,
              color: tab === t.id ? "var(--green-dark)" : "var(--text-muted)",
              background:"none", border:"none",
              borderBottom: tab === t.id ? "2px solid var(--green)" : "2px solid transparent",
              marginBottom:-2, cursor:"pointer", transition:"all 0.18s", fontFamily:"Poppins,sans-serif",
            }}>{t.label}</button>
          ))}
        </div>

        {error && (
          <div style={{ background:"#fce4e4", color:"#c62828", padding:"12px 18px", borderRadius:10, marginBottom:20, fontSize:13, fontWeight:600 }}>
            ⚠ {error}
          </div>
        )}

        {/* ══ SALES ══ */}
        {tab === "sales" && (loading ? <Skeleton /> : <>
          <KpiGrid>
            <KpiCard label="Total Revenue (All Time)"  value={fmtC(sales?.totalRevenue)}     sub="Across all orders"       pos={true} />
            <KpiCard label="Total Orders"              value={fmt(sales?.totalOrders)}        sub="All time"                pos={true} />
            <KpiCard label="Avg. Order Value"          value={fmtC(sales?.averageOrderValue)} sub="Revenue ÷ orders"        pos={true} />
            <KpiCard label="Successful Payments"       value={fmt(findCount(sales?.paymentStatus,"success"))} sub="Status: success" pos={true} />
          </KpiGrid>

          <SectionDivider label={`Monthly Revenue Trend — ${CY}`} />
          <ChartsRow cols="1fr">
            <ChartCard title="Revenue & Avg Order Value by Month" sub={`Jan – Dec ${CY}`} span1 height={300}>
              <Line
                data={mkLine(MONTHS, [
                  { label:"Revenue (₹)",    data:monthRevVals, color:GREEN },
                  { label:"Avg Order (₹)",  data:monthAvgVals, color:BLUE  },
                ])}
                options={mkLineOpts("₹")}
              />
            </ChartCard>
          </ChartsRow>

          <SectionDivider label="Payment Status" />
          <ChartsRow cols="2fr 1fr">
            <ChartCard title="Orders by Payment Status" height={250}>
              <Bar data={mkBar(salesPS.labels, salesPS.values, [GREEN, ORANGE, RED])} options={mkBarOpts()} />
            </ChartCard>
            <ChartCard title="Payment Distribution" height={250}>
              <Doughnut data={mkDonut(salesPS.labels, salesPS.values)} options={DONUT_OPTS} />
            </ChartCard>
          </ChartsRow>

          <SummaryTable
            title="Payment Status Summary"
            columns={["Status","Count","% of Orders"]}
            rows={(sales?.paymentStatus || []).map((s) => {
              const total = (sales?.paymentStatus||[]).reduce((a,b)=>a+(b.count||0),0);
              return [
                <Badge status={s.status} />,
                <strong>{fmt(s.count)}</strong>,
                <span style={{color:"var(--text-muted)"}}>{total ? ((s.count/total)*100).toFixed(1)+"%" : "—"}</span>,
              ];
            })}
          />
        </>)}

        {/* ══ ORDERS ══ */}
        {tab === "orders" && (loading ? <Skeleton /> : <>
          <KpiGrid>
            <KpiCard label="Total Orders"   value={fmt(orders?.totalOrders)}       sub="All time"                pos={true}  />
            <KpiCard label="Delivered"      value={fmt(orders?.delivered)}          sub="Successfully fulfilled"  pos={true}  />
            <KpiCard label="Cancelled"      value={fmt(orders?.cancelled)}          sub="Orders cancelled"        pos={false} />
            <KpiCard label="Delivery Rate"  value={pct(orders?.deliveryRate)}       sub="Of all orders"           pos={true}  />
          </KpiGrid>

          <SectionDivider label={`Monthly Orders Trend — ${CY}`} />
          <ChartsRow cols="1fr">
            <ChartCard title="Total / Delivered / Cancelled by Month" sub={`Jan – Dec ${CY}`} span1 height={300}>
              <Line
                data={mkLine(MONTHS, [
                  { label:"Total Orders", data:monthOrdVals, color:BLUE  },
                  { label:"Delivered",    data:monthDelVals, color:GREEN },
                  { label:"Cancelled",    data:monthCanVals, color:RED   },
                ])}
                options={mkLineOpts()}
              />
            </ChartCard>
          </ChartsRow>

          <SectionDivider label="Delivered vs Cancelled — Monthly Bar" />
          <ChartsRow cols="1fr">
            <ChartCard title="Delivered vs Cancelled per Month" span1 height={270}>
              <Bar
                data={mkGroupedBar(MONTHS, [
                  { label:"Delivered", data:monthDelVals, color:GREEN + "cc" },
                  { label:"Cancelled", data:monthCanVals, color:RED   + "cc" },
                ])}
                options={mkGroupedBarOpts()}
              />
            </ChartCard>
          </ChartsRow>

          <SectionDivider label="Order Status Breakdown" />
          <ChartsRow cols="2fr 1fr">
            <ChartCard title="Orders by Status" height={250}>
              <Bar data={mkBar(ordStatus.labels, ordStatus.values, PALETTE)} options={mkBarOpts()} />
            </ChartCard>
            <ChartCard title="Status Distribution" height={250}>
              <Doughnut data={mkDonut(ordStatus.labels, ordStatus.values)} options={DONUT_OPTS} />
            </ChartCard>
          </ChartsRow>

          <SummaryTable
            title="Order Status Summary"
            columns={["Status","Count","% of Total"]}
            rows={(orders?.orderStatus||[]).map((s) => [
              <Badge status={s.status} />,
              <strong>{fmt(s.count)}</strong>,
              <span style={{color:"var(--text-muted)"}}>{orders?.totalOrders ? ((s.count/orders.totalOrders)*100).toFixed(1)+"%" : "—"}</span>,
            ])}
          />
        </>)}

        {/* ══ INVENTORY ══ */}
        {tab === "inventory" && (loading ? <Skeleton /> : <>
          <KpiGrid>
            <KpiCard label="Total Stock Units"   value={fmt(inv?.totalStock)}   sub="Across all medicines"  pos={true}  />
            <KpiCard label="Low Stock Items"     value={fmt(inv?.lowStock)}     sub="Qty ≤ 50 units"        pos={false} />
            <KpiCard label="Expiring in 90 Days" value={fmt(inv?.expiringSoon)} sub="Needs reorder soon"    pos={false} />
            <KpiCard label="Healthy Stock Items" value={Math.max(0,(inv?.totalStock||0)-(inv?.lowStock||0))} sub="Above threshold" pos={true} />
          </KpiGrid>

          <SectionDivider label="Stock Overview" />
          <ChartsRow cols="2fr 1fr">
            <ChartCard title="Stock Metrics" height={250}>
              <Bar
                data={mkBar(
                  ["Total Stock","Low Stock","Expiring 90d","Healthy"],
                  [inv?.totalStock||0, inv?.lowStock||0, inv?.expiringSoon||0,
                   Math.max(0,(inv?.totalStock||0)-(inv?.lowStock||0)-(inv?.expiringSoon||0))],
                  [GREEN, ORANGE, RED, BLUE]
                )}
                options={mkBarOpts()}
              />
            </ChartCard>
            <ChartCard title="Stock Distribution" height={250}>
              <Doughnut
                data={mkDonut(
                  ["Healthy","Low Stock","Expiring"],
                  [Math.max(0,(inv?.totalStock||0)-(inv?.lowStock||0)-(inv?.expiringSoon||0)),
                   inv?.lowStock||0, inv?.expiringSoon||0]
                )}
                options={DONUT_OPTS}
              />
            </ChartCard>
          </ChartsRow>

          <SectionDivider label="Low Stock Medicines — Detail View" />
          <div className="table-card" style={{ marginBottom:22, overflow:"hidden" }}>
            <div className="table-toolbar" style={{ padding:"14px 20px" }}>
              <span className="table-toolbar-title">Medicines with Stock ≤ 50 Units</span>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20, background:"#fce4e4", color:"#c62828" }}>
                {inv?.lowStock ?? 0} Items
              </span>
            </div>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Medicine</th><th>Brand</th><th>Strength</th>
                    <th>Form</th><th>Category</th><th>Final Price</th><th>Stock Level</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!inv?.lowStockMedicines || inv.lowStockMedicines.length === 0)
                    ? <tr><td colSpan={9} style={{ textAlign:"center", padding:28, color:"#aaa", fontStyle:"italic" }}>🎉 All medicines are well stocked!</td></tr>
                    : inv.lowStockMedicines.map((m, i) => (
                        <tr key={m.medicineId}>
                          <td style={{ color:"var(--text-muted)", fontSize:12 }}>{i + 1}</td>
                          <td><div style={{ fontWeight:700, fontSize:13, color:"var(--text-dark)" }}>{m.name}</div></td>
                          <td style={{ color:"var(--text-mid)", fontSize:12 }}>{m.brand}</td>
                          <td><span style={{ fontSize:11, fontWeight:600, background:"#f0f4ff", color:"#3949ab", padding:"2px 8px", borderRadius:12 }}>{m.strength}</span></td>
                          <td style={{ color:"var(--text-mid)", fontSize:12 }}>{cap(m.dosageForm)}</td>
                          <td style={{ color:"var(--text-mid)", fontSize:12 }}>{m.categoryName}</td>
                          <td style={{ fontWeight:600 }}>₹{fmt(m.finalPrice)}</td>
                          <td style={{ minWidth:140 }}><StockBar value={m.totalStock ?? 0} /></td>
                          <td><Badge status={m.medicineStatus} /></td>
                        </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>)}

        {/* ══ PRESCRIPTIONS ══ */}
        {tab === "prescriptions" && (loading ? <Skeleton /> : <>
          <KpiGrid>
            <KpiCard label="Total Submissions" value={fmt(pres?.total)}        sub="All prescriptions"     pos={true}  />
            <KpiCard label="Approved"          value={fmt(pres?.approved)}     sub="Successfully verified" pos={true}  />
            <KpiCard label="Pending Review"    value={fmt(pres?.pending)}      sub="Awaiting action"       pos={null}  />
            <KpiCard label="Approval Rate"     value={pct(pres?.approvalRate)} sub="Of all submissions"    pos={true}  />
          </KpiGrid>

          <SectionDivider label="Prescription Status Overview" />
          <ChartsRow cols="1fr 1fr">
            <ChartCard title="Status Breakdown" height={270}>
              <Bar
                data={mkBar(["Approved","Pending","Rejected"],[pres?.approved||0,pres?.pending||0,pres?.rejected||0],[GREEN,ORANGE,RED])}
                options={mkBarOpts()}
              />
            </ChartCard>
            <ChartCard title="Status Distribution" height={270}>
              <Doughnut
                data={mkDonut(["Approved","Pending","Rejected"],[pres?.approved||0,pres?.pending||0,pres?.rejected||0])}
                options={DONUT_OPTS}
              />
            </ChartCard>
          </ChartsRow>

          <SummaryTable
            title="Prescription Status Summary"
            columns={["Status","Count","% of Total"]}
            rows={[["approved",pres?.approved],["pending",pres?.pending],["rejected",pres?.rejected]].map(([s,c])=>[
              <Badge status={s} />,
              <strong>{fmt(c)}</strong>,
              <span style={{color:"var(--text-muted)"}}>{pres?.total ? (((c||0)/pres.total)*100).toFixed(1)+"%" : "—"}</span>,
            ])}
          />
        </>)}

        {/* ══ DELIVERY ══ */}
        {tab === "delivery" && (loading ? <Skeleton /> : <>
          <KpiGrid>
            <KpiCard label="Total Deliveries"       value={fmt(del?.total)}                         sub="All records"         pos={true}  />
            <KpiCard label="Successfully Delivered" value={fmt(findCount(del?.status,"delivered"))} sub="Reached customer"    pos={true}  />
            <KpiCard label="In Transit"             value={fmt(findCount(del?.status,"shipped"))}   sub="Currently shipped"   pos={null}  />
            <KpiCard label="Cancelled"              value={fmt(findCount(del?.status,"cancelled"))} sub="Delivery cancelled"  pos={false} />
          </KpiGrid>

          <SectionDivider label="Delivery Status Overview" />
          <ChartsRow cols="1fr 1fr">
            <ChartCard title="Deliveries by Status" height={270}>
              <Bar data={mkBar(delStatus.labels, delStatus.values, PALETTE)} options={mkBarOpts()} />
            </ChartCard>
            <ChartCard title="Delivery Distribution" height={270}>
              <Doughnut data={mkDonut(delStatus.labels, delStatus.values)} options={DONUT_OPTS} />
            </ChartCard>
          </ChartsRow>

          <SummaryTable
            title="Delivery Status Summary"
            columns={["Status","Count","% of Total"]}
            rows={(del?.status||[]).map((s)=>[
              <Badge status={s.status} />,
              <strong>{fmt(s.count)}</strong>,
              <span style={{color:"var(--text-muted)"}}>{del?.total ? ((s.count/del.total)*100).toFixed(1)+"%" : "—"}</span>,
            ])}
          />
        </>)}

        {/* ══ USERS ══ */}
        {tab === "users" && (loading ? <Skeleton /> : <>
          <KpiGrid>
            <KpiCard label="Total Registered" value={fmt(users?.totalUsers)}                               sub="All accounts"        pos={true}  />
            <KpiCard label="Active Users"     value={fmt(users?.activeUsers)}                              sub="With recent orders"  pos={true}  />
            <KpiCard label="Inactive Users"   value={fmt((users?.totalUsers||0)-(users?.activeUsers||0))} sub="No recent activity"  pos={null}  />
            <KpiCard label="Avg Orders/User"  value={Number(users?.avgOrdersPerUser||0).toFixed(2)}       sub="Engagement metric"   pos={true}  />
          </KpiGrid>

          <SectionDivider label="User Activity Overview" />
          <ChartsRow cols="2fr 1fr">
            <ChartCard title="User Breakdown" height={270}>
              <Bar
                data={mkBar(
                  ["Total Registered","Active Users","Inactive"],
                  [users?.totalUsers||0, users?.activeUsers||0, (users?.totalUsers||0)-(users?.activeUsers||0)],
                  [GREEN, BLUE, "#e0e0e0"]
                )}
                options={mkBarOpts()}
              />
            </ChartCard>
            <ChartCard title="Active vs Inactive" height={270}>
              <Doughnut
                data={mkDonut(["Active","Inactive"],[users?.activeUsers||0,(users?.totalUsers||0)-(users?.activeUsers||0)])}
                options={DONUT_OPTS}
              />
            </ChartCard>
          </ChartsRow>

          <SummaryTable
            title="User Metrics Summary"
            columns={["Metric","Value"]}
            rows={[
              ["Total Registered Users", <strong>{fmt(users?.totalUsers)}</strong>],
              ["Active Users",           <strong style={{color:GREEN}}>{fmt(users?.activeUsers)}</strong>],
              ["Inactive Users",         <strong style={{color:"#888"}}>{fmt((users?.totalUsers||0)-(users?.activeUsers||0))}</strong>],
              ["Avg. Orders per User",   <strong>{Number(users?.avgOrdersPerUser||0).toFixed(2)}</strong>],
            ]}
          />
        </>)}

      </main>
    </AdminLayout>
  );
}