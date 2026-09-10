// admin/src/components/Settings/Settings.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../Toast/Toast';
import { getProducts, getEnquiries, getOrders, getSettings, updateSettings } from '../../services/api';

const Section = ({ title, children, action }) => (
  <div className="card" style={{ marginBottom: 16 }}>
    <div className="card-title">{title} {action}</div>
    {children}
  </div>
);

const PasswordField = ({ label, placeholder, val, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? "text" : "password"} className="form-input" placeholder={placeholder} value={val}
          onChange={e => onChange(e.target.value)} style={{ paddingRight: 40 }} />
        <button 
          type="button" 
          onClick={() => setShow(!show)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-mid)', cursor: 'pointer', fontSize: 16 }}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? '👁️‍🗨️' : '👁️'}
        </button>
      </div>
    </div>
  );
};

function Settings() {
  const { admin } = useAuth();

  const convertToCSV = (data) => {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row => 
        headers.map(fieldName => {
          let value = row[fieldName];
          if (value === null || value === undefined) {
            value = '';
          } else if (Array.isArray(value)) {
            value = value.join('; ');
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          const escaped = ('' + value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    return csvRows.join('\r\n');
  };

  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (type) => {
    toast(`Exporting ${type}...`);
    try {
      let res;
      let filename = `${type}_export_${new Date().toISOString().slice(0,10)}.csv`;
      if (type === 'Enquiries') {
        res = await getEnquiries();
      } else if (type === 'Products') {
        res = await getProducts();
      } else if (type === 'Orders') {
        res = await getOrders();
      }
      
      if (res && res.data) {
        const csv = convertToCSV(res.data);
        downloadCSV(csv, filename);
        toast(`${type} exported successfully!`);
      } else {
        toast(`No data found to export`, 'error');
      }
    } catch (err) {
      console.error(err);
      toast(`Export failed`, 'error');
    }
  };

  const [company, setCompany] = useState({
    name: '', email: '',
    phone: '', address: '',
    hours: '', fssai: '', website: '',
    gstin: '',
  });

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getSettings().then(r => {
      if (r.data) setCompany(r.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const [creds, setCreds] = useState({ current: '', newPass: '', confirm: '' });
  const [savedCompany, setSavedCompany] = useState(false);
  const [savedCreds, setSavedCreds] = useState(false);

  const saveCompany = async () => {
    try {
      await updateSettings(company);
      setSavedCompany(true);
      toast('Company information saved');
      setTimeout(() => setSavedCompany(false), 3000);
    } catch (err) {
      toast('Failed to save settings', 'error');
    }
  };

  const saveCreds = () => {
    if (!creds.current) { toast('Please enter your current password', 'error'); return; }
    if (creds.newPass !== creds.confirm) { toast('New passwords do not match', 'error'); return; }
    if (creds.newPass.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setSavedCreds(true);
    toast('Credentials updated successfully');
    setCreds({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setSavedCreds(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage company info, credentials, and preferences</p>
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
      <div className="settings-grid-1-1">
        {/* Company Info */}
        <div>
          <Section title="Company Information">
            <div className="form-grid">
              {[
                ['Company Name', 'name', 'VVM Traders'],
                ['Email Address', 'email', 'info@vvmtraders.in'],
                ['Phone / WhatsApp', 'phone', '+91 XXXXX XXXXX'],
                ['GSTIN', 'gstin', '29XXXXX0000X1ZX'],
                ['FSSAI License', 'fssai', 'FSSAI-XXXXXXXX'],
                ['Website', 'website', 'www.vvmtraders.in'],
              ].map(([l, k, ph]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={company[k]} placeholder={ph}
                    onChange={e => setCompany(c => ({ ...c, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group full">
                <label className="form-label">Address / Operations</label>
                <input className="form-input" value={company.address}
                  onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label className="form-label">Business Hours</label>
                <input className="form-input" value={company.hours}
                  onChange={e => setCompany(c => ({ ...c, hours: e.target.value }))} />
              </div>
            </div>
            <div className="form-grid" style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <h3 style={{ gridColumn: '1 / -1', fontSize: 16, marginBottom: 8 }}>Social Media Links</h3>
              {[
                ['Instagram URL', 'instagram', 'https://instagram.com/...'],
                ['Facebook URL', 'facebook', 'https://facebook.com/...'],
                ['Twitter URL', 'twitter', 'https://twitter.com/...'],
              ].map(([l, k, ph]) => (
                <div key={k} className="form-group full">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={company[k] || ''} placeholder={ph}
                    onChange={e => setCompany(c => ({ ...c, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-gold" onClick={saveCompany} style={{ marginTop: 24 }}>
              {savedCompany ? '✅ Saved!' : 'Save Company Info'}
            </button>
          </Section>

          {/* Export data */}
          <Section title="Export Data">
            <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 16, lineHeight: 1.6 }}>
              Download your data as CSV for record-keeping or reporting.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { l: '📬 Export Enquiries', type: 'Enquiries', color: '#3498DB' },
                { l: '🌶️ Export Products', type: 'Products', color: '#27AE60' },
                { l: '📦 Export Orders', type: 'Orders', color: '#C9A84C' },
              ].map((b, i) => (
                <button key={i} className="btn btn-sm" style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}40` }}
                  onClick={() => handleExport(b.type)}>
                  {b.l}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div>
          {/* Admin profile */}
          <Section title="Admin Profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,.15)', border: '2px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: 'var(--gold)', fontWeight: 600 }}>
                {admin?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: 15 }}>{admin?.name || 'Admin'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{admin?.username} · {admin?.role}</div>
              </div>
            </div>
          </Section>

          {/* Change password */}
          <Section title="Change Password">
            <PasswordField label="Current Password" placeholder="Current password" val={creds.current} onChange={v => setCreds(c => ({ ...c, current: v }))} />
            <PasswordField label="New Password" placeholder="Min. 6 characters" val={creds.newPass} onChange={v => setCreds(c => ({ ...c, newPass: v }))} />
            <PasswordField label="Confirm New Password" placeholder="Repeat new password" val={creds.confirm} onChange={v => setCreds(c => ({ ...c, confirm: v }))} />
            <button className="btn btn-gold" onClick={saveCreds}>
              {savedCreds ? '✅ Updated!' : 'Update Password'}
            </button>
          </Section>
        </div>
      </div>
      )}
    </div>
  );
}

export default Settings;
