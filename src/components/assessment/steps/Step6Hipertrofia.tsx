import { useEffect, useState } from "react";

import { pesoAntropometricoAnexado } from "@/lib/assessment/anthropometry-groups";
import {
  dataProjetada,
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
  dias: number;
  ganho: string;
  peso: string;
}

function LinhaDoTempo({ marcos }: { marcos: MarcoLinhaDoTempo[] }) {
  const [hoje, setHoje] = useState<Date | null>(null);
  useEffect(() => setHoje(new Date()), []);

  return (
    <ol className="mt-5 sm:grid sm:grid-cols-4 sm:gap-3">
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
            {hoje && <p className="mt-0.5 text-[11px] text-ink-soft">({dataProjetada(hoje, marco.dias)})</p>}
            <p className="mt-2 font-mono text-lg font-bold tabular-nums text-accent">{marco.peso}</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">Ganho muscular: +{marco.ganho}</p>
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
                ganho: faixaEmGramas(projecao.ganho),
                peso: faixaPeso(projecao.peso),
              })),
              {
                rotulo: "1 ano",
                dias: 365,
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
