import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";
import ExcelJS from "exceljs";
import fs from "fs";

// --- OBTENER TODAS (Con filtros) ---
export const getOTs = async (req, res) => {
  try {
    const { busqueda, estado, fechaInicio, fechaFin } = req.query;
    const { role, userid } = req.headers;

    let query = `
      SELECT o.*, u.nombre AS responsable_nombre, uc.nombre AS cliente_nombre
      FROM ot o
      LEFT JOIN usuarios u ON o.responsable_id = u.id_usuarios
      LEFT JOIN usuarios uc ON o.cliente_id = uc.id_usuarios
      WHERE 1=1
    `;
    const values = [];
    let counter = 1;

    // Filtros
    if (role && role.toLowerCase() !== 'admin' && userid) {
      query += ` AND o.responsable_id = $${counter}`;
      values.push(userid);
      counter++;
    }
    if (estado && estado !== "Todos") {
      query += ` AND o.estado = $${counter}`;
      values.push(estado);
      counter++;
    }
    if (busqueda) {
      query += ` AND (o.titulo ILIKE $${counter} OR o.codigo ILIKE $${counter} OR uc.nombre ILIKE $${counter})`;
      values.push(`%${busqueda}%`);
      counter++;
    }
    if (fechaInicio) {
        query += ` AND o.fecha_inicio_contrato >= $${counter}`;
        values.push(fechaInicio);
        counter++;
    }
    if (fechaFin) {
        query += ` AND o.fecha_fin_contrato <= $${counter}`;
        values.push(fechaFin);
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

// --- OBTENER POR ID ---
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

// --- CREAR OT ---
export const createOT = async (req, res) => {
  try {
    let { titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo } = req.body;

    if (fecha_inicio_contrato === "") fecha_inicio_contrato = null;
    if (fecha_fin_contrato === "") fecha_fin_contrato = null;
    if (cliente_id === "") cliente_id = null;
    if (responsable_id === "") responsable_id = null;

    const codigo = generarCodigoOT();

    const result = await pool.query(
      `INSERT INTO ot (codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo !== undefined ? activo : true]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la OT" });
  }
};

// --- ACTUALIZAR OT ---
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

// --- ELIMINAR OT ---
export const deleteOT = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM ot WHERE id_ot = $1", [id]);
    res.json({ message: "OT eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar OT" });
  }
};

// --- EXPORTAR CSV ---
export const exportOTsCSV = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id_ot, o.codigo, o.titulo, o.descripcion, o.estado, 
        to_char(o.fecha_inicio_contrato, 'YYYY-MM-DD') as fecha_inicio,
        to_char(o.fecha_fin_contrato, 'YYYY-MM-DD') as fecha_fin,
        u.nombre AS responsable,
        c.nombre AS cliente
      FROM ot o
      LEFT JOIN usuarios u ON o.responsable_id = u.id_usuarios
      LEFT JOIN usuarios c ON o.cliente_id = c.id_usuarios
      ORDER BY o.id_ot DESC
    `);

    const ots = result.rows;
    if (ots.length === 0) return res.status(404).send("No hay datos para exportar");

    const headers = ["ID", "Codigo", "Titulo", "Descripcion", "Estado", "Inicio", "Fin", "Responsable", "Cliente"];
    const csvRows = ots.map(row => {
      return [
        row.id_ot,
        row.codigo,
        `"${(row.titulo || '').replace(/"/g, '""')}"`,
        `"${(row.descripcion || '').replace(/"/g, '""')}"`,
        row.estado,
        row.fecha_inicio,
        row.fecha_fin,
        `"${(row.responsable || 'Sin asignar')}"`,
        `"${(row.cliente || 'Sin cliente')}"`
      ].join(",");
    });

    const csvString = headers.join(",") + "\n" + csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_ots.csv");
    res.status(200).send(csvString);

  } catch (error) {
    console.error("Error exportando CSV:", error);
    res.status(500).json({ error: "Error al generar CSV" });
  }
};

// --- IMPORTAR OTs DESDE CSV ---
export const importOTs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo CSV" });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    
    await workbook.csv.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    
    let otsCreadas = 0;
    let errores = [];

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) rows.push({ num: rowNumber, values: row.values });
    });

    for (const row of rows) {
      const data = row.values;
      // Ajuste de índices: ExcelJS a veces pone un elemento vacío en index 0
      const titulo = data[1];
      const descripcion = data[2];
      const estado = data[3] || "Pendiente";
      const fechaInicio = data[4];
      const fechaFin = data[5];
      const emailResp = data[6];
      const emailCli = data[7];

      if (!titulo || !emailResp || !emailCli) {
        errores.push(`Fila ${row.num}: Faltan datos obligatorios`);
        continue;
      }

      // Buscar IDs por correo
      const userRes = await pool.query(
        "SELECT id_usuarios, correo FROM usuarios WHERE correo = $1 OR correo = $2",
        [emailResp, emailCli]
      );

      const responsable = userRes.rows.find(u => u.correo === emailResp);
      const cliente = userRes.rows.find(u => u.correo === emailCli);

      if (!responsable) {
        errores.push(`Fila ${row.num}: Responsable no encontrado (${emailResp})`);
        continue;
      }
      if (!cliente) {
        errores.push(`Fila ${row.num}: Cliente no encontrado (${emailCli})`);
        continue;
      }

      const codigo = generarCodigoOT();
      await pool.query(
        `INSERT INTO ot (codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, responsable_id, cliente_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [codigo, titulo, descripcion, estado, fechaInicio, fechaFin, responsable.id_usuarios, cliente.id_usuarios]
      );
      
      otsCreadas++;
    }

    fs.unlinkSync(filePath); // Limpiar

    res.json({ 
      message: "Proceso finalizado", 
      creadas: otsCreadas, 
      errores: errores 
    });

  } catch (error) {
    console.error("Error importando CSV:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Error al procesar el archivo CSV" });
  }
};