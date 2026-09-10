// admin/src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const ACCENT = { products: '#C9A84C', enquiries: '#3498DB', pending: '#E74C3C', orders: '#27AE60' };

function KpiCard({ icon, num, label, color, delta }) {
  return (
    <div className="kpi-card" style={{ '--accent-color': color }}>
      <div className="kpi-top">
        <div>
          <div className="kpi-num" style={{ color }}>{num}</div>
          <div className="kpi-label">{label}</div>
        </div>
        <span className="kpi-icon">{icon}</span>
      </div>
      {delta && <div className="kpi-delta">{delta}</div>}
    </div>
  );
}

function StatusRow({ label, count, total, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{count}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: total ? `${(count / total) * 100}%` : '0%', background: color }} />
      </div>
    </div>
  );
}

function Dashboard({ setActive }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;


  if (!data) return <div className="empty-state"><div className="empty-icon">⚠️</div><p className="empty-text">Failed to load analytics.</p></div>;
  const catColors = { powder: '#E74C3C', whole: '#27AE60', seed: '#3498DB', blend: '#9B59B6', oil: '#D35400', snack: '#F1C40F' };
  const catLabels = { powder: 'Powders', whole: 'Whole Spices', seed: 'Seeds', blend: 'Blends & Tea', oil: 'Oils', snack: 'Snacks' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back. Here's your business overview.</p>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', background: 'var(--bg3)', padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="kpi-grid">
        <KpiCard icon="🌶️" num={data.totalProducts} label="Total Products" color={ACCENT.products} delta="↑ All active" />
        <KpiCard icon="📬" num={data.totalEnquiries} label="Total Enquiries" color={ACCENT.enquiries} delta={`${data.pendingEnquiries} pending`} />
        <KpiCard icon="⏳" num={data.pendingEnquiries} label="Pending Replies" color={ACCENT.pending} />
        <KpiCard icon="📦" num={data.totalOrders} label="Total Orders" color={ACCENT.orders} delta={`₹ ${data.totalRevenue?.toLocaleString('en-IN')}`} />
      </div>

      <div className="dashboard-grid-2-1">
        {/* Enquiry Trend Chart */}
        <div className="card">
          <div className="card-title">Monthly Enquiries <span>2025</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyEnquiries} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }} cursor={{ fill: 'rgba(201,168,76,.07)' }} />
              <Bar dataKey="count" name="Enquiries" fill="var(--gold)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Overview */}
        <div className="card">
          <div className="card-title">Stock Status</div>
          <StatusRow label="In Stock" count={data.inStockProducts} total={data.totalProducts} color="var(--green)" />
          <StatusRow label="Limited Stock" count={data.limitedProducts} total={data.totalProducts} color="var(--orange)" />
          <StatusRow label="Out of Stock" count={data.outOfStockProducts} total={data.totalProducts} color="var(--red)" />
          <hr className="detail-sep" />
          <div className="card-title" style={{ marginBottom: 12 }}>By Category</div>
          {Object.entries(data.productsByCategory).map(([k, v]) => (
            <StatusRow key={k} label={catLabels[k]} count={v} total={data.totalProducts} color={catColors[k]} />
          ))}
        </div>
      </div>

      <div className="dashboard-grid-1-1">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-title">Monthly Revenue <span>₹ INR</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' }} formatter={v => [`₹ ${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2.5} dot={{ fill: 'var(--gold)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Enquiries */}
        <div className="card">
          <div className="card-title">Recent Enquiries <span style={{ cursor: 'pointer', color: 'var(--gold)' }} onClick={() => setActive('enquiries')}>View All →</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Client</th><th>Product</th><th>Status</th></tr></thead>
              <tbody>
                {data.recentEnquiries?.map(e => (
                  <tr key={e.id}>
                    <td><div className="td-name">{e.name}</div><div className="td-sub">{e.date}</div></td>
                    <td style={{ fontSize: 12, color: 'var(--text-mid)' }}>{e.product}</td>
                    <td><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'Pending': 'badge-pending', 'In Progress': 'badge-progress', 'Replied': 'badge-replied',
    'Delivered': 'badge-delivered', 'In Transit': 'badge-transit', 'Processing': 'badge-processing',
    'Cancelled': 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || ''}`}>{status}</span>;
}

export function StockBadge({ stock }) {
  const map = { 'In Stock': 'badge-instock', 'Limited': 'badge-limited', 'Out of Stock': 'badge-outstock' };
  return <span className={`badge ${map[stock] || ''}`}>{stock}</span>;
}

export function CatBadge({ cat, catLabel }) {
  const map = { powder: 'badge-powder', whole: 'badge-whole', seed: 'badge-seed', blend: 'badge-blend', oil: 'badge-oil', snack: 'badge-snack' };
  return <span className={`badge ${map[cat] || ''}`}>{catLabel || cat}</span>;
}

export default Dashboard;
