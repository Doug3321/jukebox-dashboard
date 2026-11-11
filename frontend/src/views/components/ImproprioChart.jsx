import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "../../custom/components/Card";
import { TOOLTIP_STYLE } from "../../custom/theme/chartTheme";
import { fmtDec } from "../../custom/utils/formatters";

export default function ImproprioChart({ dados }) {
  const cores = { Livre: "#00E676", "Explícita": "#EF4444" };
  return (
    <Card titulo="🔞 Explícitas vs. Livres" subtitulo="Distribuição do conteúdo impróprio">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={dados} dataKey="total_musicas" nameKey="classificacao"
            innerRadius={60} outerRadius={95} paddingAngle={4}>
            {dados.map((d) => <Cell key={d.classificacao} fill={cores[d.classificacao]} stroke="#0d131f" strokeWidth={3} />)}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
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
