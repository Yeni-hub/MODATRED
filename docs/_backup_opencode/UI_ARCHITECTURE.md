# UI Architecture — ModaTrend Frontend

## 1. Estado actual

El frontend tiene **13 páginas** (`frontend/src/pages/`), un **layout** (`components/layout/`), **2 widgets** (`components/common/`), y **0 componentes UI compartidos**. Todos los elementos visuales (modales, tablas, formularios, badges, etc.) están definidos **inline** dentro de cada página mediante objetos de estilo `const s = {...}`.

Conviven **dos sistemas de diseño** completamente separados:

| Tema | Páginas | Fondo | Acento |
|------|---------|-------|--------|
| **Dark** | Layout, Dashboard | `#0f1117`, `#13151f` | `#6366f1` (púrpura) |
| **Warm** | Login, Productos, Categorias, Colecciones, Variantes, Proveedores, Clientes, Compras, Ventas, Usuarios, Reportes | `#f5ede6`, `#ffffff` | `#c47c5a` (terracota) |

---

## 2. Inventario de componentes visuales

### 2.1 Ya existen como archivos separados

| Componente | Archivo | Props | Usado por |
|-----------|---------|-------|-----------|
| `TopProductosWidget` | `components/common/TopProductosWidget.jsx` | `data, maxItems, styles, rankStyle, onFetch` | Dashboard, Reportes |
| `IngresosColeccionWidget` | `components/common/IngresosColeccionWidget.jsx` | `data, maxItems, styles, onFetch, barColors` | Dashboard, Reportes |
| `api` (service) | `services/api.js` | Axios instance + auth interceptor | Todas excepto Login |
| `AuthProvider` / `useAuth` | `context/authcontext.jsx` | `usuario, token, login, logout` | App root + Layout |

### 2.2 Existen inline (definidos dentro de una página)

| Componente | Página | Líneas | Props | Reutilizable |
|-----------|--------|--------|-------|-------------|
| `MetricCard` | `Dashboard.jsx` | 253–269 | `titulo, valor, sub, color, icono, barWidth` | **Sí** — usado 5 veces en Dashboard, aplica en cualquier página con KPIs |

### 2.3 No existen (deben crearse)

| Componente Propuesto | Patrón duplicado en # páginas | Líneas duplicadas (aprox.) |
|---------------------|-------------------------------|----------------------------|
| **Modal** | **9** (Productos, Categorias, Colecciones, Variantes, Proveedores, Clientes, Compras, Ventas, Usuarios) | ~35 c/u = **315+** |
| **DataTable** | **6** (Productos, Clientes, Variantes, Compras, Ventas, Reportes) | ~25 c/u = **150+** |
| **Toast / Alert** | **5** (Proveedores, Clientes, Compras, Ventas, Usuarios) | ~15 c/u = **75+** |
| **Card** | **4** (Categorias, Colecciones, Proveedores, Usuarios) | ~20 c/u = **80+** |
| **Badge** | **12 badge types** en todas las páginas warm — mismo patrón pill | ~5 c/u = **60+** |
| **Button** | **7 tipos** (btnNuevo, btnEditar, btnEliminar, btnCancelar, btnGuardar, btnCerrar, btnToggle) en 9+ páginas | ~3 c/u = **180+** |
| **Input** | **10** páginas (campo + label + input + textarea) | ~4 c/u = **40+** |
| **Select** | **6** páginas (Productos, Colecciones, Variantes, Ventas, Compras, Usuarios) | ~3 c/u = **18+** |
| **EmptyState** | **12** páginas (mensajes de "sin datos") | ~2 c/u = **24+** |
| **LoadingState** | **12** páginas (cargando...) | ~2 c/u = **24+** |
| **SectionHeader** | **12** páginas (título + subtítulo + botón) | ~5 c/u = **60+** |
| **ConfirmDialog** | **9** páginas (modal de confirmar eliminar/archivar/desactivar) | ~15 c/u = **135+** |
| **FilterBar** | **4** páginas (Productos, Proveedores, Clientes, Reportes) | ~8 c/u = **32+** |

---

## 3. Mapa de duplicación por página

| Página | Modal | Table | Toast | Card Grid | Badges | Form | Empty | Loading | Header |
|--------|-------|-------|-------|-----------|--------|------|-------|---------|--------|
| Login | — | — | — | — | — | Sí | — | — | — |
| Dashboard | — | — | — | — | Sí | — | Sí | Sí | Sí |
| Productos | Sí | Sí | — | — | 3 tipos | Sí | Sí | Sí | Sí |
| Categorias | Sí | — | — | Sí | — | Sí | Sí | Sí | Sí |
| Colecciones | Sí | — | — | Sí | 2 tipos | Sí | Sí | Sí | Sí |
| Variantes | Sí | Sí | — | — | 3 tipos | Sí | Sí | Sí | Sí |
| Proveedores | Sí | — | Sí | Sí | 2 tipos | Sí | Sí | Sí | Sí |
| Clientes | Sí | Sí | Sí | — | 2 tipos | Sí | Sí | Sí | Sí |
| Compras | Sí | Sí | Sí | — | — | Sí | Sí | Sí | Sí |
| Ventas | Sí | Sí | Sí | — | 3 tipos | Sí | Sí | Sí | Sí |
| Usuarios | Sí | — | Sí | Sí | 2 tipos | Sí | Sí | Sí | Sí |
| Reportes | — | 4 tablas | — | — | Sí | — | Sí | Sí | Sí |

---

## 4. Propuesta de estructura `components/ui/`

```
frontend/src/components/ui/
├── Button.jsx
├── Card.jsx
├── Input.jsx
├── Select.jsx
├── Modal.jsx
├── ConfirmDialog.jsx
├── Badge.jsx
├── DataTable.jsx
├── EmptyState.jsx
├── LoadingState.jsx
├── SectionHeader.jsx
├── MetricCard.jsx
├── Toast.jsx
├── FilterBar.jsx
└── index.js
```

### 4.1 Especificación de cada componente

#### Button

```jsx
<Button variant="primary" | "secondary" | "danger" | "ghost" | "success"
        size="sm" | "md" | "lg"
        icon="..."
        onClick={fn}
        disabled
        loading
        theme="warm" | "dark">
  Texto
</Button>
```

**Necesidad:** 7 variantes de botón definidas idénticamente en 9+ páginas. Más de 180 líneas duplicadas.

**Estado actual inline:**
- `btnNuevo` → `background: #c47c5a, color: #fff` → `primary` en warm
- `btnEditar` → `background: #f7e6d8, color: #c47c5a` → `secondary` en warm
- `btnEliminar` → `background: #fef0f0, color: #c45a5a` → `danger` en warm
- `btnCancelar` → `background: #f5ede6, color: #7a5c4a` → `ghost` en warm
- `btnGuardar` → idem btnNuevo
- `btnToggle` (Proveedores/Clientes/Usuarios) → usa `btnEliminar` para desactivar
- `btnRefresh` (Dashboard/Reportes) → estilo único dark/warm
- `btnExportar` (Reportes) → `background: #2d7a3a` → `success`
- `btnFiltrar` (Reportes) → idem btnNuevo

#### Card

```jsx
<Card hoverable opacity={0.6} theme="warm" | "dark">
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

**Necesidad:** 4 páginas (Categorias, Colecciones, Proveedores, Usuarios) con grid auto-fill y estructura de card idéntica (~80 líneas duplicadas). Además Dashboard usa `metricCard` que es una variante de Card.

**Estado actual inline:**
- `card`: `background: #fff, border-radius: 14px, padding: 24px, box-shadow`
- `cardTop` / `cardHeader`: flex row con avatar/icono + nombre
- `cardNombre`: nombre del item
- `cardDesc` / `cardInfo`: descripción o datos
- `cardAcciones`: flex row con botones editar/eliminar
- `opacity: 0.6` para items inactivos/archivados

#### Input

```jsx
<Input label="Nombre"
       value={...}
       onChange={...}
       error="Campo requerido"
       icon="..."
       prefix="$"
       type="text" | "number" | "email" | "date" | "password"
       theme="warm" | "dark" />
```

**Necesidad:** Patrón campo + label + input + icono + validación duplicado en 10 páginas. También existe `<textarea>` como variante.

**Estado actual inline:**
- `campo`: `display: flex, flex-direction: column, gap: 6px`
- `label`: `font-size: 0.9rem, font-weight: 600, color: #7a5c4a`
- `input`: `padding: 11px 14px, border-radius: 10px, border: 1.5px solid #e8d5c4, ...`
- `textarea`: mismo que input + `resize: vertical, min-height: 80px`
- `errorTexto`: `color: #e53e3e, font-size: 0.8rem` (en Clientes)
- `inputBusqueda`: variante de input con padding distinto (3 páginas)

#### Select

```jsx
<Select label="Categoría"
        value={...}
        onChange={...}
        options=[{value, label}]
        placeholder="Seleccionar..."
        theme="warm" | "dark" />
```

**Necesidad:** Select nativo `<select>` duplicado en 6 páginas. Mismos estilos que Input pero aplicados a `<select>`.

**Estado actual inline:** Mismos estilos que `input` pero en etiqueta `<select>`. En algunos casos (Productos) hay `<option value="">Todas las categorías</option>` como placeholder. No hay componente Select compartido (usa `<select style={s.select}>`)

#### Modal

```jsx
<Modal open={isOpen} onClose={fn} title="Título" maxWidth="560px" theme="warm" | "dark">
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost">Cancelar</Button>
    <Button variant="primary">Guardar</Button>
  </Modal.Footer>
</Modal>
```

**Necesidad:** **LA PRIORIDAD MÁS ALTA.** 9 páginas con exactamente la misma estructura de modal (~315 líneas duplicadas). El modal tiene overlay, contenedor centrado, header con título + botón cerrar, body con scroll, footer con botones.

**Estado actual inline:**
- `modalFondo`: `position: fixed, inset: 0, background: rgba(0,0,0,0.5), z-index: 1000, flex center`
- `modal`: `background: #fff, border-radius: 16px, max-width: 560-600px, box-shadow`
- `modalHeader`: `flex, space-between, padding: 24px 28px, border-bottom`
- `modalTitulo`: `font-size: 1.2rem, font-weight: 600, color: #2a1a12`
- `btnCerrar`: `background: none, border: none, font-size: 1.2rem, color: #9e7b65`
- `modalBody`: `padding: 24px 28px, flex column, gap: 16px, overflow-y`
- `modalFooter`: `flex, justify-end, gap: 12px, padding: 20px 28px, border-top`
- 2 páginas usan `maxHeight: 90vh / 92vh` para ventanas grandes

#### ConfirmDialog (especialización de Modal)

```jsx
<ConfirmDialog open={isOpen}
               onConfirm={fn}
               onCancel={fn}
               title="Eliminar producto"
               message={`¿Estás seguro de eliminar "${nombre}"?`}
               confirmText="Eliminar"
               confirmVariant="danger"
               theme="warm" | "dark" />
```

**Necesidad:** 9 páginas tienen un segundo modal de confirmación (eliminar, archivar, desactivar, anular). Misma estructura: texto de advertencia + Cancelar + botón de acción peligrosa en rojo. ~135 líneas duplicadas.

#### Badge

```jsx
<Badge variant="default" | "success" | "danger" | "warning" | "info" | "custom"
       color={...} background={...}
       size="sm" | "md"
       theme="warm" | "dark">
  texto
</Badge>
```

**Necesidad:** 12 tipos de badge diferentes repartidos en todas las páginas. Mismo patrón pill (border-radius: 20px, padding: 3px 10px, font-weight: 600). Las variantes solo cambian color de fondo y texto.

**Estado actual inline:**
- `refBadge` / `idBadge`: `#f7e6d8` bg, `#c47c5a` text — en 5 páginas
- `stockBadge`: condicional rojo (≤5) / verde (>5) — en 3 páginas
- `estadoBadge`: condicional verde (activo) / rojo (inactivo) — en 5 páginas
- `unidBadge`: `#10b98120` bg (Dashboard) o `#f7e6d8` (Reportes)
- `catBadge`: `#1e2030` bg (Dashboard) o `#2a1a12` text (Reportes)
- `rolBadge`, `nitBadge`, `tempBadge`, `tallaBadge`, `metodoBadge`, `docBadge`

#### DataTable

```jsx
<DataTable columns=[{key, label, render?, width?, sortable?}]
           data=[...]
           onRowClick={fn}
           emptyMessage="No hay datos"
           theme="warm" | "dark" />
```

**Necesidad:** 6 páginas con tabla CRUD, más 4 tablas en Reportes. Estructura idéntica: tablaWrap + tabla + thead/tbody + row + cell. Cada página redefine th/tr/td con los mismos estilos. ~150 líneas duplicadas.

**Estado actual inline:**
- `tablaWrap`: `background: #fff, border-radius: 14px, box-shadow`
- `tabla`: `width: 100%, border-collapse: collapse`
- `th`: `padding: 14px 16px, font-size: 0.8rem, color: #9e7b65, border-bottom: 1px solid #f0e6de, background: #fffaf7`
- `tr`: `border-bottom: 0.5px solid #f7f0eb`
- `td`: `padding: 14px 16px, font-size: 0.95rem, color: #2a1a12`

#### EmptyState

```jsx
<EmptyState message="No hay productos registrados" theme="warm" | "dark" />
```

**Necesidad:** 12 páginas con mensajes de "sin datos". Mismo estilo: centrado, color `#9e7b65`, padding 40–60px, font-size ~1rem.

#### LoadingState

```jsx
<LoadingState message="Cargando..." theme="warm" | "dark" />
```

**Necesidad:** 12 páginas. Mismo patrón: centrado, color `#9e7b65`, padding 60px.

#### SectionHeader

```jsx
<SectionHeader title="Productos"
               subtitle="Gestión de productos"
               action={<Button variant="primary">+ Nuevo</Button>}
               theme="warm" | "dark" />
```

**Necesidad:** 12 páginas con patrón idéntico: flex row con título + subtítulo a la izquierda, botón de acción a la derecha.

#### MetricCard

```jsx
<MetricCard title="VENTAS HOY"
            value={42}
            subtitle="ventas del día"
            color="#6366f1"
            icon="🛍"
            barWidth={75}
            theme="dark" | "warm" />
```

**Necesidad:** Ya existe inline en Dashboard.jsx. Se usa 5 veces. Es candidato natural para `components/ui/`. Funciona solo con tema dark actualmente — necesita soporte warm.

#### Toast

```jsx
<Toast message="Guardado exitoso"
       type="success" | "error" | "info" | "warning"
       duration={3000}
       onClose={fn} />
```

**Necesidad:** 5 páginas con implementación idéntica (state + setTimeout + fixed position). 75+ líneas duplicadas. 4 páginas restantes (Productos, Categorias, Colecciones, Variantes) usan `alert()` nativo que debe reemplazarse.

#### FilterBar

```jsx
<FilterBar filters=[{type: "search"|"select"|"checkbox", key, label, options?, ...}]
           values={...}
           onChange={fn}
           theme="warm" | "dark" />
```

**Necesidad:** Patrón de filtros duplicado en 4+ páginas (Productos con 3 filtros, Proveedores con búsqueda, Clientes con búsqueda, Reportes con rango de fechas). Cada uno tiene estructura diferente pero comparten inputs de búsqueda y selects con estilos idénticos.

---

## 5. Tema y diseño del sistema

### 5.1 Diseño actual: tokens inline

Cada página tiene `const s = {...}` con valores hardcodeados. No hay tokens compartidos.

### 5.2 Propuesta: tokens JS centralizados

```js
// frontend/src/styles/tokens.js
export const themes = {
  warm: {
    bg:        '#f5ede6',
    surface:   '#ffffff',
    accent:    '#c47c5a',
    text:      '#2a1a12',
    textMuted: '#9e7b65',
    textLabel: '#7a5c4a',
    border:    '#e8d5c4',
    borderLight: '#f0e6de',
    danger:    '#c45a5a',
    success:   '#2d7a3a',
    shadow:    'rgba(0,0,0,0.06)',
  },
  dark: {
    bg:        '#0f1117',
    surface:   '#13151f',
    accent:    '#6366f1',
    text:      '#f1f5f9',
    textMuted: '#475569',
    textLabel: '#94a3b8',
    border:    '#2d3748',
    borderLight: '#1e2030',
    danger:    '#ef4444',
    success:   '#10b981',
    shadow:    'rgba(0,0,0,0.3)',
  }
}
```

Cada componente aceptaría `theme="warm" | "dark"` y usaría los tokens correspondientes. Esto elimina la necesidad de pasar `styles` como prop (el patrón actual de los widgets).

### 5.3 Transición sugerida

1. **Fase 1** — Crear `components/ui/` con todos los componentes listados (sin modificar páginas aún)
2. **Fase 2** — Migrar el tema warm a usar tokens (9 páginas) — máximo impacto con mínimo riesgo
3. **Fase 3** — Reemplazar modales inline con `<Modal>` y `<ConfirmDialog>` en todas las páginas
4. **Fase 4** — Reemplazar tablas inline con `<DataTable>`
5. **Fase 5** — Reemplazar toast/alertas con `<Toast>`
6. **Fase 6** — Reemplazar cards, badges, inputs, selects, headers, estados
7. **Fase 7** — Migrar tema dark (Dashboard + Layout) a usar los mismos tokens

---

## 6. Resumen de prioridad

| Prioridad | Componente | Impacto (líneas eliminadas) | Páginas afectadas |
|-----------|-----------|----------------------------|-------------------|
| 🔴 **Crítica** | `Modal` + `ConfirmDialog` | ~450 | 9 |
| 🔴 **Crítica** | `DataTable` | ~150 | 6 |
| 🟡 **Alta** | `Toast` | ~75 | 5 |
| 🟡 **Alta** | `Button` | ~180 | 9+ |
| 🟡 **Alta** | `Badge` | ~60 | 12 |
| 🟢 **Media** | `Input` + `Select` | ~60 | 10 |
| 🟢 **Media** | `Card` | ~80 | 4 |
| 🟢 **Media** | `SectionHeader` | ~60 | 12 |
| 🟢 **Media** | `EmptyState` | ~24 | 12 |
| 🟢 **Media** | `LoadingState` | ~24 | 12 |
| 🔵 **Baja** | `MetricCard` | ~20 | 1 (Dashboard) |
| 🔵 **Baja** | `FilterBar` | ~32 | 4 |
| ⚪ **Base** | `tokens.js` (tema) | — | 12+ |

---

## 7. Glosario de términos existentes vs. propuestos

| Término actual (inline) | Término propuesto |
|------------------------|-------------------|
| `s.pagina` | Layout wrapper en cada página |
| `s.header`, `s.titulo`, `s.subtitulo`, `s.btnNuevo` | `<SectionHeader>` |
| `s.modalFondo`, `s.modal`, `s.modalHeader`, `s.modalBody`, `s.modalFooter` | `<Modal>` |
| Confirmación de eliminar/archivar | `<ConfirmDialog>` |
| `s.tablaWrap`, `s.tabla`, `s.th`, `s.tr`, `s.td` | `<DataTable>` |
| `s.alerta` + `mostrarAlerta` + `setTimeout` | `<Toast>` + `useToast` hook |
| `s.card`, `s.cardHeader`, `s.cardNombre`, `s.cardAcciones` | `<Card>` |
| `s.xxBadge` (12 tipos) | `<Badge variant="...">` |
| `s.refBadge`, `s.idBadge`, `s.docBadge` | `<Badge variant="ref">` |
| `s.stockBadge` (condicional) | `<Badge variant={stock <= 5 ? 'danger' : 'success'}>` |
| `s.estadoBadge` (condicional) | `<Badge variant={activo ? 'success' : 'danger'}>` |
| `s.vacio` / `No hay ...` | `<EmptyState>` |
| `s.cargando` / `Cargando...` | `<LoadingState>` |
| `s.campo` + `s.label` + `s.input` + `s.textarea` | `<Input>` + `<Input type="textarea">` |
| `s.select` + `<select>` | `<Select>` |
| `<button style={s.btnNuevo}>+ Nuevo</button>` | `<Button variant="primary">+ Nuevo</Button>` |
| `<button style={s.btnEditar}>Editar</button>` | `<Button variant="secondary">Editar</Button>` |
| `<button style={s.btnEliminar}>Eliminar</button>` | `<Button variant="danger">Eliminar</Button>` |
| `<button style={s.btnCancelar}>Cancelar</button>` | `<Button variant="ghost">Cancelar</Button>` |
| `MetricCard` inline en Dashboard | `<MetricCard>` en `components/ui/` |
| `s.filtros` + filtros inline | `<FilterBar>` |
| `s.prodNombre`, `s.prodRef`, `s.catBadge`, `s.unidBadge`, `s.ingresosVal` | Se eliminan al migrar widgets a usar tokens |
| `s.colItem`, `s.colTop`, `s.colNombre`, `s.colSub`, `s.colVal`, `s.barTrack`, `s.barFill`, `s.colStats` | Se eliminan al migrar widgets a usar tokens |
