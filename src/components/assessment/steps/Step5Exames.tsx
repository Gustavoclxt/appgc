import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { extrairExames } from "@/lib/assessment/analysis.functions";
import { extractPdfText } from "@/lib/assessment/extract-pdf-text";
import { novoId } from "@/lib/assessment/initial-state";

import { ExamesTable } from "../ExamesTable";
import { Field, LongText, Panel, RowButton } from "../fields";
import type { StepProps } from "./types";

export function Step5Exames({ a, set }: StepProps) {
  const [lendo, setLendo] = useState(false);
  const extrair = useServerFn(extrairExames);

  async function processarArquivo(file: File) {
    setLendo(true);
    try {
      const texto = await extractPdfText(file);
      if (texto.trim().length < 20) {
        toast.error("Não foi possível ler texto neste PDF. Pode ser um laudo digitalizado como imagem.");
        return;
      }
      const encontrados = await extrair({ data: { textoPdf: texto.slice(0, 60000) } });
      if (!encontrados.length) {
        toast.error("Nenhum exame foi identificado no arquivo.");
        return;
      }
      set("exames", [...a.exames, ...encontrados.map((e) => ({ ...e, id: novoId() }))]);
      toast.success(`${encontrados.length} exame(s) identificado(s).`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Falha ao ler o arquivo.");
    } finally {
      setLendo(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel titulo="Anexar exames laboratoriais">
        <div className="rounded-[10px] border border-dashed border-line bg-white/50 px-5 py-8 text-center">
          <p className="text-[13px] text-ink">
            Selecione um exame laboratorial em PDF:
          </p>
          <label className="mt-4 inline-flex cursor-pointer items-center rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90">
            {lendo ? "Lendo exames…" : "Escolher arquivo PDF"}
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

      {a.exames.length > 0 && (
        <Panel titulo="Exames identificados" meta={`${a.exames.length} resultado(s)`}>
          <ExamesTable exames={a.exames} />
          <div className="mt-4">
            <RowButton onClick={() => set("exames", [])}>Limpar exames</RowButton>
          </div>
        </Panel>
      )}

      <Panel titulo="Observações sobre os exames">
        <Field label="\n">
          <LongText
            value={a.observacoesExames}
            onChange={(v) => set("observacoesExames", v)}
            rows={4}
            placeholder="Anotações do nutricionista sobre os achados laboratoriais."
          />
        </Field>
      </Panel>
    </div>
  );
}
