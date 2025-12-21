# Simtexx - Gestión de Órdenes de Trabajo 

[![Deploy en Render](https://img.shields.io/badge/Live-Demo-brightgreen)](https://simtexx-frontend-lxf4.onrender.com/dashboard)
![Status](https://img.shields.io/badge/Status-Prototipo--TRL4-orange)
![Tech](https://img.shields.io/badge/Stack-Node.js%20%7C%20PostgreSQL%20%7C%20React-blue)

**Simtexx** es un prototipo funcional desarrollado para centralizar y optimizar el seguimiento de **Órdenes de Trabajo (OT)**. El sistema permite a clientes y usuarios internos visualizar el estado de sus requerimientos en tiempo real, garantizando trazabilidad y seguridad en la información operativa.

---

## 🔗 Demo en Vivo
Puedes acceder al dashboard del prototipo aquí:  
👉 [Simtexx en Render](https://simtexx-frontend-lxf4.onrender.com/dashboard)

## 🚀 Características del Proyecto

- **Seguridad JWT:** Autenticación robusta con JSON Web Tokens para roles de *Administrador* y *Trabajador*.
- **Gestión de Ciclo de Vida de OT:** Creación, edición, visualización y desactivación de órdenes.
- **Bitácora de Comentarios:** En lugar de integraciones externas complejas (como Trimble Connect), el prototipo utiliza un sistema interno de comentarios para mantener el historial de cada orden.
- **Exportación de Datos:** Funcionalidad para generar reportes en formatos PDF y CSV.
- **Validación TRL 4:** El prototipo ha sido validado en un entorno de pruebas con datos simulados de clientes y operaciones.

## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite
- **Backend:** Node.js + Express (Corriendo en puerto 4000)
- **Base de Datos:** PostgreSQL
- **Seguridad:** JWT (JSON Web Tokens)
- **Hosting:** Render

## 📂 Estructura y Modificaciones Recientes
El proyecto ha pasado por una fase de optimización detallada:
- Corrección de rutas de exportación (PDF/CSV).
- Limpieza de constantes duplicadas en `otService.js`.
- Ajuste de lógica en el Dashboard para la correcta visualización de roles y estados.

## 👥 Equipo de Desarrollo (Scrum)
*Ingeniería en Informática / Analista Programador*

- **Integrantes:** Stephany de la Cruz, Martín Henríquez, Osmán Gallardo, Sebastián Miranda, y demás que luego mostraran su valía.
- **Profesor:** Sebastián Francisco Callejas Díaz.

## ⚙️ Instalación Local

1. **Clonar:** `git clone https://github.com/TrickyXIII/Simtexx-MH.git`
2. **Backend:** Instalar dependencias con `npm install` y configurar el `.env` con las credenciales de PostgreSQL.
3. **Frontend:** ```bash
   cd frontend
   npm install
   npm run dev´´´




























---------




# Simtexx
Proyecto Simtexx

para iniciar proyecto =>

1) Clonar el repositorio

git clone ...



(2) Crear su propio .env en backend: 

PORT=4000

DATA_BASEURL= esto sera enviado por wsp




(3) Instalar dependencias y correr backend + frontend

Backend:


cd backend

npm install

npm run dev


Frontend:


cd frontend

npm install

npm run dev





para las modificaciones desde el frontend se debe usar el build:

1.- modificar su tarea y guardar (todo esto en el frontend)

2.- en el cdm con ruta a la carpeta frontend : npm run build

3.- se crea la carpeta dist/ copiar y pegar en el backend -> carpeta frontend

4.- probar npm run dev en el backend. 

¡¡NOTA SOLO CUANDO ESTA COMPLETA LA TAREA TODO SE PUEDE DEPURAR DESDE EL LOCALHOST:5173 !!
