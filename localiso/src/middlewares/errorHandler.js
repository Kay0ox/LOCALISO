import { Prisma } from "@prisma/client";
import AppError from "../errors/AppError.js";

export function rotaNaoEncontrada(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}


export function tratarErros(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ erro: err.message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ erro: "Já existe um registro com esse valor único (e-mail ou placa)." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ erro: "Registro não encontrado." });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ erro: "Referência inválida a outro registro." });
    }
  }
  console.error("Erro inesperado:", err);
  return res.status(500).json({ erro: "Erro interno do servidor." });
}