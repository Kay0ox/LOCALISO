export default function Mensagem({ mensagem, aoFechar }) {
  if (!mensagem) return null; // nada para mostrar

  return (
    <div className={`mensagem ${mensagem.tipo}`}>
      <span>{mensagem.texto}</span>
      <button className="fechar" onClick={aoFechar}>×</button>
    </div>
  );
}