import { Router } from "express";
import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";

const router = Router();

const codigo = generarCodigoOT();


// Crear OT
router.post("/", async (req, res) => {
  const { titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id } = req.body;
  const codigo = generarCodigoOT();

  const result = await pool.query(
    `INSERT INTO ot (codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id]
  );

  res.json(result.rows[0]);
});

// Listar OT
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM ot ORDER BY id_ot DESC");
  res.json(result.rows);
});

export default router;
