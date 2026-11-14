import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  isDestructive = true
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-2.5 rounded-full shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-lime/20 text-charcoal'}`}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm text-charcoal-500 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-charcoal-500 hover:text-charcoal hover:bg-surface-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-subtle ${
            isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-charcoal hover:bg-charcoal-800'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
