import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import { exigirTexto, validarEmail } from "../utils/validacoes.js";

const SALT_ROUNDS = 10; 

const camposPublicos = { id: true, nome: true, email: true, criadoEm: true };

export async function cadastrarUsuario({ nome, email, senha }) {
  const nomeValido = exigirTexto(nome, "nome", { min: 2, max: 100 });
  const emailValido = validarEmail(email);
  const senhaValida = exigirTexto(senha, "senha", { min: 6, max: 72 });

  const existente = await prisma.usuario.findUnique({ where: { email: emailValido } });
  if (existente) {
    throw new AppError("Já existe um usuário cadastrado com esse e-mail.", 409);
  }

  const senhaHash = await bcrypt.hash(senhaValida, SALT_ROUNDS); 

  return prisma.usuario.create({
    data: { nome: nomeValido, email: emailValido, senhaHash },
    select: camposPublicos,
  });
}

export async function login({ email, senha }) {
  const emailValido = validarEmail(email);
  const senhaInformada = exigirTexto(senha, "senha");

  const usuario = await prisma.usuario.findUnique({ where: { email: emailValido } });
  const senhaConfere = usuario ? await bcrypt.compare(senhaInformada, usuario.senhaHash) : false;

  if (!usuario || !senhaConfere) {
    throw new AppError("E-mail ou senha inválidos.", 401);
  }

  const token = jwt.sign(
    { email: usuario.email },
    process.env.JWT_SECRET,
    { subject: String(usuario.id), expiresIn: process.env.JWT_EXPIRES_IN || "1h", algorithm: "HS256" }
  );

  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, criadoEm: usuario.criadoEm },
  };
}

export async function buscarPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId }, select: camposPublicos });
  if (!usuario) {
    throw new AppError("Usuário não encontrado.", 404);
  }
  return usuario;
}