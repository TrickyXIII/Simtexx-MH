import { Router } from "express";
import { exportPdfOT } from "../controllers/pdf.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/ot/:id/export", verifyToken, exportPdfOT);

export default router;