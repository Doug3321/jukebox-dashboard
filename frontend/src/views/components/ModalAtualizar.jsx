import { useState, useEffect } from "react";

export default function ModalAtualizar({ aberto, onFechar, onSalvar, itemPreDefinido }) {
  const [tipo, setTipo] = useState("musica");
  const [identificador, setIdentificador] = useState("");
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    if (itemPreDefinido) {
      setTipo(itemPreDefinido.tipo || "musica");
      setIdentificador(itemPreDefinido.identificador || itemPreDefinido.id_musica || "");
      setNovoNome(itemPreDefinido.novoNome || itemPreDefinido.titulo_musica || "");
    }
  }, [itemPreDefinido, aberto]);

  if (!aberto) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identificador.trim() || !novoNome.trim()) {
      alert("Por favor, preencha o item a ser atualizado e o novo nome.");
      return;
    }
    onSalvar({ tipo, identificador: identificador.trim(), novo_nome: novoNome.trim() });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>✏️ Atualizar Registro (UPDATE)</h3>
          <button className="modal-close" onClick={onFechar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>O que você deseja atualizar?</label>
            <div className="tipo-selector">
              <button
                type="button"
                className={`btn-tipo ${tipo === "musica" ? "ativo" : ""}`}
                onClick={() => setTipo("musica")}
              >
                🎵 Nome da Música
              </button>
              <button
                type="button"
                className={`btn-tipo ${tipo === "artista" ? "ativo" : ""}`}
                onClick={() => setTipo("artista")}
              >
                🎤 Nome do Artista
              </button>
              <button
                type="button"
                className={`btn-tipo ${tipo === "album" ? "ativo" : ""}`}
                onClick={() => setTipo("album")}
              >
                💿 Nome do Álbum
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>
              {tipo === "musica"
                ? "ID ou Título Atual da Música *"
                : tipo === "artista"
                ? "Nome Atual do Artista *"
                : "Nome Atual do Álbum *"}
            </label>
            <input
              type="text"
              required
              placeholder={
                tipo === "musica"
                  ? "Ex: ID da música ou título"
                  : tipo === "artista"
                  ? "Ex: The Weeknd"
                  : "Ex: After Hours"
              }
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Novo Nome Desejado *</label>
            <input
              type="text"
              required
              placeholder="Digite o novo nome..."
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              Confirmar Atualização (UPDATE)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
