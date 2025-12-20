import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; // <--- Importamos el candado

const router = Router();

// OBTENER COMENTARIOS POR OT (Protegido)
router.get("/:otId", verifyToken, async (req, res) => {
  const { otId } = req.params;
  try {
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

// CREAR COMENTARIO (Protegido y Seguro)
router.post("/", verifyToken, async (req, res) => {
  const { ot_id, texto } = req.body;
  // IMPORTANTE: Tomamos el ID del usuario del TOKEN, no del body (más seguro)
  const userIdReal = req.user.id; 

  try {
    const result = await pool.query(
      `INSERT INTO comentarios (ot_id, usuarios_id, texto, fecha_creacion, editado)
       VALUES ($1,$2,$3, NOW(), FALSE) RETURNING *`,
      [ot_id, userIdReal, texto]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

// EDITAR COMENTARIO (Protegido y Seguro)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;
  const userIdReal = req.user.id; // ID del usuario logueado

  try {
    // Solo permitimos editar si el comentario pertenece al usuario logueado
    const result = await pool.query(
      `UPDATE comentarios 
       SET texto = $1, fecha_edicion = NOW(), editado = TRUE
       WHERE id = $2 AND usuarios_id = $3
       RETURNING *`,
      [texto, id, userIdReal]
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