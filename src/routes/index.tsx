import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Field, TextInput } from "@/components/assessment/fields";


import { StepRail } from "@/components/assessment/StepRail";
import { Step1Dados } from "@/components/assessment/steps/Step1Dados";
import { Step2Anamnese } from "@/components/assessment/steps/Step2Anamnese";
import { Step3Rotina } from "@/components/assessment/steps/Step3Rotina";
import { Step4Antropometria } from "@/components/assessment/steps/Step4Antropometria";
import { Step5Exames } from "@/components/assessment/steps/Step5Exames";
import { Step6Energia } from "@/components/assessment/steps/Step6Energia";
import { Step6Cardio } from "@/components/assessment/steps/Step6Cardio";
import { Step7Resultado } from "@/components/assessment/steps/Step7Resultado";
import { Step8Pdf } from "@/components/assessment/steps/Step8Pdf";
import { WeightGoals } from "@/components/assessment/WeightGoals";
import { MODULO_METAS_ATIVO, calcularMetasPeso } from "@/lib/assessment/weight-goals";
import { metasPesoIniciais, type MetasPesoEstado } from "@/lib/assessment/weight-projection";
import { analisarAvaliacao, calcularComposicaoDiario } from "@/lib/assessment/analysis.functions";
import { alimentosDoDiario, calcularComposicaoDasRefeicoes, chaveDiario, comCacheDeComposicao, type CacheComposicao, somarTotais, type ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { novaRefeicaoAtipica } from "@/components/assessment/AtypicalDay";
import { deriveResults, fmtData } from "@/lib/assessment/calculations";
import { createEmptyAssessment, ETAPAS, novoId } from "@/lib/assessment/initial-state";
import { createExampleAssessment } from "@/lib/assessment/example-patient";
import { buildResumo } from "@/lib/assessment/summary";
import type { AnaliseIA, Assessment, Refeicao } from "@/lib/assessment/types";
import logoGc from "@/assets/logo-gc.png.asset.json";

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
  const calcularDiarioServidor = useServerFn(calcularComposicaoDiario);
  const cacheComposicaoRef = useRef<CacheComposicao>(new Map());
  const calcularDiario = useMemo(() => {
    const cacheado = comCacheDeComposicao(cacheComposicaoRef.current, itens => calcularDiarioServidor({ data: { itens } }));
    return ({ data }: { data: { itens: Parameters<typeof cacheado>[0] } }) => cacheado(data.itens);
  }, [calcularDiarioServidor]);
  const [composicao, setComposicao] = useState<ComposicaoDiario | null>(null);
  const [calculando, setCalculando] = useState(false);
  const calculoEmCursoRef = useRef(false);
  const [diaAtipico, setDiaAtipico] = useState<Refeicao[] | null>(null);
  const [composicaoAtipica, setComposicaoAtipica] = useState<ComposicaoDiario | null>(null);
  const [calculandoAtipico, setCalculandoAtipico] = useState(false);
  const calculoAtipicoEmCursoRef = useRef(false);
  const [metasPeso, setMetasPeso] = useState<MetasPesoEstado>(() => metasPesoIniciais());
  const derivados = useMemo(() => deriveResults(dados), [dados]);
  const resultadoMetas = useMemo(() => MODULO_METAS_ATIVO(dados) ? calcularMetasPeso(dados, derivados, metasPeso) : null, [dados, derivados, metasPeso]);

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
      const resumo = buildResumo(dados, derivados, composicao);
      const resultado = await analisar({ data: { resumo } });
      setAnalise(resultado);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível gerar a análise.");
    } finally {
      analiseEmCursoRef.current = false;
      setAnalisando(false);
    }
  }, [analisar, composicao, dados, derivados]);

  const onCalcularDiario = useCallback(async () => {
    const itens = alimentosDoDiario(dados.diarioAlimentar);
    if (!itens.length) {
      toast.error("Adicione alimentos ao Recordatório 24h.");
      return;
    }
    if (calculoEmCursoRef.current) return;
    calculoEmCursoRef.current = true;
    setCalculando(true);
    try {
      const resultado = await calcularDiario({ data: { itens } });
      setComposicao({ chave: chaveDiario(dados.diarioAlimentar), itens: resultado, totais: somarTotais(resultado) });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível calcular a composição.");
    } finally {
      calculoEmCursoRef.current = false;
      setCalculando(false);
    }
  }, [calcularDiario, dados.diarioAlimentar]);

  const onCalcularAtipico = useCallback(async () => {
    if (!diaAtipico || calculoAtipicoEmCursoRef.current) return;
    calculoAtipicoEmCursoRef.current = true;
    setCalculandoAtipico(true);
    try {
      const resultado = await calcularComposicaoDasRefeicoes(diaAtipico, itens => calcularDiario({ data: { itens } }));
      setComposicaoAtipica(resultado);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível calcular o dia atípico.");
    } finally {
      calculoAtipicoEmCursoRef.current = false;
      setCalculandoAtipico(false);
    }
  }, [calcularDiario, diaAtipico]);

  const onRemoverDiaAtipico = useCallback(() => {
    setDiaAtipico(null);
    setComposicaoAtipica(null);
    calculoAtipicoEmCursoRef.current = false;
    setCalculandoAtipico(false);
  }, []);

  const onCopiarR24h = useCallback(() => {
    const copia = dados.diarioAlimentar.map((r) => ({
      id: novoId(),
      refeicao: r.refeicao,
      horario: r.horario,
      local: r.local,
      alimentos: r.alimentos.map((al) => ({ id: novoId(), alimento: al.alimento, quantidade: al.quantidade })),
    }));
    setDiaAtipico(copia);
    setComposicaoAtipica(null);
    calculoAtipicoEmCursoRef.current = false;
    setCalculandoAtipico(false);
  }, [dados.diarioAlimentar]);


  useEffect(() => {
    if (etapa !== ETAPAS.length) return;
    if (!alimentosDoDiario(dados.diarioAlimentar).length) return;
    if (composicao?.chave === chaveDiario(dados.diarioAlimentar)) return;
    void onCalcularDiario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa]);

  const disparoAutomaticoRef = useRef(false);

  useEffect(() => {
    if (etapa !== ETAPAS.length) return;
    const temAlimentos = alimentosDoDiario(dados.diarioAlimentar).length > 0;
    if (temAlimentos && composicao?.chave !== chaveDiario(dados.diarioAlimentar) && (calculando || calculoEmCursoRef.current)) return;
    if (disparoAutomaticoRef.current) return;
    if (analise !== null || analisando) return;
    disparoAutomaticoRef.current = true;
    void onAnalisar();
  }, [etapa, analise, analisando, composicao, calculando, dados.diarioAlimentar, onAnalisar]);

  async function onGerarPdf() {
    try {
      const { generatePDF } = await import("@/lib/assessment/pdf-report");
      generatePDF(dados, derivados, analise, composicao, resultadoMetas, diaAtipico ? composicaoAtipica : null);
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
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-6 py-3.5">
          <img
            src={logoGc.url}
            alt="Gustavo Calixto — Nutrição, Performance e Longevidade"
            width={200}
            height={100}
            className="h-[100px] w-[200px] max-w-full object-contain justify-self-start"
          />
          <div className="text-center leading-tight">
            <p className="text-lg font-semibold tracking-tight">
              Avaliação Clínica Nutricional
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">
              GC - Excelência em Nutrição
            </p>
          </div>
          <div className="flex items-center gap-3 justify-self-end">
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
          {etapa === 1 && (
            <button
              type="button"
              onClick={() => {
                setDados(createExampleAssessment());
                setAnalise(null);
                setComposicao(null);
                toast.success("Formulário preenchido com paciente fictício.");
              }}
              className="rounded-[10px] bg-white px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-line transition-colors hover:bg-white/70"
            >
              Preencher Exemplo
            </button>
          )}
          {etapa === 1 && (
            <Field label="Data da avaliação" className="w-[165px]">
              <TextInput type="date" value={dados.dataAvaliacao} onChange={(v) => set("dataAvaliacao", v)} />
            </Field>
          )}

        </div>

        {etapa === 1 && (
          <div className="space-y-6">
            <Step1Dados {...props} />
            <Step2Anamnese {...props} />
          </div>
        )}
        {etapa === 2 && <Step3Rotina {...props} composicao={composicao} calculando={calculando} onCalcular={() => void onCalcularDiario()} diaAtipico={diaAtipico} onAdicionarDiaAtipico={() => setDiaAtipico(atual => atual ?? [novaRefeicaoAtipica()])} onRemoverDiaAtipico={onRemoverDiaAtipico} onAlterarDiaAtipico={setDiaAtipico} onCopiarR24h={onCopiarR24h} composicaoAtipica={composicaoAtipica} calculandoAtipico={calculandoAtipico} onCalcularAtipico={() => void onCalcularAtipico()} />}
        {etapa === 3 && (
          <div className="space-y-6">
            <Step4Antropometria {...props} />
            <Step5Exames {...props} />
          </div>
        )}
        {etapa === 4 && (
          <div className="space-y-6">
            <Step6Energia {...props} composicao={composicao} />
            {MODULO_METAS_ATIVO(dados) && (
              <WeightGoals {...props} metas={metasPeso} onChange={setMetasPeso} />
            )}
            <Step6Cardio d={derivados} />
          </div>
        )}
        {etapa === 5 && (
          <div className="space-y-6">
            <Step7Resultado
              {...props}
              analise={analise}
              analisando={analisando}
              onAnalisar={onAnalisar}
              composicao={composicao}
              metas={resultadoMetas}
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
          {etapa < ETAPAS.length && (
            <button
              type="button"
              onClick={avancar}
              className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90"
            >
              Avançar
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
