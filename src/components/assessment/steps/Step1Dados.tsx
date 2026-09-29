import { Field, OptionRow, Panel, TextInput } from "../fields";
import type { StepProps } from "./types";

export function Step1Dados({ a, set, d }: StepProps) {
  return (
    <div>
      <Panel titulo="Dados básicos" meta="Etapa 1">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nome do paciente" className="sm:col-span-2">
            <TextInput value={a.nome} onChange={(v) => set("nome", v)} placeholder="Nome completo" />
          </Field>
          <Field label="Data de nascimento">
            <TextInput type="date" value={a.dataNascimento} onChange={(v) => set("dataNascimento", v)} />
            <p className="mt-1.5 font-mono text-[11px] text-ink-soft">
              Idade: {d.idade !== null ? `${d.idade} anos` : "—"}
            </p>
          </Field>
          <Field label="Data da avaliação">
            <TextInput type="date" value={a.dataAvaliacao} onChange={(v) => set("dataAvaliacao", v)} />
          </Field>
          <Field label="Sexo" className="sm:col-span-2">
            <OptionRow
              value={a.sexo}
              onChange={(v) => set("sexo", v as typeof a.sexo)}
              options={[
                { value: "masculino", label: "Masculino" },
                { value: "feminino", label: "Feminino" },
              ]}
            />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
