import { Router } from "express";
import { exportPdfOT } from "../controllers/pdf.controller.js";

const router = Router();

router.get("/ot/:id/export", exportPdfOT);

export default router;
