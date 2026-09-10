// admin/src/components/Enquiries/Enquiries.js
import React, { useState, useEffect, useCallback } from 'react';
import { getEnquiries, updateEnquiryStatus, deleteEnquiry } from '../../services/api';
import { toast } from '../Toast/Toast';
import { StatusBadge } from '../Dashboard/Dashboard';
import { useEscapeKey } from '../../hooks/useEscapeKey';

const STATUSES = ['Pending', 'In Progress', 'Replied'];

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEscapeKey(() => setSelected(null), Boolean(selected));

  const load = useCallback(() => {
    setLoading(true);
    getEnquiries().then(r => { setEnquiries(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = enquiries.filter(e => {
    const mStatus = statusFilter === 'all' || e.status === statusFilter;
    const q = search.toLowerCase();
    const mSearch = !q || e.name.toLowerCase().includes(q) || e.company.toLowerCase().includes(q) || e.product.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    return mStatus && mSearch;
  });

  const changeStatus = async (id, status) => {
    try {
      await updateEnquiryStatus(id, status);
      setEnquiries(es => es.map(e => e.id === id ? { ...e, status } : e));
      if (selected?.id === id) setSelected(s => ({ ...s, status }));
      toast(`Status updated to "${status}"`);
    } catch { toast('Update failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await deleteEnquiry(id);
      setEnquiries(es => es.filter(e => e.id !== id));
      if (selected?.id === id) setSelected(null);
      toast('Enquiry deleted');
    } catch { toast('Delete failed', 'error'); }
  };

  const counts = {
    all: enquiries.length,
    Pending: enquiries.filter(e => e.status === 'Pending').length,
    'In Progress': enquiries.filter(e => e.status === 'In Progress').length,
    Replied: enquiries.filter(e => e.status === 'Replied').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Enquiries <span>({enquiries.length})</span></h1>
          <p className="page-subtitle">Manage customer product enquiries</p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        {[
          { label: 'All', key: 'all', color: 'var(--gold)', icon: '📬' },
          { label: 'Pending', key: 'Pending', color: 'var(--red)', icon: '⏳' },
          { label: 'In Progress', key: 'In Progress', color: 'var(--orange)', icon: '🔄' },
          { label: 'Replied', key: 'Replied', color: 'var(--green)', icon: '✅' },
        ].map(s => (
          <div key={s.key} className="kpi-card" style={{ '--accent-color': s.color, cursor: 'pointer', outline: statusFilter === s.key ? `2px solid ${s.color}` : 'none' }}
            onClick={() => setStatusFilter(s.key)}>
            <div className="kpi-top">
              <div>
                <div className="kpi-num" style={{ color: s.color, fontSize: 32 }}>{counts[s.key] || 0}</div>
                <div className="kpi-label">{s.label}</div>
              </div>
              <span className="kpi-icon">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`split-grid ${selected ? 'has-details' : ''}`}>
        <div className="card">
          <div className="toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, product, email…" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              {['all', ...STATUSES].map(s => (
                <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Client</th><th>Product</th><th>Date</th><th>Status</th><th>Update</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📭</div><p className="empty-text">No enquiries found.</p></div></td></tr>
                  )}
                  {filtered.map(e => (
                    <tr key={e.id} className={selected?.id === e.id ? 'selected' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelected(e)}>
                      <td data-label="Client">
                        <div className="td-name">{e.name}</div>
                        <div className="td-sub">{e.company}</div>
                      </td>
                      <td data-label="Product" style={{ fontSize: 12, color: 'var(--text-mid)' }}>{e.product || '—'}</td>
                      <td data-label="Date" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{e.date}</td>
                      <td data-label="Status"><StatusBadge status={e.status} /></td>
                      <td data-label="Update" onClick={ev => ev.stopPropagation()}>
                        <select className="form-input" style={{ padding: '5px 10px', fontSize: 11, width: 'auto', cursor: 'pointer' }}
                          value={e.status} onChange={ev => changeStatus(e.id, ev.target.value)}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td data-label="Actions" onClick={ev => ev.stopPropagation()}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="detail-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--white)', fontWeight: 600 }}>Enquiry Detail</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <StatusBadge status={selected.status} />
            <hr className="detail-sep" />
            {[
              ['👤 Name', selected.name], ['🏢 Company', selected.company || '—'],
              ['📧 Email', selected.email], ['📞 Phone', selected.phone || '—'],
              ['🌶️ Product', selected.product || '—'], ['📅 Date', selected.date],
            ].map(([l, v]) => (
              <div key={l} className="detail-row">
                <div className="detail-label">{l}</div>
                <div className="detail-value">{v}</div>
              </div>
            ))}
            {selected.message && (
              <div className="detail-row">
                <div className="detail-label">💬 Message</div>
                <div style={{ background: 'rgba(255,255,255,.04)', padding: '10px 14px', borderRadius: 6, fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.6, marginTop: 4 }}>
                  {selected.message}
                </div>
              </div>
            )}
            <hr className="detail-sep" />
            <div className="detail-label" style={{ marginBottom: 10 }}>Update Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATUSES.map(s => (
                <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-gold' : 'btn-outline'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => changeStatus(selected.id, s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Enquiries;
