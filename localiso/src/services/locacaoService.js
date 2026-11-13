import { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import { calcularQuantidadeDiarias } from "../utils/diarias.js";
import { converterData, converterId } from "../utils/validacoes.js";

const incluirVeiculo = {
  veiculo: { select: { id: true, marca: true, modelo: true, placa: true, valorDiaria: true } },
};

export async function criarLocacao(usuarioId, { veiculoId, dataInicio, dataPrevistaDevolucao }) {
  const idVeiculo = converterId(veiculoId, "veiculoId");
  const inicio = dataInicio ? converterData(dataInicio, "dataInicio") : new Date();
  const fimPrevisto = converterData(dataPrevistaDevolucao, "dataPrevistaDevolucao");
  if (fimPrevisto <= inicio) {
    throw new AppError("A data prevista de devolução deve ser posterior à data de início.", 400);
  }
  const quantidadeDiarias = calcularQuantidadeDiarias(inicio, fimPrevisto);


  const locacao = await prisma.$transaction(async (tx) => {
    const veiculo = await tx.veiculo.findUnique({ where: { id: idVeiculo } });
    if (!veiculo) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    
    const reserva = await tx.veiculo.updateMany({
      where: { id: idVeiculo, disponivel: true },
      data: { disponivel: false },
    });
    if (reserva.count === 0) {
      throw new AppError("Veículo indisponível: já existe uma locação ativa para ele.", 409);
    }


    const valorTotal = new Prisma.Decimal(veiculo.valorDiaria).mul(quantidadeDiarias);

    return tx.locacao.create({
      data: {
        usuarioId, 
        veiculoId: idVeiculo,
        dataInicio: inicio,
        dataPrevistaDevolucao: fimPrevisto,
        valorTotal,
        status: "ATIVA",
      },
      include: incluirVeiculo,
    });
  });

  return { ...locacao, quantidadeDiarias };
}

export async function listarLocacoesDoUsuario(usuarioId, { status } = {}) {
  if (status && !["ATIVA", "FINALIZADA"].includes(status)) {
    throw new AppError('Filtro "status" inválido. Use ATIVA ou FINALIZADA.', 400);
  }
  return prisma.locacao.findMany({
    where: { usuarioId, ...(status ? { status } : {}) }, 
    include: incluirVeiculo,
    orderBy: { dataInicio: "desc" },
  });
}

export async function buscarLocacaoDoUsuario(usuarioId, id) {
  const locacaoId = converterId(id, "id");
  const locacao = await prisma.locacao.findUnique({ where: { id: locacaoId }, include: incluirVeiculo });
  if (!locacao) {
    throw new AppError("Locação não encontrada.", 404);
  }
  if (locacao.usuarioId !== usuarioId) {
    throw new AppError("Você não tem permissão para acessar esta locação.", 403);
  }
  return locacao;
}

export async function finalizarLocacao(usuarioId, id) {
  const locacaoId = converterId(id, "id");

  return prisma.$transaction(async (tx) => {
    const locacao = await tx.locacao.findUnique({ where: { id: locacaoId } });
    if (!locacao) {
      throw new AppError("Locação não encontrada.", 404);
    }
    if (locacao.usuarioId !== usuarioId) {
      throw new AppError("Você não tem permissão para finalizar esta locação.", 403);
    }
    if (locacao.status === "FINALIZADA" || locacao.dataDevolucao !== null) {
      throw new AppError("Esta locação já foi finalizada.", 409);
    }

    
    const resultado = await tx.locacao.updateMany({
      where: { id: locacaoId, status: "ATIVA", dataDevolucao: null },
      data: { status: "FINALIZADA", dataDevolucao: new Date() },
    });
    if (resultado.count === 0) {
      throw new AppError("Esta locação já foi finalizada.", 409);
    }

    
    await tx.veiculo.update({ where: { id: locacao.veiculoId }, data: { disponivel: true } });

    return tx.locacao.findUnique({ where: { id: locacaoId }, include: incluirVeiculo });
  });
}