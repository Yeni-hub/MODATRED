import { useState, useEffect } from 'react'
import api from '../services/api'
import tokens from '../styles/tokens'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const { colors, spacing, radius, typography, shadows, transitions } = tokens
const t = colors.warm
const a = colors.accent

const safeArray = (data) => Array.isArray(data) ? data.filter(x => x != null) : []

const TIPOS_DOC = ['CC', 'CE', 'NIT', 'PAS']

const validarForm = (form) => {
  const errores = {}
  if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio'
  if (!form.documento.trim()) errores.documento = 'El documento es obligatorio'
  if (!/^\d+$/.test(form.documento)) errores.documento = 'El documento solo debe contener números'
  if (form.telefono && !/^\d+$/.test(form.telefono)) errores.telefono = 'El teléfono solo debe contener números'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'El correo no es válido (debe contener @)'
  return errores
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [modalSaldo, setModalSaldo] = useState(false)
  const [clienteSaldo, setClienteSaldo] = useState(null)
  const [montoSaldo, setMontoSaldo] = useState('')
  const [editando, setEditando] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [errores, setErrores] = useState({})
  const [alerta, setAlerta] = useState({ visible: false, mensaje: '', tipo: 'exito' })
  const [form, setForm] = useState({
    nombre: '', documento: '', tipo_doc: 'CC', telefono: '', email: '', preferencias: ''
  })

  const mostrarAlerta = (mensaje, tipo = 'exito') => {
    setAlerta({ visible: true, mensaje, tipo })
    setTimeout(() => setAlerta({ visible: false, mensaje: '', tipo: 'exito' }), 3000)
  }

  const cargar = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/clientes')
      setClientes(safeArray(data))
    } catch (err) { console.error(err) } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    setErrores({})
    setForm({ nombre: '', documento: '', tipo_doc: 'CC', telefono: '', email: '', preferencias: '' })
    setModal(true)
  }

  const abrirEditar = (c) => {
    setEditando(c)
    setErrores({})
    setForm({
      nombre: c.nombre,
      documento: c.documento,
      tipo_doc: c.tipo_doc,
      telefono: c.telefono || '',
      email: c.email || '',
      preferencias: c.preferencias || '',
    })
    setModal(true)
  }

  const handleChange = (campo, valor) => {
    setForm({ ...form, [campo]: valor })
    if (errores[campo]) setErrores({ ...errores, [campo]: '' })
  }

  const soloNumeros = (campo, valor) => {
    if (/^\d*$/.test(valor)) handleChange(campo, valor)
  }

  const guardar = async () => {
    const errs = validarForm(form)
    if (Object.keys(errs).length > 0) {
      setErrores(errs)
      mostrarAlerta('Corrige los errores antes de guardar', 'error')
      return
    }
    try {
      if (editando) {
        await api.put(`/clientes/${editando.id_cliente}`, form)
        mostrarAlerta('Cliente actualizado exitosamente')
      } else {
        await api.post('/clientes', form)
        mostrarAlerta('Cliente creado exitosamente')
      }
      setModal(false)
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al guardar cliente', 'error')
    }
  }

  const agregarSaldo = async () => {
    if (!montoSaldo || Number(montoSaldo) <= 0) {
      mostrarAlerta('Ingresa un monto válido mayor a 0', 'error')
      return
    }
    try {
      await api.post('/ventas/saldo-favor',
        { id_cliente: clienteSaldo.id_cliente, monto: Number(montoSaldo) }
      )
      mostrarAlerta(`✅ Saldo de $${Number(montoSaldo).toLocaleString('es-CO')} agregado a ${clienteSaldo.nombre}`)
      setModalSaldo(false)
      setMontoSaldo('')
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta(err.response?.data?.error || 'Error al agregar saldo', 'error')
    }
  }

  const toggleActivo = async (c) => {
    try {
      const nuevoEstado = c.activo === 1 ? 0 : 1
      await api.put(`/clientes/${c.id_cliente}`, { ...c, activo: nuevoEstado })
      mostrarAlerta(nuevoEstado === 1 ? '✅ Cliente reactivado' : '📁 Cliente archivado')
      setConfirmDelete(null)
      cargar()
    } catch (err) {
      console.error(err)
      mostrarAlerta('Error al cambiar estado del cliente', 'error')
    }
  }

  const filtrados = safeArray(clientes).filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.documento.includes(busqueda)
  )

  return (
    <div style={s.pagina}>
      {alerta.visible && (
        <div style={{
          ...s.alerta,
          background: alerta.tipo === 'exito' ? a.mintBg : '#FDF2F5',
          borderColor: alerta.tipo === 'exito' ? a.mint : a.rose,
          color: alerta.tipo === 'exito' ? t.success : t.danger,
        }}>
          {alerta.tipo === 'exito' ? '✅' : '❌'} {alerta.mensaje}
        </div>
      )}

      <SectionHeader
        title="Clientes"
        subtitle="Gestiona los clientes de ModaTrend"
        action={<Button onClick={abrirNuevo} icon="+">Nuevo cliente</Button>}
        theme="warm"
      />

      <div style={s.filtros}>
        <input
          placeholder="🔍 Buscar por nombre o documento..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={s.inputSearch}
        />
      </div>

      {cargando ? (
        <div style={s.emptyState}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={s.emptyState}>No hay clientes registrados</div>
      ) : (
        <div style={s.tablaWrap}>
          <table style={s.tabla}>
            <thead>
              <tr>
                {['Nombre', 'Documento', 'Teléfono', 'Email', 'Preferencias', 'Saldo favor', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeArray(filtrados).map(c => (
                <tr key={c.id_cliente} style={{ ...s.tr, opacity: c.activo === 0 ? 0.6 : 1 }}>
                  <td style={s.td}>
                    <span style={s.clienteNombre}>{c.nombre}</span>
                  </td>
                  <td style={s.td}>
                    <Badge theme="warm" variant="neutral" size="sm">{c.tipo_doc}</Badge>
                    <span style={{ marginLeft: spacing.xs }}>{c.documento}</span>
                  </td>
                  <td style={s.td}>{c.telefono || '—'}</td>
                  <td style={s.td}>{c.email || '—'}</td>
                  <td style={s.td}>
                    <span style={s.prefText}>{c.preferencias || '—'}</span>
                  </td>
                  <td style={s.td}>
                    {Number(c.saldo_favor) > 0
                      ? <span style={{ color: t.success, fontWeight: typography.fontWeight.semibold }}>
                          ${Number(c.saldo_favor).toLocaleString('es-CO')}
                        </span>
                      : <span style={{ color: t.textSecondary }}>—</span>
                    }
                  </td>
                  <td style={s.td}>
                    <Badge theme="warm" variant={c.activo === 1 ? 'success' : 'danger'} size="sm">
                      {c.activo === 1 ? '● Activo' : '● Inactivo'}
                    </Badge>
                  </td>
                  <td style={s.td}>
                    <div style={s.acciones}>
                      <Button size="sm" variant="secondary" onClick={() => abrirEditar(c)}>✏️</Button>
                      <Button size="sm" variant="ghost"
                        onClick={() => { setClienteSaldo(c); setMontoSaldo(''); setModalSaldo(true) }}>
                        🎁
                      </Button>
                      <Button size="sm" variant={c.activo === 1 ? 'ghost' : 'success'}
                        onClick={() => setConfirmDelete(c)}>
                        {c.activo === 1 ? '📁' : '♻️'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}>
        <Modal.Header title={editando ? 'Editar cliente' : 'Nuevo cliente'} />
        <Modal.Body>
          <div style={s.formGroup}>
            <label style={s.label}>Nombre completo *</label>
            <input
              style={{ ...s.input, borderColor: errores.nombre ? t.danger : t.border }}
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              placeholder="Nombre completo del cliente" />
            {errores.nombre && <span style={s.errorText}>⚠ {errores.nombre}</span>}
          </div>

          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Tipo documento *</label>
              <select style={s.input} value={form.tipo_doc}
                onChange={e => handleChange('tipo_doc', e.target.value)}>
                {TIPOS_DOC.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Número documento * (solo números)</label>
              <input
                style={{ ...s.input, borderColor: errores.documento ? t.danger : t.border }}
                value={form.documento}
                onChange={e => soloNumeros('documento', e.target.value)}
                placeholder="Ej: 52456789"
                inputMode="numeric" />
              {errores.documento && <span style={s.errorText}>⚠ {errores.documento}</span>}
            </div>
          </div>

          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Teléfono (solo números)</label>
              <input
                style={{ ...s.input, borderColor: errores.telefono ? t.danger : t.border }}
                value={form.telefono}
                onChange={e => soloNumeros('telefono', e.target.value)}
                placeholder="Ej: 3156789012"
                inputMode="numeric" />
              {errores.telefono && <span style={s.errorText}>⚠ {errores.telefono}</span>}
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Email (debe contener @)</label>
              <input
                style={{ ...s.input, borderColor: errores.email ? t.danger : t.border }}
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="correo@email.com" />
              {errores.email && <span style={s.errorText}>⚠ {errores.email}</span>}
            </div>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Preferencias</label>
            <textarea style={s.textarea} value={form.preferencias}
              onChange={e => handleChange('preferencias', e.target.value)}
              placeholder="Ej: Talla M, colores pasteles, ropa casual..." rows={3} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button theme="warm" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
          <Button theme="warm" variant="primary" onClick={guardar}>
            {editando ? '✓ Actualizar' : '✓ Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal open={modalSaldo} onClose={() => setModalSaldo(false)} maxWidth="420px">
        <Modal.Header title="🎁 Agregar saldo a favor" />
        <Modal.Body>
          <p style={{ color: t.textLabel, fontSize: typography.fontSize.lead }}>
            Cliente: <strong style={{ color: t.textPrimary }}>{clienteSaldo?.nombre}</strong>
          </p>
          <p style={{ color: t.textLabel, fontSize: typography.fontSize.lead }}>
            Saldo actual: <strong style={{ color: t.success }}>
              ${Number(clienteSaldo?.saldo_favor || 0).toLocaleString('es-CO')}
            </strong>
          </p>
          <div style={s.formGroup}>
            <label style={s.label}>Monto a agregar *</label>
            <input style={s.input} type="number" min="1"
              value={montoSaldo}
              onChange={e => setMontoSaldo(e.target.value)}
              placeholder="Ej: 50000" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button theme="warm" variant="ghost" onClick={() => setModalSaldo(false)}>Cancelar</Button>
          <Button theme="warm" variant="primary" onClick={agregarSaldo}>✓ Agregar saldo</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => toggleActivo(confirmDelete)}
        title={confirmDelete?.activo === 1 ? '📁 ¿Archivar cliente?' : '♻️ ¿Reactivar cliente?'}
        message={
          confirmDelete?.activo === 1
            ? <>¿Deseas archivar a <strong>{confirmDelete?.nombre}</strong>? Quedará inactivo.</>
            : <>¿Deseas reactivar a <strong>{confirmDelete?.nombre}</strong>? Volverá a estar disponible.</>
        }
        confirmText={confirmDelete?.activo === 1 ? '📁 Sí, archivar' : '♻️ Sí, reactivar'}
      />
    </div>
  )
}

const s = {
  pagina: {
    display: 'flex', flexDirection: 'column', gap: spacing.lg,
    height: '100%', position: 'relative',
  },
  alerta: {
    position: 'fixed', top: spacing.lg, right: spacing.lg,
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: radius.md,
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold,
    zIndex: 2000, border: '1px solid',
    boxShadow: shadows.md,
  },
  emptyState: {
    textAlign: 'center', padding: spacing.xl, color: t.textSecondary,
    fontSize: typography.fontSize.lead,
  },
  filtros: { marginBottom: spacing.xs },
  inputSearch: {
    width: '100%', maxWidth: '400px',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    background: t.surface, outline: 'none', color: t.textPrimary,
    transition: `border-color ${transitions.fast}`,
  },
  tablaWrap: {
    background: t.surface, borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: shadows.sm,
  },
  tabla: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: `${spacing.sm} ${spacing.md}`,
    textAlign: 'left',
    fontSize: typography.fontSize.small,
    color: '#fff',
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${t.borderLight}`,
    background: '#F78DA7',
  },
  tr: { borderBottom: `1px solid ${t.borderLight}` },
  td: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.lead,
    color: t.textPrimary,
  },
  clienteNombre: { fontWeight: typography.fontWeight.semibold },
  prefText: {
    fontSize: typography.fontSize.body,
    color: t.textSecondary, fontStyle: 'italic',
  },
  acciones: { display: 'flex', gap: spacing.xs },
  formRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md,
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.lead,
    fontWeight: typography.fontWeight.semibold,
    color: t.textLabel,
  },
  input: {
    padding: '14px 16px',
    borderRadius: radius.md,
    border: '1.5px solid',
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    boxSizing: 'border-box', width: '100%',
    transition: `border-color ${transitions.fast}`,
  },
  textarea: {
    padding: '14px 16px',
    borderRadius: radius.md,
    border: `1.5px solid ${t.border}`,
    fontSize: typography.fontSize.lead,
    outline: 'none', color: t.textPrimary,
    background: t.surface,
    resize: 'vertical', fontFamily: typography.fontFamily,
    width: '100%', boxSizing: 'border-box',
    transition: `border-color ${transitions.fast}`,
  },
  errorText: {
    fontSize: typography.fontSize.small,
    color: t.danger, marginTop: '2px',
  },
}
