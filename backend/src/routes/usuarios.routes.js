import { Router } from "express";
import { pool } from "../db.js";
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  editarUsuario,
  desactivarUsuario,
  activarUsuario,
  actualizarPerfil,
  loginUsuario,
  registrarUsuarioPublico // <--- IMPORTADO
} from "../controllers/usuarios.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

/* =======================================
   RUTAS AUXILIARES (Para Selectores)
   ======================================= */

// Filtro para mantenedores (Protegido)
router.get("/mantenedores", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_usuarios, nombre
      FROM usuarios
      WHERE rol_id = 3 AND activo = TRUE
      ORDER BY nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en /mantenedores:", error);
    res.status(500).json({ error: "Error al obtener responsables" });
  }
});

// Filtro clientes (Protegido)
router.get("/clientes", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_usuarios, nombre
      FROM usuarios
      WHERE rol_id = 2 AND activo = TRUE
      ORDER BY nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en /clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

/* =======================================
   RUTAS PÚBLICAS (Login y Registro)
   ======================================= */
router.post("/login", loginUsuario);
router.post("/registro", registrarUsuarioPublico); // <--- NUEVA RUTA PÚBLICA

/* =======================================
   RUTAS PROTEGIDAS (Requieren Login)
   ======================================= */

// Actualizar mi propio perfil (Cualquier rol)
router.put("/perfil", verifyToken, actualizarPerfil);

// Activar usuario (Solo admin)
router.patch("/:id/activar", verifyToken, activarUsuario);

// Crear usuario (Admin)
router.post("/", verifyToken, crearUsuario);

// Listar todos los usuarios
router.get("/", verifyToken, listarUsuarios);

// Obtener un usuario por ID
router.get("/:id", verifyToken, obtenerUsuario);

// Editar usuario
router.put("/:id", verifyToken, editarUsuario);

// Desactivar usuario
router.patch("/:id/desactivar", verifyToken, desactivarUsuario);

export default router;