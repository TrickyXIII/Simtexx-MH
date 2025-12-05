ALTER TABLE ot
    ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE ot
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_ot_activo
    ON ot (activo);

DROP VIEW IF EXISTS vw_ot_activas;
DROP VIEW IF EXISTS vw_ot_inactivas;

CREATE VIEW vw_ot_activas AS
SELECT *
FROM ot
WHERE activo = TRUE;

CREATE VIEW vw_ot_inactivas AS
SELECT *
FROM ot
WHERE activo = FALSE;

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
    SELECT *
    INTO v_ot
    FROM ot
    WHERE id = p_ot_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La OT con id % no existe.', p_ot_id;
    END IF;

    IF v_ot.activo = FALSE THEN
        RAISE EXCEPTION 'La OT con id % ya está desactivada.', p_ot_id;
    END IF;

    UPDATE ot
    SET
        activo = FALSE,
        fecha_actualizacion = NOW()
    WHERE id = p_ot_id;

    INSERT INTO auditorias (
        usuario_id,
        ot_id,
        accion,
        descripcion,
        ip_address,
        fecha_creacion
    )
    VALUES (
        p_usuario_id,
        p_ot_id,
        'DESACTIVAR_OT',
        format(
            'El usuario %s desactivó la OT con código %s (id=%s).',
            p_usuario_id,
            v_ot.codigo,
            p_ot_id
        ),
        p_ip_address,
        NOW()
    );
END;
$$;