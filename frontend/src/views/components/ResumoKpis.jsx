import { fmtDec, fmtNum } from "../../custom/utils/formatters";
import KpiCard from "../../custom/components/KpiCard";

export default function ResumoKpis({ resumo }) {
  if (!resumo) return null;
  return (
    <div className="kpis">
      <KpiCard icone="🎵" rotulo="Músicas" valor={fmtNum(resumo.total_musicas)} cor="#1DB954" />
      <KpiCard icone="🎤" rotulo="Artistas" valor={fmtNum(resumo.total_artistas)} cor="#7C5CFF" />
      <KpiCard icone="💿" rotulo="Álbuns" valor={fmtNum(resumo.total_albuns)} cor="#FF5C8A" />
      <KpiCard icone="🏷️" rotulo="Gêneros" valor={fmtNum(resumo.total_generos)} cor="#FFB547" />
      <KpiCard icone="🔥" rotulo="Popularidade média" valor={fmtDec(resumo.popularidade_media, 1)}
        detalhe="escala 0–100" cor="#2EC5FF" />
      <KpiCard icone="💃" rotulo="Dançabilidade média" valor={fmtDec(resumo.dancabilidade_media, 3)}
        detalhe={`${fmtDec(resumo.duracao_media_min, 2)} min de duração média`} cor="#A3E635" />
      <KpiCard icone="🔞" rotulo="Explícitas" valor={`${fmtDec(resumo.percentual_improprio, 1)}%`}
        cor="#F97316" />
    </div>
  );
}
