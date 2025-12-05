-- 1) tabla: roles
CREATE TABLE roles (
id_roles SERIAL PRIMARY KEY,
nombre VARCHAR(50) NOT NULL UNIQUE,
descripcion TEXT
);

-- 2) TABLA: USUARIOS
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


-- 3) tabla de OT
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

-- 4.- TABLA COMENTARIOS
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

-- 5. TABLA AUDITORIAS
CREATE TABLE auditorias (
id_auditorias SERIAL PRIMARY KEY,
usuario_id INT NOT NULL REFERENCES usuarios(id_usuarios),
ot_id INT NOT NULL REFERENCES ot(id_ot),
accion VARCHAR(100),
descripcion TEXT,
ip_address VARCHAR(50),
fecha_creacion TIMESTAMP DEFAULT NOW()
);





