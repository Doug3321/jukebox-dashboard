import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Card from "../../custom/components/Card";
import { TOOLTIP_STYLE } from "../../custom/theme/chartTheme";

export default function DancabilidadeChart({ generos }) {
  // Ordena os top 8 gêneros mais dançantes e compara com popularidade
  const dadosComparativos = [...generos]
    .sort((a, b) => b.dancabilidade_media - a.dancabilidade_media)
    .slice(0, 8)
    .map((g) => ({
      genero: g.genero,
      "Dançabilidade (%)": Math.round(g.dancabilidade_media * 100),
      "Popularidade Média": Math.round(g.popularidade_media),
    }));

  return (
    <Card
      titulo="💃 Relação: Dançabilidade vs. Popularidade"
      subtitulo="Top gêneros mais dançantes comparados ao seu índice de popularidade"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={dadosComparativos}
          margin={{ top: 10, right: 10, left: 0, bottom: 35 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="genero"
            stroke="#94a3b8"
            angle={-30}
            textAnchor="end"
            interval={0}
            fontSize={11}
          />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
          />
          <Bar dataKey="Dançabilidade (%)" fill="#00E676" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Popularidade Média" fill="#00B0FF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
