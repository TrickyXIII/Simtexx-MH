import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const result = await pool.query("SELECT nombre, correo, fecha_actualizacion FROM usuarios");
  res.json(result.rows);
});

export default router;
