-- =========================================================
-- 0. LIMPIEZA (Para asegurar que se crea todo limpio y ordenado)
-- =========================================================
DROP TABLE IF EXISTS auditorias CASCADE;
DROP TABLE IF EXISTS comentarios CASCADE;
DROP TABLE IF EXISTS ot CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =========================================================
-- 1. TABLA: ROLES
-- =========================================================
CREATE TABLE roles (
    id_roles SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- --- IMPORTANTE: DATOS INICIALES DE ROLES ---
-- Necesarios para poder crear usuarios después
INSERT INTO roles (id_roles, nombre, descripcion) VALUES (1, 'Administrador', 'Admin del sistema');
INSERT INTO roles (id_roles, nombre, descripcion) VALUES (2, 'Tecnico', 'Tecnico de terreno');


-- =========================================================
-- 2. TABLA: USUARIOS
-- =========================================================
CREATE TABLE usuarios (
    id_usuarios SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id_roles),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    intentos_fallidos INT DEFAULT 0
);

-- Trigger para update fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_usuarios()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_usuarios();

-- --- IMPORTANTE: DATOS INICIALES DE USUARIOS (SOLUCIÓN A TU ERROR) ---
-- Creamos los usuarios con ID 1 y 2 para que coincidan con tu formulario Frontend
INSERT INTO usuarios (id_usuarios, nombre, correo, password_hash, rol_id) 
VALUES (1, 'Maria Lopez', 'maria@simtexx.com', '12345', 2);

INSERT INTO usuarios (id_usuarios, nombre, correo, password_hash, rol_id) 
VALUES (2, 'Pedro Rojas', 'pedro@simtexx.com', '12345', 2);

-- Ajustamos el contador automático para que el próximo usuario sea el 3
SELECT setval('usuarios_id_usuarios_seq', (SELECT MAX(id_usuarios) FROM usuarios));


-- =========================================================
-- 3. TABLA: OT
-- =========================================================
CREATE TABLE ot (
    id_ot SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) NOT NULL,
    fecha_inicio_contrato DATE,
    fecha_fin_contrato DATE,
    responsable_id INT REFERENCES usuarios(id_usuarios),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Trigger para actualizar fecha_actualizacion en ot
CREATE OR REPLACE FUNCTION actualizar_fecha_ot()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ot
BEFORE UPDATE ON ot
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_ot();


-- =========================================================
-- 4. TABLA: COMENTARIOS
-- =========================================================
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    ot_id INT REFERENCES ot(id_ot) ON DELETE CASCADE,
    usuarios_id INT NOT NULL REFERENCES usuarios(id_usuarios),
    texto TEXT NOT NULL,
    editado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_edicion TIMESTAMP
);

-- Trigger para actualizar fecha_edicion en comentarios
CREATE OR REPLACE FUNCTION actualizar_fecha_comentarios()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_edicion = NOW();
    NEW.editado = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comentarios
BEFORE UPDATE ON comentarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_comentarios();


-- =========================================================
-- 5. TABLA: AUDITORIAS
-- =========================================================
CREATE TABLE auditorias (
    id_auditorias SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id_usuarios),
    ot_id INT NOT NULL REFERENCES ot(id_ot),
    accion VARCHAR(100),
    descripcion TEXT,
    ip_address VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);