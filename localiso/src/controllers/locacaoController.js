import * as locacaoService from "../services/locacaoService.js";

export async function criar(req, res) {
  // req.usuario.id vem do token. Se o cliente mandar "usuarioId" no JSON, é ignorado.
  const locacao = await locacaoService.criarLocacao(req.usuario.id, req.body ?? {});
  res.status(201).json(locacao);
}

export async function listarMinhas(req, res) {
  const locacoes = await locacaoService.listarLocacoesDoUsuario(req.usuario.id, { status: req.query.status });
  res.status(200).json(locacoes);
}

export async function buscarPorId(req, res) {
  const locacao = await locacaoService.buscarLocacaoDoUsuario(req.usuario.id, req.params.id);
  res.status(200).json(locacao);
}

export async function finalizar(req, res) {
  const locacao = await locacaoService.finalizarLocacao(req.usuario.id, req.params.id);
  res.status(200).json(locacao);
}
