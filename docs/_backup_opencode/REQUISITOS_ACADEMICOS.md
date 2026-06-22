# VALIDACIÓN FINAL DE REQUISITOS ACADÉMICOS — MODATREND

**Fecha:** 21/06/2026
**Fuente:** `MATRIZ_TRAZABILIDAD.md` (24 requisitos documentados)

---

## Tabla de evaluación por requisito

### REQUISITOS FUNCIONALES (RF)

| ID | Requisito | Estado | ¿Genera pérdida de calificación? | Impacto | Esfuerzo estimado |
|:--:|-----------|--------|:-------------------------------:|:-------:|:-----------------:|
| RF-01 | Login de usuarios (autenticación) | ✅ Cumple totalmente | No | — | — |
| RF-02 | CRUD Productos | ✅ Cumple totalmente | No | — | — |
| RF-03 | CRUD Variantes | ✅ Cumple totalmente | No | — | — |
| RF-04 | CRUD Colecciones | ✅ Cumple totalmente | No | — | — |
| RF-05 | CRUD Proveedores | ✅ Cumple totalmente | No | — | — |
| RF-06 | CRUD Clientes | ✅ Cumple totalmente | No | — | — |
| RF-07 | CRUD Categorías | ⚠️ Cumple parcialmente (solo GET) | Sí — no hay CREATE/UPDATE/DELETE | Bajo | ~2h |
| RF-08 | Registro de Compras con actualización de stock | ✅ Cumple totalmente | No | — | — |
| RF-09 | Registro de Ventas con descuento de stock | ✅ Cumple totalmente | No | — | — |
| RF-10 | JOIN de Ventas (detalle completo) | ✅ Cumple totalmente | No | — | — |
| RF-11 | Filtros en listados | ✅ Cumple totalmente | No | — | — |
| RF-12 | Reportes | ⚠️ Cumple parcialmente (3 reportes básicos) | Sí — faltan reportes por período, vendedor, cliente, productos sin movimiento, exportación | Medio | ~16h |
| RF-13 | Gestión de estados de venta | ✅ Cumple totalmente | No | — | — |
| RF-14 | Anulación de ventas con restauración de stock | ✅ Cumple totalmente | No | — | — |
| RF-15 | Saldo a favor del cliente | ✅ Cumple totalmente | No | — | — |
| RF-16 | CRUD Usuarios (solo admin) | ✅ Cumple totalmente | No | — | — |

### REGLAS DE NEGOCIO (RN)

| ID | Requisito | Estado | ¿Genera pérdida de calificación? | Impacto | Esfuerzo estimado |
|:--:|-----------|--------|:-------------------------------:|:-------:|:-----------------:|
| RN-01 | No vender sin stock suficiente | ✅ Cumple totalmente | No | — | — |
| RN-02 | Precio venta >= precio costo | ✅ Cumple totalmente | No | — | — |
| RN-03 | No agregar productos a colección archivada | ✅ Cumple totalmente | No | — | — |
| RN-04 | No eliminar físicamente variantes con ventas | ✅ Cumple totalmente | No | — | — |
| RN-05 | Descuento máximo 50% | ✅ Cumple totalmente | No | — | — |

### SEGURIDAD Y CONTROL DE ACCESO (S)

| ID | Requisito | Estado | ¿Genera pérdida de calificación? | Impacto | Esfuerzo estimado |
|:--:|-----------|--------|:-------------------------------:|:-------:|:-----------------:|
| S-01 | Middleware de autenticación JWT | ✅ Cumple totalmente | No | — | — |
| S-02 | Middleware de rol admin | ✅ Cumple totalmente | No | — | — |
| S-03 | Protección de rutas en frontend | ❌ No cumple | Sí — cualquier usuario no autenticado navega páginas protegidas | **Alto** | ~2h |

---

## Hallazgos adicionales de auditoría (no en matriz original pero relevantes)

| ID | Hallazgo | Estado | ¿Genera pérdida de calificación? | Impacto | Esfuerzo estimado |
|:--:|----------|--------|:-------------------------------:|:-------:|:-----------------:|
| C-02 | JWT_SECRET hardcodeado en .env (texto plano en repo) | ❌ No cumple | Sí — riesgo de seguridad crítico | **Alto** | ~30min |
| C-03 | Sin validación de entrada en rutas POST/PUT (solo auth/login tiene express-validator) | ❌ No cumple | Sí — riesgo de inyección/XSS | **Alto** | ~8h |
| A-03 | Sin paginación en endpoints GET | ❌ No cumple | Posible — degradación con muchos registros | Medio | ~6h |
| A-04 | Sin refresh token / renovación silenciosa de JWT | ❌ No cumple | Posible — sesión expira cada 8h sin renovación | Medio | ~4h |
| A-05 | Falta módulo de inventario dedicado (kardex, movimientos) | ❌ No cumple | Posible — funcionalidad esperada en sistema de ventas | Medio | ~16h |
| M-01 | Sin exportación de reportes (PDF/Excel/CSV) | ❌ No cumple | Posible | Medio | ~8h |
| M-02 | Sin comprobante de venta / factura PDF | ❌ No cumple | Posible | Medio | ~12h |
| M-05 | Sin tests automatizados | ❌ No cumple | Posible — según criterio de evaluación | Medio | ~20h |
| M-06 | Anulación de venta no registra quién anuló | ❌ No cumple | Posible | Bajo | ~2h |
| B-01 | Estilos inline en frontend | ❌ No cumple | Improbable | Bajo | ~16h |
| B-04 | Sin lazy loading de rutas | ❌ No cumple | Improbable | Bajo | ~2h |

---

## Resumen de cumplimiento

| Categoría | Total | Cumple | Parcial | No cumple | % |
|-----------|:-----:|:------:|:-------:|:---------:|:-:|
| Funcionales (RF) | 16 | 14 | 2 | 0 | **87.5%** |
| Reglas de negocio (RN) | 5 | 5 | 0 | 0 | **100%** |
| Seguridad (S) | 3 | 2 | 0 | 1 | **66.6%** |
| **TOTAL (matriz original)** | **24** | **21** | **2** | **1** | **87.5%** |
| Con hallazgos adicionales | 35 | 21 | 2 | 12 | **~60%** |

---

# Cambios obligatorios para alcanzar 100%

Estos cambios son **indispensables** porque corresponden a requisitos marcados como "No cumple" o "Parcial" en la matriz original, o representan riesgos de seguridad críticos que casi con certeza generarán pérdida de calificación.

| # | Requisito | ID | ¿Qué hay que hacer? | Esfuerzo |
|:-:|-----------|:--:|---------------------|:--------:|
| 1 | **Protección de rutas en frontend** | S-03 / C-01 | Agregar verificación de token en `App.jsx` o `Layout.jsx`. Redirigir a `/login` si no hay token. | ~2h |
| 2 | **CRUD Categorías completo** | RF-07 | Agregar endpoints POST, PUT, DELETE en `categorias.routes.js` yUI en frontend para administrar categorías. | ~2h |
| 3 | **JWT_SECRET seguro** | C-02 | Mover a variable de entorno no commiteada. Agregar `.env` a `.gitignore` y generar clave segura. | ~30min |
| 4 | **Validación de entrada en todas las rutas POST/PUT** | C-03 | Implementar `express-validator` en rutas de productos, clientes, proveedores, variantes, colecciones, compras, ventas. | ~8h |
| 5 | **Reportes completos** | RF-12 | Agregar reportes por período, por vendedor, por cliente, productos sin movimiento. Agregar exportación básica (CSV). | ~16h |

**Esfuerzo total obligatorio:** ~28.5 horas

---

# Cambios recomendados pero no obligatorios

Estos cambios mejorarían la calidad del proyecto y reducirían riesgos de pérdida parcial de calificación, pero los requisitos base están cubiertos.

| # | Mejora | ID | ¿Por qué recomendado? | Esfuerzo |
|:-:|--------|:--:|-----------------------|:--------:|
| 1 | Paginación en endpoints GET | A-03 | Escalabilidad y rendimiento con muchos registros | ~6h |
| 2 | Refresh token o renovación silenciosa de JWT | A-04 | Mejora experiencia de usuario | ~4h |
| 3 | Módulo de inventario con kardex y movimientos | A-05 | Funcionalidad esperada en sistema POS/ventas | ~16h |
| 4 | Exportación de reportes a PDF/Excel | M-01 | Valor agregado significativo | ~8h |
| 5 | Comprobante de venta / factura PDF | M-02 | Funcionalidad profesional | ~12h |
| 6 | Tests automatizados (unitarios + integración) | M-05 | Respalda calidad del código | ~20h |
| 7 | Auditoría de quién anula una venta | M-06 | Trazabilidad de acciones críticas | ~2h |
| 8 | Migrar estilos inline a CSS modules o Tailwind | B-01 | Mantenibilidad del frontend | ~16h |
| 9 | Lazy loading de rutas con React.lazy | B-04 | Rendimiento de carga inicial | ~2h |
| 10 | Detalle completo de compras en frontend | RF-08 (mejora) | Visualizar items de compra (hoy solo muestra total) | ~6h |

**Esfuerzo total recomendado:** ~92 horas

---

## Conclusión

- **Cumplimiento actual sobre matriz original:** 87.5% (21/24)
- **Para llegar a 100%:** Implementar los **5 cambios obligatorios** (~28.5h)
- **Para proyecto sobresaliente:** Adicionalmente implementar los **10 cambios recomendados** (~92h)
- **Riesgo más crítico:** S-03 (protección de rutas frontend) — es el único requisito marcado como "No cumple" en la matriz y puede generar pérdida significativa de calificación.
