import { Router } from "express";
import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";

const router = Router();

// Crear OT (Lo dejo tal cual lo tenías)
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id } = req.body;
    const codigo = generarCodigoOT();

    const result = await pool.query(
      `INSERT INTO ot (codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MODIFICACIÓN AQUÍ: Listar OT con Filtros ---
router.get("/", async (req, res) => {
  try {
    // 1. Obtener parámetros del Query String y Headers
    const { estado, fechaInicio, fechaFin, busqueda } = req.query;
    const { role, userid } = req.headers; // userId para filtrar si no es admin

    // 2. Construcción dinámica del SQL
    let query = "SELECT * FROM ot WHERE 1=1";
    const values = [];
    let counter = 1;

    // A. Filtro por Rol (Si no es Admin, solo ve sus OTs)
    // Asumimos que 'responsable_id' en la DB coincide con el ID del usuario
    if (role !== 'admin' && userid) {
      query += ` AND responsable_id = $${counter}`;
      values.push(userid);
      counter++;
    }

    // B. Filtro por Estado
    if (estado && estado !== "Todos") {
      query += ` AND estado = $${counter}`;
      values.push(estado);
      counter++;
    }

    // C. Filtro por Rango de Fechas (Inicio de contrato)
    if (fechaInicio) {
      query += ` AND fecha_inicio_contrato >= $${counter}`;
      values.push(fechaInicio);
      counter++;
    }
    if (fechaFin) {
      query += ` AND fecha_fin_contrato <= $${counter}`;
      values.push(fechaFin);
      counter++;
    }

    // D. Filtro por Búsqueda (Título o Código)
    if (busqueda) {
      query += ` AND (titulo ILIKE $${counter} OR codigo ILIKE $${counter})`;
      values.push(`%${busqueda}%`);
      counter++;
    }

    // Ordenamiento final
    query += " ORDER BY id_ot DESC";

    // 3. Ejecutar consulta
    const result = await pool.query(query, values);
    
    // Criterio 5: Si no hay datos, enviamos array vacío (el front mostrará el mensaje)
    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener OTs" });
  }
});

export default router;