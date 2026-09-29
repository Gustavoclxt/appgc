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

    historicoPeso: "",
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

    prefVegetais: "",
    prefFrutas: "",
    prefLacteos: "",
    prefCafeCha: "",
    acucarAdocante: "",
    aceitaCafeComLeite: "",
    prefProteinas: "",
    prefCarboidratos: "",
    prefCereais: "",
    prefGorduras: "",
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

    metodoTMB: "mifflin",
    fatorAtividade: "",
    estrategia: "normocalorica",
    percentualAjuste: "",
    caloriasManuais: "",
  };
}

export const ETAPAS = [
  { id: 1, titulo: "Dados", nomeCompleto: "Dados básicos" },
  { id: 2, titulo: "Anamnese", nomeCompleto: "Anamnese de 1ª consulta" },
  { id: 3, titulo: "Rotina", nomeCompleto: "Rotina, treino e alimentação" },
  { id: 4, titulo: "Antropometria", nomeCompleto: "Antropometria & resultados calculados" },
  { id: 5, titulo: "Exames", nomeCompleto: "Exames laboratoriais" },
  { id: 6, titulo: "Energia", nomeCompleto: "Cálculos energéticos" },
  { id: 7, titulo: "Resultado", nomeCompleto: "Relatório da avaliação" },
  { id: 8, titulo: "PDF", nomeCompleto: "Gerar PDF" },
] as const;
