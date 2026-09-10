// admin/src/components/Products/Products.js
import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';
import { toast } from '../Toast/Toast';
import { StockBadge, CatBadge } from '../Dashboard/Dashboard';
import { useEscapeKey } from '../../hooks/useEscapeKey';

const EMPTY_FORM = {
  name: '', emoji: '', cat: 'powder', catLabel: 'Powder',
  desc: '', tags: '', origin: '', grade: '', packSize: '',
  availability: 'Year Round', stock: 'In Stock', startPrice: '', endPrice: '', price: '', unit: 'kg', featured: false,
};

const CAT_LABELS = { powder: 'Powder', whole: 'Whole Spice', seed: 'Seed', blend: 'Blend & Tea', oil: 'Oil', snack: 'Snack' };

function formatPriceRange(p) {
  const s = p.startPrice || p.price;
  const e = p.endPrice;
  if (s && e && s !== e) {
    return `₹ ${s} – ₹ ${e}`;
  }
  return `₹ ${s || '0'}`;
}

function ProductForm({ initial, onSave, onCancel }) {
  useEscapeKey(onCancel);
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Product name is required', 'error'); return; }
    setLoading(true);
    try {
      const sPrice = form.startPrice || form.price || '';
      const ePrice = form.endPrice || sPrice;
      const payload = {
        ...form,
        startPrice: sPrice,
        endPrice: ePrice,
        price: sPrice,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags
      };
      await onSave(payload);
    } catch (e) {
      toast(e.response?.data?.message || 'Save failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box lg">
        <div className="modal-head">
          <h3>{initial?.id ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Image URL</label>
              <input className="form-input" value={form.emoji} onChange={e => set('emoji', e.target.value)} placeholder="https://images.unsplash.com/photo-..." />
            </div>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.cat} onChange={e => set('cat', e.target.value) || set('catLabel', CAT_LABELS[e.target.value])}>
                {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Stock Status</label>
              <select className="form-input" value={form.stock} onChange={e => set('stock', e.target.value)}>
                {['In Stock', 'Limited', 'Out of Stock'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Price (₹)</label>
              <input className="form-input" value={form.startPrice} onChange={e => set('startPrice', e.target.value)} placeholder="120" />
            </div>
            <div className="form-group">
              <label className="form-label">End Price (₹)</label>
              <input className="form-input" value={form.endPrice} onChange={e => set('endPrice', e.target.value)} placeholder="150" />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['kg', 'g', 'piece', 'dozen', 'litre'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Origin</label>
              <input className="form-input" value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="Kerala / Tamil Nadu" />
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <input className="form-input" value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="Premium / Sortex" />
            </div>
            <div className="form-group">
              <label className="form-label">Pack Size</label>
              <input className="form-input" value={form.packSize} onChange={e => set('packSize', e.target.value)} placeholder="25 kg / 50 kg" />
            </div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <input className="form-input" value={form.availability} onChange={e => set('availability', e.target.value)} placeholder="Year Round" />
            </div>
            <div className="form-group full">
              <label className="form-label">Tags (comma-separated)</label>
              <input className="form-input" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => set('tags', e.target.value)} placeholder="Hot, Aromatic, Export Grade" />
            </div>
            <div className="form-group full">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Detailed product description…" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} style={{ width: 15, height: 15 }} />
                Featured Product
              </label>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : (initial?.id ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [formItem, setFormItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getProducts().then(r => { setProducts(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const mCat = catFilter === 'all' || p.cat === catFilter;
    const mStock = stockFilter === 'all' || p.stock === stockFilter;
    const mSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.origin?.toLowerCase().includes(search.toLowerCase());
    return mCat && mStock && mSearch;
  });

  const handleSave = async (data) => {
    if (formItem?.id) {
      await updateProduct(formItem.id, data);
      toast('Product updated successfully');
    } else {
      await createProduct(data);
      toast('Product added successfully');
    }
    setShowForm(false); setFormItem(null); load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await deleteProduct(id); toast(`"${name}" deleted`); load(); }
    catch { toast('Delete failed', 'error'); }
  };

  const openAdd = () => { setFormItem(null); setShowForm(true); };
  const openEdit = (p) => { setFormItem({ ...p, startPrice: p.startPrice || p.price || '', endPrice: p.endPrice || '', tags: p.tags?.join(', ') }); setShowForm(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products <span>({products.length})</span></h1>
          <p className="page-subtitle">Manage your spice catalogue</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', 'powder', 'whole', 'seed', 'blend', 'oil', 'snack'].map(c => (
              <button key={c} className={`filter-chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>
                {c === 'all' ? 'All' : CAT_LABELS[c] || c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {['all', 'In Stock', 'Limited', 'Out of Stock'].map(s => (
              <button key={s} className={`filter-chip ${stockFilter === s ? 'active' : ''}`} onClick={() => setStockFilter(s)}>
                {s === 'all' ? 'All Stock' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Origin</th>
                  <th>Grade</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">🔍</div><p className="empty-text">No products found.</p></div></td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td data-label="Product">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--bg3)', fontSize: 22 }}>
                          {p.emoji && (p.emoji.startsWith('/') || p.emoji.startsWith('http')) ? <img src={p.emoji.startsWith('/') ? `http://localhost:3000${p.emoji}` : p.emoji} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.emoji || '🌿')}
                        </span>
                        <div>
                          <div className="td-name">{p.name}</div>
                          <div className="td-sub">{p.tags?.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Category"><CatBadge cat={p.cat} catLabel={p.catLabel} /></td>
                    <td data-label="Origin" style={{ fontSize: 12, color: 'var(--text-mid)', maxWidth: 160 }}>{p.origin}</td>
                    <td data-label="Grade" style={{ fontSize: 12, color: 'var(--text-mid)' }}>{p.grade}</td>
                    <td data-label="Price"><span style={{ fontWeight: 600, color: 'var(--gold)', fontFamily: "'Cormorant Garamond',serif", fontSize: 15 }}>{formatPriceRange(p)} / {p.unit}</span></td>
                    <td data-label="Stock"><StockBadge stock={p.stock} /></td>
                    <td data-label="Featured" style={{ textAlign: 'center', fontSize: 16 }}>{p.featured ? '⭐' : '—'}</td>
                    <td data-label="Actions">
                      <div className="td-actions">
                        <button className="btn btn-info btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>🗑️ Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          initial={formItem}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setFormItem(null); }}
        />
      )}
    </div>
  );
}

export default Products;
