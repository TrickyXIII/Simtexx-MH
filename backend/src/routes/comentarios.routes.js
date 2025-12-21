import { Router } from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

// --- CONFIGURACIÓN CLOUDINARY (Persistencia real) ---
// Asegúrate de tener CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en tu .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'simtexx_uploads', // Carpeta en tu Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    resource_type: 'auto' // Detecta si es imagen o archivo raw (pdf, doc)
  }
});

const upload = multer({ storage: storage });

// OBTENER COMENTARIOS POR OT
router.get("/:otId", verifyToken, async (req, res) => {
  const { otId } = req.params;
  try {
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

// CREAR COMENTARIO (Con Imagen/Archivo y Validación 1000 caracteres)
router.post("/", verifyToken, upload.single("imagen"), async (req, res) => {
  const { ot_id, texto } = req.body;
  const userIdReal = req.user.id;

  // 1. Validación de longitud (Backend)
  if (texto && texto.length > 1000) {
      return res.status(400).json({ error: "El comentario excede los 1000 caracteres permitidos." });
  }

  // Cloudinary devuelve la URL absoluta en file.path
  const imagenUrl = req.file ? req.file.path : null;

  try {
    const result = await pool.query(
      `INSERT INTO comentarios (ot_id, usuarios_id, texto, imagen_url, fecha_creacion, editado)
       VALUES ($1, $2, $3, $4, NOW(), FALSE)
       RETURNING id_comentarios AS id, texto, imagen_url, fecha_creacion, editado, usuarios_id`,
      [ot_id, userIdReal, texto || "", imagenUrl]
    );

    const nuevoComentario = result.rows[0];
    nuevoComentario.autor = req.user.rol; // O el nombre si está disponible en req.user

    res.json(nuevoComentario);
  } catch (error) {
    console.error("Error creando comentario:", error);
    res.status(500).json({ error: "Error al guardar comentario" });
  }
});

// EDITAR COMENTARIO (Solo texto, con validación)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;
  const userIdReal = req.user.id;

  // 1. Validación de longitud (Backend)
  if (texto && texto.length > 1000) {
      return res.status(400).json({ error: "El comentario excede los 1000 caracteres permitidos." });
  }

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