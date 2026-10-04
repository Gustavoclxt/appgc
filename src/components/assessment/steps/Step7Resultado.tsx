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
import { ArrowRight, CircleAlert, CircleCheck, Eye, RotateCcw, Target } from "lucide-react";
import type { AnaliseIA } from "@/lib/assessment/types";
import { anamneseParaRelatorio } from "@/lib/assessment/report-anamnesis";
import { examesParaRelatorio } from "@/lib/assessment/report-exams";
import { diarioParaRelatorio } from "@/lib/assessment/food-diary";
import { composicaoParaRelatorio, type ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { alimentosRetirarPorGrupo } from "@/lib/assessment/food-preferences";
import { relatorioParaCopia } from "@/lib/assessment/report-text";
import { painelClinicoParaRelatorio } from "@/lib/assessment/clinical-dashboard";

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
      <Panel titulo="Resultado da avaliação">
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
  const indiceEvolucaoPeso = anamneseDoRelatorio.findIndex(
    (section) => section.title === "Evolução do peso",
  );
  const anamneseAntesEvolucao =
    indiceEvolucaoPeso >= 0
      ? anamneseDoRelatorio.slice(0, indiceEvolucaoPeso)
      : anamneseDoRelatorio;
  const anamneseAPartirDaEvolucao =
    indiceEvolucaoPeso >= 0 ? anamneseDoRelatorio.slice(indiceEvolucaoPeso) : [];
  const retirar = alimentosRetirarPorGrupo(a);
  const comp = composicaoParaRelatorio(composicao);
  const painel = painelClinicoParaRelatorio(analise, a, d, composicao);

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

        {anamneseAntesEvolucao.map((section) => (
          <Bloco key={section.title} titulo={section.title}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {section.fields.map((field) => (
                <Dado key={`${section.title}-${field.label}`} label={field.label} valor={field.value} />
              ))}
            </div>
          </Bloco>
        ))}

        {diarioDoRelatorio.length > 0 && (
          <Bloco titulo="Recordatório 24h">
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
          <Bloco titulo="Composição estimada do Recordatório 24h">
            <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {comp.totais.map((t) => (
                <Dado key={t.label} label={t.label} valor={t.valor} />
              ))}
            </div>
          </Bloco>
        )}

        {anamneseAPartirDaEvolucao.map((section) => (
          <Bloco key={section.title} titulo={section.title}>
            <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              {section.fields.map((field) => (
                <Dado key={`${section.title}-${field.label}`} label={field.label} valor={field.value} />
              ))}
            </div>
          </Bloco>
        ))}

        {retirar.length > 0 && (
          <Bloco titulo="Alimentos não consumidos">
            {retirar.map((g) => (
              <p key={g.grupo}><span className="font-semibold">{g.grupo}:</span> {g.itens.join(", ")}</p>
            ))}
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

        <div className="mt-10 border-t-2 border-ink pt-7">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Painel de decisão</p>
              <h3 className="mt-1 font-display text-xl font-semibold">Resumo clínico</h3>
            </div>
          </div>

          {painel.resumo.length > 0 && (
            <div className="grid grid-cols-1 gap-x-8 border-b border-line py-4 sm:grid-cols-2">
              {painel.resumo.map((item) => (
                <div key={`${item.label}-${item.valor}`} className="grid grid-cols-[minmax(105px,0.42fr)_1fr] gap-3 border-b border-line/60 py-2 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{item.label}</span>
                  <span className="text-[13px] font-semibold leading-snug text-ink">{item.valor}</span>
                </div>
              ))}
            </div>
          )}

          {painel.achados.length > 0 && (
            <div className="py-6">
              <h3 className="font-display text-base font-semibold">Principais achados</h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                {painel.achados.map((grupo) => {
                  const Icone = grupo.tom === "prioridade" ? CircleAlert : grupo.tom === "monitorar" ? Eye : CircleCheck;
                  const tom = grupo.tom === "prioridade"
                    ? "border-destructive/35 bg-destructive-soft"
                    : grupo.tom === "monitorar"
                      ? "border-warn/35 bg-warn-soft"
                      : "border-accent/30 bg-accent-soft";
                  return (
                    <section key={grupo.titulo} className={`border-l-4 p-4 ${tom}`}>
                      <div className="flex items-center gap-2">
                        <Icone className="size-4 shrink-0" aria-hidden />
                        <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">{grupo.titulo}</h4>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {grupo.itens.map((item, index) => <li key={index} className="text-[13px] font-medium leading-snug">{item}</li>)}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {painel.estrategia.length > 0 && (
            <div className="border-y border-line py-6">
              <h3 className="font-display text-base font-semibold">Estratégia inicial</h3>
              <div className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {painel.estrategia.map((grupo) => (
                  <section key={grupo.categoria} className="border-l-2 border-accent pl-3">
                    <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">{grupo.categoria}</h4>
                    <ul className="mt-2 space-y-1.5">
                      {grupo.acoes.map((acao, index) => (
                        <li key={index} className="flex gap-2 text-[13px] leading-snug"><ArrowRight className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden /><span>{acao}</span></li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 pt-6 lg:grid-cols-2">
            {painel.foco.length > 0 && (
              <section>
                <div className="flex items-center gap-2"><Target className="size-4 text-accent" aria-hidden /><h3 className="font-display text-base font-semibold">Foco até o próximo retorno</h3></div>
                <ol className="mt-3 space-y-2">
                  {painel.foco.map((item, index) => <li key={index} className="grid grid-cols-[24px_1fr] gap-2 text-[13px] leading-snug"><span className="font-mono font-semibold text-accent">{index + 1}.</span><span>{item}</span></li>)}
                </ol>
              </section>
            )}
            {painel.reavaliar.length > 0 && (
              <section>
                <div className="flex items-center gap-2"><RotateCcw className="size-4 text-accent" aria-hidden /><h3 className="font-display text-base font-semibold">Reavaliar no retorno</h3></div>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {painel.reavaliar.map((item, index) => <li key={index} className="flex gap-2 text-[13px] leading-snug"><span aria-hidden className="font-mono text-accent">☐</span><span>{item}</span></li>)}
                </ul>
              </section>
            )}
          </div>
        </div>
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
