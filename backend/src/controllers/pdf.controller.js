import PDFDocument from "pdfkit";
import { pool } from "../db.js";

export const exportPdfOT = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener datos de la OT
    const otResult = await pool.query(
      `SELECT o.*, u.nombre AS responsable_nombre
       FROM ot o
       JOIN usuarios u ON u.id_usuarios = o.responsable_id
       WHERE id_ot = $1`,
      [id]
    );

    const ot = otResult.rows[0];
    if (!ot) return res.status(404).json({ error: "OT no encontrada" });

    // 2. Obtener comentarios
    const comentariosResult = await pool.query(
      `SELECT c.texto, c.fecha_creacion, u.nombre AS autor
       FROM comentarios c
       JOIN usuarios u ON u.id_usuarios = c.usuarios_id
       WHERE c.ot_id = $1
       ORDER BY c.fecha_creacion ASC`,
      [id]
    );

    const comentarios = comentariosResult.rows;

    // 3. Crear PDF
    const doc = new PDFDocument({ margin: 40 });

    const filename = `OT-${ot.codigo}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Título
    doc.fontSize(20).text(`Detalles de OT ${ot.codigo}`, { underline: true });
    doc.moveDown();

    // Datos generales
    doc.fontSize(14).text("Datos Generales", { bold: true });
    doc.fontSize(12);
    doc.text(`ID OT: ${ot.id_ot}`);
    doc.text(`Título: ${ot.titulo}`);
    doc.text(`Descripción: ${ot.descripcion}`);
    doc.text(`Estado: ${ot.estado}`);
    doc.text(`Responsable: ${ot.responsable_nombre}`);
    doc.text(`Fecha inicio: ${ot.fecha_inicio_contrato}`);
    doc.text(`Fecha fin: ${ot.fecha_fin_contrato}`);
    doc.text(`Creación: ${ot.fecha_creacion}`);
    doc.text(`Actualización: ${ot.fecha_actualizacion}`);
    doc.moveDown();

    // Comentarios
    doc.fontSize(14).text("Comentarios", { bold: true });
    doc.moveDown(0.5);

    comentarios.forEach((c) => {
      doc.fontSize(12).text(`Autor: ${c.autor}`);
      doc.text(`Fecha: ${c.fecha_creacion}`);
      doc.text(`Comentario: ${c.comentario}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error generando PDF:", error);
    res.status(500).json({ error: "Error al generar PDF" });
  }
};
