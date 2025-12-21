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
  registrarUsuarioPublico
} from "../controllers/usuarios.controller.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware.js";

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
router.post("/registro", registrarUsuarioPublico);

/* =======================================
   RUTAS PROTEGIDAS
   ======================================= */

// Actualizar mi propio perfil (Cualquier rol logueado)
router.put("/perfil", verifyToken, actualizarPerfil);

/* =======================================
   RUTAS DE ADMINISTRADOR (Seguridad Extra)
   ======================================= */

// Activar usuario (Solo admin)
router.patch("/:id/activar", verifyToken, verifyAdmin, activarUsuario);

// Crear usuario (Admin)
router.post("/", verifyToken, verifyAdmin, crearUsuario);

// Listar todos los usuarios (Admin puede ver todo, o usuarios ver lista básica, aquí restringimos o dejamos verifyToken según necesidad. Dejamos verifyToken general por ahora, pero las acciones de edición son las críticas)
router.get("/", verifyToken, listarUsuarios);

// Obtener un usuario por ID
router.get("/:id", verifyToken, obtenerUsuario);

// Editar usuario (Solo admin) - EVITA ESCALADO DE PRIVILEGIOS
router.put("/:id", verifyToken, verifyAdmin, editarUsuario);

// Desactivar usuario (Solo admin)
router.patch("/:id/desactivar", verifyToken, verifyAdmin, desactivarUsuario);

export default router;