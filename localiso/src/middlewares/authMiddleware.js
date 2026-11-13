import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";

export function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    throw new AppError("Token não informado. Envie Authorization: Bearer <token>.", 401);
  }

  const [tipo, token] = header.split(" "); 
  if (tipo !== "Bearer" || !token) {
    throw new AppError("Formato do token inválido. Use: Bearer <token>.", 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    req.usuario = { id: Number(payload.sub), email: payload.email };
    return next();
  } catch (erro) {
    if (erro.name === "TokenExpiredError") {
      throw new AppError("Token expirado. Faça login novamente.", 401);
    }
    throw new AppError("Token inválido.", 401);
  }
}