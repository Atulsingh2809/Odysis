import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export function ConfirmDialog({
  isOpen,
  open,
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmDialogProps) {
  const visible = isOpen ?? open ?? false;
  const bodyText = message ?? description ?? '';
  const btnLabel = confirmText ?? confirmLabel ?? 'Confirm';
  const handleClose = onCancel ?? onClose ?? (() => {});

  return (
    <Modal isOpen={visible} title={title} onClose={handleClose}>
      <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">{bodyText}</p>
      <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="outline" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>
          {btnLabel}
        </Button>
      </div>
    </Modal>
  );
}
