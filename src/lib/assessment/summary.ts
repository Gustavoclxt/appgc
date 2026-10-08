import { comObs } from "./food-preferences";
import {
  fmt2,
  fmtData,
  fmtInt,
  fmtLitros,
  labelEstrategia,
  labelMetodo,
  type DerivedResults,
} from "./calculations";
import type { Assessment } from "./types";
import { diarioParaRelatorio } from "./food-diary";
import {
  carboidratos,
  cereais,
  doces,
  formatarPreferencia,
  fraseAlimentosRetirar,
  frutas,
  gorduras,
  lacteos,
  proteinas,
  vegetais,
} from "./food-preferences";
import { doseComUnidade } from "./report-anamnesis";
import type { ComposicaoDiario } from "./diet-composition";

const li = (label: string, valor: string | number | null | undefined) =>
  valor === null || valor === undefined || valor === "" ? "" : `${label}: ${valor}\n`;

/** Texto compacto enviado à análise técnica. Só dados informados/calculados. */
export function buildResumo(a: Assessment, d: DerivedResults, composicao: ComposicaoDiario | null = null): string {
  let t = "AVALIAÇÃO NUTRICIONAL — DADOS INFORMADOS E CALCULADOS\n\n";

  t += "## Paciente\n";
  t += li("Idade", d.idade !== null ? `${d.idade} anos` : "");
  t += li("Sexo", a.sexo);
  t += li("Data da avaliação", fmtData(a.dataAvaliacao));
  t += li("Profissão", a.profissao);

  t += "\n## Objetivo\n";
  t += li("Objetivos", a.objetivos.join(", "));
  t += li("Peso desejado (kg)", a.pesoDesejado);
  t += li("O que mais incomoda", a.incomodoFisico);
  t += li("Maior dificuldade", a.maiorDificuldade);
  t += li("Motivação (0-10)", a.motivacao);
  t += li("O que falta para 10", a.faltaParaDez);
  t += li("Já fez dieta/consultou nutricionista", a.jaFezDieta);

  t += "\n## Histórico clínico\n";
  t += li("Histórico do peso", a.historicoPeso);
  t += li("HMA", a.hma);
  t += li("HMP", a.hmp);
  t += li("HMF", a.hmf);
  if (a.medicamentos.length)
    t += `Medicamentos: ${a.medicamentos.map((m) => `${m.nome} | dose: ${m.dose ? doseComUnidade(m.dose) : "não informada"} | ação: ${m.acao || "não informada"}`).join("; ")}\n`;

  t += "\n## Hábitos e restrições\n";
  t += li("Alergia/intolerância", a.alergia === "sim" ? a.alergiaDescricao || "sim" : a.alergia);
  t += li("Restrição alimentar", a.restricaoAlimentar);
  t += li("EAAs", a.eaas === "sim" ? a.eaasDescricao || "sim" : a.eaas);
  t += li("Hábitos sociais", a.habitosSociais.join(", "));
  if (a.habitosSociais.includes("Etilista")) t += li("Álcool (quantidade/frequência)", [a.etilismoQuantidade, a.etilismoFrequencia].filter(Boolean).join(" / "));
  if (a.habitosSociais.includes("Tabagista")) t += li("Tabaco (quantidade/frequência)", [a.tabagismoQuantidade, a.tabagismoFrequencia].filter(Boolean).join(" / "));
  t += li("Plano de saúde", a.planoSaude === "sim" ? "sim — considerar solicitação médica" : a.planoSaude);

  const retirar = fraseAlimentosRetirar(a);
  t += li("Alimentos a retirar por preferências, alergias, aversões e restrições", retirar);

  t += "\n## Revisão de sistemas\n";
  t += li("Função estomacal", a.funcaoEstomacal.join(", "));
  t += li("Frequência de evacuação", a.frequenciaEvacuacao);
  t += li("Escala de Bristol", a.bristol);
  t += li("Ingestão de líquidos", a.consumoAgua);
  t += li("Escala Armstrong", a.armstrong);

  t += "\n## Sono e rotina de trabalho/faculdade\n";
  t += li("Dorme às", a.horaDormir);
  t += li("Acorda às", a.horaAcordar);
  t += li(
    "Duração do sono",
    d.sono ? `${d.sono.horas}h ${d.sono.restoMinutos}min` : "",
  );
  t += li("Qualidade do sono", a.qualidadeSono);
  t += li("Jornada de trabalho", d.jornada ? `${d.jornada.horas}h ${d.jornada.restoMinutos}min` : "");
  t += li(
    "Intervalo para refeições",
    a.intervaloRefeicoes === "sim"
      ? `sim${a.intervaloRefeicoesHorarios ? ` — ${a.intervaloRefeicoesHorarios}` : ""}`
      : a.intervaloRefeicoes,
  );
  t += li("Cozinha no trabalho", a.cozinhaTrabalho);

  if (a.modalidades.length) {
    t += "\n## Treino\n";
    for (const m of a.modalidades) {
      t += `- ${m.modalidade} | ${m.tempoPratica} | ${m.horario} | ${m.duracao} | ${m.frequenciaSemanal} | ${m.diasSemana} | descanso: ${m.diasDescanso}\n`;
    }
  }

  t += "\n## Rotina alimentar\n";
  t += li("Quem prepara", a.quemPrepara === "outra" ? a.quemPreparaOutra || "outra pessoa" : a.quemPrepara);
  t += li("Come fora", a.comeFora === "sim" ? `${a.comeForaFrequencia} ${a.comeForaDias}` : a.comeFora);
  t += li("Horários de mais fome", [...a.horariosFome, a.horariosFomePersonalizado].filter(Boolean).join(", "));
  t += li("Observações fome/apetite", a.observacoesFome);
  t += li("Hábito de beliscar ao longo do dia", a.habitoBeliscar);
  if (a.habitoBeliscar === "sim") t += li("O que belisca", a.beliscarDescricao);
  t += li("Utiliza suplemento", a.usaSuplemento);
  t += li("Observação sobre suplementação", a.observacaoSuplemento);
  if (a.suplementos.length)
    t += `Suplementos: ${a.suplementos.map((s) => `${s.nome} ${s.dose} ${s.horario} ${s.frequencia}`).join("; ")}\n`;
  t += li("Aceita whey protein", a.aceitaWhey);

  t += "\n## Preferências alimentares\n";
  t += li("Vegetais/saladas", comObs(formatarPreferencia(a.prefVegetais, vegetais, "Todos"), a.observacoesPreferencias["vegetais"]));
  t += li("Frutas", comObs(formatarPreferencia(a.prefFrutas, frutas, "Todas"), a.observacoesPreferencias["frutas"]));
  t += li("Lácteos", comObs(formatarPreferencia(a.prefLacteos, lacteos, "Todos"), a.observacoesPreferencias["lacteos"]));
  t += li("Café/chá", comObs(a.prefCafeCha.join(", "), a.observacoesPreferencias["cafeCha"]));
  t += li("Açúcar ou adoçante", comObs(a.acucarAdocante, a.observacoesPreferencias["acucar"]));
  t += li("Aceita café com leite", comObs(a.aceitaCafeComLeite, a.observacoesPreferencias["cafeComLeite"]));
  t += li("Proteínas", comObs(formatarPreferencia(a.prefProteinas, proteinas, "Todas"), a.observacoesPreferencias["proteinas"]));
  t += li("Carboidratos", comObs(formatarPreferencia(a.prefCarboidratos, carboidratos, "Todos"), a.observacoesPreferencias["carboidratos"]));
  t += li("Cereais e grãos", comObs(formatarPreferencia(a.prefCereais, cereais, "Todos"), a.observacoesPreferencias["cereais"]));
  t += li("Gorduras", comObs(formatarPreferencia(a.prefGorduras, gorduras, "Todas"), a.observacoesPreferencias["gorduras"]));
  t += li("Doces", comObs(formatarPreferencia(a.prefDoces, doces, "Todos"), a.observacoesPreferencias["doces"]));
  t += li("Aversões", a.aversoes);
  t += li("Observações do recordatório 24h", a.observacoesRecordatorio);

  const diario = diarioParaRelatorio(a.diarioAlimentar);
  if (diario.length) {
    t += "\n## Recordatório 24h\n";
    for (const r of diario) {
      t += `- ${r.refeicao} | ${r.horario} | ${r.local} | ${r.alimentos.join("; ")}\n`;
    }
  }

  t += "\n## Evolução do peso\n";
  t += li("Alimenta-se assim há", a.tempoAlimentacaoAtual);
  t += li("Atualmente", a.evolucaoPeso);
  t += li("Altura referida", a.alturaReferida);
  t += li("Peso referido", a.pesoReferido);
  t += li("Observações", a.observacoesEvolucao);

  t += "\n## Antropometria\n";
  t += li("Peso (kg)", d.pesoKg !== null ? fmt2(d.pesoKg) : "");
  t += li("Altura (cm)", d.alturaCm !== null ? fmt2(d.alturaCm) : "");
  t += li("IMC", d.imc !== null ? `${fmt2(d.imc)} (${d.classificacaoIMC})` : "");
  t += li("PIO (kg)", d.pio !== null ? fmt2(d.pio) : "");
  t +=
    d.percentualGordura !== null
      ? li("% de gordura", `${fmt2(d.percentualGordura)}% (método: ${a.metodoGordura || "não informado"})`)
      : "Percentual de gordura não informado.\n";
  t += li("Massa gorda (kg)", d.massaGorda !== null ? fmt2(d.massaGorda) : "");
  t += li("Massa livre de gordura (kg)", d.massaLivreGordura !== null ? fmt2(d.massaLivreGordura) : "");

  t += "\n## Gasto energético\n";
  t += li("Método", labelMetodo[a.metodoTMB]);
  t += li("TMB (kcal/dia)", d.tmb !== null ? fmtInt(d.tmb) : "");
  t += li("Fator de atividade", d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : "");
  t += li("VET (kcal/dia)", d.vet !== null ? fmtInt(d.vet) : "");
  t += li(
    "Necessidade hídrica",
    d.aguaMin !== null
      ? `${fmtInt(d.aguaMin)}–${fmtInt(d.aguaMax)} mL/dia (${fmtLitros(d.aguaMin)}–${fmtLitros(d.aguaMax)} L/dia)`
      : "",
  );

  t += "\n## Estratégia energética\n";
  t += li("Estratégia", labelEstrategia[a.estrategia]);
  t += li(
    "Ajuste",
    d.ajusteKcal !== null
      ? `${fmtInt(d.ajusteKcal)} kcal`
      : d.percentualAjuste !== null
        ? `${d.percentualAjuste}%`
        : "",
  );
  t += li("Calorias sugeridas (kcal/dia)", d.caloriasSugeridas !== null ? fmtInt(d.caloriasSugeridas) : "");
  t += li("Calorias calculadas do Recordatório 24h (kcal)", composicao ? fmtInt(composicao.totais.kcal) : "");

  if (a.exames.length) {
    t += "\n## Exames laboratoriais\n";
    for (const e of a.exames)
      t += `- ${e.exame}: ${e.resultado} ${e.unidade} | ref: ${e.referencia} | ${e.status}\n`;
  }
  t += li("Observações sobre os exames", a.observacoesExames);

  return t;
}
