import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, size = '', id }) {
  if (!isOpen) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size ? `modal-${size}` : ''}`} id={id}>
        {title && (
          <div className="modal-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
            <button className="btn btn-ghost btn-icon btn-icon-sm" onClick={onClose} id={`${id}-close`}>
              <X size={16} />
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
