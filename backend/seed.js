import pg from "pg";
import bcrypt from "bcryptjs";

// 1. PEGA AQUÍ TU "EXTERNAL DATABASE URL" DE RENDER
// (O usa process.env.DB_URL si tienes el .env configurado localmente)
const connectionString = "postgresql://admin:OsgcSBlQDKp3s3OezfWyiYbueCszUsVG@dpg-d52vb9dactks7388n840-a.virginia-postgres.render.com/simtexx_db"; 

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Necesario para Render
});

async function main() {
  try {
    console.log("conectando a la BD...");
    
    // 2. CREAR ROLES (Si no existen)
    await pool.query(`
      INSERT INTO roles (id_roles, nombre) 
      VALUES 
        (1, 'Administrador'),
        (2, 'Cliente'),
        (3, 'Mantenedor')
      ON CONFLICT (id_roles) DO NOTHING;
    `);
    console.log("Roles verificados/creados.");

    // 3. DATOS DEL SUPER ADMIN
    const nombre = "Super Admin";
    const correo = "admin@simtexx.com";
    const passwordPlana = "Admin123"; // Cumple: Min 8, 1 Mayúscula, 1 Número

    // 4. ENCRIPTAR CONTRASEÑA
    const hash = await bcrypt.hash(passwordPlana, 10);

    // 5. INSERTAR USUARIO
    // Usamos ON CONFLICT para no duplicarlo si lo corres dos veces
    // Asumiendo que 'correo' es UNIQUE en tu tabla usuarios
    const res = await pool.query(`
      INSERT INTO usuarios (nombre, correo, password_hash, rol_id, activo)
      VALUES ($1, $2, $3, 1, true)
      ON CONFLICT (correo) DO NOTHING
      RETURNING id_usuarios;
    `, [nombre, correo, hash]);

    if (res.rows.length > 0) {
      console.log(`✅ Usuario creado con éxito! ID: ${res.rows[0].id_usuarios}`);
      console.log(`📧 Correo: ${correo}`);
      console.log(`🔑 Contraseña: ${passwordPlana}`);
    } else {
      console.log("⚠️ El usuario ya existía.");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    pool.end();
  }
}

main();