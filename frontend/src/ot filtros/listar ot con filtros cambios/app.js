/* eslint-disable no-undef */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import otRoutes from "./routes/ot.routes.js";
import comentariosRoutes from "./routes/comentarios.routes.js";
import auditoriasRoutes from "./routes/auditorias.routes.js";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

// Configuración de rutas de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. MIDDLEWARES (Deben ir primero para procesar las peticiones)
app.use(cors());
app.use(express.json());

// 2. RUTAS DE API (Aquí va la lógica de tu sistema)
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ots", otRoutes); // Corregido a plural 'ots' para coincidir con frontend
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/auditorias", auditoriasRoutes);

// 3. ARCHIVOS ESTÁTICOS DEL FRONTEND
// Nota: Como app.js está en 'backend/src', subimos 2 niveles para llegar a 'frontend'
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// 4. RUTA CATCH-ALL (Debe ir SIEMPRE AL FINAL)
// Si no es una ruta de API, devolvemos la aplicación React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

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
