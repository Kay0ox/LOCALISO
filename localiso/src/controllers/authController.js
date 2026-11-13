import * as authService from "../services/authService.js";

export async function registrar(req, res) {
  const usuario = await authService.cadastrarUsuario(req.body ?? {});
  res.status(201).json(usuario); // 201 = Created
}

export async function login(req, res) {
  const resultado = await authService.login(req.body ?? {});
  res.status(200).json(resultado);
}

export async function perfil(req, res) {
  const usuario = await authService.buscarPerfil(req.usuario.id);
  res.status(200).json(usuario);
}