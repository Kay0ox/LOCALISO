import { Router } from "express";
import * as veiculoController from "../controllers/veiculoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticar); 

router.post("/", veiculoController.criar);
router.get("/", veiculoController.listar);
router.get("/:id", veiculoController.buscarPorId);

export default router;