import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../custom/components/Card";
import { TOOLTIP_STYLE } from "../../custom/theme/chartTheme";
import { truncar } from "../../custom/utils/formatters";

export default function ArtistasChart({ artistas }) {
  return (
    <Card titulo="🎤 Artistas com mais músicas" subtitulo="Quantidade de faixas no catálogo">
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={artistas} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} />
          <YAxis type="category" dataKey="artista" width={120} stroke="#94a3b8" fontSize={12}
            tickFormatter={(t) => truncar(t, 16)} />
          <Tooltip {...TOOLTIP_STYLE} cursor={{ fill: "#00b0ff12" }}
            formatter={(v, n) => [v, n === "total_musicas" ? "Músicas" : "Popularidade média"]} />
          <Bar dataKey="total_musicas" fill="#00B0FF" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
