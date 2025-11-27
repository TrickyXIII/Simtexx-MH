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
      OBTENER TODAS LAS OT
=============================== */
// Listar todas las OTs con nombre del responsable
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id_ot,
        o.codigo,
        o.titulo,
        o.descripcion,
        o.estado,
        o.fecha_inicio_contrato,
        o.fecha_fin_contrato,
        o.responsable_id,
        u.nombre AS responsable_nombre,
        o.activo,
        o.fecha_creacion,
        o.fecha_actualizacion
      FROM ot o
      JOIN usuarios u ON o.responsable_id = u.id_usuarios
    `);

    return res.json(result.rows); // <-- ÚNICA RESPUESTA
  } catch (error) {
    console.error("Error al obtener las OT:", error);
    return res.status(500).json({ error: "Error al obtener las OT" });
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
           fecha_fin_contrato = $4,
           fecha_actualizacion = NOW()
       WHERE id_ot = $5
       RETURNING *`,
      [titulo, descripcion, fecha_inicio_contrato, fecha_fin_contrato, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    res.json({ 
        message: "OT modificada con éxito",
        ot: result.rows[0] 
    });
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

/* ============================
     ELIMINAR OT 
=============================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE ot SET activo = false, fecha_actualizacion = NOW() WHERE id_ot = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    res.json({ message: "OT eliminada correctamente", ot: result.rows[0] });
  } catch (error) {
    console.error("Error al eliminar la OT:", error);
    res.status(500).json({ error: "Error al eliminar la OT" });
  }
});

export default router;


