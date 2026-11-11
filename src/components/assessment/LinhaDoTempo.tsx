import { useEffect, useState } from "react";

import { dataProjetadaEmMeses } from "@/lib/assessment/calculations";
import { dataProjetada } from "@/lib/assessment/hypertrophy-potential";

export interface MarcoLinhaDoTempo {
  rotulo: string;
  /** Prazo em dias corridos a partir de hoje; a data é calculada automaticamente. */
  dias?: number;
  /** Prazo em meses-calendário a partir de hoje; a data é calculada automaticamente. */
  meses?: number;
  valor: string;
  detalhe?: string;
  nota?: string;
}

/** Marcos em sequência: prazo, data calculada, valor em destaque e complementos. */
export function LinhaDoTempo({ marcos }: { marcos: MarcoLinhaDoTempo[] }) {
  const [hoje, setHoje] = useState<Date | null>(null);
  useEffect(() => setHoje(new Date()), []);

  return (
    <ol
      className="mt-5 sm:grid sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${marcos.length}, minmax(0, 1fr))` }}
    >
      {marcos.map((marco, indice) => (
        <li key={marco.rotulo} className="relative pb-7 pl-9 last:pb-0 sm:pb-0 sm:pl-0 sm:pt-9">
          {indice < marcos.length - 1 && (
            <>
              <span aria-hidden className="absolute bottom-[-4px] left-[7px] top-[19px] w-px bg-line sm:hidden" />
              <span aria-hidden className="absolute left-[calc(50%+12px)] right-[-50%] top-[11px] hidden h-px bg-line sm:block" />
            </>
          )}
          <span
            aria-hidden
            className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full bg-accent ring-4 ring-accent-soft sm:left-1/2 sm:top-[4px] sm:-translate-x-1/2"
          />
          <div className="sm:text-center">
            <p className="text-[13px] font-semibold text-ink">{marco.rotulo}</p>
            {hoje && marco.dias !== undefined && (
              <p className="mt-0.5 text-[11px] text-ink-soft">({dataProjetada(hoje, marco.dias)})</p>
            )}
            {hoje && marco.meses !== undefined && (
              <p className="mt-0.5 text-[11px] text-ink-soft">({dataProjetadaEmMeses(hoje, marco.meses)})</p>
            )}
            <p className="mt-2 font-mono text-lg font-bold tabular-nums text-accent">{marco.valor}</p>
            {marco.detalhe && <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">{marco.detalhe}</p>}
            {marco.nota && <p className="mt-1 text-[11px] leading-relaxed text-ink-soft/80">{marco.nota}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
