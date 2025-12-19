import { Router } from "express";
import multer from "multer";
import { 
    getOTs, 
    getOTById, 
    createOT, 
    updateOT, 
    deleteOT, 
    exportOTsCSV,
    importOTs 
} from "../controllers/ot.controller.js";

const router = Router();
const upload = multer({ dest: 'uploads/' });

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