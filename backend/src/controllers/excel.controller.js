import ExcelJS from "exceljs";
import { pool } from "../db.js";

export const exportExcelOT = async (req, res) => {
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

    // 2. Comentarios
    const comentariosResult = await pool.query(
      `SELECT c.texto, c.fecha_creacion, u.nombre AS autor
       FROM comentarios c
       JOIN usuarios u ON u.id_usuarios = c.usuarios_id
       WHERE c.ot_id = $1
       ORDER BY c.fecha_creacion ASC`,
      [id]
    );

    const comentarios = comentariosResult.rows;

    // 3. Crear Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`OT-${ot.codigo}`);

    const headerStyle = {
      font: { bold: true, size: 13 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "DDDDDD" } },
      border: { bottom: { style: "thin" } },
    };

    sheet.addRow(["DETALLES DE LA OT"]);
    sheet.mergeCells("A1:B1");
    sheet.getCell("A1").font = { bold: true, size: 14 };

    const datosGenerales = [
      ["ID OT", ot.id_ot],
      ["Código", ot.codigo],
      ["Título", ot.titulo],
      ["Descripción", ot.descripcion],
      ["Estado", ot.estado],
      ["Fecha inicio", ot.fecha_inicio_contrato],
      ["Fecha fin", ot.fecha_fin_contrato],
      ["Responsable", ot.responsable_nombre],
      ["Fecha creación", ot.fecha_creacion],
      ["Fecha actualización", ot.fecha_actualizacion],
    ];

    datosGenerales.forEach((row) => sheet.addRow(row));

    sheet.addRow([]);
    sheet.addRow(["COMENTARIOS"]);
    sheet.mergeCells("A" + sheet.lastRow.number + ":C" + sheet.lastRow.number);
    sheet.getCell("A" + sheet.lastRow.number).font = { bold: true, size: 14 };

    const header = ["Autor", "Fecha", "Comentario"];
    const headerRow = sheet.addRow(header);

    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    comentarios.forEach((c) => {
      sheet.addRow([c.autor, c.fecha_creacion, c.comentario]);
    });

    sheet.columns.forEach((col) => (col.width = 25));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=OT-${ot.codigo}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exportando a Excel:", error);
    res.status(500).json({ error: "Error al generar Excel" });
  }
};
