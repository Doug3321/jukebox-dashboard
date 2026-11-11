import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../custom/components/Card";
import { TOOLTIP_STYLE } from "../../custom/theme/chartTheme";

export default function PopularidadeChart({ faixas }) {
  return (
    <Card titulo="📊 Distribuição de popularidade" subtitulo="Quantidade de músicas por faixa">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={faixas} margin={{ top: 10, right: 10, left: 0 }}>
          <defs>
            <linearGradient id="gradPop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2EC5FF" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#2EC5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="faixa" stroke="#9aa0b4" fontSize={12} />
          <YAxis stroke="#9aa0b4" fontSize={12} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "Músicas"]} />
          <Area type="monotone" dataKey="total_musicas" stroke="#2EC5FF" strokeWidth={3} fill="url(#gradPop)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
