import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Función auxiliar para validar robustez de contraseña
function validarPassword(password) {
  const minLength = 8;
  const hasNumber = /\d/;
  const hasUpperCase = /[A-Z]/;

  if (password.length < minLength) return "La contraseña debe tener al menos 8 caracteres.";
  if (!hasNumber.test(password)) return "La contraseña debe contener al menos un número.";
  if (!hasUpperCase.test(password)) return "La contraseña debe contener al menos una letra mayúscula.";
  return null;
}

/**
 * ACTUALIZAR PERFIL PROPIO (Cualquier usuario logueado)
 * No permite cambiar el rol.
 */
export async function actualizarPerfil(req, res) {
  try {
    const idUsuario = req.user.id; // ID del token
    const { nombre, correo, password, confirmarPassword } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ error: "Nombre y correo son obligatorios" });
    }

    // Validar unicidad de correo (excluyendo al propio usuario)
    const existe = await pool.query(
      "SELECT 1 FROM usuarios WHERE correo = $1 AND id_usuarios <> $2", 
      [correo, idUsuario]
    );
    if (existe.rows.length) {
      return res.status(409).json({ error: "El correo ya está en uso por otro usuario." });
    }

    let query = "UPDATE usuarios SET nombre = $1, correo = $2, fecha_actualizacion = NOW()";
    let values = [nombre, correo];
    let counter = 3;

    // Si envía contraseña, la validamos y hasheamos
    if (password) {
      if (password !== confirmarPassword) {
        return res.status(400).json({ error: "Las contraseñas no coinciden." });
      }
      const errorPass = validarPassword(password);
      if (errorPass) return res.status(400).json({ error: errorPass });

      const hash = await bcrypt.hash(password, 10);
      query += `, password_hash = $${counter}`;
      values.push(hash);
      counter++;
    }

    query += ` WHERE id_usuarios = $${counter} RETURNING id_usuarios, nombre, correo, rol_id`;
    values.push(idUsuario);

    const result = await pool.query(query, values);
    const usuarioActualizado = result.rows[0];

    // Auditoría
    await pool.query(
      `INSERT INTO auditorias (usuario_id, ot_id, accion, descripcion, ip_address)
       VALUES ($1, NULL, 'EDITAR_PERFIL', $2, $3)`,
      [idUsuario, `Usuario ${nombre} actualizó su perfil`, req.ip || req.connection.remoteAddress]
    );

    res.json({ message: "Perfil actualizado", usuario: usuarioActualizado });

  } catch (error) {
    console.error("actualizarPerfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
}

/**
 * REACTIVAR USUARIO (Solo Admin)
 */
export async function activarUsuario(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE usuarios SET activo = TRUE, intentos_fallidos = 0, fecha_actualizacion = NOW() 
       WHERE id_usuarios = $1 RETURNING id_usuarios, nombre, correo`,
      [id]
    );

    if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" });

    const u = result.rows[0];
    
    await pool.query(
      `INSERT INTO auditorias (usuario_id, ot_id, accion, descripcion, ip_address)
       VALUES ($1, NULL, 'ACTIVAR_USUARIO', $2, $3)`,
      [req.user.id, `Usuario ${u.nombre} reactivado`, req.ip || req.connection.remoteAddress]
    );

    res.json({ message: "Usuario activado correctamente" });
  } catch (error) {
    console.error("activarUsuario:", error);
    res.status(500).json({ error: "Error al activar usuario" });
  }
}

/**
 * MODIFICADO: Editar usuario (Admin)
 * Agregamos validación para que el Admin no se quite su propio rol.
 */
export async function editarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, correo, rol_id } = req.body;

    // --- VALIDACIÓN DE SEGURIDAD ---
    // Si el usuario logueado (req.user.id) es el mismo que se edita (id)
    // y está intentando cambiar su rol (rol_id != 1)
    if (parseInt(id) === req.user.id && parseInt(rol_id) !== 1) {
      return res.status(403).json({ error: "No puedes quitarte el rol de Administrador a ti mismo." });
    }
    // -------------------------------

    if (!nombre || !correo || !rol_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

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
      [req.user.id, "EDITAR_USUARIO", `Usuario ${u.nombre} (id:${u.id_usuarios}) editado por Admin`, req.ip || req.connection.remoteAddress]
    );

    return res.json({ usuario: u });
  } catch (err) {
    console.error("editarUsuario:", err);
    return res.status(500).json({ error: "Error editando usuario" });
  }
}

/**
 * Crear usuario (Admin)
 */
export async function crearUsuario(req, res) {
  try {
    const { nombre, correo, password, rol_id, activo } = req.body;

    if (!nombre || !correo || !password || !rol_id) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const errorPassword = validarPassword(password);
    if (errorPassword) {
      return res.status(400).json({ error: errorPassword });
    }

    const existe = await pool.query("SELECT 1 FROM usuarios WHERE correo = $1", [correo]);
    if (existe.rows.length) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol_id, activo)
       VALUES ($1, $2, $3, $4, $5) RETURNING id_usuarios, nombre, correo, rol_id, activo, fecha_creacion`,
      [nombre, correo, password_hash, rol_id, activo !== undefined ? activo : true]
    );

    const nuevo = result.rows[0];

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
      `SELECT u.id_usuarios, u.nombre, u.correo, u.rol_id, r.nombre as rol_nombre, u.activo, u.intentos_fallidos, u.fecha_creacion, u.fecha_actualizacion
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
      `SELECT id_usuarios, nombre, correo, rol_id, activo, intentos_fallidos, fecha_creacion, fecha_actualizacion FROM usuarios WHERE id_usuarios = $1`,
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
 * LOGIN DE USUARIO
 */
export async function loginUsuario(req, res) {
  const { correo, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.id_usuarios, u.nombre, u.correo, u.password_hash, u.rol_id, r.nombre AS rol_nombre, u.activo, u.intentos_fallidos
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

    if (user.intentos_fallidos >= 5) {
      return res.status(403).json({ error: "Cuenta bloqueada por múltiples intentos fallidos. Contacte al administrador." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      await pool.query(
        "UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id_usuarios = $1",
        [user.id_usuarios]
      );
      
      const intentosRestantes = 5 - (user.intentos_fallidos + 1);
      if (intentosRestantes <= 0) {
         return res.status(403).json({ error: "Cuenta bloqueada. Ha excedido el número de intentos." });
      }

      return res.status(401).json({ error: `Contraseña incorrecta. Le quedan ${intentosRestantes} intentos.` });
    }

    if (user.intentos_fallidos > 0) {
      await pool.query(
        "UPDATE usuarios SET intentos_fallidos = 0 WHERE id_usuarios = $1",
        [user.id_usuarios]
      );
    }

    const token = jwt.sign(
      { 
        id: user.id_usuarios, 
        rol: user.rol_nombre,
        rol_id: user.rol_id 
      },
      process.env.JWT_SECRET || "secreto_super_seguro",
      { expiresIn: "8h" }
    );

    const { password_hash, ...userSafe } = user;
    
    res.json({
      message: "Login exitoso",
      token: token,
      user: userSafe
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
}