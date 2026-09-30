import type { Assessment, Refeicao } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

const refeicoesIniciais: Refeicao[] = [
  "Desjejum",
  "Lanche da manhã",
  "Almoço",
  "Lanche da tarde",
  "Jantar",
  "Ceia",
].map((refeicao) => ({
  id: uid(),
  refeicao,
  horario: "",
  local: "",
  alimentos: [{ id: uid(), alimento: "", quantidade: "" }],
}));

export const novoId = uid;

export function createEmptyAssessment(): Assessment {
  const hoje = new Date().toISOString().slice(0, 10);
  return {
    nome: "",
    dataNascimento: "",
    sexo: "",
    dataAvaliacao: hoje,

    profissao: "",
    jaFezDieta: "",
    objetivos: [],
    incomodoFisico: "",
    pesoDesejado: "",
    maiorDificuldade: "",
    motivacao: "",
    faltaParaDez: "",

    historicoPeso: "Infância:\nAdolescência:\nVida adulta:",
    hma: "",
    hmp: "",
    hmf: "",

    medicamentos: [],

    possuiExames: "",
    planoSaude: "",
    observacoesExames: "",

    alergia: "",
    alergiaDescricao: "",
    restricaoAlimentar: "",

    eaas: "",
    eaasDescricao: "",

    habitosSociais: [],

    funcaoEstomacal: "",
    frequenciaEvacuacao: "",
    bristol: "",
    consumoAgua: "",
    armstrong: "",

    horaDormir: "",
    horaAcordar: "",
    qualidadeSono: "",

    entradaTrabalho: "",
    saidaTrabalho: "",
    intervaloRefeicoes: "",
    intervaloRefeicoesHorarios: "",
    cozinhaTrabalho: "",

    modalidades: [],

    quemPrepara: "",
    quemPreparaOutra: "",
    comeFora: "",
    comeForaFrequencia: "",
    comeForaDias: "",

    horariosFome: [],
    horariosFomePersonalizado: "",
    observacoesFome: "",

    usaSuplemento: "",
    suplementos: [],
    aceitaWhey: "",

    prefVegetais: [],
    prefFrutas: "",
    prefLacteos: [],
    prefCafeCha: "",
    acucarAdocante: "",
    aceitaCafeComLeite: "",
    prefProteinas: [],
    prefCarboidratos: [],
    prefCereais: "",
    prefGorduras: [],
    prefDoces: "",
    aversoes: "",

    diarioAlimentar: refeicoesIniciais,

    tempoAlimentacaoAtual: "",
    evolucaoPeso: "",
    observacoesEvolucao: "",

    altura: "",
    alturaUnidade: "cm",
    peso: "",
    percentualGordura: "",
    metodoGordura: "",
    dataAvaliacaoAntropometrica: hoje,

    exames: [],

    metodoTMB: "harris-benedict",
    fatorAtividade: "",
    estrategia: "normocalorica",
    tipoAjuste: "percentual",
    percentualAjuste: "",
    kcalAjuste: "",
    caloriasManuais: "",
  };
}

export const ETAPAS = [
  { id: 1, titulo: "Dados", nomeCompleto: "Dados básicos e anamnese" },
  { id: 2, titulo: "Rotina", nomeCompleto: "Rotina, treino e alimentação" },
  { id: 3, titulo: "Antropometria", nomeCompleto: "Antropometria & resultados calculados" },
  { id: 4, titulo: "Exames", nomeCompleto: "Exames laboratoriais" },
  { id: 5, titulo: "Energia", nomeCompleto: "Cálculos energéticos" },
  { id: 6, titulo: "Relatório", nomeCompleto: "Relatório da avaliação e PDF" },
] as const;
