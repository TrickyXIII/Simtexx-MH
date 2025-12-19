import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js"; // <--- Importar
import multer from "multer";
import { 
    getOTs, 
    getOTById, 
    createOT, 
    updateOT, 
    deleteOT, 
    exportOTsCSV,
    importOTs,
    getDashboardStats // Importamos la nueva función
} from "../controllers/ot.controller.js";

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Aplica verifyToken a las rutas que quieras proteger
router.get("/stats", verifyToken, getDashboardStats);
router.post("/", verifyToken, createOT);
router.get("/", verifyToken, getOTs);
router.get("/:id", verifyToken, getOTById);
router.put("/:id", verifyToken, updateOT);
router.delete("/:id", verifyToken, deleteOT);

// --- RUTA ESTADÍSTICAS (¡OJO: Debe ir antes de /:id!) ---
router.get("/stats", getDashboardStats);

// --- RUTAS DE EXPORTACIÓN / IMPORTACIÓN ---
router.get("/export/csv", exportOTsCSV);
router.post("/import/csv", upload.single("file"), importOTs);

// --- RUTAS CRUD ---
router.post("/", createOT);
router.get("/", getOTs);
router.get("/:id", getOTById);
router.put("/:id", updateOT);
router.delete("/:id", deleteOT);

export default router;