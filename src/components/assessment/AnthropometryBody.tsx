import femCostas from "@/assets/silhueta-feminina-costas.png.asset.json";
import femFrente from "@/assets/silhueta-feminina-frente.png.asset.json";
import mascCostas from "@/assets/silhueta-masculina-costas.png.asset.json";
import mascFrente from "@/assets/silhueta-masculina-frente.png.asset.json";
import { bodyMeasurements, SILHUETAS, type SexoSilhueta, type VistaSilhueta } from "@/lib/assessment/anthropometry-body";
import { valorComUnidade, type CategoriaAntropometrica } from "@/lib/assessment/anthropometry-groups";
import type { IndicadorAntropometrico } from "@/lib/assessment/types";

const imagens: Record<SexoSilhueta, Record<VistaSilhueta, string>> = {
  masculino: { front: mascFrente.url, back: mascCostas.url },
  feminino: { front: femFrente.url, back: femCostas.url },
};

export function AnthropometryBody({ indicadores, categoria, sexo }: { indicadores: IndicadorAntropometrico[]; categoria: CategoriaAntropometrica; sexo: SexoSilhueta }) {
  const measurements = bodyMeasurements(indicadores, categoria, sexo);
  const views = categoria === "Dobras cutâneas" ? (["front", "back"] as const) : (["front"] as const);
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-4">
      {views.map(view => {
        const items = measurements.filter(m => m.site.view === view);
        // Place labels in two rails with stable spacing, retaining exact anatomical markers.
        const labels = [true, false].flatMap(left => {
          const entries = items.filter(m => (m.site.x <= 180) === left).sort((a, b) => a.site.y - b.site.y);
          let previous = 78;
          return entries.map((m, index) => {
            const y = Math.min(490 - (entries.length - index - 1) * 43, Math.max(m.site.y, previous + 43));
            previous = y;
            return { ...m, labelY: y, left };
          });
        });
        const silhueta = SILHUETAS[sexo][view];
        return (
          <figure key={view} className="mx-auto w-full max-w-[360px]">
            <figcaption className="mb-2 text-center text-xs font-medium text-ink-soft">{view === "front" ? "Vista anterior" : "Vista posterior"}</figcaption>
            <svg viewBox="0 0 360 540" className="h-auto w-full overflow-visible" role="img" aria-label={`${categoria} — ${view === "front" ? "vista anterior" : "vista posterior"}`}>
              <image href={imagens[sexo][view]} x={silhueta.x} y={silhueta.y} width={silhueta.width} height={silhueta.height} />
              {labels.map(({ indicador, site, labelY, left }) => (
                <g key={indicador.id}>
                  <title>{`${indicador.nome}: ${valorComUnidade(indicador)}`}</title>
                  <path d={`M${site.x} ${site.y} L${left ? 106 : 254} ${labelY} H${left ? 8 : 352}`} className="fill-none stroke-accent/50" strokeWidth="1" />
                  <circle cx={site.x} cy={site.y} r="3" className="fill-accent" />
                  <rect x={left ? 0 : 258} y={labelY - 31} width="102" height="30" rx="3" className="fill-paper" />
                  <text x={left ? 4 : 352} y={labelY - 19} textAnchor={left ? "start" : "end"} className="fill-ink-soft text-[10px]">
                    {indicador.nome.length > 18 ? `${indicador.nome.slice(0, 17)}…` : indicador.nome}
                  </text>
                  <text x={left ? 4 : 352} y={labelY - 5} textAnchor={left ? "start" : "end"} className="fill-accent font-mono text-[12px] font-semibold">{valorComUnidade(indicador)}</text>
                </g>
              ))}
            </svg>
          </figure>
        );
      })}
    </div>
  );
}
