import { Router } from "express";
import { pool } from "../db.js";

const router = Router();
//filtro para mantenedores en crearot select responsable
router.get("/mantenedores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_usuarios, nombre
      FROM usuarios
      WHERE rol_id = 3 AND activo = true
      ORDER BY nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener responsables" });
  }
});

// filtro cliente Para CREARot
router.get("/clientes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_usuarios, nombre
      FROM usuarios
      WHERE rol_id = 2 And Activo = true
      ORDER BY nombre ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

// LOGIN DESDE BD
router.post("/login", async (req, res) => {
  const { correo, password_hash } = req.body;

  try {
    // 1. Validar usuario por email
    const result = await pool.query(
       `
      SELECT 
        u.id_usuarios,
        u.nombre,
        u.correo,
        u.password_hash,
        u.rol_id,
        r.nombre AS rol_nombre
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

    // 2. Comparar contraseña (versión simple para desarrollo)
    if (password_hash !== user.password_hash) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Responder datos al frontend
    res.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol_id: user.rol_id,
        rol_nombre: user.rol_nombre
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

//MOSTRAR TODOS LOS USUARIOS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *from usuarios
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las usuarios:", error);
    return res.status(500).json({ error: "Error al obtener las usuarios" });
  }
});

export default router;


