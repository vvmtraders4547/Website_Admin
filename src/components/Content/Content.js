import React, { useState, useEffect } from 'react';
import { toast } from '../Toast/Toast';
import { getContent, updateContent } from '../../services/api';

const Section = ({ title, children, onAdd }) => (
  <div className="card" style={{ marginBottom: 24 }}>
    <div className="card-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{title}</span>
      {onAdd && <button className="btn" style={{ padding: '6px 12px', fontSize: 13, background: 'var(--card-bg)', border: '1px solid var(--border)', color: '#fff' }} onClick={onAdd}>+ Add Item</button>}
    </div>
    {children}
  </div>
);

function Content() {
  const [content, setContent] = useState({ testimonials: [], whyUs: [], process: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getContent().then(r => {
      if (r.data) setContent(r.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast('Failed to load content', 'error');
      setLoading(false);
    });
  }, []);

  const saveContent = async () => {
    setSaving(true);
    try {
      await updateContent(content);
      toast('Content updated successfully!');
    } catch (err) {
      toast('Failed to save content', 'error');
    }
    setSaving(false);
  };

  const handleItemChange = (section, index, field, value) => {
    const newItems = [...content[section]];
    newItems[index] = { ...newItems[index], [field]: value };
    setContent({ ...content, [section]: newItems });
  };

  const handleAddItem = (section) => {
    const newItems = [...content[section]];
    if (section === 'testimonials') newItems.push({ init: '', name: '', role: '', quote: '', stars: 5 });
    else if (section === 'whyUs') newItems.push({ icon: '', num: '', title: '', body: '' });
    else if (section === 'process') newItems.push({ icon: '', n: '', title: '', body: '' });
    setContent({ ...content, [section]: newItems });
  };

  const handleRemoveItem = (section, index) => {
    const newItems = [...content[section]];
    newItems.splice(index, 1);
    setContent({ ...content, [section]: newItems });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Website Content</h1>
          <p className="page-subtitle">Manage landing page sections: Testimonials, Why Us, and How We Work</p>
        </div>
        <button className="btn btn-gold" onClick={saveContent} disabled={saving || loading}>
          {saving ? 'Saving...' : '✅ Save All Changes'}
        </button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ maxWidth: 900 }}>
          {/* Testimonials */}
          <Section title="Testimonials (Trusted by Businesses)" onAdd={() => handleAddItem('testimonials')}>
            {content.testimonials.map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)', position: 'relative' }}>
                <button className="btn" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', background: 'rgba(255,50,50,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,50,50,0.2)' }} onClick={() => handleRemoveItem('testimonials', i)} title="Delete Item">🗑️</button>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 12, marginTop: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={t.name} onChange={e => handleItemChange('testimonials', i, 'name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initials / Avatar</label>
                    <input className="form-input" value={t.init} onChange={e => handleItemChange('testimonials', i, 'init', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Role / Company</label>
                    <input className="form-input" value={t.role} onChange={e => handleItemChange('testimonials', i, 'role', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating (1-5)</label>
                    <input className="form-input" type="number" min="1" max="5" value={t.stars || 5} onChange={e => handleItemChange('testimonials', i, 'stars', Number(e.target.value))} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Quote</label>
                    <textarea className="form-input" value={t.quote} onChange={e => handleItemChange('testimonials', i, 'quote', e.target.value)} rows={3} />
                  </div>
                </div>
              </div>
            ))}
          </Section>

          {/* Why Us */}
          <Section title="Why Choose VVM (The VVM Difference)" onAdd={() => handleAddItem('whyUs')}>
            {content.whyUs.map((w, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)', position: 'relative' }}>
                <button className="btn" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', background: 'rgba(255,50,50,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,50,50,0.2)' }} onClick={() => handleRemoveItem('whyUs', i)} title="Delete Item">🗑️</button>
                <div className="form-grid" style={{ marginTop: 12 }}>
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label className="form-label">Emoji / Icon</label>
                    <input className="form-input" value={w.icon} onChange={e => handleItemChange('whyUs', i, 'icon', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label className="form-label">Number</label>
                    <input className="form-input" value={w.num} onChange={e => handleItemChange('whyUs', i, 'num', e.target.value)} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={w.title} onChange={e => handleItemChange('whyUs', i, 'title', e.target.value)} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" value={w.body} onChange={e => handleItemChange('whyUs', i, 'body', e.target.value)} rows={2} />
                  </div>
                </div>
              </div>
            ))}
          </Section>

          {/* Process */}
          <Section title="How We Work (From Farm to Your Door)" onAdd={() => handleAddItem('process')}>
            {content.process.map((p, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)', position: 'relative' }}>
                <button className="btn" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px', background: 'rgba(255,50,50,0.1)', color: '#ff4d4f', border: '1px solid rgba(255,50,50,0.2)' }} onClick={() => handleRemoveItem('process', i)} title="Delete Item">🗑️</button>
                <div className="form-grid" style={{ marginTop: 12 }}>
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label className="form-label">Emoji / Icon</label>
                    <input className="form-input" value={p.icon} onChange={e => handleItemChange('process', i, 'icon', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 1' }}>
                    <label className="form-label">Number</label>
                    <input className="form-input" value={p.n} onChange={e => handleItemChange('process', i, 'n', e.target.value)} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={p.title} onChange={e => handleItemChange('process', i, 'title', e.target.value)} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" value={p.body} onChange={e => handleItemChange('process', i, 'body', e.target.value)} rows={2} />
                  </div>
                </div>
              </div>
            ))}
          </Section>
          
          <div style={{ textAlign: 'right', marginTop: 16, paddingBottom: 40 }}>
            <button className="btn btn-gold" onClick={saveContent} disabled={saving || loading} style={{ padding: '12px 24px', fontSize: 16 }}>
              {saving ? 'Saving...' : '✅ Save All Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Content;
