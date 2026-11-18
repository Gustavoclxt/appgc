import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { novoId } from "@/lib/assessment/initial-state";

import {
  Field,
  MultiOptionRow,
  OptionRow,
  Panel,
  RowButton,
  Select,
  SubTitle,
  TextInput,
  UnitInput,
} from "../fields";
import type { StepProps } from "./types";
import { FoodPreferencesSelect } from "../FoodPreferencesSelect";
import {
  cafeCha,
  carboidratos,
  cereais,
  doces,
  frutas,
  gorduras,
  lacteos,
  leguminosas,
  proteinas,
  vegetais,
} from "@/lib/assessment/food-preferences";
import { agruparItensPorRefeicao, chaveDiario, composicaoParaRelatorio, type ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { opcoesDeLocal } from "@/lib/assessment/food-diary";
import { DIAS_SEMANA, selecionarDias } from "@/lib/assessment/training-days";
import { Slider } from "@/components/ui/slider";

/** Botões redondos de dias exibem apenas a inicial: S T Q Q S S D. */
const LETRA_DIA: Record<string, string> = {
  Segunda: "S",
  Terça: "T",
  Quarta: "Q",
  Quinta: "Q",
  Sexta: "S",
  Sábado: "S",
  Domingo: "D",
};
const CLASSE_BOTAO_DIA = "h-8 w-8 rounded-full px-0 py-0";
import { AtypicalDay } from "../AtypicalDay";
import type { Refeicao } from "@/lib/assessment/types";

interface Props extends StepProps {
  composicao: ComposicaoDiario | null;
  calculando: boolean;
  onCalcular: () => void;
  diaAtipico: Refeicao[] | null;
  onAdicionarDiaAtipico: () => void;
  onRemoverDiaAtipico: () => void;
  onAlterarDiaAtipico: (refeicoes: Refeicao[]) => void;
  onCopiarR24h: () => void;
  composicaoAtipica: ComposicaoDiario | null;
  calculandoAtipico: boolean;
  onCalcularAtipico: () => void;
}

const simNao = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const MODALIDADES = [
  "Futebol", "Futsal", "Vôlei", "Vôlei de praia", "Basquete", "Handebol", "Futevôlei", "Beach tennis",
  "Rugby", "Caminhada", "Caminhada em esteira", "Escada", "Elíptico", "Corrida de rua", "Corrida em esteira",
  "Corrida em trilha", "Corrida de montanha", "Marcha atlética", "Musculação", "Treinamento funcional",
  "CrossFit", "Hyrox", "Pilates", "Ginástica aeróbica", "Spinning", "Ciclismo indoor", "Calistenia", "HIIT",
  "Levantamento de peso", "Ciclismo", "Patinação", "Skate", "Natação", "Hidroginástica", "Surf",
  "Canoagem", "Caiaque", "Remo", "Mergulho", "Windsurf", "Kitesurf", "Wakeboard", "Esqui aquático",
  "Polo aquático", "Tênis", "Padel", "Badminton", "Tênis de mesa", "Squash", "Golfe", "Boliche",
  "Bocha", "Jiu-jitsu", "Judô", "Karatê", "Taekwondo", "Boxe", "Muay thai", "Capoeira", "Kickboxing",
  "MMA", "Aikido", "Kung fu", "Krav maga", "Wrestling", "Dança de salão", "Zumba", "Ballet", "Jazz",
  "Dança", "Dança do ventre", "FitDance", "Pole dance", "Yoga", "Alongamento", "Tai chi chuan",
  "Ginástica artística", "Ginástica rítmica", "Slackline", "Parkour", "Trekking", "Montanhismo",
  "Escalada", "Rapel", "Hipismo", "Tiro com arco", "Tênis de praia",
];


export function Step3Rotina({ a, set, d, composicao, calculando, onCalcular, diaAtipico, onAdicionarDiaAtipico, onRemoverDiaAtipico, onAlterarDiaAtipico, onCopiarR24h, composicaoAtipica, calculandoAtipico, onCalcularAtipico }: Props) {
  const comp = composicaoParaRelatorio(composicao);
  const [progressoCalculo, setProgressoCalculo] = useState(0);
  useEffect(() => {
    if (!calculando) {
      setProgressoCalculo(0);
      return;
    }
    const timer = setInterval(
      () => setProgressoCalculo((p) => (p < 95 ? p + Math.max(1, Math.round((95 - p) / 12)) : p)),
      400,
    );
    return () => clearInterval(timer);
  }, [calculando]);
  const desatualizada = composicao !== null && composicao.chave !== chaveDiario(a.diarioAlimentar);
  const [focoId, setFocoId] = useState<string | null>(null);
  const alimentoRefs = useRef(new Map<string, HTMLInputElement>());
  useLayoutEffect(() => {
    if (!focoId) return;
    const el = alimentoRefs.current.get(focoId);
    if (el) {
      el.focus();
      setFocoId(null);
    }
  }, [focoId, a.diarioAlimentar]);
  const adicionarAlimento = (refeicaoIdx: number) => {
    const novo = { id: novoId(), alimento: "", quantidade: "" };
    set(
      "diarioAlimentar",
      a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
        refeicaoIndex === refeicaoIdx ? { ...refeicao, alimentos: [...refeicao.alimentos, novo] } : refeicao,
      ),
    );
    return novo.id;
  };
  const renderR24h = () => (
            <>
              {desatualizada && (
                <p className="mt-2 text-[12px] text-white/70">O diário foi alterado. Recalcule para atualizar.</p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {comp!.totais.map((t) => (
                  <div key={t.label}>
                    <p className="text-[11px] text-white/60">{t.label}</p>
                    <p className={`mt-1 font-mono text-sm tabular-nums ${t.label === "Calorias totais" ? "font-bold" : ""}`}>{t.valor}</p>
                  </div>
                ))}
              </div>
              {(() => {
                const grupos = agruparItensPorRefeicao(composicao?.itens ?? [], a.diarioAlimentar);
                const fmt1 = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
                return grupos.map((g, n) => (
                  <div key={n} className="mt-3 border-t border-white/20 pt-3 first:mt-0 first:border-t-0 first:pt-0">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
                      {g.horario ? `${g.horario} - ` : ""}
                      {g.nome}
                      {" • "}
                      {Math.round(g.kcal).toLocaleString("pt-BR")} kcal
                    </p>
                    <ul className="mt-1.5 space-y-1.5">
                      {g.itens.map((i, m) => (
                        <li key={m} className="text-[12px] leading-snug">
                          <span className="text-white">
                            {[i.alimento, i.quantidade].filter(Boolean).join(" — ")}
                          </span>
                          <span className="block font-mono text-[11px] text-white/60">
                            {`${Math.round(i.kcal)} kcal · CHO ${fmt1(i.carboidratos)} g · PTN ${fmt1(i.proteinas)} g · LIP ${fmt1(i.lipidios)} g`}
                            {i.fonte ? ` · ${i.fonte}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ));
              })()}
            </>
  );
  return (
    <div className="space-y-6">
      <Panel titulo="Rotina de trabalho/faculdade">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-end gap-1">
              <Field label="Entrada" className="w-[120px]">
                <TextInput type="time" value={a.entradaTrabalho} onChange={(v) => set("entradaTrabalho", v)} />
              </Field>
              <Field label="Saída" className="w-[120px]">
                <TextInput type="time" value={a.saidaTrabalho} onChange={(v) => set("saidaTrabalho", v)} />
              </Field>
              {d.jornada && (
                <span className="pb-2 text-[13px] font-medium text-ink">
                  Tempo de trabalho: {d.jornada.horas}h{d.jornada.restoMinutos > 0 ? ` e ${d.jornada.restoMinutos}min` : ""}
                </span>
              )}
            </div>
            <Field label="Possui cozinha/copa no trabalho?">
              <OptionRow
                value={a.cozinhaTrabalho}
                onChange={(v) => set("cozinhaTrabalho", v as typeof a.cozinhaTrabalho)}
                options={simNao}
              />
            </Field>
          </div>
          <div>
            <Field label="Intervalo para refeições?">
              <div className="flex flex-wrap items-center gap-2">
                <OptionRow
                  value={a.intervaloRefeicoes}
                  onChange={(v) => {
                    set("intervaloRefeicoes", v as typeof a.intervaloRefeicoes);
                    if (v !== "sim") set("intervaloRefeicoesHorarios", "");
                  }}
                  options={simNao}
                />
                {a.intervaloRefeicoes === "sim" && (
                  <div className="w-[130px]">
                    <TextInput
                      value={a.intervaloRefeicoesHorarios}
                      onChange={(v) => set("intervaloRefeicoesHorarios", v)}
                      placeholder="Horário(s)"
                    />
                  </div>
                )}
              </div>
            </Field>
            <Field label="Pratica atividade física?" className="mt-5">
              <OptionRow
                value={a.praticaAtividadeFisica}
                onChange={(v) => set("praticaAtividadeFisica", v as typeof a.praticaAtividadeFisica)}
                options={simNao}
              />
            </Field>
          </div>
        </div>
        {a.praticaAtividadeFisica === "sim" && (
        <>
        <h2 className="mb-3 mt-7 font-display text-base font-semibold tracking-tight">Rotina de treinamento/atividades físicas</h2>
        <div className="space-y-4">
          {a.modalidades.map((m, i) => (
            <div key={m.id} className="rounded-[10px] bg-white/70 p-4 ring-1 ring-line">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Modalidade">
                  <Select
                    value={m.modalidade}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, modalidade: v } : x)))
                    }
                    options={MODALIDADES.map((nome) => ({ value: nome, label: nome }))}
                    placeholder="Selecione a modalidade"
                  />
                </Field>
                <Field label="Há quanto tempo pratica?">
                  <TextInput
                    value={m.tempoPratica}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, tempoPratica: v } : x)))
                    }
                  />
                </Field>
                <Field label="Horário">
                  <div className="w-[110px]">
                    <TextInput
                      type="time"
                      value={m.horario}
                      onChange={(v) =>
                        set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, horario: v } : x)))
                      }
                    />
                  </div>
                </Field>
                <Field label="Duração">
                  <div className="w-[130px]">
                    <TextInput
                      value={m.duracao}
                      placeholder="60 minutos"
                      onChange={(v) =>
                        set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, duracao: v } : x)))
                      }
                    />
                  </div>
                </Field>
                <Field label="Frequência semanal">
                  <div className="w-[140px]">
                    <Select
                      value={m.frequenciaSemanal}
                      onChange={(v) =>
                        set(
                          "modalidades",
                          a.modalidades.map((x, j) => (j === i ? { ...x, frequenciaSemanal: v } : x)),
                        )
                      }
                      options={Array.from({ length: 7 }, (_, index) => ({
                        value: `${index + 1} ${index === 0 ? "vez" : "vezes"}`,
                        label: `${index + 1} ${index === 0 ? "vez" : "vezes"}`,
                      }))}
                    />
                  </div>
                </Field>
                <Field label="Dias da semana">
                  <MultiOptionRow
                    values={
                      m.diasSemana === "Todos"
                        ? ["Todos"]
                        : DIAS_SEMANA.filter((d) => m.diasSemana.split(", ").includes(d))
                    }
                    onChange={(vals) => {
                      set(
                        "modalidades",
                        a.modalidades.map((x, j) =>
                          j === i ? { ...x, diasSemana: selecionarDias(m.diasSemana, vals, "Todos") } : x,
                        ),
                      );
                    }}
                    options={[
                      ...DIAS_SEMANA.map((d) => ({ value: d, label: LETRA_DIA[d] ?? d, className: CLASSE_BOTAO_DIA })),
                      { value: "Todos", label: "Todos" },
                    ]}
                  />
                </Field>
                <Field label="Dias de descanso">
                  <MultiOptionRow
                    values={
                      m.diasDescanso === "Nenhum"
                        ? ["Nenhum"]
                        : DIAS_SEMANA.filter((d) => m.diasDescanso.split(", ").includes(d))
                    }
                    onChange={(vals) => {
                      set(
                        "modalidades",
                        a.modalidades.map((x, j) =>
                          j === i ? { ...x, diasDescanso: selecionarDias(m.diasDescanso, vals, "Nenhum") } : x,
                        ),
                      );
                    }}
                    options={[
                      ...DIAS_SEMANA.map((d) => ({ value: d, label: LETRA_DIA[d] ?? d, className: CLASSE_BOTAO_DIA })),
                      { value: "Nenhum", label: "Nenhum" },
                    ]}
                  />
                </Field>
                <Field label="Nota">
                  <div>
                    <Slider
                      value={[Number.isFinite(Number(m.nota)) && m.nota !== "" ? Number(m.nota) : 0]}
                      min={0}
                      max={10}
                      step={1}
                      aria-label="Nota de 0 a 10"
                      onValueChange={([v]) =>
                        set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, nota: String(v ?? 0) } : x)))
                      }
                      className="w-full"
                    />
                    <div className="relative mt-2 h-5">
                      {Array.from({ length: 11 }, (_, n) => {
                        // Compensa o raio do poleiro (16px): nos extremos a bolinha não encosta nas pontas.
                        const pct = (n / 10) * 100;
                        return (
                          <button
                            key={n}
                            type="button"
                            aria-label={`Selecionar nota ${n}`}
                            onClick={() =>
                              set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, nota: String(n) } : x)))
                            }
                            className="absolute top-0 -translate-x-1/2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            style={{ left: `calc(${pct}% + ${8 - pct * 0.16}px)` }}
                          >
                            <span className={`font-mono leading-none ${m.nota === String(n) ? "text-[13px] font-semibold text-accent" : "text-[10px] text-ink-soft"}`}>{n}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Field>
                <Field label="Justificativa">
                  <TextInput
                    value={m.justificativa}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, justificativa: v } : x)))
                    }
                  />
                </Field>
              </div>
              <div className="mt-3">
                <RowButton onClick={() => set("modalidades", a.modalidades.filter((_, j) => j !== i))}>
                  Remover modalidade
                </RowButton>
              </div>
            </div>
          ))}
          <RowButton
            onClick={() =>
              set("modalidades", [
                ...a.modalidades,
                {
                  id: novoId(),
                  modalidade: "",
                  tempoPratica: "",
                  horario: "",
                  duracao: "",
                  frequenciaSemanal: "",
                  diasSemana: "",
                  diasDescanso: "",
                  nota: "",
                  justificativa: "",
                },
              ])
            }
          >
            + Adicionar modalidade(s)
          </RowButton>
        </div>
        </>
        )}
      </Panel>

      <Panel titulo="Hábitos alimentares">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Em casa, quem prepara os alimentos?">
            <div className="flex flex-wrap items-center gap-2">
              <OptionRow
                circular
                value={a.quemPrepara}
                onChange={(v) => set("quemPrepara", v as typeof a.quemPrepara)}
                options={[
                  { value: "propria", label: "Própria pessoa" },
                  { value: "outra", label: "Outra pessoa" },
                ]}
              />
              {a.quemPrepara === "outra" && (
                <div className="w-[110px]">
                  <TextInput value={a.quemPreparaOutra} onChange={(v) => set("quemPreparaOutra", v)} placeholder="Quem?" />
                </div>
              )}
            </div>
          </Field>
          <Field label="Come fora?">
            <div className="flex flex-wrap items-center gap-2">
              <OptionRow value={a.comeFora} onChange={(v) => set("comeFora", v as typeof a.comeFora)} options={simNao} />
              {a.comeFora === "sim" && (
                <>
                  <div className="w-[110px]">
                    <TextInput value={a.comeForaFrequencia} onChange={(v) => set("comeForaFrequencia", v)} placeholder="Frequência" />
                  </div>
                  <div className="flex-1 min-w-[90px]">
                    <TextInput value={a.comeForaDias} onChange={(v) => set("comeForaDias", v)} placeholder="Dias" />
                  </div>
                </>
              )}
            </div>
          </Field>
          <Field label="Costuma consumir alimentos fritos?">
            <div className="flex flex-wrap items-center gap-2">
              <OptionRow
                value={a.consomeFritos}
                onChange={(v) => {
                  set("consomeFritos", v as typeof a.consomeFritos);
                  if (v !== "sim") set("fritosFrequencia", "");
                }}
                options={[
                  { value: "sim", label: "Sim" },
                  { value: "nao", label: "Não" },
                ]}
              />
              {a.consomeFritos === "sim" && (
                <div className="w-[170px]">
                  <Select
                    aria-label="Com qual frequência"
                    placeholder="Frequência"
                    value={a.fritosFrequencia}
                    onChange={(v) => set("fritosFrequencia", v)}
                    options={[
                      "Raramente (menos de 1x/sem.)",
                      "1-2x/semana",
                      "3-4x/semana",
                      "5 ou mais vezes/sem.",
                      "Diariamente",
                    ].map((o) => ({ value: o, label: o }))}
                  />
                </div>
              )}
            </div>
          </Field>
          <Field label="Em quais horários sente mais fome ou vontade de comer?">
            <MultiOptionRow
              circular
              values={a.horariosFome}
              onChange={(v) => set("horariosFome", v)}
              options={[
                "Manhã",
                "Tarde",
                "Noite",
                "Madrugada",
              ].map((x) => ({ value: x, label: x }))}
            />
          </Field>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5">
          <Field label="Observações sobre fome/apetite">
            <TextInput value={a.observacoesFome} onChange={(v) => set("observacoesFome", v)} />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-start">
            <Field label="Hábito de beliscar ao longo do dia?">
              <OptionRow
                value={a.habitoBeliscar}
                onChange={(v) => {
                  set("habitoBeliscar", v as typeof a.habitoBeliscar);
                  if (v !== "sim") set("beliscarDescricao", "");
                }}
                options={simNao}
              />
            </Field>
            {a.habitoBeliscar === "sim" && (
              <Field label="O que?">
                <TextInput value={a.beliscarDescricao} onChange={(v) => set("beliscarDescricao", v)} />
              </Field>
            )}
          </div>
        </div>
      </Panel>

      <Panel titulo="Suplementação">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Utiliza algum suplemento?">
            <OptionRow
              value={a.usaSuplemento}
              onChange={(v) => set("usaSuplemento", v as typeof a.usaSuplemento)}
              options={simNao}
            />
            <div className="mt-2">
              <TextInput value={a.observacaoSuplemento} placeholder="Observação" onChange={(v) => set("observacaoSuplemento", v)} />
            </div>
          </Field>
          <Field label="Aceita utilizar Whey Protein?">
            <OptionRow
              value={a.aceitaWhey}
              onChange={(v) => set("aceitaWhey", v as typeof a.aceitaWhey)}
              options={simNao}
            />
          </Field>
        </div>
        {a.usaSuplemento === "sim" && (
          <div className="mt-5 space-y-3">
            {a.suplementos.map((s, i) => (
              <div key={s.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                <TextInput
                  value={s.nome}
                  placeholder="Suplemento"
                  onChange={(v) =>
                    set("suplementos", a.suplementos.map((x, j) => (j === i ? { ...x, nome: v } : x)))
                  }
                />
                <TextInput
                  value={s.dose}
                  placeholder="Dose"
                  onChange={(v) =>
                    set("suplementos", a.suplementos.map((x, j) => (j === i ? { ...x, dose: v } : x)))
                  }
                />
                <TextInput
                  value={s.horario}
                  placeholder="Horário"
                  onChange={(v) =>
                    set("suplementos", a.suplementos.map((x, j) => (j === i ? { ...x, horario: v } : x)))
                  }
                />
                <TextInput
                  value={s.frequencia}
                  placeholder="Frequência"
                  onChange={(v) =>
                    set("suplementos", a.suplementos.map((x, j) => (j === i ? { ...x, frequencia: v } : x)))
                  }
                />
                <div className="sm:col-span-4">
                  <TextInput
                    value={s.observacoes}
                    placeholder="Observações"
                    onChange={(v) =>
                      set("suplementos", a.suplementos.map((x, j) => (j === i ? { ...x, observacoes: v } : x)))
                    }
                  />
                </div>
                <RowButton onClick={() => set("suplementos", a.suplementos.filter((_, j) => j !== i))}>
                  Remover
                </RowButton>
              </div>
            ))}
            <RowButton
              onClick={() =>
                set("suplementos", [
                  ...a.suplementos,
                  { id: novoId(), nome: "", dose: "", horario: "", frequencia: "", observacoes: "" },
                ])
              }
            >
              + Adicionar suplemento
            </RowButton>
          </div>
        )}
      </Panel>

      <Panel titulo="Preferências e aversões alimentares">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Carboidratos">
            <FoodPreferencesSelect
              label="Carboidratos"
              values={a.prefCarboidratos}
              options={carboidratos}
              onChange={(v) => set("prefCarboidratos", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["carboidratos"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "carboidratos": v })}
              />
            </div>
          </Field>

          <Field label="Proteínas">
            <FoodPreferencesSelect
              label="Proteínas"
              values={a.prefProteinas}
              options={proteinas}
              onChange={(v) => set("prefProteinas", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["proteinas"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "proteinas": v })}
              />
            </div>
          </Field>

          <Field label="Gorduras">
            <FoodPreferencesSelect
              label="Gorduras"
              values={a.prefGorduras}
              options={gorduras}
              onChange={(v) => set("prefGorduras", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["gorduras"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "gorduras": v })}
              />
            </div>
          </Field>

          <Field label="Vegetais/Saladas">
            <FoodPreferencesSelect
              label="Vegetais/Saladas"
              values={a.prefVegetais}
              options={vegetais}
              onChange={(v) => set("prefVegetais", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["vegetais"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "vegetais": v })}
              />
            </div>
          </Field>
          <Field label="Frutas">
            <FoodPreferencesSelect
              label="Frutas"
              values={a.prefFrutas}
              options={frutas}
              onChange={(v) => set("prefFrutas", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["frutas"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "frutas": v })}
              />
            </div>
          </Field>
          <Field label="Leguminosas">
            <FoodPreferencesSelect
              label="Leguminosas"
              values={a.prefLeguminosas}
              options={leguminosas}
              onChange={(v) => set("prefLeguminosas", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["leguminosas"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "leguminosas": v })}
              />
            </div>
          </Field>
          <Field label="Cereais e Grãos">
            <FoodPreferencesSelect
              label="Cereais e Grãos"
              values={a.prefCereais}
              options={cereais}
              onChange={(v) => set("prefCereais", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["cereais"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "cereais": v })}
              />
            </div>
          </Field>
          <Field label="Laticínios">
            <FoodPreferencesSelect
              label="Laticínios"
              values={a.prefLacteos}
              options={lacteos}
              onChange={(v) => set("prefLacteos", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["lacteos"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "lacteos": v })}
              />
            </div>
          </Field>

          <Field label="Doces">
            <FoodPreferencesSelect
              label="Doces"
              values={a.prefDoces}
              options={doces}
              onChange={(v) => set("prefDoces", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["doces"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "doces": v })}
              />
            </div>
          </Field>
          <Field label="Bebidas">
            <FoodPreferencesSelect
              label="Bebidas"
              values={a.prefCafeCha}
              options={cafeCha}
              onChange={(v) => set("prefCafeCha", v)}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["cafeCha"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "cafeCha": v })}
              />
            </div>
          </Field>

          <Field label="Utiliza açúcar ou adoçante?">
            <OptionRow
              circular
              value={a.acucarAdocante}
              onChange={(v) => set("acucarAdocante", v)}
              options={[
                { value: "Açúcar", label: "Açúcar" },
                { value: "Adoçante", label: "Adoçante" },
                { value: "Não adoça", label: "Não adoça" },
              ]}
            />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["acucar"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "acucar": v })}
              />
            </div>
          </Field>

          <Field label="Aversões alimentares">
            <TextInput value={a.aversoes} onChange={(v) => set("aversoes", v)} />
          </Field>
        </div>
      </Panel>

      <Panel titulo="Recordatório 24 horas">
        <div className="space-y-4">
          {a.diarioAlimentar.map((r, i) => (
            <div key={r.id} className="rounded-[10px] bg-white/50 p-4 ring-1 ring-line">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
                <TextInput
                  value={r.refeicao}
                  placeholder="Refeição"
                  onChange={(v) =>
                    set("diarioAlimentar", a.diarioAlimentar.map((x, j) => (j === i ? { ...x, refeicao: v } : x)))
                  }
                />
                <TextInput
                  type="time"
                  value={r.horario}
                  onChange={(v) =>
                    set("diarioAlimentar", a.diarioAlimentar.map((x, j) => (j === i ? { ...x, horario: v } : x)))
                  }
                />
                <Select
                  value={r.local}
                  placeholder="Local"
                  options={opcoesDeLocal(r.local)}
                  onChange={(v) =>
                    set("diarioAlimentar", a.diarioAlimentar.map((x, j) => (j === i ? { ...x, local: v } : x)))
                  }
                />
                <RowButton className="bg-paper hover:bg-line/60" onClick={() => set("diarioAlimentar", a.diarioAlimentar.filter((_, j) => j !== i))}>
                  Remover refeição
                </RowButton>
              </div>

              {r.refeicao.trim().toLocaleLowerCase("pt-BR") === "jantar" && (
                <div className="mt-3 flex justify-end">
                  <RowButton
                    className="inline-flex h-10 w-[134px] items-center justify-center bg-accent text-white ring-accent/40 hover:bg-accent/90"
                    onClick={() => {
                      const almoco = a.diarioAlimentar.find(
                        (refeicao) => refeicao.refeicao.trim().toLocaleLowerCase("pt-BR") === "almoço",
                      );
                      if (!almoco) return;
                      set(
                        "diarioAlimentar",
                        a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
                          refeicaoIndex === i
                            ? {
                                ...refeicao,
                                alimentos: almoco.alimentos.map((item) => ({ ...item, id: novoId() })),
                              }
                            : refeicao,
                        ),
                      );
                    }}
                  >
                    Copiar Almoço
                  </RowButton>
                </div>
              )}

              {r.refeicao.trim().toLocaleLowerCase("pt-BR") === "lanche da tarde" && (
                <div className="mt-3 flex justify-end">
                  <RowButton
                    className="inline-flex h-10 w-[134px] items-center justify-center bg-accent text-white ring-accent/40 hover:bg-accent/90"
                    onClick={() => {
                      const desjejum = a.diarioAlimentar.find(
                        (refeicao) => refeicao.refeicao.trim().toLocaleLowerCase("pt-BR") === "desjejum",
                      );
                      if (!desjejum) return;
                      set(
                        "diarioAlimentar",
                        a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
                          refeicaoIndex === i
                            ? {
                                ...refeicao,
                                alimentos: desjejum.alimentos.map((item) => ({ ...item, id: novoId() })),
                              }
                            : refeicao,
                        ),
                      );
                    }}
                  >
                    Copiar Desjejum
                  </RowButton>
                </div>
              )}

              <div className="mt-4 space-y-2 border-t border-line/70 pt-4">
                {r.alimentos.map((item, itemIndex) => (
                  <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <TextInput
                      value={item.alimento}
                      placeholder="Alimento"
                      dataAlimentoId={item.id}
                      inputRef={(el) => {
                        if (el) alimentoRefs.current.set(item.id, el);
                        else alimentoRefs.current.delete(item.id);
                      }}
                      onChange={(v) =>
                        set(
                          "diarioAlimentar",
                          a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
                            refeicaoIndex === i
                              ? {
                                  ...refeicao,
                                  alimentos: refeicao.alimentos.map((alimento, alimentoIndex) =>
                                    alimentoIndex === itemIndex ? { ...alimento, alimento: v } : alimento,
                                  ),
                                }
                              : refeicao,
                          ),
                        )
                      }
                    />
                    <TextInput
                      value={item.quantidade}
                      placeholder="Quantidade"
                      onKeyDown={(e) => {
                        if (e.key === "Tab" && !e.shiftKey && itemIndex === r.alimentos.length - 1) {
                          e.preventDefault();
                          setFocoId(adicionarAlimento(i));
                        }
                      }}
                      onChange={(v) =>
                        set(
                          "diarioAlimentar",
                          a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
                            refeicaoIndex === i
                              ? {
                                  ...refeicao,
                                  alimentos: refeicao.alimentos.map((alimento, alimentoIndex) =>
                                    alimentoIndex === itemIndex ? { ...alimento, quantidade: v } : alimento,
                                  ),
                                }
                              : refeicao,
                          ),
                        )
                      }
                    />
                    <RowButton className="bg-paper hover:bg-line/60"
                      onClick={() =>
                        set(
                          "diarioAlimentar",
                          a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
                            refeicaoIndex === i
                              ? { ...refeicao, alimentos: refeicao.alimentos.filter((_, j) => j !== itemIndex) }
                              : refeicao,
                          ),
                        )
                      }
                    >
                      Remover alimento
                    </RowButton>
                  </div>
                ))}
                <RowButton className="bg-paper hover:bg-line/60" onClick={() => adicionarAlimento(i)}>
                  + Adicionar alimento
                </RowButton>
              </div>
            </div>
          ))}
          <RowButton
            onClick={() =>
              set("diarioAlimentar", [
                ...a.diarioAlimentar,
                {
                  id: novoId(),
                  refeicao: "",
                  horario: "",
                  local: "",
                  alimentos: [{ id: novoId(), alimento: "", quantidade: "" }],
                },
              ])
            }
          >
            + Adicionar refeição
          </RowButton>
          <RowButton
            className="ml-0 bg-accent text-white ring-accent/40 hover:bg-accent/90 sm:ml-3"
            onClick={diaAtipico !== null ? onRemoverDiaAtipico : onAdicionarDiaAtipico}
          >
            {diaAtipico !== null ? "- Remover dia atípico" : "+ Adicionar dia atípico"}
          </RowButton>
        </div>

        <div className="mt-6">
          <Field label="Observações">
            <TextInput value={a.observacoesRecordatorio} onChange={(v) => set("observacoesRecordatorio", v)} />
          </Field>
        </div>
        {diaAtipico === null && (
        <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onCalcular}
              disabled={calculando}
              className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {calculando ? `Calculando… ${progressoCalculo}%` : comp ? "Recalcular" : "Calcular R24h"}
            </button>
        </div>
        )}
        {comp && diaAtipico === null ? (
          <div className="mt-4 rounded-[14px] bg-accent p-5 text-white">{renderR24h()}</div>
        ) : null}
        {diaAtipico !== null && (
          <AtypicalDay refeicoes={diaAtipico} onChange={onAlterarDiaAtipico} composicao={composicaoAtipica} calculando={calculando || calculandoAtipico} onCalcular={() => { onCalcular(); onCalcularAtipico(); }} onCopiarR24h={onCopiarR24h} r24h={comp ? renderR24h() : null} />
        )}
      </Panel>

      <Panel titulo="Evolução do peso">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Se alimenta dessa forma há quanto tempo?">
            <TextInput value={a.tempoAlimentacaoAtual} onChange={(v) => set("tempoAlimentacaoAtual", v)} />
          </Field>
          <Field label="Atualmente está:">
            <OptionRow
              circular
              value={a.evolucaoPeso}
              onChange={(v) => set("evolucaoPeso", v)}
              options={[
                { value: "Perdendo peso", label: "Perdendo peso" },
                { value: "Mantendo peso", label: "Mantendo peso" },
                { value: "Ganhando peso", label: "Ganhando peso" },
              ]}
            />
          </Field>
          <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-start">
            <Field label="Altura referida" className="w-full sm:w-[150px] sm:shrink-0">
              <UnitInput
                value={a.alturaReferida}
                onChange={(v) => set("alturaReferida", v)}
                unidade="m"
                placeholder="1,75"
                casas={2}
              />
            </Field>
            <Field label="Peso referido" className="w-full sm:w-[150px] sm:shrink-0">
              <UnitInput value={a.pesoReferido} onChange={(v) => set("pesoReferido", v)} unidade="kg" placeholder="78,4" />
            </Field>
            <Field label="Observações" className="w-full sm:flex-1">
              <TextInput value={a.observacoesEvolucao} onChange={(v) => set("observacoesEvolucao", v)} />
            </Field>
          </div>
        </div>
      </Panel>
    </div>
  );
}
