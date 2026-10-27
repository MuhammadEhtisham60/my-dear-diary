import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      id="confirm-dialog"
      footer={
        <>
          <button className="btn btn-secondary btn-sm" onClick={onClose} id="confirm-cancel-btn">Cancel</button>
          <button
            className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm(); onClose(); }}
            id="confirm-ok-btn"
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {danger && (
          <div style={{
            width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--radius-md)',
            background: 'var(--terra-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={20} color="var(--terra-500)" />
          </div>
        )}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{title}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message}</p>
        </div>
      </div>
    </Modal>
  );
}
