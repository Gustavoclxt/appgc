import { comObs } from "./food-preferences";
import { observacoesExamesParaRelatorio } from "./anthropometry-groups";
import type { DerivedResults } from "./calculations";
import type { Assessment } from "./types";
import {
  cafeCha,
  carboidratos,
  cereais,
  doces,
  formatarPreferencia,
  frutas,
  gorduras,
  lacteos,
  leguminosas,
  proteinas,
  vegetais,
} from "./food-preferences";

export interface ReportField {
  label: string;
  value: string;
}

export interface ReportSection {
  id: string;
  title: string;
  fields: ReportField[];
}

const simNao = (value: string) => value === "sim" ? "Sim" : value === "nao" ? "Não" : value;
const lista = (value: string[]) => value.join(", ");
const campo = (label: string, value: string | undefined): ReportField | null => {
  const normalized = value?.trim();
  return normalized ? { label, value: normalized } : null;
};

const secao = (id: string, title: string, values: Array<ReportField | null>): ReportSection | null => {
  const fields = values.filter((value): value is ReportField => value !== null);
  return fields.length ? { id, title, fields } : null;
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
    .filter((item) => item.modalidade.trim() || item.tempoPratica.trim() || item.horario.trim() || item.duracao.trim() || item.frequenciaSemanal.trim() || item.diasSemana.trim() || item.diasDescanso.trim() || item.nota.trim() || item.justificativa.trim())
    .map((item) => [item.modalidade, item.tempoPratica, item.horario, item.duracao, item.frequenciaSemanal, item.diasSemana, item.diasDescanso && `Descanso: ${item.diasDescanso}`, item.nota.trim() && `Nota: ${item.nota.trim()}`, item.justificativa.trim() && `Justificativa: ${item.justificativa.trim()}`].filter(Boolean).join(" · "));
  const suplementos = a.suplementos
    .filter((item) => item.nome.trim() || item.dose.trim() || item.horario.trim() || item.frequencia.trim() || item.observacoes.trim())
    .map((item) => [item.nome, item.dose, item.horario, item.frequencia, item.observacoes.trim() && `Obs: ${item.observacoes.trim()}`].filter(Boolean).join(" · "));

  return [
    secao("objetivo", "Informações gerais e Objetivo", [
      campo("Já fez dieta ou consultou nutricionista", simNao(a.jaFezDieta)),
      campo("Objetivos", lista(a.objetivos)),
      campo("Peso desejado", a.pesoDesejado ? `${a.pesoDesejado} kg` : ""),
      campo("O que mais incomoda", a.incomodoFisico),
      campo("Maior dificuldade", a.maiorDificuldade),
      campo("Motivação", a.motivacao ? `${a.motivacao}/10` : ""),
      campo("O que falta para chegar em 10", a.faltaParaDez),
    ]),
    secao("historia", "História clínica", [
      campo("Histórico do peso", historicoPreenchido(a.historicoPeso)),
      campo("HMA", a.hma),
      campo("HMP", a.hmp),
      campo("HMF", a.hmf),
      campo("Medicamentos", medicamentos.join("; ")),
    ]),
    secao("exames-habitos", "Exames bioquímicos, Alergias e Hábitos", [
      campo("Possui exames bioquímicos recentes", simNao(a.possuiExames)),
      campo("Tem plano de saúde", a.planoSaude === "sim" ? "Sim · Fazer solicitação médica." : simNao(a.planoSaude)),
      campo("Alergia ou intolerância", a.alergia === "sim" ? `Sim${a.alergiaDescricao ? ` · ${a.alergiaDescricao}` : ""}` : simNao(a.alergia)),
      campo("Restrição alimentar", a.restricaoAlimentar === "nao" ? "Não" : a.restricaoAlimentar),
      campo("Uso de EAAs", a.eaas === "sim" ? `Sim${a.eaasDescricao ? ` · ${a.eaasDescricao}` : ""}` : simNao(a.eaas)),
      campo("Hábitos sociais", lista(a.habitosSociais)),
      campo("Etilismo", a.habitosSociais.includes("Etilista") ? [a.etilismoQuantidade && `Quantidade: ${a.etilismoQuantidade}`, a.etilismoFrequencia && `Frequência: ${a.etilismoFrequencia}`].filter(Boolean).join(" · ") : ""),
      campo("Tabagismo", a.habitosSociais.includes("Tabagista") ? [a.tabagismoQuantidade && `Quantidade: ${a.tabagismoQuantidade}`, a.tabagismoFrequencia && `Frequência: ${a.tabagismoFrequencia}`].filter(Boolean).join(" · ") : ""),
      campo("Drogas", a.habitosSociais.includes("Drogas") ? a.drogasDescricao : ""),
      campo("Observações sobre os exames", observacoesExamesParaRelatorio(a)),
    ]),
    secao("sistemas-sono", "Revisão de Sistemas e Sono", [
      campo("Função estomacal/intestinal", lista(a.funcaoEstomacal)),
      campo("Frequência de evacuação", a.frequenciaEvacuacao),
      campo("Escala de Bristol", bristol[a.bristol] ?? a.bristol),
      campo("Consumo hídrico diário", a.consumoAgua ? `${a.consumoAgua.replace(".", ",")} L/dia` : ""),
      campo("Escala de Armstrong", armstrong[a.armstrong] ?? a.armstrong),
      campo("Dorme", a.horaDormir),
      campo("Acorda", a.horaAcordar),
      campo("Duração calculada", d.sono ? `${d.sono.horas}h ${d.sono.restoMinutos}min` : ""),
      campo("Qualidade", a.qualidadeSono),
    ]),
    secao("rotina", "Rotina de trabalho/faculdade", [
      campo("Entrada", a.entradaTrabalho),
      campo("Saída", a.saidaTrabalho),
      campo("Jornada calculada", d.jornada ? `${d.jornada.horas}h ${d.jornada.restoMinutos}min` : ""),
      campo("Possui cozinha/copa no trabalho?", simNao(a.cozinhaTrabalho)),
      campo("Intervalo para refeições?", a.intervaloRefeicoes === "sim" ? `Sim${a.intervaloRefeicoesHorarios ? ` · ${a.intervaloRefeicoesHorarios}` : ""}` : simNao(a.intervaloRefeicoes)),
      campo("Pratica atividade física?", simNao(a.praticaAtividadeFisica)),
      campo("Modalidade(s)", modalidades.join("; ")),
    ]),
    secao("habitos-alimentares", "Hábitos alimentares", [
      campo("Quem prepara os alimentos", a.quemPrepara === "propria" ? "Própria pessoa" : a.quemPrepara === "outra" ? a.quemPreparaOutra || "Outra pessoa" : ""),
      campo("Come fora", a.comeFora === "sim" ? ["Sim", a.comeForaFrequencia, a.comeForaDias].filter(Boolean).join(" · ") : simNao(a.comeFora)),
      campo("Consome fritos", a.consomeFritos ? [{ sim: "Sim", "as-vezes": "Às vezes", nao: "Não" }[a.consomeFritos], a.consomeFritos !== "nao" ? a.fritosFrequencia : ""].filter(Boolean).join(" · ") : ""),
      campo("Horários de maior fome", a.horariosFome.filter(Boolean).join(", ")),
      campo("Observações sobre fome/apetite", a.observacoesFome),
      campo("Hábito de beliscar ao longo do dia?", simNao(a.habitoBeliscar)),
      campo("O que?", a.habitoBeliscar === "sim" ? a.beliscarDescricao : ""),
    ]),
    secao("suplementacao", "Suplementação", [
      campo("Utiliza suplemento", simNao(a.usaSuplemento)),
      campo("Observação sobre suplementação", a.observacaoSuplemento),
      campo("Suplementos", suplementos.join("; ")),
      campo("Aceita Whey Protein", simNao(a.aceitaWhey)),
    ]),
    secao("preferencias", "Preferências e aversões alimentares", [
      campo("Carboidratos", comObs(formatarPreferencia(a.prefCarboidratos, carboidratos, "Todos"), a.observacoesPreferencias["carboidratos"])),
      campo("Proteínas", comObs(formatarPreferencia(a.prefProteinas, proteinas, "Todas"), a.observacoesPreferencias["proteinas"])),
      campo("Gorduras", comObs(formatarPreferencia(a.prefGorduras, gorduras, "Todas"), a.observacoesPreferencias["gorduras"])),
      campo("Vegetais/saladas", comObs(formatarPreferencia(a.prefVegetais, vegetais, "Todos"), a.observacoesPreferencias["vegetais"])),
      campo("Frutas", comObs(formatarPreferencia(a.prefFrutas, frutas, "Todas"), a.observacoesPreferencias["frutas"])),
      campo("Leguminosas", comObs(formatarPreferencia(a.prefLeguminosas, leguminosas, "Todas"), a.observacoesPreferencias["leguminosas"])),
      campo("Cereais e grãos", comObs(formatarPreferencia(a.prefCereais, cereais, "Todos"), a.observacoesPreferencias["cereais"])),
      campo("Lácteos", comObs(formatarPreferencia(a.prefLacteos, lacteos, "Todos"), a.observacoesPreferencias["lacteos"])),
      campo("Doces", comObs(formatarPreferencia(a.prefDoces, doces, "Todos"), a.observacoesPreferencias["doces"])),
      campo("Bebidas", comObs(formatarPreferencia(a.prefCafeCha, cafeCha, "Todas"), a.observacoesPreferencias["cafeCha"])),
      campo("Açúcar ou adoçante", comObs(a.acucarAdocante, a.observacoesPreferencias["acucar"])),
      campo("Aversões alimentares", a.aversoes),
    ]),
    secao("evolucao", "Evolução do peso", [
      campo("Tempo da alimentação atual", a.tempoAlimentacaoAtual),
      campo("Evolução atual", a.evolucaoPeso),
      campo("Altura referida", a.alturaReferida),
      campo("Peso referido", a.pesoReferido),
      campo("Observações", a.observacoesEvolucao),
    ]),
  ].filter((section): section is ReportSection => section !== null);
}
/** Observações do Recordatório 24h, exibidas logo após as refeições, como no formulário. */
export function observacoesRecordatorioParaRelatorio(a: Assessment): ReportSection | null {
  return secao("observacoes-r24h", "Observações do Recordatório 24h", [campo("Observações", a.observacoesRecordatorio)]);
}
