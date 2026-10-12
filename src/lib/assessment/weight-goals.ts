import type { DerivedResults } from "./calculations";
import { fmt2, fmtInt, parseNumero } from "./calculations";
import type { Assessment } from "./types";
import {
  classificarExpectativa,
  diasParaMeta,
  metaReferencia,
  percentualReferenciaParaPrazo,
  pesoNoDia,
  simularHall,
  type ClassificacaoExpectativa,
  type MetaReferencia,
  type MetasPesoEstado,
  type ResultadoModelo,
} from "./weight-projection";

export const MODULO_METAS_ATIVO = (a: Assessment) => a.objetivos.includes("Emagrecimento");

export const REFERENCIAS_METAS = [
  "Hall KD, et al. Quantification of the effect of energy imbalance on bodyweight. Lancet. 2011;378(9793):826-37.",
  "NIH/NIDDK. Body Weight Planner (niddk.nih.gov/bwp).",
  "Jensen MD, et al. 2013 AHA/ACC/TOS Guideline for the Management of Overweight and Obesity in Adults. Circulation. 2014;129:S102-38.",
  "Garvey WT, et al. AACE/ACE Comprehensive Clinical Practice Guidelines for Medical Care of Patients with Obesity. Endocr Pract. 2016;22(Suppl 3).",
  "ABESO. Diretrizes Brasileiras de Obesidade. 4ª ed. 2016.",
];

export interface MetasPesoResultado {
  dataAvaliacao: string;
  pesoInicial: number | null;
  expectativa: {
    kg: number;
    percentual: number;
    pesoAlvo: number;
    prazoMeses: number | null;
    kgSemana: number | null;
    pctSemana: number | null;
  } | null;
  percentualReferencia: number | null;
  classificacao: ClassificacaoExpectativa | null;
  metas: MetaReferencia[];
  deficitPlano: number | null;
  deficitOrigem: string;
  deficitUsado: number | null;
  modelo: ResultadoModelo | null;
  projecoes: { dias: number; peso: number }[];
  diasMeta: number | null;
  limitacoes: string[];
  interpretacao: string[];
}

export function calcularMetasPeso(a: Assessment, d: DerivedResults, m: MetasPesoEstado): MetasPesoResultado {
  const peso = d.pesoKg;
  const dataAvaliacao = a.dataAvaliacaoAntropometrica || a.dataAvaliacao;
  const limitacoes: string[] = [];
  const interpretacao: string[] = [];

  let expectativa: MetasPesoResultado["expectativa"] = null;
  const prazoMeses = parseNumero(m.prazoMeses);
  if (peso !== null) {
    const pd = parseNumero(m.pesoDesejado || a.pesoDesejado);
    const kgPerder = m.modo === "peso" ? (pd !== null ? peso - pd : null) : parseNumero(m.kgPerder);
    if (kgPerder !== null && kgPerder > 0) {
      const semanas = prazoMeses && prazoMeses > 0 ? (prazoMeses * 30.4375) / 7 : null;
      const percentual = (kgPerder / peso) * 100;
      expectativa = {
        kg: kgPerder,
        percentual,
        pesoAlvo: peso - kgPerder,
        prazoMeses: prazoMeses && prazoMeses > 0 ? prazoMeses : null,
        kgSemana: semanas ? kgPerder / semanas : null,
        pctSemana: semanas ? percentual / semanas : null,
      };
    }
  }

  const ref = {
    meta1: parseNumero(m.meta1) ?? 2.5,
    meta3: parseNumero(m.meta3) ?? 5,
    meta6Min: parseNumero(m.meta6Min) ?? 5,
    meta6Max: parseNumero(m.meta6Max) ?? 10,
  };
  const metas =
    peso !== null
      ? [
          metaReferencia("1 mês", 1, ref.meta1, peso),
          metaReferencia("3 meses", 3, ref.meta3, peso),
          metaReferencia("6 meses (mín.)", 6, ref.meta6Min, peso),
          metaReferencia("6 meses (máx.)", 6, ref.meta6Max, peso),
        ]
      : [];

  let percentualReferencia: number | null = null;
  let classificacao: ClassificacaoExpectativa | null = null;
  if (expectativa?.prazoMeses) {
    percentualReferencia = percentualReferenciaParaPrazo(expectativa.prazoMeses, ref);
    classificacao = classificarExpectativa(expectativa.percentual, percentualReferencia);
  }

  const deficitPlano =
    a.estrategia === "deficit" && d.vet !== null && d.caloriasSugeridas !== null ? d.vet - d.caloriasSugeridas : null;
  const deficitManual = parseNumero(m.deficitKcal);
  const deficitUsado = deficitManual ?? deficitPlano;
  const deficitOrigem =
    deficitManual !== null
      ? "Valor informado para a projeção."
      : deficitPlano !== null
        ? "Calculado a partir da estratégia energética (VET − calorias sugeridas)."
        : "Defina um déficit na estratégia energética ou informe aqui.";

  let modelo: ResultadoModelo | null = null;
  if (peso === null) limitacoes.push("Peso atual não informado na antropometria.");
  if (d.alturaCm === null) limitacoes.push("Altura não informada.");
  if (d.idade === null) limitacoes.push("Data de nascimento não informada (idade necessária).");
  if (a.sexo === "") limitacoes.push("Sexo não informado.");
  if (d.fatorAtividade === null) limitacoes.push("Nível de atividade física (fator) não informado.");
  if (deficitUsado === null || deficitUsado <= 0) limitacoes.push("Déficit energético não definido — sem ele o modelo dinâmico não é executado.");
  if (limitacoes.length === 0 && peso !== null && d.alturaCm !== null && d.idade !== null && a.sexo !== "" && d.fatorAtividade !== null && deficitUsado !== null) {
    modelo = simularHall({
      sexo: a.sexo,
      idade: d.idade,
      alturaCm: d.alturaCm,
      pesoKg: peso,
      percentualGordura: d.percentualGordura,
      pal: d.fatorAtividade,
      deficitKcal: deficitUsado,
    });
    if (modelo.gorduraEstimada) limitacoes.push("% de gordura ausente: massa gorda inicial estimada por equação (Jackson et al.), como no modelo de Hall.");
  }
  if (limitacoes.length && !modelo) limitacoes.push("Projeção dinâmica não exibida para não apresentar resultados sem base suficiente.");

  const projecoes = modelo ? [30, 60, 90, 180, 365].map((dias) => ({ dias, peso: pesoNoDia(modelo!.serie, dias)! })) : [];
  const diasMeta = modelo && expectativa ? diasParaMeta(modelo.serie, expectativa.pesoAlvo) : null;

  // Interpretação clínica (linguagem de sugestão)
  if (expectativa && expectativa.prazoMeses && percentualReferencia !== null && classificacao) {
    const txt = {
      compativel: "compatível com as metas de referência",
      agressiva: "mais agressiva que as metas de referência",
      "muito-agressiva": "muito agressiva para o prazo informado",
    }[classificacao];
    interpretacao.push(
      `Expectativa de ${fmt2(expectativa.percentual)}% em ${fmt2(expectativa.prazoMeses)} meses (${fmt2(expectativa.kgSemana)} kg/sem) frente a referência de até ${fmt2(percentualReferencia)}% — ${txt}.`,
    );
    if (classificacao !== "compativel" && metas[1])
      interpretacao.push(`Sugere-se pactuar metas intermediárias: ${fmt2(metas[0].pesoMeta)} kg em 1 mês e ${fmt2(metas[1].pesoMeta)} kg em 3 meses.`);
  }
  if (expectativa && modelo) {
    interpretacao.push(
      diasMeta !== null
        ? `Pelo modelo dinâmico, com déficit de ${fmtInt(deficitUsado)} kcal/dia, o objetivo seria atingido em ~${fmt2(diasMeta / 30.4375)} meses.`
        : `Pelo modelo dinâmico, com déficit de ${fmtInt(deficitUsado)} kcal/dia, o objetivo não seria atingido em 3 anos → Reavaliar déficit ou expectativa.`,
    );
    if (expectativa.prazoMeses) {
      const noPrazo = pesoNoDia(modelo.serie, expectativa.prazoMeses * 30.4375);
      if (noPrazo !== null) interpretacao.push(`Peso projetado no prazo pretendido: ${fmt2(noPrazo)} kg (meta do paciente ${fmt2(expectativa.pesoAlvo)} kg).`);
    }
  }
  if (d.imc !== null && d.imc < 25) interpretacao.push(`IMC ${fmt2(d.imc)} (${d.classificacaoIMC}): perda de peso adicional exige cautela → Priorizar composição corporal.`);
  if (d.idade !== null && d.idade >= 60) interpretacao.push("Idade ≥ 60 anos: priorizar preservação de massa magra (proteína adequada e treino de força).");
  if (d.percentualGordura !== null) interpretacao.push(`% de gordura ${fmt2(d.percentualGordura)}% considerado na massa gorda inicial do modelo.`);
  if (a.modalidades.some((x) => x.modalidade.trim())) interpretacao.push("Pratica atividade física → Correlacionar adesão ao treino com a velocidade de perda.");
  const meds = a.medicamentos.filter((x) => x.nome.trim()).map((x) => x.nome.trim());
  if (meds.length) interpretacao.push(`Medicamentos em uso (${meds.join(", ")}) → Investigar efeito sobre peso e apetite.`);
  if (a.hmp.trim() || a.hma.trim()) interpretacao.push("Condições clínicas registradas → Correlacionar clinicamente com a meta.");
  if (a.historicoPeso.trim()) interpretacao.push("Histórico de peso registrado → Considerar efeito sanfona e platôs anteriores.");

  return {
    dataAvaliacao,
    pesoInicial: peso,
    expectativa,
    percentualReferencia,
    classificacao,
    metas,
    deficitPlano,
    deficitOrigem,
    deficitUsado,
    modelo,
    projecoes,
    diasMeta,
    limitacoes,
    interpretacao,
  };
}
