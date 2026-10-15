import { fmt2, fmtInt, labelMetodo } from "@/lib/assessment/calculations";
import type { ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { calcularVetCorrigido } from "@/lib/assessment/free-meal";

import { Field, MetricCard, OptionRow, Panel, Select, TextInput, UnitInput } from "../fields";
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

const percentuais = ["5", "10", "15", "20", "25", "30"].map((p) => ({ value: p, label: `${p}%` }));

const kcalPresets = ["250", "500", "750", "1000"].map((k) => ({
  value: k,
  label: `${k} kcal`,
}));

export function Step6Energia({
  a,
  set,
  d,
  composicao,
}: StepProps & { composicao: ComposicaoDiario | null }) {
  const fatorPersonalizado =
    a.fatorAtividade !== "" && !fatores.some((f) => f.value === a.fatorAtividade);
  const kcalPersonalizado =
    a.kcalAjuste !== "" && !kcalPresets.some((k) => k.value === a.kcalAjuste);

  return (
    <div className="space-y-6">
      <Panel titulo="Gasto energético">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Equação para a TMB">
            <OptionRow
              value={a.metodoTMB}
              onChange={(v) => v && set("metodoTMB", v as typeof a.metodoTMB)}
              options={[
                { value: "harris-benedict", label: "Harris-Benedict" },
                { value: "mifflin", label: "Mifflin-St Jeor" },
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
            <div className="mt-4 max-w-xs">
              <Field
                label="Fator Atividade personalizado"
                hint="Para 2,0 ou superior, informe o valor manualmente."
              >
                <UnitInput
                  value={a.fatorAtividade}
                  onChange={(v) => set("fatorAtividade", v)}
                  unidade="FA"
                  placeholder="2,1"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="TMB"
            valor={d.tmb !== null ? fmtInt(d.tmb) : "—"}
            sub={`kcal/dia · ${(labelMetodo[a.metodoTMB] ?? "")}`}
          />
          <MetricCard
            label="VET"
            valor={d.vet !== null ? fmtInt(d.vet) : "—"}
            sub={`kcal/dia · FA ${d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : "—"}`}
          />
          <MetricCard
            label="Consumindo"
            valor={composicao ? fmtInt(composicao.totais.kcal) : "—"}
            sub={composicao ? "kcal · Recordatório 24 horas" : "Calcule o Recordatório 24 horas"}
          />
        </div>
        {d.tmb === null && (
          <p className="mt-4 font-mono text-[11px] text-ink-soft">
            Informe sexo, data de nascimento, peso e altura para calcular a TMB.
          </p>
        )}
      </Panel>

      <Panel titulo="Estratégia energética">
        <OptionRow

          value={a.estrategia}
          onChange={(v) => v && set("estrategia", v as typeof a.estrategia)}
          options={[
            { value: "deficit", label: "Déficit calórico" },
            { value: "normocalorica", label: "Normocalórica" },
            { value: "superavit", label: "Superávit calórico" },
          ]}
        />

        {a.estrategia !== "normocalorica" && (
          <div className="mt-5 space-y-4">
            <Field label="Forma do ajuste">
              <OptionRow
                value={a.tipoAjuste}
                onChange={(v) => v && set("tipoAjuste", v as typeof a.tipoAjuste)}
                options={[
                  { value: "percentual", label: "Percentual do VET" },
                  { value: "kcal", label: "Valor fixo em kcal" },
                ]}
              />
            </Field>

            {a.tipoAjuste === "kcal" ? (
              <>
                <Field label={a.estrategia === "deficit" ? "Déficit" : "Superávit"}>
                  <OptionRow
                    value={kcalPersonalizado ? "" : a.kcalAjuste}
                    onChange={(v) => set("kcalAjuste", v)}
                    options={kcalPresets}
                  />
                </Field>
                <div className="max-w-xs">
                  <Field label="Valor personalizado" hint="Informe o valor desejado em kcal.">
                    <UnitInput
                      value={a.kcalAjuste}
                      onChange={(v) => set("kcalAjuste", v)}
                      unidade="kcal"
                      placeholder="Ex.: 600"
                    />
                  </Field>
                </div>
              </>
            ) : (
              <>
                <Field label={a.estrategia === "deficit" ? "Déficit" : "Superávit"}>
                  <OptionRow
                    value={a.percentualAjuste}
                    onChange={(v) => set("percentualAjuste", v)}
                    options={percentuais}
                  />
                </Field>
                <div className="max-w-xs">
                  <Field label="Percentual personalizado">
                    <UnitInput
                      value={a.percentualAjuste}
                      onChange={(v) => set("percentualAjuste", v)}
                      unidade="%"
                    />
                  </Field>
                </div>
              </>
            )}
          </div>
        )}

        {a.estrategia === "normocalorica" && (
          <div className="mt-5 max-w-xs">
            <Field label="Ajuste manual das calorias" hint="Em branco mantém a prescrição igual ao VET.">
              <TextInput
                value={a.caloriasManuais}
                onChange={(v) => set("caloriasManuais", v)}
                placeholder={d.vet !== null ? fmtInt(d.vet) : "kcal/dia"}
                mono
              />
            </Field>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="VET" valor={d.vet !== null ? fmtInt(d.vet) : "—"} sub="kcal/dia" />
          <MetricCard
            label="Ajuste"
            valor={
              d.ajusteKcal !== null
                ? `${fmtInt(d.ajusteKcal)} kcal`
                : d.percentualAjuste !== null
                  ? `${d.percentualAjuste}%`
                  : "—"
            }
            sub={
              a.estrategia === "normocalorica"
                ? "normocalórica"
                : a.tipoAjuste === "kcal"
                  ? "valor fixo aplicado"
                  : "percentual aplicado"
            }
          />
          <MetricCard
            label="Prescrição"
            valor={d.caloriasSugeridas !== null ? fmtInt(d.caloriasSugeridas) : "—"}
            sub="kcal/dia sugeridas"
          />
        </div>
      </Panel>

      <Panel titulo="Cálculo do VET corrigido">
        {(() => {
          const num = (s: string) => Number(s.replace(",", "."));
          const qtd = a.refeicoesLivresSemana === "" ? NaN : num(a.refeicoesLivresSemana);
          const kcal = a.vetRefeicoesLivres === "" ? NaN : num(a.vetRefeicoesLivres);
          const corrigido = calcularVetCorrigido(d.caloriasSugeridas, qtd, kcal);
          return (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nº de ref. livres/semana">
                  <UnitInput value={a.refeicoesLivresSemana} onChange={(v) => set("refeicoesLivresSemana", v.replace(/\D/g, ""))} unidade="ref." placeholder="1" />
                </Field>
                <Field label="VET das ref. livres">
                  <UnitInput value={a.vetRefeicoesLivres} onChange={(v) => set("vetRefeicoesLivres", v)} unidade="kcal" placeholder="1600" />
                </Field>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MetricCard label="VET diário semanal (com déficit)" valor={d.caloriasSugeridas !== null ? fmtInt(d.caloriasSugeridas) : "—"} sub="kcal/dia" />
                <MetricCard label="VET corrigido (com déficit)" valor={corrigido !== null ? fmtInt(corrigido) : "—"} sub="kcal/dia" />
              </div>
            </>
          );
        })()}
      </Panel>
    </div>
  );

}
