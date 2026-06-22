# ModaTrend Design System

Versión 1.0 — Junio 2026

---

## 1. Paleta oficial

### Tema Warm (oficial)

| Token | Hex | Muestra | Uso |
|-------|:---:|:-------:|:----|
| `primary` | `#c47c5a` | ████ | Botones principales, acentos, enlaces |
| `primaryHover` | `#b56a47` | ████ | Hover de primary |
| `secondary` | `#f7e6d8` | ████ | Botones secundarios, fondos suaves |
| `success` | `#2d7a3a` | ████ | Estados positivos, confirmaciones |
| `warning` | `#f59e0b` | ████ | Advertencias, stock medio |
| `danger` | `#c45a5a` | ████ | Errores, eliminaciones, anulaciones |
| `info` | `#7b9e87` | ████ | Información neutral |
| `background` | `#f5ede6` | ████ | Fondo de páginas |
| `surface` | `#ffffff` | ████ | Tarjetas, paneles, modales |
| `border` | `#e8d5c4` | ████ | Bordes de inputs, separadores |
| `borderLight` | `#f0e6de` | ████ | Bordes suaves, cabeceras de tabla |
| `textPrimary` | `#2a1a12` | ████ | Texto principal |
| `textSecondary` | `#9e7b65` | ████ | Texto secundario, subtítulos |
| `textLabel` | `#7a5c4a` | ████ | Labels de formularios |

### Tema Dark (secundario — Dashboard + Layout)

| Token | Hex | Muestra | Uso |
|-------|:---:|:-------:|:----|
| `primary` | `#6366f1` | ████ | Botones, acentos, active state |
| `primaryHover` | `#5558e6` | ████ | Hover de primary |
| `secondary` | `#1e2030` | ████ | Superficies secundarias |
| `success` | `#10b981` | ████ | Stock badge verde, ventas |
| `warning` | `#f59e0b` | ████ | Rank #1, advertencias |
| `danger` | `#ef4444` | ████ | Alertas críticas, stock bajo |
| `info` | `#8b5cf6` | ████ | Productos activos |
| `background` | `#0f1117` | ████ | Fondo general |
| `surface` | `#13151f` | ████ | Paneles, tarjetas |
| `border` | `#2d3748` | ████ | Bordes, separadores |
| `borderLight` | `#1e2030` | ████ | Bordes suaves |
| `textPrimary` | `#f1f5f9` | ████ | Texto principal |
| `textSecondary` | `#475569` | ████ | Texto secundario |
| `textLabel` | `#94a3b8` | ████ | Labels |

---

## 2. Tipografía

| Nivel | Tamaño | Peso | Uso |
|-------|--------|------|:----|
| `caption` | 10px | 500 | Badges, timestamps, datos menores |
| `small` | 12px | 400 | Texto auxiliar, breadcrumbs |
| `body` | 14px | 400 | Texto base |
| `lead` | 16px | 400 | Párrafos destacados |
| `h3` | 18px | 600 | Subtítulos de sección |
| `h2` | 20px | 600 | Títulos de panel |
| `h1` | 24px | 600 | Títulos de página (Dashboard) |
| `display` | 28px | 700 | KPIs, números grandes |

```js
fontFamily: "'Inter', 'Segoe UI', sans-serif"
```

---

## 3. Espaciados

| Token | Valor | Uso típico |
|-------|:-----:|:-----------|
| `xs` | 4px | Gap entre icono y texto, padding interno de badges |
| `sm` | 8px | Gap entre botones en toolbar, padding de celdas |
| `md` | 16px | Gap entre campos de formulario, padding de cards |
| `lg` | 24px | Padding de paneles, gap entre secciones |
| `xl` | 40px | Padding de página, gap entre bloques grandes |

---

## 4. Radios

| Token | Valor | Uso típico |
|-------|:-----:|:-----------|
| `sm` | 6px | Botones pequeños, inputs de búsqueda |
| `md` | 10px | Botones, inputs, selects (default) |
| `lg` | 16px | Modales, tarjetas grandes |
| `xl` | 20px | Badges, pills, etiquetas de estado |
| `full` | 50% | Avatares, dots de color |

---

## 5. Sombras

| Token | Valor | Uso típico |
|-------|:-----:|:-----------|
| `sm` | `0 2px 12px rgba(0,0,0,0.06)` | Tarjetas, paneles |
| `md` | `0 4px 20px rgba(0,0,0,0.1)` | Toast, dropdowns |
| `lg` | `0 20px 60px rgba(0,0,0,0.2)` | Modales, diálogos |

---

## 6. Transiciones

| Token | Duración | Uso típico |
|-------|:---------|:-----------|
| `fast` | 0.15s | Hover de botones, cambio de color |
| `normal` | 0.3s | Apertura de modales, expansión |
| `slow` | 0.5s | Barras de progreso, gráficos |

---

## 7. Componentes del sistema

### 7.1 Button (`components/ui/Button.jsx`)

| Prop | Valores | Default |
|------|---------|---------|
| `variant` | `primary`, `secondary`, `success`, `danger`, `outline`, `ghost` | `primary` |
| `theme` | `warm`, `dark` | `warm` |
| `size` | `sm`, `md`, `lg` | `md` |
| `disabled` | `true`, `false` | `false` |
| `loading` | `true`, `false` | `false` |
| `icon` | string (emoji/icono) | — |
| `type` | `button`, `submit` | `button` |
| `style` | CSS object | — |

**Mapa de colores por variante (warm):**

| Variante | Fondo | Texto | Borde |
|----------|:-----:|:-----:|:-----:|
| primary | `#c47c5a` | `#ffffff` | none |
| secondary | `#f7e6d8` | `#c47c5a` | none |
| success | `#2d7a3a` | `#ffffff` | none |
| danger | `#fef0f0` | `#c45a5a` | none |
| outline | transparent | `#c47c5a` | `1.5px solid #e8d5c4` |
| ghost | `#f5ede6` | `#7a5c4a` | none |

**Mapa de colores por variante (dark):**

| Variante | Fondo | Texto | Borde |
|----------|:-----:|:-----:|:-----:|
| primary | `#6366f1` | `#ffffff` | none |
| secondary | `#1e2030` | `#94a3b8` | `1px solid #2d3748` |
| success | `#10b981` | `#ffffff` | none |
| danger | `#ef4444` | `#ffffff` | none |
| outline | transparent | `#94a3b8` | `1px solid #2d3748` |
| ghost | `#1e2030` | `#94a3b8` | `1px solid #2d3748` |

**Tamaños:**

| Size | Padding | FontSize | Radius |
|------|:-------:|:--------:|:------:|
| sm | `5px 14px` | 11px | 6px |
| md | `11px 24px` | 14px | 10px |
| lg | `12px 28px` | 16px | 10px |

**Estados:**
- `disabled`: opacity 0.5, cursor not-allowed
- `loading`: muestra spinner animado + texto, onClick no ejecuta
- `loading` + `disabled`: ambas aplicadas

---

### 7.2 Modal (`components/ui/Modal.jsx`)

| Subcomponente | Propósito |
|---------------|-----------|
| `<Modal.Header title="..." />` | Título + botón cerrar (✕) |
| `<Modal.Body>` | Contenido del formulario |
| `<Modal.Footer>` | Botones de acción |

**Propiedades:**
| Prop | Default |
|------|---------|
| `open` | `false` |
| `onClose` | requerida |
| `maxWidth` | `'560px'` |

**Estructura visual:**
- Overlay: `rgba(0,0,0,0.5)`, z-index 1000, flex center
- Container: `#ffffff`, border-radius 16px, shadow lg
- Header: 24px/28px padding, border-bottom borderLight
- Body: 24px/28px padding, flex column gap 16px
- Footer: 20px/28px padding, border-top borderLight, flex justify-end

**Comportamiento:**
- Click en overlay → cierra modal
- Click en container → detiene propagación (no cierra)
- Botón ✕ en Header → cierra modal

---

### 7.3 ConfirmDialog (`components/ui/ConfirmDialog.jsx`)

| Prop | Default | Descripción |
|------|---------|-------------|
| `title` | requerido | Título del diálogo |
| `message` | requerido | Mensaje (string o JSX) |
| `confirmText` | requerido | Texto del botón de confirmación |
| `confirmVariant` | `'danger'` | `'danger'` → bg `#c45a5a`, otro → bg `#c47c5a` |
| `onConfirm` | requerido | Callback al confirmar |
| `onClose` | requerido | Callback al cancelar/cerrar |
| `open` | `false` | Visibilidad |

**Estructura:** Usa `<Modal>` internamente con `maxWidth="420px"`.

---

### 7.4 Card (pendiente de implementar)

**Patrón existente en 4 páginas (Categorias, Colecciones, Proveedores, Usuarios):**

```
┌─────────────────────────────┐
│ [icon/avatar]  [badges]     │  cardTop / cardHeader
├─────────────────────────────┤
│ Nombre del recurso          │  cardNombre
│ Descripción / info          │  cardDesc / cardInfo
├─────────────────────────────┤
│ [✏️ Editar]  [🗑️ Eliminar]  │  cardAcciones
└─────────────────────────────┘
```

| Elemento | Estilo |
|----------|--------|
| Card container | `background: #fff`, `border-radius: 14px`, `padding: 24px`, `box-shadow: sm` |
| Nombre | `fontSize: 1.1rem`, `fontWeight: 600`, `color: textPrimary` |
| Descripción | `fontSize: 0.9rem`, `color: textSecondary` |
| Opacidad (inactivo) | `0.6` |

---

### 7.5 Badge (pendiente de implementar)

**Patrón existente en 12 variantes en todas las páginas:**

| Tipo | Fondo | Texto | Uso |
|:----|:-----:|:-----:|:----|
| `neutral` | `#f7e6d8` (secondary) | `#c47c5a` (primary) | Referencias, IDs, NITs, documentos |
| `success` | `#e6f4ea` | `#2d7a3a` | Stock alto, activo, confirmada |
| `danger` | `#fef0f0` | `#c45a5a` | Stock ≤ 5, inactivo, anulada |
| `warning` | `#fff3e0` | `#e65100` | Sin movimiento, pendiente |
| `info` | `#f0e6de` | `#7a5c4a` | Tallas, estados neutros |

**Estructura común:** `border-radius: 20px`, `padding: 3px 10px`, `font-size: 0.85rem`, `font-weight: 600`.

---

### 7.6 Input (pendiente de implementar)

**Patrón existente en 10 páginas:**

```
┌─────────────────────────┐
│ Label *                 │  fontSize: 0.9rem, fontWeight: 600, color: textLabel
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Input / Textarea    │ │  padding: 11px 14px, border-radius: 10px
│ └─────────────────────┘ │  border: 1.5px solid #e8d5c4
└─────────────────────────┘  background: #fffaf7, font-size: 0.95rem
```

**Variante textarea:** misma apariencia + `resize: vertical`, `font-family: inherit`.

---

### 7.7 Table (pendiente de implementar)

**Patrón existente en 6 páginas + 4 tablas en Reportes:**

| Elemento | Estilo |
|----------|--------|
| Wrapper | `background: #fff`, `border-radius: 14px`, `box-shadow: sm` |
| Header row | `background: #fffaf7`, `border-bottom: 1px solid borderLight` |
| Header cell | `padding: 14px 16px`, `font-size: 0.8rem`, `color: textSecondary`, `font-weight: 600` |
| Body row | `border-bottom: 0.5px solid #f7f0eb` |
| Body cell | `padding: 14px 16px`, `font-size: 0.95rem`, `color: textPrimary` |

---

## 8. Duplicaciones que podrán eliminarse en fases futuras

| Componente | Páginas afectadas | Líneas duplicadas | Fase estimada |
|-----------|:-----------------:|:------------------:|:-------------:|
| **Modal + ConfirmDialog** | 9 (ya migradas 2: Categorias, Colecciones) | ~315 | ✅ FASE 1 (parcial) |
| **Button** | 9 (ya migrado 1: Dashboard) | ~180 | ✅ FASE 2 (parcial) |
| **Badge** | 12 tipos en 12 páginas | ~60 | FASE 4 |
| **Input + Select** | 10 páginas | ~60 | FASE 5+ |
| **Card** | 4 páginas (Categorias, Colecciones, Proveedores, Usuarios) | ~80 | FASE 5+ |
| **Table** | 6 páginas + 4 en Reportes | ~150 | FASE 5+ |
| **EmptyState + LoadingState** | 12 páginas | ~48 | FASE 5+ |
| **SectionHeader** | 12 páginas | ~60 | FASE 5+ |
| **Toast/Alert** | 5 páginas (+4 que usan `alert()`) | ~75 | FASE 5+ |
| **Tokens de color** (valores hardcodeados en `const s = {...}`) | 13 páginas | ~200 | FASE 6 |
