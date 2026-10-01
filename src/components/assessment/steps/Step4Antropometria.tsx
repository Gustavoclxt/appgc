import { fmt2 } from "@/lib/assessment/calculations";

import { Field, Panel, Readout, Select, TextInput, UnitInput } from "../fields";
import type { StepProps } from "./types";

export function Step4Antropometria({ a, set, d }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Panel titulo="Antropometria" className="lg:col-span-7">
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
          <Field label="Data da avaliação">
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
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">auto</span>
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
            <p className="font-mono text-[10px] leading-relaxed text-white/50">
              Percentual de gordura não informado.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
