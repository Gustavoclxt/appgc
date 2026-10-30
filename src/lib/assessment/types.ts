export type Sexo = "masculino" | "feminino";

export interface Medicamento {
  id: string;
  nome: string;
  dose: string;
  acao: string;
}

export interface Modalidade {
  id: string;
  modalidade: string;
  tempoPratica: string;
  horario: string;
  duracao: string;
  frequenciaSemanal: string;
  diasSemana: string;
  diasDescanso: string;
  nota: string;
  justificativa: string;
}

export interface Suplemento {
  id: string;
  nome: string;
  dose: string;
  horario: string;
  frequencia: string;
  observacoes: string;
}

export interface AlimentoDiario {
  id: string;
  alimento: string;
  quantidade: string;
}

export interface Refeicao {
  id: string;
  refeicao: string;
  horario: string;
  local: string;
  alimentos: AlimentoDiario[];
}

export interface ExameLaboratorial {
  id: string;
  exame: string;
  resultado: string;
  unidade: string;
  referencia: string;
  data?: string;
  status: "dentro" | "abaixo" | "acima" | "indeterminado";
}

export interface IndicadorAntropometrico {
  id: string;
  nome: string;
  valor: string;
  unidade: string;
  data: string;
}

export type MetodoTMB = "harris-benedict" | "mifflin" | "tinsley-pc" | "tinsley-mlg";
export type EstrategiaEnergetica = "deficit" | "normocalorica" | "superavit";

export interface Assessment {
  // 1. Dados básicos
  nome: string;
  dataNascimento: string;
  sexo: Sexo | "";
  dataAvaliacao: string;

  // 2. Anamnese — informações gerais
  profissao: string;
  jaFezDieta: "sim" | "nao" | "";
  objetivos: string[];
  incomodoFisico: string;
  pesoDesejado: string;
  maiorDificuldade: string;
  motivacao: string;
  faltaParaDez: string;

  // Histórico clínico
  historicoPeso: string;
  hma: string;
  hmp: string;
  hmf: string;

  medicamentos: Medicamento[];

  // Exames bioquímicos
  possuiExames: "sim" | "nao" | "";
  planoSaude: "sim" | "nao" | "";
  observacoesExames: string;

  // Alergias e restrições
  alergia: "sim" | "nao" | "";
  alergiaDescricao: string;
  restricaoAlimentar: "nao" | "vegetariano" | "vegano" | "";

  // EAAs
  eaas: "sim" | "nao" | "";
  eaasDescricao: string;

  habitosSociais: string[];
  etilismoQuantidade: string;
  etilismoFrequencia: string;
  tabagismoQuantidade: string;
  tabagismoFrequencia: string;
  drogasDescricao: string;

  // Revisão de sistemas
  funcaoEstomacal: string[];
  frequenciaEvacuacao: string;
  bristol: string;
  consumoAgua: string;
  armstrong: string;

  // Sono
  horaDormir: string;
  horaAcordar: string;
  qualidadeSono: string;

  // 3. Rotina de trabalho
  entradaTrabalho: string;
  saidaTrabalho: string;
  intervaloRefeicoes: "sim" | "nao" | "";
  intervaloRefeicoesHorarios: string;
  praticaAtividadeFisica: "sim" | "nao" | "";
  cozinhaTrabalho: "sim" | "nao" | "";

  modalidades: Modalidade[];

  // Rotina alimentar
  quemPrepara: "propria" | "outra" | "";
  quemPreparaOutra: string;
  comeFora: "sim" | "nao" | "";
  comeForaFrequencia: string;
  comeForaDias: string;
  consomeFritos: "sim" | "as-vezes" | "nao" | "";
  fritosFrequencia: string;

  // Fome e apetite
  horariosFome: string[];
  observacoesFome: string;
  habitoBeliscar: "sim" | "nao" | "";
  beliscarDescricao: string;

  // Suplementação
  usaSuplemento: "sim" | "nao" | "";
  observacaoSuplemento: string;
  suplementos: Suplemento[];
  aceitaWhey: "sim" | "nao" | "";

  // Preferências e aversões
  prefVegetais: string[];
  prefFrutas: string[];
  prefLeguminosas: string[];
  prefLacteos: string[];
  prefCafeCha: string[];
  acucarAdocante: string;
  prefProteinas: string[];
  prefCarboidratos: string[];
  prefCereais: string[];
  prefGorduras: string[];
  prefDoces: string[];
  aversoes: string;
  observacoesPreferencias: Record<string, string>;
  observacoesRecordatorio: string;

  diarioAlimentar: Refeicao[];

  // Evolução do peso
  tempoAlimentacaoAtual: string;
  alturaReferida: string;
  pesoReferido: string;
  evolucaoPeso: string;
  observacoesEvolucao: string;

  // 4. Antropometria
  altura: string;
  alturaUnidade: "cm" | "m";
  peso: string;
  percentualGordura: string;
  metodoGordura: string;
  dataAvaliacaoAntropometrica: string;
  indicadoresAntropometricos: IndicadorAntropometrico[];

  // 5. Exames laboratoriais
  exames: ExameLaboratorial[];

  // 6. Cálculos energéticos
  metodoTMB: MetodoTMB;
  fatorAtividade: string;
  estrategia: EstrategiaEnergetica;
  tipoAjuste: "percentual" | "kcal";
  percentualAjuste: string;
  kcalAjuste: string;
  caloriasManuais: string;
  refeicoesLivresSemana: string;
  vetRefeicoesLivres: string;
}

export type PrioridadeIntervencao = "alta" | "moderada" | "baixa";

export interface IntervencaoIA {
  categoria: string;
  prioridade: PrioridadeIntervencao;
  problema: string;
  acoes: string[];
  justificativa: string;
}

export interface ItemResumoClinico {
  label: string;
  valor: string;
}

export interface GrupoEstrategiaClinica {
  categoria: string;
  acoes: string[];
}

export interface AnaliseIA {
  resumoClinico: ItemResumoClinico[];
  achados: {
    prioridade: string[];
    monitorar: string[];
    favoraveis: string[];
  };
  estrategiaInicial: GrupoEstrategiaClinica[];
  focoProximoRetorno: string[];
  reavaliarRetorno: string[];
}
