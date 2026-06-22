# Modelo Relacional

## 1. Descripción

El modelo relacional se deriva directamente del modelo entidad-relación presentado anteriormente. Cada entidad se convierte en una tabla, y las relaciones se representan mediante llaves foráneas. A continuación se presenta la estructura detallada de cada tabla del sistema ModaTrend.

## 2. Esquema de tablas

### 2.1 Tabla: `categorias`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_categoria | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único de la categoría |
| nombre | VARCHAR(80) | `NOT NULL`, `UNIQUE` | Nombre de la categoría |
| descripcion | VARCHAR(255) | `DEFAULT NULL` | Descripción de la categoría |

**Cardinalidad:** 1 a N con la tabla `productos`.

---

### 2.2 Tabla: `colecciones`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_coleccion | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único de la colección |
| nombre | VARCHAR(100) | `NOT NULL` | Nombre de la colección |
| temporada | ENUM('primavera-verano','otoño-invierno','crucero','resort') | `NOT NULL` | Temporada de la colección |
| anio | YEAR(4) | `NOT NULL` | Año de la colección |
| archivada | TINYINT(1) | `DEFAULT 0` | Indica si la colección está archivada |
| descripcion | TEXT | `DEFAULT NULL` | Descripción de la colección |
| creado_en | DATETIME | `DEFAULT current_timestamp()` | Fecha de creación |

**Cardinalidad:** 1 a N con la tabla `productos`.

---

### 2.3 Tabla: `productos`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_producto | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único del producto |
| referencia | VARCHAR(50) | `NOT NULL`, `UNIQUE` | Código de referencia del producto |
| nombre | VARCHAR(150) | `NOT NULL` | Nombre del producto |
| descripcion | TEXT | `DEFAULT NULL` | Descripción del producto |
| precio_base | DECIMAL(10,2) | `NOT NULL` | Precio base de venta |
| id_categoria | INT(11) | `NOT NULL`, `FK -> categorias(id_categoria)` | Categoría del producto |
| id_coleccion | INT(11) | `NOT NULL`, `FK -> colecciones(id_coleccion)` | Colección del producto |
| activo | TINYINT(1) | `DEFAULT 1` | Estado activo/inactivo |
| creado_en | DATETIME | `DEFAULT current_timestamp()` | Fecha de creación |

**Llaves foráneas:**
- `id_categoria` referencia a `categorias(id_categoria)` con restricción `ON DELETE RESTRICT`.
- `id_coleccion` referencia a `colecciones(id_coleccion)` con restricción `ON DELETE RESTRICT`.

**Cardinalidad:** N a 1 con `categorias`, N a 1 con `colecciones`, 1 a N con `variantes`.

---

### 2.4 Tabla: `variantes`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_variante | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único de la variante |
| id_producto | INT(11) | `NOT NULL`, `FK -> productos(id_producto)` | Producto al que pertenece |
| talla | VARCHAR(10) | `NOT NULL` | Talla de la variante |
| color | VARCHAR(50) | `NOT NULL` | Color de la variante |
| stock | INT(11) | `DEFAULT 0` | Cantidad en inventario |
| precio_costo | DECIMAL(10,2) | `DEFAULT 0.00` | Precio de adquisición |
| activa | TINYINT(1) | `DEFAULT 1` | Estado activo/inactivo |

**Restricción única:** `UNIQUE KEY uq_variante (id_producto, talla, color)` — no pueden existir dos variantes con el mismo producto, talla y color.

**Llave foránea:**
- `id_producto` referencia a `productos(id_producto)`.

**Cardinalidad:** N a 1 con `productos`, N a N con `compras` (mediante `detalle_compras`), N a N con `ventas` (mediante `detalle_ventas`).

---

### 2.5 Tabla: `proveedores`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_proveedor | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único del proveedor |
| nombre | VARCHAR(150) | `NOT NULL` | Nombre del proveedor |
| nit | VARCHAR(30) | `DEFAULT NULL`, `UNIQUE` | NIT del proveedor |
| contacto | VARCHAR(100) | `DEFAULT NULL` | Persona de contacto |
| telefono | VARCHAR(20) | `DEFAULT NULL` | Teléfono del proveedor |
| email | VARCHAR(150) | `DEFAULT NULL` | Correo electrónico |
| direccion | VARCHAR(255) | `DEFAULT NULL` | Dirección del proveedor |
| activo | TINYINT(1) | `DEFAULT 1` | Estado activo/inactivo |
| creado_en | DATETIME | `DEFAULT current_timestamp()` | Fecha de creación |

**Cardinalidad:** 1 a N con la tabla `compras`.

---

### 2.6 Tabla: `compras`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_compra | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único de la compra |
| id_proveedor | INT(11) | `NOT NULL`, `FK -> proveedores(id_proveedor)` | Proveedor de la compra |
| id_usuario | INT(11) | `NOT NULL`, `FK -> usuarios(id_usuario)` | Usuario que registró la compra |
| fecha | DATETIME | `DEFAULT current_timestamp()` | Fecha y hora de la compra |
| total | DECIMAL(12,2) | `DEFAULT 0.00` | Valor total de la compra |
| observaciones | TEXT | `DEFAULT NULL` | Notas adicionales |

**Llaves foráneas:**
- `id_proveedor` referencia a `proveedores(id_proveedor)`.
- `id_usuario` referencia a `usuarios(id_usuario)`.

**Cardinalidad:** N a 1 con `proveedores`, N a 1 con `usuarios`, 1 a N con `detalle_compras`.

---

### 2.7 Tabla: `detalle_compras`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_detalle | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único del detalle |
| id_compra | INT(11) | `NOT NULL`, `FK -> compras(id_compra)` | Compra asociada |
| id_variante | INT(11) | `NOT NULL`, `FK -> variantes(id_variante)` | Variante comprada |
| cantidad | INT(11) | `NOT NULL` | Cantidad comprada |
| precio_costo | DECIMAL(10,2) | `NOT NULL` | Precio de costo unitario |

**Llaves foráneas:**
- `id_compra` referencia a `compras(id_compra)`.
- `id_variante` referencia a `variantes(id_variante)`.

**Cardinalidad:** N a 1 con `compras`, N a 1 con `variantes`.

---

### 2.8 Tabla: `clientes`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_cliente | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único del cliente |
| nombre | VARCHAR(150) | `NOT NULL` | Nombre completo del cliente |
| documento | VARCHAR(30) | `NOT NULL`, `UNIQUE` | Número de documento de identidad |
| tipo_doc | ENUM('CC','CE','NIT','PAS') | `DEFAULT 'CC'` | Tipo de documento |
| telefono | VARCHAR(20) | `DEFAULT NULL` | Teléfono del cliente |
| email | VARCHAR(150) | `DEFAULT NULL` | Correo electrónico |
| preferencias | TEXT | `DEFAULT NULL` | Preferencias de compra |
| saldo_favor | DECIMAL(12,2) | `DEFAULT 0.00` | Saldo a favor disponible |
| activo | TINYINT(1) | `DEFAULT 1` | Estado activo/inactivo |
| creado_en | DATETIME | `DEFAULT current_timestamp()` | Fecha de registro |

**Cardinalidad:** 1 a N con la tabla `ventas`.

---

### 2.9 Tabla: `ventas`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_venta | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único de la venta |
| id_cliente | INT(11) | `NOT NULL`, `FK -> clientes(id_cliente)` | Cliente que realiza la compra |
| id_usuario | INT(11) | `NOT NULL`, `FK -> usuarios(id_usuario)` | Vendedor que atiende la venta |
| fecha | DATETIME | `DEFAULT current_timestamp()` | Fecha y hora de la venta |
| descuento_pct | DECIMAL(5,2) | `DEFAULT 0.00` | Porcentaje de descuento |
| total_bruto | DECIMAL(12,2) | `DEFAULT 0.00` | Total antes del descuento |
| total_neto | DECIMAL(12,2) | `DEFAULT 0.00` | Total después del descuento |
| estado | ENUM('confirmada','en_entrega','entregada','anulada') | `DEFAULT 'confirmada'` | Estado del pedido |
| metodo_pago | ENUM('efectivo','tarjeta','credito','saldo_favor') | `DEFAULT 'efectivo'` | Método de pago |
| observaciones | TEXT | `DEFAULT NULL` | Notas adicionales |

**Llaves foráneas:**
- `id_cliente` referencia a `clientes(id_cliente)`.
- `id_usuario` referencia a `usuarios(id_usuario)`.

**Cardinalidad:** N a 1 con `clientes`, N a 1 con `usuarios`, 1 a N con `detalle_ventas`.

---

### 2.10 Tabla: `detalle_ventas`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_detalle | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único del detalle |
| id_venta | INT(11) | `NOT NULL`, `FK -> ventas(id_venta)` | Venta asociada |
| id_variante | INT(11) | `NOT NULL`, `FK -> variantes(id_variante)` | Variante vendida |
| cantidad | INT(11) | `NOT NULL` | Cantidad vendida |
| precio_venta | DECIMAL(10,2) | `NOT NULL` | Precio de venta unitario |

**Llaves foráneas:**
- `id_venta` referencia a `ventas(id_venta)`.
- `id_variante` referencia a `variantes(id_variante)`.

**Cardinalidad:** N a 1 con `ventas`, N a 1 con `variantes`.

---

### 2.11 Tabla: `usuarios`

| Atributo | Tipo | Restricciones | Descripción |
|----------|------|---------------|-------------|
| id_usuario | INT(11) | `PRIMARY KEY`, `AUTO_INCREMENT` | Identificador único del usuario |
| nombre | VARCHAR(100) | `NOT NULL` | Nombre completo del usuario |
| email | VARCHAR(150) | `NOT NULL`, `UNIQUE` | Correo electrónico (login) |
| password_hash | VARCHAR(255) | `NOT NULL` | Hash de la contraseña (bcrypt) |
| rol | ENUM('admin','vendedor') | `DEFAULT 'vendedor'` | Rol del usuario |
| activo | TINYINT(1) | `DEFAULT 1` | Estado activo/inactivo |
| creado_en | DATETIME | `DEFAULT current_timestamp()` | Fecha de creación |

**Cardinalidad:** 1 a N con `compras`, 1 a N con `ventas`.

## 3. Resumen de relaciones entre tablas

| Tabla Origen | Tabla Destino | Tipo | Campo FK |
|-------------|---------------|------|----------|
| productos | categorias | N:1 | id_categoria |
| productos | colecciones | N:1 | id_coleccion |
| variantes | productos | N:1 | id_producto |
| compras | proveedores | N:1 | id_proveedor |
| compras | usuarios | N:1 | id_usuario |
| detalle_compras | compras | N:1 | id_compra |
| detalle_compras | variantes | N:1 | id_variante |
| ventas | clientes | N:1 | id_cliente |
| ventas | usuarios | N:1 | id_usuario |
| detalle_ventas | ventas | N:1 | id_venta |
| detalle_ventas | variantes | N:1 | id_variante |
