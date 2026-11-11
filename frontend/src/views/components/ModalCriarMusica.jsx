import { useState } from "react";

export default function ModalCriarMusica({ aberto, onFechar, onSalvar, listaGeneros, cantores }) {
  const [form, setForm] = useState({
    titulo_musica: "",
    artista: "",
    album: "",
    genero: "pop",
    duracao_min: 3.5,
    popularidade: 70,
    dancabilidade: 0.65,
    improprio: false,
  });

  if (!aberto) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo_musica || !form.artista || !form.album) {
      alert("Por favor, preencha Título, Artista e Álbum.");
      return;
    }
    onSalvar(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>➕ Nova Música</h3>
          <button className="modal-close" onClick={onFechar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Título da Música *</label>
            <input
              type="text"
              required
              placeholder="Ex: Blinding Lights"
              value={form.titulo_musica}
              onChange={(e) => setForm({ ...form, titulo_musica: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Artista *</label>
              <input
                type="text"
                required
                placeholder="Ex: The Weeknd"
                list="artistas-sugestoes"
                value={form.artista}
                onChange={(e) => setForm({ ...form, artista: e.target.value })}
              />
              <datalist id="artistas-sugestoes">
                {cantores.slice(0, 30).map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Álbum *</label>
              <input
                type="text"
                required
                placeholder="Ex: After Hours"
                value={form.album}
                onChange={(e) => setForm({ ...form, album: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gênero</label>
              <select
                value={form.genero}
                onChange={(e) => setForm({ ...form, genero: e.target.value })}
              >
                {listaGeneros.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Duração (minutos)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={form.duracao_min}
                onChange={(e) => setForm({ ...form, duracao_min: parseFloat(e.target.value) || 3 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Popularidade: {form.popularidade}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.popularidade}
                onChange={(e) => setForm({ ...form, popularidade: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Dançabilidade: {form.dancabilidade}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={form.dancabilidade}
                onChange={(e) => setForm({ ...form, dancabilidade: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="improprio_check"
              checked={form.improprio}
              onChange={(e) => setForm({ ...form, improprio: e.target.checked })}
              style={{ width: "18px", height: "18px" }}
            />
            <label htmlFor="improprio_check" style={{ margin: 0, cursor: "pointer", color: "#cbd5e1" }}>
              Conteúdo Explícito
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancelar" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              Salvar Música
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
