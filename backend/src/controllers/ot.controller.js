import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";

// OBTENER TODAS (Con filtros)
export const getOTs = async (req, res) => {
  try {
    const { busqueda, estado } = req.query;
    let query = `
      SELECT o.*, u.nombre AS responsable_nombre, uc.nombre AS cliente_nombre
      FROM ot o
      LEFT JOIN usuarios u ON o.responsable_id = u.id_usuarios
      LEFT JOIN usuarios uc ON o.cliente_id = uc.id_usuarios
      WHERE 1=1
    `;
    const values = [];
    let counter = 1;

    if (estado && estado !== "Todos") {
      query += ` AND o.estado = $${counter}`;
      values.push(estado);
      counter++;
    }

    if (busqueda) {
      query += ` AND (o.titulo ILIKE $${counter} OR o.codigo ILIKE $${counter})`;
      values.push(`%${busqueda}%`);
      counter++;
    }

    query += " ORDER BY o.id_ot DESC";
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las OTs" });
  }
};

// OBTENER POR ID
export const getOTById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT o.*, r.nombre AS responsable_nombre, c.nombre AS cliente_nombre
      FROM ot o
      LEFT JOIN usuarios r ON o.responsable_id = r.id_usuarios
      LEFT JOIN usuarios c ON o.cliente_id = c.id_usuarios
      WHERE o.id_ot = $1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "OT no encontrada" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
};

// CREAR OT
export const createOT = async (req, res) => {
  try {
    const { titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo } = req.body;
    const codigo = generarCodigoOT();

    const result = await pool.query(
      `INSERT INTO ot (codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la OT" });
  }
};

// ACTUALIZAR OT
export const updateOT = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado, cliente_id, responsable_id, fecha_inicio_contrato, fecha_fin_contrato, activo } = req.body;

  try {
    const result = await pool.query(`
      UPDATE ot SET
        titulo = $1, descripcion = $2, estado = $3, cliente_id = $4,
        responsable_id = $5, fecha_inicio_contrato = $6, fecha_fin_contrato = $7,
        activo = $8, fecha_actualizacion = NOW()
      WHERE id_ot = $9 RETURNING *;
    `, [titulo, descripcion, estado, cliente_id, responsable_id, fecha_inicio_contrato, fecha_fin_contrato, activo, id]);

    if (result.rowCount === 0) return res.status(404).json({ error: "OT no encontrada" });
    res.json({ message: "OT actualizada", data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la OT" });
  }
};

// ELIMINAR OT
export const deleteOT = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ot WHERE id_ot = $1", [id]);
    res.json({ message: "OT eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar OT" });
  }
};