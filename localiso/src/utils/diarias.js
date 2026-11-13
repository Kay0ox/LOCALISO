import AppError from "../errors/AppError.js";

export const MS_POR_DIA = 24 * 60 * 60 * 1000; // 86.400.000 ms


export function calcularQuantidadeDiarias(inicio, fim) {
  const diferencaMs = fim.getTime() - inicio.getTime();
  if (diferencaMs <= 0) {
    throw new AppError("A data prevista de devolução deve ser posterior à data de início.", 400);
  }
  return Math.ceil(diferencaMs / MS_POR_DIA);
}