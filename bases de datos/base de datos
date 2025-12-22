-- ==========================================
-- 1. CREACIÓN DE TABLAS
-- ==========================================

-- Tabla: ROLES
CREATE TABLE IF NOT EXISTS roles (
    id_roles SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

-- Tabla: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
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

-- Tabla: OT (Órdenes de Trabajo)
CREATE TABLE IF NOT EXISTS ot (
    id_ot SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) NOT NULL,
    fecha_inicio_contrato DATE,
    fecha_fin_contrato DATE,
    responsable_id INT REFERENCES usuarios(id_usuarios),
    cliente_id INT REFERENCES usuarios(id_usuarios),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Tabla: COMENTARIOS
-- Corrección: id -> id_comentarios, agregado imagen_url
CREATE TABLE IF NOT EXISTS comentarios (
    id_comentarios SERIAL PRIMARY KEY,
    ot_id INT REFERENCES ot(id_ot) ON DELETE CASCADE,
    usuarios_id INT NOT NULL REFERENCES usuarios(id_usuarios),
    texto TEXT NOT NULL,
    imagen_url TEXT,
    editado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_edicion TIMESTAMP
);

-- Tabla: AUDITORIAS
CREATE TABLE IF NOT EXISTS auditorias (
    id_auditorias SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id_usuarios),
    ot_id INT REFERENCES ot(id_ot),
    accion VARCHAR(100),
    descripcion TEXT,
    ip_address VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 2. TRIGGERS (Automatización de fechas)
-- ==========================================

-- Trigger para usuarios
CREATE OR REPLACE FUNCTION actualizar_fecha_usuarios()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_usuarios ON usuarios;
CREATE TRIGGER update_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_usuarios();

-- Trigger para OT
CREATE OR REPLACE FUNCTION actualizar_fecha_ot()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ot ON ot;
CREATE TRIGGER update_ot
BEFORE UPDATE ON ot
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_ot();

-- Trigger para Comentarios
CREATE OR REPLACE FUNCTION actualizar_fecha_comentarios()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_edicion = NOW();
    NEW.editado = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comentarios ON comentarios;
CREATE TRIGGER update_comentarios
BEFORE UPDATE ON comentarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_comentarios();

-- ==========================================
-- 3. FUNCIONES ALMACENADAS (Stored Procedures)
-- ==========================================

-- Función para desactivación lógica de OT (Corregida)
CREATE OR REPLACE FUNCTION desactivar_ot(
    p_ot_id INT,
    p_usuario_id INT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_ot ot%ROWTYPE;
BEGIN
    SELECT * INTO v_ot FROM ot WHERE id_ot = p_ot_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La OT con id % no existe.', p_ot_id;
    END IF;

    IF v_ot.activo = FALSE THEN
        RAISE EXCEPTION 'La OT con id % ya está desactivada.', p_ot_id;
    END IF;
    UPDATE ot
    SET activo = FALSE, fecha_actualizacion = NOW()
    WHERE id_ot = p_ot_id;

    INSERT INTO auditorias (
        usuario_id, ot_id, accion, descripcion, ip_address, fecha_creacion
    )
    VALUES (
        p_usuario_id,
        p_ot_id,
        'DESACTIVAR_OT',
        format('El usuario %s desactivó la OT con código %s (id=%s).', p_usuario_id, v_ot.codigo, p_ot_id),
        p_ip_address,
        NOW()
    );
END;
$$;

-- ==========================================
-- 4. DATOS INICIALES (Semillas)
-- ==========================================

INSERT INTO roles (id_roles, nombre, descripcion) VALUES 
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Cliente', 'Acceso limitado a sus propias OTs'),
(3, 'Mantenedor', 'Técnico encargado de ejecutar OTs')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario Admin por defecto (Password: Admin123)
-- Nota: En producción cambia el hash por uno generado con tu bcrypt
INSERT INTO usuarios (nombre, correo, password_hash, rol_id) 
VALUES ('Administrador Global', 'admin@simtexx.com', '$2a$10$X7V...TU_HASH_AQUI...', 1)
ON CONFLICT (correo) DO NOTHING;
