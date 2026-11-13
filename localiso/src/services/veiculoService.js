import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import { converterId, exigirTexto, normalizarPlaca, validarValorDiaria } from "../utils/validacoes.js";

export async function cadastrarVeiculo({ marca, modelo, placa, valorDiaria }) {
  const dados = {
    marca: exigirTexto(marca, "marca", { max: 50 }),
    modelo: exigirTexto(modelo, "modelo", { max: 80 }),
    placa: normalizarPlaca(placa),
    valorDiaria: validarValorDiaria(valorDiaria),
  };

  const existente = await prisma.veiculo.findUnique({ where: { placa: dados.placa } });
  if (existente) {
    throw new AppError(`Já existe um veículo com a placa ${dados.placa}.`, 409);
  }

  return prisma.veiculo.create({ data: dados }); // true é o padrão 
}

export async function listarVeiculos({ somenteDisponiveis = false } = {}) {
  return prisma.veiculo.findMany({
    where: somenteDisponiveis ? { disponivel: true } : undefined,
    orderBy: { id: "asc" },
  });
}

export async function buscarVeiculoPorId(id) {
  const veiculoId = converterId(id, "id");
  const veiculo = await prisma.veiculo.findUnique({ where: { id: veiculoId } });
  if (!veiculo) {
    throw new AppError("Veículo não encontrado.", 404);
  }
  return veiculo;
}