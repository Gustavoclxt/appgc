import { useState } from "react";

import { fmt2, fmtInt, labelMetodo } from "@/lib/assessment/calculations";
import type { ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { calcularVetCorrigido } from "@/lib/assessment/free-meal";
import { cn } from "@/lib/utils";

import { Field, MetricCard, OptionRow, Panel, Select, UnitInput } from "../fields";
import type { StepProps } from "./types";

const fatores = [
  { value: "1.3", label: "Muito sedentário — 1,3" },
  { value: "1.4", label: "Muito sedentário — 1,4" },
  { value: "1.5", label: "Sedentário pouco ativo — 1,5" },
  { value: "1.6", label: "Sedentário mais ativo — 1,6" },
  { value: "1.7", label: "Moderadamente ativo — 1,7" },
  { value: "1.8", label: "Muito ativo — 1,8" },
  { value: "1.9", label: "Muito ativo — 1,9" },
  { value: "2.0", label: "Atividade intensa — 2,0 ou superior" },
];

const percentuaisBase = ["5", "10", "15", "20", "25", "30"];

const kcalBase = ["250", "500", "750", "1000"];

export function Step6Energia({
  a,
  set,
  d,
  composicao,
  composicaoAtipica,
}: StepProps & { composicao: ComposicaoDiario | null; composicaoAtipica?: ComposicaoDiario | null }) {
  const sinalAjuste = a.estrategia === "deficit" ? "-" : a.estrategia === "superavit" ? "+" : "";
  const percentuais = percentuaisBase.map((p) => ({ value: p, label: `${sinalAjuste}${p}%` }));
  const kcalPresets = kcalBase.map((k) => ({
    value: k,
    label: `${sinalAjuste}${k === "1000" ? "1.000" : k} kcal`,
  }));
  const fatorPersonalizado =
    a.fatorAtividade !== "" && !fatores.some((f) => f.value === a.fatorAtividade);
  const kcalPersonalizado =
    a.kcalAjuste !== "" && !kcalPresets.some((k) => k.value === a.kcalAjuste);
  const [outroKcal, setOutroKcal] = useState(false);
  const mostrarKcalPersonalizado = outroKcal || kcalPersonalizado;
  const percentualPersonalizado =
    a.percentualAjuste !== "" && !percentuais.some((p) => p.value === a.percentualAjuste);
  const [outroPercentual, setOutroPercentual] = useState(false);
  const mostrarPercentualPersonalizado = outroPercentual || percentualPersonalizado;
  const [corrigirRefeicaoLivre, setCorrigirRefeicaoLivre] = useState(
    a.estrategia === "deficit" && (a.refeicoesLivresSemana !== "" || a.vetRefeicoesLivres !== "") ? "sim" : "nao",
  );
  const limparRefeicoesLivres = () => {
    set("refeicoesLivresSemana", "");
    set("vetRefeicoesLivres", "");
  };
  const vetCorrigido = (() => {
    const quantidade = a.refeicoesLivresSemana === "" ? NaN : Number(a.refeicoesLivresSemana.replace(",", "."));
    const kcal = a.vetRefeicoesLivres === "" ? NaN : Number(a.vetRefeicoesLivres.replace(",", "."));
    return calcularVetCorrigido(d.caloriasSugeridas, quantidade, kcal);
  })();
  const mostrarVetCorrigido = a.estrategia === "deficit" && corrigirRefeicaoLivre === "sim";

  return (
    <div className="space-y-6">
      <Panel titulo="Determinação do GET">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Equação para GER">
            <OptionRow
              value={a.metodoTMB}
              onChange={(v) => v && set("metodoTMB", v as typeof a.metodoTMB)}
              options={[
                { value: "harris-benedict", label: "Harris-Benedict" },
                { value: "mifflin", label: "Mifflin-St Jeor" },
                { value: "tinsley-pc", label: "Tinsley (PC)" },
                { value: "tinsley-mlg", label: "Tinsley (MLG)" },
              ]}
            />
          </Field>

          <div>
            <h2 className="mb-3 font-sans text-[13px] font-medium text-ink">Nível de atividade física diária</h2>
            <div className="max-w-sm">
              <Select
                value={fatorPersonalizado ? "" : a.fatorAtividade}
                onChange={(v) => set("fatorAtividade", v)}
                options={fatores}
                placeholder="Selecione o nível de atividade"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="GER"
            valor={d.tmb !== null ? fmtInt(d.tmb) : "—"}
            sub={`kcal/dia · ${(labelMetodo[a.metodoTMB] ?? "")}`}
          />
          <MetricCard
            label="GET"
            valor={d.vet !== null ? fmtInt(d.vet) : "—"}
            sub={`kcal/dia · FA ${d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : "—"}`}
          />
          <MetricCard
            label="Consumindo"
            valor={composicao ? fmtInt(composicao.totais.kcal) : "—"}
            sub={composicao ? "kcal · Recordatório 24 horas" : "Calcule o Recordatório 24 horas"}
            extra={
              composicao && composicaoAtipica ? (
                <div className="mt-2 border-t border-accent/15 pt-2">
                  <p className="font-mono text-[11px] tabular-nums text-ink">
                    Dia atípico: {fmtInt(composicaoAtipica.totais.kcal)} kcal
                  </p>
                  <p className="font-mono text-[11px] tabular-nums text-ink-soft">
                    Diferença: {composicaoAtipica.totais.kcal - composicao.totais.kcal >= 0 ? "+" : "−"}
                    {fmtInt(Math.abs(composicaoAtipica.totais.kcal - composicao.totais.kcal))} kcal
                  </p>
                </div>
              ) : undefined
            }
          />
        </div>
        {d.tmb === null && (
          <p className="mt-4 font-mono text-[11px] text-ink-soft">
            {a.metodoTMB === "tinsley-pc"
              ? "Informe um peso corporal válido na Avaliação para calcular o GER."
              : a.metodoTMB === "tinsley-mlg"
                ? "Informe peso e percentual de gordura válidos na Avaliação para calcular a massa livre de gordura e o GER."
                : "Informe sexo, data de nascimento, peso e altura para calcular o GER."}
          </p>
        )}
      </Panel>

      <Panel titulo="Estratégia energética">
        <div
          className={cn(
            "grid grid-cols-1 items-start gap-5",
            a.estrategia !== "superavit" && "sm:grid-cols-2",
          )}
        >
          <div className="min-w-0 space-y-5">
            <OptionRow
              value={a.estrategia}
              onChange={(v) => {
                if (!v) return;
                set("estrategia", v as typeof a.estrategia);
                if (v === "deficit") {
                  set("tipoAjuste", "kcal");
                } else {
                  setCorrigirRefeicaoLivre("nao");
                  limparRefeicoesLivres();
                }
              }}
              options={[
                { value: "deficit", label: "Déficit calórico" },
                { value: "normocalorica", label: "Normocalórica" },
                { value: "superavit", label: "Superávit calórico" },
              ]}
            />
          {a.estrategia !== "normocalorica" && (
          <div className="space-y-4">
            <Field label="Forma do ajuste">
              <OptionRow
                value={a.tipoAjuste}
                onChange={(v) => v && set("tipoAjuste", v as typeof a.tipoAjuste)}
                options={[
                  { value: "kcal", label: "Em calorias" },
                  { value: "percentual", label: "Percentual do VET" },
                ]}
              />
            </Field>

            {a.tipoAjuste === "kcal" ? (
              <>
                <div className="flex flex-wrap items-end gap-3">
                  <Field>
                    <div className="w-40">
                      <Select
                        value={mostrarKcalPersonalizado ? "outro" : a.kcalAjuste}
                        onChange={(v) => {
                          if (v === "outro") {
                            setOutroKcal(true);
                            if (kcalPresets.some((k) => k.value === a.kcalAjuste)) set("kcalAjuste", "");
                          } else if (v) {
                            setOutroKcal(false);
                            set("kcalAjuste", v);
                          }
                        }}
                        options={[...kcalPresets, { value: "outro", label: "Outro" }]}
                        placeholder="Selecione"
                      />
                    </div>
                  </Field>
                  {mostrarKcalPersonalizado && (
                    <Field label="Valor personalizado">
                      <div className="w-28">
                        <UnitInput
                          value={a.kcalAjuste}
                          onChange={(v) => set("kcalAjuste", v)}
                          unidade="kcal"
                        />
                      </div>
                    </Field>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-end gap-3">
                  <Field>
                    <div className="w-40">
                      <Select
                        value={mostrarPercentualPersonalizado ? "outro" : a.percentualAjuste}
                        onChange={(v) => {
                          if (v === "outro") {
                            setOutroPercentual(true);
                            if (percentuais.some((p) => p.value === a.percentualAjuste)) set("percentualAjuste", "");
                          } else if (v) {
                            setOutroPercentual(false);
                            set("percentualAjuste", v);
                          }
                        }}
                        options={[...percentuais, { value: "outro", label: "Outro" }]}
                        placeholder="Selecione"
                      />
                    </div>
                  </Field>
                  {mostrarPercentualPersonalizado && (
                    <Field label="Percentual personalizado">
                      <div className="w-28">
                        <UnitInput
                          value={a.percentualAjuste}
                          onChange={(v) => set("percentualAjuste", v)}
                          unidade="%"
                        />
                      </div>
                    </Field>
                  )}
                </div>
              </>
            )}
          </div>
        )}
          </div>
          {a.estrategia === "deficit" && (
            <div className="min-w-0 space-y-4">
              <Field label="Corrigir VET por refeição livre?">
                <OptionRow
                  value={corrigirRefeicaoLivre}
                  onChange={(v) => {
                    setCorrigirRefeicaoLivre(v);
                    if (v !== "sim") limparRefeicoesLivres();
                  }}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]}
                />
              </Field>
              {corrigirRefeicaoLivre === "sim" && (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    <Field label="Nº de ref. livres/semana">
                      <div className="w-24">
                        <UnitInput value={a.refeicoesLivresSemana} onChange={(v) => set("refeicoesLivresSemana", v.replace(/\D/g, ""))} unidade="ref." placeholder="1" />
                      </div>
                    </Field>
                    <Field label="VET das ref. livres">
                      <div className="w-28">
                        <UnitInput value={a.vetRefeicoesLivres} onChange={(v) => set("vetRefeicoesLivres", v)} unidade="kcal" placeholder="1600" />
                      </div>
                    </Field>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="GET" valor={d.vet !== null ? fmtInt(d.vet) : "—"} sub="kcal/dia" />
          <MetricCard
            label="Prescrição"
            valor={d.caloriasSugeridas !== null ? fmtInt(d.caloriasSugeridas) : "—"}
            sub="kcal/dia"
          />
          {mostrarVetCorrigido && (
            <MetricCard
              label="VET Corrigido"
              valor={vetCorrigido !== null ? fmtInt(vetCorrigido) : "—"}
              sub="kcal/dia"
            />
          )}
        </div>
      </Panel>

    </div>
  );

}
