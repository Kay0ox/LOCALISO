import { useEffect, useState } from "react";
import { api } from "../api.js";
import { dataHora, moeda } from "../formatar.js";

export default function LocacoesPage({ avisar, veiculoInicial }) {
  const [disponiveis, setDisponiveis] = useState([]);
  const [locacoes, setLocacoes] = useState([]);
  const [form, setForm] = useState({
    veiculoId: veiculoInicial || "",
    dataInicio: "",
    dataPrevistaDevolucao: "",
  });

  async function carregar() {
    try {
      const [veics, locs] = await Promise.all([api("/veiculos?disponiveis=true"), api("/locacoes")]);
      setDisponiveis(veics);
      setLocacoes(locs);
    } catch (erro) {
      avisar(erro.message, "erro");
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterar(evento) {
    setForm({ ...form, [evento.target.name]: evento.target.value });
  }

  // Prévia do valor só para o usuário ver. O valor OFICIAL é calculado no backend.
  const veiculo = disponiveis.find((v) => v.id === Number(form.veiculoId));
  let previa = null;
  if (veiculo && form.dataInicio && form.dataPrevistaDevolucao) {
    const ms = new Date(form.dataPrevistaDevolucao) - new Date(form.dataInicio);
    if (ms > 0) {
      const diarias = Math.ceil(ms / 86400000);
      previa = `${diarias} diária(s) × ${moeda(veiculo.valorDiaria)} = ${moeda(diarias * Number(veiculo.valorDiaria))}`;
    }
  }

  async function registrar(evento) {
    evento.preventDefault();
    try {
      const nova = await api("/locacoes", {
        method: "POST",
        body: {
          veiculoId: Number(form.veiculoId),
          dataInicio: new Date(form.dataInicio).toISOString(),
          dataPrevistaDevolucao: new Date(form.dataPrevistaDevolucao).toISOString(),
        },
      });
      avisar(`Locação registrada! ${nova.quantidadeDiarias} diária(s), total ${moeda(nova.valorTotal)}.`);
      setForm({ veiculoId: "", dataInicio: "", dataPrevistaDevolucao: "" });
      carregar();
    } catch (erro) {
      avisar(erro.message, "erro");
    }
  }

  async function finalizar(id) {
    if (!confirm("Confirmar a devolução deste veículo?")) return;
    try {
      await api(`/locacoes/${id}/finalizar`, { method: "PATCH" });
      avisar("Locação finalizada. O veículo está disponível de novo.");
      carregar();
    } catch (erro) {
      avisar(erro.message, "erro");
    }
  }

  return (
    <>
      <section className="cartao">
        <h2>Nova locação</h2>
        <form className="grade" onSubmit={registrar}>
          <label>
            Veículo
            <select name="veiculoId" value={form.veiculoId} onChange={alterar} required>
              <option value="">Escolha um veículo disponível</option>
              {disponiveis.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.modelo} ({moeda(v.valorDiaria)}/dia)
                </option>
              ))}
            </select>
          </label>
          <label>
            Início
            <input type="datetime-local" name="dataInicio" value={form.dataInicio} onChange={alterar} required />
          </label>
          <label>
            Devolução prevista
            <input
              type="datetime-local"
              name="dataPrevistaDevolucao"
              value={form.dataPrevistaDevolucao}
              onChange={alterar}
              required
            />
          </label>
          <button type="submit">Locar</button>
        </form>
        {previa && <p className="previa">Estimativa: {previa}</p>}
      </section>

      <section className="cartao">
        <h2>Minhas locações</h2>
        {locacoes.length === 0 ? (
          <p>Você ainda não tem locações.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Veículo</th>
                <th>Início</th>
                <th>Previsão</th>
                <th>Devolução</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {locacoes.map((l) => (
                <tr key={l.id}>
                  <td>{l.veiculo.placa} — {l.veiculo.modelo}</td>
                  <td>{dataHora(l.dataInicio)}</td>
                  <td>{dataHora(l.dataPrevistaDevolucao)}</td>
                  <td>{dataHora(l.dataDevolucao)}</td>
                  <td>{moeda(l.valorTotal)}</td>
                  <td>
                    <span className={l.status === "ATIVA" ? "tag ocupado" : "tag ok"}>{l.status}</span>
                  </td>
                  <td>{l.status === "ATIVA" && <button onClick={() => finalizar(l.id)}>Finalizar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}