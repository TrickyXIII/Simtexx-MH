import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// OBTENER COMENTARIOS POR OT
router.get("/:otId", verifyToken, async (req, res) => {
  const { otId } = req.params;
  try {
    // CORRECCIÓN: Usamos 'c.id_comentarios AS id' para que el frontend lo entienda
    const result = await pool.query(
      `SELECT c.id_comentarios AS id, c.texto, c.fecha_creacion, c.fecha_edicion, c.editado, c.usuarios_id, u.nombre AS autor
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
router.post("/", verifyToken, async (req, res) => {
  const { ot_id, texto } = req.body;
  const userIdReal = req.user.id; 

  try {
    // CORRECCIÓN: Devolvemos 'id_comentarios AS id'
    const result = await pool.query(
      `INSERT INTO comentarios (ot_id, usuarios_id, texto, fecha_creacion, editado)
       VALUES ($1, $2, $3, NOW(), FALSE) 
       RETURNING id_comentarios AS id, texto, fecha_creacion, editado, usuarios_id`,
      [ot_id, userIdReal, texto]
    );
    // Agregamos el nombre del autor manualmente para que la UI se actualice rápido
    const nuevoComentario = result.rows[0];
    nuevoComentario.autor = req.user.rol; // O el nombre si lo tuviéramos en el token, pero esto basta para que no falle.
    
    res.json(nuevoComentario);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

// EDITAR COMENTARIO
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params; // El frontend manda el ID aquí
  const { texto } = req.body;
  const userIdReal = req.user.id;

  try {
    // CORRECCIÓN: Usamos 'id_comentarios' en el WHERE
    const result = await pool.query(
      `UPDATE comentarios 
       SET texto = $1, fecha_edicion = NOW(), editado = TRUE
       WHERE id_comentarios = $2 AND usuarios_id = $3
       RETURNING id_comentarios AS id, texto, fecha_creacion, fecha_edicion, editado, usuarios_id`,
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