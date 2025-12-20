import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importación de rutas
import usuariosRoutes from "./routes/usuarios.routes.js";
import otRoutes from "./routes/ot.routes.js";
import comentariosRoutes from "./routes/comentarios.routes.js";
import auditoriasRoutes from "./routes/auditorias.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import excelRoutes from "./routes/excel.routes.js";

dotenv.config();

const app = express();

// Configuración CORS: Permite que el Frontend (en otro dominio) consuma esta API
app.use(cors()); 

app.use(express.json());

// Rutas
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/ot", otRoutes);
app.use("/api/comentarios", comentariosRoutes);
app.use("/api/auditorias", auditoriasRoutes);
app.use("/api/pdf", pdfRoutes); 
app.use("/api/excel", excelRoutes);

// Ruta base para probar que el server vive
app.get("/", (req, res) => {
  res.send("API Simtexx funcionando 🚀");
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export default app;