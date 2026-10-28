import femCostas from "@/assets/silhueta-feminina-costas.png.asset.json";
import femFrente from "@/assets/silhueta-feminina-frente.png.asset.json";
import mascCostas from "@/assets/silhueta-masculina-costas.png.asset.json";
import mascFrente from "@/assets/silhueta-masculina-frente.png.asset.json";
import { bodyMeasurements, SILHUETAS, type SexoSilhueta, type VistaSilhueta } from "@/lib/assessment/anthropometry-body";
import { rotuloIndicador, valorComUnidade, type CategoriaAntropometrica } from "@/lib/assessment/anthropometry-groups";
import type { IndicadorAntropometrico } from "@/lib/assessment/types";

const imagens: Record<SexoSilhueta, Record<VistaSilhueta, string>> = {
  masculino: { front: mascFrente.url, back: mascCostas.url },
  feminino: { front: femFrente.url, back: femCostas.url },
};

let contextoMedicao: CanvasRenderingContext2D | null | undefined;
/** Largura do texto renderizado, medida no cliente; estimativa no SSR. */
function larguraTexto(texto: string, fonte: string): number {
  if (typeof document === "undefined") return texto.length * (fonte.includes("mono") ? 8.4 : 5.8);
  contextoMedicao ??= document.createElement("canvas").getContext("2d");
  if (!contextoMedicao) return texto.length * 6;
  contextoMedicao.font = fonte;
  return contextoMedicao.measureText(texto).width;
}

export function AnthropometryBody({ indicadores, categoria, sexo }: { indicadores: IndicadorAntropometrico[]; categoria: CategoriaAntropometrica; sexo: SexoSilhueta }) {
  const measurements = bodyMeasurements(indicadores, categoria, sexo);
  const views = categoria === "Dobras cutâneas" ? (["front", "back"] as const) : (["front"] as const);
  const ladoALado = views.length > 1;
  return (
    <div className={ladoALado ? "overflow-x-auto" : undefined}>
    <div className={`grid items-start gap-4 ${ladoALado ? "w-max grid-cols-2" : "grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))]"}`}>
      {views.map(view => {
        const items = measurements.filter(m => m.site.view === view);
        // Place labels in two rails with stable spacing, retaining exact anatomical markers.
        const labels = [true, false].flatMap(left => {
          const entries = items.filter(m => (m.site.x <= 180) === left).sort((a, b) => a.site.y - b.site.y);
          let previous = 84;
          return entries.map((m, index) => {
            const y = Math.min(490 - (entries.length - index - 1) * 52, Math.max(m.site.y, previous + 52));
            previous = y;
            return { ...m, labelY: y, left };
          });
        });
        const silhueta = SILHUETAS[sexo][view];
        return (
          <figure key={view} className={ladoALado ? "w-[590px]" : "mx-auto w-full max-w-[590px]"}>
            <svg viewBox="0 0 640 540" className="h-auto w-full overflow-visible" role="img" aria-label={categoria}>
              <image href={imagens[sexo][view]} x={silhueta.x + 160} y={silhueta.y} width={silhueta.width} height={silhueta.height} />
              {labels.map(({ indicador, site, labelY, left }) => {
                const rotulo = rotuloIndicador(indicador.nome, categoria);
                const valor = valorComUnidade(indicador, categoria);
                const largura = Math.ceil(Math.max(larguraTexto(rotulo, "11px sans-serif"), larguraTexto(valor, "bold 14px monospace"))) + 14;
                return (
                <g key={indicador.id}>
                  <title>{`${rotulo}: ${valor}`}</title>
                  <path d={`M${site.x + 160} ${site.y} L${left ? 270 : 410} ${labelY} H${left ? 52 : 598}`} className="fill-none stroke-accent/50" strokeWidth="1" />
                  <circle cx={site.x + 160} cy={site.y} r="3" className="fill-accent" />
                  <rect x={left ? 40 : 640 - largura} y={labelY - 35} width={largura} height="32" rx="3" className="fill-paper" />
                  <text x={left ? 48 : 632} y={labelY - 24} textAnchor={left ? "start" : "end"} className="fill-ink-soft text-[11px]">
                    {rotulo}
                  </text>
                  <text x={left ? 48 : 632} y={labelY - 9} textAnchor={left ? "start" : "end"} className="fill-accent font-mono text-[14px] font-semibold">{valor}</text>
                </g>
                );
              })}
            </svg>
          </figure>
        );
      })}
    </div>
    </div>
  );
}
