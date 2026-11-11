import { createEmptyAssessment, novoId } from "./initial-state";
import type { Assessment, Refeicao } from "./types";

const refeicao = (nome: string, horario: string, local: string, itens: [string, string][]): Refeicao => ({
  id: novoId(),
  refeicao: nome,
  horario,
  local,
  alimentos: itens.map(([alimento, quantidade]) => ({ id: novoId(), alimento, quantidade })),
});

/** Paciente fictício usado pelo botão "Preencher Exemplo". */
export function createExampleAssessment(): Assessment {
  const base = createEmptyAssessment();
  return {
    ...base,
    nome: "Kamilla Cristina Salgado Bilinski",
    dataNascimento: "1988-05-12",
    sexo: "feminino",
    profissao: "Professora",
    jaFezDieta: "sim",
    objetivos: ["Emagrecimento"],
    incomodoFisico: "Acúmulo de gordura abdominal",
    pesoDesejado: "63",
    maiorDificuldade: "Beliscar à tarde e excessos no fim de semana",
    motivacao: "8",
    faltaParaDez: "Organização da rotina alimentar",
    historicoPeso: "Infância: peso adequado\nAdolescência: leve sobrepeso\nVida adulta: ganho de 12 kg após os 30 anos",
    hma: "Cansaço frequente e distensão abdominal",
    hmp: "Sem doenças crônicas relatadas",
    hmf: "Mãe com diabetes tipo 2; pai hipertenso",
    medicamentos: [{ id: novoId(), nome: "Anticoncepcional oral", dose: "1 comp", acao: "Contraceptivo" }],
    possuiExames: "sim",
    planoSaude: "sim",
    observacoesExames: "Exames de rotina de 3 meses atrás",
    alergia: "nao",
    restricaoAlimentar: "nao",
    eaas: "nao",
    habitosSociais: ["Etilista"],
    etilismoQuantidade: "2 taças de vinho",
    etilismoFrequencia: "1x/mês",
    funcaoEstomacal: ["Flatulência excessiva"],
    frequenciaEvacuacao: "1 vez por dia",
    bristol: "B3",
    consumoAgua: "1,5 L/dia",
    armstrong: "A3",
    horaDormir: "23:30",
    horaAcordar: "06:30",
    qualidadeSono: "Moderada",
    entradaTrabalho: "08:00",
    saidaTrabalho: "17:00",
    intervaloRefeicoes: "sim",
    intervaloRefeicoesHorarios: "12:00 às 13:00",
    cozinhaTrabalho: "sim",
    praticaAtividadeFisica: "sim",
    modalidades: [{
      id: novoId(), modalidade: "Musculação", tempoPratica: "6 meses", horario: "18:30", duracao: "60 min",
      frequenciaSemanal: "3", diasSemana: "Segunda, Quarta, Sexta", diasDescanso: "Terça, Quinta, Sábado, Domingo",
      nota: "7", justificativa: "Gosta, mas falta constância",
    }],
    quemPrepara: "propria",
    comeFora: "sim",
    comeForaFrequencia: "2x/semana",
    comeForaDias: "Sábado e domingo",
    consomeFritos: "sim",
    fritosFrequencia: "1-2x/semana",
    horariosFome: ["Tarde"],
    observacoesFome: "Vontade de doce após o almoço",
    habitoBeliscar: "sim",
    beliscarDescricao: "Biscoitos no trabalho",
    usaSuplemento: "sim",
    suplementos: [{ id: novoId(), nome: "Creatina", dose: "3 g", horario: "Manhã", frequencia: "Diária", observacoes: "" }],
    aceitaWhey: "sim",
    prefVegetais: ["Alface", "Tomate", "Cenoura", "Brócolis", "Abobrinha"],
    prefFrutas: ["Banana", "Maçã", "Mamão", "Morango"],
    prefLeguminosas: ["Feijão", "Lentilha"],
    prefLacteos: ["Iogurte", "Queijo"],
    prefCafeCha: ["Café com leite", "Chá"],
    acucarAdocante: "Adoçante",
    prefProteinas: ["Frango", "Ovos", "Peixe", "Bovina"],
    prefCarboidratos: ["Arroz", "Batata-doce", "Pão", "Tapioca"],
    prefCereais: ["Aveia", "Chia"],
    prefGorduras: ["Azeite de Oliva", "Oleaginosas"],
    prefDoces: ["Chocolate"],
    aversoes: "Fígado",
    diarioAlimentar: [
      refeicao("Desjejum", "07:00", "Casa", [["Pão francês", "1 unidade"], ["Ovo mexido", "2 unidades"], ["Café com leite", "200 ml"]]),
      refeicao("Lanche da manhã", "10:00", "Trabalho", [["Banana", "1 unidade"]]),
      refeicao("Almoço", "12:00", "Restaurante", [["Arroz branco", "4 colheres de sopa"], ["Feijão", "1 concha"], ["Frango grelhado", "120 g"], ["Salada de alface e tomate", "1 prato"]]),
      refeicao("Lanche da tarde", "15:30", "Trabalho", [["Biscoito recheado", "4 unidades"], ["Café", "50 ml"]]),
      refeicao("Jantar", "20:00", "Casa", [["Arroz branco", "3 colheres de sopa"], ["Carne moída", "100 g"], ["Brócolis cozido", "3 colheres de sopa"]]),
      refeicao("Ceia", "22:00", "Casa", [["Iogurte natural", "170 g"]]),
    ],
    tempoAlimentacaoAtual: "2 anos",
    alturaReferida: "1,60",
    pesoReferido: "74",
    evolucaoPeso: "Ganhando peso",
    altura: "1.65",
    alturaUnidade: "m",
    peso: "82",
    percentualGordura: "34",
    metodoGordura: "Bioimpedância",
    fatorAtividade: "1.5",
    estrategia: "deficit",
    tipoAjuste: "percentual",
    percentualAjuste: "20",
    refeicoesLivresSemana: "1",
  };
}

/** Recordatório independente para o dia atípico da paciente de exemplo. */
export function createExampleAtypicalDay(): Refeicao[] {
  return createExampleAssessment().diarioAlimentar.map((meal) =>
    meal.refeicao === "Jantar"
      ? refeicao("Jantar", meal.horario, meal.local, [["Pizza", "3 fatias"], ["Coca Cola", "1 lata"]])
      : meal,
  );
}

/** Segundo paciente fictício: preenchido no segundo clique de "Preencher Exemplo". */
export function createExampleAssessmentAllan(): Assessment {
  const base = createEmptyAssessment();
  return {
    ...base,
    nome: "Allan Pinheiro Bilinski",
    dataNascimento: "1987-03-14",
    sexo: "masculino",
    profissao: "Analista de TI",
    jaFezDieta: "nao",
    objetivos: ["Hipertrofia"],
    incomodoFisico: "Braços e peito com pouca massa muscular",
    pesoDesejado: "",
    maiorDificuldade: "Lembrar de comer no meio da tarde e manter o volume de treino",
    motivacao: "9",
    faltaParaDez: "Dormir mais cedo e planejar as refeições da semana",
    historicoPeso: "Infância: peso adequado\nAdolescência: ganho de massa com o futebol\nVida adulta: oscila 3 a 4 kg e ganha dificuldade para ganhar peso",
    hma: "Cansaço no fim da tarde e sonolência após o almoço",
    hmp: "Sem doenças crônicas relatadas; dor lombar leve em treino pesado",
    hmf: "Pai com dislipidemia; mãe com hipotireoidismo",
    medicamentos: [],
    possuiExames: "sim",
    planoSaude: "sim",
    observacoesExames: "Exames de rotina de 6 meses atrás",
    alergia: "nao",
    restricaoAlimentar: "nao",
    eaas: "nao",
    habitosSociais: ["Etilista"],
    etilismoQuantidade: "2 chopes",
    etilismoFrequencia: "1x/semana",
    funcaoEstomacal: ["Normal"],
    frequenciaEvacuacao: "1 a 2 vezes por dia",
    bristol: "B4",
    consumoAgua: "3 L/dia",
    armstrong: "A3",
    horaDormir: "00:00",
    horaAcordar: "07:00",
    qualidadeSono: "Moderada",
    entradaTrabalho: "09:00",
    saidaTrabalho: "18:00",
    intervaloRefeicoes: "sim",
    intervaloRefeicoesHorarios: "12:00 às 13:00",
    cozinhaTrabalho: "sim",
    praticaAtividadeFisica: "sim",
    modalidades: [{
      id: novoId(), modalidade: "Musculação", tempoPratica: "2 anos", horario: "19:00", duracao: "75 min",
      frequenciaSemanal: "4", diasSemana: "Segunda, Terça, Quinta, Sexta", diasDescanso: "Quarta, Sábado, Domingo",
      nota: "8", justificativa: "Gosta do treino, mas a rotina de trabalho atrapalha",
    }],
    quemPrepara: "propria",
    comeFora: "sim",
    comeForaFrequencia: "2x/semana",
    comeForaDias: "Quarta e sábado",
    consomeFritos: "as-vezes",
    fritosFrequencia: "1x/semana",
    horariosFome: ["Manhã", "Noite"],
    observacoesFome: "Fome maior à noite, depois do treino",
    habitoBeliscar: "nao",
    beliscarDescricao: "",
    usaSuplemento: "sim",
    suplementos: [
      { id: novoId(), nome: "Creatina", dose: "5 g", horario: "Manhã", frequencia: "Diária", observacoes: "" },
      { id: novoId(), nome: "Whey protein", dose: "30 g", horario: "Pós-treino", frequencia: "Diária", observacoes: "" },
    ],
    aceitaWhey: "sim",
    prefVegetais: ["Alface", "Tomate", "Cenoura", "Brócolis", "Abobrinha"],
    prefFrutas: ["Banana", "Maçã", "Mamão", "Uva"],
    prefLeguminosas: ["Feijão", "Lentilha"],
    prefLacteos: ["Leite", "Iogurte", "Queijo"],
    prefCafeCha: ["Café com leite", "Café puro", "Chá"],
    acucarAdocante: "Açúcar",
    prefProteinas: ["Bovina", "Frango", "Peixe", "Ovos"],
    prefCarboidratos: ["Arroz", "Batata-doce", "Pão", "Tapioca", "Macarrão"],
    prefCereais: ["Aveia", "Chia"],
    prefGorduras: ["Azeite de Oliva", "Oleaginosas"],
    prefDoces: ["Pasta de Amendoim", "Chocolate"],
    aversoes: "Fígado",
    diarioAlimentar: [
      refeicao("Desjejum", "07:00", "Casa", [["Pão francês", "2 unidades"], ["Ovos mexidos", "4 unidades"], ["Café com leite", "300 ml"]]),
      refeicao("Lanche da manhã", "10:00", "Trabalho", [["Iogurte grego", "170 g"], ["Aveia", "30 g"], ["Banana", "1 unidade"]]),
      refeicao("Almoço", "12:30", "Restaurante", [["Arroz branco", "6 colheres de sopa"], ["Feijão", "2 conchas"], ["Peito de frango grelhado", "180 g"], ["Batata-doce", "150 g"], ["Salada de alface, tomate e cenoura", "1 prato"], ["Azeite de oliva", "1 colher de sopa"]]),
      refeicao("Lanche da tarde", "16:00", "Trabalho", [["Tapioca", "100 g"], ["Ovos mexidos", "2 unidades"], ["Café puro", "50 ml"]]),
      refeicao("Jantar", "20:00", "Casa", [["Arroz branco", "5 colheres de sopa"], ["Patinho grelhado", "150 g"], ["Feijão", "1 concha"], ["Legumes refogados", "1 prato"], ["Azeite de oliva", "1 colher de sopa"]]),
      refeicao("Ceia", "22:30", "Casa", [["Iogurte natural", "170 g"], ["Pasta de amendoim", "15 g"]]),
    ],
    tempoAlimentacaoAtual: "1 ano",
    alturaReferida: "1,82",
    pesoReferido: "79",
    evolucaoPeso: "Mantendo peso",
    altura: "1.82",
    alturaUnidade: "m",
    peso: "79",
    percentualGordura: "18",
    metodoGordura: "Bioimpedância",
    fatorAtividade: "1.7",
    estrategia: "superavit",
    tipoAjuste: "percentual",
    percentualAjuste: "10",
    refeicoesLivresSemana: "",
    vetRefeicoesLivres: "",
  };
}

/** Recordatório independente para o dia atípico do segundo paciente de exemplo. */
export function createExampleAtypicalDayAllan(): Refeicao[] {
  return createExampleAssessmentAllan().diarioAlimentar.map((meal) =>
    meal.refeicao === "Jantar"
      ? refeicao("Jantar", meal.horario, "Casa", [["Picanha", "200 g"], ["Pão de alho", "3 unidades"], ["Cerveja", "3 latas"]])
      : meal,
  );
}

export interface ExemploClinico {
  criar: () => Assessment;
  criarDiaAtipico: () => Refeicao[];
}

/** Pacientes fictícios disponíveis em "Preencher Exemplo", na ordem de uso. */
export const EXEMPLOS_CLINICOS: ExemploClinico[] = [
  { criar: createExampleAssessment, criarDiaAtipico: createExampleAtypicalDay },
  { criar: createExampleAssessmentAllan, criarDiaAtipico: createExampleAtypicalDayAllan },
];

/** Índice do próximo paciente fictício: o botão alterna entre eles a cada clique. */
export function proximoExemploClinico(atual: number): number {
  return (atual + 1) % EXEMPLOS_CLINICOS.length;
}
