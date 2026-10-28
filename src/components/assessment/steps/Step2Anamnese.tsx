import { novoId } from "@/lib/assessment/initial-state";
import { podeAnexarExames } from "@/lib/assessment/anthropometry-groups";
import { AGUA_MAX, AGUA_MIN, AGUA_PASSO, escalaAgua, formatarLitros, formatarLitrosAgua, lerLitrosAgua } from "@/lib/assessment/hydration";
import { Slider } from "@/components/ui/slider";
import { ExamUpload } from "../ExamUpload";

import {
  Field,
  LongText,
  MultiOptionRow,
  OptionRow,
  Panel,
  RowButton,
  Select,
  TextInput,
  DoseInput,
  UnitInput,
} from "../fields";
import type { StepProps } from "./types";

const simNao = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const objetivos = [
  { value: "Emagrecimento", label: "Emagrecimento" },
  { value: "Recomposição corporal", label: "Recomposição corporal" },
  { value: "Hipertrofia", label: "Hipertrofia", className: "order-3 sm:order-none" },
  { value: "Longevidade", label: "Longevidade", className: "order-2 sm:order-none", breakAfter: true },
];

export function Step2Anamnese({ a, set, d }: StepProps) {
  return (
    <div className="space-y-6">
      <Panel titulo="Informações gerais e Objetivo">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Já fez dieta e/ou consultou nutricionista anteriormente?">
            <OptionRow value={a.jaFezDieta} onChange={(v) => set("jaFezDieta", v as typeof a.jaFezDieta)} options={simNao} />
          </Field>
          <Field label="Qual seu principal objetivo (motivo da consulta)?" className="sm:col-start-2">
            <MultiOptionRow
              values={a.objetivos}
              onChange={(v) => {
                set("objetivos", v);
                if (!v.includes("Emagrecimento")) set("pesoDesejado", "");
              }}
              options={objetivos}
            />
          </Field>
          <Field label="O que mais lhe incomoda atualmente em seu físico?">
            <TextInput value={a.incomodoFisico} onChange={(v) => set("incomodoFisico", v)} />
          </Field>
          {a.objetivos.includes("Emagrecimento") && (
            <Field label="Peso desejado (Opcional - em caso de emagrecimento)">
              <UnitInput value={a.pesoDesejado} onChange={(v) => set("pesoDesejado", v)} unidade="kg" />
            </Field>
          )}
          <Field label="Qual sua maior dificuldade relacionada ao seu objetivo?">
            <TextInput value={a.maiorDificuldade} onChange={(v) => set("maiorDificuldade", v)} />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:col-span-2 sm:grid-cols-[auto_1fr] sm:items-start">
            <Field label="De 0 a 10, como está sua motivação?">
              <div className="w-24">
                <Select
                  value={a.motivacao}
                  placeholder=""
                  onChange={(v) => {
                    set("motivacao", v);
                    if (v === "" || v === "10") set("faltaParaDez", "");
                  }}
                  options={Array.from({ length: 11 }, (_, i) => ({ value: String(i), label: String(i) }))}
                />
              </div>
            </Field>
            {a.motivacao !== "" && Number(a.motivacao) < 10 && (
              <Field label="O que falta para chegar em 10?">
                <TextInput value={a.faltaParaDez} onChange={(v) => set("faltaParaDez", v)} />
              </Field>
            )}
          </div>
        </div>
      </Panel>

      <Panel titulo="História clínica">
        <div className="grid grid-cols-1 gap-5">
          <Field
            label="Histórico do peso"
            hint="Infância, Adolescência, Vida adulta, Gestação (opcional) e principais variações de peso."
          >
            <LongText value={a.historicoPeso} onChange={(v) => set("historicoPeso", v)} rows={4} />
          </Field>
          <h2 className="font-display text-base font-semibold tracking-tight">Condições de saúde</h2>
          <div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field label="HMA">
                <LongText value={a.hma} onChange={(v) => set("hma", v)} />
              </Field>
              <Field label="HMP">
                <LongText value={a.hmp} onChange={(v) => set("hmp", v)} />
              </Field>
              <Field label="HMF">
                <LongText value={a.hmf} onChange={(v) => set("hmf", v)} />
              </Field>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">
              DM, HAS, DRC, Dislipidemia, Obesidade, Hipotireoidismo, Hipertireoidismo, problemas cardiovasculares, Osteoporose, SOP etc.
            </p>
          </div>
        </div>
        <h2 className="mb-3 mt-7 font-display text-base font-semibold tracking-tight">Medicamentos em uso</h2>
        <div className="space-y-3">
          {a.medicamentos.map((m, i) => (
            <div key={m.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_0.8fr_1fr_auto]">
              <TextInput
                value={m.nome}
                placeholder="Medicamento"
                onChange={(v) =>
                  set(
                    "medicamentos",
                    a.medicamentos.map((x, j) => (j === i ? { ...x, nome: v } : x)),
                  )
                }
              />
              <DoseInput
                value={m.dose}
                onChange={(v) =>
                  set(
                    "medicamentos",
                    a.medicamentos.map((x, j) => (j === i ? { ...x, dose: v } : x)),
                  )
                }
              />
              <TextInput
                value={m.acao}
                placeholder="Ação"
                onChange={(v) =>
                  set(
                    "medicamentos",
                    a.medicamentos.map((x, j) => (j === i ? { ...x, acao: v } : x)),
                  )
                }
              />
              <RowButton onClick={() => set("medicamentos", a.medicamentos.filter((_, j) => j !== i))}>
                Remover
              </RowButton>
            </div>
          ))}
          <RowButton
            onClick={() =>
              set("medicamentos", [...a.medicamentos, { id: novoId(), nome: "", dose: "", acao: "" }])
            }
          >
            + Adicionar medicamento(s)
          </RowButton>
        </div>
      </Panel>

      <Panel titulo="Exames bioquímicos, Alergias e Hábitos">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Possui exames bioquímicos recentes?">
            <div className="flex flex-wrap items-center gap-3">
              <OptionRow value={a.possuiExames} onChange={(v) => set("possuiExames", v as typeof a.possuiExames)} options={simNao} />
              {podeAnexarExames(a) && <ExamUpload a={a} set={set} />}
            </div>
          </Field>
          <Field label="Possui plano de saúde?">
            <OptionRow value={a.planoSaude} onChange={(v) => set("planoSaude", v as typeof a.planoSaude)} options={simNao} />
          </Field>
          <Field label="Alergia e/ou intolerância alimentar?">
            <div className="flex flex-wrap items-center gap-3">
              <OptionRow value={a.alergia} onChange={(v) => set("alergia", v as typeof a.alergia)} options={simNao} />
              {a.alergia === "sim" && (
                <div className="w-[280px]">
                  <TextInput
                    value={a.alergiaDescricao}
                    onChange={(v) => set("alergiaDescricao", v)}
                    placeholder="Qual(is)?"
                  />
                </div>
              )}
            </div>
          </Field>
          <Field label="Possui alguma restrição alimentar?" className="sm:col-start-2">
            <OptionRow
              value={a.restricaoAlimentar}
              onChange={(v) => set("restricaoAlimentar", v as typeof a.restricaoAlimentar)}
              options={[
                { value: "nao", label: "Não" },
                { value: "vegetariano", label: "Vegetariano" },
                { value: "vegano", label: "Vegano" },
              ]}
            />
          </Field>
          <Field label="Usa ou já usou EAAs?" className="sm:col-start-1">
            <OptionRow value={a.eaas} onChange={(v) => set("eaas", v as typeof a.eaas)} options={simNao} />
          </Field>
          <Field label="Hábitos sociais" className="sm:col-start-2">
            <MultiOptionRow
              values={a.habitosSociais}
              onChange={(v) => {
                const adicionouNenhum = v.includes("Nenhum") && !a.habitosSociais.includes("Nenhum");
                set("habitosSociais", adicionouNenhum ? ["Nenhum"] : v.filter((item) => item !== "Nenhum"));
              }}
              options={[
                { value: "Nenhum", label: "Nenhum" },
                { value: "Etilista", label: "Etilista" },
                { value: "Tabagista", label: "Tabagista" },
                { value: "Drogas", label: "Drogas" },
              ]}
            />
          </Field>
          {a.eaas === "sim" && (
            <Field label="Hormônio(s), dose e frequência de uso" className="sm:col-span-2">
              <TextInput value={a.eaasDescricao} onChange={(v) => set("eaasDescricao", v)} />
            </Field>
          )}
          {a.habitosSociais.includes("Etilista") && (
            <>
              <Field label="Álcool - Quantidade">
                <TextInput value={a.etilismoQuantidade} onChange={(v) => set("etilismoQuantidade", v)} />
              </Field>
              <Field label="Álcool - Frequência">
                <TextInput value={a.etilismoFrequencia} onChange={(v) => set("etilismoFrequencia", v)} />
              </Field>
            </>
          )}
          {a.habitosSociais.includes("Tabagista") && (
            <>
              <Field label="Tabaco - Quantidade">
                <TextInput value={a.tabagismoQuantidade} onChange={(v) => set("tabagismoQuantidade", v)} />
              </Field>
              <Field label="Tabaco - Frequência">
                <TextInput value={a.tabagismoFrequencia} onChange={(v) => set("tabagismoFrequencia", v)} />
              </Field>
            </>
          )}
          {a.habitosSociais.includes("Drogas") && (
            <Field label="Drogas - Qual(is)?">
              <TextInput value={a.drogasDescricao} onChange={(v) => set("drogasDescricao", v)} />
            </Field>
          )}
        </div>
      </Panel>

      <Panel titulo="Revisão de Sistemas e Sono">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Função estomacal/intestinal" className="sm:col-span-2">
            <MultiOptionRow
              values={a.funcaoEstomacal}
              onChange={(v) => {
                const adicionouNormal = v.includes("Normal") && !a.funcaoEstomacal.includes("Normal");
                set("funcaoEstomacal", adicionouNormal ? ["Normal"] : v.filter((item) => item !== "Normal"));
              }}
              options={[
                { value: "Normal", label: "Normal" },
                { value: "Azia", label: "Azia" },
                { value: "Eructação excessiva", label: "Eructação excessiva" },
                { value: "Flatulência excessiva", label: "Flatulência excessiva" },
              ]}
            />
          </Field>
          <Field label="Frequência de evacuação">
            <Select
              value={a.frequenciaEvacuacao}
              onChange={(v) => set("frequenciaEvacuacao", v)}
              options={[
                "1 vez por dia",
                "1 a 2 vezes por dia",
                "2 vezes por dia",
                "3 vezes por dia",
                "1 vez por semana",
                "2 vezes por semana",
                "3 vezes por semana",
                "4 vezes por semana",
                "5 vezes por semana",
                "6 vezes por semana",
                "Dia sim, dia não",
              ].map((opcao) => ({ value: opcao, label: opcao }))}
            />
          </Field>
          <Field label="Escala de Bristol">
            <Select
              value={a.bristol}
              onChange={(v) => set("bristol", v)}
              options={[
                { value: "B1", label: "B1 - Caroços duros" },
                { value: "B2", label: "B2 - Salsicha granulosa" },
                { value: "B3", label: "B3 - Salsicha com fissuras" },
                { value: "B4", label: "B4 - Salsicha lisa" },
                { value: "B5", label: "B5 - Bolas macias" },
                { value: "B6", label: "B6 - Pedaços pastosos" },
                { value: "B7", label: "B7 - Líquida" },
              ]}
            />
          </Field>
          <Field label="Consumo diário de água">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <Slider
                  value={[lerLitrosAgua(a.consumoAgua)]}
                  min={AGUA_MIN}
                  max={AGUA_MAX}
                  step={AGUA_PASSO}
                  aria-label="Consumo diário de água"
                  onValueChange={([v]) => set("consumoAgua", formatarLitrosAgua(v ?? 0))}
                  className="w-full"
                />
                <div className="relative mt-2 h-6">
                  {escalaAgua.map((litros) => {
                    // Compensa o raio do poleiro (16px): nos extremos a bolinha não encosta nas pontas.
                    const pct = (litros / AGUA_MAX) * 100;
                    return (
                      <button
                        key={litros}
                        type="button"
                        aria-label={`Selecionar ${formatarLitros(litros)} L/dia`}
                        onClick={() => set("consumoAgua", formatarLitrosAgua(litros))}
                        className="absolute top-0 flex -translate-x-1/2 cursor-pointer flex-col items-center rounded-sm outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                        style={{ left: `calc(${pct}% + ${8 - pct * 0.16}px)` }}
                      >
                        <span className="h-1.5 w-px bg-line" />
                        <span className="mt-1 font-mono text-[10px] leading-none text-ink-soft">
                          {formatarLitros(litros)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <span className="min-w-[5.5rem] text-right font-mono text-2xl font-medium tracking-tight tabular-nums text-accent">
                {formatarLitros(lerLitrosAgua(a.consumoAgua))}
                <span className="ml-1.5 align-baseline text-[11px] font-medium text-ink-soft">L/dia</span>
              </span>
            </div>
          </Field>
          <Field label="Escala de Armstrong">
            <Select
              value={a.armstrong}
              onChange={(v) => set("armstrong", v)}
              options={[
                { value: "A1", label: "A1 - Normal" },
                { value: "A2", label: "A2 - Normal" },
                { value: "A3", label: "A3 - Normal" },
                { value: "A4", label: "A4 - Má hidratação" },
                { value: "A5", label: "A5 - Má hidratação" },
                { value: "A6", label: "A6 - Má hidratação" },
                { value: "A7", label: "A7 - Desidratação severa" },
                { value: "A8", label: "A8 - Desidratação severa" },
              ]}
            />
          </Field>
        </div>

        <h2 className="mb-3 mt-7 font-display text-base font-semibold tracking-tight">Sono</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Horário que dorme">
            <TextInput type="time" value={a.horaDormir} onChange={(v) => set("horaDormir", v)} />
          </Field>
          <Field label="Horário que acorda">
            <TextInput type="time" value={a.horaAcordar} onChange={(v) => set("horaAcordar", v)} />
          </Field>
          <Field label="Qualidade do sono">
            <OptionRow
              value={a.qualidadeSono}
              onChange={(v) => set("qualidadeSono", v)}
              options={[
                { value: "Ruim", label: "Ruim" },
                { value: "Moderada", label: "Moderada" },
                { value: "Boa", label: "Boa" },
              ]}
            />
          </Field>
        </div>
        {d.sono && (
          <p className="mt-4 rounded-[10px] bg-accent-soft/70 px-4 py-3 font-mono text-[12px] text-accent ring-1 ring-accent/15">
            Você dorme aproximadamente {d.sono.horas} horas e {d.sono.restoMinutos} minutos.
          </p>
        )}
      </Panel>
    </div>
  );
}
