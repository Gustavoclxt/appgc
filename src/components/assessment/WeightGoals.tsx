import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmt2, fmtData, fmtInt, parseNumero } from "@/lib/assessment/calculations";
import { calcularMetasPeso, REFERENCIAS_METAS, type MetasPesoResultado } from "@/lib/assessment/weight-goals";
import { labelClassificacao, type MetasPesoEstado } from "@/lib/assessment/weight-projection";

import { Field, MetricCard, OptionRow, Panel, SubTitle, UnitInput } from "./fields";
import type { StepProps } from "./steps/types";

interface Props extends StepProps {
  metas: MetasPesoEstado;
  onChange: (m: MetasPesoEstado) => void;
  onGerarPdf: (r: MetasPesoResultado) => void;
}

const corClass: Record<string, string> = {
  compativel: "bg-accent-soft text-accent ring-accent/20",
  agressiva: "bg-warn-soft text-warn ring-warn/30",
  "muito-agressiva": "bg-destructive-soft text-destructive ring-destructive/30",
};

export function WeightGoals({ a, d, metas, onChange, onGerarPdf }: Props) {
  const r = useMemo(() => calcularMetasPeso(a, d, metas), [a, d, metas]);
  const up = <K extends keyof MetasPesoEstado>(k: K, v: MetasPesoEstado[K]) => onChange({ ...metas, [k]: v });

  const dadosGrafico = useMemo(() => {
    const pontos: { dia: number; dinamico?: number; meta?: number }[] = [];
    const serie = r.modelo?.serie;
    for (let dia = 0; dia <= 365; dia += 7) pontos.push({ dia, dinamico: serie?.[dia]?.peso });
    for (const m of r.metas) pontos.push({ dia: Math.round(m.meses * 30.4375), meta: m.pesoMeta });
    return pontos.sort((x, y) => x.dia - y.dia);
  }, [r]);

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
          <Field label="Peso desejado" hint={a.pesoDesejado && !metas.pesoDesejado ? "Usando o peso desejado da anamnese." : undefined}>
            <UnitInput value={metas.pesoDesejado || a.pesoDesejado} onChange={(v) => up("pesoDesejado", v)} unidade="kg" casas={2} />
          </Field>
        ) : (
          <Field label="Quanto deseja perder">
            <UnitInput value={metas.kgPerder} onChange={(v) => up("kgPerder", v)} unidade="kg" casas={2} />
          </Field>
        )}
        <Field label="Prazo pretendido">
          <UnitInput value={metas.prazoMeses} onChange={(v) => up("prazoMeses", v)} unidade="meses" casas={1} />
        </Field>
      </div>
      {r.expectativa && (
        <div className="mt-4 rounded-[10px] bg-white/60 p-4 ring-1 ring-line">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-ink">
              Perder <b>{fmt2(r.expectativa.kg)} kg</b> ({fmt2(r.expectativa.percentual)}% do peso inicial), meta de{" "}
              <b>{fmt2(r.expectativa.pesoAlvo)} kg</b>
              {r.expectativa.kgSemana !== null && (
                <> · {fmt2(r.expectativa.kgSemana)} kg/semana · {fmt2(r.expectativa.pctSemana)}%/semana</>
              )}
            </p>
            {r.classificacao && (
              <span className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase ring-1 ${corClass[r.classificacao]}`}>
                {labelClassificacao[r.classificacao]}
              </span>
            )}
          </div>
        </div>
      )}

      <SubTitle className="mt-7">Metas clínicas de referência (ajustáveis)</SubTitle>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="1 mês"><UnitInput value={metas.meta1} onChange={(v) => up("meta1", v)} unidade="%" casas={1} /></Field>
        <Field label="3 meses"><UnitInput value={metas.meta3} onChange={(v) => up("meta3", v)} unidade="%" casas={1} /></Field>
        <Field label="6 meses (mín.)"><UnitInput value={metas.meta6Min} onChange={(v) => up("meta6Min", v)} unidade="%" casas={1} /></Field>
        <Field label="6 meses (máx.)"><UnitInput value={metas.meta6Max} onChange={(v) => up("meta6Max", v)} unidade="%" casas={1} /></Field>
      </div>
      {r.metas.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
              <tr><th className="py-2">Meta</th><th>% perda</th><th>Kg</th><th>Peso meta</th><th>kg/sem</th><th>%/sem</th><th>kg/mês</th></tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {r.metas.map((m) => (
                <tr key={m.rotulo} className="border-t border-line/70">
                  <td className="py-2 font-sans">{m.rotulo}</td><td>{fmt2(m.percentual)}%</td><td>{fmt2(m.kg)}</td>
                  <td>{fmt2(m.pesoMeta)}</td><td>{fmt2(m.kgSemana)}</td><td>{fmt2(m.pctSemana)}</td><td>{fmt2(m.kgMes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-ink-soft">Referências ajustáveis — não são metas universais nem garantia de resultado.</p>
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-ink-soft">Informe o peso na antropometria para calcular as metas.</p>
      )}

      <SubTitle className="mt-7">Modelo dinâmico de perda de peso (Hall/NIH)</SubTitle>
      <div className="max-w-xs">
        <Field label="Déficit energético da projeção" hint={r.deficitOrigem}>
          <UnitInput
            value={metas.deficitKcal || (r.deficitPlano !== null ? String(Math.round(r.deficitPlano)) : "")}
            onChange={(v) => up("deficitKcal", v)}
            unidade="kcal/dia"
          />
        </Field>
      </div>
      {r.limitacoes.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-[10px] bg-warn-soft/60 p-3 text-[12px] text-ink ring-1 ring-warn/20">
          {r.limitacoes.map((l) => <li key={l}>• {l}</li>)}
        </ul>
      )}
      {r.modelo && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
            {r.projecoes.map((p) => (
              <MetricCard key={p.dias} label={`${p.dias} dias`} valor={fmt2(p.peso)} sub={`kg · −${fmt2(r.pesoInicial! - p.peso)} kg`} />
            ))}
            <MetricCard
              label="Tempo até objetivo"
              valor={r.diasMeta !== null ? `${fmtInt(r.diasMeta)}` : "—"}
              sub={r.diasMeta !== null ? `dias · ~${fmt2(r.diasMeta / 30.4375)} meses` : r.expectativa ? "Não atingido em 3 anos" : "Informe a expectativa"}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-soft">
            Ingestão basal estimada {fmtInt(r.modelo.ingestaoBasal)} kcal/dia → {fmtInt(r.modelo.ingestaoAlvo)} kcal/dia.
          </p>
        </>
      )}

      <SubTitle className="mt-7">Gráfico comparativo</SubTitle>
      {r.pesoInicial !== null ? (
        <div className="h-[320px] w-full">
          <ResponsiveContainer>
            <ComposedChart data={dadosGrafico} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
              <XAxis dataKey="dia" type="number" domain={[0, 365]} ticks={[0, 30, 60, 90, 180, 365]} tick={{ fontSize: 11 }} unit="d" />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} unit="kg" width={56} />
              <Tooltip formatter={(v: number) => `${fmt2(v)} kg`} labelFormatter={(l) => `Dia ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={r.pesoInicial} stroke="var(--ink-soft)" strokeDasharray="4 4" label={{ value: "Peso inicial", fontSize: 10, position: "insideTopRight" }} />
              {r.expectativa && (
                <ReferenceLine y={r.expectativa.pesoAlvo} stroke="var(--warn)" strokeDasharray="4 4" label={{ value: "Peso desejado", fontSize: 10, position: "insideBottomRight" }} />
              )}
              {r.modelo && <Line dataKey="dinamico" name="Trajetória dinâmica" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls />}
              <Scatter dataKey="meta" name="Metas de referência" fill="var(--ink)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-[12px] text-ink-soft">Gráfico disponível após informar o peso.</p>
      )}

      {r.interpretacao.length > 0 && (
        <>
          <SubTitle className="mt-7">Interpretação clínica (sugestão)</SubTitle>
          <ul className="space-y-1.5 text-[13px] text-ink">
            {r.interpretacao.map((t) => <li key={t}>→ {t}</li>)}
          </ul>
        </>
      )}

      <SubTitle className="mt-7">Referências científicas</SubTitle>
      <ul className="space-y-1 text-[11px] text-ink-soft">
        {REFERENCIAS_METAS.map((t) => <li key={t}>• {t}</li>)}
        <li>• Modelo de Hall implementado em dois compartimentos (sem glicogênio/água); estimativas podem diferir da calculadora oficial do NIH.</li>
      </ul>

      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={() => onGerarPdf(r)}
          disabled={r.pesoInicial === null}
          className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground ring-1 ring-accent/40 hover:bg-accent/90 disabled:opacity-40"
        >
          Gerar PDF de Metas e Projeção
        </button>
      </div>
      {parseNumero(metas.prazoMeses) === null && r.expectativa && (
        <p className="mt-2 text-center text-[11px] text-ink-soft">Informe o prazo para classificar a expectativa.</p>
      )}
    </Panel>
  );
}
