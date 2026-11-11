import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../custom/components/Card";
import { CORES, TOOLTIP_STYLE } from "../../custom/theme/chartTheme";

const ROTULOS = {
  total_musicas: "Qtd. de músicas",
  popularidade_media: "Popularidade média",
  dancabilidade_media: "Dançabilidade média",
};

export default function GenerosChart({ generos, ordenarPor, onOrdenarChange, onSelecionar, generoAtivo }) {
  return (
    <Card
      titulo="🏷️ Gêneros em destaque"
      subtitulo="Clique numa barra para filtrar o dashboard"
      acoes={
        <select value={ordenarPor} onChange={(e) => onOrdenarChange(e.target.value)}>
          {Object.entries(ROTULOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={generos} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="genero" stroke="#94a3b8" angle={-35} textAnchor="end" interval={0} fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: "#ffffff10" }} formatter={(v) => [v, ROTULOS[ordenarPor]]} />
          <Bar dataKey={ordenarPor} radius={[8, 8, 0, 0]} onClick={(d) => onSelecionar(d.genero)} cursor="pointer">
            {generos.map((g, i) => (
              <Cell key={g.genero} fill={CORES[i % CORES.length]}
                opacity={generoAtivo && generoAtivo !== g.genero ? 0.3 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
