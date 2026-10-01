import { Field, OptionRow, Panel, TextInput } from "../fields";
import type { StepProps } from "./types";

export function Step1Dados({ a, set, d }: StepProps) {
  return (
    <div>
      <Panel titulo="Dados básicos" meta="Etapa 1">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Data da avaliação" className="sm:col-span-2">
            <TextInput type="date" value={a.dataAvaliacao} onChange={(v) => set("dataAvaliacao", v)} />
          </Field>
          <Field label="Nome do paciente" className="sm:col-span-2">
            <TextInput value={a.nome} onChange={(v) => set("nome", v)} placeholder="Nome completo" />
          </Field>
          <Field label="Data de nascimento">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <TextInput type="date" value={a.dataNascimento} onChange={(v) => set("dataNascimento", v)} />
              </div>
              <p className="shrink-0 font-mono text-[11px] text-ink-soft">
                Idade: <span className="text-ink">{d.idade !== null ? `${d.idade} anos` : "—"}</span>
              </p>
            </div>
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
          <Field label="Profissão" className="sm:col-span-2">
            <TextInput value={a.profissao} onChange={(v) => set("profissao", v)} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
