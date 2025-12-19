import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // <--- Importar esto
/**
 * Crear usuario (Admin)
 * body: { nombre, correo, password, rol_id }
 */
export async function crearUsuario(req, res) {
  try {
    const { nombre, correo, password, rol_id } = req.body;

    if (!nombre || !correo || !password || !rol_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar unicidad correo
    const existe = await pool.query("SELECT 1 FROM usuarios WHERE correo = $1", [correo]);
    if (existe.rows.length) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol_id)
       VALUES ($1, $2, $3, $4) RETURNING id_usuarios, nombre, correo, rol_id, activo, fecha_creacion`,
      [nombre, correo, password_hash, rol_id]
    );

    const nuevo = result.rows[0];

    // Registrar auditoría
    await pool.query(
      `INSERT INTO auditorias (usuario_id, ot_id, accion, descripcion, ip_address)
       VALUES ($1, NULL, $2, $3, $4)`,
      [nuevo.id_usuarios, "CREAR_USUARIO", `Usuario ${nuevo.nombre} (${nuevo.correo}) creado`, req.ip || req.connection.remoteAddress]
    );

    return res.status(201).json({ usuario: nuevo });
  } catch (err) {
    console.error("crearUsuario:", err);
    return res.status(500).json({ error: "Error creando usuario" });
  }
}

/**
 * Listar usuarios (Admin)
 */
export async function listarUsuarios(req, res) {
  try {
    const result = await pool.query(
      `SELECT u.id_usuarios, u.nombre, u.correo, u.rol_id, r.nombre as rol_nombre, u.activo, u.fecha_creacion, u.fecha_actualizacion
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id_roles
       ORDER BY u.id_usuarios DESC`
    );
    return res.json({ usuarios: result.rows });
  } catch (err) {
    console.error("listarUsuarios:", err);
    return res.status(500).json({ error: "Error listando usuarios" });
  }
}

/**
 * Obtener usuario por id
 */
export async function obtenerUsuario(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id_usuarios, nombre, correo, rol_id, activo, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id_usuarios = $1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json({ usuario: result.rows[0] });
  } catch (err) {
    console.error("obtenerUsuario:", err);
    return res.status(500).json({ error: "Error obteniendo usuario" });
  }
}

/**
 * Editar usuario (Admin)
 * body: { nombre, correo, rol_id }
 */
export async function editarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, correo, rol_id } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !rol_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar si correo ya está en uso por otro usuario
    const existe = await pool.query("SELECT id_usuarios FROM usuarios WHERE correo = $1 AND id_usuarios <> $2", [correo, id]);
    if (existe.rows.length) {
      return res.status(409).json({ error: "El correo ya está en uso" });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, correo = $2, rol_id = $3, fecha_actualizacion = NOW()
       WHERE id_usuarios = $4
       RETURNING id_usuarios, nombre, correo, rol_id, activo`,
      [nombre, correo, rol_id, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

    const u = result.rows[0];

    await pool.query(
      `INSERT INTO auditorias (usuario_id, ot_id, accion, descripcion, ip_address)
       VALUES ($1, NULL, $2, $3, $4)`,
      [req.user ? req.user.id : u.id_usuarios, "EDITAR_USUARIO", `Usuario ${u.nombre} (id:${u.id_usuarios}) editado`, req.ip || req.connection.remoteAddress]
    );

    return res.json({ usuario: u });
  } catch (err) {
    console.error("editarUsuario:", err);
    return res.status(500).json({ error: "Error editando usuario" });
  }
}

/**
 * Desactivar (soft delete) usuario (Admin)
 */
export async function desactivarUsuario(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE usuarios SET activo = FALSE, fecha_actualizacion = NOW() WHERE id_usuarios = $1 RETURNING id_usuarios, nombre, correo, activo`,
      [id]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

    const u = result.rows[0];
    await pool.query(
      `INSERT INTO auditorias (usuario_id, ot_id, accion, descripcion, ip_address)
       VALUES ($1, NULL, $2, $3, $4)`,
      [req.user ? req.user.id : u.id_usuarios, "DESACTIVAR_USUARIO", `Usuario ${u.nombre} (id:${u.id_usuarios}) desactivado`, req.ip || req.connection.remoteAddress]
    );

    return res.json({ message: "Usuario desactivado", usuario: u });
  } catch (err) {
    console.error("desactivarUsuario:", err);
    return res.status(500).json({ error: "Error desactivando usuario" });
  }
}

/**
 * LOGIN DE USUARIO (Nuevo Agregado)
 */
export async function loginUsuario(req, res) {
  const { correo, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.id_usuarios, u.nombre, u.correo, u.password_hash, u.rol_id, r.nombre AS rol_nombre, u.activo
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id_roles
       WHERE u.correo = $1`,
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (!user.activo) {
      return res.status(403).json({ error: "Cuenta desactivada. Contacte al administrador." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // --- GENERACIÓN DEL TOKEN JWT ---
    const token = jwt.sign(
      { 
        id: user.id_usuarios, 
        rol: user.rol_nombre,
        rol_id: user.rol_id 
      },
      process.env.JWT_SECRET || "secreto_super_seguro", // Debe coincidir con el middleware
      { expiresIn: "8h" } // El token expira en 8 horas
    );

    const { password_hash, ...userSafe } = user;
    
    res.json({
      message: "Login exitoso",
      token: token, // Enviamos el token al frontend
      user: userSafe
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
}