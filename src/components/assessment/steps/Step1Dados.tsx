import { Field, OptionRow, Panel, TextInput } from "../fields";
import type { StepProps } from "./types";

export function Step1Dados({ a, set, d }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Panel titulo="Dados básicos" meta="Etapa 1" className="lg:col-span-7">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nome do paciente" className="sm:col-span-2">
            <TextInput value={a.nome} onChange={(v) => set("nome", v)} placeholder="Nome completo" />
          </Field>
          <Field label="Data de nascimento">
            <TextInput type="date" value={a.dataNascimento} onChange={(v) => set("dataNascimento", v)} />
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

      <section className="panel-ink lg:col-span-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight">Idade calculada</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">auto</span>
        </div>
        <div className="settle">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-white/60">Idade</span>
            <span className="font-mono text-4xl font-medium tracking-tight tabular-nums">
              {d.idade !== null ? d.idade : "—"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-white/45">
            {d.idade !== null ? "anos completos na data da avaliação" : "informe a data de nascimento"}
          </p>
        </div>
        <div className="mt-5 rounded-[10px] bg-white/5 p-3">
          <p className="font-mono text-[10px] leading-relaxed text-white/50">
            Esta ferramenta não armazena os dados inseridos. As informações permanecem apenas durante
            esta sessão.
          </p>
        </div>
      </section>
    </div>
  );
}
