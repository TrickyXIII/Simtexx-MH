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
router.get("/mantenedores", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id_usuarios, nombre FROM usuarios WHERE rol_id = 3 AND activo = TRUE ORDER BY nombre ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener responsables" });
  }
});

router.get("/clientes", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id_usuarios, nombre FROM usuarios WHERE rol_id = 2 AND activo = TRUE ORDER BY nombre ASC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

/* =======================================
   RUTAS PÚBLICAS
   ======================================= */
router.post("/login", loginUsuario);
router.post("/registro", registrarUsuarioPublico); 

/* =======================================
   RUTAS PROTEGIDAS Y ADMIN
   ======================================= */
router.put("/perfil", verifyToken, actualizarPerfil);

// SOLO ADMIN (Protegido con verifyAdmin)
router.patch("/:id/activar", verifyToken, verifyAdmin, activarUsuario);
router.post("/", verifyToken, verifyAdmin, crearUsuario);
router.put("/:id", verifyToken, verifyAdmin, editarUsuario);
router.patch("/:id/desactivar", verifyToken, verifyAdmin, desactivarUsuario);

// Listar y obtener (Dejamos verifyToken, pero podrías restringir a admin si quisieras)
router.get("/", verifyToken, listarUsuarios);
router.get("/:id", verifyToken, obtenerUsuario);

export default router;