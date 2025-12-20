import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// --- CONFIGURACIÓN MULTER (Subida de imágenes) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    // Crear carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Nombre único: fecha + random + extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comentario-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// OBTENER COMENTARIOS POR OT
router.get("/:otId", verifyToken, async (req, res) => {
  const { otId } = req.params;
  try {
    // Agregamos c.imagen_url al SELECT
    const result = await pool.query(
      `SELECT c.id_comentarios AS id, c.texto, c.imagen_url, c.fecha_creacion, c.fecha_edicion, c.editado, c.usuarios_id, u.nombre AS autor
       FROM comentarios c
       JOIN usuarios u ON c.usuarios_id = u.id_usuarios
       WHERE c.ot_id = $1
       ORDER BY c.fecha_creacion DESC`,
      [otId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo comentarios:", error);
    res.status(500).json({ error: "Error al cargar comentarios" });
  }
});

// CREAR COMENTARIO (Con Imagen)
router.post("/", verifyToken, upload.single("imagen"), async (req, res) => {
  const { ot_id, texto } = req.body;
  const userIdReal = req.user.id;

  // Si Multer procesó un archivo, guardamos la ruta relativa
  const imagenUrl = req.file ? `uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO comentarios (ot_id, usuarios_id, texto, imagen_url, fecha_creacion, editado)
       VALUES ($1, $2, $3, $4, NOW(), FALSE)
       RETURNING id_comentarios AS id, texto, imagen_url, fecha_creacion, editado, usuarios_id`,
      [ot_id, userIdReal, texto || "", imagenUrl]
    );

    const nuevoComentario = result.rows[0];
    nuevoComentario.autor = req.user.rol; 

    res.json(nuevoComentario);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

// EDITAR COMENTARIO (Solo texto)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;
  const userIdReal = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE comentarios
       SET texto = $1, fecha_edicion = NOW(), editado = TRUE
       WHERE id_comentarios = $2 AND usuarios_id = $3
       RETURNING id_comentarios AS id, texto, imagen_url, fecha_creacion, fecha_edicion, editado, usuarios_id`,
      [texto, id, userIdReal]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "No tienes permiso para editar este comentario o no existe." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error editando comentario:", error);
    res.status(500).json({ error: "Error al actualizar comentario" });
  }
});

export default router;