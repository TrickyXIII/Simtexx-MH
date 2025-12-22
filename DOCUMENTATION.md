# Documentación Técnica - Simtexx

Este documento detalla la arquitectura, decisiones de diseño y flujo de datos del sistema Simtexx.

## 1. Arquitectura del Sistema

Simtexx utiliza una arquitectura **Cliente-Servidor desacoplada (REST API)**.

* **Frontend (SPA):** Construido en React, se encarga de la interfaz de usuario, validaciones visuales y consumo de la API. Se comunica con el backend mediante `fetch` asíncrono utilizando JWT para la autorización.
* **Backend (API REST):** Node.js con Express. Actúa como capa lógica, protegiendo la base de datos y gestionando la integración con servicios de terceros (Cloudinary).
* **Base de Datos:** PostgreSQL relacional. Utiliza procedimientos almacenados (Triggers) para garantizar la integridad de las fechas de auditoría.

---

## 2. Base de Datos y Modelo de Datos

El esquema se encuentra definido en `bases de datos/base_de_datos.sql`.

### Tablas Principales
1.  **`roles`**: Define los niveles de acceso (1: Admin, 2: Cliente, 3: Mantenedor).
2.  **`usuarios`**: Almacena credenciales (`password_hash`), datos personales y estado (`activo`).
3.  **`ot` (Orden de Trabajo)**: Tabla central.
    * `codigo`: Identificador único generado por algoritmo (Ej: OT-123456).
    * `responsable_id`: FK a usuario técnico.
    * `cliente_id`: FK a usuario cliente.
    * `activo`: Booleano para Soft Delete (Borrado lógico).
4.  **`comentarios`**: Bitácora de la OT.
    * Relación 1:N con `ot`.
    * `imagen_url`: Almacena el link seguro provisto por Cloudinary.
5.  **`auditorias`**: Tabla de logs inmutables. Registra `quién`, `qué`, `cuándo` y `desde dónde (IP)` se realizó una acción crítica.

### Automatización (Triggers)
Se implementaron triggers en PostgreSQL (`update_usuarios`, `update_ot`, `update_comentarios`) que actualizan automáticamente el campo `fecha_actualizacion` o `fecha_edicion` al modificar un registro, garantizando precisión temporal sin depender del backend.

---

## 3. Backend (`/backend`)

### 3.1 Seguridad y Autenticación
* **JWT:** El sistema no utiliza sesiones de servidor. Al hacer login (`auth.controller.js`), se firma un token que contiene `{id, rol, nombre}`.
* **Middleware (`auth.middleware.js`):**
    * `verifyToken`: Intercepta cada petición protegida, valida la firma del token y decodifica el usuario en `req.user`.
    * `verifyAdmin`: Middleware adicional para rutas sensibles (crear usuarios, borrar OTs) que verifica `req.user.rol_id === 1`.
* **CORS:** Configurado para aceptar peticiones desde el Frontend (Local y Producción).

### 3.2 Gestión de Archivos (Cloudinary)
En `src/controllers/comentarios.routes.js` y `src/app.js`:
* Se utiliza `multer` para procesar `multipart/form-data`.
* `multer-storage-cloudinary` sube el archivo directamente a la nube y retorna la URL segura, evitando almacenar archivos en el sistema de archivos del servidor (lo cual es efímero en Render).

### 3.3 Generación de Reportes
* **PDF (`pdf.controller.js`):** Utiliza `pdfkit` para dibujar un documento vectorial on-the-fly con los datos de la OT y su historial de comentarios. Ajusta manualmente las zonas horarias a GMT-3.
* **Excel (`excel.controller.js`):** Utiliza `exceljs` para crear hojas de cálculo con estilos y formato tabular.

---

## 4. Frontend (`/frontend`)

### 4.1 Estructura y Enrutamiento
* **`routes.jsx`**: Define las rutas públicas (`/login`, `/registro`) y privadas.
* **`ProtectedRoute.jsx`**: Componente de orden superior que verifica la existencia y validez (fecha de expiración) del token en `localStorage` antes de renderizar el contenido.

### 4.2 Servicios (`src/services/`)
Para mantener el código limpio, toda la lógica de `fetch` se centraliza aquí:
* **Inyección de Headers:** Funciones auxiliares añaden automáticamente `Authorization: Bearer <token>` a cada petición.
* **Manejo de Errores:** Si la API retorna 401/403, el servicio puede forzar el cierre de sesión local.

### 4.3 Componentes Clave
* **`Dashboard.jsx`**: Muestra estadísticas calculadas en tiempo real por el endpoint `/api/ot/stats`, filtrando según el rol del usuario (un Cliente solo ve sus estadísticas).
* **`DetalleOT.jsx`**: Vista compleja que combina:
    * Datos de la OT.
    * Lista de adjuntos (filtrando por extensión para mostrar iconos o imágenes).
    * Bitácora de comentarios.
    * Historial de auditoría (visible solo para Admin/Mantenedor).

---

## 5. Decisiones de Despliegue (Render)

### Adaptaciones para Producción
1.  **SSL en Base de Datos:** En `src/db.js`, se detecta `process.env.NODE_ENV === 'production'` para habilitar `ssl: { rejectUnauthorized: false }`, requisito obligatorio para conectar Node.js con Postgres en Render.
2.  **Variables de Entorno:** Se eliminaron todas las credenciales *hardcodeadas*, dependiendo estrictamente de `process.env`.
3.  **SPA Rewrite:** Se configuró el servidor estático de Render para redirigir todas las rutas a `index.html`, permitiendo que React Router maneje la navegación (evita errores 404 al recargar).
