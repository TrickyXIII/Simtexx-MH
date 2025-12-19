import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// OBTENER HISTORIAL POR OT
router.get("/:otId", async (req, res) => {
  const { otId } = req.params;
  try {
    // CORRECCIÓN: Usamos 'usuario_id', 'descripcion', 'fecha_creacion'
    const result = await pool.query(
      `SELECT a.*, u.nombre AS responsable_nombre, a.fecha_creacion as fecha_cambio, a.descripcion as detalles
       FROM auditorias a
       LEFT JOIN usuarios u ON a.usuario_id = u.id_usuarios
       WHERE a.ot_id = $1
       ORDER BY a.fecha_creacion DESC`, 
      [otId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al cargar el historial" });
  }
});

export default router;