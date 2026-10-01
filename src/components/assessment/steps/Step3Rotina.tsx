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
import { cafeCha, carboidratos, cereais, doces, frutas, gorduras, lacteos, proteinas, vegetais } from "@/lib/assessment/food-preferences";
import { chaveDiario, composicaoParaRelatorio, type ComposicaoDiario } from "@/lib/assessment/diet-composition";

interface Props extends StepProps {
  composicao: ComposicaoDiario | null;
  calculando: boolean;
  onCalcular: () => void;
}

const simNao = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

const selecionarPreferencia = (atuais: string[], valor: string, opcoes: string[]) => {
  const nenhum = valor === "Nenhum" || valor === "Nenhuma";
  const todos = valor === "Todos" || valor === "Todas";
  if (nenhum) return atuais.includes(valor) ? [] : [valor];
  if (todos) {
    const selecionaveis = opcoes.filter((item) => item !== "Nenhum" && item !== "Nenhuma");
    return atuais.includes(valor) ? [] : selecionaveis;
  }
  const semGlobais = atuais.filter((item) => !["Nenhum", "Nenhuma", "Todos", "Todas"].includes(item));
  return semGlobais.includes(valor)
    ? semGlobais.filter((item) => item !== valor)
    : [...semGlobais, valor].filter((item) => opcoes.includes(item));
};

export function Step3Rotina({ a, set, d, composicao, calculando, onCalcular }: Props) {
  const comp = composicaoParaRelatorio(composicao);
  const desatualizada = composicao !== null && composicao.chave !== chaveDiario(a.diarioAlimentar);
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
          <Field label="Vegetais/Saladas">
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
            <MultiOptionRow
              values={a.prefFrutas}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefFrutas.includes(item)) ?? a.prefFrutas.find((item) => !v.includes(item));
                set("prefFrutas", alterado ? selecionarPreferencia(a.prefFrutas, alterado, frutas) : v);
              }}
              options={frutas.map((item) => ({ value: item, label: item }))}
            />
          </Field>
          <Field label="Lácteos">
            <MultiOptionRow
              values={a.prefLacteos}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefLacteos.includes(item)) ?? a.prefLacteos.find((item) => !v.includes(item));
                set("prefLacteos", alterado ? selecionarPreferencia(a.prefLacteos, alterado, lacteos) : v);
              }}
              options={lacteos.map((item) => ({ value: item, label: item }))}
            />
          </Field>
          <Field label="Café/Chá">
            <MultiOptionRow
              values={a.prefCafeCha}
              onChange={(v) => set("prefCafeCha", v.includes("Nenhum") ? ["Nenhum"] : v)}
              options={cafeCha.map((item) => ({ value: item, label: item }))}
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
                set("prefProteinas", alterado ? selecionarPreferencia(a.prefProteinas, alterado, proteinas) : v);
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
          <Field label="Cereais e Grãos">
            <MultiOptionRow
              values={a.prefCereais}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefCereais.includes(item)) ?? a.prefCereais.find((item) => !v.includes(item));
                set("prefCereais", alterado ? selecionarPreferencia(a.prefCereais, alterado, cereais) : v);
              }}
              options={cereais.map((item) => ({ value: item, label: item }))}
            />
          </Field>
          <Field label="Gorduras">
            <MultiOptionRow values={a.prefGorduras} onChange={(v) => set("prefGorduras", v)} options={gorduras.map((item) => ({ value: item, label: item }))} />
          </Field>
          <Field label="Doces">
            <MultiOptionRow
              values={a.prefDoces}
              onChange={(v) => {
                const alterado = v.find((item) => !a.prefDoces.includes(item)) ?? a.prefDoces.find((item) => !v.includes(item));
                set("prefDoces", alterado ? selecionarPreferencia(a.prefDoces, alterado, doces) : v);
              }}
              options={doces.map((item) => ({ value: item, label: item }))}
            />
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

        <div className="mt-6 rounded-[14px] bg-ink p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
              Composição estimada da dieta
            </p>
            <button
              type="button"
              onClick={onCalcular}
              disabled={calculando}
              className="rounded-[10px] bg-white px-4 py-2 text-[12px] font-semibold text-ink disabled:opacity-60"
            >
              {calculando ? "Calculando…" : comp ? "Recalcular" : "Calcular calorias e macronutrientes"}
            </button>
          </div>
          {comp ? (
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
          ) : null}
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
