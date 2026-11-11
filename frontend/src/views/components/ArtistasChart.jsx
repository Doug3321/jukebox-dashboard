import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../custom/components/Card";
import { TOOLTIP_STYLE } from "../../custom/theme/chartTheme";
import { truncar } from "../../custom/utils/formatters";

export default function ArtistasChart({ artistas }) {
  return (
    <Card titulo="🎤 Artistas com mais músicas" subtitulo="Quantidade de faixas no catálogo">
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={artistas} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" horizontal={false} />
          <XAxis type="number" stroke="#9aa0b4" fontSize={12} />
          <YAxis type="category" dataKey="artista" width={120} stroke="#9aa0b4" fontSize={12}
            tickFormatter={(t) => truncar(t, 16)} />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: "#ffffff10" }}
            formatter={(v, n) => [v, n === "total_musicas" ? "Músicas" : "Popularidade média"]} />
          <Bar dataKey="total_musicas" fill="#7C5CFF" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
