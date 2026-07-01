import tokens from '../../styles/tokens'
import Modal from './Modal'

const { colors, radius, typography } = tokens
const t = colors.warm

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText, confirmVariant = 'danger' }) {
  const btnColor = confirmVariant === 'danger' ? t.danger : t.success

  return (
    <Modal open={open} onClose={onClose} maxWidth="420px">
      <Modal.Header title={title} />
      <Modal.Body>
        <div style={s.message}>{message}</div>
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onClose} style={s.btnCancel}>Cancelar</button>
        <button onClick={onConfirm} style={{ ...s.btnConfirm, background: btnColor }}>
          {confirmText}
        </button>
      </Modal.Footer>
    </Modal>
  )
}

const s = {
  message: {
    color: t.textLabel, fontSize: typography.fontSize.lead, lineHeight: '1.5',
  },
  btnCancel: {
    background: t.background, color: t.textLabel, border: 'none',
    borderRadius: radius.md, padding: '11px 24px',
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold, cursor: 'pointer',
  },
  btnConfirm: {
    color: '#fff', border: 'none', borderRadius: radius.md,
    padding: '11px 28px',
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold, cursor: 'pointer',
  },
}
