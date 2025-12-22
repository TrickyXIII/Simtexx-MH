import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Importación de rutas
import usuariosRoutes from "./routes/usuarios.routes.js";
import otRoutes from "./routes/ot.routes.js";
import comentariosRoutes from "./routes/comentarios.routes.js";
import auditoriasRoutes from "./routes/auditorias.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import excelRoutes from "./routes/excel.routes.js";

dotenv.config();

// Configuración para __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración CORS
app.use(cors());

app.use(express.json());

// --- Servir carpeta uploads de forma estática ---
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ot", otRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/auditorias", auditoriasRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/excel", excelRoutes);

app.get("/", (req, res) => {
  res.send("API Simtexx funcionando 🚀");
});

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;