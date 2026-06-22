# PROJECT CONTEXT — MODATREND

**Última actualización:** 21/06/2026 (FASE 3 UI Refactor — Design System + tokens)
**Estado:** ✅ 100% requisitos cumplidos (24/24)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 (JSX) |
| Routing | React Router DOM 7 |
| HTTP | Axios |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs |
| Validación | express-validator |
| BD | MySQL/MariaDB via mysql2 |
| UI | Estilos inline (objeto `s`) |

---

## Estructura del proyecto

```
modatrend/
├── backend/src/
│   ├── index.js
│   ├── config/
│   │   ├── db.js
│   │   └── seed.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── productos.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── productos.routes.js
│   │   ├── categorias.routes.js       ✅ CRUD completo
│   │   ├── colecciones.routes.js
│   │   ├── variantes.routes.js
│   │   ├── proveedores.routes.js
│   │   ├── clientes.routes.js
│   │   ├── compras.routes.js
│   │   ├── ventas.routes.js
│   │   ├── reportes.routes.js         ✅ 14 endpoints
│   │   └── usuarios.routes.js
│   └── validators/
│       └── auth.validator.js
├── frontend/src/
│   ├── main.jsx
│   ├── App.jsx                        ✅ Rutas protegidas
│   ├── styles/tokens.js               ✅ FASE 3: Sistema de diseño oficial (warm + dark)
│   ├── context/AuthContext.jsx
│   ├── services/api.js                ✅ Cliente axios compartido con auth interceptor
│   ├── components/
│   │   ├── layout/Layout.jsx          ✅ Redirección si no hay token
│   │   ├── common/
│   │   │   ├── TopProductosWidget.jsx ✅ Widget reutilizable top productos
│   │   │   └── IngresosColeccionWidget.jsx  ✅ Widget reutilizable ingresos colección
│   │   └── ui/
│   │       ├── Modal.jsx              ✅ FASE 1: Modal compartido (warm theme)
│   │       ├── ConfirmDialog.jsx      ✅ FASE 1: Diálogo de confirmación
│   │       └── Button.jsx             ✅ FASE 2: 6 variantes + 2 temas + 3 tamaños
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Productos.jsx
│       ├── Categorias.jsx             ✅ Migrado a Modal + ConfirmDialog
│       ├── Variantes.jsx
│       ├── Colecciones.jsx            ✅ Migrado a Modal + ConfirmDialog
│       ├── Proveedores.jsx
│       ├── Clientes.jsx
│       ├── Compras.jsx
│       ├── Ventas.jsx
│       ├── Reportes.jsx               ✅ Reportes completos
│       └── Usuarios.jsx
└── *.md (documentación)
```

---

## Estado de requisitos

| Categoría | Cumplimiento |
|-----------|:-----------:|
| Funcionales (RF-01 a RF-16) | **100%** (16/16) |
| Reglas de negocio (RN-01 a RN-05) | **100%** (5/5) |
| Seguridad (S-01 a S-03) | **100%** (3/3) |
| **TOTAL** | **100% (24/24)** |

---

## Lo implementado hoy (21/06/2026)

### S-03: Protección de rutas en frontend
- `Layout.jsx` ahora verifica `token` con `useEffect` y redirige a `/login` si no hay sesión activa.

### RF-07: CRUD Categorías completo
- Backend: POST, PUT, DELETE en `categorias.routes.js` con validación de productos asociados antes de eliminar.
- Frontend: Nueva página `Categorias.jsx` con listado en cards, modal de creación/edición y confirmación de eliminación.
- Ruta `/categorias` agregada en `App.jsx`.
- Menú "Categorías" agregado en Layout.jsx bajo sección PRINCIPAL.

### RF-12: Reportes completos
- Backend: 13 endpoints en `reportes.routes.js` (5 legacy + 1 expandido + 7 nuevos).
- Frontend: `Reportes.jsx` actualizado con filtro de fechas, tabla de ventas por período, reportes por vendedor/cliente, productos sin movimiento y botón de exportación CSV.

### Dashboard v2 — 7 nuevos endpoints backend (21/06/2026)

| Endpoint | Descripción | Para sección |
|----------|------------|:------------:|
| `GET /api/reportes/dashboard` | Expandido: ventasHoy, ingresosHoy, ingresosMes, clientesNuevos, productosActivos, stockBajo, alertasActivas | KPIs |
| `GET /api/reportes/ventas-recientes?limite=N` | Últimas N ventas con cliente, monto, estado, vendedor | Actividad reciente |
| `GET /api/reportes/tendencia-mensual?dias=7|30|90` | Ingresos diarios agrupados por día (7, 30 o 90 días). Compatible con `?meses=N` legacy. | Gráfico tendencia |
| `GET /api/reportes/resumen-inventario` | Total productos, valor inventario, % stock bajo, % sin movimiento | Inventario |
| `GET /api/reportes/alertas-stock` | Variantes con stock ≤ 3 (crítico) y entre 4-5 (bajo) con detalle | Alertas |
| `GET /api/reportes/colecciones-activas` | Colecciones activas con conteo de productos y stock total | Colecciones |
| `GET /api/reportes/actividad-reciente?limite=N` | Feed unificado: ventas, anulaciones, compras, nuevos clientes | Actividad reciente |

### Dashboard v2 — Frontend implementado

| Sección | Estado | Archivo |
|---------|:------:|---------|
| **KPIs** (5 cards) | ✅ | `Dashboard.jsx` |
| **Tendencia de ventas** (gráfico de barras 7d/30d/90d) | ✅ | `Dashboard.jsx` |
| **Productos más vendidos** (vía TopProductosWidget) | ✅ | `Dashboard.jsx` + `components/common/TopProductosWidget.jsx` |
| **Ingresos por colección** (vía IngresosColeccionWidget) | ✅ | `Dashboard.jsx` + `components/common/IngresosColeccionWidget.jsx` |
| **Alertas de inventario** (crítico, bajo, agotadas, colecciones archivadas) | ✅ | `Dashboard.jsx` |
| Actividad reciente | Pendiente | — |
| Resumen inventario | Pendiente | — |

### UI Architecture — FASE 1 (Modal + ConfirmDialog)

**Objetivo:** Eliminar duplicación de modales en 9 páginas.

**Creado:**
- `components/ui/Modal.jsx` — Modal genérico con Header/Body/Footer compuestos (Context API para `onClose`). Estilo warm theme.
- `components/ui/ConfirmDialog.jsx` — Especialización de Modal para confirmaciones (acepta `title`, `message`, `confirmText`, `confirmVariant`).

**Migrado:**
| Página | Modal inline eliminado | ConfirmDialog inline eliminado | Líneas eliminadas |
|--------|:---------------------:|:------------------------------:|:-----------------:|
| `Categorias.jsx` | ✅ | ✅ | **−7** (estilos modal) |
| `Colecciones.jsx` | ✅ | ✅ | **−7** (estilos modal) |

### UI Architecture — FASE 2 (Button)

**Objetivo:** Centralizar botones en componente compartido.

**Creado:**
- `components/ui/Button.jsx` — 6 variantes (`primary`, `secondary`, `success`, `danger`, `outline`, `ghost`), 2 temas (`warm`, `dark`), 3 tamaños (`sm`, `md`, `lg`). Props: `variant`, `size`, `theme`, `disabled`, `loading`, `icon`, `onClick`, `type`, `style`.

**Migrado:**
| Página | Botones inline reemplazados | Estilos eliminados |
|--------|:--------------------------:|:------------------:|
| `Dashboard.jsx` | `btnRefresh` + 3 `trendBtn` (filtros 7d/30d/90d) | `btnRefresh`, `trendBtn` (−2 estilos) |

### UI Architecture — FASE 3 (Design System)

**Objetivo:** Crear infraestructura visual centralizada (sin migrar páginas aún).

**Creado:**
- `styles/tokens.js` — 106 tokens organizados en:
  - `colors` (warm theme oficial + dark theme secundario) — 15 tokens cada uno
  - `typography` — fontFamily + 8 fontSize + 4 fontWeight
  - `spacing` — 5 niveles (xs a xl)
  - `radius` — 5 niveles (sm a full)
  - `shadows` — 3 niveles (sm a lg)
  - `transitions` — 3 duraciones (fast a slow)
- `DESIGN_SYSTEM.md` — Documentación completa del sistema de diseño:
  - Paleta oficial con tabla de tokens
  - Especificación de todos los componentes (Button, Modal, ConfirmDialog, Card, Badge, Input, Table)
  - Mapa de duplicaciones pendientes por fase futura

**Duplicaciones identificadas para fases futuras:**
| Componente | Págs. | Líneas | Fase |
|-----------|:-----:|:------:|:----:|
| Badge | 12 | ~60 | FASE 4 |
| Card | 4 | ~80 | FASE 5+ |
| Input + Select | 10 | ~60 | FASE 5+ |
| DataTable | 6+ | ~150 | FASE 5+ |
| EmptyState + LoadingState | 12 | ~48 | FASE 5+ |
| SectionHeader | 12 | ~60 | FASE 5+ |
| Toast | 5 | ~75 | FASE 5+ |
| Tokens de color inline | 13 | ~200 | FASE 6 |

**Siguiente:** FASE 4 (Badge), FASE 5 (Login redesign plan).

**Documentación completa:** `UI_ARCHITECTURE.md`

---

## Cómo ejecutar

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run dev
```

Backend: http://localhost:4000
Frontend: http://localhost:5173
