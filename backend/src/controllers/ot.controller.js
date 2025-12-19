import { pool } from "../db.js";
import { generarCodigoOT } from "../utils/generarCodigoOT.js";
import ExcelJS from "exceljs";
import fs from "fs";

// --- ESTADÍSTICAS DASHBOARD ---
export const getDashboardStats = async (req, res) => {
  try {
    const { role, userid } = req.headers;
    const values = [];
    let whereClause = "WHERE 1=1"; 

    const userRole = role ? role.toLowerCase() : "";
    
    if (userRole !== 'admin' && userRole !== 'administrador' && userid) {
      whereClause += " AND responsable_id = $1";
      values.push(userid);
    }

    const query = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'En Proceso' THEN 1 ELSE 0 END) AS en_proceso,
        SUM(CASE WHEN estado = 'Finalizada' THEN 1 ELSE 0 END) AS finalizadas
      FROM ot
      ${whereClause}
    `;

    const result = await pool.query(query, values);
    const stats = result.rows[0];
    
    res.json({
      total: parseInt(stats.total) || 0,
      pendientes: parseInt(stats.pendientes) || 0,
      en_proceso: parseInt(stats.en_proceso) || 0,
      finalizadas: parseInt(stats.finalizadas) || 0
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error al cargar el dashboard" });
  }
};

// --- OBTENER TODAS ---
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

    const userRole = role ? role.toLowerCase() : "";

    if (userRole !== 'admin' && userRole !== 'administrador' && userid) {
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

// --- OBTENER POR ID (CON SEGURIDAD) ---
export const getOTById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, userid } = req.headers; // Leer credenciales

    const result = await pool.query(`
      SELECT o.*, r.nombre AS responsable_nombre, c.nombre AS cliente_nombre
      FROM ot o
      LEFT JOIN usuarios r ON o.responsable_id = r.id_usuarios
      LEFT JOIN usuarios c ON o.cliente_id = c.id_usuarios
      WHERE o.id_ot = $1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: "OT no encontrada" });
    
    const ot = result.rows[0];

    // --- VALIDACIÓN DE PERMISOS ---
    const userRole = role ? role.toLowerCase() : "";
    
    // Si NO es admin, verificamos que sea Responsable o Cliente
    if (userRole !== 'admin' && userRole !== 'administrador') {
        const esResponsable = String(ot.responsable_id) === String(userid);
        const esCliente = String(ot.cliente_id) === String(userid);

        // Si no es ninguno de los dos, denegar
        if (!esResponsable && !esCliente) {
            return res.status(403).json({ error: "Acceso denegado. No tienes permiso para ver esta OT." });
        }
    }

    res.json(ot);
  } catch (error) {
    console.error(error);
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9) RETURNING *`,
      [codigo, titulo, descripcion, estado, fecha_inicio_contrato, fecha_fin_contrato, cliente_id, responsable_id, activo !== undefined ? activo : true]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la OT" });
  }
};

// --- ACTUALIZAR OT CON AUDITORÍA INTELIGENTE ---
export const updateOT = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, estado, cliente_id, responsable_id, fecha_inicio_contrato, fecha_fin_contrato, activo } = req.body;
  const { userid } = req.headers;

  try {
    // 1. OBTENER ANTIGUA
    const oldRes = await pool.query("SELECT * FROM ot WHERE id_ot = $1", [id]);
    if (oldRes.rows.length === 0) return res.status(404).json({ error: "OT no encontrada" });
    const oldOT = oldRes.rows[0];

    // 2. ACTUALIZAR
    const result = await pool.query(`
      UPDATE ot SET
        titulo = $1, descripcion = $2, estado = $3, cliente_id = $4,
        responsable_id = $5, fecha_inicio_contrato = $6, fecha_fin_contrato = $7,
        activo = $8, fecha_actualizacion = NOW()
      WHERE id_ot = $9 RETURNING *;
    `, [titulo, descripcion, estado, cliente_id, responsable_id, fecha_inicio_contrato, fecha_fin_contrato, activo, id]);

    // 3. AUDITORÍA
    const usuarioIdInt = parseInt(userid);
    if (!isNaN(usuarioIdInt) && usuarioIdInt > 0) {
        
        const camposCambiados = [];
        if (titulo && titulo !== oldOT.titulo) camposCambiados.push("título");
        if (descripcion && descripcion !== oldOT.descripcion) camposCambiados.push("descripción");
        if (estado && estado !== oldOT.estado) camposCambiados.push("estado");
        if (responsable_id && String(responsable_id) !== String(oldOT.responsable_id)) camposCambiados.push("responsable");
        if (cliente_id && String(cliente_id) !== String(oldOT.cliente_id)) camposCambiados.push("cliente");

        const nuevaFechaInicio = fecha_inicio_contrato ? new Date(fecha_inicio_contrato).toISOString().split('T')[0] : null;
        const viejaFechaInicio = oldOT.fecha_inicio_contrato ? new Date(oldOT.fecha_inicio_contrato).toISOString().split('T')[0] : null;
        if (nuevaFechaInicio !== viejaFechaInicio) camposCambiados.push("fecha inicio");

        const nuevaFechaFin = fecha_fin_contrato ? new Date(fecha_fin_contrato).toISOString().split('T')[0] : null;
        const viejaFechaFin = oldOT.fecha_fin_contrato ? new Date(oldOT.fecha_fin_contrato).toISOString().split('T')[0] : null;
        if (nuevaFechaFin !== viejaFechaFin) camposCambiados.push("fecha fin");

        if (camposCambiados.length > 0) {
            const detalleCambio = `Cambios en: ${camposCambiados.join(", ")}`;
            await pool.query(
                `INSERT INTO auditorias (ot_id, usuario_id, accion, descripcion, fecha_creacion)
                 VALUES ($1, $2, 'Modificación', $3, NOW())`,
                [id, usuarioIdInt, detalleCambio]
            );
        }
    }

    res.json({ message: "OT actualizada", data: result.rows[0] });

  } catch (error) {
    console.error("Error actualizando OT:", error);
    res.status(500).json({ error: "Error al actualizar la OT: " + error.message });
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
    const { role, userid } = req.headers;
    if (!role || !userid) {
      return res.status(401).json({ error: "Acceso denegado. Faltan credenciales." });
    }

    const { busqueda, estado, fechaInicio, fechaFin } = req.query;

    let query = `
      SELECT 
        o.id_ot, o.codigo, o.titulo, o.descripcion, o.estado, 
        to_char(o.fecha_inicio_contrato, 'YYYY-MM-DD') as fecha_inicio,
        to_char(o.fecha_fin_contrato, 'YYYY-MM-DD') as fecha_fin,
        u.nombre AS responsable,
        c.nombre AS cliente
      FROM ot o
      LEFT JOIN usuarios u ON o.responsable_id = u.id_usuarios
      LEFT JOIN usuarios c ON o.cliente_id = c.id_usuarios
      WHERE 1=1
    `;
    const values = [];
    let counter = 1;

    const userRole = role ? role.toLowerCase() : "";
    if (userRole !== 'admin' && userRole !== 'administrador' && userid) {
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
      query += ` AND (o.titulo ILIKE $${counter} OR o.codigo ILIKE $${counter} OR c.nombre ILIKE $${counter})`;
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
    const ots = result.rows;

    if (ots.length === 0) return res.status(404).send("No hay datos para exportar con los filtros seleccionados");

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

// --- IMPORTAR OTs ---
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

    fs.unlinkSync(filePath);

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