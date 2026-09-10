// admin/src/hooks/useEscapeKey.js
import { useEffect } from 'react';

/**
 * Custom hook to close popups, modals, forms, and overlays when pressing the ESC key.
 * @param {Function} onClose - Callback function to close the popup
 * @param {boolean} active - Whether the listener should be active (defaults to true)
 */
export function useEscapeKey(onClose, active = true) {
  useEffect(() => {
    if (!active || typeof onClose !== 'function') return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, active]);
}

export default useEscapeKey;
