# Simtexx - Sistema de Gestión de Órdenes de Trabajo (SaaS)

![Status](https://img.shields.io/badge/Status-Producción-green)
![Stack](https://img.shields.io/badge/Stack-PERN%20(Postgres_Express_React_Node)-blue)
![Deploy](https://img.shields.io/badge/Deploy-Render-black)

**Simtexx** es una plataforma integral para la gestión, seguimiento y auditoría de Órdenes de Trabajo (OT). Diseñada para empresas de ingeniería y servicios, permite la interacción entre Administradores, Mantenedores (Técnicos) y Clientes, garantizando trazabilidad completa y almacenamiento de evidencias en la nube.

---

## 🚀 Demo en Vivo
El proyecto se encuentra desplegado y funcional en Render:
🔗 **[Acceder a Simtexx](https://simtexx-frontend-lxf4.onrender.com/)**

🔗 **[Backend](https://simtexx-backend.onrender.com/)**

---

## ✨ Características Principales

* **Seguridad Robusta:** Autenticación vía JWT (JSON Web Tokens) y contraseñas hasheadas con Bcrypt.
* **Roles de Usuario:**
    * **Admin:** Control total, auditoría, gestión de usuarios y OTs.
    * **Cliente:** Vista exclusiva de sus OTs y creación de solicitudes.
    * **Mantenedor:** Gestión de OTs asignadas.
* **Gestión de OTs:** Ciclo de vida completo (Pendiente, En Proceso, Finalizada), asignación de responsables y fechas contrato.
* **Bitácora Multimedia:** Sistema de comentarios con soporte para subir imágenes y documentos (almacenados en **Cloudinary**).
* **Reportabilidad:**
    * Exportación de OTs individuales a **PDF** (con bitácora).
    * Exportación masiva a **Excel/CSV**.
    * Importación masiva de OTs desde CSV.
* **Auditoría Global:** Registro inmutable de acciones críticas (Creación, Edición, Eliminación lógica).

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 19, Vite, React Router v7, CSS Modules.
* **Backend:** Node.js, Express, Multer.
* **Base de Datos:** PostgreSQL (con Triggers para auditoría de fechas).
* **Almacenamiento:** Cloudinary (Gestión de archivos estáticos).
* **Infraestructura:** Render (Web Service + Static Site + Managed Postgres).

---

## ☁️ Guía de Despliegue en Render (Producción)

Este proyecto está configurado para desplegarse en Render separando el Backend del Frontend.

### Requisitos previos
1.  Cuenta en [Render.com](https://render.com).
2.  Cuenta en [Cloudinary.com](https://cloudinary.com) (para obtener `Cloud Name`, `API Key`, `API Secret`).

### Paso 1: Base de Datos (PostgreSQL)
1.  En Render, crea un nuevo **PostgreSQL**.
2.  Copia la `Internal Database URL` (para uso interno del backend).
3.  Conéctate a la DB (usando DBeaver o pgAdmin con la URL externa) y ejecuta el script `base-de-datos/creacion con triggers.sql` incluido en el repositorio para crear las tablas.

### Paso 2: Backend (Web Service)
1.  Crea un **Web Service** en Render conectado a este repositorio.
2.  **Root Directory:** `backend`
3.  **Build Command:** `npm install`
4.  **Start Command:** `node src/app.js`
5.  **Environment Variables (Configuración):**

| Clave | Valor (Ejemplo) |
| :--- | :--- |
| `DB_USER` | (Usuario de tu DB Render) |
| `DB_PASSWORD` | (Contraseña de tu DB Render) |
| `DB_HOST` | (Host interno de tu DB Render) |
| `DB_DATABASE` | (Nombre de tu DB Render) |
| `DB_PORT` | `5432` |
| `JWT_SECRET` | `una_clave_secreta_y_larga` |
| `CLOUDINARY_CLOUD_NAME` | (Tu Cloud Name) |
| `CLOUDINARY_API_KEY` | (Tu API Key) |
| `CLOUDINARY_API_SECRET` | (Tu API Secret) |
| `NODE_ENV` | `production` |

### Paso 3: Frontend (Static Site)
1.  Crea un **Static Site** en Render.
2.  **Root Directory:** `frontend`
3.  **Build Command:** `npm install && npm run build`
4.  **Publish Directory:** `dist`
5.  **Environment Variables:**
    * `VITE_API_URL`: `https://tu-backend-en-render.onrender.com` (La URL del servicio creado en el Paso 2).
6.  **IMPORTANTE:** En la pestaña "Redirects/Rewrites", añade una regla para que React Router funcione al recargar la página:
    * **Source:** `/*`
    * **Destination:** `/index.html`
    * **Action:** `Rewrite`

---

## 💻 Instalación Local (Desarrollo)

Si deseas ejecutar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone (https://github.com/TrickyXIII/Simtexx-MH.git)
    ```

2.  **Configurar Backend:**
    ```bash
    cd backend
    npm install
    # Crear archivo .env con las credenciales (ver tabla arriba)
    npm run dev
    ```

3.  **Configurar Frontend:**
    ```bash
    cd frontend
    npm install
    # Crear archivo .env.local
    # VITE_API_URL=http://localhost:4000
    npm run dev
    ```

4.  **Base de Datos Local:**
    Asegúrate de tener PostgreSQL instalado y ejecutar los scripts SQL ubicados en `/base-de-datos`.

---
