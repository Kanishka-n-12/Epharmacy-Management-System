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

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, revenue, categories, orders, users, loading, error } =
    useSelector((s) => s.dashboard);

  const revenueRef  = useRef(null);
  const categoryRef = useRef(null);
  const ordersRef   = useRef(null);
  const usersRef    = useRef(null);
  const charts      = useRef({});

  useEffect(() => {
    dispatch(loadDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (!stats || !revenue.length) return;

    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;
    Chart.defaults.color       = "#888";

    Object.values(charts.current).forEach(c => c?.destroy());
    charts.current = {};

    if (revenueRef.current && revenue.length) {
      const ctx    = revenueRef.current.getContext("2d");
      const labels = revenue.map(r => MONTHS[(parseInt(r.month, 10) - 1)] ?? r.month);
      const data   = revenue.map(r => r.revenue);
      charts.current.revenue = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label:                "Revenue",
            data,
            borderColor:          BRAND.green,
            backgroundColor:      grad(ctx, "rgba(82,164,104,0.28)", "rgba(82,164,104,0.02)"),
            fill:                 true,
            tension:              0.42,
            pointBackgroundColor: BRAND.green,
            pointBorderColor:     "#fff",
            pointBorderWidth:     2,
            pointRadius:          4,
            pointHoverRadius:     7,
            borderWidth:          2.5,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend:  { display: false },
            tooltip: { ...TIP, callbacks: { label: i => ` ₹${i.raw.toLocaleString("en-IN")}` } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888" } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#888", callback: v => "₹" + (v / 1000) + "k" } },
          },
        },
      });
    }

    if (categoryRef.current && categories.length) {
      const bgColors = [BRAND.green, BRAND.orange, BRAND.blue, BRAND.purple, BRAND.teal, BRAND.red];
      charts.current.category = new Chart(categoryRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels:   categories.map(c => c.categoryName),
          datasets: [{
            data:            categories.map(c => c.percentage),
            backgroundColor: categories.map((_, i) => bgColors[i % bgColors.length]),
            borderWidth:     0,
            hoverOffset:     8,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: true, cutout: "62%",
          plugins: {
            legend:  { position: "bottom", labels: { padding: 10, usePointStyle: true, pointStyleWidth: 10, font: { size: 10.5 } } },
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
            label:           "Orders",
            data:            orders.map(o => o.orders),
            backgroundColor: orders.map((_, i) => barColors[i % barColors.length]),
            borderRadius:    10,
            borderSkipped:   false,
            barThickness:    26,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: {
            legend:  { display: false },
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
            { label: "New Users", data: newData.map(u => u.count), backgroundColor: BRAND.green,     borderRadius: 8, barThickness: 16 },
            { label: "Returning", data: retData.map(u => u.count), backgroundColor: BRAND.greenLight, borderRadius: 8, barThickness: 16 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend:  { position: "top", align: "end", labels: { usePointStyle: true, pointStyleWidth: 10, padding: 12, font: { size: 11 } } },
            tooltip: { ...TIP },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888" } },
            y: { grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: "#888", stepSize: 15 }, beginAtZero: true },
          },
        },
      });
    }

    return () => {
      Object.values(charts.current).forEach(c => c?.destroy());
    };
  }, [revenue, categories, orders, users, stats]);

  const statCards = stats
    ? [
        { icon: "💊", value: stats.totalMedicines,                             label: "Total Medicines",   color: "#16a085" },
        { icon: "⚠️", value: stats.outOfStock,                                 label: "Out of Stock",      color: "#e74c3c" },
        { icon: "💰", value: `₹${stats.todayRevenue.toLocaleString("en-IN")}`, label: "Today's Revenue",   color: "#8e44ad" },
        { icon: "🛒", value: stats.ordersToday,                                label: "Orders Today",      color: "#2980b9" },
        { icon: "👥", value: stats.totalUsers,                                 label: "Total Users",       color: "#52a468" },
        { icon: "🆕", value: stats.usersToday,                                 label: "Users Added Today", color: "#e67e22" },
      ]
    : [
        { icon: "💊", value: "—", label: "Total Medicines",   color: "#16a085" },
        { icon: "⚠️", value: "—", label: "Out of Stock",      color: "#e74c3c" },
        { icon: "💰", value: "—", label: "Today's Revenue",   color: "#8e44ad" },
        { icon: "🛒", value: "—", label: "Orders Today",      color: "#2980b9" },
        { icon: "👥", value: "—", label: "Total Users",       color: "#52a468" },
        { icon: "🆕", value: "—", label: "Users Added Today", color: "#e67e22" },
      ];

  return (
    <AdminLayout>
      <main className="content">
        <div className="page-heading">
          <h1 className="page-title">Welcome Back, Admin!</h1>
        </div>

        {error && (
          <div style={{ background: "#f8d7da", color: "#721c24", padding: "12px 18px", borderRadius: 10, marginBottom: 20, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", color: "#52a468", padding: "10px 0 18px", fontWeight: 600, fontSize: 13 }}>
            Loading dashboard data…
          </div>
        )}

        <section className="stats-grid">
          {statCards.map((c, i) => (
            <StatisticsCard key={i} icon={c.icon} value={c.value} label={c.label} color={c.color} />
          ))}
        </section>

        <section className="charts-row two-one">
          <div className="chart-card">
            <h3 className="chart-title">Monthly Sales Revenue</h3>
            <p className="chart-sub">Jan – Dec</p>
            <div className="chart-body">
              <canvas ref={revenueRef} id="revenueChart" />
            </div>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">Sales by Category</h3>
            <p className="chart-sub">This month</p>
            <div className="chart-body">
              <canvas ref={categoryRef} id="categoryChart" />
            </div>
          </div>
        </section>

        <section className="charts-row equal">
          <div className="chart-card">
            <h3 className="chart-title">Daily Orders — This Week</h3>
            <p className="chart-sub">Mon to Sun</p>
            <div className="chart-body">
              <canvas ref={ordersRef} id="ordersChart" />
            </div>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">New vs Returning Users</h3>
            <p className="chart-sub">Last 6 months</p>
            <div className="chart-body">
              <canvas ref={usersRef} id="usersChart" />
            </div>
          </div>
        </section>
      </main>

      
    </AdminLayout>
  );
}