import type { DerivedResults } from "./calculations";
import type { Assessment } from "./types";

export interface ReportField {
  label: string;
  value: string;
}

export interface ReportSection {
  title: string;
  fields: ReportField[];
}

const simNao = (value: string) => value === "sim" ? "Sim" : value === "nao" ? "Não" : value;
const lista = (value: string[]) => value.join(", ");
const campo = (label: string, value: string | undefined): ReportField | null => {
  const normalized = value?.trim();
  return normalized ? { label, value: normalized } : null;
};

const secao = (title: string, values: Array<ReportField | null>): ReportSection | null => {
  const fields = values.filter((value): value is ReportField => value !== null);
  return fields.length ? { title, fields } : null;
};

const historicoPreenchido = (value: string) => {
  const semMarcadores = value.replace(/Infância:|Adolescência:|Vida adulta:/gi, "").trim();
  return semMarcadores ? value : "";
};

export function anamneseParaRelatorio(a: Assessment, d: DerivedResults): ReportSection[] {
  const medicamentos = a.medicamentos
    .filter((item) => item.nome.trim() || item.dose.trim() || item.acao.trim())
    .map((item) => [item.nome, item.dose && `Dose: ${item.dose}`, item.acao && `Ação: ${item.acao}`].filter(Boolean).join(" · "));
  const modalidades = a.modalidades
    .filter((item) => Object.values(item).some((value) => value.trim()))
    .map((item) => [item.modalidade, item.tempoPratica, item.horario, item.duracao, item.frequenciaSemanal, item.diasSemana, item.diasDescanso && `Descanso: ${item.diasDescanso}`].filter(Boolean).join(" · "));
  const suplementos = a.suplementos
    .filter((item) => item.nome.trim() || item.dose.trim() || item.horario.trim() || item.frequencia.trim())
    .map((item) => [item.nome, item.dose, item.horario, item.frequencia].filter(Boolean).join(" · "));

  return [
    secao("Objetivo e anamnese", [
      campo("Já fez dieta ou consultou nutricionista", simNao(a.jaFezDieta)),
      campo("Objetivos", lista(a.objetivos)),
      campo("Peso desejado", a.pesoDesejado ? `${a.pesoDesejado} kg` : ""),
      campo("O que mais incomoda", a.incomodoFisico),
      campo("Maior dificuldade", a.maiorDificuldade),
      campo("Motivação", a.motivacao ? `${a.motivacao}/10` : ""),
      campo("O que falta para chegar em 10", a.faltaParaDez),
    ]),
    secao("Histórico clínico", [
      campo("Histórico do peso", historicoPreenchido(a.historicoPeso)),
      campo("HMA", a.hma),
      campo("HMP", a.hmp),
      campo("HMF", a.hmf),
      campo("Medicamentos", medicamentos.join("; ")),
    ]),
    secao("Exames bioquímicos, alergias e hábitos", [
      campo("Possui exames bioquímicos recentes", simNao(a.possuiExames)),
      campo("Tem plano de saúde", simNao(a.planoSaude)),
      campo("Alergia ou intolerância", a.alergia === "sim" ? `Sim${a.alergiaDescricao ? ` · ${a.alergiaDescricao}` : ""}` : simNao(a.alergia)),
      campo("Restrição alimentar", a.restricaoAlimentar === "nao" ? "Não" : a.restricaoAlimentar),
      campo("Uso de EAAs", a.eaas === "sim" ? `Sim${a.eaasDescricao ? ` · ${a.eaasDescricao}` : ""}` : simNao(a.eaas)),
      campo("Hábitos sociais", lista(a.habitosSociais)),
      campo("Observações sobre os exames", a.observacoesExames),
    ]),
    secao("Revisão de sistemas", [
      campo("Função estomacal", a.funcaoEstomacal),
      campo("Frequência de evacuação", a.frequenciaEvacuacao),
      campo("Escala de Bristol", a.bristol),
      campo("Consumo de água / líquidos", a.consumoAgua),
      campo("Escala Armstrong", a.armstrong),
    ]),
    secao("Sono", [
      campo("Horário que dorme", a.horaDormir),
      campo("Horário que acorda", a.horaAcordar),
      campo("Duração calculada", d.sono ? `${d.sono.horas}h ${d.sono.restoMinutos}min` : ""),
      campo("Qualidade", a.qualidadeSono),
    ]),
    secao("Rotina de trabalho e treino", [
      campo("Entrada no trabalho", a.entradaTrabalho),
      campo("Saída do trabalho", a.saidaTrabalho),
      campo("Jornada calculada", d.jornada ? `${d.jornada.horas}h ${d.jornada.restoMinutos}min` : ""),
      campo("Intervalo para refeições", a.intervaloRefeicoes === "sim" ? `Sim${a.intervaloRefeicoesHorarios ? ` · ${a.intervaloRefeicoesHorarios}` : ""}` : simNao(a.intervaloRefeicoes)),
      campo("Cozinha/copa no trabalho", simNao(a.cozinhaTrabalho)),
      campo("Treino e rotina", modalidades.join("; ")),
    ]),
    secao("Rotina alimentar e suplementação", [
      campo("Quem prepara os alimentos", a.quemPrepara === "propria" ? "Própria pessoa" : a.quemPrepara === "outra" ? a.quemPreparaOutra || "Outra pessoa" : ""),
      campo("Come fora", a.comeFora === "sim" ? ["Sim", a.comeForaFrequencia, a.comeForaDias].filter(Boolean).join(" · ") : simNao(a.comeFora)),
      campo("Horários de maior fome", [...a.horariosFome, a.horariosFomePersonalizado].filter(Boolean).join(", ")),
      campo("Observações sobre fome/apetite", a.observacoesFome),
      campo("Utiliza suplemento", simNao(a.usaSuplemento)),
      campo("Suplementos", suplementos.join("; ")),
      campo("Aceita Whey Protein", simNao(a.aceitaWhey)),
    ]),
    secao("Preferências e aversões alimentares", [
      campo("Vegetais/saladas", lista(a.prefVegetais)),
      campo("Frutas", lista(a.prefFrutas)),
      campo("Lácteos", lista(a.prefLacteos)),
      campo("Café/chá", lista(a.prefCafeCha)),
      campo("Açúcar ou adoçante", a.acucarAdocante),
      campo("Aceita café com leite", simNao(a.aceitaCafeComLeite)),
      campo("Proteínas", lista(a.prefProteinas)),
      campo("Carboidratos", lista(a.prefCarboidratos)),
      campo("Cereais e grãos", lista(a.prefCereais)),
      campo("Gorduras", lista(a.prefGorduras)),
      campo("Doces", lista(a.prefDoces)),
      campo("Aversões alimentares", a.aversoes),
    ]),
    secao("Evolução do peso", [
      campo("Tempo da alimentação atual", a.tempoAlimentacaoAtual),
      campo("Evolução atual", a.evolucaoPeso),
      campo("Observações", a.observacoesEvolucao),
    ]),
  ].filter((section): section is ReportSection => section !== null);
}