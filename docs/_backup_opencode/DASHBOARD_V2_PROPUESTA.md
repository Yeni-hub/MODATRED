# DASHBOARD V2 — Propuesta de rediseño

**Basado en:** `Dashboard.jsx` actual (231 líneas, 3 APIs, 0 librerías de gráficos)
**Objetivo:** Panel de control enfocado en Ventas, Inventario, Clientes, Colecciones y Alertas.
**Theme:** Mantener dark actual (`#0f1117`, `#13151f`, `#1e2030`) o migrar a beige como Reportes.

---

## Endpoints nuevos necesarios

Además de los 8 existentes en `reportes.routes.js`, se requieren estos nuevos endpoints para el Dashboard v2:

| Endpoint | Datos que retorna | Para qué sección |
|----------|-------------------|------------------|
| `GET /api/reportes/ventas-recientes?limite=8` | Últimas N ventas con cliente, monto, estado, vendedor | Actividad reciente |
| `GET /api/reportes/tendencia-mensual?meses=6` | Ingresos agrupados por mes (últimos 6 meses) | Gráfico de tendencia |
| `GET /api/reportes/resumen-inventario` | Total productos activos, valor inventario, % stock bajo, % sin movimiento | KPIs inventario + alertas |
| `GET /api/reportes/alertas-stock` | Variantes con stock ≤ umbral, con producto/talla/color/stock | Alertas de inventario |
| `GET /api/reportes/colecciones-activas` | Colecciones activas con count de productos y ventas del período | Colecciones |
| `GET /api/reportes/resumen-clientes` | Clientes nuevos (este mes), total activos, top 3 por gasto | KPIs clientes |
| `GET /api/reportes/actividad-reciente` | Eventos: ventas creadas, anulaciones, compras, nuevos clientes (timestamp) | Feed de actividad |

**Nota:** El endpoint `/dashboard` actual se debe expandir para incluir más métricas en una sola llamada y reducir peticiones.

---

## Estructura propuesta del Layout

```
┌──────────────────────────────────────────────────────────┐
│  Header: "Dashboard" + selector de período (Hoy/Sem/Mes) │
├──────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ Ventas│ │Ingr. │ │Stock │ │Client│ │Alert.│  ← KPIs  │
│  │ del día│ │mensual│ │bajo  │ │nuevos│ │activas│         │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
├────────────────────────────────┬─────────────────────────┤
│  📈 Tendencia mensual          │  🏆 Top productos        │
│  (gráfico de líneas — 6 meses)  │  (tabla top 5)          │
│                                │                         │
├────────────────────────────────┼─────────────────────────┤
│  📊 Ingresos por colección     │  👥 Top clientes         │
│  (barras horizontales)          │  (tabla top 5)          │
│                                │                         │
├────────────────────────────────┴─────────────────────────┤
│  ⚠️ Alertas de inventario                                │
│  (cards: producto, variante, stock actual, umbral)       │
├────────────────────────────────┬─────────────────────────┤
│  🕐 Actividad reciente         │  📦 Colecciones activas  │
│  (feed de eventos)             │  (cards con progreso)    │
└────────────────────────────────┴─────────────────────────┘
```

---

## Sección Superior — Encabezado y controles

### Contenido
- **Título:** "Dashboard" + subtítulo dinámico según período seleccionado
- **Selector de período:** Píldoras (chips): `Hoy` · `Esta semana` · `Este mes` · `Personalizado`
- **Botón actualizar** con indicador de última actualización: "Actualizado hace 2 min"
- **Badge de estado BD:** verde si conectado, rojo si error

### Datos necesarios
- Solo frontend (fechas), el badge de BD requiere `GET /api/health`

### Visual
```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                        [Hoy] [Sem] [Mes] [▼]  │
│ Resumen general — Última actualización: hace 2 min   🔄 │
└─────────────────────────────────────────────────────────┘
```

---

## KPIs — 5 tarjetas métricas

Reemplazar las 4 cards actuales por 5 con datos más relevantes y barras dinámicas reales:

| KPI | Fórmula | Color | Icono |
|-----|---------|-------|-------|
| **Ventas hoy** | `COUNT(ventas WHERE fecha = today AND estado = confirmada)` | `#6366f1` | 🛍️ |
| **Ingresos del mes** | `SUM(total_neto WHERE MONTH(fecha) = current AND estado = confirmada)` | `#10b981` | 💰 |
| **Stock bajo** | `COUNT(variantes WHERE stock <= 5 AND activa = 1)` | `#ef4444` | ⚠️ |
| **Clientes nuevos** | `COUNT(clientes WHERE MONTH(creado_en) = current)` | `#f59e0b` | 👤 |
| **Alertas activas** | Stock bajo + productos sin movimiento + ventas anuladas hoy | `#f97316` | 🔔 |

### Mejora respecto a versión actual
- Barra inferior **dinámica** (no estática 65%): mostrar % respecto a meta del mes
- Tooltip en hover con valor exacto y comparación vs período anterior
- Click en cada card navega a la sección correspondiente

### Visual
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🛍️       │ │ 💰       │ │ ⚠️       │ │ 👤       │ │ 🔔       │
│ VENTAS   │ │ INGR.    │ │ STOCK    │ │ CLIENTES │ │ ALERTAS  │
│ HOY      │ │ DEL MES  │ │ BAJO     │ │ NUEVOS   │ │ ACTIVAS  │
│          │ │          │ │          │ │          │ │          │
│ 12       │ │ $12.5M   │ │ 8        │ │ 3        │ │ 12       │
│ ━━━━━━   │ │ ━━━━━━━━ │ │ ━━━━     │ │ ━━━      │ │ ━━━━━━━━ │
│ vs ayer  │ │ vs mes   │ │ críticos │ │ este mes │ │ requieren │
│ +2       │ │ pasado   │ │          │ │          │ │ acción   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## Gráficos — 3 paneles visuales

### G1: Tendencia mensual de ingresos (gráfico de líneas)

| Aspecto | Detalle |
|---------|---------|
| **Tipo** | Línea con área sombreada |
| **Datos** | Últimos 6 meses: ingresos totales por mes |
| **Eje X** | Meses (Ene, Feb, Mar...) |
| **Eje Y** | Monto en COP |
| **Interacción** | Hover muestra tooltip con valor exacto |
| **Requiere** | Librería de gráficos (Recharts liviana ~30KB) o SVG inline |

**Alternativa sin librería:** Puntos conectados con SVG `<polyline>` + área `<polygon>`, calculando coordenadas con JS.

### G2: Top 5 productos más vendidos (tabla con ranking visual)

Similar al actual pero con mejoras:
- Barra proporcional al lado del nombre del producto (indica % del total de ingresos)
- Columna "Tendencia": ▲ si subió vs mes anterior, ▼ si bajó, — si es nuevo
- Más compacto, sin duplicar estilos con Reportes

### G3: Ingresos por colección (barras horizontales apilables)

Similar al actual pero unificado con el componente de Reportes y con:
- Colores fijos por colección (no solo índice) para consistencia entre visitas
- Mostrar % de contribución al total
- Hover muestra detalle de temporada, ventas, unidades

---

## Alertas — Panel dedicado

### Contenido
- **Stock crítico** (stock ≤ 3): tarjetas rojas con producto, variante (talla/color), stock actual, y botón "Ir a variante"
- **Stock bajo** (stock ≤ 5): lista compacta
- **Productos sin movimiento:** contador + enlace a reporte
- **Colecciones archivadas con productos activos:** alerta naranja

### Visual
```
┌──────────────────────────────────────────────────────────┐
│  ⚠️ Alertas de inventario                    [Ver todas] │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 🔴 CRÍTICO  │ Blusa Floral Rosa · Talla M · #BFR-01 ││
│  │             │ Stock: 2 unidades              [Ir →]  ││
│  ├──────────────────────────────────────────────────────┤│
│  │ 🟡 BAJO     │ Pantalón Cargo · Talla 28 · #PCO-03   ││
│  │             │ Stock: 4 unidades              [Ir →]  ││
│  ├──────────────────────────────────────────────────────┤│
│  │ 🟠 SIN VENTAS │ 12 productos sin movimiento          ││
│  │               │ Representan $2.3M en inventario      ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## Actividad Reciente — Feed en tiempo real

### Contenido
Lista de últimos eventos del sistema, ordenados por fecha descendente:

| Evento | Icono | Información a mostrar |
|--------|-------|----------------------|
| Venta creada | 🛍️ | "Venta #123 a María García — $89,000" |
| Venta anulada | ↩️ | "Venta #120 anulada por Admin — $150,000" |
| Compra registrada | 📦 | "Compra a Proveedor XYZ — 15 unidades" |
| Cliente nuevo | 👤 | "Nuevo cliente: Sofía Martínez" |
| Stock actualizado | 📊 | "Blusa Floral · Talla M: 12 → 15 uds (por compra)" |
| Producto agotado | ⛔ | "Pantalón Cargo · Talla 30: stock 0" |

### Visual
```
┌──────────────────────────────────────────────────────────┐
│  🕐 Actividad reciente                      [Ver todas]  │
│                                                          │
│  🛍️  Venta #125 · María García · $124,000 · hace 5 min  │
│  📦  Compra #32 · Proveedor Textil · 25 uds · hace 18min │
│  👤  Nuevo: Andrea López · Cliente recurrente · hace 1h  │
│  ↩️   Venta #120 anulada · Admin · $89,000 · hace 2h     │
│  ⛔  Blusa Floral Talla M · Stock 0 · hace 3h            │
│  📊  Pantalón Cargo · Stock actualizado · hace 4h        │
└──────────────────────────────────────────────────────────┘
```

### Requisito técnico
- Nuevo endpoint: `GET /api/reportes/actividad-reciente?limite=10`
- Query que UNION-e ventas recientes + compras recientes + clientes nuevos, ordenado por fecha DESC
- Alternativa: tabla `auditoria` o `actividad` en BD (no existe actualmente)

---

## Inventario — Resumen y acceso rápido

### Contenido
Panel que reemplaza al actual "Ingresos por colección" con datos más accionables:

| Widget | Datos |
|--------|-------|
| **Total productos activos** | Número + vs mes anterior |
| **Valor total inventario** | `SUM(variantes.stock * variantes.precio_costo)` |
| **% Stock bajo** | % de variantes con stock ≤ 5 |
| **% Sin movimiento** | % de variantes sin ventas en últimos 90 días |
| **Colecciones activas** | Lista de colecciones activas con count de productos |
| **Top 3 colecciones por valor** | Colección, valor inventario, % del total |

### Visual
```
┌────────────────────────────────┬──────────────────────────┐
│  📊 Resumen de inventario      │  📁 Colecciones activas   │
│                                │                          │
│  Productos activos:  142       │  🌸 Primavera 2026 · 34p │
│  Valor total:        $28.5M    │  🍂 Otoño 2025   · 28p  │
│  Stock bajo:        8 vars.   │  ❄️ Invierno 2025 · 22p  │
│  Sin movimiento:     12 vars.  │  🌼 Resort 2026   · 18p  │
│                                │                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━    │  [Gestionar colecciones] │
│  ████████░░░░ 68% saludable   │                          │
└────────────────────────────────┴──────────────────────────┘
```

---

## Resumen de nuevos componentes vs existentes

| Componente | Estado actual | En Dashboard v2 |
|------------|:------------:|:----------------:|
| `MetricCard` | Inline en Dashboard, 4 cards con barra estática | Componente compartido, 5 cards con barra dinámica + tooltip + navegación |
| Tabla top productos | Duplicada en Dashboard y Reportes | Componente `TopProductsTable` compartido con tema paramétrico |
| Barras colecciones | Duplicada en Dashboard y Reportes | Componente `CollectionBars` compartido |
| Gráfico de líneas | ❌ No existe | Nuevo componente `LineChart` (Recharts o SVG) |
| Panel Alertas | ❌ No existe | Nuevo componente `AlertPanel` |
| Feed actividad | ❌ No existe | Nuevo componente `ActivityFeed` |
| Resumen inventario | Solo contador de stock bajo en KPI actual | Panel completo con 5 métricas + colecciones |
| Selector período | ❌ No existe | Nuevo componente `PeriodSelector` |
| Indicador "última actualización" | ❌ No existe | Badge en header |

---

## APIs requeridas (resumen)

| API | Existe? | Nuevo? | Datos |
|-----|:-------:|:-------:|-------|
| `GET /api/reportes/dashboard` | ✅ | Expandir | Agregar: clientes nuevos, valor inventario, ventas hoy, ingresos mes |
| `GET /api/reportes/mas-vendidos` | ✅ | — | Top 10 (Frontend toma top 5) |
| `GET /api/reportes/ingresos-coleccion` | ✅ | — | Ingresos por colección |
| `GET /api/reportes/ventas-recientes` | ❌ | ✅ | Últimas 8 ventas con detalle |
| `GET /api/reportes/tendencia-mensual` | ❌ | ✅ | Ingresos agrupados por mes (6 meses) |
| `GET /api/reportes/resumen-inventario` | ❌ | ✅ | Valor total, %, salud general |
| `GET /api/reportes/alertas-stock` | ❌ | ✅ | Variantes con stock bajo + crítico |
| `GET /api/reportes/colecciones-activas` | ❌ | ✅ | Colecciones activas con conteo |
| `GET /api/reportes/actividad-reciente` | ❌ | ✅ | Feed de eventos recientes |

---

## Esfuerzo estimado

| Fase | Tarea | Esfuerzo |
|:----:|-------|:--------:|
| 1 | Crear 6 nuevos endpoints backend (SQL + rutas) | ~3h |
| 2 | Agregar librería Recharts (o implementar SVG inline) | ~1h |
| 3 | Componente `MetricCard` compartido con barra dinámica | ~1h |
| 4 | Componente `TopProductsTable` + `CollectionBars` unificados | ~2h |
| 5 | Panel Alertas + Feed Actividad + Resumen Inventario | ~4h |
| 6 | Selector de período + indicador última actualización | ~1.5h |
| 7 | Navegación por clic en KPIs y tablas | ~1h |
| 8 | Skeleton loader + estados de error | ~1.5h |
| **Total** | | **~15h** |
