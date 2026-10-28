import type { Assessment, Refeicao } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

const refeicoesIniciais: Refeicao[] = ([
  ["Desjejum", "07:00"],
  ["Lanche da manhã", "10:00"],
  ["Almoço", "12:00"],
  ["Lanche da tarde", "15:00"],
  ["Jantar", "20:00"],
  ["Ceia", "22:00"],
] as const).map(([refeicao, horario]) => ({
  id: uid(),
  refeicao,
  horario,
  local: "",
  alimentos: [{ id: uid(), alimento: "", quantidade: "" }],
}));

export const novoId = uid;

export function createEmptyAssessment(): Assessment {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
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
    etilismoQuantidade: "",
    etilismoFrequencia: "",
    tabagismoQuantidade: "",
    tabagismoFrequencia: "",
    drogasDescricao: "",

    funcaoEstomacal: [],
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
    praticaAtividadeFisica: "",
    cozinhaTrabalho: "",

    modalidades: [],

    quemPrepara: "",
    quemPreparaOutra: "",
    comeFora: "",
    comeForaFrequencia: "",
    comeForaDias: "",
    consomeFritos: "",
    fritosFrequencia: "",

    horariosFome: [],
    observacoesFome: "",
    habitoBeliscar: "",
    beliscarDescricao: "",

    usaSuplemento: "",
    observacaoSuplemento: "",
    suplementos: [],
    aceitaWhey: "",

    prefVegetais: [],
    prefFrutas: [],
    prefLeguminosas: [],
    prefLacteos: [],
    prefCafeCha: [],
    acucarAdocante: "",
    prefProteinas: [],
    prefCarboidratos: [],
    prefCereais: [],
    prefGorduras: [],
    prefDoces: [],
    aversoes: "",
    observacoesPreferencias: {},
    observacoesRecordatorio: "",

    diarioAlimentar: refeicoesIniciais,

    tempoAlimentacaoAtual: "",
    alturaReferida: "",
    pesoReferido: "",
    evolucaoPeso: "",
    observacoesEvolucao: "",

    altura: "",
    alturaUnidade: "m",
    peso: "",
    percentualGordura: "",
    metodoGordura: "",
    dataAvaliacaoAntropometrica: hoje,

    indicadoresAntropometricos: [],
    exames: [],

    metodoTMB: "harris-benedict",
    fatorAtividade: "",
    estrategia: "normocalorica",
    tipoAjuste: "percentual",
    percentualAjuste: "",
    kcalAjuste: "",
    caloriasManuais: "",
    refeicoesLivresSemana: "",
    vetRefeicoesLivres: "",
  };
}

export const ETAPAS = [
  { id: 1, titulo: "Dados", nomeCompleto: "Dados básicos e Anamnese" },
  { id: 2, titulo: "Rotina", nomeCompleto: "Rotina, Treino e Alimentação" },
  { id: 3, titulo: "Avaliação", nomeCompleto: "Antropometria e Exames Laboratoriais" },
  { id: 4, titulo: "Energia", nomeCompleto: "Cálculos energéticos" },
  { id: 5, titulo: "Relatório", nomeCompleto: "Relatórios" },
] as const;
