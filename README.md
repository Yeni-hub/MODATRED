# 👗 ModaTrend — Sistema de Gestión para Tienda de Ropa

**ModaTrend** es un sistema ERP web desarrollado para la gestión administrativa y operativa de una tienda de ropa y accesorios. Permite controlar inventarios, productos con variantes (talla y color), colecciones por temporada, proveedores, compras, clientes, ventas y usuarios, todo con un dashboard interactivo y reportes dinámicos.

---

## 🖥️ Tecnologías utilizadas

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19.x | Biblioteca de UI |
| Vite | 8.x | Bundler y dev server |
| React Router DOM | 7.x | Enrutamiento SPA |
| Axios | 1.x | Cliente HTTP |
| React Hook Form | 7.x | Manejo de formularios |

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Node.js | 20+ | Entorno de ejecución |
| Express | 4.x | Framework web |
| MySQL (MariaDB) | 10.4 | Base de datos relacional |
| mysql2 | 3.x | Conexión a MySQL (promises) |
| JWT (jsonwebtoken) | 9.x | Autenticación |
| bcryptjs | 2.x | Hash de contraseñas |
| Helmet | 7.x | Seguridad HTTP |
| express-validator | 7.x | Validación de datos |
| Morgan | 1.x | Logging HTTP |

---

## 📁 Estructura del proyecto

```
modatrend/
├── backend/                          # API REST (Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Pool de conexiones MySQL
│   │   │   └── modatrend.sql         # Esquema + datos de prueba
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Lógica de autenticación
│   │   │   └── productos.controller.js  # CRUD de productos
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js     # JWT + roles
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── productos.routes.js
│   │   │   ├── categorias.routes.js
│   │   │   ├── colecciones.routes.js
│   │   │   ├── variantes.routes.js
│   │   │   ├── proveedores.routes.js
│   │   │   ├── clientes.routes.js
│   │   │   ├── ventas.routes.js
│   │   │   ├── compras.routes.js
│   │   │   ├── reportes.routes.js
│   │   │   └── usuarios.routes.js
│   │   ├── validators/
│   │   │   └── auth.validator.js
│   │   └── index.js                  # Punto de entrada
│   ├── .env                          # Variables de entorno
│   └── package.json
│
├── frontend/                         # SPA (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── TopProductosWidget.jsx
│   │   │   │   └── IngresosColeccionWidget.jsx
│   │   │   ├── layout/
│   │   │   │   └── Layout.jsx
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── DataTable.jsx
│   │   │       ├── MetricCard.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── SectionHeader.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Productos.jsx
│   │   │   ├── Categorias.jsx
│   │   │   ├── Colecciones.jsx
│   │   │   ├── Variantes.jsx
│   │   │   ├── Proveedores.jsx
│   │   │   ├── Compras.jsx
│   │   │   ├── Clientes.jsx
│   │   │   ├── Ventas.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   └── Reportes.jsx
│   │   ├── services/
│   │   │   └── api.js                # Axios con JWT interceptor
│   │   ├── styles/
│   │   │   └── tokens.js             # Sistema de diseño
│   │   ├── App.jsx                   # Enrutador
│   │   └── main.jsx                  # Entry point
│   ├── .env
│   └── package.json
│
└── docs/                             # Documentación académica
    ├── INTRODUCCION.md
    ├── ANALISIS_PROBLEMA.md
    ├── MER.md
    ├── MODELO_RELACIONAL.md
    ├── BASE_DE_DATOS.md
    ├── MODULOS.md
    ├── ARQUITECTURA_MVC.md
    ├── EVIDENCIAS.md
    └── CONCLUSIONES.md
```

---

## ⚙️ Instalación y ejecución

### Prerrequisitos

- Node.js 20+
- MySQL / MariaDB 10.4+
- NPM

### 1. Clonar el repositorio

```bash
git clone https://github.com/Yeni-hub/MODATRED.git
cd MODATRED
```

### 2. Base de datos

```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE modatrend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar el esquema y datos de prueba
mysql -u root -p modatrend < backend/src/config/modatrend.sql
```

### 3. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar el archivo .env con tus credenciales:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=modatrend
# JWT_SECRET=tu_clave_secreta
# JWT_EXPIRES_IN=8h
# PORT=4000

# Iniciar servidor (modo desarrollo)
npm run dev
```

### 4. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 5. Acceder al sistema

```
Frontend: http://localhost:5173
Backend:  http://localhost:4000
API Docs: http://localhost:4000/api/health
```

### Credenciales de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@modatrend.com | (consultar hash en BD) | admin |
| ana@modatrend.com | (consultar hash en BD) | vendedor |

> **Nota:** Las contraseñas están almacenadas como hash de bcrypt. Para obtener la contraseña en texto plano, es necesario configurar el sistema con contraseñas conocidas durante el proceso de instalación o mediante el registro de nuevos usuarios.

---

## 🔌 Endpoints principales de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/productos` | Listar productos |
| POST | `/api/productos` | Crear producto |
| GET | `/api/variantes` | Listar variantes |
| POST | `/api/ventas` | Registrar venta |
| PUT | `/api/ventas/:id/anular` | Anular venta |
| GET | `/api/reportes/dashboard` | KPIs del dashboard |
| GET | `/api/reportes/mas-vendidos` | Top productos |
| GET | `/api/reportes/tendencia-mensual` | Tendencia de ventas |
| GET | `/api/reportes/exportar` | Exportar CSV |

---

## 🗄️ Base de datos (11 tablas)

| Tabla | Tipo | Descripción |
|-------|------|-------------|
| `categorias` | Maestra | Clasificación de productos |
| `colecciones` | Maestra | Agrupación por temporada |
| `productos` | Maestra | Catálogo de productos |
| `variantes` | Detalle | Talla/color/stock |
| `proveedores` | Maestra | Proveedores |
| `compras` | Transaccional | Órdenes de compra |
| `detalle_compras` | Transitiva | Variantes por compra |
| `clientes` | Maestra | Clientes |
| `ventas` | Transaccional | Ventas realizadas |
| `detalle_ventas` | Transitiva | Variantes por venta |
| `usuarios` | Maestra | Usuarios del sistema |

---

## 👤 Roles de usuario

| Rol | Acceso |
|-----|--------|
| **admin** | Todos los módulos, incluyendo gestión de usuarios |
| **vendedor** | Ventas, clientes, productos, dashboard, reportes |

---

## 📄 Licencia

Este proyecto es desarrollado con fines académicos y educativos.

## 👩‍💻 Autora

**Yennifer Padilla**  
Repositorio: [https://github.com/Yeni-hub/MODATRED](https://github.com/Yeni-hub/MODATRED)
