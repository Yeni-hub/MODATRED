# Análisis del problema

## 1. Contexto de la tienda ModaTrend

ModaTrend es una tienda de ropa y accesorios que comercializa productos textiles con un enfoque en colecciones por temporada (primavera-verano, otoño-invierno, crucero, resort). Cada producto puede tener múltiples variantes definidas por talla y color, lo que genera una complejidad considerable en la gestión del inventario.

La tienda maneja un catálogo de productos organizados por categorías (Blusas, Pantalones, Vestidos, Accesorios, Calzado) y colecciones, y requiere controlar compras a proveedores, ventas a clientes, y el seguimiento del estado de los pedidos.

## 2. Situación problema

Antes de la implementación del sistema, la tienda enfrentaba las siguientes problemáticas:

- **Gestión manual del inventario**: el control de existencias se llevaba en hojas de cálculo, lo que generaba errores humanos, datos desactualizados y falta de trazabilidad.
- **Dificultad para gestionar variantes**: al tener productos con múltiples tallas y colores, el seguimiento individualizado del stock era complejo y propenso a inexactitudes.
- **Procesos de venta no estandarizados**: las ventas se registraban de forma manual, sin un flujo definido que validara el stock disponible, los precios mínimos o los descuentos aplicables.
- **Ausencia de indicadores**: no existía un panel de control que permitiera visualizar métricas clave como ventas del día, ingresos del mes, productos más vendidos o alertas de stock bajo.
- **Información dispersa**: los datos de clientes, proveedores, productos y ventas se encontraban en archivos separados sin integración entre sí, lo que dificultaba la toma de decisiones.
- **Control de usuarios inexistente**: cualquier persona podía acceder a la información sin autenticación ni diferenciación de roles (administrador vs. vendedor).

## 3. Necesidades identificadas

A partir del análisis de la situación problemática, se identificaron las siguientes necesidades:

1. **Autenticación y control de acceso**: implementar un sistema de inicio de sesión con roles diferenciados (admin, vendedor) que restrinja el acceso según el perfil del usuario.
2. **Gestión integral de productos**: permitir crear, editar, listar y desactivar productos con referencia única, asociados a una categoría y una colección.
3. **Gestión de variantes**: administrar tallas, colores, stock y precio de costo por cada variante de producto.
4. **Control de inventario**: registrar compras a proveedores que actualicen automáticamente el stock y el precio de costo de las variantes.
5. **Proceso de ventas**: registrar ventas con validación de stock suficiente, precio mínimo de venta (no menor al costo), descuentos controlados (máximo 50%), y múltiples métodos de pago.
6. **Dashboard con indicadores**: mostrar en tiempo real las ventas del día, ingresos del mes, productos activos, alertas de stock bajo, productos más vendidos y tendencias.
7. **Reportes y exportación**: generar reportes de ventas por período, vendedor, cliente y colección, con opción de exportación a CSV.
8. **Registro de actividad**: mantener un historial de las transacciones realizadas (ventas, compras, anulaciones, nuevos clientes).

## 4. Objetivos del sistema

### Objetivo general

Desarrollar un sistema de información web para la gestión administrativa y operativa de la tienda ModaTrend que permita centralizar, automatizar y controlar los procesos de inventario, compras, ventas y generación de reportes.

### Objetivos específicos

1. Implementar un módulo de autenticación seguro mediante JWT y bcryptjs.
2. Desarrollar un módulo de productos con categorización y asignación a colecciones.
3. Implementar la gestión de variantes (talla, color, stock, precio costo).
4. Crear un módulo de compras que actualice automáticamente el inventario.
5. Desarrollar un módulo de ventas con validaciones de stock, precio y descuentos.
6. Construir un dashboard interactivo con KPIs, gráficos de tendencias y alertas.
7. Implementar reportes dinámicos con filtros por período, vendedor y cliente.
8. Proveer un sistema de roles y permisos para administradores y vendedores.

## 5. Beneficios de implementar el sistema

| Beneficio | Descripción |
|-----------|-------------|
| Centralización de datos | Toda la información de productos, variantes, stock, clientes, proveedores y ventas en una sola base de datos. |
| Automatización del inventario | Las compras incrementan el stock automáticamente; las ventas lo decrementan en tiempo real. |
| Trazabilidad completa | Cada transacción (venta, compra, anulación) queda registrada con fecha, usuario responsable y detalle. |
| Toma de decisiones informada | El dashboard y los reportes proporcionan métricas actualizadas para la gestión del negocio. |
| Control de acceso seguro | Autenticación mediante JWT con expiración y roles diferenciados (admin, vendedor). |
| Reducción de errores | Validaciones automáticas: stock suficiente, precio mínimo, descuento máximo, referencia única. |
| Eficiencia operativa | Los procesos de venta y compra se realizan en pocos pasos con interfaces intuitivas. |
| Escalabilidad | La arquitectura MVC y el diseño modular permiten agregar nuevas funcionalidades fácilmente. |

## 6. Identificación de entidades principales

A partir del análisis del dominio, se identificaron las siguientes entidades principales:

| Entidad | Descripción |
|---------|-------------|
| **Usuarios** | Personas que acceden al sistema con roles de administrador o vendedor. |
| **Productos** | Ítems del catálogo con referencia, nombre, precio base, categoría y colección. |
| **Categorías** | Clasificación de productos (Blusas, Pantalones, Vestidos, etc.). |
| **Colecciones** | Agrupación de productos por temporada y año (Otoño 2024, Primavera 2026, etc.). |
| **Variantes** | Versiones de un producto definidas por talla, color, stock y precio de costo. |
| **Proveedores** | Empresas que suministran productos a la tienda. |
| **Compras** | Transacciones de adquisición de inventario a proveedores. |
| **Detalle de compras** | Registro de las variantes compradas en cada transacción. |
| **Clientes** | Personas que realizan compras en la tienda. |
| **Ventas** | Transacciones de venta a clientes. |
| **Detalle de ventas** | Registro de las variantes vendidas en cada transacción. |

### Relaciones entre entidades

- Una **Categoría** puede tener muchos **Productos** (1:N).
- Una **Colección** puede tener muchos **Productos** (1:N).
- Un **Producto** puede tener muchas **Variantes** (1:N).
- Un **Proveedor** puede tener muchas **Compras** (1:N).
- Un **Usuario** puede registrar muchas **Compras** y **Ventas** (1:N).
- Un **Cliente** puede realizar muchas **Ventas** (1:N).
- Una **Compra** puede incluir muchas **Variantes** a través de **Detalle de compras** (N:M).
- Una **Venta** puede incluir muchas **Variantes** a través de **Detalle de ventas** (N:M).
