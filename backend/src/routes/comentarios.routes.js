import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// OBTENER COMENTARIOS POR OT
router.get("/:otId", async (req, res) => {
  const { otId } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.texto, c.fecha_creacion, u.nombre AS autor
       FROM comentarios c
       JOIN usuarios u ON c.usuarios_id = u.id_usuarios
       WHERE c.ot_id = $1
       ORDER BY c.fecha_creacion DESC`, // Más recientes primero
      [otId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    res.status(500).json({ error: "Error al cargar comentarios" });
  }
});

// CREAR COMENTARIO
router.post("/", async (req, res) => {
  const { ot_id, usuarios_id, texto } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO comentarios (ot_id, usuarios_id, texto)
       VALUES ($1,$2,$3) RETURNING *`,
      [ot_id, usuarios_id, texto]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

export default router;