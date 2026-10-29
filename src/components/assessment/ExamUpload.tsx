import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { extrairExames } from "@/lib/assessment/analysis.functions";
import { extractPdfText } from "@/lib/assessment/extract-pdf-text";
import { novoId } from "@/lib/assessment/initial-state";
import type { StepProps } from "./steps/types";

export function ExamUpload({ a, set }: Pick<StepProps, "a" | "set">) {
  const [lendo, setLendo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const extrair = useServerFn(extrairExames);

  async function processarArquivo(file: File) {
    setLendo(true);
    setProgresso(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    try {
      const texto = await extractPdfText(file, (f) => setProgresso(Math.round(f * 40)));
      if (texto.trim().length < 20) {
        toast.error("Não foi possível ler texto neste PDF. Pode ser um laudo digitalizado como imagem.");
        return;
      }
      timer = setInterval(() => setProgresso((p) => (p < 95 ? p + Math.max(1, Math.round((95 - p) / 12)) : p)), 400);
      const encontrados = await extrair({ data: { textoPdf: texto.slice(0, 60000) } });
      clearInterval(timer);
      timer = undefined;
      setProgresso(100);
      if (!encontrados.length) {
        toast.error("Nenhum exame foi identificado no arquivo.");
        return;
      }
      set("exames", [...a.exames, ...encontrados.map((e) => ({ ...e, id: novoId() }))]);
      toast.success(`${encontrados.length} exame(s) identificado(s).`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Falha ao ler o arquivo.");
    } finally {
      if (timer) clearInterval(timer);
      setLendo(false);
    }
  }

  return (
    <>
      <Button type="button" className="h-10 px-4" disabled={lendo} onClick={() => inputRef.current?.click()}>
        <Paperclip aria-hidden="true" />
        {lendo ? `Lendo exames… ${progresso}%` : "Anexar Exame"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        aria-label="Anexar Exame em PDF"
        className="hidden"
        disabled={lendo}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void processarArquivo(file);
        }}
      />
    </>
  );
}
