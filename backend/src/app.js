import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import otRoutes from "./routes/ot.routes.js";
import comentariosRoutes from "./routes/comentarios.routes.js";
import auditoriasRoutes from "./routes/auditorias.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ot", otRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/auditorias", auditoriasRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("Backend corriendo en puerto", PORT);
});
// Test conexión a BD
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Error conectando a la BD:", err);
  } else {
    console.log("✅ Conexión a BD OK:", result.rows[0]);
  }
});