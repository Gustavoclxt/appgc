import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { StepRail } from "@/components/assessment/StepRail";
import { Step1Dados } from "@/components/assessment/steps/Step1Dados";
import { Step2Anamnese } from "@/components/assessment/steps/Step2Anamnese";
import { Step3Rotina } from "@/components/assessment/steps/Step3Rotina";
import { Step4Antropometria } from "@/components/assessment/steps/Step4Antropometria";
import { Step5Exames } from "@/components/assessment/steps/Step5Exames";
import { Step6Energia } from "@/components/assessment/steps/Step6Energia";
import { Step7Resultado } from "@/components/assessment/steps/Step7Resultado";
import { Step8Pdf } from "@/components/assessment/steps/Step8Pdf";
import { analisarAvaliacao } from "@/lib/assessment/analysis.functions";
import { deriveResults, fmtData } from "@/lib/assessment/calculations";
import { createEmptyAssessment, ETAPAS } from "@/lib/assessment/initial-state";
import { buildResumo } from "@/lib/assessment/summary";
import type { AnaliseIA, Assessment } from "@/lib/assessment/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avaliação Nutricional Clínica e Esportiva | Ferramenta para nutricionistas" },
      {
        name: "description",
        content:
          "Ferramenta de uso pontual para nutricionistas: anamnese, antropometria, exames em PDF, TMB, VET, hidratação e relatório em PDF. Sem login e sem armazenamento de dados.",
      },
      { property: "og:title", content: "Avaliação Nutricional Clínica e Esportiva" },
      {
        property: "og:description",
        content:
          "Anamnese, antropometria, cálculos energéticos e relatório em PDF numa única sessão. Nenhum dado é armazenado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState<Assessment>(() => createEmptyAssessment());
  const [analise, setAnalise] = useState<AnaliseIA | null>(null);
  const [analisando, setAnalisando] = useState(false);

  const analisar = useServerFn(analisarAvaliacao);
  const derivados = useMemo(() => deriveResults(dados), [dados]);

  const set = useCallback(
    <K extends keyof Assessment>(chave: K, valor: Assessment[K]) =>
      setDados((atual) => ({ ...atual, [chave]: valor })),
    [],
  );

  const etapaAtual = ETAPAS.find((e) => e.id === etapa) ?? ETAPAS[0];

  const analiseEmCursoRef = useRef(false);

  const onAnalisar = useCallback(async () => {
    if (analiseEmCursoRef.current) return;
    analiseEmCursoRef.current = true;
    setAnalisando(true);
    try {
      const resumo = buildResumo(dados, derivados);
      const resultado = await analisar({ data: { resumo } });
      setAnalise(resultado);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível gerar a análise.");
    } finally {
      analiseEmCursoRef.current = false;
      setAnalisando(false);
    }
  }, [analisar, dados, derivados]);

  const disparoAutomaticoRef = useRef(false);

  useEffect(() => {
    if (etapa !== ETAPAS.length) return;
    if (disparoAutomaticoRef.current) return;
    if (analise !== null || analisando) return;
    disparoAutomaticoRef.current = true;
    void onAnalisar();
  }, [etapa, analise, analisando, onAnalisar]);

  async function onGerarPdf() {
    try {
      const { generatePDF } = await import("@/lib/assessment/pdf-report");
      generatePDF(dados, derivados, analise);
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    }
  }

  function avancar() {
    setEtapa((e) => Math.min(ETAPAS.length, e + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const props = { a: dados, set, d: derivados };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-accent/15">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-[-120px] top-1/3 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/55 backdrop-blur-xl no-print">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-[10px] bg-ink font-mono text-xs font-medium text-white">
              {String(etapa).padStart(2, "0")}
            </div>
            <div className="max-w-[230px] leading-tight sm:max-w-none">
              <p className="font-display text-sm font-semibold tracking-tight">
                Aplicativo para Avaliação Clínica Nutricional
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                GC - Excelência em Nutrição
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right font-mono text-[11px] leading-relaxed text-ink-soft sm:inline">
              Paciente: <span className="text-ink">{dados.nome || "—"}</span>
              <br />
              Idade: <span className="text-ink">{derivados.idade !== null ? `${derivados.idade} anos` : "—"}</span>
              {" · "}
              Avaliação: <span className="text-ink">{fmtData(dados.dataAvaliacao)}</span>
            </span>
          </div>
        </div>
      </header>

      <StepRail etapaAtual={etapa} onSelecionar={setEtapa} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 no-print">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              Etapa {String(etapa).padStart(2, "0")} / {String(ETAPAS.length).padStart(2, "0")}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-balance">
              {etapaAtual.nomeCompleto}
            </h1>
          </div>
          <p className="font-mono text-[11px] text-ink-soft">Valores atualizados em tempo real</p>
        </div>

        {etapa === 1 && (
          <div className="space-y-6">
            <Step1Dados {...props} />
            <Step2Anamnese {...props} />
          </div>
        )}
        {etapa === 2 && <Step3Rotina {...props} />}
        {etapa === 3 && (
          <div className="space-y-6">
            <Step4Antropometria {...props} />
            <Step5Exames {...props} />
          </div>
        )}
        {etapa === 4 && <Step6Energia {...props} />}
        {etapa === 5 && (
          <div className="space-y-6">
            <Step7Resultado
              {...props}
              analise={analise}
              analisando={analisando}
              onAnalisar={onAnalisar}
            />
            <Step8Pdf onGerar={onGerarPdf} temAnalise={analise !== null} />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 no-print">
          <button
            type="button"
            onClick={() => setEtapa((e) => Math.max(1, e - 1))}
            disabled={etapa === 1}
            className="rounded-[10px] bg-white px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-line transition-colors hover:bg-white/70 disabled:opacity-40"
          >
            Voltar
          </button>
          {etapa < ETAPAS.length ? (
            <button
              type="button"
              onClick={avancar}
              className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90"
            >
              Avançar
            </button>
          ) : (
            <span className="font-mono text-[11px] text-ink-soft">Fim do fluxo</span>
          )}
        </div>

      </main>
    </div>
  );
}
