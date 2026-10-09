import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { extrairAntropometria } from "@/lib/assessment/analysis.functions";
import { fmt2 } from "@/lib/assessment/calculations";
import { extractPdfText } from "@/lib/assessment/extract-pdf-text";
import { novoId } from "@/lib/assessment/initial-state";

import { Field, Panel, Readout, Select, TextInput, UnitInput } from "../fields";
import type { StepProps } from "./types";

export function Step4Antropometria({ a, set, d }: StepProps) {
  const [lendo, setLendo] = useState(false);
  const [lido, setLido] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [pendentes, setPendentes] = useState<string[]>([]);
  const extrair = useServerFn(extrairAntropometria);
  const mostrarConferencia = lido || falhou || Boolean(a.altura || a.peso);

  async function processarArquivo(file: File) {
    setLendo(true);
    try {
      const texto = await extractPdfText(file);
      if (texto.trim().length < 20) {
        setFalhou(true);
        toast.error("Não foi possível ler texto neste PDF. Preencha os dados manualmente abaixo.");
        return;
      }
      const r = await extrair({ data: { textoPdf: texto.slice(0, 60000) } });
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
      if (faltam.length) toast.warning(`Não identificado com segurança: ${faltam.join(", ")}. Confira abaixo.`);
      else toast.success("Antropometria importada. Confira os dados abaixo.");
    } catch (erro) {
      setFalhou(true);
      toast.error(erro instanceof Error ? erro.message : "Falha ao ler o arquivo. Preencha manualmente abaixo.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel titulo="Anexar Antropometria">
        <div className="rounded-[10px] border border-dashed border-line bg-white/50 px-5 py-8 text-center">
          <p className="text-[13px] text-ink">Selecione uma antropometria em PDF:</p>
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90">
            {lendo ? "Lendo antropometria…" : "Adicionar"}
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

      {a.indicadoresAntropometricos.length > 0 && (
        <Panel titulo="Dados extraídos do PDF" meta={`${a.indicadoresAntropometricos.length} indicador(es)`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                <tr><th className="py-2 pr-4">Indicador</th><th className="py-2 pr-4">Valor</th><th className="py-2 pr-4">Unidade</th><th className="py-2">Data</th></tr>
              </thead>
              <tbody>
                {a.indicadoresAntropometricos.map((i) => (
                  <tr key={i.id} className="border-t border-line/70">
                    <td className="py-2 pr-4 text-ink">{i.nome}</td>
                    <td className="py-2 pr-4 font-mono">{i.valor}</td>
                    <td className="py-2 pr-4 text-ink-soft">{i.unidade || "—"}</td>
                    <td className="py-2 text-ink-soft">{i.data || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {mostrarConferencia && (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Panel titulo="Conferência e correção" className="lg:col-span-7">
        {(falhou || pendentes.length > 0) && (
          <p className="mb-4 rounded-[10px] bg-warn-soft px-3 py-2 text-[12px] text-ink">
            {falhou
              ? "Não foi possível ler o PDF. Preencha os dados manualmente."
              : `Não identificado com segurança: ${pendentes.join(", ")}. Confira ou preencha manualmente.`}
          </p>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

      <section className="panel-ink lg:col-span-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">Resultados calculados</h2>
        </div>
        <div className="space-y-4">
          <Readout
            label="Peso"
            valor={d.pesoKg !== null ? fmt2(d.pesoKg) : "—"}
            sub="kg"
          />
          <div className="h-px bg-white/10" />
          <Readout
            label="IMC"
            valor={d.imc !== null ? fmt2(d.imc) : "—"}
            sub="kg/m²"
            destaque={d.classificacaoIMC ?? undefined}
          />
          {d.pio !== null && (
            <>
              <div className="h-px bg-white/10" />
              <Readout label="PIO" valor={fmt2(d.pio)} sub="kg" />
            </>
          )}
          <div className="h-px bg-white/10" />
          <Readout
            label="Gordura corporal"
            valor={d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : "—"}
            sub={a.metodoGordura || "método não informado"}
          />
          <div className="h-px bg-white/10" />
          <Readout
            label="Massa gorda"
            valor={d.massaGorda !== null ? fmt2(d.massaGorda) : "—"}
            sub="kg"
          />
          <div className="h-px bg-white/10" />
          <Readout
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
      </section>
    </div>
      )}
    </div>
  );
}
