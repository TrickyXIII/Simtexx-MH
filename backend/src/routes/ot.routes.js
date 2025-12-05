import { Router } from "express";
import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";
import PDFDocument from "pdfkit";

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
      cliente_id,
      responsable_id,
      activo
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
        cliente_id,
        responsable_id,
        activo
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        codigo,
        titulo,
        descripcion,
        estado,
        fecha_inicio_contrato,
        fecha_fin_contrato,
        cliente_id,
        responsable_id,
        activo,
      ]
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
        o.fecha_actualizacion,
        o.cliente_id,
        uc.nombre AS cliente_nombre
      FROM ot o
      JOIN usuarios u ON o.responsable_id = u.id_usuarios
      JOIN usuarios uc ON o.cliente_id = uc.id_usuarios;
    `);

    return res.json(result.rows);
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
        r.nombre AS responsable_nombre,
        o.cliente_id,
        c.nombre AS cliente_nombre,
        o.activo,
        o.fecha_creacion,
        o.fecha_actualizacion
      FROM ot o
      LEFT JOIN usuarios r ON o.responsable_id = r.id_usuarios
      LEFT JOIN usuarios c ON o.cliente_id = c.id_usuarios
      WHERE o.id_ot = $1
    `, [id]);

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
    const {
      titulo,
      descripcion,
      estado,
      cliente_id,
      responsable_id,
      fecha_inicio_contrato,
      fecha_fin_contrato,
      activo
    } = req.body;

    const updateQuery = `
      UPDATE ot SET
        titulo = $1,
        descripcion = $2,
        estado = $3,
        cliente_id = $4,
        responsable_id = $5,
        fecha_inicio_contrato = $6,
        fecha_fin_contrato = $7,
        activo = $8,
        fecha_actualizacion = NOW()
      WHERE id_ot = $9
      RETURNING *;
    `;

    const result = await pool.query(updateQuery, [
      titulo,
      descripcion,
      estado,
      cliente_id,
      responsable_id,
      fecha_inicio_contrato,
      fecha_fin_contrato,
      activo,
      id
    ]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: "OT no encontrada" });

    res.json({ message: "OT actualizada", data: result.rows[0] });

  } catch (error) {
    console.error("Error al actualizar OT:", error);
    res.status(500).json({ error: "Error al actualizar OT" });
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
    await pool.query("DELETE FROM ot WHERE id_ot = $1", [id]);
    res.json({ message: "OT eliminada" });
  } catch (error) {
    console.error("Error al eliminar:", error);
    res.status(500).json({ error: "Error al eliminar OT" });
  }
});


/* ============================
     EXPORTAR OT A CSV
=============================== */
router.get("/:id/export/csv", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM ot WHERE id_ot = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "OT no encontrada" });
    }

    const ot = result.rows[0];

    const csv = `id_ot,codigo,titulo,estado\n${ot.id_ot},${ot.codigo},${ot.titulo},${ot.estado}`;

    res.header("Content-Type", "text/csv");
    res.attachment(`ot_${ot.id_ot}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error al exportar CSV:", error);
    res.status(500).json({ error: "Error al exportar CSV" });
  }
});

export default router;

// export lista completa de OT EN CSV // 
router.get("/export/csv", async (req, res) => {
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
        cli.nombre AS cliente,
        resp.nombre AS responsable,
        o.activo,
        o.fecha_creacion
      FROM ot o
      JOIN usuarios cli ON o.cliente_id = cli.id_usuarios
      JOIN usuarios resp ON o.responsable_id = resp.id_usuarios
      ORDER BY o.id_ot ASC
    `);

    const rows = result.rows;

    // Generar CSV
    const header = Object.keys(rows[0]).join(",") + "\n";
    const csv = rows
      .map(row => Object.values(row).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=ordenes_trabajo.csv");
    res.send(header + csv);

  } catch (error) {
    console.error("❌ Error al generar CSV:", error);
    res.status(500).json({ error: "Error al generar CSV" });
  }
});

//exportacion de todas las OT a PDF //
router.get("/export/pdf", async (req, res) => {
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
        cli.nombre AS cliente,
        resp.nombre AS responsable,
        o.activo
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

    // TÍTULO
    doc.fontSize(20).text("Listado de Órdenes de Trabajo", { align: "center" });
    doc.moveDown(); // Salto de línea

    // TABLA BÁSICA
    ots.forEach((ot, index) => {
      doc.fontSize(12).text(
        `${index + 1}. OT: ${ot.codigo} | ${ot.titulo}
Cliente: ${ot.cliente} | Responsable: ${ot.responsable}
Estado: ${ot.estado} | Activo: ${ot.activo}
--------------------------------------------
`
      );
    });

    doc.end();

  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
});
