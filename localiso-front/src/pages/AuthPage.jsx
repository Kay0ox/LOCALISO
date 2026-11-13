import { useState } from "react";
import { api } from "../api.js";

export default function AuthPage({ aoEntrar, avisar }) {
  const [modo, setModo] = useState("login"); // "login" ou "cadastro"
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [enviando, setEnviando] = useState(false);

  function alterar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      if (modo === "cadastro") {
        await api("/auth/registrar", { method: "POST", body: form });
      }
      const { token, usuario } = await api("/auth/login", {
        method: "POST",
        body: { email: form.email, senha: form.senha },
      });
      aoEntrar(token, usuario);
    } catch (erro) {
      avisar(erro.message, "erro");
      setEnviando(false);
    }
  }

  return (
    <section className="cartao estreito">
      <h2>{modo === "login" ? "Entrar" : "Criar conta"}</h2>

      <form onSubmit={enviar}>
        {modo === "cadastro" && (
          <label>
            Nome
            <input name="nome" value={form.nome} onChange={alterar} required minLength={2} />
          </label>
        )}
        <label>
          E-mail
          <input type="email" name="email" value={form.email} onChange={alterar} required />
        </label>
        <label>
          Senha
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={alterar}
            required
            minLength={modo === "cadastro" ? 6 : undefined}
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : modo === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>

      <button className="link" onClick={() => setModo(modo === "login" ? "cadastro" : "login")}>
        {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
      </button>
    </section>
  );
}