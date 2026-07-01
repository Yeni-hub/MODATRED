# 👗 ModaTrend — Sistema de Gestión de Inventario y Ventas

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Git](https://img.shields.io/badge/Git-2.0-F05032?logo=git&logoColor=white)

---

## 📖 Descripción

**ModaTrend** es un sistema web full-stack para la gestión integral de tiendas de ropa y accesorios. Permite administrar inventario, ventas, compras, clientes, proveedores y generar reportes analíticos, todo desde una interfaz moderna e intuitiva.

Resuelve los problemas comunes de las tiendas de moda:
- **Control de inventario** con variantes por talla y color
- **Registro de ventas** con validación de stock en tiempo real
- **Gestión de colecciones** por temporada
- **Reportes de negocio** con dashboards dinámicos
- **Control de usuarios** con roles (admin/vendedor)

---

## ✨ Características

- ✅ Autenticación segura con JWT + CSRF
- ✅ Dashboard interactivo con métricas en tiempo real
- ✅ CRUD completo de productos con variantes (talla/color)
- ✅ Gestión de colecciones por temporada
- ✅ Registro de ventas con transacciones y control de stock
- ✅ Registro de compras a proveedores
- ✅ Administración de clientes con saldo a favor
- ✅ Catálogo de proveedores
- ✅ Reportes analíticos (productos más vendidos, ingresos por colección, ventas por período/vendedor/cliente)
- ✅ Alertas de stock bajo y productos sin movimiento
- ✅ Historial de actividad reciente
- ✅ Roles de usuario (admin/vendedor)
- ✅ Interfaz responsive con tema moderno
- ✅ Protección CSRF y sanitización de inputs
- ✅ Rate limiting en rutas sensibles
- ✅ Exportación de ventas a CSV

---

## 🛠 Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19 | Interfaz de usuario |
| **Vite** | 8 | Bundler y dev server |
| **React Router** | 7 | Enrutamiento SPA |
| **React Hook Form** | 7 | Manejo de formularios |
| **Axios** | 1 | Cliente HTTP |
| **Node.js** | 20 | Runtime backend |
| **Express** | 4.19 | Framework backend |
| **MySQL** | 8 | Base de datos relacional |
| **JWT** | 9 | Autenticación |
| **bcryptjs** | 2 | Hash de contraseñas |
| **Helmet** | 7 | Seguridad HTTP |
| **express-rate-limit** | 8 | Límite de peticiones |
| **express-validator** | 7 | Validación de datos |
| **xss** | 1 | Sanitización de inputs |

---

## 🏗 Arquitectura

El sistema sigue una arquitectura **MVC (Model-View-Controller)** con frontend y backend desacoplados:

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────┐
│   React (SPA)   │ ◄────► │  API Express     │ ◄────► │  MySQL  │
│   localhost:5173 │  HTTP  │  localhost:4000  │  SQL   │         │
└─────────────────┘  JSON  └──────────────────┘       └─────────┘
```

### Backend (API REST)

```
backend/
├── src/
│   ├── config/        # Conexión DB, seed, SQL schema
│   ├── controllers/   # Lógica de negocio
│   ├── middlewares/    # Auth, CSRF, sanitize, error handler
│   ├── routes/        # Definición de rutas
│   └── validators/    # Validación con express-validator
│   └── index.js       # Punto de entrada
├── .env               # Variables de entorno
└── package.json
```

### Frontend (SPA React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/    # Componentes reutilizables (widgets)
│   │   ├── layout/    # Layout, sidebar, navegación
│   │   └── ui/        # Atomic UI (Button, Modal, Badge, etc.)
│   ├── context/       # AuthContext global
│   ├── hooks/         # Custom hooks (useApi, useFetch)
│   ├── pages/         # Páginas del sistema
│   ├── services/      # Configuración de Axios
│   ├── styles/        # Tokens de diseño
│   └── utils/         # Helpers (format, safeArray)
├── .env               # Variables de entorno
└── package.json
```

---

## ⚙️ Instalación

### Prerrequisitos

- Node.js 20+
- MySQL 8+
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/modatrend.git
cd modatrend
```

### 2. Configurar la base de datos

```bash
# Accede a MySQL y crea la base de datos
mysql -u root -p
CREATE DATABASE modatrend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Importa el esquema y datos iniciales
mysql -u root -p modatrend < backend/src/config/modatrend.sql
```

### 3. Configurar backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de MySQL
npm install
npm run seed    # Crea usuarios iniciales
npm run dev     # Inicia servidor en http://localhost:4000
```

### 4. Configurar frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # Inicia servidor en http://localhost:5173
```

### 5. Acceder al sistema

- **URL:** http://localhost:5173
- **Admin:** admin@modatrend.com / Admin123!
- **Vendedor:** ana@modatrend.com / Vendedor1!

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=modatrend
DB_SSL=false
JWT_SECRET=genera_un_secreto_seguro_de_32_o_mas_caracteres
JWT_EXPIRES_IN=8h
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

---

## 📸 Capturas de pantalla

| Dashboard | Productos |
|---|---|
| `[Próximamente]` | `[Próximamente]` |

| Ventas | Reportes |
|---|---|
| `[Próximamente]` | `[Próximamente]` |

---

## 📡 API

### Autenticación

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Iniciar sesión | No |
| `GET` | `/api/auth/me` | Obtener usuario actual | JWT |
| `POST` | `/api/auth/logout` | Cerrar sesión | No |

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/productos` | Listar productos (filtros: `id_categoria`, `id_coleccion`, `stock_bajo`, `page`, `limit`) |
| `GET` | `/api/productos/:id` | Obtener producto con variantes |
| `POST` | `/api/productos` | Crear producto |
| `PUT` | `/api/productos/:id` | Actualizar producto |
| `DELETE` | `/api/productos/:id` | Desactivar producto |

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/categorias` | Listar categorías |
| `POST` | `/api/categorias` | Crear categoría |
| `PUT` | `/api/categorias/:id` | Actualizar categoría |
| `DELETE` | `/api/categorias/:id` | Eliminar categoría |

### Colecciones

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/colecciones` | Listar colecciones |
| `POST` | `/api/colecciones` | Crear colección |
| `PUT` | `/api/colecciones/:id` | Actualizar colección |
| `DELETE` | `/api/colecciones/:id` | Archivar colección |

### Variantes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/variantes` | Listar variantes (filtro: `id_producto`) |
| `POST` | `/api/variantes` | Crear variante |
| `PUT` | `/api/variantes/:id` | Actualizar variante |
| `DELETE` | `/api/variantes/:id` | Desactivar variante |

### Clientes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/clientes` | Listar clientes |
| `POST` | `/api/clientes` | Crear cliente |
| `PUT` | `/api/clientes/:id` | Actualizar cliente |
| `DELETE` | `/api/clientes/:id` | Desactivar cliente |

### Proveedores

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/proveedores` | Listar proveedores |
| `POST` | `/api/proveedores` | Crear proveedor |
| `PUT` | `/api/proveedores/:id` | Actualizar proveedor |
| `DELETE` | `/api/proveedores/:id` | Desactivar proveedor |

### Ventas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/ventas` | Listar ventas (filtro: `estado`) |
| `GET` | `/api/ventas/:id` | Obtener venta con detalle |
| `POST` | `/api/ventas` | Registrar venta (transaccional) |
| `PUT` | `/api/ventas/:id/estado` | Actualizar estado del pedido |
| `PUT` | `/api/ventas/:id/anular` | Anular venta y restaurar stock |
| `POST` | `/api/ventas/saldo-favor` | Agregar saldo a favor a cliente |

### Compras

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/compras` | Listar compras |
| `POST` | `/api/compras` | Registrar compra |

### Usuarios (solo admin)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/usuarios` | Listar usuarios |
| `POST` | `/api/usuarios` | Crear usuario |
| `PUT` | `/api/usuarios/:id` | Actualizar usuario |

### Reportes

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/reportes/dashboard` | Resumen del dashboard |
| `GET` | `/api/reportes/mas-vendidos` | Top 10 productos más vendidos |
| `GET` | `/api/reportes/ingresos-coleccion` | Ingresos agrupados por colección |
| `GET` | `/api/reportes/por-periodo` | Ventas por rango de fechas |
| `GET` | `/api/reportes/por-vendedor` | Ventas agrupadas por vendedor |
| `GET` | `/api/reportes/por-cliente` | Ventas agrupadas por cliente |
| `GET` | `/api/reportes/productos-sin-movimiento` | Productos sin ventas |
| `GET` | `/api/reportes/exportar` | Exportar ventas a CSV |
| `GET` | `/api/reportes/ventas-recientes` | Últimas ventas |
| `GET` | `/api/reportes/tendencia-mensual` | Tendencia de ventas |
| `GET` | `/api/reportes/resumen-inventario` | Resumen de inventario |
| `GET` | `/api/reportes/alertas-stock` | Alertas detalladas de stock |
| `GET` | `/api/reportes/colecciones-activas` | Colecciones activas |
| `GET` | `/api/reportes/actividad-reciente` | Actividad reciente del sistema |

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Verificar estado del servidor |

---

## 🗄 Base de Datos

### Modelo Entidad-Relación

El sistema cuenta con **11 tablas** interconectadas:

```
┌───────────────┐    ┌──────────────────┐
│   usuarios    │    │   productos      │
├───────────────┤    ├──────────────────┤
│ id_usuario (PK)│    │ id_producto (PK) │
│ nombre        │◄───│ referencia (UQ)  │
│ email (UQ)    │    │ nombre           │
│ password_hash │    │ precio_base      │
│ rol           │    │ id_categoria (FK)│──► categorias
│ activo        │    │ id_coleccion(FK) │──► colecciones
│ creado_en     │    │ activo           │
└───────┬───────┘    └────────┬─────────┘
        │                     │
        │   ┌─────────────────┘
        │   │
   ┌────▼───▼──────────┐    ┌──────────────────┐
   │     ventas        │    │    variantes     │
   ├───────────────────┤    ├──────────────────┤
   │ id_venta (PK)     │    │ id_variante (PK) │
   │ id_cliente (FK)───┼───►│ id_producto (FK) │──► productos
   │ id_usuario (FK)───┘    │ talla            │
   │ fecha                │ color            │
   │ total_bruto          │ stock            │
   │ total_neto           │ precio_costo     │
   │ descuento_pct        │ activa           │
   │ estado               └────────┬──────────┘
   │ metodo_pago                   │
   └───────┬───────────────────────┘
           │
    ┌──────▼──────────┐    ┌──────────────────────┐
    │ detalle_ventas   │    │   detalle_compras    │
    ├─────────────────┤    ├──────────────────────┤
    │ id_detalle (PK)  │    │ id_detalle (PK)      │
    │ id_venta (FK)    │    │ id_compra (FK)       │
    │ id_variante (FK) │    │ id_variante (FK)     │
    │ cantidad         │    │ cantidad             │
    │ precio_venta     │    │ precio_costo         │
    └──────────────────┘    └──────────────────────┘

┌───────────────┐    ┌──────────────────┐
│   clientes    │    │   proveedores    │
├───────────────┤    ├──────────────────┤
│ id_cliente(PK)│    │ id_proveedor (PK)│
│ documento (UQ)│    │ nit (UQ)         │
│ nombre        │    │ nombre           │
│ saldo_favor   │    │ contacto         │
│ activo        │    │ activo           │
└───────────────┘    └──────────────────┘
```

### Relaciones principales

- **Productos** pertenece a una **Categoría** y una **Colección**
- **Variantes** son las combinaciones talla/color de un **Producto**
- **Ventas** asocian un **Cliente** con un **Usuario** (vendedor)
- **Detalle_Ventas** vincula cada ítem de la venta con su **Variante**
- **Compras** asocian un **Proveedor** con un **Usuario**
- **Detalle_Compras** vincula cada ítem de compra con su **Variante**

---

## 🚀 Próximas mejoras

- [ ] Módulo de facturación electrónica
- [ ] Notificaciones por email (stock bajo, nuevas ventas)
- [ ] Panel de análisis con gráficos (Chart.js / Recharts)
- [ ] Modo oscuro completo
- [ ] Subida de imágenes para productos
- [ ] Historial de precios por producto
- [ ] Exportación de reportes a PDF
- [ ] PWA (Progressive Web App) para uso offline
- [ ] Pruebas unitarias y de integración (Jest, Cypress)
- [ ] Despliegue automatizado con Docker

---

## 👩‍💻 Autor

**Yennifer Padilla** — Proyecto de portafolio.

---

_Desarrollado con ❤️ para la gestión eficiente de tiendas de moda._
