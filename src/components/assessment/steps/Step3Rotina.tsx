import { novoId } from "@/lib/assessment/initial-state";

import {
  Field,
  LongText,
  MultiOptionRow,
  OptionRow,
  Panel,
  RowButton,
  SubTitle,
  TextInput,
} from "../fields";
import type { StepProps } from "./types";

const simNao = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export function Step3Rotina({ a, set, d }: StepProps) {
  return (
    <div className="space-y-6">
      <Panel titulo="Rotina de trabalho" meta="Etapa 3">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Entrada">
            <TextInput type="time" value={a.entradaTrabalho} onChange={(v) => set("entradaTrabalho", v)} />
          </Field>
          <Field label="Saída">
            <TextInput type="time" value={a.saidaTrabalho} onChange={(v) => set("saidaTrabalho", v)} />
          </Field>
          <Field label="Intervalo para refeições">
            <TextInput value={a.intervaloRefeicoes} onChange={(v) => set("intervaloRefeicoes", v)} />
          </Field>
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
      </Panel>

      <Panel titulo="Treino e rotina" meta="modalidades">
        <div className="space-y-4">
          {a.modalidades.map((m, i) => (
            <div key={m.id} className="rounded-[10px] bg-white/70 p-4 ring-1 ring-line">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Modalidade">
                  <TextInput
                    value={m.modalidade}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, modalidade: v } : x)))
                    }
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
                  <TextInput
                    value={m.frequenciaSemanal}
                    placeholder="5x/semana"
                    onChange={(v) =>
                      set(
                        "modalidades",
                        a.modalidades.map((x, j) => (j === i ? { ...x, frequenciaSemanal: v } : x)),
                      )
                    }
                  />
                </Field>
                <Field label="Dias da semana">
                  <TextInput
                    value={m.diasSemana}
                    placeholder="segunda a sexta"
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, diasSemana: v } : x)))
                    }
                  />
                </Field>
                <Field label="Dias de descanso">
                  <TextInput
                    value={m.diasDescanso}
                    onChange={(v) =>
                      set("modalidades", a.modalidades.map((x, j) => (j === i ? { ...x, diasDescanso: v } : x)))
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
        </div>

        <SubTitle>Fome e apetite</SubTitle>
        <div className="grid grid-cols-1 gap-5">
          <Field label="Em quais horários sente mais fome ou vontade de comer?">
            <MultiOptionRow
              values={a.horariosFome}
              onChange={(v) => set("horariosFome", v)}
              options={[
                "Manhã",
                "Meio da manhã",
                "Almoço",
                "Meio da tarde",
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
            <LongText value={a.observacoesFome} onChange={(v) => set("observacoesFome", v)} rows={2} />
          </Field>
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
          </Field>
          <Field label="Aceita Whey Protein?">
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
                <RowButton onClick={() => set("suplementos", a.suplementos.filter((_, j) => j !== i))}>
                  Remover
                </RowButton>
              </div>
            ))}
            <RowButton
              onClick={() =>
                set("suplementos", [
                  ...a.suplementos,
                  { id: novoId(), nome: "", dose: "", horario: "", frequencia: "" },
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
          <Field label="Vegetais/saladas">
            <LongText value={a.prefVegetais} onChange={(v) => set("prefVegetais", v)} rows={2} />
          </Field>
          <Field label="Frutas">
            <LongText value={a.prefFrutas} onChange={(v) => set("prefFrutas", v)} rows={2} />
          </Field>
          <Field label="Lácteos">
            <LongText value={a.prefLacteos} onChange={(v) => set("prefLacteos", v)} rows={2} />
          </Field>
          <Field label="Café/chá">
            <LongText value={a.prefCafeCha} onChange={(v) => set("prefCafeCha", v)} rows={2} />
          </Field>
          <Field label="Utiliza açúcar ou adoçante?">
            <TextInput value={a.acucarAdocante} onChange={(v) => set("acucarAdocante", v)} />
          </Field>
          <Field label="Aceita café com leite?">
            <OptionRow
              value={a.aceitaCafeComLeite}
              onChange={(v) => set("aceitaCafeComLeite", v as typeof a.aceitaCafeComLeite)}
              options={simNao}
            />
          </Field>
          <Field label="Proteínas" hint="Carnes, ovos, frios e embutidos.">
            <LongText value={a.prefProteinas} onChange={(v) => set("prefProteinas", v)} rows={2} />
          </Field>
          <Field
            label="Carboidratos"
            hint="Pão, Rap10, tapioca, crepioca, arroz, feijão, batatas."
          >
            <LongText value={a.prefCarboidratos} onChange={(v) => set("prefCarboidratos", v)} rows={2} />
          </Field>
          <Field label="Cereais e grãos" hint="Aveia, granola, chia, linhaça etc.">
            <LongText value={a.prefCereais} onChange={(v) => set("prefCereais", v)} rows={2} />
          </Field>
          <Field label="Gorduras" hint="Margarina, manteiga, oleaginosas.">
            <LongText value={a.prefGorduras} onChange={(v) => set("prefGorduras", v)} rows={2} />
          </Field>
          <Field
            label="Doces"
            hint="Doce de leite, geleia, pasta de amendoim, sucrilhos, biscoitos, chocolate etc."
          >
            <LongText value={a.prefDoces} onChange={(v) => set("prefDoces", v)} rows={2} />
          </Field>
          <Field label="Aversões alimentares">
            <LongText value={a.aversoes} onChange={(v) => set("aversoes", v)} rows={2} />
          </Field>
        </div>
      </Panel>

      <Panel titulo="Diário alimentar">
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
                <TextInput
                  value={r.local}
                  placeholder="Local"
                  onChange={(v) =>
                    set("diarioAlimentar", a.diarioAlimentar.map((x, j) => (j === i ? { ...x, local: v } : x)))
                  }
                />
                <RowButton onClick={() => set("diarioAlimentar", a.diarioAlimentar.filter((_, j) => j !== i))}>
                  Remover refeição
                </RowButton>
              </div>

              <div className="mt-4 space-y-2 border-t border-line/70 pt-4">
                {r.alimentos.map((item, itemIndex) => (
                  <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <TextInput
                      value={item.alimento}
                      placeholder="Alimento"
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
                <RowButton
                  onClick={() =>
                    set(
                      "diarioAlimentar",
                      a.diarioAlimentar.map((refeicao, refeicaoIndex) =>
                        refeicaoIndex === i
                          ? {
                              ...refeicao,
                              alimentos: [
                                ...refeicao.alimentos,
                                { id: novoId(), alimento: "", quantidade: "" },
                              ],
                            }
                          : refeicao,
                      ),
                    )
                  }
                >
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
        </div>
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
          <Field label="Observações" className="sm:col-span-2">
            <LongText value={a.observacoesEvolucao} onChange={(v) => set("observacoesEvolucao", v)} rows={3} />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
