import { bodyMeasurements } from "@/lib/assessment/anthropometry-body";
import { valorComUnidade, type CategoriaAntropometrica } from "@/lib/assessment/anthropometry-groups";
import type { IndicadorAntropometrico } from "@/lib/assessment/types";

const silhouette = "M180 28 C162 28 153 42 155 61 C156 78 164 87 170 90 L168 106 L142 115 Q129 119 124 142 L109 207 L94 267 Q90 285 99 289 Q110 292 114 276 L132 219 L147 166 L150 216 Q140 250 143 282 L144 335 L144 384 L141 465 L134 493 Q129 505 140 508 L164 508 Q173 506 172 496 L170 461 L177 383 L180 307 L183 383 L190 461 L188 496 Q187 506 196 508 L220 508 Q231 505 226 493 L219 465 L216 384 L216 335 L217 282 Q220 250 210 216 L213 166 L228 219 L246 276 Q250 292 261 289 Q270 285 266 267 L251 207 L236 142 Q231 119 218 115 L192 106 L190 90 C196 87 204 78 205 61 C207 42 198 28 180 28 Z";

export function AnthropometryBody({ indicadores, categoria }: { indicadores: IndicadorAntropometrico[]; categoria: CategoriaAntropometrica }) {
  const measurements = bodyMeasurements(indicadores, categoria);
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
        return (
          <figure key={view} className="mx-auto w-full max-w-[360px]">
            <figcaption className="mb-2 text-center text-xs font-medium text-ink-soft">{view === "front" ? "Vista anterior" : "Vista posterior"}</figcaption>
            <svg viewBox="0 0 360 540" className="h-auto w-full overflow-visible" role="img" aria-label={`${categoria} — ${view === "front" ? "vista anterior" : "vista posterior"}`}>
              <path d={silhouette} className="fill-accent-soft stroke-accent/40" strokeWidth="1.5" />
              {view === "back" ? <path d="M180 112 V260 M151 153 Q165 176 175 164 M209 153 Q195 176 185 164 M151 278 Q180 290 209 278" className="fill-none stroke-accent/25" /> : <path d="M154 155 Q167 164 178 155 M182 155 Q193 164 206 155 M180 171 V232 M151 271 Q180 281 209 271" className="fill-none stroke-accent/25" />}
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