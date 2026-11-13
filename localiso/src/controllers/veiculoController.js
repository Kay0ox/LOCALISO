import * as veiculoService from "../services/veiculoService.js";

export async function criar(req, res) {
  const veiculo = await veiculoService.cadastrarVeiculo(req.body ?? {});
  res.status(201).json(veiculo);
}

export async function listar(req, res) {
  const somenteDisponiveis = req.query.disponiveis === "true";
  const veiculos = await veiculoService.listarVeiculos({ somenteDisponiveis });
  res.status(200).json(veiculos);
}

export async function buscarPorId(req, res) {
  const veiculo = await veiculoService.buscarVeiculoPorId(req.params.id);
  res.status(200).json(veiculo);
}