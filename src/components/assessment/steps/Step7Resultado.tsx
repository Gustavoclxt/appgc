import {
  fmt2,
  fmtData,
  fmtInt,
  fmtLitros,
  labelEstrategia,
  labelMetodo,
} from "@/lib/assessment/calculations";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AnaliseIA } from "@/lib/assessment/types";
import { anamneseParaRelatorio } from "@/lib/assessment/report-anamnesis";
import { examesParaRelatorio } from "@/lib/assessment/report-exams";
import { diarioParaRelatorio } from "@/lib/assessment/food-diary";
import { intervencoesParaRelatorio } from "@/lib/assessment/interventions";
import { composicaoParaRelatorio, type ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { fraseAlimentosRetirar } from "@/lib/assessment/food-preferences";
import { relatorioParaCopia } from "@/lib/assessment/report-text";

import { ExamesTable } from "../ExamesTable";
import { Panel } from "../fields";
import type { StepProps } from "./types";

interface Props extends StepProps {
  analise: AnaliseIA | null;
  analisando: boolean;
  onAnalisar: () => void;
  composicao: ComposicaoDiario | null;
}

function Dado({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 pb-1.5">
      <span className="shrink-0 text-[13px] text-ink-soft">{label}</span>
      <span className="min-w-0 break-words text-right font-mono text-[13px] tabular-nums">{valor}</span>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{titulo}</h3>
      <div className="mt-2 text-[13px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export function Step7Resultado({ a, d, analise, analisando, onAnalisar, composicao }: Props) {
  const relatorioRef = useRef<HTMLDivElement>(null);

  async function copiarRelatorio() {
    if (!analise) return;
    const { texto, html } = relatorioParaCopia(a, d, analise, composicao);
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([texto], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(texto);
      }
      toast.success("Relatório copiado.");
    } catch {
      toast.error("Não foi possível copiar o relatório.");
    }
  }

  if (!analise) {
    return (
      <Panel titulo="Resultado da avaliação" meta="Etapa 5">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Ao analisar a avaliação, os dados preenchidos e os cálculos realizados são reunidos em um
          relatório técnico objetivo.
        </p>
        <button
          type="button"
          onClick={onAnalisar}
          disabled={analisando}
          className="mt-6 rounded-[10px] bg-ink px-6 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {analisando ? "ANALISANDO…" : "ANALISAR AVALIAÇÃO"}
        </button>
      </Panel>
    );
  }

  const examesDoRelatorio = examesParaRelatorio(a.exames);
  const diarioDoRelatorio = diarioParaRelatorio(a.diarioAlimentar);
  const anamneseDoRelatorio = anamneseParaRelatorio(a, d);
  const retirar = fraseAlimentosRetirar(a);
  const comp = composicaoParaRelatorio(composicao);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold tracking-tight">Relatório da avaliação</h2>
        <button
          type="button"
          onClick={onAnalisar}
          disabled={analisando}
          className="rounded-[10px] bg-white px-4 py-2 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-white/70 disabled:opacity-60 no-print"
        >
          {analisando ? "Analisando…" : "Analisar novamente"}
        </button>
      </div>

      <div ref={relatorioRef} className="rounded-[18px] bg-white p-8 ring-1 ring-black/5 shadow-[0_24px_60px_-30px_oklch(0.24_0.026_250/0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Relatório de avaliação nutricional
            </p>
            <p className="mt-1 font-mono text-[11px] text-ink-soft">{fmtData(a.dataAvaliacao)}</p>
            <p className="mt-1 font-display text-xl font-semibold tracking-tight">{a.nome || "—"}</p>
            <p className="mt-0.5 font-mono text-[11px] text-ink-soft">
              {[
                d.idade !== null ? `${d.idade} anos` : null,
                a.sexo ? (a.sexo === "masculino" ? "Masculino" : "Feminino") : null,
                d.alturaCm !== null ? `${fmt2(d.alturaCm)} cm` : null,
                d.pesoKg !== null ? `${fmt2(d.pesoKg)} kg` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
          <Dado label="Profissão" valor={a.profissao || "—"} />
          <Dado label="Objetivos" valor={a.objetivos.join(", ") || "—"} />
          <Dado label="IMC" valor={d.imc !== null ? `${fmt2(d.imc)} — ${d.classificacaoIMC}` : "—"} />
          <Dado
            label="% de gordura"
            valor={d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : "não informado"}
          />
          <Dado label="Massa gorda" valor={d.massaGorda !== null ? `${fmt2(d.massaGorda)} kg` : "—"} />
          <Dado
            label="Massa livre de gordura"
            valor={d.massaLivreGordura !== null ? `${fmt2(d.massaLivreGordura)} kg` : "—"}
          />
          <Dado label="Método de TMB" valor={(labelMetodo[a.metodoTMB] ?? "")} />
          <Dado label="TMB" valor={d.tmb !== null ? `${fmtInt(d.tmb)} kcal/dia` : "—"} />
          <Dado
            label="Fator de atividade"
            valor={d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : "—"}
          />
          <Dado label="VET" valor={d.vet !== null ? `${fmtInt(d.vet)} kcal/dia` : "—"} />
          <Dado
            label="Hidratação"
            valor={
              d.aguaMin !== null
                ? `${fmtInt(d.aguaMin)}–${fmtInt(d.aguaMax)} mL/dia (${fmtLitros(d.aguaMin)}–${fmtLitros(d.aguaMax)} L/dia)`
                : "—"
            }
          />
          <Dado label="Estratégia" valor={(labelEstrategia[a.estrategia] ?? "")} />
          <Dado
            label="Calorias sugeridas"
            valor={d.caloriasSugeridas !== null ? `${fmtInt(d.caloriasSugeridas)} kcal/dia` : "—"}
          />
        </div>

        {anamneseDoRelatorio.map((section) => (
          <Bloco key={section.title} titulo={section.title}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {section.fields.map((field) => (
                <Dado key={`${section.title}-${field.label}`} label={field.label} valor={field.value} />
              ))}
            </div>
          </Bloco>
        ))}

        {retirar && (
          <Bloco titulo="Alimentos não consumidos">
            <p>{retirar}</p>
          </Bloco>
        )}

        {diarioDoRelatorio.length > 0 && (
          <Bloco titulo="Diário alimentar">
            <div className="divide-y divide-line/70 border-y border-line/70">
              {diarioDoRelatorio.map((refeicao) => (
                <div key={refeicao.id} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-5">
                  <div>
                    <p className="font-medium">{refeicao.refeicao}</p>
                    <p className="font-mono text-[11px] text-ink-soft">
                      {[refeicao.horario, refeicao.local].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <ul className="space-y-1">
                    {refeicao.alimentos.map((alimento, index) => (
                      <li key={`${refeicao.id}-${index}`} className="text-[13px] text-ink">
                        {alimento}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Bloco>
        )}

        {comp && (
          <Bloco titulo="Composição estimada do diário alimentar">
            <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {comp.totais.map((t) => (
                <Dado key={t.label} label={t.label} valor={t.valor} />
              ))}
            </div>
          </Bloco>
        )}

        {examesDoRelatorio.length > 0 && (
          <Bloco titulo="Exames laboratoriais">
            <ExamesTable exames={examesDoRelatorio} />
            {a.observacoesExames && (
              <p className="mt-3 text-[13px] text-ink-soft">{a.observacoesExames}</p>
            )}
          </Bloco>
        )}

        <Bloco titulo="Síntese da avaliação">
          <p className="whitespace-pre-line">{analise.sintese}</p>
        </Bloco>

        {analise.composicaoCorporal && (
          <Bloco titulo="Composição corporal">
            <p className="whitespace-pre-line">{analise.composicaoCorporal}</p>
          </Bloco>
        )}

        {analise.gastoEnergetico && (
          <Bloco titulo="Gasto energético">
            <p className="whitespace-pre-line">{analise.gastoEnergetico}</p>
          </Bloco>
        )}

        {analise.hidratacao && (
          <Bloco titulo="Hidratação">
            <p className="whitespace-pre-line">{analise.hidratacao}</p>
          </Bloco>
        )}

        {analise.estrategiaEnergetica && (
          <Bloco titulo="Estratégia energética">
            <p className="whitespace-pre-line">{analise.estrategiaEnergetica}</p>
          </Bloco>
        )}

        {analise.pontosAtencao.length > 0 && (
          <Bloco titulo="Pontos de atenção">
            <ul className="list-disc space-y-1 pl-5">
              {analise.pontosAtencao.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Bloco>
        )}

        {intervencoesParaRelatorio(analise.intervencoes).length > 0 && (
          <div className="mt-8 rounded-[14px] bg-ink p-6 text-white">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em]">
              Mudanças e intervenções sugeridas
            </h3>
            <div className="mt-4 space-y-6">
              {intervencoesParaRelatorio(analise.intervencoes).map((g) => (
                <div key={g.id}>
                  <p
                    className={`inline-block rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                      g.id === "alta"
                        ? "bg-destructive text-white"
                        : g.id === "moderada"
                          ? "bg-accent text-white"
                          : "bg-white/15 text-white"
                    }`}
                  >
                    {g.label}
                  </p>
                  <div className="mt-3 space-y-4">
                    {g.categorias.map((c) => (
                      <div key={c.categoria}>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
                          {c.categoria}
                        </p>
                        <ul className="mt-2 space-y-3">
                          {c.itens.map((i, idx) => (
                            <li key={idx} className="border-l-2 border-white/25 pl-3">
                              {i.problema && (
                                <p className="text-[13px] font-semibold leading-snug text-white">
                                  {i.problema}
                                </p>
                              )}
                              <ul className="mt-1.5 space-y-1">
                                {i.acoes.map((acao, j) => (
                                  <li
                                    key={j}
                                    className="flex gap-1.5 text-[13px] leading-relaxed text-white/90"
                                  >
                                    <span aria-hidden className="shrink-0 text-white/45">
                                      →
                                    </span>
                                    <span>{acao}</span>
                                  </li>
                                ))}
                              </ul>
                              {i.justificativa && (
                                <p className="mt-1 text-[11px] leading-snug text-white/50">
                                  {i.justificativa}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Bloco titulo="Sugestão técnica">
          <p className="whitespace-pre-line">{analise.sugestaoTecnica}</p>
        </Bloco>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => void copiarRelatorio()}
        className="mt-4 w-full rounded-[10px] bg-white px-5 py-3 text-sm font-semibold text-ink ring-1 ring-line transition-colors hover:bg-white/70 no-print"
      >
        COPIAR
      </Button>
    </section>
  );
}
