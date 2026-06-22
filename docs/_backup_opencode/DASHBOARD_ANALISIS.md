# ANÁLISIS DEL DASHBOARD — MODATREND

**Fecha:** 21/06/2026
**Archivo analizado:** `frontend/src/pages/Dashboard.jsx`
**Backend relacionado:** `backend/src/routes/reportes.routes.js` (3 endpoints)

---

## 1. Estructura actual

### Árbol de componentes

```
Dashboard (default export)
├── Header (título + botón Actualizar)
├── MetricGrid
│   ├── MetricCard (x4)         ← definida en el mismo archivo
│   │   ├── icono (emoji)
│   │   ├── valor (formateado)
│   │   ├── subtítulo
│   │   └── barra decorativa (estática 65%)
│   └── ...
├── Panel: Productos más vendidos
│   └── tabla <table> con 5 columnas
│       ├── ranking (1-5 con colores oro/plata/bronce)
│       ├── producto + referencia
│       ├── categoría (badge)
│       ├── unidades (badge)
│       └── ingresos (formato moneda)
└── Panel: Ingresos por colección
    └── lista de items con:
        ├── nombre colección + temporada/año
        ├── barra de progreso CSS (ancho dinámico)
        ├── # ventas, # unidades
        └── monto ingresos
```

### Flujo de datos

```
Componente Monta
  → useEffect → cargar()
    → Promise.all([
        GET /api/reportes/dashboard,
        GET /api/reportes/mas-vendidos,
        GET /api/reportes/ingresos-coleccion,
      ])
    → setStats(data)
    → setMasVendidos(data.slice(0,5))
    → setIngresos(data.slice(0,4))
  → Render condicional según cargando
```

---

## 2. Componentes reutilizables

### Existentes (definidos dentro del mismo archivo)

| Componente | ¿Reutilizable? | Dónde más se usa |
|------------|:--------------:|-----------------|
| `MetricCard` | ❌ No — está definida en el mismo archivo como función auxiliar | Solo en Dashboard |
| Tabla de productos más vendidos | ❌ No — lógica inline duplicada en Reportes.jsx | Dashboard + Reportes |
| Barras de ingresos por colección | ❌ No — lógica inline duplicada en Reportes.jsx | Dashboard + Reportes |
| Estilos (objeto `s`) | ❌ No — definidos en cada página | Por página |

### Potencialmente reutilizables (deberían extraerse)

| Candidato | Razón |
|-----------|-------|
| `MetricCard` | Usaría props: título, valor, sub, color, icono. Puede usarse en Dashboard, Reportes, o cualquier página de resumen. |
| `DataTable` | Dashboard y Reportes tienen tablas muy similares (Productos más vendidos, Ventas por período, etc.). Podría unificarse. |
| `BarChart` | El componente de barras de colecciones es idéntico en Dashboard y Reportes con diferente theme. |
| `Panel` | El wrapper panel+header+body se repite en todas las páginas con estilos similares. |

---

## 3. Código duplicado

### Dashboard.jsx vs Reportes.jsx — duplicación casi exacta

| Fragmento | Dashboard (líneas) | Reportes (líneas) |
|-----------|:------------------:|:-----------------:|
| Tabla productos más vendidos | 97-131 | 100-131 |
| Barras ingresos por colección | 136-168 | 142-165 |
| Lógica `maxIngresos` con `Math.max` | línea 36 | línea 61 |
| Formato moneda `toLocaleString('es-CO')` | líneas 56,124,151 | líneas 126,157,191,225,259 |
| Endpoints GET `/mas-vendidos` e `/ingresos-coleccion` | líneas 21-22 | líneas 43-44 |
| Mismo `slice(0,5)` y `slice(0,4)` (solo cambia el límite) | líneas 25-26 | — |

### Diferencias entre ambas implementaciones

| Aspecto | Dashboard | Reportes |
|---------|-----------|----------|
| **Tema** | Dark (`#0f1117`, `#13151f`, `#1e2030`) | Light/beige (`#f5ede6`, `#fff`, `#fffaf7`) |
| **Estilos tabla** | th oscuro, td gris claro | th beige, td marrón oscuro |
| **Ranking badge** | Texto monospace con color | Círculo con fondo dorado/plata/bronce |
| **Panel wrapper** | Sin sombra, borde sutil | Con sombra `0 2px 12px` |
| **Tamaño fuente** | 12px, 9px (compacto) | 0.9rem, 0.78rem (espaciado) |

**Conclusión:** Hay dos versiones del mismo componente visual con themes distintos. Si se refactoriza a un componente compartido con props de theme, se elimina ~100 líneas duplicadas.

---

## 4. Problemas de UX/UI detectados

### ⚠️ Críticos

| # | Problema | Línea | Descripción |
|:-:|----------|:-----:|-------------|
| 1 | **Sin estado de error** | 27-28 | El `catch` solo hace `console.error(err)`. El dashboard se queda en blanco sin feedback al usuario si falla la API. |
| 2 | **Barra decorativa estática** | 185 | `MetricCard` tiene `width: '65%'` fijo. No representa ningún dato real, es puramente decorativa. Podría confundir al usuario haciéndole pensar que es un indicador real. |
| 3 | **Sin skeleton loader** | 38 | Mientras carga solo muestra texto "Cargando dashboard...". No hay esqueleto visual que mantenga el layout estable. |

### ⚠️ Medios

| # | Problema | Línea | Descripción |
|:-:|----------|:-----:|-------------|
| 4 | **Sin refresh automático** | 34 | Los datos solo se cargan al montar el componente. No hay polling, WebSocket, ni botón de refresh con indicación visual de que se actualizó. |
| 5 | **Sin tooltips ni interactividad** | — | Las tablas y barras no tienen hover states, tooltips explicativos, ni clic para navegar al detalle (ej: clic en "Productos más vendidos" → ir a Productos). |
| 6 | **Sin adaptabilidad móvil** | 198 | `metricGrid` usa `grid-template-columns: repeat(4,1fr)`. En pantallas pequeñas las 4 cards se aplastan. No hay media queries. |
| 7 | **Sin paginación en tabla** | 106 | Los productos más vendidos están limitados a 5 por `slice(0,5)`. No hay opción de "Ver todos" o paginación. |

### 🟢 Leves

| # | Problema | Línea | Descripción |
|:-:|----------|:-----:|-------------|
| 8 | **Hardcode de URL API** | 5 | `API = 'http://localhost:4000/api'` hardcodeado, igual en todas las páginas. Debería ser una variable de entorno o un archivo de configuración compartido. |
| 9 | **Formato de fecha no tipado** | — | `v.fecha?.split('T')[0]` es frágil. Si el backend cambia el formato, se rompe. |
| 10 | **Contenido del panel variable** | — | Los paneles no tienen altura uniforme. Si una colección tiene nombre muy largo, el layout se desalinea. |
| 11 | **Sin indicador de datos desactualizados** | — | Si el usuario deja el dashboard abierto horas, no hay forma de saber si los datos siguen siendo actuales. |

---

## 5. Mejoras recomendadas

### Prioridad Alta (UX y robustez)

| # | Mejora | Esfuerzo | Beneficio |
|:-:|--------|:--------:|-----------|
| 1 | **Agregar estado de error con retry** — mostrar mensaje amigable + botón "Reintentar" cuando falle la API | ~1h | Evita pantalla en blanco |
| 2 | **Reemplazar barra estática del MetricCard por indicador real** — ej: % del objetivo mensual o % de ingresos vs meta | ~1h | Datos significativos vs decoración |
| 3 | **Agregar skeleton loader** — 4 cards grises animadas + 2 paneles esqueleto mientras carga | ~2h | Percepción de velocidad, layout estable |
| 4 | **Extraer `MetricCard` a componente compartido** en `src/components/` | ~1h | Reutilizable en todo el proyecto |
| 5 | **Unificar tabla de productos + barras de colecciones** entre Dashboard y Reportes en componentes compartidos con tema paramétrico | ~3h | Elimina ~100 líneas duplicadas |

### Prioridad Media (funcionalidad)

| # | Mejora | Esfuerzo | Beneficio |
|:-:|--------|:--------:|-----------|
| 6 | **Agregar navegación por clic** — clic en producto → navega a `/productos/:id`; clic en colección → navega a `/colecciones` | ~2h | Mejora flujo de trabajo |
| 7 | **Agregar selector de período rápido** — botones "Hoy", "Esta semana", "Este mes", "Personalizado" que actualicen el dashboard | ~4h | Flexibilidad de análisis |
| 8 | **Dashboard responsivo** — `repeat(auto-fit, minmax(240px, 1fr))` para las cards, scroll horizontal para tablas | ~2h | Usabilidad en tablets/móviles |
| 9 | **Centralizar URL base de API** en `src/config.js` o variable de entorno `VITE_API_URL` | ~30min | Mantenibilidad |

### Prioridad Baja (detalles visuales)

| # | Mejora | Esfuerzo | Beneficio |
|:-:|--------|:--------:|-----------|
| 10 | **Agregar indicador "Última actualización"** con timestamp + badge verde si < 5 min | ~1h | Confianza en datos |
| 11 | **Tooltips en tablas** — mostrar valor exacto con formato en hover | ~1h | Claridad de información |
| 12 | **Botón "Ver todos"** en productos más vendidos → enlaza a reportes con filtro | ~1h | Continuidad de navegación |

---

## Datos clave del Dashboard actual

| Métrica | Valor |
|---------|-------|
| **Archivo** | `frontend/src/pages/Dashboard.jsx` |
| **Líneas totales** | 231 |
| **Componentes hijos** | 1 (`MetricCard`, inline) |
| **Librería de gráficos** | ❌ Ninguna (barras con CSS puro) |
| **APIs consumidas** | 3 (`/dashboard`, `/mas-vendidos`, `/ingresos-coleccion`) |
| **Datos mockeados** | ❌ Ninguno — 100% real desde backend |
| **Cards de métricas** | 4 (Ingresos, Ventas, Clientes, Alertas Stock) |
| **Gráficos reales** | 0 (solo barras decorativas CSS) |
| **Widgets** | 2 paneles: Top productos + Ingresos por colección |
| **Estados cubiertos** | Cargando ✅ / Datos vacíos ✅ / Error ❌ |
