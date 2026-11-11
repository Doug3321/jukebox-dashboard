export default function ModalDeletar({ aberto, onFechar, onConfirmar, musicaParaDeletar }) {
  if (!aberto || !musicaParaDeletar) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-danger">
        <div className="modal-header">
          <h3 style={{ color: "#EF4444" }}>🗑️ Excluir Música</h3>
          <button className="modal-close" onClick={onFechar}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: "16px 0" }}>
          <p style={{ fontSize: "14px", marginBottom: "12px", color: "#cbd5e1" }}>
            Tem certeza de que deseja remover esta música do catálogo?
          </p>
          <div style={{ background: "#0a0e1a", padding: "14px", borderRadius: "10px", borderLeft: "4px solid #EF4444" }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>
              {musicaParaDeletar.titulo_musica}
            </div>
            <div className="muted small" style={{ marginTop: "4px" }}>
              Álbum: {musicaParaDeletar.nome_album || "Não informado"}
            </div>
            {musicaParaDeletar.artistas && (
              <div className="small" style={{ color: "#00B0FF", marginTop: "4px" }}>
                Artista: {musicaParaDeletar.artistas.join(", ")}
              </div>
            )}
          </div>

          <p className="muted small" style={{ marginTop: "14px" }}>
            Esta ação removerá o registro e todas as relações associadas de forma permanente.
          </p>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-cancelar" onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-excluir"
            onClick={() => onConfirmar(musicaParaDeletar.id_musica)}
          >
            Excluir Música
          </button>
        </div>
      </div>
    </div>
  );
}
