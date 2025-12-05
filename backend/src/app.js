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
import excelRoutes from "./routes/excel.routes.js"; //importacion de exportacion por excel 
import pdfRoutes from "./routes/pdf.routes.js"; // importacion de exportacion por pdf 

const app = express();
// crear constante de conexion e importacion
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ot", otRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/auditorias", auditoriasRoutes);
app.use("/api/excel",excelRoutes) //exportar excel
app.use("/api/pdf", pdfRoutes); //exportar PDF

// Servir el build del frontend
//app.use(express.static(path.join(__dirname, "frontend/dist")));

//app.get("*", (req, res) => {
//  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
//});

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


