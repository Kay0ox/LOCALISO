const API_URL = "http://localhost:3000";

let aoExpirarSessao = null;
export function definirAoExpirarSessao(funcao) {
  aoExpirarSessao = funcao;
}

export async function api(caminho, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");

  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Ela está rodando?");
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && token && aoExpirarSessao) {
      aoExpirarSessao();
    }
    throw new Error(dados?.erro || `Erro ${resposta.status}`);
  }

  return dados;
}