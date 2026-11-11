import { fmtDec, fmtNum } from "../../custom/utils/formatters";
import KpiCard from "../../custom/components/KpiCard";

export default function ResumoKpis({ resumo }) {
  if (!resumo) return null;
  return (
    <div className="kpis">
      <KpiCard icone="🎵" rotulo="Músicas" valor={fmtNum(resumo.total_musicas)} cor="#00E676" />
      <KpiCard icone="🎤" rotulo="Artistas" valor={fmtNum(resumo.total_artistas)} cor="#00B0FF" />
      <KpiCard icone="💿" rotulo="Álbuns" valor={fmtNum(resumo.total_albuns)} cor="#3B82F6" />
      <KpiCard icone="🏷️" rotulo="Gêneros" valor={fmtNum(resumo.total_generos)} cor="#10B981" />
      <KpiCard icone="🔥" rotulo="Popularidade média" valor={fmtDec(resumo.popularidade_media, 1)}
        detalhe="escala 0–100" cor="#00B0FF" />
      <KpiCard icone="💃" rotulo="Dançabilidade média" valor={fmtDec(resumo.dancabilidade_media, 3)}
        detalhe={`${fmtDec(resumo.duracao_media_min, 2)} min média`} cor="#00E676" />
      <KpiCard icone="🔞" rotulo="Explícitas" valor={`${fmtDec(resumo.percentual_improprio, 1)}%`}
        cor="#EF4444" />
    </div>
  );
}
