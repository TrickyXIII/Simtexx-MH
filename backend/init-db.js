import pg from "pg";

// PEGA AQUÍ LA MISMA URL EXTERNA DE RENDER QUE USASTE EN SEED.JS
const connectionString = "postgresql://admin:OsgcSBlQDKp3s3OezfWyiYbueCszUsVG@dpg-d52vb9dactks7388n840-a.virginia-postgres.render.com/simtexx_db";

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const sqlCreacion = `
-- 1. Tabla ROLES
CREATE TABLE IF NOT EXISTS roles (
    id_roles SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Tabla USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id_roles),
    activo BOOLEAN DEFAULT TRUE,
    intentos_fallidos INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla OT (Ordenes de Trabajo)
CREATE TABLE IF NOT EXISTS ot (
    id_ot SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'En Proceso', 'Finalizada')) DEFAULT 'Pendiente',
    fecha_inicio_contrato DATE,
    fecha_fin_contrato DATE,
    cliente_id INT REFERENCES usuarios(id_usuarios),
    responsable_id INT REFERENCES usuarios(id_usuarios),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla COMENTARIOS
CREATE TABLE IF NOT EXISTS comentarios (
    id_comentarios SERIAL PRIMARY KEY,
    ot_id INT NOT NULL REFERENCES ot(id_ot) ON DELETE CASCADE,
    usuarios_id INT NOT NULL REFERENCES usuarios(id_usuarios),
    texto TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla AUDITORIAS
CREATE TABLE IF NOT EXISTS auditorias (
    id_auditoria SERIAL PRIMARY KEY,
    ot_id INT REFERENCES ot(id_ot) ON DELETE SET NULL,
    usuario_id INT REFERENCES usuarios(id_usuarios),
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(45),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function crearTablas() {
  try {
    console.log("🏗️ Creando tablas en Render...");
    await pool.query(sqlCreacion);
    console.log("✅ Tablas creadas correctamente.");
  } catch (error) {
    console.error("❌ Error creando tablas:", error);
  } finally {
    pool.end();
  }
}

crearTablas();