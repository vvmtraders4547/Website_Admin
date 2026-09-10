// admin/src/components/Toast/Toast.js
import React, { useState, useCallback } from 'react';

let _addToast = null;

export function toast(message, type = 'success') {
  if (_addToast) _addToast(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  _addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{icons[t.type] || '✅'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
