import { Router } from "express";
import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";

const router = Router();

/* ============================
        CREAR OT
=============================== */
router.post("/", async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      estado,
      fecha_inicio_contrato,
      fecha_fin_contrato,
      responsable_id,
    } = req.body;

    // Generar un código nuevo por cada OT
    const codigo = generarCodigoOT();

    const result = await pool.query(
      `INSERT INTO ot (
        codigo,
        titulo,
        descripcion,
        estado,
        fecha_inicio_contrato,
        fecha_fin_contrato,
        responsable_id
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear la OT:", error);
    res.status(500).json({ error: "Error al crear la OT" });
  }
});

/* ============================
      OBTENER TODAS LAS OT
=============================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ot ORDER BY id_ot DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las OT:", error);
    res.status(500).json({ error: "Error al obtener las OT" });
  }
});

/* ============================
     LISTAR OT POR USUARIO
=============================== */
router.get("/usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM ot WHERE responsable_id = $1 ORDER BY id_ot DESC",
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las OT del usuario:", error);
    res.status(500).json({ error: "Error al obtener las OT del usuario" });
  }
});

/* ============================
      OBTENER OT POR ID
=============================== */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM ot WHERE id_ot = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener la OT:", error);
    res.status(500).json({ error: "Error al obtener la OT" });
  }
});

/* ============================
        MODIFICAR OT
=============================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha_inicio_contrato, fecha_fin_contrato } = req.body;

    const result = await pool.query(
      `UPDATE ot 
       SET titulo = $1,
           descripcion = $2,
           fecha_inicio_contrato = $3,
           fecha_fin_contrato = $4
       WHERE id_ot = $5
       RETURNING *`,
      [titulo, descripcion, fecha_inicio_contrato, fecha_fin_contrato, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al modificar la OT:", error);
    res.status(500).json({ error: "Error al modificar la OT" });
  }
});

/* ============================
     ACTUALIZAR ESTADO OT
=============================== */
router.patch("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const result = await pool.query(
      `UPDATE ot SET estado = $1 WHERE id_ot = $2 RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    res.status(500).json({ error: "Error al actualizar el estado" });
  }
});

export default router;
