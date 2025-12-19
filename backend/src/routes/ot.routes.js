import { Router } from "express";
import { pool } from "../db.js";
import PDFDocument from "pdfkit";
import { getOTs, getOTById, createOT, updateOT, deleteOT } from "../controllers/ot.controller.js";

const router = Router();

// --- RUTAS DE EXPORTACIÓN (Primero) ---
// (Mantenemos la lógica de exportación aquí por simplicidad, o podrías moverla a un controlador aparte si prefieres)
router.get("/export/csv", async (req, res) => {
    // ... (Mantén tu lógica de CSV actual o cópiala del chat anterior si la borraste)
    // Para no hacer este mensaje eterno, asumo que dejas la lógica de CSV/PDF aquí o la mueves a un controller.
    // Si necesitas el código completo de exportación avísame.
    try {
        const result = await pool.query(`SELECT * FROM ot ORDER BY id_ot ASC`);
        // ... lógica CSV ...
        res.send("CSV Generado"); 
    } catch(e) { res.status(500).json({error: e.message}) }
});

router.get("/:id/export/csv", async (req, res) => {
    // ... lógica CSV individual ...
     try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM ot WHERE id_ot = $1", [id]);
        // ... generar csv ...
        res.send("CSV Individual");
    } catch(e) { res.status(500).json({error: e.message}) }
});

// --- RUTAS CRUD (Usando el Controlador) ---
router.post("/", createOT);
router.get("/", getOTs);
router.get("/:id", getOTById);
router.put("/:id", updateOT);
router.delete("/:id", deleteOT);

export default router;