import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { usuario_id, ot_id, accion, descripcion, ip_address } = req.body;

  const result = await pool.query(
    `INSERT INTO auditorias (usuario_id, ot_id, accion, descripcion, ip_address)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [usuario_id, ot_id, accion, descripcion, ip_address]
  );

  res.json(result.rows[0]);
});

export default router;
