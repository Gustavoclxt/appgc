import { useState } from "react";
import { toast } from "sonner";

import { novoId } from "@/lib/assessment/initial-state";
import { podeAnexarExames } from "@/lib/assessment/anthropometry-groups";

import { ExamesTable } from "../ExamesTable";
import { Field, Panel, RowButton, Select, TextInput } from "../fields";
import type { StepProps } from "./types";
import type { ExameLaboratorial } from "@/lib/assessment/types";

const exameVazio = (): ExameLaboratorial => ({
  id: novoId(),
  exame: "",
  resultado: "",
  unidade: "",
  referencia: "",
  status: "indeterminado",
});

export function Step5Exames({ a, set }: StepProps) {
  const [mostrarManual, setMostrarManual] = useState(false);
  const [exameManual, setExameManual] = useState<ExameLaboratorial>(() => exameVazio());

  const atualizarExameManual = <K extends keyof ExameLaboratorial>(
    campo: K,
    valor: ExameLaboratorial[K],
  ) => setExameManual((atual) => ({ ...atual, [campo]: valor }));

  function adicionarExameManual() {
    if (!exameManual.exame.trim()) {
      toast.error("Informe o nome do exame.");
      return;
    }
    set("exames", [...a.exames, exameManual]);
    setExameManual(exameVazio());
    toast.success("Resultado adicionado.");
  }

  return (
    <div className="space-y-6">
      {a.exames.length > 0 && (
        <>
          <Panel titulo="Exames identificados" meta={`${a.exames.length} resultado(s)`}>
            <ExamesTable exames={a.exames} />
            <div className="mt-4">
              <RowButton onClick={() => set("exames", [])}>Limpar exames</RowButton>
            </div>
          </Panel>

          <Panel titulo="Adicionar resultado manualmente">
            {!mostrarManual ? (
              <RowButton onClick={() => setMostrarManual(true)}>Adicionar resultado</RowButton>
            ) : (
            <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <Field label="Exame">
                <TextInput
                  value={exameManual.exame}
                  onChange={(valor) => atualizarExameManual("exame", valor)}
                />
              </Field>
              <Field label="Resultado">
                <TextInput
                  value={exameManual.resultado}
                  onChange={(valor) => atualizarExameManual("resultado", valor)}
                />
              </Field>
              <Field label="Unidade">
                <TextInput
                  value={exameManual.unidade}
                  onChange={(valor) => atualizarExameManual("unidade", valor)}
                />
              </Field>
              <Field label="Referência">
                <TextInput
                  value={exameManual.referencia}
                  onChange={(valor) => atualizarExameManual("referencia", valor)}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={exameManual.status}
                  onChange={(valor) =>
                    atualizarExameManual("status", valor as ExameLaboratorial["status"])
                  }
                  options={[
                    { value: "dentro", label: "Dentro da referência" },
                    { value: "abaixo", label: "Abaixo" },
                    { value: "acima", label: "Acima" },
                    { value: "indeterminado", label: "Indeterminado" },
                  ]}
                />
              </Field>
            </div>
            <div className="mt-4">
              <RowButton onClick={adicionarExameManual}>+ Adicionar resultado</RowButton>
            </div>
            </>
            )}
          </Panel>
        </>
      )}

      {podeAnexarExames(a) && (
        <Panel titulo="Observações sobre os Exames Laboratoriais">
          <TextInput value={a.observacoesExames} onChange={(v) => set("observacoesExames", v)} />
        </Panel>
      )}
    </div>
  );
}
