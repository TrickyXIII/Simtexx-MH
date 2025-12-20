import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// --- OBTENER AUDITORÍA GLOBAL (Solo Admin) ---
router.get("/", verifyToken, async (req, res) => {
  try {
    // 1. Verificar si es Admin (Rol ID 1)
    const { rol_id } = req.user;
    if (rol_id !== 1) {
        return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
    }

    // 2. Consulta de logs globales (Limitado a los últimos 500 para rendimiento)
    const result = await pool.query(
      `SELECT a.*, u.nombre AS autor, 
       to_char(a.fecha_creacion, 'DD/MM/YYYY HH24:MI') as fecha_formateada
       FROM auditorias a
       LEFT JOIN usuarios u ON a.usuario_id = u.id_usuarios
       ORDER BY a.fecha_creacion DESC
       LIMIT 500`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo auditoría global:", error);
    res.status(500).json({ error: "Error al cargar auditoría" });
  }
});

// --- OBTENER HISTORIAL POR OT ---
router.get("/:otId", verifyToken, async (req, res) => {
  const { otId } = req.params;
  try {
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
    console.error("Error obteniendo historial OT:", error);
    res.status(500).json({ error: "Error al cargar el historial" });
  }
});

export default router;