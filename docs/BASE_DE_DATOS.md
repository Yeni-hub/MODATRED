# Base de Datos

## 1. Sistema Gestor de Base de Datos (SGBD)

El sistema ModaTrend utiliza **MySQL** como motor de base de datos, específicamente **MariaDB 10.4.32**, ejecutándose en un entorno local (`127.0.0.1`).

| Propiedad | Valor |
|-----------|-------|
| SGBD | MySQL / MariaDB |
| Versión | 10.4.32-MariaDB |
| Base de datos | `modatrend` |
| Juego de caracteres | `utf8mb4` |
| Collation | `utf8mb4_unicode_ci` |
| Puerto | 3306 |

## 2. Conexión a la base de datos

La conexión se realiza mediante el paquete `mysql2` de Node.js en su modo `promise`, lo que permite operaciones asíncronas con `async/await`.

### 2.1 Archivo de configuración

**Archivo:** `backend/src/config/db.js`

```javascript
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  port:             process.env.DB_PORT     || 3306,
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'modatrend',
  waitForConnections: true,
  connectionLimit:  10,
});
```

### 2.2 Variables de entorno

Las credenciales de conexión se definen en el archivo `.env` del backend:

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `DB_HOST` | localhost | Host del servidor MySQL |
| `DB_PORT` | 3306 | Puerto de conexión |
| `DB_USER` | root | Usuario de base de datos |
| `DB_PASSWORD` | (vacío) | Contraseña del usuario |
| `DB_NAME` | modatrend | Nombre de la base de datos |

### 2.3 Pool de conexiones

Se utiliza un **pool de conexiones** con los siguientes parámetros:

- **Límite de conexiones simultáneas:** 10
- **Espera por conexión:** `waitForConnections: true`

El pool se prueba al iniciar el servidor mediante `pool.getConnection()`, verificando que la conexión a MySQL sea exitosa. En caso de error, el servidor se detiene con `process.exit(1)`.

## 3. Estructura de la base de datos

La base de datos `modatrend` contiene **11 tablas**:

| # | Tabla | Tipo | Descripción |
|---|-------|------|-------------|
| 1 | `categorias` | Maestra | Clasificación de productos |
| 2 | `colecciones` | Maestra | Agrupación por temporada/año |
| 3 | `productos` | Maestra | Catálogo de productos |
| 4 | `variantes` | Detalle | Variantes por talla y color |
| 5 | `proveedores` | Maestra | Proveedores registrados |
| 6 | `compras` | Transaccional | Órdenes de compra |
| 7 | `detalle_compras` | Transitiva | Variantes por compra |
| 8 | `clientes` | Maestra | Clientes registrados |
| 9 | `ventas` | Transaccional | Ventas realizadas |
| 10 | `detalle_ventas` | Transitiva | Variantes por venta |
| 11 | `usuarios` | Maestra | Usuarios del sistema |

## 4. Archivo SQL

El script completo de creación de la base de datos se encuentra en:

```
backend/src/config/modatrend.sql
```

Este archivo contiene:

- `CREATE TABLE` para cada una de las 11 tablas.
- Definición de `PRIMARY KEY`, `UNIQUE KEY` y `FOREIGN KEY`.
- `AUTO_INCREMENT` con los valores iniciales.
- Datos de prueba (`INSERT INTO`) para las tablas maestras.

## 5. Datos de prueba cargados

La base de datos incluye los siguientes datos de prueba:

### Usuarios

| ID | Nombre | Email | Rol | Contraseña (hash bcrypt) |
|----|--------|-------|-----|--------------------------|
| 1 | Administrador | admin@modatrend.com | admin | `$2b$10$yKZKtPoyaL0Ch.lUA5aOXOSqzhnVK20nZSZDuaksxivuu4q2YjGoi` |
| 2 | Ana Garcia | ana@modatrend.com | vendedor | `$2b$10$85REneg9vizzt7xjt9q5T.Nsc9mHmx54ODcu40ijruQTnc/Kiyk7O` |
| 3 | Yennifer Padilla | yeni@modatrend.com | vendedor | `$2a$10$4uU5Imqgqsqh2mN9UoaPkeSLZZHAEnUL4npbS/nmHIpMzp3OCc.Oe` |

### Categorías

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | Blusas | Blusas y tops de mujer |
| 2 | Pantalones | Pantalones y leggings |
| 3 | Vestidos | Vestidos casuales y formales |
| 4 | Accesorios | Bolsos, cinturones y bisutería |
| 5 | Calzado | Zapatos y sandalias |

### Colecciones

| ID | Nombre | Temporada | Año |
|----|--------|-----------|-----|
| 1 | Colección Rosa 2025 | otoño-invierno | 2025 |
| 2 | Otoño Dorado 2024 | otoño-invierno | 2024 |
| 3 | Crucero Caribe 2026 | primavera-verano | 2026 |

### Proveedores

| ID | Nombre | NIT | Contacto |
|----|--------|-----|----------|
| 1 | Textiles Colombia SAS | 900123456-1 | Carlos Ruiz |
| 2 | Moda Import Ltda | 800987654-2 | Luisa |

### Clientes

| ID | Nombre | Documento | Tipo Doc | Teléfono |
|----|--------|-----------|----------|----------|
| 1 | María García | 52456789 | CC | 3156789012 |
| 2 | Sofía Martínez | 1023456789 | CC | 3204567890 |
| 3 | Andrea López | 65432198 | CC | 3012345678 |
| 4 | Omar Galindo | 1234567897 | CC | 3122455667 |

### Productos

| ID | Referencia | Nombre | Precio Base | Categoría | Colección |
|----|-----------|--------|-------------|-----------|-----------|
| 1 | ACC01 | Body | $10,800.00 | Blusas | Crucero Caribe 2026 |
