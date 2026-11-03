import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { extrairAntropometria } from "@/lib/assessment/analysis.functions";
import { fmt2, fmtData } from "@/lib/assessment/calculations";
import { agruparAntropometria, rotuloIndicador, valorComUnidade, type CategoriaAntropometrica } from "@/lib/assessment/anthropometry-groups";
import { extractPdfText } from "@/lib/assessment/extract-pdf-text";
import { novoId } from "@/lib/assessment/initial-state";
import { AnthropometryBody } from "../AnthropometryBody";

import { Field, Panel, Select, TextInput, UnitInput } from "../fields";
import type { StepProps } from "./types";

type GrupoAntropometrico = ReturnType<typeof agruparAntropometria>[number];

function ResultadoHorizontal({ label, valor, sub, destaque }: { label: string; valor: string; sub: string; destaque?: string | undefined }) {
  return (
    <div className="border-l border-white/10 pl-6 first:border-l-0 first:pl-0">
      <p className="text-[12px] text-white">{label}</p>
      <p className="mt-1 font-mono text-2xl font-medium tracking-tight tabular-nums text-white">{valor}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-white/80">{sub}</span>
        {destaque && (
          <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] text-white">
            {destaque}
          </span>
        )}
      </div>
    </div>
  );
}

function TabelaIndicadores({ categoria, indicadores }: { categoria: CategoriaAntropometrica; indicadores: GrupoAntropometrico["indicadores"] }) {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="mb-2 font-display text-sm font-semibold text-accent">{categoria}</h3>
      <div className="overflow-x-auto">
        <table className="w-auto text-left text-[13px]">
          <tbody>
            {indicadores.map((i) => (
              <tr key={i.id} className="border-t border-line/70">
                <td className={cn("py-2 pr-4 text-ink", categoria === "Resultados" && /%\s*massa\s+gorda/i.test(i.nome) && "font-semibold")}>{rotuloIndicador(i.nome)}</td>
                <td className={cn("py-2 pl-6 font-mono", categoria === "Resultados" && /%\s*massa\s+gorda/i.test(i.nome) && "font-semibold")}>{valorComUnidade(i, categoria)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Step4Antropometria({ a, set, d }: StepProps) {
  const [lendo, setLendo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [lido, setLido] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [pendentes, setPendentes] = useState<string[]>([]);
  const [conferenciaAberta, setConferenciaAberta] = useState(false);
  const extrair = useServerFn(extrairAntropometria);

  function removerAvaliacao() {
    set("indicadoresAntropometricos", []);
    set("altura", ""); set("peso", ""); set("percentualGordura", ""); set("metodoGordura", ""); set("dataAvaliacaoAntropometrica", "");
    setLido(false); setFalhou(false); setPendentes([]);
  }

  async function processarArquivo(file: File) {
    setLendo(true);
    setProgresso(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    try {
      const texto = await extractPdfText(file, (f) => setProgresso(Math.round(f * 40)));
      if (texto.trim().length < 20) {
        setFalhou(true);
        setConferenciaAberta(true);
        toast.error("Não foi possível ler texto neste PDF. Preencha os dados manualmente abaixo.");
        return;
      }
      timer = setInterval(() => setProgresso((p) => (p < 95 ? p + Math.max(1, Math.round((95 - p) / 12)) : p)), 400);
      const r = await extrair({ data: { textoPdf: texto.slice(0, 60000) } });
      clearInterval(timer);
      setProgresso(100);
      if (r.altura && /^\d?(?:,\d{0,2})?$/.test(r.altura)) set("altura", r.altura);
      if (r.peso) set("peso", r.peso);
      if (r.percentualGordura) set("percentualGordura", r.percentualGordura);
      if (r.metodo) set("metodoGordura", r.metodo);
      if (r.data) set("dataAvaliacaoAntropometrica", r.data);
      set("indicadoresAntropometricos", r.indicadores.map((i) => ({ ...i, id: novoId() })));
      const faltam = [
        !r.altura && "Altura",
        !r.peso && "Peso atual",
        !r.percentualGordura && "Percentual de gordura",
        !r.data && "Data da avaliação",
      ].filter((x): x is string => Boolean(x));
      setPendentes(faltam);
      setLido(true);
      setFalhou(false);
      if (faltam.length) {
        setConferenciaAberta(true);
        toast.warning(`Não identificado com segurança: ${faltam.join(", ")}. Confira abaixo.`);
      } else toast.success("Antropometria importada. Confira os dados abaixo.");
    } catch (erro) {
      setFalhou(true);
      setConferenciaAberta(true);
      toast.error(erro instanceof Error ? erro.message : "Falha ao ler o arquivo. Preencha manualmente abaixo.");
    } finally {
      if (timer) clearInterval(timer);
      setLendo(false);
    }
  }

  return (
    <div className="space-y-6">
      {a.indicadoresAntropometricos.length === 0 && (
        <Panel titulo="Anexar Antropometria">
          <div className="rounded-[10px] border border-dashed border-line bg-white/50 px-5 py-8 text-center">
            <p className="text-[13px] font-semibold text-ink">Selecione uma avaliação antropométrica em PDF:</p>
            <label className="mt-4 inline-flex cursor-pointer items-center rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90">
              {lendo ? `Lendo antropometria… ${progresso}%` : <><Paperclip aria-hidden="true" /> Anexar Antropometria</>}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={lendo}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void processarArquivo(file);
                }}
              />
            </label>
          </div>
        </Panel>
      )}

      {a.indicadoresAntropometricos.length > 0 && (
        <Panel
          titulo="Dados extraídos do PDF"
          extra={
            <button
              type="button"
              onClick={removerAvaliacao}
              className="inline-flex cursor-pointer items-center rounded-[10px] bg-accent px-5 py-2 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90"
            >
              Remover avaliação
            </button>
          }
          meta={(() => { const g = agruparAntropometria(a.indicadoresAntropometricos, a.dataAvaliacaoAntropometrica); const datas = [...new Set(g.map(x => x.data))]; const f = (x: string) => /^\d{4}-\d{2}-\d{2}$/.test(x) ? fmtData(x) : x || "Não informada"; return `Data da avaliação: ${datas.map(f).join(", ")}`; })()}
        >
          <div className="space-y-6">
          {(() => {
            const grupos = agruparAntropometria(a.indicadoresAntropometricos, a.dataAvaliacaoAntropometrica);
            const medidas = grupos.filter((g) => g.categoria === "Medidas");
            const resultados = grupos.filter((g) => g.categoria === "Resultados");
            const outros = grupos.filter((g) => g.categoria !== "Medidas" && g.categoria !== "Resultados");
            const pares = Math.max(medidas.length, resultados.length);
            return (
              <div className="space-y-6">
                {Array.from({ length: pares }, (_, k) => (
                  <div key={`par-${k}`} className="flex flex-wrap items-start gap-x-12 gap-y-6">
                    {medidas[k] && <TabelaIndicadores categoria={medidas[k].categoria} indicadores={medidas[k].indicadores} />}
                    {resultados[k] && <TabelaIndicadores categoria={resultados[k].categoria} indicadores={resultados[k].indicadores} />}
                  </div>
                ))}
                {outros.map((grupo) => {
                  const comSilhueta = grupo.categoria === "Circunferências" || grupo.categoria === "Dobras cutâneas";
                  return (
                    <section key={`${grupo.categoria}-${grupo.data}`}>
                      {comSilhueta ? (
                        <div className="flex flex-col items-center">
                          <h3 className="mb-3 text-center font-display text-sm font-semibold text-accent">{grupo.categoria}</h3>
                          <div className="w-full max-w-[920px]">
                            <AnthropometryBody indicadores={grupo.indicadores} categoria={grupo.categoria} sexo={a.sexo === "feminino" ? "feminino" : "masculino"} />
                          </div>
                        </div>
                      ) : (
                        <TabelaIndicadores categoria={grupo.categoria} indicadores={grupo.indicadores} />
                      )}
                    </section>
                  );
                })}
              </div>
            );
          })()}
          </div>
        </Panel>
      )}

      <section className="panel-ink">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">Resultados calculados</h2>
        </div>
        <div className="flex flex-wrap items-start gap-y-4">
          <ResultadoHorizontal
            label="Peso"
            valor={d.pesoKg !== null ? fmt2(d.pesoKg) : "—"}
            sub="kg"
          />
          <ResultadoHorizontal
            label="IMC"
            valor={d.imc !== null ? fmt2(d.imc) : "—"}
            sub="kg/m²"
            destaque={d.classificacaoIMC ?? undefined}
          />
          {d.pio !== null && <ResultadoHorizontal label="PIO" valor={fmt2(d.pio)} sub="kg" />}
          <ResultadoHorizontal
            label="Gordura corporal"
            valor={d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : "—"}
            sub={a.metodoGordura || "método não informado"}
          />
          <ResultadoHorizontal
            label="Massa gorda"
            valor={d.massaGorda !== null ? fmt2(d.massaGorda) : "—"}
            sub="kg"
          />
          <ResultadoHorizontal
            label="Massa livre de gordura"
            valor={d.massaLivreGordura !== null ? fmt2(d.massaLivreGordura) : "—"}
            sub="kg"
            destaque="MLG"
          />
        </div>
        {d.percentualGordura === null && (
          <div className="mt-5 rounded-[10px] bg-white/5 p-3">
            <p className="font-mono text-[10px] leading-relaxed text-white">
              Percentual de gordura não informado.
            </p>
          </div>
        )}
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setConferenciaAberta((v) => !v)}
            className="inline-flex cursor-pointer items-center rounded-[10px] bg-white px-4 py-2 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-white/70"
          >
            {conferenciaAberta ? "Fechar" : "Corrigir"}
          </button>
        </div>
      </section>

      {conferenciaAberta && (
        <Panel titulo="Conferência e correção">
          {(falhou || pendentes.length > 0) && (
            <p className="mb-4 rounded-[10px] bg-warn-soft px-3 py-2 text-[12px] text-ink">
              {falhou
                ? "Não foi possível ler o PDF. Preencha os dados manualmente."
                : `Não identificado com segurança: ${pendentes.join(", ")}. Confira ou preencha manualmente.`}
            </p>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Altura">
              <UnitInput
                value={a.altura}
                onChange={(v) => {
                  if (/^\d?(?:,\d{0,2})?$/.test(v) && (v.match(/\d/g)?.length ?? 0) <= 3) set("altura", v);
                }}
                unidade="m"
                placeholder="1,75"
              />
            </Field>
            <Field label="Peso atual">
              <UnitInput value={a.peso} onChange={(v) => set("peso", v)} unidade="kg" placeholder="78,4" />
            </Field>
            <Field label="Percentual de gordura">
              <UnitInput
                value={a.percentualGordura}
                onChange={(v) => set("percentualGordura", v)}
                unidade="%"
                placeholder="18,5"
              />
            </Field>
            <Field label="Método utilizado para avaliação do percentual de gordura">
              <Select
                value={a.metodoGordura}
                onChange={(v) => set("metodoGordura", v)}
                options={[
                  "Bioimpedância",
                  "DEXA",
                  "Dobras cutâneas",
                  "Estimativa",
                  "Outro",
                ].map((x) => ({ value: x, label: x }))}
              />
            </Field>
            <Field label="Data da avaliação antropométrica">
              <TextInput
                type="date"
                value={a.dataAvaliacaoAntropometrica}
                onChange={(v) => set("dataAvaliacaoAntropometrica", v)}
              />
            </Field>
          </div>
        </Panel>
      )}
    </div>
  );
}
