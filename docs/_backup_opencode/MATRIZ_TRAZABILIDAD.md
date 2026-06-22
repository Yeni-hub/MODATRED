# MATRIZ DE TRAZABILIDAD DE REQUISITOS — MODATREND

---

## REQUISITOS FUNCIONALES

### RF-01: Login de usuarios (autenticación)

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/controllers/auth.controller.js:16-62` — Lógica de login: busca usuario por email, compara bcrypt, firma JWT |
| | `backend/src/routes/auth.routes.js:1-9` — Ruta `POST /api/auth/login` con middleware `validarLogin` |
| | `backend/src/validators/auth.validator.js:1-13` — Validación: email obligatorio + formato, password obligatorio + min 6 |
| | `backend/src/middlewares/auth.middleware.js:1-24` — `verificarToken` y `soloAdmin` |
| **Frontend** | `frontend/src/pages/login.jsx:27-37` — `onSubmit` llama a `POST /api/auth/login`, guarda token vía `useAuth().login()` |
| | `frontend/src/context/authcontext.jsx:14-29` — `login()` guarda token+usuario en localStorage, `logout()` los elimina |
| **Endpoint** | `POST /api/auth/login` |
| **Tabla(s)** | `usuarios` |
| **Evidencia exacta** | `auth.controller.js:44` → `SELECT * FROM usuarios WHERE email = ? AND activo = 1` |
| | `auth.controller.js:55` → `bcrypt.compare(password, usuario.password_hash)` |
| | `auth.controller.js:59-63` → `jwt.sign({ id_usuario, nombre, rol }, JWT_SECRET, { expiresIn: '8h' })` |
| | `login.jsx:31` → `axios.post('http://localhost:4000/api/auth/login', datos)` |

---

### RF-02: CRUD Productos

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/controllers/productos.controller.js` — Funciones: `listar` (línea 6), `obtener` (línea 38), `crear` (línea 57), `actualizar` (línea 75), `eliminar` (línea 92) |
| | `backend/src/routes/productos.routes.js:1-13` — 5 rutas: GET /, GET /:id, POST /, PUT /:id, DELETE /:id |
| **Frontend** | `frontend/src/pages/Productos.jsx:46-53` — `cargarDatos()` llama a `GET /api/productos` con filtros opcionales |
| | `Productos.jsx:62-67` — `abrirEditar()`, `Productos.jsx:79-88` — `guardar()` para POST/PUT |
| | `Productos.jsx:92-96` — `eliminar()` llama a `DELETE /api/productos/:id` |
| **Endpoint** | `GET /api/productos`, `GET /api/productos/:id`, `POST /api/productos`, `PUT /api/productos/:id`, `DELETE /api/productos/:id` |
| **Tabla(s)** | `productos`, `categorias`, `colecciones`, `variantes` |
| **Evidencia exacta** | `productos.controller.js:16-33` → SELECT con JOIN a categorias/colecciones, LEFT JOIN variantes, COUNT stock. Filtros: `id_coleccion`, `id_categoria`, `stock_bajo` (HAVING stock_total <= 5) |
| | `productos.controller.js:42-50` → SELECT producto + JOIN categorias/colecciones + SELECT variantes separado |
| | `productos.controller.js:64-66` → INSERT con referencia, nombre, descripcion, precio_base, id_categoria, id_coleccion |
| | `productos.controller.js:78-82` → UPDATE set completo |
| | `productos.controller.js:94` → `UPDATE productos SET activo = 0` (soft delete) |
| | `Productos.jsx:46-53` → `axios.get(${API}/productos, { headers, params })` |

---

### RF-03: CRUD Variantes

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/variantes.routes.js:14-36` — GET con filtro `id_producto` y JOIN a productos |
| | `variantes.routes.js:39-49` — POST crear variante |
| | `variantes.routes.js:52-56` — PUT actualizar variante |
| | `variantes.routes.js:59-74` — DELETE: si tiene ventas → activa=0, si no → DELETE físico |
| **Frontend** | `frontend/src/pages/variantes.jsx:28-37` — `cargar()` llama a `GET /api/variantes` con filtro `id_producto` |
| | `variantes.jsx:48-60` — `guardar()` para POST/PUT |
| | `variantes.jsx:64-67` — `eliminar()` para DELETE |
| **Endpoint** | `GET /api/variantes?producto=:id`, `POST /api/variantes`, `PUT /api/variantes/:id`, `DELETE /api/variantes/:id` |
| **Tabla(s)** | `variantes`, `productos`, `detalle_ventas` |
| **Evidencia exacta** | `variantes.routes.js:18-27` → SELECT variantes JOIN productos WHERE activa=1, filtro opcional `id_producto` |
| | `variantes.routes.js:43` → INSERT INTO variantes (id_producto, talla, color, stock, precio_costo) |
| | `variantes.routes.js:55` → UPDATE variantes SET talla, color, stock, precio_costo |
| | `variantes.routes.js:61-63` → `SELECT COUNT(*) FROM detalle_ventas WHERE id_variante = ?` para decidir DELETE vs UPDATE activa=0 |
| | `variantes.routes.js:65-66` → Actualización soft si tiene ventas: `activa = 0` |
| | `variantes.routes.js:69` → DELETE físico si no tiene ventas |

---

### RF-04: CRUD Colecciones

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/colecciones.routes.js:11-14` — GET listar todas ORDER BY anio DESC |
| | `colecciones.routes.js:17-26` — POST crear |
| | `colecciones.routes.js:29-37` — PUT actualizar (incluye campo archivada) |
| | `colecciones.routes.js:40-45` — DELETE: `UPDATE colecciones SET archivada = 1` (archivar) |
| **Frontend** | `frontend/src/pages/colecciones.jsx:19-24` — `cargar()` llama a `GET /api/colecciones` |
| | `colecciones.jsx:41-51` — `guardar()` para POST/PUT |
| | `colecciones.jsx:54-59` — `eliminar()` para DELETE (archivar) |
| **Endpoint** | `GET /api/colecciones`, `POST /api/colecciones`, `PUT /api/colecciones/:id`, `DELETE /api/colecciones/:id` |
| **Tabla(s)** | `colecciones` |
| **Evidencia exacta** | `colecciones.routes.js:12` → `SELECT * FROM colecciones ORDER BY anio DESC` |
| | `colecciones.routes.js:22` → INSERT con nombre, temporada, anio, descripcion |
| | `colecciones.routes.js:33-34` → UPDATE SET nombre, temporada, anio, descripcion, archivada |
| | `colecciones.routes.js:44` → `UPDATE colecciones SET archivada = 1 WHERE id_coleccion = ?` |

---

### RF-05: CRUD Proveedores

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/proveedores.routes.js:10-13` — GET listar |
| | `proveedores.routes.js:15-26` — POST crear (valida nombre obligatorio, duplicidad NIT) |
| | `proveedores.routes.js:28-37` — PUT actualizar (incluye activo) |
| | `proveedores.routes.js:39-44` — DELETE: `UPDATE proveedores SET activo = 0` |
| **Frontend** | `frontend/src/pages/proveedores.jsx:41-47` — `cargar()` llama a `GET /api/proveedores` |
| | `proveedores.jsx:81-101` — `guardar()` con validación del lado cliente |
| | `proveedores.jsx:103-113` — `toggleActivo()` para activar/desactivar |
| **Endpoint** | `GET /api/proveedores`, `POST /api/proveedores`, `PUT /api/proveedores/:id`, `DELETE /api/proveedores/:id` |
| **Tabla(s)** | `proveedores` |
| **Evidencia exacta** | `proveedores.routes.js:11` → `SELECT * FROM proveedores ORDER BY nombre` |
| | `proveedores.routes.js:20-21` → INSERT completo, manejo `ER_DUP_ENTRY` para NIT |
| | `proveedores.routes.js:32-33` → UPDATE completo con activo |
| | `proveedores.routes.js:43` → `UPDATE proveedores SET activo = 0` |

---

### RF-06: CRUD Clientes

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/clientes.routes.js:9-13` — GET listar |
| | `clientes.routes.js:15-26` — POST crear (nombre y documento obligatorios, manejo documento duplicado) |
| | `clientes.routes.js:28-37` — PUT actualizar (incluye activo) |
| | `clientes.routes.js:39-44` — DELETE: `UPDATE clientes SET activo = 0` |
| **Frontend** | `frontend/src/pages/clientes.jsx:42-48` — `cargar()` llama a `GET /api/clientes` |
| | `clientes.jsx:82-102` — `guardar()` con validación del lado cliente |
| | `clientes.jsx:123-133` — `toggleActivo()` |
| | `clientes.jsx:104-121` — `agregarSaldo()` llama a `POST /api/ventas/saldo-favor` |
| **Endpoint** | `GET /api/clientes`, `POST /api/clientes`, `PUT /api/clientes/:id`, `DELETE /api/clientes/:id` |
| **Tabla(s)** | `clientes` |
| **Evidencia exacta** | `clientes.routes.js:11` → `SELECT * FROM clientes ORDER BY nombre` |
| | `clientes.routes.js:20-21` → INSERT con nombre, documento, tipo_doc, telefono, email, preferencias |
| | `clientes.routes.js:32-33` → UPDATE completo con activo |
| | `clientes.routes.js:43` → `UPDATE clientes SET activo = 0 WHERE id_cliente = ?` |

---

### RF-07: CRUD Categorías

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/categorias.routes.js:8-11` — GET listar todas |
| | `categorias.routes.js:13-26` — POST crear categoría |
| | `categorias.routes.js:28-38` — PUT actualizar categoría |
| | `categorias.routes.js:40-50` — DELETE eliminar (validación de productos asociados) |
| **Frontend** | `frontend/src/pages/Categorias.jsx` — Página dedicada con cards, modal de creación/edición y confirmación de eliminación |
| | `frontend/src/pages/Productos.jsx:49` — Se usa en `cargarDatos()` como selector en formularios |
| | `frontend/src/App.jsx:25` — Ruta `/categorias` agregada |
| | `frontend/src/components/layout/Layout.jsx:9` — Menú "Categorías" agregado |
| **Endpoint** | `GET /api/categorias`, `POST /api/categorias`, `PUT /api/categorias/:id`, `DELETE /api/categorias/:id` |
| **Tabla(s)** | `categorias` |
| **Evidencia exacta** | `categorias.routes.js:9` → `SELECT * FROM categorias ORDER BY nombre` |
| | `categorias.routes.js:19-20` → INSERT con nombre, descripcion |
| | `categorias.routes.js:32-33` → UPDATE SET nombre, descripcion |
| | `categorias.routes.js:42-43` → SELECT COUNT productos asociados antes de DELETE |
| | `categorias.routes.js:46` → `DELETE FROM categorias WHERE id_categoria = ?` |

---

### RF-08: Registro de Compras con actualización de stock

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/compras.routes.js:8-19` — GET con JOIN a proveedores y usuarios |
| | `compras.routes.js:21-50` — POST con transacción: INSERT compra → INSERT detalle_compras → UPDATE variantes (stock +, precio_costo) |
| **Frontend** | `frontend/src/pages/compras.jsx:26-37` — `cargar()` con Promise.all GET /api/compras, /proveedores, /variantes |
| | `compras.jsx:48-68` — `agregarItem()` con validación de duplicados |
| | `compras.jsx:76-91` — `guardar()` envía POST /api/compras |
| **Endpoint** | `GET /api/compras`, `POST /api/compras` |
| **Tabla(s)** | `compras`, `detalle_compras`, `variantes`, `proveedores`, `usuarios` |
| **Evidencia exacta** | `compras.routes.js:11-18` → SELECT con JOIN proveedores y usuarios |
| | `compras.routes.js:25-28` → Transacción: `beginTransaction()` |
| | `compras.routes.js:35-37` → INSERT compra + INSERT detalle_compras |
| | `compras.routes.js:39-41` → `UPDATE variantes SET stock = stock + ?, precio_costo = ?` |
| | `compras.routes.js:44-45` → `commit()` y `rollback()` en catch |

---

### RF-09: Registro de Ventas con descuento de stock

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/ventas.routes.js:61-117` — POST con transacción, validaciones (stock, precio, descuento), INSERT venta, INSERT detalle_ventas, UPDATE variantes (stock -) |
| **Frontend** | `frontend/src/pages/ventas.jsx:44-58` — `cargar()` con Promise.all GET /api/ventas, /clientes, /variantes |
| | `ventas.jsx:70-97` — `agregarItem()` valida stock disponible en frontend |
| | `ventas.jsx:106-134` — `guardar()` valida descuento <= 50%, saldo suficiente, envía POST /api/ventas |
| **Endpoint** | `POST /api/ventas` |
| **Tabla(s)** | `ventas`, `detalle_ventas`, `variantes`, `clientes` |
| **Evidencia exacta** | `ventas.routes.js:62-64` → Transacción con `beginTransaction()` |
| | `ventas.routes.js:75-77` → `SELECT ... FOR UPDATE` (locks pesimista) sobre variante |
| | `ventas.routes.js:83-86` → Validación: `if (variante.stock < cantidad) throw` |
| | `ventas.routes.js:87-90` → Validación: `if (precio_venta < variante.precio_costo) throw` |
| | `ventas.routes.js:97-105` → Validación pago con saldo a favor |
| | `ventas.routes.js:113-116` → INSERT venta |
| | `ventas.routes.js:119-122` → INSERT detalle_ventas |
| | `ventas.routes.js:123-125` → `UPDATE variantes SET stock = stock - ?` |
| | `ventas.routes.js:127` → `commit()` |

---

### RF-10: JOIN de Ventas (detalle completo)

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/ventas.routes.js:8-27` — GET listar con JOIN a clientes y usuarios |
| | `ventas.routes.js:30-57` — GET /:id con JOIN a clientes, usuarios, detalle_ventas, variantes, productos |
| **Frontend** | `frontend/src/pages/ventas.jsx:162-167` — `verDetalle()` llama a `GET /api/ventas/:id` |
| | `ventas.jsx:387-464` — Modal detalle muestra cliente, vendedor, fecha, método pago, descuento, total, productos en tabla |
| **Endpoint** | `GET /api/ventas`, `GET /api/ventas/:id` |
| **Tabla(s)** | `ventas`, `clientes`, `usuarios`, `detalle_ventas`, `variantes`, `productos` |
| **Evidencia exacta** | `ventas.routes.js:12-19` → JOIN ventas + clientes + usuarios con filtro estado opcional |
| | `ventas.routes.js:32-40` → JOIN ventas + clientes + usuarios para encabezado |
| | `ventas.routes.js:44-50` → JOIN detalle_ventas + variantes + productos para líneas |
| | `ventas.routes.js:54` → `res.json({ ...venta[0], detalle })` — respuesta unificada |

---

### RF-11: Filtros en listados

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `productos.controller.js:8-33` — Filtros por `id_coleccion`, `id_categoria`, `stock_bajo` |
| | `ventas.routes.js:10-25` — Filtro por `estado` |
| | `variantes.routes.js:16-27` — Filtro por `id_producto` |
| **Frontend** | `Productos.jsx:78-85` — Input búsqueda + select categoría + select colección + checkbox stock bajo |
| | `ventas.jsx:197-215` — Tarjetas de estado filtrables |
| | `variantes.jsx:57-63` — Select filtro por producto |
| | `proveedores.jsx:115-118` — Búsqueda por nombre o NIT (lado cliente) |
| | `clientes.jsx:135-138` — Búsqueda por nombre o documento (lado cliente) |
| **Endpoint** | `GET /api/productos?coleccion=X&categoria=Y&stock_bajo=1`, `GET /api/ventas?estado=X`, `GET /api/variantes?id_producto=X` |
| **Tabla(s)** | `productos`, `variantes`, `ventas` |
| **Evidencia exacta** | `productos.controller.js:12-18` → WHERE params dinámicos con `id_coleccion` e `id_categoria` |
| | `productos.controller.js:24` → `HAVING stock_total <= 5` para stock_bajo |
| | `ventas.routes.js:13-14` → WHERE dinámico: `if (estado) { sql += ' AND v.estado = ?' }` |
| | `variantes.routes.js:20-21` → WHERE dinámico: `if (id_producto) { sql += ' AND v.id_producto = ?' }` |
| | `Productos.jsx:78-85` → Filtros visuales en frontend con selects + checkbox |

---

### RF-12: Reportes

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/reportes.routes.js:8-18` — GET /dashboard: COUNT ventas, SUM ingresos, COUNT productos activos, COUNT clientes activos, COUNT stock bajo |
| | `reportes.routes.js:21-35` — GET /mas-vendidos: Top 10 productos por unidades vendidas, JOIN detalle_ventas + ventas + variantes + productos + categorias |
| | `reportes.routes.js:38-52` — GET /ingresos-coleccion: Ingresos agrupados por colección, JOIN detalle_ventas + ventas + variantes + productos + colecciones |
| | `reportes.routes.js:67-82` — GET /por-periodo: Ventas filtradas por rango de fechas (desde/hasta), JOIN clientes + usuarios |
| | `reportes.routes.js:85-99` — GET /por-vendedor: Ventas agrupadas por usuario, ticket promedio |
| | `reportes.routes.js:102-117` — GET /por-cliente: Ventas agrupadas por cliente, última compra |
| | `reportes.routes.js:120-145` — GET /productos-sin-movimiento: Productos sin ventas, JOIN productos + variantes + LEFT JOIN detalle_ventas |
| | `reportes.routes.js:148-173` — GET /exportar: Exportación CSV de ventas con filtro de fechas |
| **Frontend** | `frontend/src/pages/Dashboard.jsx:20-34` — Carga los 3 endpoints principales |
| | `frontend/src/pages/reportes.jsx:16-88` — Carga los 8 endpoints, filtro de fechas, 6 paneles de reportes y botón exportar CSV |
| **Endpoint** | `GET /api/reportes/dashboard`, `GET /api/reportes/mas-vendidos`, `GET /api/reportes/ingresos-coleccion` |
| | `GET /api/reportes/por-periodo?desde=X&hasta=Y`, `GET /api/reportes/por-vendedor`, `GET /api/reportes/por-cliente` |
| | `GET /api/reportes/productos-sin-movimiento`, `GET /api/reportes/exportar?desde=X&hasta=Y` |
| **Tabla(s)** | `ventas`, `detalle_ventas`, `variantes`, `productos`, `categorias`, `colecciones`, `clientes`, `usuarios` |
| **Evidencia exacta** | `reportes.routes.js:10-16` → Dashboard: métricas principales |
| | `reportes.routes.js:24-33` → Top 10 más vendidos con JOIN 5 tablas |
| | `reportes.routes.js:40-50` → Ingresos por colección con JOIN 5 tablas |
| | `reportes.routes.js:75-80` → Por período: WHERE dinámico con fechas |
| | `reportes.routes.js:91-99` → Por vendedor: LEFT JOIN + GROUP BY + AVG ticket |
| | `reportes.routes.js:108-117` → Por cliente: LEFT JOIN + MAX fecha última compra |
| | `reportes.routes.js:126-142` → Sin movimiento: LEFT JOIN + HAVING unidades_vendidas = 0 |
| | `reportes.routes.js:155-170` → Exportar CSV: Content-Type text/csv + Content-Disposition attachment |

---

### RF-13: Gestión de estados de venta

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/ventas.routes.js:130-141` — `PUT /:id/estado` con validación de estados válidos |
| **Frontend** | `frontend/src/pages/ventas.jsx:136-148` — `cambiarEstado()` llama a `PUT /api/ventas/:id/estado` |
| | `ventas.jsx:407-428` — Botones de cambio de estado en modal detalle |
| **Endpoint** | `PUT /api/ventas/:id/estado` |
| **Tabla(s)** | `ventas` |
| **Evidencia exacta** | `ventas.routes.js:131-133` → `const estadosValidos = ['confirmada','en_entrega','entregada','anulada']` |
| | `ventas.routes.js:138` → `UPDATE ventas SET estado = ? WHERE id_venta = ?` |
| | `ventas.jsx:136-148` → `axios.put(${API}/ventas/${id}/estado, { estado })` |

---

### RF-14: Anulación de ventas con restauración de stock

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/ventas.routes.js:144-173` — `PUT /:id/anular` con transacción: verifica venta no anulada, restaura stock de cada item, restaura saldo si aplica, cambia estado a 'anulada' |
| **Frontend** | `frontend/src/pages/ventas.jsx:150-160` — `anular()` llama a `PUT /api/ventas/:id/anular` |
| | `ventas.jsx:468-490` — Modal de confirmación de anulación |
| **Endpoint** | `PUT /api/ventas/:id/anular` |
| **Tabla(s)** | `ventas`, `detalle_ventas`, `variantes`, `clientes` |
| **Evidencia exacta** | `ventas.routes.js:150-153` → SELECT venta + validación estado != 'anulada' |
| | `ventas.routes.js:155-159` → SELECT detalle + loop UPDATE variantes SET stock = stock + ? |
| | `ventas.routes.js:162-165` → Si método era 'saldo_favor', devuelve saldo al cliente |
| | `ventas.routes.js:167` → `UPDATE ventas SET estado = 'anulada'` |
| | `ventas.routes.js:168` → `commit()` con `rollback()` en error |

---

### RF-15: Saldo a favor del cliente

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/ventas.routes.js:176-188` — `POST /saldo-favor`: agrega monto al saldo del cliente |
| | `ventas.routes.js:96-106` — Validación y descuento de saldo al crear venta con método saldo_favor |
| **Frontend** | `frontend/src/pages/clientes.jsx:104-121` — `agregarSaldo()` modal para agregar saldo |
| | `clientes.jsx:307-337` — Modal saldo a favor |
| | `ventas.jsx:110-114` — Validación frontend de saldo suficiente |
| **Endpoint** | `POST /api/ventas/saldo-favor` |
| **Tabla(s)** | `clientes` |
| **Evidencia exacta** | `ventas.routes.js:97-106` → SELECT saldo_favor, comparación, `UPDATE clientes SET saldo_favor = saldo_favor - ?` |
| | `ventas.routes.js:162-165` → Restauración de saldo al anular: `UPDATE clientes SET saldo_favor = saldo_favor + ?` |
| | `ventas.routes.js:179-187` → `UPDATE clientes SET saldo_favor = saldo_favor + ?` (endpoint externo) |

---

### RF-16: CRUD Usuarios (solo admin)

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Backend** | `backend/src/routes/usuarios.routes.js:7-8` — Middleware `verificarToken` + `soloAdmin` en todas las rutas |
| | `usuarios.routes.js:10-17` — GET todos (excluye password_hash del SELECT) |
| | `usuarios.routes.js:19-30` — POST crear con bcrypt.hash |
| | `usuarios.routes.js:32-47` — PUT actualizar (con/sin cambio de password) |
| **Frontend** | `frontend/src/pages/usuarios.jsx:26-32` — `cargar()` llama a `GET /api/usuarios` |
| | `usuarios.jsx:48-74` — `guardar()` para POST/PUT |
| | `usuarios.jsx:76-86` — `toggleActivo()` |
| **Endpoint** | `GET /api/usuarios`, `POST /api/usuarios`, `PUT /api/usuarios/:id` |
| **Tabla(s)** | `usuarios` |
| **Evidencia exacta** | `usuarios.routes.js:7-8` → `router.use(verificarToken); router.use(soloAdmin)` |
| | `usuarios.routes.js:13` → `SELECT id_usuario, nombre, email, rol, activo, creado_en FROM usuarios` (sin password_hash) |
| | `usuarios.routes.js:24-25` → `INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?,?,?,?)` con bcrypt.hash |
| | `usuarios.routes.js:35-43` → UPDATE condicional: si password presente y >=6 chars, hashea y actualiza; si no, actualiza sin password |

---

## REGLAS DE NEGOCIO

### RN-01: No vender sin stock suficiente

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/routes/ventas.routes.js:75-86` — Verificación dentro de la transacción con FOR UPDATE |
| **Frontend** | `frontend/src/pages/ventas.jsx:81-84` — Validación previa antes de agregar item a la venta |
| **Evidencia exacta** | `ventas.routes.js:75-77` → `SELECT * FROM variantes WHERE id_variante = ? AND activa = 1 FOR UPDATE` (lock pesimista) |
| | `ventas.routes.js:83-86` → `if (variante.stock < cantidad) throw { status: 400, message: 'Stock insuficiente...' }` |
| | `ventas.jsx:81-84` → `if (Number(itemActual.cantidad) > variante.stock) { mostrarAlerta('Stock insuficiente...') }` |

---

### RN-02: Precio venta >= precio costo

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/routes/ventas.routes.js:87-90` — Validación dentro del ciclo de items |
| **Evidencia exacta** | `ventas.routes.js:87-90` → `if (precio_venta < variante.precio_costo) throw { status: 400, message: 'El precio de venta no puede ser menor al costo ($...)' }` |

---

### RN-03: No agregar productos a colección archivada

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/controllers/productos.controller.js:59-62` — Validación en la función `crear()` |
| **Evidencia exacta** | `productos.controller.js:60-62` → `SELECT archivada FROM colecciones WHERE id_coleccion = ?` + `if (col[0].archivada) return res.status(400).json({ error: 'No se pueden agregar productos a una colección archivada' })` |

---

### RN-04: No eliminar físicamente variantes con ventas

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/routes/variantes.routes.js:59-74` — Lógica de eliminación condicional |
| **Evidencia exacta** | `variantes.routes.js:61-64` → `SELECT COUNT(*) AS total FROM detalle_ventas WHERE id_variante = ?` |
| | `variantes.routes.js:65-67` → Si > 0: `UPDATE variantes SET activa = 0` (soft delete) |
| | `variantes.routes.js:69` → Si = 0: `DELETE FROM variantes WHERE id_variante = ?` (físico) |

---

### RN-05: Descuento máximo 50%

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/routes/ventas.routes.js:67` — Validación al inicio del POST |
| **Frontend** | `frontend/src/pages/ventas.jsx:109` — Validación previa en frontend |
| **Evidencia exacta** | `ventas.routes.js:67` → `if (descuento_pct > 50) throw { status: 400, message: 'El descuento no puede superar el 50%' }` |
| | `ventas.jsx:109` → `if (form.descuento_pct > 50) { mostrarAlerta('El descuento no puede superar el 50%', 'error'); return }` |
| | `ventas.jsx:305` → input `max="50"` |

---

## SEGURIDAD Y CONTROL DE ACCESO

### S-01: Middleware de autenticación JWT

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/middlewares/auth.middleware.js:1-24` — `verificarToken` extrae Bearer token, verifica JWT, inyecta `req.usuario` |
| **Evidencia exacta** | `auth.middleware.js:4-8` → Extrae token de header `authorization`, split Bearer |
| | `auth.middleware.js:12` → `jwt.verify(token, process.env.JWT_SECRET)` |
| | `auth.middleware.js:13` → `req.usuario = decoded` (contiene id_usuario, nombre, rol) |

---

### S-02: Middleware de rol admin

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Implementada |
| **Backend** | `backend/src/middlewares/auth.middleware.js:17-22` — `soloAdmin` verifica `req.usuario.rol === 'admin'` |
| **Uso** | `backend/src/routes/usuarios.routes.js:8` — Aplicado a todas las rutas de usuarios |
| **Evidencia exacta** | `auth.middleware.js:18-20` → `if (req.usuario?.rol !== 'admin') { return res.status(403).json({ error: 'Acceso solo para administradores' }) }` |
| | `usuarios.routes.js:7-8` → `router.use(verificarToken); router.use(soloAdmin)` |

---

### S-03: Protección de rutas en frontend

| Campo | Detalle |
|-------|---------|
| **Estado** | ✅ Cumple |
| **Frontend** | `frontend/src/components/layout/Layout.jsx:26-28` — `useEffect` verifica `token` y redirige a `/login` con `replace: true` si no hay sesión |
| **Evidencia exacta** | `Layout.jsx:26-28` → `useEffect(() => { if (!token) navigate('/login', { replace: true }) }, [token])` |
| | `Layout.jsx:24` → Ahora importa `token` del contexto: `const { usuario, token, logout } = useAuth()` |

---

## RESUMEN DE CUMPLIMIENTO

### Porcentaje real por categoría

| Categoría | Total reqs. | Cumple | Parcial | No cumple | % |
|-----------|:-----------:|:------:|:-------:|:---------:|:-:|
| Funcionales (RF) | 16 | 16 | 0 | 0 | **100%** |
| Reglas de negocio (RN) | 5 | 5 | 0 | 0 | **100%** |
| Seguridad (S) | 3 | 3 | 0 | 0 | **100%** |
| **TOTAL GENERAL** | **24** | **24** | **0** | **0** | **100%** |

### Requisitos completados el 21/06/2026

| ID | Requisito | Estado anterior | Cambio realizado |
|:--:|-----------|:---------------:|------------------|
| RF-07 | CRUD Categorías | ⚠️ Parcial → ✅ | Agregados POST, PUT, DELETE en backend. Nueva página `Categorias.jsx` con frontend completo. Ruta y menú agregados. |
| RF-12 | Reportes | ⚠️ Parcial → ✅ | Agregados 5 nuevos endpoints: por período, por vendedor, por cliente, productos sin movimiento, exportación CSV. Frontend actualizado con filtros y 6 paneles. |
| S-03 | Protección de rutas frontend | ❌ No cumple → ✅ | `Layout.jsx` ahora verifica `token` vía `useEffect` y redirige a `/login` si no hay sesión. |

### Porcentaje real de cumplimiento general

> **100%** (24/24 requisitos cumplidos completamente — 0 parciales, 0 no cumplidos)
