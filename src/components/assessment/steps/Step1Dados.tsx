import { Field, Panel, TextInput } from "../fields";
import type { StepProps } from "./types";

export function Step1Dados({ a, set, d }: StepProps) {
  return (
    <div>
      <Panel titulo="Informações pessoais">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nome completo">
            <TextInput value={a.nome} onChange={(v) => set("nome", v)} />
          </Field>
          <Field label="Sexo" className="sm:col-start-2">
            <div className="flex items-center gap-6">
              {(
                [
                  { value: "masculino", label: "Masculino" },
                  { value: "feminino", label: "Feminino" },
                ] as const
              ).map(({ value, label }) => {
                const ativo = a.sexo === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("sexo", value)}
                    className="flex cursor-pointer items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    aria-pressed={ativo}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${ativo ? "border-accent" : "border-ink-soft/60"}`}
                    >
                      {ativo && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </span>
                    <span className="text-[13px] text-ink">{label}</span>
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Data de nascimento" className="sm:col-start-1">
            <div className="flex items-center gap-3">
              <div className="w-[165px] shrink-0">
                <TextInput type="date" value={a.dataNascimento} onChange={(v) => set("dataNascimento", v)} />
              </div>
              <p className="shrink-0 text-[13px] font-medium text-ink">
                Idade: <span className="text-ink">{d.idade !== null ? `${d.idade} anos` : "—"}</span>
              </p>
            </div>
          </Field>
          <Field label="Profissão" className="sm:col-start-2">
            <TextInput value={a.profissao} onChange={(v) => set("profissao", v)} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
