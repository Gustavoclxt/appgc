import {
  faixaEmGramas,
  faixaEmKg,
  faixaPeso,
  formatarMeses,
  objetivoPermiteHipertrofia,
} from "@/lib/assessment/hypertrophy-potential";

import { Panel } from "../fields";
import type { StepProps } from "./types";

interface MarcoLinhaDoTempo {
  rotulo: string;
  ganho: string;
  peso: string;
}

function LinhaDoTempo({ marcos }: { marcos: MarcoLinhaDoTempo[] }) {
  return (
    <ol className="mt-4 sm:grid sm:grid-cols-4 sm:gap-3">
      {marcos.map((marco, indice) => (
        <li key={marco.rotulo} className="relative pb-6 pl-8 last:pb-0 sm:pb-0 sm:pl-0 sm:pt-8">
          {indice < marcos.length - 1 && (
            <>
              <span aria-hidden className="absolute bottom-0 left-[7px] top-4 w-px bg-line sm:hidden" />
              <span aria-hidden className="absolute left-1/2 right-[-0.75rem] top-[11px] hidden h-px bg-line sm:block" />
            </>
          )}
          <span
            aria-hidden
            className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full bg-accent ring-4 ring-accent-soft sm:left-1/2 sm:top-[4px] sm:-translate-x-1/2"
          />
          <div className="sm:text-center">
            <p className="font-display text-sm font-semibold text-ink">{marco.rotulo}</p>
            <dl className="mt-2 space-y-2">
              <div>
                <dt className="text-[11px] text-ink-soft">Ganho muscular estimado</dt>
                <dd className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink">{marco.ganho}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-ink-soft">Peso teórico</dt>
                <dd className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink">{marco.peso}</dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Step6Hipertrofia({ a, d }: Pick<StepProps, "a" | "d">) {
  if (!objetivoPermiteHipertrofia(a.objetivos)) return null;
  const potencial = d.potencialHipertrofia;

  return (
    <Panel titulo="Calculadora de Potencial de Hipertrofia" meta="Modelo de Lyle McDonald">
      {potencial ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[10px] bg-accent-soft p-4 ring-1 ring-accent/20">
              <p className="text-[12px] font-medium text-ink-soft">Potencial mensal de ganho muscular</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-accent">
                {faixaEmGramas(potencial.mensal)}<span className="text-[12px] font-normal">/mês</span>
              </p>
            </div>
            <div className="rounded-[10px] bg-paper p-4 ring-1 ring-line">
              <p className="text-[12px] font-medium text-ink-soft">Estágio de treinamento</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">{potencial.estagio}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-soft">{formatarMeses(potencial.tempoMeses)} de Musculação</p>
            </div>
          </div>

          <LinhaDoTempo
            marcos={[
              ...potencial.projecoes.map((projecao) => ({
                rotulo: `${projecao.dias} dias`,
                ganho: faixaEmGramas(projecao.ganho),
                peso: faixaPeso(projecao.peso),
              })),
              {
                rotulo: "1 ano",
                ganho: faixaEmKg(potencial.anual.ganho),
                peso: faixaPeso(potencial.anual.peso),
              },
            ]}
          />

          <div className="mt-4 space-y-2 text-[11px] leading-relaxed text-ink-soft">
            {potencial.recomposicao && (
              <p className="rounded-[8px] bg-warn-soft px-3 py-2 text-ink">
                Na recomposição corporal, o peso corporal real pode permanecer estável ou até diminuir, mesmo com ganho de massa muscular.
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Informe sexo, peso corporal na avaliação antropométrica e um tempo válido no campo “Há quanto tempo pratica?” da modalidade Musculação para calcular as estimativas.
        </p>
      )}
    </Panel>
  );
}
