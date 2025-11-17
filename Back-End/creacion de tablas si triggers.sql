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


-- 3) tabla de OT(ordenes de trabajo)
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

