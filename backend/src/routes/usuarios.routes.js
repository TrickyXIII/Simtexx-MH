import { Router } from "express";
import { pool } from "../db.js";
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  editarUsuario,
  desactivarUsuario,
  loginUsuario // Importamos la nueva función del controlador
} from "../controllers/usuarios.controller.js";

const router = Router();

/* =======================================
   RUTAS AUXILIARES (Para Selectores)
   ======================================= */

// Filtro para mantenedores en crear OT: devuelve usuarios con rol_id = 3
router.get("/mantenedores", async (req, res) => {
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

// Filtro clientes para CREAR OT: devuelve usuarios con rol_id = 2
router.get("/clientes", async (req, res) => {
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
   RUTA DE LOGIN
   ======================================= */
router.post("/login", loginUsuario);

/* =======================================
   RUTAS CRUD DE USUARIOS (Admin)
   ======================================= */

// Crear usuario
router.post("/", crearUsuario);

// Listar todos los usuarios
router.get("/", listarUsuarios);

// Obtener un usuario por ID
router.get("/:id", obtenerUsuario);

// Editar usuario
router.put("/:id", editarUsuario);

// Desactivar usuario
router.patch("/:id/desactivar", desactivarUsuario);

export default router;