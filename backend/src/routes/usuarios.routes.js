import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs";

// Importar controladores (asegúrate de haber creado este archivo)
import {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  editarUsuario,
  desactivarUsuario
} from "../controllers/usuarios.controller.js";

const router = Router();

// filtro para mantenedores en crear OT: devuelve usuarios con rol_id = 3
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

// filtro clientes para CREAR OT: devuelve usuarios con rol_id = 2
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

/* =========================
   LOGIN (mejorado: bcrypt + activo)
   ========================= */
router.post("/login", async (req, res) => {
  const { correo, password } = req.body;
  try {
    const result = await pool.query(
      `
      SELECT 
        u.id_usuarios,
        u.nombre,
        u.correo,
        u.password_hash,
        u.rol_id,
        r.nombre AS rol_nombre,
        u.activo
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id_roles
      WHERE u.correo = $1
      `,
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // Verificar si cuenta activa
    if (!user.activo) {
      return res.status(403).json({ error: "Cuenta desactivada. Contacte al administrador." });
    }

    // Comparar usando bcrypt
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Responder (si usan JWT deberán emitir token aquí; por ahora devolvemos datos)
    res.json({
      message: "Login exitoso",
      user: {
        id_usuarios: user.id_usuarios,
        nombre: user.nombre,
        correo: user.correo,
        rol_id: user.rol_id,
        rol_nombre: user.rol_nombre
      }
    });

  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});



// Crear usuario (Admin)
router.post("/", crearUsuario);

// Listar usuarios (Admin)
router.get("/", listarUsuarios);

// Obtener usuario por id
router.get("/:id", obtenerUsuario);

// Editar usuario (Admin)
router.put("/:id", editarUsuario);

// Desactivar usuario (soft delete) (Admin)
router.patch("/:id/desactivar", desactivarUsuario);

export default router;
