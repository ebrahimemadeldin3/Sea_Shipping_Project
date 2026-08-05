import { Modal } from './overlay'
import { Button } from './Button'

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Delete', confirmVariant = 'danger', loading = false, danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Confirm action'}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : confirmVariant} onClick={onConfirm} loading={loading} disabled={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description || 'Are you sure you want to continue?'} This action cannot be undone.</p>
    </Modal>
  )
}

export default ConfirmDialog