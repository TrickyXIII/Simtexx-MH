import { Router } from "express";
import { exportExcelOT } from "../controllers/excel.controller.js";

const router = Router();

router.get("/ot/:id/export", exportExcelOT);

export default router;
