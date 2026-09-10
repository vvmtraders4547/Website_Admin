// admin/src/components/Analytics/Analytics.js
import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = { powder: '#E74C3C', whole: '#27AE60', seed: '#3498DB', blend: '#9B59B6' };
const PIE_COLORS = ['#E74C3C', '#27AE60', '#3498DB', '#9B59B6'];
const STATUS_COLORS = { Pending: '#E74C3C', 'In Progress': '#E67E22', Replied: '#27AE60' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#252540', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'rgba(255,255,255,.8)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><div className="empty-icon">⚠️</div><p className="empty-text">Failed to load analytics data.</p></div>;

  const catData = Object.entries(data.productsByCategory).map(([k, v]) => ({
    name: { powder: 'Powders', whole: 'Whole Spices', seed: 'Seeds', blend: 'Blends & Tea' }[k],
    count: v, color: COLORS[k],
  }));

  const enqStatusData = Object.entries(data.ordersByStatus || {}).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Business performance overview for 2025</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: '📦', n: data.totalProducts, l: 'Total Products', color: '#C9A84C' },
          { icon: '📬', n: data.totalEnquiries, l: 'Total Enquiries', color: '#3498DB' },
          { icon: '🛒', n: data.totalOrders, l: 'Total Orders', color: '#27AE60' },
          { icon: '💰', n: `₹${((data.totalRevenue || 0) / 1000).toFixed(0)}k`, l: 'Total Revenue', color: '#9B59B6' },
        ].map((k, i) => (
          <div key={i} className="kpi-card" style={{ '--accent-color': k.color }}>
            <div className="kpi-top">
              <div><div className="kpi-num" style={{ color: k.color }}>{k.n}</div><div className="kpi-label">{k.l}</div></div>
              <span className="kpi-icon">{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="analytics-grid-1-1">
        <div className="card">
          <div className="card-title">Monthly Enquiries <span>2025</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthlyEnquiries} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Enquiries" fill="#C9A84C" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Monthly Revenue <span>2025 | ₹ INR</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#C9A84C" strokeWidth={2.5} dot={{ fill: '#C9A84C', r: 4 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="analytics-grid-1-1-1">
        {/* Products by category bar */}
        <div className="card">
          <div className="card-title">Products by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} layout="vertical" barCategoryGap="25%">
              <XAxis type="number" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-mid)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Products" radius={[0,4,4,0]}>
                {catData.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Enquiry status pie */}
        <div className="card">
          <div className="card-title">Enquiry Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[
                { name: 'Pending', value: data.pendingEnquiries },
                { name: 'In Progress', value: data.inProgressEnquiries },
                { name: 'Replied', value: data.repliedEnquiries },
              ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                <Cell fill="#E74C3C" /><Cell fill="#E67E22" /><Cell fill="#27AE60" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-mid)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order status */}
        <div className="card">
          <div className="card-title">Order Status</div>
          <div style={{ marginTop: 8 }}>
            {Object.entries(data.ordersByStatus || {}).map(([k, v]) => {
              const colors = { Pending: '#E74C3C', Processing: '#E67E22', 'In Transit': '#3498DB', Delivered: '#27AE60', Cancelled: '#888' };
              return (
                <div key={k} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: colors[k] }}>{v}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: data.totalOrders ? `${(v / data.totalOrders) * 100}%` : '0%', background: colors[k] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
