// admin/src/components/Orders/Orders.js
import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, createOrder, updateOrderStatus, deleteOrder } from '../../services/api';
import { toast } from '../Toast/Toast';
import { StatusBadge } from '../Dashboard/Dashboard';
import { useEscapeKey } from '../../hooks/useEscapeKey';

const ORDER_STATUSES = ['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];

function NewOrderModal({ onSave, onCancel }) {
  useEscapeKey(onCancel);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', product: '', qty: '', unit: 'kg', total: '', address: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.clientName.trim() || !form.product.trim()) { toast('Client name and product are required', 'error'); return; }
    setLoading(true);
    try { await onSave(form); }
    catch (e) { toast(e.response?.data?.message || 'Save failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box">
        <div className="modal-head"><h3>Create New Order</h3><button className="modal-close" onClick={onCancel}>✕</button></div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Client Name *</label><input className="form-input" value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Company / Client name" /></div>
            <div className="form-group"><label className="form-label">Client Email</label><input className="form-input" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="email@client.com" /></div>
            <div className="form-group"><label className="form-label">Product *</label><input className="form-input" value={form.product} onChange={e => set('product', e.target.value)} placeholder="e.g. Cardamom (Green)" /></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="City, State" /></div>
            <div className="form-group"><label className="form-label">Quantity</label><input className="form-input" type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="50" /></div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['kg', 'g', 'piece', 'dozen', 'litre'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group full"><label className="form-label">Total Value (₹)</label><input className="form-input" type="number" value={form.total} onChange={e => set('total', e.target.value)} placeholder="90000" /></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={loading}>{loading ? 'Creating…' : 'Create Order'}</button>
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);

  useEscapeKey(() => setSelected(null), Boolean(selected));

  const load = useCallback(() => {
    setLoading(true);
    getOrders().then(r => { setOrders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const mStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const mSearch = !q || o.clientName.toLowerCase().includes(q) || o.product.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    return mStatus && mSearch;
  });

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(os => os.map(o => o.id === id ? { ...o, status } : o));
      if (selected?.id === id) setSelected(s => ({ ...s, status }));
      toast(`Order status updated to "${status}"`);
    } catch { toast('Update failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteOrder(id);
      setOrders(os => os.filter(o => o.id !== id));
      if (selected?.id === id) setSelected(null);
      toast('Order deleted successfully');
    } catch { toast('Delete failed', 'error'); }
  };

  const handleNewOrder = async (data) => {
    await createOrder(data);
    toast('Order created successfully');
    setShowNew(false);
    load();
  };

  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders <span>({orders.length})</span></h1>
          <p className="page-subtitle">Track and manage export orders</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowNew(true)}>+ New Order</button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { l: 'Total Orders', v: orders.length, color: 'var(--gold)', icon: '📦' },
          { l: 'Pending', v: orders.filter(o => o.status === 'Pending').length, color: 'var(--red)', icon: '⏳' },
          { l: 'In Transit', v: orders.filter(o => o.status === 'In Transit').length, color: 'var(--blue)', icon: '🚚' },
          { l: 'Revenue (Delivered)', v: `₹${(totalRevenue/1000).toFixed(0)}k`, color: 'var(--green)', icon: '💰' },
        ].map((k, i) => (
          <div key={i} className="kpi-card" style={{ '--accent-color': k.color }}>
            <div className="kpi-top">
              <div><div className="kpi-num" style={{ color: k.color, fontSize: 32 }}>{k.v}</div><div className="kpi-label">{k.l}</div></div>
              <span className="kpi-icon">{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`split-grid ${selected ? 'has-details' : ''}`}>
        <div className="card">
          <div className="toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              {['all', ...ORDER_STATUSES].map(s => (
                <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order ID</th><th>Client</th><th>Product</th><th>Qty</th><th>Value</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📭</div><p className="empty-text">No orders found.</p></div></td></tr>}
                  {filtered.map(o => (
                    <tr key={o.id} className={selected?.id === o.id ? 'selected' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                      <td data-label="Order ID"><span className="td-mono">{o.id}</span></td>
                      <td data-label="Client"><div className="td-name">{o.clientName}</div><div className="td-sub">{o.address}</div></td>
                      <td data-label="Product" style={{ fontSize: 12, color: 'var(--text-mid)' }}>{o.product}</td>
                      <td data-label="Qty" style={{ fontWeight: 500 }}>{o.qty} {o.unit}</td>
                      <td data-label="Value" style={{ fontWeight: 600, color: 'var(--green)' }}>₹ {o.total?.toLocaleString('en-IN')}</td>
                      <td data-label="Date" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{o.date}</td>
                      <td data-label="Status"><StatusBadge status={o.status} /></td>
                      <td data-label="Update" onClick={ev => ev.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <select className="form-input" style={{ padding: '5px 10px', fontSize: 11, width: 'auto', cursor: 'pointer' }}
                            value={o.status} onChange={ev => changeStatus(o.id, ev.target.value)}>
                            {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'var(--red)', color: 'var(--red)', minWidth: 'unset' }} title="Delete Order" onClick={() => handleDelete(o.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span className="td-mono" style={{ fontSize: 18 }}>{selected.id}</span>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <StatusBadge status={selected.status} />
            <hr className="detail-sep" />
            {[
              ['Client', selected.clientName], ['Email', selected.clientEmail || '—'],
              ['Product', selected.product], ['Quantity', `${selected.qty} ${selected.unit}`],
              ['Total Value', `₹ ${selected.total?.toLocaleString('en-IN')}`],
              ['Delivery Address', selected.address || '—'], ['Date', selected.date],
            ].map(([l, v]) => (
              <div key={l} className="detail-row">
                <div className="detail-label">{l}</div>
                <div className="detail-value">{v}</div>
              </div>
            ))}
            <hr className="detail-sep" />
            <div className="detail-label" style={{ marginBottom: 10 }}>Update Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ORDER_STATUSES.map(s => (
                <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-gold' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => changeStatus(selected.id, s)}>{s}</button>
              ))}
              <button className="btn btn-sm btn-outline" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--red)', color: 'var(--red)', marginTop: 8 }} onClick={() => handleDelete(selected.id)}>Delete Order</button>
            </div>
          </div>
        )}
      </div>

      {showNew && <NewOrderModal onSave={handleNewOrder} onCancel={() => setShowNew(false)} />}
    </div>
  );
}

export default Orders;
