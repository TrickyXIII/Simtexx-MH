import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// =======================================================
// 1. RUTA DE LOGIN (¡Esta es la que te falta o falla!)
// =======================================================
router.post("/login", async (req, res) => {
  const { correo, password_hash } = req.body;
  
  console.log(`📥 Intento de Login: ${correo}`); // Log para depurar en consola

  try {
    // 1. Buscamos al usuario por correo
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [correo]
    );

    if (result.rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    // 2. Validamos la contraseña (texto plano por ahora)
    if (password_hash !== user.password_hash) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Convertimos el Rol ID a Texto para el Frontend
    const rolTexto = (user.rol_id === 1) ? 'admin' : 'user';

    console.log("✅ Login Exitoso");
    
    // 4. Enviamos la respuesta
    res.json({
      message: "Login exitoso",
      user: {
        id: user.id_usuarios,
        nombre: user.nombre,
        correo: user.correo,
        rol_id: user.rol_id,
        rol: rolTexto,
        activo: user.activo // Importante para la validación del front
      }
    });

  } catch (error) {
    console.error("❌ Error en Login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// =======================================================
// 2. RUTA DE REPARACIÓN (La mantenemos por seguridad)
// =======================================================
router.get("/reparar-db", async (req, res) => {
  try {
    // Roles
    await pool.query("INSERT INTO roles (id_roles, nombre) VALUES (1, 'Administrador'), (2, 'Tecnico') ON CONFLICT (id_roles) DO NOTHING");
    
    // Usuarios (Maria, Pedro y Admin)
    await pool.query("INSERT INTO usuarios (id_usuarios, nombre, correo, password_hash, rol_id) VALUES (1, 'Maria Lopez', 'maria@simtexx.com', '12345', 2) ON CONFLICT (id_usuarios) DO NOTHING");
    await pool.query("INSERT INTO usuarios (id_usuarios, nombre, correo, password_hash, rol_id) VALUES (2, 'Pedro Rojas', 'pedro@simtexx.com', '12345', 2) ON CONFLICT (id_usuarios) DO NOTHING");
    await pool.query("INSERT INTO usuarios (id_usuarios, nombre, correo, password_hash, rol_id) VALUES (3, 'Super Admin', 'admin@inacap.cl', '12345', 1) ON CONFLICT (id_usuarios) DO NOTHING");

    // Ajustar secuencia ID
    await pool.query("SELECT setval('usuarios_id_usuarios_seq', (SELECT MAX(id_usuarios) FROM usuarios))");

    res.send("✅ Base de datos verificada y usuarios restaurados.");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

export default router;