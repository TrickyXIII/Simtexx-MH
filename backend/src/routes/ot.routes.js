import { Router } from "express";
import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";
import PDFDocument from "pdfkit";

const router = Router();

/* ============================================================
   1. RUTAS ESPECÍFICAS (Deben ir PRIMERO)
============================================================ */

// --- EXPORTAR LISTA COMPLETA A CSV ---
router.get("/export/csv", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id_ot, o.codigo, o.titulo, o.descripcion, o.estado, 
        o.fecha_inicio_contrato, o.fecha_fin_contrato, 
        cli.nombre AS cliente, resp.nombre AS responsable, 
        o.activo, o.fecha_creacion
      FROM ot o
      JOIN usuarios cli ON o.cliente_id = cli.id_usuarios
      JOIN usuarios resp ON o.responsable_id = resp.id_usuarios
      ORDER BY o.id_ot ASC
    `);

    const rows = result.rows;
    if (rows.length === 0) return res.send("No hay datos para exportar");

    const header = Object.keys(rows[0]).join(",") + "\n";
    const csv = rows.map(row => Object.values(row).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ordenes_trabajo.csv");
    res.send(header + csv);

  } catch (error) {
    console.error("❌ Error al generar CSV:", error);
    res.status(500).json({ error: "Error al generar CSV" });
  }
});

// --- EXPORTAR LISTA COMPLETA A PDF ---
router.get("/export/pdf", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.codigo, o.titulo, o.estado, 
        cli.nombre AS cliente, resp.nombre AS responsable
      FROM ot o
      JOIN usuarios cli ON o.cliente_id = cli.id_usuarios
      JOIN usuarios resp ON o.responsable_id = resp.id_usuarios
      ORDER BY o.id_ot ASC
    `);

    const ots = result.rows;
    const doc = new PDFDocument({ margin: 30 });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=ordenes_trabajo.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Listado de Órdenes de Trabajo", { align: "center" });
    doc.moveDown();

    ots.forEach((ot, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${ot.codigo} - ${ot.titulo} \n   Cliente: ${ot.cliente} | Resp: ${ot.responsable} | Estado: ${ot.estado}\n--------------------------------------------`
      );
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
});

/* ============================================================
   2. RUTAS CRUD GENERALES
============================================================ */

// CREAR OT
router.post("/", async (req, res) => {
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
    console.error("Error al crear la OT:", error);
    res.status(500).json({ error: "Error al crear la OT" });
  }
});

// LISTAR TODAS (CON FILTROS)
router.get("/", async (req, res) => {
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
    console.error("Error al obtener las OT:", error);
    res.status(500).json({ error: "Error al obtener las OT" });
  }
});

/* ============================================================
   3. RUTAS DINÁMICAS POR ID (Deben ir AL FINAL)
============================================================ */

// OBTENER POR ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

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
    console.error("Error al obtener la OT:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// MODIFICAR OT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, estado, cliente_id, responsable_id, fecha_inicio_contrato, fecha_fin_contrato, activo } = req.body;

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
    console.error("Error al actualizar OT:", error);
    res.status(500).json({ error: "Error al actualizar OT" });
  }
});

// ELIMINAR OT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ot WHERE id_ot = $1", [id]);
    res.json({ message: "OT eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar OT" });
  }
});

// EXPORTAR UN SOLO CSV POR ID
router.get("/:id/export/csv", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM ot WHERE id_ot = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "OT no encontrada" });

    const ot = result.rows[0];
    const csv = `id_ot,codigo,titulo,estado\n${ot.id_ot},${ot.codigo},${ot.titulo},${ot.estado}`;
    
    res.header("Content-Type", "text/csv");
    res.attachment(`ot_${ot.id_ot}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Error al exportar CSV" });
  }
});

export default router;