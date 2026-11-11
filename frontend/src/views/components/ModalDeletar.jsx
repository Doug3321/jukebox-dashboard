export default function ModalDeletar({ aberto, onFechar, onConfirmar, musicaParaDeletar }) {
  if (!aberto || !musicaParaDeletar) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-danger">
        <div className="modal-header">
          <h3 style={{ color: "#FF5C8A" }}>🗑️ Exclusão de Música (DELETE Real)</h3>
          <button className="modal-close" onClick={onFechar}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: "16px 0" }}>
          <p style={{ fontSize: "14px", marginBottom: "12px" }}>
            Você tem certeza que deseja <strong>remover permanentemente</strong> a música:
          </p>
          <div style={{ background: "#1a1f2e", padding: "14px", borderRadius: "10px", borderLeft: "4px solid #FF5C8A" }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>
              {musicaParaDeletar.titulo_musica}
            </div>
            <div className="muted small" style={{ marginTop: "4px" }}>
              ID: <code>{musicaParaDeletar.id_musica}</code>
            </div>
            {musicaParaDeletar.artistas && (
              <div className="small" style={{ color: "#7C5CFF", marginTop: "4px" }}>
                Artista(s): {musicaParaDeletar.artistas.join(", ")}
              </div>
            )}
          </div>

          <div style={{ marginTop: "14px", fontSize: "12px", color: "#FFB547", background: "#FFB54715", padding: "10px", borderRadius: "8px" }}>
            ⚠️ <strong>Integridade Referencial:</strong> O backend executará <code>DELETE FROM classifica</code>, <code>DELETE FROM interpreta</code> e <code>DELETE FROM musica</code> garantindo consistência no banco.
          </div>
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
            Confirmar Exclusão (DELETE)
          </button>
        </div>
      </div>
    </div>
  );
}
