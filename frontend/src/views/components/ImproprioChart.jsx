import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../../custom/components/Card";
import { TOOLTIP_STYLE } from "../../custom/theme/chartTheme";
import { fmtDec } from "../../custom/utils/formatters";

export default function ImproprioChart({ dados }) {
  const cores = { Livre: "#1DB954", "Explícita": "#FF5C8A" };
  return (
    <Card titulo="🔞 Explícitas vs. Livres" subtitulo="Distribuição do conteúdo impróprio">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={dados} dataKey="total_musicas" nameKey="classificacao"
            innerRadius={60} outerRadius={95} paddingAngle={3}>
            {dados.map((d) => <Cell key={d.classificacao} fill={cores[d.classificacao]} />)}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mini-stats">
        {dados.map((d) => (
          <div key={d.classificacao}>
            <strong style={{ color: cores[d.classificacao] }}>{d.classificacao}</strong>
            <span>Pop. média: {fmtDec(d.popularidade_media, 1)}</span>
            <span>Dança média: {fmtDec(d.dancabilidade_media, 3)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
