import { pesoAntropometricoAnexado } from "@/lib/assessment/anthropometry-groups";
import {
  faixaEmGramas,
  faixaEmKg,
  faixaPeso,
  formatarMeses,
  objetivoPermiteHipertrofia,
} from "@/lib/assessment/hypertrophy-potential";

import { LinhaDoTempo } from "../LinhaDoTempo";
import { Panel } from "../fields";
import type { StepProps } from "./types";

export function Step6Hipertrofia({ a, d }: Pick<StepProps, "a" | "d">) {
  if (!objetivoPermiteHipertrofia(a.objetivos)) return null;
  const potencial = d.potencialHipertrofia;

  return (
    <Panel titulo="Calculadora de Potencial de Hipertrofia" meta="Modelo de Lyle McDonald">
      {potencial ? (
        <>
          <div className="grid grid-cols-1 overflow-hidden rounded-[10px] bg-accent text-accent-foreground sm:grid-cols-3">
            <div className="p-4 text-center">
              <p className="text-[12px] font-medium text-accent-foreground/80">Peso atual</p>
              {(() => {
                const pesoAtual = pesoAntropometricoAnexado(a);
                return pesoAtual !== null ? (
                  <>
                    <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
                      {pesoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="mt-0.5 text-[11px] text-accent-foreground/70">kg</p>
                  </>
                ) : (
                  <p className="mt-2 text-[13px] font-medium text-accent-foreground/80">Anexar antropometria</p>
                );
              })()}
            </div>
            <div className="border-t border-accent-foreground/20 p-4 text-center sm:border-l sm:border-t-0">
              <p className="text-[12px] font-medium text-accent-foreground/80">Potencial mensal de ganho muscular</p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{faixaEmGramas(potencial.mensal).replace(/ g$/, "")}</p>
              <p className="mt-0.5 text-[11px] text-accent-foreground/70">g/mês</p>
            </div>
            <div className="border-t border-accent-foreground/20 p-4 text-center sm:border-l sm:border-t-0">
              <p className="text-[12px] font-medium text-accent-foreground/80">Estágio de treinamento</p>
              <p className="mt-1 font-display text-2xl font-bold">{potencial.estagio}</p>
              <p className="mt-0.5 text-[11px] text-accent-foreground/70">{formatarMeses(potencial.tempoMeses)} de Musculação</p>
            </div>
          </div>

          <LinhaDoTempo
            marcos={[
              ...potencial.projecoes.map((projecao) => ({
                rotulo: `${projecao.dias} dias`,
                dias: projecao.dias,
                valor: faixaPeso(projecao.peso),
                detalhe: `Ganho muscular: +${faixaEmGramas(projecao.ganho)}`,
              })),
              {
                rotulo: "1 ano",
                dias: 365,
                valor: faixaPeso(potencial.anual.peso),
                detalhe: `Ganho muscular: +${faixaEmKg(potencial.anual.ganho)}`,
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
