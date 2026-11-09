import {
  faixaEmGramas,
  faixaEmKg,
  faixaPeso,
  formatarMeses,
  objetivoPermiteHipertrofia,
} from "@/lib/assessment/hypertrophy-potential";

import { Panel } from "../fields";
import type { StepProps } from "./types";

function Projecao({ titulo, ganho, peso }: { titulo: string; ganho: string; peso: string }) {
  return (
    <article className="rounded-[10px] bg-white/70 p-4 ring-1 ring-line">
      <h3 className="font-display text-sm font-semibold text-ink">{titulo}</h3>
      <dl className="mt-3 space-y-3">
        <div>
          <dt className="text-[11px] text-ink-soft">Ganho muscular estimado</dt>
          <dd className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink">{ganho}</dd>
        </div>
        <div className="border-t border-line/70 pt-2.5">
          <dt className="text-[11px] text-ink-soft">Peso teórico</dt>
          <dd className="mt-0.5 font-mono text-[13px] font-semibold tabular-nums text-ink">{peso}</dd>
        </div>
      </dl>
    </article>
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

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {potencial.projecoes.map((projecao) => (
              <Projecao
                key={projecao.dias}
                titulo={`Projeção para ${projecao.dias} dias`}
                ganho={faixaEmGramas(projecao.ganho)}
                peso={faixaPeso(projecao.peso)}
              />
            ))}
            <Projecao
              titulo="Projeção para 1 ano"
              ganho={faixaEmKg(potencial.anual.ganho)}
              peso={faixaPeso(potencial.anual.peso)}
            />
          </div>

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
