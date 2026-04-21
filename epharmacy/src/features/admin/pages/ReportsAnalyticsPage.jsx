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
import { Bar, Doughnut } from "react-chartjs-2";


ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Tooltip, Legend, Filler
);


const fetchSales         = (days) => api.get(`/admin/reports/sales?days=${days}`).then((r) => r.data);
const fetchOrders        = (days) => api.get(`/admin/reports/orders?days=${days}`).then((r) => r.data);
const fetchInventory     = ()     => api.get("/admin/reports/batches").then((r) => r.data);
const fetchPrescriptions = ()     => api.get("/admin/reports/prescriptions").then((r) => r.data);
const fetchDelivery      = ()     => api.get("/admin/reports/delivery").then((r) => r.data);
const fetchUsers         = ()     => api.get("/admin/reports/users").then((r) => r.data);


const TABS = [
  { id: "sales",         label: "Sales & Revenue" },
  { id: "orders",        label: "Orders"           },
  { id: "inventory",     label: "Inventory"        },
  { id: "prescriptions", label: "Prescriptions"    },
  { id: "delivery",      label: "Delivery"         },
  { id: "users",         label: "Users"            },
];

const PERIODS = [
  { label: "Last 7 Days",  days: 7   },
  { label: "Last 30 Days", days: 30  },
  { label: "Last 90 Days", days: 90  },
  { label: "This Year",    days: 365 },
];

const GREEN    = "#52a468";
const PALETTE  = ["#52a468","#3498db","#e67e22","#9b59b6","#e74c3c","#1abc9c"];
const DONUT_P  = ["#52a468","#3498db","#e67e22","#e74c3c","#9b59b6"];


const BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa", maxRotation: 45, maxTicksLimit: 12 } },
    y: { grid: { color: "#f5f5f5" }, ticks: { font: { family: "Poppins", size: 10 }, color: "#aaa" }, beginAtZero: true },
  },
};

const DONUT_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "62%",
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: { font: { family: "Poppins", size: 11 }, padding: 14, boxWidth: 12 },
    },
  },
};

function mkBar(labels, values, colors) {
  return {
    labels,
    datasets: [{ data: values, backgroundColor: colors || PALETTE, borderRadius: 6, borderSkipped: false }],
  };
}

function mkDonut(labels, values) {
  return {
    labels,
    datasets: [{ data: values, backgroundColor: DONUT_P, borderWidth: 0, hoverOffset: 6 }],
  };
}


function fromList(list = []) {
  return {
    labels: list.map((s) => cap(s.status)),
    values: list.map((s) => Number(s.count) || 0),
  };
}

function findCount(list = [], key) {
  const found = list.find((s) => s.status?.toLowerCase() === key);
  return found ? found.count : "—";
}


function fmt(n)  { return Number(n || 0).toLocaleString("en-IN"); }
function pct(n)  { return Number(n || 0).toFixed(1) + "%"; }
function cap(s)  { return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"; }


const BADGE_MAP = {
  placed:    ["#e3f2fd","#1565c0"], shipped:   ["#f3e5f5","#6a1b9a"],
  delivered: ["#e8f5e9","#2e7d32"], cancelled: ["#fce4e4","#c62828"],
  success:   ["#e8f5e9","#2e7d32"], pending:   ["#fff8e1","#f57f17"],
  failed:    ["#fce4e4","#c62828"], approved:  ["#e8f5e9","#2e7d32"],
  rejected:  ["#fce4e4","#c62828"], low:       ["#fff3e0","#e65100"],
  expiring:  ["#fff8e1","#f57f17"],
};

function Badge({ status }) {
  const [bg, color] = BADGE_MAP[status?.toLowerCase()] || ["#f5f5f5","#555"];
  return (
    <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:"nowrap", background:bg, color }}>
      {cap(status)}
    </span>
  );
}


function KpiGrid({ children }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, delta, pos }) {
  const dc = pos === true ? "#2e7d32" : pos === false ? "#c62828" : "#888";
  return (
    <div className="stat-card">
      <div className="stat-info" style={{ width:"100%" }}>
        <div style={{ fontSize:11, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>{label}</div>
        <div className="stat-val" style={{ fontSize:22 }}>{value ?? "—"}</div>
        {delta && <div style={{ fontSize:11.5, fontWeight:600, color:dc, marginTop:4 }}>{delta}</div>}
      </div>
    </div>
  );
}

function ChartsRow({ children }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:22 }}>
      {children}
    </div>
  );
}

function ChartCard({ title, sub, wide, height = 240, children }) {
  return (
    <div className="table-card" style={{ padding:"20px 22px", borderRadius:16, gridColumn: wide ? "span 2" : undefined }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontSize:13.5, fontWeight:700, color:"var(--text-dark)" }}>{title}</span>
        {sub && <span style={{ fontSize:11, color:"var(--text-muted)" }}>{sub}</span>}
      </div>
      <div style={{ position:"relative", height }}>{children}</div>
    </div>
  );
}

function SummaryTable({ title, badge, badgeDanger, columns, rows }) {
  return (
    <div className="table-card" style={{ marginBottom:22, overflow:"hidden" }}>
      {/* header */}
      <div className="table-toolbar" style={{ padding:"14px 20px" }}>
        <span className="table-toolbar-title">{title}</span>
        {badge && (
          <span style={{
            fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:20,
            background: badgeDanger ? "#fce4e4" : "#e3f2fd",
            color:      badgeDanger ? "#c62828" : "#1565c0",
          }}>{badge}</span>
        )}
      </div>
      {/* table */}
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign:"center", padding:24, color:"#aaa", fontStyle:"italic" }}>No data available.</td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j}>{cell}</td>)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding:"48px 0", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>
      <div style={{ fontSize:28, marginBottom:10 }}>⏳</div>
      Loading report data…
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function ReportsAnalyticsPage() {
  const [tab,  setTab]  = useState("sales");
  const [days, setDays] = useState(7);

  const [sales,    setSales]    = useState(null);
  const [orders,   setOrders]   = useState(null);
  const [inv,      setInv]      = useState(null);
  const [pres,     setPres]     = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [users,    setUsers]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const load = useCallback(async (t, d) => {
    setLoading(true); setError(null);
    try {
      if      (t === "sales")         setSales   (await fetchSales(d));
      else if (t === "orders")        setOrders  (await fetchOrders(d));
      else if (t === "inventory")     setInv     (await fetchInventory());
      else if (t === "prescriptions") setPres    (await fetchPrescriptions());
      else if (t === "delivery")      setDelivery(await fetchDelivery());
      else if (t === "users")         setUsers   (await fetchUsers());
    } catch {
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab, days); }, [tab, days, load]);

  /* derived chart data */
  const salesPS   = fromList(sales?.paymentStatus);
  const ordStatus = fromList(orders?.orderStatus);
  const delStatus = fromList(delivery?.status);

  return (
    <AdminLayout>
      <main className="content">

        <div className="page-heading">
          <div>
            <h1 className="page-title">Reports &amp; Analytics</h1>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>
              Overview of key metrics — sales, orders, inventory, prescriptions &amp; deliveries
            </p>
          </div>

          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => setDays(p.days)}
                className={days === p.days ? "btn-add-cat" : ""}
                style={days !== p.days ? {
                  padding:"7px 16px", borderRadius:"var(--radius-btn)",
                  fontSize:12, fontWeight:600, fontFamily:"Poppins,sans-serif",
                  cursor:"pointer", border:"1.5px solid var(--border)",
                  background:"var(--white)", color:"var(--text-mid)", transition:"all 0.18s",
                } : { padding:"7px 16px", fontSize:12 }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", gap:4, flexWrap:"wrap", borderBottom:"2px solid var(--border)", marginBottom:22 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:"9px 18px",
                fontSize:12.5,
                fontWeight: tab === t.id ? 700 : 600,
                color: tab === t.id ? "var(--green-dark)" : "var(--text-muted)",
                background:"none", border:"none",
                borderBottom: tab === t.id ? "2px solid var(--green)" : "2px solid transparent",
                marginBottom:-2, cursor:"pointer", transition:"all 0.18s",
                fontFamily:"Poppins,sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background:"#fce4e4", color:"#c62828", padding:"12px 18px", borderRadius:10, marginBottom:20, fontSize:13, fontWeight:600 }}>
            ⚠ {error}
          </div>
        )}

        {tab === "sales" && (
          <>
            {loading ? <Skeleton /> : (
              <>
                <KpiGrid>
                  <KpiCard label="Total Revenue"       value={`₹${fmt(sales?.totalRevenue)}`}       delta="From completed orders"   pos={true} />
                  <KpiCard label="Avg. Order Value"    value={`₹${fmt(sales?.averageOrderValue)}`}  delta={`Last ${days} days`}     pos={true} />
                  <KpiCard label="Successful Payments" value={findCount(sales?.paymentStatus,"success")} delta="Payment status: success" pos={true} />
                  <KpiCard
                    label="Pending / Failed"
                    value={(Number(findCount(sales?.paymentStatus,"pending"))||0) + (Number(findCount(sales?.paymentStatus,"failed"))||0)}
                    delta="Requires attention"
                    pos={false}
                  />
                </KpiGrid>

                <ChartsRow>
                  <ChartCard title="Payment Status — Orders" sub={`Last ${days} days`} wide>
                    <Bar data={mkBar(salesPS.labels, salesPS.values, PALETTE.slice(0,3))} options={BAR_OPTS} />
                  </ChartCard>
                  <ChartCard title="Payment Status Distribution">
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
                      <strong>{s.count}</strong>,
                      <span style={{color:"var(--text-muted)"}}>{total ? ((s.count/total)*100).toFixed(1)+"%" : "—"}</span>,
                    ];
                  })}
                />
              </>
            )}
          </>
        )}

        {tab === "orders" && (
          <>
            {loading ? <Skeleton /> : (
              <>
                <KpiGrid>
                  <KpiCard label="Total Orders"      value={orders?.totalOrders}           delta={`Last ${days} days`}     pos={true}  />
                  <KpiCard label="Delivered"         value={orders?.delivered}             delta="Successfully fulfilled"  pos={true}  />
                  <KpiCard label="Cancelled"         value={orders?.cancelled}             delta="Orders cancelled"        pos={false} />
                  <KpiCard label="Cancellation Rate" value={pct(orders?.cancellationRate)} delta="Of all orders"           pos={false} />
                </KpiGrid>

                <ChartsRow>
                  <ChartCard title="Orders by Status" wide>
                    <Bar data={mkBar(ordStatus.labels, ordStatus.values, PALETTE.slice(0,4))} options={BAR_OPTS} />
                  </ChartCard>
                  <ChartCard title="Order Status Distribution">
                    <Doughnut data={mkDonut(ordStatus.labels, ordStatus.values)} options={DONUT_OPTS} />
                  </ChartCard>
                </ChartsRow>

                <SummaryTable
                  title="Order Status Breakdown"
                  columns={["Status","Count","% of Total"]}
                  rows={(orders?.orderStatus||[]).map((s) => [
                    <Badge status={s.status} />,
                    <strong>{s.count}</strong>,
                    <span style={{color:"var(--text-muted)"}}>
                      {orders?.totalOrders ? ((s.count/orders.totalOrders)*100).toFixed(1)+"%" : "—"}
                    </span>,
                  ])}
                />
              </>
            )}
          </>
        )}

        {tab === "inventory" && (
          <>
            {loading ? <Skeleton /> : (
              <>
                <KpiGrid>
                  <KpiCard label="Total Stock Units"   value={fmt(inv?.totalStock)}   delta="Across all batches"   pos={true}  />
                  <KpiCard label="Low Stock Items"     value={inv?.lowStock}          delta="Qty ≤ 50 units"       pos={false} />
                  <KpiCard label="Expiring in 90 Days" value={inv?.expiringSoon}      delta="Needs reorder soon"   pos={false} />
                  <KpiCard label="Healthy Stock"       value={Math.max(0,(inv?.totalStock||0)-(inv?.lowStock||0))} delta="Above threshold" pos={true} />
                </KpiGrid>

                <ChartsRow>
                  <ChartCard title="Stock Overview" wide height={260}>
                    <Bar
                      data={mkBar(
                        ["Total Stock","Low Stock","Expiring in 90d"],
                        [inv?.totalStock||0, inv?.lowStock||0, inv?.expiringSoon||0],
                        [GREEN,"#ff9800","#e74c3c"]
                      )}
                      options={BAR_OPTS}
                    />
                  </ChartCard>
                  <ChartCard title="Stock Status Distribution">
                    <Doughnut
                      data={mkDonut(
                        ["Healthy","Low Stock","Expiring Soon"],
                        [
                          Math.max(0,(inv?.totalStock||0)-(inv?.lowStock||0)-(inv?.expiringSoon||0)),
                          inv?.lowStock||0,
                          inv?.expiringSoon||0,
                        ]
                      )}
                      options={DONUT_OPTS}
                    />
                  </ChartCard>
                </ChartsRow>

                <SummaryTable
                  title="Inventory Highlights"
                  badge={`${inv?.lowStock ?? 0} Low Stock`}
                  badgeDanger
                  columns={["Metric","Value","Status"]}
                  rows={[
                    ["Total Stock Units",          <strong>{fmt(inv?.totalStock)}</strong>,                          <Badge status="delivered" />],
                    ["Low Stock Items (≤50 units)",<strong style={{color:"#e65100"}}>{inv?.lowStock}</strong>,       <Badge status="low"       />],
                    ["Expiring in 90 Days",        <strong style={{color:"#c62828"}}>{inv?.expiringSoon}</strong>,   <Badge status="expiring"  />],
                  ]}
                />
              </>
            )}
          </>
        )}

        {tab === "prescriptions" && (
          <>
            {loading ? <Skeleton /> : (
              <>
                <KpiGrid>
                  <KpiCard label="Total Submissions" value={pres?.total}             delta="All prescriptions"     pos={true}  />
                  <KpiCard label="Approved"          value={pres?.approved}          delta="Successfully verified" pos={true}  />
                  <KpiCard label="Pending Review"    value={pres?.pending}           delta="Awaiting action"       pos={null}  />
                  <KpiCard label="Approval Rate"     value={pct(pres?.approvalRate)} delta="Of all submissions"    pos={true}  />
                </KpiGrid>

                <ChartsRow>
                  <ChartCard title="Prescription Status Breakdown">
                    <Doughnut
                      data={mkDonut(["Approved","Pending","Rejected"],[pres?.approved||0,pres?.pending||0,pres?.rejected||0])}
                      options={DONUT_OPTS}
                    />
                  </ChartCard>
                  <ChartCard title="Prescriptions by Status" wide>
                    <Bar
                      data={mkBar(["Approved","Pending","Rejected"],[pres?.approved||0,pres?.pending||0,pres?.rejected||0],[GREEN,"#e67e22","#e74c3c"])}
                      options={BAR_OPTS}
                    />
                  </ChartCard>
                </ChartsRow>

                <SummaryTable
                  title="Prescription Status Summary"
                  columns={["Status","Count","% of Total"]}
                  rows={[["approved",pres?.approved],["pending",pres?.pending],["rejected",pres?.rejected]].map(([status,count])=>[
                    <Badge status={status} />,
                    <strong>{count ?? "—"}</strong>,
                    <span style={{color:"var(--text-muted)"}}>{pres?.total ? (((count||0)/pres.total)*100).toFixed(1)+"%" : "—"}</span>,
                  ])}
                />
              </>
            )}
          </>
        )}

        {tab === "delivery" && (
          <>
            {loading ? <Skeleton /> : (
              <>
                <KpiGrid>
                  <KpiCard label="Total Deliveries"       value={delivery?.total}                          delta="All records"         pos={true}  />
                  <KpiCard label="Successfully Delivered" value={findCount(delivery?.status,"delivered")}  delta="Reached customer"    pos={true}  />
                  <KpiCard label="In Transit"             value={findCount(delivery?.status,"shipped")}    delta="Currently shipped"   pos={null}  />
                  <KpiCard label="Cancelled"              value={findCount(delivery?.status,"cancelled")}  delta="Delivery cancelled"  pos={false} />
                </KpiGrid>

                <ChartsRow>
                  <ChartCard title="Delivery Status Distribution">
                    <Doughnut data={mkDonut(delStatus.labels, delStatus.values)} options={DONUT_OPTS} />
                  </ChartCard>
                  <ChartCard title="Deliveries by Status" wide>
                    <Bar data={mkBar(delStatus.labels, delStatus.values, PALETTE.slice(0,5))} options={BAR_OPTS} />
                  </ChartCard>
                </ChartsRow>

                <SummaryTable
                  title="Delivery Status Summary"
                  columns={["Status","Count","% of Total"]}
                  rows={(delivery?.status||[]).map((s)=>[
                    <Badge status={s.status} />,
                    <strong>{s.count}</strong>,
                    <span style={{color:"var(--text-muted)"}}>{delivery?.total ? ((s.count/delivery.total)*100).toFixed(1)+"%" : "—"}</span>,
                  ])}
                />
              </>
            )}
          </>
        )}

        {tab === "users" && (
          <>
            {loading ? <Skeleton /> : (
              <>
                <KpiGrid>
                  <KpiCard label="Total Registered" value={users?.totalUsers}                                     delta="All accounts"        pos={true} />
                  <KpiCard label="Active Users"     value={users?.activeUsers}                                    delta="With recent orders"  pos={true} />
                  <KpiCard label="Avg Orders/User"  value={Number(users?.avgOrdersPerUser||0).toFixed(1)}        delta="Engagement metric"   pos={true} />
                  <KpiCard label="Inactive Users"   value={(users?.totalUsers||0)-(users?.activeUsers||0)}       delta="No recent activity"  pos={null} />
                </KpiGrid>

                <ChartsRow>
                  <ChartCard title="Active vs Total Users" wide>
                    <Bar
                      data={mkBar(
                        ["Total Registered","Active Users","Inactive"],
                        [users?.totalUsers||0, users?.activeUsers||0, (users?.totalUsers||0)-(users?.activeUsers||0)],
                        [GREEN,"#3498db","#e0e0e0"]
                      )}
                      options={BAR_OPTS}
                    />
                  </ChartCard>
                  <ChartCard title="User Activity Split">
                    <Doughnut
                      data={mkDonut(["Active","Inactive"],[users?.activeUsers||0,(users?.totalUsers||0)-(users?.activeUsers||0)])}
                      options={DONUT_OPTS}
                    />
                  </ChartCard>
                </ChartsRow>

                <SummaryTable
                  title="User Metrics"
                  columns={["Metric","Value"]}
                  rows={[
                    ["Total Registered Users", <strong>{users?.totalUsers ?? "—"}</strong>],
                    ["Active Users",           <strong style={{color:GREEN}}>{users?.activeUsers ?? "—"}</strong>],
                    ["Inactive Users",         <strong style={{color:"#888"}}>{(users?.totalUsers||0)-(users?.activeUsers||0)}</strong>],
                    ["Avg. Orders per User",   <strong>{Number(users?.avgOrdersPerUser||0).toFixed(2)}</strong>],
                  ]}
                />
              </>
            )}
          </>
        )}

      </main>

      

   
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width:1100px) { .charts-row > * { grid-column: 1 !important; } }
        @media (max-width:768px)  { .kpi-grid > * { grid-column: span 2; } }
        @media (max-width:480px)  { .kpi-grid > * { grid-column: 1; } }
      `}</style>
    </AdminLayout>
  );
}