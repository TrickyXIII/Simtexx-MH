import { Router } from "express";
import { exportExcelOT } from "../controllers/excel.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/ot/:id/export", verifyToken, exportExcelOT);

export default router;