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

const selecionarPreferencia = (atuais: string[], valor: string, opcoes: string[]) => {
  if (valor === "Nenhum") return atuais.includes(valor) ? [] : [valor];
  if (valor === "Todos") return atuais.includes(valor) ? [] : ["Todos"];
  const semGlobais = atuais.filter((item) => item !== "Nenhum" && item !== "Todos");
  return semGlobais.includes(valor)
    ? semGlobais.filter((item) => item !== valor)
    : [...semGlobais, valor].filter((item) => opcoes.includes(item));
};

const vegetais = [
  "Alface", "Rúcula", "Agrião", "Couve", "Espinafre", "Acelga", "Repolho", "Couve-flor",
  "Brócolis", "Abobrinha", "Berinjela", "Pepino", "Tomate", "Cenoura", "Beterraba", "Chuchu",
  "Vagem", "Quiabo", "Pimentão", "Rabanete", "Nabo", "Abóbora", "Nenhum", "Todos",
];

const proteinas = ["Bovina", "Frango", "Peixe", "Suína", "Ovos", "Vísceras", "Nenhuma", "Todas"];
const carboidratos = ["Arroz", "Macarrão", "Batata", "Batata-doce", "Mandioca", "Pão", "Tapioca", "Cuscuz", "Nenhum", "Todos"];
const lacteos = ["Leite", "Iogurte", "Queijo", "Requeijão", "Nenhum"];
const gorduras = ["Margarina", "Manteiga", "Banha", "Oleaginosas", "Nenhum"];

export function Step3Rotina({ a, set, d }: StepProps) {
  return (
    <div className="space-y-6">
      <Panel titulo="Rotina de trabalho" meta="Etapa 2">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Entrada">
            <TextInput type="time" value={a.entradaTrabalho} onChange={(v) => set("entradaTrabalho", v)} />
          </Field>
          <Field label="Saída">
            <TextInput type="time" value={a.saidaTrabalho} onChange={(v) => set("saidaTrabalho", v)} />
          </Field>
          <Field label="Intervalo para refeições">
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
        <SubTitle>Treino e rotina</SubTitle>
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
            <MultiOptionRow
              values={a.prefVegetais}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefVegetais.includes(item)) ?? a.prefVegetais.find((item) => !v.includes(item));
                set("prefVegetais", alterado ? selecionarPreferencia(a.prefVegetais, alterado, vegetais) : v);
              }}
              options={vegetais.map((item) => ({ value: item, label: item }))}
            />
          </Field>
          <Field label="Frutas">
            <LongText value={a.prefFrutas} onChange={(v) => set("prefFrutas", v)} rows={2} />
          </Field>
          <Field label="Lácteos">
            <MultiOptionRow values={a.prefLacteos} onChange={(v) => set("prefLacteos", v)} options={lacteos.map((item) => ({ value: item, label: item }))} />
          </Field>
          <Field label="Café/chá">
            <OptionRow
              value={a.prefCafeCha}
              onChange={(v) => set("prefCafeCha", v)}
              options={["Café", "Chá", "Nenhum"].map((item) => ({ value: item, label: item }))}
            />
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
          </Field>
          <Field label="Aceita café com leite?">
            <OptionRow
              value={a.aceitaCafeComLeite}
              onChange={(v) => set("aceitaCafeComLeite", v as typeof a.aceitaCafeComLeite)}
              options={simNao}
            />
          </Field>
          <Field label="Proteínas">
            <MultiOptionRow
              values={a.prefProteinas}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefProteinas.includes(item)) ?? a.prefProteinas.find((item) => !v.includes(item));
                const normalizadas = proteinas.map((item) => item === "Nenhuma" ? "Nenhum" : item === "Todas" ? "Todos" : item);
                const atuais = a.prefProteinas.map((item) => item === "Nenhuma" ? "Nenhum" : item === "Todas" ? "Todos" : item);
                const valor = alterado === "Nenhuma" ? "Nenhum" : alterado === "Todas" ? "Todos" : alterado;
                const selecionadas = valor ? selecionarPreferencia(atuais, valor, normalizadas) : atuais;
                set("prefProteinas", selecionadas.map((item) => item === "Nenhum" ? "Nenhuma" : item === "Todos" ? "Todas" : item));
              }}
              options={proteinas.map((item) => ({ value: item, label: item }))}
            />
          </Field>
          <Field label="Carboidratos">
            <MultiOptionRow
              values={a.prefCarboidratos}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefCarboidratos.includes(item)) ?? a.prefCarboidratos.find((item) => !v.includes(item));
                set("prefCarboidratos", alterado ? selecionarPreferencia(a.prefCarboidratos, alterado, carboidratos) : v);
              }}
              options={carboidratos.map((item) => ({ value: item, label: item }))}
            />
          </Field>
          <Field label="Cereais e grãos" hint="Aveia, granola, chia, linhaça etc.">
            <LongText value={a.prefCereais} onChange={(v) => set("prefCereais", v)} rows={2} />
          </Field>
          <Field label="Gorduras">
            <MultiOptionRow values={a.prefGorduras} onChange={(v) => set("prefGorduras", v)} options={gorduras.map((item) => ({ value: item, label: item }))} />
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
