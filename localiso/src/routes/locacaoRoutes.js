import { Router } from "express";
import * as locacaoController from "../controllers/locacaoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar);

router.post("/", locacaoController.criar);
router.get("/", locacaoController.listarMinhas);              
router.get("/:id", locacaoController.buscarPorId);
router.patch("/:id/finalizar", locacaoController.finalizar);  

export default router;