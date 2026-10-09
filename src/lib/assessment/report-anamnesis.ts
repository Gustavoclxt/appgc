import { comObs } from "./food-preferences";
import type { DerivedResults } from "./calculations";
import type { Assessment } from "./types";
import {
  carboidratos,
  cereais,
  doces,
  formatarPreferencia,
  frutas,
  gorduras,
  lacteos,
  proteinas,
  vegetais,
} from "./food-preferences";

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

const bristol: Record<string, string> = {
  B1: "B1 - Caroços duros", B2: "B2 - Salsicha granulosa", B3: "B3 - Salsicha com fissuras",
  B4: "B4 - Salsicha lisa", B5: "B5 - Bolas macias", B6: "B6 - Pedaços pastosos", B7: "B7 - Líquida",
};
const armstrong: Record<string, string> = {
  A1: "A1 - Normal", A2: "A2 - Normal", A3: "A3 - Normal", A4: "A4 - Má hidratação",
  A5: "A5 - Má hidratação", A6: "A6 - Má hidratação", A7: "A7 - Desidratação severa",
  A8: "A8 - Desidratação severa",
};

export function doseComUnidade(dose: string): string {
  const v = dose.trim();
  return /^\d+(?:[.,]\d*)?$/.test(v) ? `${v} mg` : v;
}

export function anamneseParaRelatorio(a: Assessment, d: DerivedResults): ReportSection[] {
  const medicamentos = a.medicamentos
    .filter((item) => item.nome.trim() || item.dose.trim() || item.acao.trim())
    .map((item) => [item.nome, item.dose && `Dose: ${doseComUnidade(item.dose)}`, item.acao && `Ação: ${item.acao}`].filter(Boolean).join(" · "));
  const modalidades = a.modalidades
    .filter((item) => item.modalidade.trim() || item.tempoPratica.trim() || item.horario.trim() || item.duracao.trim() || item.frequenciaSemanal.trim() || item.diasSemana.trim() || item.diasDescanso.trim())
    .map((item) => [item.modalidade, item.tempoPratica, item.horario, item.duracao, item.frequenciaSemanal, item.diasSemana, item.diasDescanso && `Descanso: ${item.diasDescanso}`].filter(Boolean).join(" · "));
  const suplementos = a.suplementos
    .filter((item) => item.nome.trim() || item.dose.trim() || item.horario.trim() || item.frequencia.trim() || item.observacoes.trim())
    .map((item) => [item.nome, item.dose, item.horario, item.frequencia, item.observacoes.trim() && `Obs: ${item.observacoes.trim()}`].filter(Boolean).join(" · "));

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
      campo("Tem plano de saúde", a.planoSaude === "sim" ? "Sim · Fazer solicitação médica." : simNao(a.planoSaude)),
      campo("Alergia ou intolerância", a.alergia === "sim" ? `Sim${a.alergiaDescricao ? ` · ${a.alergiaDescricao}` : ""}` : simNao(a.alergia)),
      campo("Restrição alimentar", a.restricaoAlimentar === "nao" ? "Não" : a.restricaoAlimentar),
      campo("Uso de EAAs", a.eaas === "sim" ? `Sim${a.eaasDescricao ? ` · ${a.eaasDescricao}` : ""}` : simNao(a.eaas)),
      campo("Hábitos sociais", lista(a.habitosSociais)),
      campo("Etilismo", a.habitosSociais.includes("Etilista") ? [a.etilismoQuantidade && `Quantidade: ${a.etilismoQuantidade}`, a.etilismoFrequencia && `Frequência: ${a.etilismoFrequencia}`].filter(Boolean).join(" · ") : ""),
      campo("Tabagismo", a.habitosSociais.includes("Tabagista") ? [a.tabagismoQuantidade && `Quantidade: ${a.tabagismoQuantidade}`, a.tabagismoFrequencia && `Frequência: ${a.tabagismoFrequencia}`].filter(Boolean).join(" · ") : ""),
      campo("Observações sobre os exames", a.observacoesExames),
    ]),
    secao("Revisão de sistemas", [
      campo("Função estomacal", lista(a.funcaoEstomacal)),
      campo("Frequência de evacuação", a.frequenciaEvacuacao),
      campo("Escala de Bristol", bristol[a.bristol] ?? a.bristol),
      campo("Consumo de água / líquidos", a.consumoAgua),
      campo("Escala Armstrong", armstrong[a.armstrong] ?? a.armstrong),
    ]),
    secao("Sono", [
      campo("Horário que dorme", a.horaDormir),
      campo("Horário que acorda", a.horaAcordar),
      campo("Duração calculada", d.sono ? `${d.sono.horas}h ${d.sono.restoMinutos}min` : ""),
      campo("Qualidade", a.qualidadeSono),
    ]),
    secao("Rotina de trabalho/faculdade e treino", [
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
      campo("Hábito de beliscar ao longo do dia?", simNao(a.habitoBeliscar)),
      campo("O que?", a.habitoBeliscar === "sim" ? a.beliscarDescricao : ""),
      campo("Utiliza suplemento", simNao(a.usaSuplemento)),
      campo("Observação sobre suplementação", a.observacaoSuplemento),
      campo("Suplementos", suplementos.join("; ")),
      campo("Aceita Whey Protein", simNao(a.aceitaWhey)),
    ]),
    secao("Preferências e aversões alimentares", [
      campo("Vegetais/saladas", comObs(formatarPreferencia(a.prefVegetais, vegetais, "Todos"), a.observacoesPreferencias["vegetais"])),
      campo("Frutas", comObs(formatarPreferencia(a.prefFrutas, frutas, "Todas"), a.observacoesPreferencias["frutas"])),
      campo("Lácteos", comObs(formatarPreferencia(a.prefLacteos, lacteos, "Todos"), a.observacoesPreferencias["lacteos"])),
      campo("Café/chá", comObs(lista(a.prefCafeCha), a.observacoesPreferencias["cafeCha"])),
      campo("Açúcar ou adoçante", comObs(a.acucarAdocante, a.observacoesPreferencias["acucar"])),
      campo("Aceita café com leite", comObs(simNao(a.aceitaCafeComLeite), a.observacoesPreferencias["cafeComLeite"])),
      campo("Proteínas", comObs(formatarPreferencia(a.prefProteinas, proteinas, "Todas"), a.observacoesPreferencias["proteinas"])),
      campo("Carboidratos", comObs(formatarPreferencia(a.prefCarboidratos, carboidratos, "Todos"), a.observacoesPreferencias["carboidratos"])),
      campo("Cereais e grãos", comObs(formatarPreferencia(a.prefCereais, cereais, "Todos"), a.observacoesPreferencias["cereais"])),
      campo("Gorduras", comObs(formatarPreferencia(a.prefGorduras, gorduras, "Todas"), a.observacoesPreferencias["gorduras"])),
      campo("Doces", comObs(formatarPreferencia(a.prefDoces, doces, "Todos"), a.observacoesPreferencias["doces"])),
      campo("Aversões alimentares", a.aversoes),
      campo("Observações do recordatório 24h", a.observacoesRecordatorio),
    ]),
    secao("Evolução do peso", [
      campo("Tempo da alimentação atual", a.tempoAlimentacaoAtual),
      campo("Evolução atual", a.evolucaoPeso),
      campo("Altura referida", a.alturaReferida),
      campo("Peso referido", a.pesoReferido),
      campo("Observações", a.observacoesEvolucao),
    ]),
  ].filter((section): section is ReportSection => section !== null);
}