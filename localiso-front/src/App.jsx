import { useEffect, useState } from "react";
import { api, definirAoExpirarSessao } from "./api.js";
import Mensagem from "./components/Mensagem.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import VeiculosPage from "./pages/VeiculosPage.jsx";
import LocacoesPage from "./pages/LocacoesPage.jsx";

export default function App() {
  const [usuario, setUsuario] = useState(null);         
  const [carregando, setCarregando] = useState(true); 
  const [pagina, setPagina] = useState("veiculos");    
  const [veiculoEscolhido, setVeiculoEscolhido] = useState(""); 
  const [mensagem, setMensagem] = useState(null);     

  function avisar(texto, tipo = "sucesso") {
    setMensagem({ texto, tipo });
  }

  function sair() {
    localStorage.removeItem("token");
    setUsuario(null);
    setPagina("veiculos");
  }

  useEffect(() => {
    definirAoExpirarSessao(() => {
      sair();
      avisar("Sua sessão expirou. Faça login novamente.", "erro");
    });

    const token = localStorage.getItem("token");
    if (!token) {
      setCarregando(false);
      return;
    }
    api("/auth/me")
      .then(setUsuario)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setCarregando(false));
  }, []);

  function aoEntrar(token, dadosUsuario) {
    localStorage.setItem("token", token);
    setUsuario(dadosUsuario);
    avisar(`Bem-vindo, ${dadosUsuario.nome}!`);
  }

  function locarVeiculo(veiculo) {
    setVeiculoEscolhido(String(veiculo.id));
    setPagina("locacoes");
  }

  if (carregando) return <p className="centro">Carregando...</p>;

  return (
    <div className="app">
      <header className="topo">
        <h1>Locadora</h1>
        {usuario && (
          <nav>
            <button className={pagina === "veiculos" ? "ativo" : ""} onClick={() => setPagina("veiculos")}>
              Veículos
            </button>
            <button className={pagina === "locacoes" ? "ativo" : ""} onClick={() => setPagina("locacoes")}>
              Minhas locações
            </button>
            <span className="usuario">Olá, {usuario.nome}</span>
            <button
              onClick={() => {
                sair();
                avisar("Você saiu da conta.");
              }}
            >
              Sair
            </button>
          </nav>
        )}
      </header>

      <Mensagem mensagem={mensagem} aoFechar={() => setMensagem(null)} />

      <main>
        {!usuario && <AuthPage aoEntrar={aoEntrar} avisar={avisar} />}
        {usuario && pagina === "veiculos" && <VeiculosPage avisar={avisar} aoLocar={locarVeiculo} />}
        {usuario && pagina === "locacoes" && (
          <LocacoesPage avisar={avisar} veiculoInicial={veiculoEscolhido} />
        )}
      </main>
    </div>
  );
}