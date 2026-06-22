# Introducción

## 1.1 Propósito del documento

El presente documento constituye la documentación técnica y académica del sistema **ModaTrend**, un aplicativo web desarrollado para la gestión administrativa y operativa de una tienda de ropa y accesorios. Este informe está dirigido a desarrolladores, administradores del sistema y usuarios finales, y tiene como objetivo describir de manera completa la estructura, funcionalidades y arquitectura del software implementado.

## 1.2 Descripción del sistema

ModaTrend es un sistema de información de tipo **ERP (Enterprise Resource Planning)** enfocado en el rubro textil y de moda. Permite gestionar inventarios, productos con variantes (talla y color), colecciones por temporada, proveedores, compras, clientes, ventas y usuarios. El sistema cuenta con un panel de control (dashboard) con indicadores clave de rendimiento (KPI), gráficos de tendencias y alertas de stock.

## 1.3 Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 |
| Backend | Node.js + Express 4 |
| Base de datos | MySQL (MariaDB 10.4) |
| Autenticación | JWT + bcryptjs |
| ORM / Conexión | mysql2 (pool de conexiones) |
| HTTP Client | Axios |
| Enrutamiento | React Router DOM v7 |

## 1.4 Organización del documento

El documento se estructura en los siguientes capítulos:

- **Análisis del problema**: contexto, situación actual, necesidades, objetivos y beneficios.
- **Modelo Entidad-Relación**: entidades del sistema y sus relaciones.
- **Modelo Relacional**: esquema de tablas, atributos, llaves y cardinalidades.
- **Base de datos**: SGBD, conexión, pool y datos de prueba.
- **Módulos del sistema**: descripción funcional de cada módulo implementado.
- **Arquitectura MVC**: estructura del backend y frontend, diagramas de arquitectura.
- **Evidencias de funcionamiento**: registro visual del sistema en operación.
- **Conclusiones**: resultados, limitaciones y trabajo futuro.

## 1.5 Convenciones del documento

A lo largo del informe se utilizan los siguientes formatos:

- `Código`: para referencias a archivos, fragmentos de código y comandos.
- **Negrita**: para términos clave y nombres de módulos.
- *Cursiva*: para énfasis en conceptos importantes.
