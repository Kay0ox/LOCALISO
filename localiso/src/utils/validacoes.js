import AppError from "../errors/AppError.js";

export function exigirTexto(valor, campo, { min = 1, max = 255 } = {}) {
  if (typeof valor !== "string" || valor.trim().length < min) {
    const extra = min > 1 ? ` e ter pelo menos ${min} caracteres` : "";
    throw new AppError(`O campo "${campo}" é obrigatório${extra}.`, 400);
  }
  const texto = valor.trim();
  if (texto.length > max) {
    throw new AppError(`O campo "${campo}" deve ter no máximo ${max} caracteres.`, 400);
  }
  return texto;
}

export function validarEmail(valor) {
  const email = exigirTexto(valor, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("E-mail em formato inválido.", 400);
  }
  return email;
}
export function converterId(valor, campo = "id") {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError(`O campo "${campo}" deve ser um número inteiro positivo.`, 400);
  }
  return numero;
}

export function converterData(valor, campo) {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new AppError(`O campo "${campo}" é obrigatório (ex.: 2026-11-10T10:00:00-03:00).`, 400);
  }
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    throw new AppError(`O campo "${campo}" não é uma data válida.`, 400);
  }
  return data;
}

export function normalizarPlaca(valor) {
  const placa = exigirTexto(valor, "placa", { max: 10 }).toUpperCase().replace(/[\s-]/g, "");
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa)) {
    throw new AppError("Placa inválida. Use ABC1234 ou ABC1D23.", 400);
  }
  return placa;
}

export function validarValorDiaria(valor) {
  const texto = typeof valor === "number" ? String(valor) : valor;
  if (typeof texto !== "string" || !/^\d+(\.\d{1,2})?$/.test(texto.trim())) {
    throw new AppError('O campo "valorDiaria" deve ser um número positivo com até 2 casas (ex.: 150.50).', 400);
  }
  const numero = Number(texto);
  if (numero <= 0) {
    throw new AppError('O campo "valorDiaria" deve ser maior que zero.', 400);
  }
  if (numero > 99999999.99) {
    throw new AppError('O campo "valorDiaria" excede o valor máximo.', 400);
  }
  return texto.trim();
}