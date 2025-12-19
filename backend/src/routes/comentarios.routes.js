import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { ot_id, usuarios_id, texto } = req.body;

  const result = await pool.query(
    `INSERT INTO comentarios (ot_id, usuarios_id, texto)
     VALUES ($1,$2,$3) RETURNING *`,
    [ot_id, usuarios_id, texto]
  );

  res.json(result.rows[0]);
});

export default router;
