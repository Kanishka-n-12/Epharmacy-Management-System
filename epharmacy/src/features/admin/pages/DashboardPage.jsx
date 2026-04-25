import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadDashboard } from "../dashboard/slice/dashboardSlice";
import AdminLayout from "../layouts/AdminLayout";
import StatisticsCard from "../components/StatisticsCard";
import { Chart, registerables } from "chart.js";
import "../style/admin-dashboard.css";

Chart.register(...registerables);

const BRAND = {
  green:      "#52a468",
  greenLight: "#a3ccab",
  red:        "#f44336",
  orange:     "#e67e22",
  blue:       "#2980b9",
  purple:     "#8e44ad",
  teal:       "#16a085",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function grad(ctx, top, bot) {
  const g = ctx.createLinearGradient(0, 0, 0, 230);
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  return g;
}

const TIP = { backgroundColor: "#1e3a28", padding: 10, cornerRadius: 10 };

function SectionDivider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"24px 0 16px" }}>
      <div style={{ width:4, height:18, background:BRAND.green, borderRadius:3 }} />
      <span style={{ fontSize:13, fontWeight:700, color:"#2d3a2e", textTransform:"uppercase", letterSpacing:"0.4px" }}>
        {label}
      </span>
      <div style={{ flex:1, height:1, background:"#e5e5e5" }} />
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((s) => s.dashboard);

  const stats      = data?.stats;
  const revenue    = data?.monthlyRevenue     ?? [];
  const categories = data?.categorySales      ?? [];
  const orders     = data?.dailyOrders        ?? [];
  const users      = data?.userStats          ?? [];
  const outOfStock = data?.outOfStockMedicines ?? [];

  const revenueRef  = useRef(null);
  const categoryRef = useRef(null);
  const ordersRef   = useRef(null);
  const usersRef    = useRef(null);
  const charts      = useRef({});

  useEffect(() => { dispatch(loadDashboard()); }, [dispatch]);

  useEffect(() => {
    if (!stats) return;

    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;
    Chart.defaults.color       = "#888";

    Object.values(charts.current).forEach(c => c?.destroy());
    charts.current = {};

    if (revenueRef.current && revenue.length) {
      const ctx    = revenueRef.current.getContext("2d");
      const labels = revenue.map(r => MONTHS[(parseInt(r.month, 10) - 1)] ?? r.month);
      const vals   = revenue.map(r => r.revenue);
      charts.current.revenue = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "Revenue", data: vals,
            borderColor: BRAND.green,
            backgroundColor: grad(ctx, "rgba(82,164,104,0.28)", "rgba(82,164,104,0.02)"),
            fill: true, tension: 0.42,
            pointBackgroundColor: BRAND.green, pointBorderColor: "#fff",
            pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 7, borderWidth: 2.5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { ...TIP, callbacks: { label: i => ` ₹${i.raw.toLocaleString("en-IN")}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888" } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#888", callback: v => "₹" + (v/1000) + "k" } },
          },
        },
      });
    }

    if (categoryRef.current && categories.length) {
      const bgColors = [BRAND.green, BRAND.orange, BRAND.blue, BRAND.purple, BRAND.teal, BRAND.red];
      charts.current.category = new Chart(categoryRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: categories.map(c => c.categoryName),
          datasets: [{
            data: categories.map(c => c.percentage),
            backgroundColor: categories.map((_, i) => bgColors[i % bgColors.length]),
            borderWidth: 0, hoverOffset: 8,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: true, cutout: "62%",
          plugins: {
            legend: { position: "bottom", labels: { padding: 10, usePointStyle: true, pointStyleWidth: 10, font: { size: 10.5 } } },
            tooltip: { ...TIP, callbacks: { label: i => ` ${i.label}: ${i.raw}%` } },
          },
        },
      });
    }

    if (ordersRef.current && orders.length) {
      const barColors = [BRAND.green, BRAND.orange, BRAND.blue, BRAND.purple, BRAND.teal, BRAND.green, BRAND.red];
      const labels    = orders.map(o => DAYS[(parseInt(o.day, 10) - 1)] ?? o.day);
      charts.current.orders = new Chart(ordersRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Orders", data: orders.map(o => o.orders),
            backgroundColor: orders.map((_, i) => barColors[i % barColors.length]),
            borderRadius: 10, borderSkipped: false, barThickness: 26,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: { ...TIP, callbacks: { label: i => ` ${i.raw} orders` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888" } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#888", stepSize: 10 }, beginAtZero: true },
          },
        },
      });
    }

    if (usersRef.current && users.length) {
      const half    = Math.ceil(users.length / 2);
      const newData = users.slice(0, half);
      const retData = users.slice(half);
      const labels  = newData.map(u => MONTHS[(u.month - 1)] ?? u.month);
      charts.current.users = new Chart(usersRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "New Users", data: newData.map(u => u.count), backgroundColor: BRAND.green,      borderRadius: 8, barThickness: 16 },
            { label: "Returning", data: retData.map(u => u.count), backgroundColor: BRAND.greenLight,  borderRadius: 8, barThickness: 16 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { position: "top", align: "end", labels: { usePointStyle: true, pointStyleWidth: 10, padding: 12, font: { size: 11 } } },
            tooltip: { ...TIP },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888" } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#888", stepSize: 15 }, beginAtZero: true },
          },
        },
      });
    }

    return () => { Object.values(charts.current).forEach(c => c?.destroy()); };
  }, [revenue, categories, orders, users, stats]);

  const fmt  = n => Number(n  || 0).toLocaleString("en-IN");
  const fmtC = n => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // ── Top KPI cards ──
  const topCards = stats ? [
    { icon: "💊", value: stats.totalMedicines,    label: "Total Medicines",   color: "#16a085" },
    { icon: "⚠️", value: stats.outOfStock,         label: "Out of Stock",      color: "#e74c3c" },
    { icon: "💰", value: fmtC(stats.todayRevenue), label: "Today's Revenue",   color: "#8e44ad" },
    { icon: "🛒", value: stats.ordersToday,        label: "Orders Today",      color: "#2980b9" },
    { icon: "👥", value: stats.totalUsers,         label: "Total Users",       color: "#52a468" },
    { icon: "🆕", value: stats.usersToday,         label: "Users Added Today", color: "#e67e22" },
  ] : Array(6).fill(null).map((_, i) => ({
    icon:  ["💊","⚠️","💰","🛒","👥","🆕"][i],
    value: "—",
    label: ["Total Medicines","Out of Stock","Today's Revenue","Orders Today","Total Users","Users Added Today"][i],
    color: ["#16a085","#e74c3c","#8e44ad","#2980b9","#52a468","#e67e22"][i],
  }));

  // ── Medicine cards ──
  const medicineCards = [
    { icon: "💊", value: fmt(data?.totalMedicines),     label: "Total Medicines",  color: BRAND.teal   },
    { icon: "✅", value: fmt(data?.availableMedicines), label: "Available",         color: BRAND.green  },
    { icon: "📉", value: fmt(data?.lowStockCount),      label: "Low Stock (≤ 50)",  color: BRAND.orange },
    { icon: "❌", value: fmt(data?.outOfStockCount),    label: "Out of Stock",      color: BRAND.red    },
  ];

  // ── Revenue cards ──
  const revenueCards = [
    { icon: "💵", value: fmtC(data?.todayRevenue), label: "Today's Revenue", color: BRAND.purple },
    { icon: "📅", value: fmtC(data?.monthRevenue), label: "This Month",      color: BRAND.blue   },
    { icon: "💰", value: fmtC(data?.totalRevenue), label: "Total Revenue",   color: BRAND.green  },
  ];

  // ── Orders cards ──
  const orderCards = [
    { icon: "🛒", value: fmt(data?.totalOrders),     label: "Total Orders", color: BRAND.blue   },
    { icon: "✅", value: fmt(data?.deliveredOrders), label: "Delivered",    color: BRAND.green  },
    { icon: "❌", value: fmt(data?.cancelledOrders), label: "Cancelled",    color: BRAND.red    },
    { icon: "⏳", value: fmt(data?.pendingOrders),   label: "Pending",      color: BRAND.orange },
  ];

  return (
    <AdminLayout>
      <main className="content">

        <div className="page-heading">
          <h1 className="page-title">Welcome Back, Admin!</h1>
        </div>

        {error && (
          <div style={{ background:"#f8d7da", color:"#721c24", padding:"12px 18px", borderRadius:10, marginBottom:20, fontSize:13 }}>
            ⚠️ {error}
          </div>
        )}
        {loading && (
          <div style={{ textAlign:"center", color:BRAND.green, padding:"10px 0 18px", fontWeight:600, fontSize:13 }}>
            Loading dashboard data…
          </div>
        )}

        {/* ── Top KPI ── */}
        <section className="stats-grid">
          {topCards.map((c, i) => (
            <StatisticsCard key={i} icon={c.icon} value={c.value} label={c.label} color={c.color} />
          ))}
        </section>

        {/* ── Medicine Overview ── */}
        <SectionDivider label="Medicine Overview" />
        <section className="stats-grid">
          {medicineCards.map((c, i) => (
            <StatisticsCard key={i} icon={c.icon} value={c.value} label={c.label} color={c.color} />
          ))}
        </section>

        {/* Out of Stock Table */}
        {outOfStock.length > 0 && (
          <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:24 }}>
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontWeight:700, fontSize:13.5, color:"#1e3a28" }}>Out of Stock Medicines</span>
              <span style={{ fontSize:11, fontWeight:700, background:"#fce4e4", color:"#c62828", padding:"3px 12px", borderRadius:20 }}>
                {outOfStock.length} items
              </span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12.5 }}>
                <thead>
                  <tr style={{ background:"#fafafa" }}>
                    {["#","Medicine","Brand","Category","Price","Status"].map(h => (
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontWeight:700, color:"#888", fontSize:11, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outOfStock.map((m, i) => (
                    <tr key={m.medicineId} style={{ borderTop:"1px solid #f5f5f5" }}>
                      <td style={{ padding:"10px 16px", color:"#aaa" }}>{i + 1}</td>
                      <td style={{ padding:"10px 16px", fontWeight:700, color:"#1e3a28" }}>{m.name}</td>
                      <td style={{ padding:"10px 16px", color:"#666" }}>{m.brand}</td>
                      <td style={{ padding:"10px 16px", color:"#666" }}>{m.categoryName}</td>
                      <td style={{ padding:"10px 16px", fontWeight:600 }}>₹{fmt(m.finalPrice)}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <span style={{ background:"#fce4e4", color:"#c62828", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>
                          {m.medicineStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Revenue Overview ── */}
        <SectionDivider label="Revenue Overview" />
        <section className="stats-grid">
          {revenueCards.map((c, i) => (
            <StatisticsCard key={i} icon={c.icon} value={c.value} label={c.label} color={c.color} />
          ))}
        </section>

        {/* ── Orders Overview ── */}
        <SectionDivider label="Orders Overview" />
        <section className="stats-grid">
          {orderCards.map((c, i) => (
            <StatisticsCard key={i} icon={c.icon} value={c.value} label={c.label} color={c.color} />
          ))}
        </section>

        {/* ── Charts ── */}
        <SectionDivider label="Charts" />
        <section className="charts-row two-one">
          <div className="chart-card">
            <h3 className="chart-title">Monthly Sales Revenue</h3>
            <p className="chart-sub">Jan – Dec</p>
            <div className="chart-body"><canvas ref={revenueRef} /></div>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">Sales by Category</h3>
            <p className="chart-sub">This month</p>
            <div className="chart-body"><canvas ref={categoryRef} /></div>
          </div>
        </section>

        <section className="charts-row equal">
          <div className="chart-card">
            <h3 className="chart-title">Daily Orders — This Week</h3>
            <p className="chart-sub">Mon to Sun</p>
            <div className="chart-body"><canvas ref={ordersRef} /></div>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">New vs Returning Users</h3>
            <p className="chart-sub">Last 6 months</p>
            <div className="chart-body"><canvas ref={usersRef} /></div>
          </div>
        </section>

      </main>
    </AdminLayout>
  );
}