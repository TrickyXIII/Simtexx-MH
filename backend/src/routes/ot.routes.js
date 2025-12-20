import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { 
    getOTs, 
    getOTById, 
    createOT, 
    updateOT, 
    deleteOT, 
    exportOTsCSV,
    importOTs,
    getDashboardStats 
} from "../controllers/ot.controller.js";

const router = Router();
const upload = multer({ dest: 'uploads/' });

// --- MIDDLEWARE GLOBAL ---
// Esto protege TODAS las rutas de abajo, obligando a tener token válido
router.use(verifyToken);

// --- ESTADÍSTICAS ---
router.get("/stats", getDashboardStats);

// --- IMPORTACIÓN / EXPORTACIÓN (Solo Admin/Mantenedor - validado en controlador) ---
router.get("/export/csv", exportOTsCSV);
router.post("/import/csv", upload.single("file"), importOTs);

// --- RUTAS CRUD ---
router.post("/", createOT);
router.get("/", getOTs);
router.get("/:id", getOTById);
router.put("/:id", updateOT);
router.delete("/:id", deleteOT);

export default router;