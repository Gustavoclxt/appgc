import { useLayoutEffect, useRef, useState } from "react";

import { novoId } from "@/lib/assessment/initial-state";

import {
  Field,
  LongText,
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
import {
  aplicarSelecaoPreferencia,
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
import { chaveDiario, composicaoParaRelatorio, type ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { opcoesDeLocal } from "@/lib/assessment/food-diary";
import { DIAS_SEMANA, selecionarDias } from "@/lib/assessment/training-days";
import { Button } from "@/components/ui/button";
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
  "CrossFit", "Pilates", "Ginástica aeróbica", "Spinning", "Ciclismo indoor", "Calistenia", "HIIT",
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
  return (
    <div className="space-y-6">
      <Panel titulo="Rotina de trabalho/faculdade">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Entrada">
            <TextInput type="time" value={a.entradaTrabalho} onChange={(v) => set("entradaTrabalho", v)} />
          </Field>
          <Field label="Saída">
            <TextInput type="time" value={a.saidaTrabalho} onChange={(v) => set("saidaTrabalho", v)} />
          </Field>
          <Field label="Intervalo para refeições?">
            <OptionRow
              value={a.intervaloRefeicoes}
              onChange={(v) => {
                set("intervaloRefeicoes", v as typeof a.intervaloRefeicoes);
                if (v !== "sim") set("intervaloRefeicoesHorarios", "");
              }}
              options={simNao}
            />
          </Field>
          {a.intervaloRefeicoes === "sim" && (
            <Field label="Horários dos intervalos">
              <TextInput
                value={a.intervaloRefeicoesHorarios}
                onChange={(v) => set("intervaloRefeicoesHorarios", v)}
                placeholder="Ex.: 10:00 e 15:30"
              />
            </Field>
          )}
          <Field label="Possui cozinha/copa no trabalho?">
            <OptionRow
              value={a.cozinhaTrabalho}
              onChange={(v) => set("cozinhaTrabalho", v as typeof a.cozinhaTrabalho)}
              options={simNao}
            />
          </Field>
        </div>
        {d.jornada && (
          <p className="mt-4 rounded-[10px] bg-accent-soft/70 px-4 py-3 font-mono text-[12px] text-accent ring-1 ring-accent/15">
            Tempo de trabalho: {d.jornada.horas} horas e {d.jornada.restoMinutos} minutos.
          </p>
        )}
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
                  <TextInput
                    type="time"
                    value={m.horario}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, horario: v } : x)))
                    }
                  />
                </Field>
                <Field label="Duração">
                  <TextInput
                    value={m.duracao}
                    placeholder="60 minutos"
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, duracao: v } : x)))
                    }
                  />
                </Field>
                <Field label="Frequência semanal">
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
                      ...DIAS_SEMANA.map((d) => ({ value: d, label: d })),
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
                      ...DIAS_SEMANA.map((d) => ({ value: d, label: d })),
                      { value: "Nenhum", label: "Nenhum" },
                    ]}
                  />
                </Field>
                <Field label="Nota">
                  <Select
                    value={m.nota}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, nota: v } : x)))
                    }
                    options={Array.from({ length: 11 }, (_, index) => ({ value: String(index), label: String(index) }))}
                  />
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
            + Adicionar modalidade
          </RowButton>
        </div>
      </Panel>

      <Panel titulo="Rotina alimentar">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Em casa, quem prepara os alimentos?">
            <OptionRow
              value={a.quemPrepara}
              onChange={(v) => set("quemPrepara", v as typeof a.quemPrepara)}
              options={[
                { value: "propria", label: "Própria pessoa" },
                { value: "outra", label: "Outra pessoa" },
              ]}
            />
          </Field>
          {a.quemPrepara === "outra" && (
            <Field label="Quem?">
              <TextInput value={a.quemPreparaOutra} onChange={(v) => set("quemPreparaOutra", v)} />
            </Field>
          )}
          <Field label="Come fora?">
            <OptionRow value={a.comeFora} onChange={(v) => set("comeFora", v as typeof a.comeFora)} options={simNao} />
          </Field>
          {a.comeFora === "sim" && (
            <>
              <Field label="Frequência">
                <TextInput value={a.comeForaFrequencia} onChange={(v) => set("comeForaFrequencia", v)} />
              </Field>
              <Field label="Dias">
                <TextInput value={a.comeForaDias} onChange={(v) => set("comeForaDias", v)} />
              </Field>
            </>
          )}
          <Field label="Costuma consumir alimentos fritos?">
            <OptionRow
              value={a.consomeFritos}
              onChange={(v) => {
                set("consomeFritos", v as typeof a.consomeFritos);
                if (v !== "sim" && v !== "as-vezes") set("fritosFrequencia", "");
              }}
              options={[
                { value: "sim", label: "Sim" },
                { value: "as-vezes", label: "Às vezes" },
                { value: "nao", label: "Não" },
              ]}
            />
          </Field>
          {(a.consomeFritos === "sim" || a.consomeFritos === "as-vezes") && (
            <Field label="Com qual frequência">
              <Select
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
            </Field>
          )}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5">
          <Field label="Em quais horários sente mais fome ou vontade de comer?">
            <MultiOptionRow
              values={a.horariosFome}
              onChange={(v) => set("horariosFome", v)}
              options={[
                "Manhã",
                "Meio da manhã",
                "Almoço",
                "Meio da tarde",
                "Tarde",
                "Final da tarde",
                "Jantar",
                "Noite",
                "Madrugada",
              ].map((x) => ({ value: x, label: x }))}
            />
          </Field>
          <Field label="Horários personalizados">
            <TextInput
              value={a.horariosFomePersonalizado}
              onChange={(v) => set("horariosFomePersonalizado", v)}
              placeholder="ex.: 22:30"
            />
          </Field>
          <Field label="Observações sobre fome/apetite">
            <TextInput value={a.observacoesFome} onChange={(v) => set("observacoesFome", v)} />
          </Field>
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
            <MultiOptionRow
              values={a.prefCarboidratos}
              onChange={(v, info) => set("prefCarboidratos", aplicarSelecaoPreferencia(a.prefCarboidratos, v, carboidratos, info?.alvo))}
              options={carboidratos.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefProteinas}
              onChange={(v, info) => set("prefProteinas", aplicarSelecaoPreferencia(a.prefProteinas, v, proteinas, info?.alvo))}
              options={proteinas.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefGorduras}
              onChange={(v, info) => set("prefGorduras", aplicarSelecaoPreferencia(a.prefGorduras, v, gorduras, info?.alvo))}
              options={gorduras.map((item) => ({ value: item, label: item }))} />
            <div className="mt-2">
              <TextInput
                value={a.observacoesPreferencias["gorduras"] ?? ""}
                placeholder="Observações"
                onChange={(v) => set("observacoesPreferencias", { ...a.observacoesPreferencias, "gorduras": v })}
              />
            </div>
          </Field>

          <Field label="Vegetais/Saladas">
            <MultiOptionRow
              values={a.prefVegetais}
              onChange={(v, info) => set("prefVegetais", aplicarSelecaoPreferencia(a.prefVegetais, v, vegetais, info?.alvo))}
              options={vegetais.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefFrutas}
              onChange={(v, info) => set("prefFrutas", aplicarSelecaoPreferencia(a.prefFrutas, v, frutas, info?.alvo))}
              options={frutas.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefLeguminosas}
              onChange={(v, info) => set("prefLeguminosas", aplicarSelecaoPreferencia(a.prefLeguminosas, v, leguminosas, info?.alvo))}
              options={leguminosas.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefCereais}
              onChange={(v, info) => set("prefCereais", aplicarSelecaoPreferencia(a.prefCereais, v, cereais, info?.alvo))}
              options={cereais.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefLacteos}
              onChange={(v, info) => set("prefLacteos", aplicarSelecaoPreferencia(a.prefLacteos, v, lacteos, info?.alvo))}
              options={lacteos.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefDoces}
              onChange={(v, info) => set("prefDoces", aplicarSelecaoPreferencia(a.prefDoces, v, doces, info?.alvo))}
              options={doces.map((item) => ({ value: item, label: item }))}
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
            <MultiOptionRow
              values={a.prefCafeCha}
              onChange={(v, info) => set("prefCafeCha", aplicarSelecaoPreferencia(a.prefCafeCha, v, cafeCha, info?.alvo))}
              options={cafeCha.map((item) => ({ value: item, label: item }))}
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
            <LongText value={a.aversoes} onChange={(v) => set("aversoes", v)} rows={2} />
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
                <RowButton onClick={() => set("diarioAlimentar", a.diarioAlimentar.filter((_, j) => j !== i))}>
                  Remover refeição
                </RowButton>
              </div>

              {r.refeicao.trim().toLocaleLowerCase("pt-BR") === "jantar" && (
                <div className="mt-3">
                  <RowButton
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
                <div className="mt-3">
                  <RowButton
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
                    <RowButton
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
                <RowButton onClick={() => adicionarAlimento(i)}>
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
          <Button variant="outline" className="ml-0 sm:ml-3" onClick={onAdicionarDiaAtipico} disabled={diaAtipico !== null}>
            + Adicionar dia atípico
          </Button>
          {diaAtipico !== null && (
            <Button variant="outline" className="ml-0 sm:ml-3" onClick={onRemoverDiaAtipico}>
              - Remover dia atípico
            </Button>
          )}
        </div>

        <div className="mt-6">
          <Field label="Observações">
            <LongText value={a.observacoesRecordatorio} onChange={(v) => set("observacoesRecordatorio", v)} rows={3} />
          </Field>
        </div>
        <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onCalcular}
              disabled={calculando}
              className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {calculando ? "Calculando…" : comp ? "Recalcular" : "Calcular calorias e macronutrientes"}
            </button>
        </div>
        {comp ? (
          <div className="mt-4 rounded-[14px] bg-accent p-5 text-white">
            <>
              {desatualizada && (
                <p className="mt-2 text-[12px] text-white/70">O diário foi alterado. Recalcule para atualizar.</p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {comp.totais.map((t) => (
                  <div key={t.label}>
                    <p className="text-[11px] text-white/60">{t.label}</p>
                    <p className="mt-1 font-mono text-sm tabular-nums">{t.valor}</p>
                  </div>
                ))}
              </div>
              {(() => {
                const horarios = new Map(
                  a.diarioAlimentar.map((r) => [r.refeicao.trim().toLocaleLowerCase("pt-BR") || "refeição", r.horario]),
                );
                const grupos: { nome: string; horario: string; itens: NonNullable<typeof composicao>["itens"] }[] = [];
                for (const i of composicao?.itens ?? []) {
                  const chave = i.refeicao.trim().toLocaleLowerCase("pt-BR") || "refeição";
                  const atual = grupos[grupos.length - 1];
                  if (atual && atual.nome.toLocaleLowerCase("pt-BR") === chave) {
                    atual.itens.push(i);
                  } else {
                    grupos.push({ nome: i.refeicao || "Refeição", horario: horarios.get(chave) ?? "", itens: [i] });
                  }
                }
                const fmt1 = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
                return grupos.map((g, n) => (
                  <div key={n} className="mt-3 first:mt-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
                      {g.nome}
                      {g.horario ? ` · ${g.horario}` : ""}
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
              <p className="mt-3 text-[11px] text-white/50">{comp.nota}</p>
            </>
          </div>
        ) : null}
        {diaAtipico !== null && (
          <AtypicalDay refeicoes={diaAtipico} onChange={onAlterarDiaAtipico} composicao={composicaoAtipica} calculando={calculandoAtipico} onCalcular={onCalcularAtipico} onCopiarR24h={onCopiarR24h} />
        )}
      </Panel>

      <Panel titulo="Evolução do peso">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Se alimenta dessa forma há quanto tempo?">
            <TextInput value={a.tempoAlimentacaoAtual} onChange={(v) => set("tempoAlimentacaoAtual", v)} />
          </Field>
          <Field label="Atualmente está:">
            <OptionRow
              value={a.evolucaoPeso}
              onChange={(v) => set("evolucaoPeso", v)}
              options={[
                { value: "Perdendo peso", label: "Perdendo peso" },
                { value: "Mantendo peso", label: "Mantendo peso" },
                { value: "Ganhando peso", label: "Ganhando peso" },
              ]}
            />
          </Field>
          <Field label="Altura referida">
            <UnitInput
              value={a.alturaReferida}
              onChange={(v) => set("alturaReferida", v)}
              unidade="m"
              placeholder="1,75"
              casas={2}
            />
          </Field>
          <Field label="Peso referido">
            <UnitInput value={a.pesoReferido} onChange={(v) => set("pesoReferido", v)} unidade="kg" placeholder="78,4" />
          </Field>
          <Field label="Observações" className="sm:col-span-2">
            <LongText value={a.observacoesEvolucao} onChange={(v) => set("observacoesEvolucao", v)} rows={3} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
