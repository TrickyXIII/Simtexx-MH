import { pool } from "../db.js";

// OBTENER TODAS LAS OTs
export const getOTs = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ot ORDER BY id_ot ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las OTs" });
  }
};

// ACTUALIZAR UNA OT
export const updateOT = async (req, res) => {
  const { id } = req.params;
  const { 
    titulo, 
    descripcion, 
    estado, 
    fecha_inicio_contrato, 
    fecha_fin_contrato 
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE ot 
       SET titulo = $1, 
           descripcion = $2, 
           estado = $3, 
           fecha_inicio_contrato = $4, 
           fecha_fin_contrato = $5,
           fecha_actualizacion = NOW()
       WHERE id_ot = $6 
       RETURNING *`,
      [titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    res.json({ message: "OT actualizada correctamente", ot: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la OT" });
  }
};
