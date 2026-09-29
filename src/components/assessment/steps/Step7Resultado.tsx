import {
  fmt2,
  fmtData,
  fmtInt,
  fmtLitros,
  labelEstrategia,
  labelMetodo,
} from "@/lib/assessment/calculations";
import type { AnaliseIA } from "@/lib/assessment/types";
import { examesParaRelatorio } from "@/lib/assessment/report-exams";

import { ExamesTable } from "../ExamesTable";
import { Panel } from "../fields";
import type { StepProps } from "./types";

interface Props extends StepProps {
  analise: AnaliseIA | null;
  analisando: boolean;
  onAnalisar: () => void;
}

function Dado({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/70 pb-1.5">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className="font-mono text-[13px] tabular-nums">{valor}</span>
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

export function Step7Resultado({ a, d, analise, analisando, onAnalisar }: Props) {
  if (!analise) {
    return (
      <Panel titulo="Resultado da avaliação" meta="Etapa 7">
        <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          Ao analisar a avaliação, os dados preenchidos e os cálculos realizados são reunidos em um
          relatório técnico objetivo. A sugestão produzida é um apoio à decisão e não constitui
          diagnóstico ou prescrição.
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

      <div className="rounded-[18px] bg-white p-8 ring-1 ring-black/5 shadow-[0_24px_60px_-30px_oklch(0.24_0.026_250/0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Relatório de avaliação nutricional
            </p>
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
          <p className="font-mono text-[11px] text-ink-soft">{fmtData(a.dataAvaliacao)}</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
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

        <Bloco titulo="Sugestão técnica">
          <p className="whitespace-pre-line">{analise.sugestaoTecnica}</p>
        </Bloco>
      </div>
    </section>
  );
}
