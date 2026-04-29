'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CustomDialog({ isOpen, title, children, onClose, onConfirm, confirmText = 'Tamam', cancelText = 'İptal', loading = false, showCancel = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{title}</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          {children}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {showCancel && (
            <button 
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
              disabled={loading}
            >
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
