import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Función auxiliar para generar código (por si se necesita)
const generarCodigoOT = () => {
  const fecha = new Date();
  const year = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OT-${year}${mes}-${random}`;
};

// 1. CREAR OT (POST)
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id } = req.body;
    
    console.log("📥 Creando OT:", req.body);
    const codigo = generarCodigoOT();

    const result = await pool.query(
      `INSERT INTO ot (codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error SQL:", error.message);
    if (error.code === '23503') {
        return res.status(400).json({ error: "El responsable no existe en la BD." });
    }
    res.status(500).json({ error: error.message });
  }
});

// 2. LISTAR TODAS (GET) - Con filtros
router.get("/", async (req, res) => {
  try {
    const { estado, fechaInicio, fechaFin, busqueda } = req.query;
    const { role, userid } = req.headers;

    let query = "SELECT * FROM ot WHERE 1=1";
    const values = [];
    let counter = 1;

    // Filtros
    if (role !== 'admin' && userid) {
      query += ` AND responsable_id = $${counter}`;
      values.push(userid);
      counter++;
    }
    if (estado && estado !== "Todos") {
      query += ` AND estado = $${counter}`;
      values.push(estado);
      counter++;
    }
    // ... (otros filtros si los necesitas)

    query += " ORDER BY id_ot DESC";
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. ¡NUEVO! OBTENER UNA SOLA OT POR ID (GET /:id)
// Esto es lo que le falta a tu página de "Ver"
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM ot WHERE id_ot = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "OT no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener OT" });
  }
});

export default router;