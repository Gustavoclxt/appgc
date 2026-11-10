import { useMemo } from "react";
import { fmt2, fmtData } from "@/lib/assessment/calculations";
import { calcularMetasPeso } from "@/lib/assessment/weight-goals";
import { type MetasPesoEstado } from "@/lib/assessment/weight-projection";

import { Field, MetricCard, OptionRow, Panel, SubTitle, UnitInput } from "./fields";
import { WeightGoalsChart } from "./WeightGoalsChart";
import { WeightReferenceCards } from "./WeightReferenceCards";
import type { StepProps } from "./steps/types";

interface Props extends StepProps {
  metas: MetasPesoEstado;
  onChange: (m: MetasPesoEstado) => void;
}

export function WeightGoals({ a, d, metas, onChange }: Props) {
  const r = useMemo(() => calcularMetasPeso(a, d, metas), [a, d, metas]);
  const up = <K extends keyof MetasPesoEstado>(k: K, v: MetasPesoEstado[K]) => onChange({ ...metas, [k]: v });

  return (
    <Panel titulo="Metas e Projeção de Peso" meta="Emagrecimento">
      <p className="text-[12px] text-ink-soft">
        Dados da avaliação antropométrica de {fmtData(r.dataAvaliacao)} · Paciente: {a.nome || "—"}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Peso inicial" valor={r.pesoInicial !== null ? fmt2(r.pesoInicial) : "—"} sub="kg" />
        <MetricCard label="IMC" valor={d.imc !== null ? fmt2(d.imc) : "—"} sub={d.classificacaoIMC ?? "kg/m²"} />
        <MetricCard label="Idade · Sexo" valor={d.idade !== null ? String(d.idade) : "—"} sub={a.sexo || "—"} />
        <MetricCard label="Altura" valor={d.alturaCm !== null ? fmt2(d.alturaCm / 100) : "—"} sub="m" />
      </div>

      <SubTitle className="mt-7">Expectativa do paciente</SubTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Informar como">
          <OptionRow
            value={metas.modo}
            onChange={(v) => v && up("modo", v as MetasPesoEstado["modo"])}
            options={[
              { value: "peso", label: "Peso desejado" },
              { value: "kg", label: "Kg a perder" },
            ]}
          />
        </Field>
        {metas.modo === "peso" ? (
          <Field label="Peso desejado" hint={a.pesoDesejado && !metas.pesoDesejado ? "Usando o peso desejado da anamnese." : ""}>
            <UnitInput value={metas.pesoDesejado || a.pesoDesejado} onChange={(v) => up("pesoDesejado", v)} unidade="kg" casas={2} className="max-w-[8rem]" />
          </Field>
        ) : (
          <Field label="Quanto deseja perder">
            <UnitInput value={metas.kgPerder} onChange={(v) => up("kgPerder", v)} unidade="kg" casas={2} className="max-w-[8rem]" />
          </Field>
        )}
        <Field label="Prazo pretendido">
          <UnitInput value={metas.prazoMeses} onChange={(v) => up("prazoMeses", v)} unidade="meses" casas={1} className="max-w-[8.5rem]" />
        </Field>
      </div>
      <WeightReferenceCards resultado={r} />
      <SubTitle className="mt-7">Modelo dinâmico de perda de peso (Hall/NIH)</SubTitle>
      <div className="max-w-xs">
        <Field label="Déficit energético da projeção" hint={r.deficitOrigem}>
          <UnitInput
            value={metas.deficitKcal || (r.deficitPlano !== null ? String(Math.round(r.deficitPlano)) : "")}
            onChange={(v) => up("deficitKcal", v)}
            unidade="kcal/dia"
            className="max-w-[10rem]"
          />
        </Field>
      </div>
      <WeightGoalsChart resultado={r} />
      {r.limitacoes.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-ink-soft">{r.limitacoes.map(item => <li key={item}>{item}</li>)}</ul>}
    </Panel>
  );
}
