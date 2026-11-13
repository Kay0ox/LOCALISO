import { useEffect, useState } from "react";
import { api } from "../api.js";
import { moeda } from "../formatar.js";

const formVazio = { marca: "", modelo: "", placa: "", valorDiaria: "" };

export default function VeiculosPage({ avisar, aoLocar }) {
  const [veiculos, setVeiculos] = useState([]);
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);
  const [form, setForm] = useState(formVazio);

  async function carregar() {
    try {
      const caminho = somenteDisponiveis ? "/veiculos?disponiveis=true" : "/veiculos";
      setVeiculos(await api(caminho));
    } catch (erro) {
      avisar(erro.message, "erro");
    }
  }

  useEffect(() => {
    carregar();
  }, [somenteDisponiveis]);

  function alterar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  async function cadastrar(evento) {
    evento.preventDefault();
    try {
      const novo = await api("/veiculos", { method: "POST", body: form });
      avisar(`Veículo ${novo.placa} cadastrado!`);
      setForm(formVazio); // limpa o formulário
      carregar();         // atualiza a lista
    } catch (erro) {
      avisar(erro.message, "erro"); // ex.: placa repetida (409)
    }
  }

  return (
    <>
      <section className="cartao">
        <h2>Cadastrar veículo</h2>
        <form className="grade" onSubmit={cadastrar}>
          <label>
            Marca
            <input name="marca" value={form.marca} onChange={alterar} required />
          </label>
          <label>
            Modelo
            <input name="modelo" value={form.modelo} onChange={alterar} required />
          </label>
          <label>
            Placa
            <input name="placa" value={form.placa} onChange={alterar} placeholder="ABC1D23" required />
          </label>
          <label>
            Diária (R$)
            <input
              type="number"
              name="valorDiaria"
              value={form.valorDiaria}
              onChange={alterar}
              min="0.01"
              step="0.01"
              required
            />
          </label>
          <button type="submit">Cadastrar</button>
        </form>
      </section>

      <section className="cartao">
        <div className="titulo-linha">
          <h2>Frota</h2>
          <label className="check">
            <input
              type="checkbox"
              checked={somenteDisponiveis}
              onChange={(evento) => setSomenteDisponiveis(evento.target.checked)}
            />
            Só disponíveis
          </label>
        </div>

        {veiculos.length === 0 ? (
          <p>Nenhum veículo encontrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Veículo</th>
                <th>Diária</th>
                <th>Situação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.placa}</td>
                  <td>{v.marca} {v.modelo}</td>
                  <td>{moeda(v.valorDiaria)}</td>
                  <td>
                    <span className={v.disponivel ? "tag ok" : "tag ocupado"}>
                      {v.disponivel ? "Disponível" : "Locado"}
                    </span>
                  </td>
                  <td>{v.disponivel && <button onClick={() => aoLocar(v)}>Locar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}