import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// OBTENER COMENTARIOS POR OT
router.get("/:otId", async (req, res) => {
  const { otId } = req.params;
  try {
    // CAMBIO: Se solicitan las columnas 'fecha_edicion' y 'editado'
    const result = await pool.query(
      `SELECT c.id, c.texto, c.fecha_creacion, c.fecha_edicion, c.editado, c.usuarios_id, u.nombre AS autor
       FROM comentarios c
       JOIN usuarios u ON c.usuarios_id = u.id_usuarios
       WHERE c.ot_id = $1
       ORDER BY c.fecha_creacion DESC`, 
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
      `INSERT INTO comentarios (ot_id, usuarios_id, texto, fecha_creacion, editado)
       VALUES ($1,$2,$3, NOW(), FALSE) RETURNING *`,
      [ot_id, usuarios_id, texto]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

// EDITAR COMENTARIO
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, usuarios_id } = req.body;

  try {
    // CAMBIO: Se actualiza 'fecha_edicion' y se marca 'editado' como TRUE
    const result = await pool.query(
      `UPDATE comentarios 
       SET texto = $1, fecha_edicion = NOW(), editado = TRUE
       WHERE id = $2 AND usuarios_id = $3
       RETURNING *`,
      [texto, id, usuarios_id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "No tienes permiso para editar este comentario o no existe." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error editando comentario:", error);
    res.status(500).json({ error: "Error al actualizar comentario" });
  }
});

export default router;