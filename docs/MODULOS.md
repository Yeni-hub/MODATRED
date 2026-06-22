# Módulos del Sistema

## 1. Módulo de Acceso al Sistema (Login)

### 1.1 Funcionalidad
El módulo de autenticación permite a los usuarios acceder al sistema mediante credenciales (email y contraseña). Implementa autenticación basada en **JWT (JSON Web Token)** con contraseñas almacenadas utilizando **bcryptjs**.

### 1.2 Operaciones
- **Inicio de sesión**: `POST /api/auth/login`
- Validación de credenciales contra la tabla `usuarios`.
- Generación de token JWT con datos del usuario (id_usuario, nombre, rol).
- Almacenamiento del token en `localStorage` del navegador.
- Redirección al Dashboard tras autenticación exitosa.

### 1.3 Validaciones
- Campos email y password obligatorios.
- Formato de email válido.
- Contraseña mínimo 6 caracteres.
- Verificación de usuario activo (`activo = 1`).
- Máximo 3 intentos antes de bloqueo temporario.

### 1.4 Protección
Todas las rutas del backend (excepto login) requieren el middleware `verificarToken`, que extrae y valida el JWT del header `Authorization: Bearer <token>`.

---

## 2. Módulo Dashboard

### 2.1 Funcionalidad
Panel de control principal que presenta un resumen ejecutivo del estado del negocio mediante indicadores clave de rendimiento (KPI), gráficos y alertas.

### 2.2 Indicadores KPI
- **Ventas totales**: ingresos del mes actual.
- **Pedidos**: ventas registradas en el día de hoy.
- **Clientes**: nuevos clientes registrados en el mes.
- **Productos**: productos activos en catálogo.
- **Stock bajo**: variantes con stock ≤ 5 unidades.

### 2.3 Secciones del Dashboard

| Sección | Descripción |
|---------|-------------|
| Ventas por período | Gráfico de barras con tendencia de ventas (7, 30 o 90 días). |
| Ventas por categoría | Barras horizontales con unidades vendidas por categoría. |
| Ventas por colección | Ingresos agrupados por colección. |
| Ventas por canal | Sección en desarrollo para futuro análisis multicanal. |
| Productos más vendidos | Tabla con top 5 productos por unidades vendidas. |
| Nuevas colecciones | Lista de colecciones activas con conteo de productos. |
| Bajo stock | Alertas de inventario clasificadas en críticas (≤3 uds), bajas (4-5 uds) y agotadas (0 uds). |
| Actividad reciente | Timeline de últimos movimientos: ventas, compras, anulaciones y nuevos clientes. |

### 2.4 Endpoints utilizados
- `GET /api/reportes/dashboard` — KPIs generales.
- `GET /api/reportes/mas-vendidos` — Top 10 productos.
- `GET /api/reportes/ingresos-coleccion` — Ingresos por colección.
- `GET /api/reportes/tendencia-mensual` — Tendencia por período.
- `GET /api/reportes/alertas-stock` — Alertas detalladas.
- `GET /api/reportes/actividad-reciente` — Últimas transacciones.

---

## 3. Módulo Productos

### 3.1 Funcionalidad
Gestión del catálogo de productos. Cada producto tiene una referencia única, nombre, descripción, precio base, y está asociado a una categoría y una colección.

### 3.2 Operaciones CRUD

| Operación | Endpoint | Descripción |
|-----------|----------|-------------|
| Listar | `GET /api/productos` | Lista todos los productos activos con filtros opcionales (colección, categoría, stock bajo). |
| Obtener | `GET /api/productos/:id` | Obtiene un producto con sus variantes. |
| Crear | `POST /api/productos` | Crea un nuevo producto. |
| Actualizar | `PUT /api/productos/:id` | Actualiza los datos del producto. |
| Eliminar | `DELETE /api/productos/:id` | Desactiva el producto (borrado lógico). |

### 3.3 Validaciones
- Referencia única (no permite duplicados).
- No se pueden crear productos en colecciones archivadas.
- Precio base requerido.

### 3.4 Relaciones
- N:1 con **Categorías** (cada producto pertenece a una categoría).
- N:1 con **Colecciones** (cada producto pertenece a una colección).
- 1:N con **Variantes** (un producto puede tener múltiples variantes).

---

## 4. Módulo Categorías

### 4.1 Funcionalidad
Administración de las categorías utilizadas para clasificar los productos del catálogo.

### 4.2 Operaciones CRUD
- Listar, crear, actualizar y eliminar categorías.
- El nombre de la categoría es único.

### 4.3 Relaciones
- 1:N con **Productos** (una categoría puede tener muchos productos).

---

## 5. Módulo Colecciones

### 5.1 Funcionalidad
Gestión de colecciones por temporada y año. Las colecciones pueden archivarse para evitar la creación de nuevos productos en ellas.

### 5.2 Operaciones CRUD
- Listar, crear, actualizar y eliminar colecciones.
- Posibilidad de archivar colecciones (no se pueden agregar productos a colecciones archivadas).

### 5.3 Temporadas disponibles
- `primavera-verano`
- `otoño-invierno`
- `crucero`
- `resort`

### 5.4 Relaciones
- 1:N con **Productos** (una colección puede tener muchos productos).

---

## 6. Módulo Variantes

### 6.1 Funcionalidad
Gestión de las variantes de producto definidas por una combinación única de talla y color. Cada variante tiene su propio stock y precio de costo.

### 6.2 Operaciones CRUD
- Listar variantes con filtro por producto.
- Crear, editar y eliminar (desactivar) variantes.
- La combinación `(id_producto, talla, color)` debe ser única.

### 6.3 Tallas disponibles
XS, S, M, L, XL, XXL, 36, 37, 38, 39, 40, 41, 42, U

### 6.4 Relaciones
- N:1 con **Productos** (cada variante pertenece a un producto).
- N:M con **Compras** (a través de `detalle_compras`).
- N:M con **Ventas** (a través de `detalle_ventas`).

---

## 7. Módulo Proveedores

### 7.1 Funcionalidad
Registro y administración de los proveedores que suministran productos a la tienda.

### 7.2 Operaciones CRUD
- Listar, crear, actualizar y eliminar proveedores.
- El NIT del proveedor es único.

### 7.3 Relaciones
- 1:N con **Compras** (un proveedor puede tener muchas órdenes de compra).

---

## 8. Módulo Compras

### 8.1 Funcionalidad
Registro de órdenes de compra a proveedores. Al registrar una compra, se actualiza automáticamente el stock y el precio de costo de las variantes incluidas.

### 8.2 Operaciones
- **Listar compras**: `GET /api/compras` — muestra compras con proveedor y usuario.
- **Registrar compra**: `POST /api/compras` — recibe proveedor, items (variante, cantidad, precio_costo) y observaciones.

### 8.3 Proceso de registro
1. Inicia una transacción en la base de datos.
2. Calcula el total de la compra (`suma(cantidad * precio_costo)`).
3. Inserta el encabezado en la tabla `compras`.
4. Inserta los detalles en `detalle_compras`.
5. Actualiza el stock (`stock = stock + cantidad`) y el precio de costo en `variantes`.
6. Confirma la transacción (`commit`).

### 8.4 Relaciones
- N:1 con **Proveedores**.
- N:1 con **Usuarios**.
- N:M con **Variantes** (a través de `detalle_compras`).

---

## 9. Módulo Clientes

### 9.1 Funcionalidad
Administración de la base de clientes, incluyendo datos de contacto, preferencias de compra y saldo a favor.

### 9.2 Operaciones CRUD
- Listar, crear, actualizar y eliminar clientes.
- El número de documento es único.

### 9.3 Tipos de documento
CC (Cédula de Ciudadanía), CE (Cédula de Extranjería), NIT, PAS (Pasaporte).

### 9.4 Saldo a favor
Los clientes pueden acumular saldo a favor que puede ser utilizado como método de pago en ventas futuras.

### 9.5 Relaciones
- 1:N con **Ventas** (un cliente puede realizar muchas compras).

---

## 10. Módulo Ventas

### 10.1 Funcionalidad
Registro de ventas a clientes con control de inventario, validación de precios y gestión del estado del pedido.

### 10.2 Operaciones

| Operación | Endpoint | Descripción |
|-----------|----------|-------------|
| Listar | `GET /api/ventas` | Lista ventas con filtro opcional por estado. |
| Obtener | `GET /api/ventas/:id` | Obtiene venta con detalle de productos. |
| Crear | `POST /api/ventas` | Registra una nueva venta. |
| Cambiar estado | `PUT /api/ventas/:id/estado` | Actualiza estado del pedido. |
| Anular | `PUT /api/ventas/:id/anular` | Anula venta y restaura stock. |
| Agregar saldo | `POST /api/ventas/saldo-favor` | Agrega saldo a favor a un cliente. |

### 10.3 Validaciones en creación
- Descuento máximo: 50%.
- Stock suficiente para cada variante.
- Precio de venta no menor al precio de costo.
- Si el método de pago es `saldo_favor`, el cliente debe tener saldo suficiente.

### 10.4 Estados del pedido
| Estado | Descripción |
|--------|-------------|
| `confirmada` | Venta registrada, pendiente de despacho. |
| `en_entrega` | Pedido en proceso de entrega. |
| `entregada` | Pedido entregado al cliente. |
| `anulada` | Venta anulada, stock restaurado. |

### 10.5 Métodos de pago
- `efectivo`
- `tarjeta`
- `credito`
- `saldo_favor` (descuenta del saldo disponible del cliente)

### 10.6 Proceso de creación (transaccional)
1. Valida cada ítem (stock, precio mínimo).
2. Calcula total bruto y total neto (con descuento).
3. Si aplica, descuenta saldo a favor.
4. Inserta encabezado en `ventas`.
5. Inserta detalles en `detalle_ventas`.
6. Decrementa stock en `variantes`.
7. Si ocurre algún error, revierte toda la transacción.

### 10.7 Anulación
Al anular una venta:
- Se restaura el stock de todas las variantes involucradas.
- Si el pago fue con `saldo_favor`, se devuelve el saldo al cliente.
- Se marca la venta como `anulada`.

### 10.8 Relaciones
- N:1 con **Clientes**.
- N:1 con **Usuarios** (vendedor).
- N:M con **Variantes** (a través de `detalle_ventas`).

---

## 11. Módulo Usuarios

### 11.1 Funcionalidad
Administración de los usuarios del sistema, control de acceso por roles.

### 11.2 Operaciones CRUD
- Listar, crear, actualizar y eliminar usuarios.
- El email es único.
- Solo accesible para usuarios con rol `admin`.

### 11.3 Roles
| Rol | Permisos |
|-----|----------|
| `admin` | Acceso total a todos los módulos, incluyendo gestión de usuarios. |
| `vendedor` | Acceso a ventas, clientes, productos, dashboard y reportes. |

### 11.4 Relaciones
- 1:N con **Compras** (un usuario puede registrar muchas compras).
- 1:N con **Ventas** (un usuario puede atender muchas ventas).

---

## 12. Módulo Reportes

### 12.1 Funcionalidad
Generación de reportes analíticos con filtros dinámicos y opción de exportación.

### 12.2 Reportes disponibles

| Reporte | Endpoint | Descripción |
|---------|----------|-------------|
| Ventas por período | `GET /api/reportes/por-periodo` | Ventas filtradas por rango de fechas. |
| Ventas por vendedor | `GET /api/reportes/por-vendedor` | Ingresos y ticket promedio por vendedor. |
| Ventas por cliente | `GET /api/reportes/por-cliente` | Historial de compras por cliente. |
| Productos sin movimiento | `GET /api/reportes/productos-sin-movimiento` | Productos con 0 ventas. |
| Resumen de inventario | `GET /api/reportes/resumen-inventario` | Valor total del inventario. |
| Exportar ventas CSV | `GET /api/reportes/exportar` | Descarga de ventas en formato CSV. |

### 12.3 Exportación
El módulo de reportes permite exportar las ventas filtradas a un archivo CSV con los campos: ID, Fecha, Cliente, Vendedor, Total, Método de Pago y Estado.
