# Documentación Técnica - Proyecto Simtexx

## 1. Arquitectura del Sistema
El sistema utiliza una arquitectura **Cliente-Servidor (REST API)** desacoplada:

* **Frontend:** Aplicación de Página Única (SPA) construida con **React 19** y empaquetada con **Vite**. Consume la API mediante `fetch` y gestiona el estado con Hooks de React.
* **Backend:** API RESTful construida con **Node.js** y **Express**. Gestiona la lógica de negocio, autenticación y comunicación con la base de datos.
* **Base de Datos:** **PostgreSQL** relacional. Utiliza Triggers para la auditoría de fechas.
* **Servicios Externos:**
    * **Cloudinary:** Para el almacenamiento de archivos adjuntos (imágenes/documentos) en los comentarios.
    * **Render (Target de Despliegue):** Configuración de base de datos preparada para SSL en producción.

---

## 2. Backend (`/backend`)

### 2.1 Estructura de Directorios y Archivos Clave
* **`src/app.js`**: Punto de entrada. Configura CORS, parseo JSON, rutas base (`/api`) y sirve estáticos de `/uploads`.
* **`src/db.js`**: Módulo de conexión a base de datos usando `pg`. Detecta el entorno (`NODE_ENV`) para habilitar SSL (`rejectUnauthorized: false`) requerido en Render.
* **`src/routes/`**: Define los endpoints de la API.
    * `ot.routes.js`: Rutas CRUD para Órdenes de Trabajo, estadísticas y exportación.
    * `usuarios.routes.js`: Rutas para gestión de usuarios, login y registro público.
    * `comentarios.routes.js`: Manejo de bitácora con subida de archivos (Multer + Cloudinary).
* **`src/controllers/`**: Lógica de negocio.
    * `ot.controller.js`: Contiene lógica compleja como la importación masiva desde CSV (`importOTs`) y el borrado lógico (`deleteOT`) que actualiza `activo = FALSE`.
    * `usuarios.controller.js`: Maneja el hash de contraseñas (`bcryptjs`) y la generación de tokens (`jsonwebtoken`).

### 2.2 Seguridad y Autenticación
* **JWT (JSON Web Token):** Se utiliza para proteger rutas privadas. El middleware `auth.middleware.js` verifica el token en el header `Authorization: Bearer <token>`.
* **Roles:** El sistema implementa autorización basada en roles (Middleware `verifyAdmin` para rutas sensibles).
    * Rol 1: Administrador.
    * Rol 2: Cliente.
    * Rol 3: Mantenedor.

---

## 3. Frontend (`/frontend`)

### 3.1 Tecnologías y Estructura
* **Vite:** Herramienta de construcción y servidor de desarrollo.
* **React Router v7:** Maneja el enrutamiento (`src/routes.jsx`). Incluye rutas protegidas mediante `ProtectedRoute.jsx` que verifica la existencia y validez del token.
* **Estilos:** Uso de CSS modular y global (`global.css`, `Formularios.css`).

### 3.2 Comunicación con la API (`src/services/`)
* `otService.js`: Centraliza las peticiones a `/api/ot`. Maneja la descarga de archivos (Blobs) para reportes PDF/CSV y la inyección automática de headers de autenticación.
* `usuariosService.js`: Gestiona login, registro y CRUD de usuarios.

### 3.3 Funcionalidades Clave
* **Dashboard (`Dashboard.jsx`):** Muestra estadísticas (calculadas en backend) y un resumen de las últimas OTs.
* **Detalle de OT (`DetalleOT.jsx`):** Vista integral que permite:
    * Ver información del contrato.
    * Descargar reportes PDF.
    * Visualizar historial de auditoría (tabla `auditorias`).
    * Gestionar la bitácora de comentarios con soporte para adjuntos.

---

## 4. Base de Datos

### 4.1 Esquema Relacional
El sistema se basa en 5 tablas principales definidas en `creacion con triggers.sql`:
1.  **`roles`**: Definición de perfiles.
2.  **`usuarios`**: Credenciales y datos de perfil.
3.  **`ot`**: Órdenes de trabajo (Cabecera).
4.  **`comentarios`**: Detalle/Bitácora asociada a una OT.
5.  **`auditorias`**: Registro de acciones del sistema.

### 4.2 Automatización (Triggers y Funciones)
* **Actualización de Fechas:** Triggers `update_usuarios`, `update_ot` y `update_comentarios` mantienen actualizados los campos `fecha_actualizacion` y `fecha_edicion` automáticamente.
* **Desactivación Lógica:** Función `desactivar_ot` para manejo de soft-delete y registro en auditoría.
