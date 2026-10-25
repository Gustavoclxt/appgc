import { alturaEmCm, fmt2, fmtData, parseNumero, type DerivedResults } from "./calculations";
import { pesoAntropometricoParaResumo } from "./anthropometry-groups";
import type { Assessment } from "./types";

export const PATIENT_REPORT_FINAL_MESSAGE = "Vamos construir sua evolução passo a passo, com estratégias adaptadas à sua rotina e ajustes conforme sua resposta ao tratamento.";
export const PATIENT_BLOCKS = ["A", "B", "C", "D"] as const;
export type PatientBlock = typeof PATIENT_BLOCKS[number];
export const PATIENT_TITLES: Record<PatientBlock, string> = {
  A: "Momento atual", B: "O que merece nossa atenção?", C: "Nossas três prioridades", D: "O que vamos acompanhar?",
};
export interface PatientItem { titulo: string; texto: string; acao?: string; acompanhamento?: string }
export interface PatientSection { chave: string; itens: PatientItem[]; editado: boolean }
export interface PatientProgress { blocos: Partial<Record<PatientBlock, PatientSection>> }
export const newPatientProgress = (): PatientProgress => ({ blocos: {} });

export function patientFilename(nome: string) {
  if (!nome.trim()) throw new Error("Informe o nome completo do paciente antes de exportar.");
  return `Relatório do Paciente - ${nome.trim().replace(/[\\/:*?"<>|\r\n]/g, " ")}.pdf`;
}

export function patientReviewWarnings(a: Assessment, d: DerivedResults): string[] {
  const avisos: string[] = [];
  const peso = pesoAntropometricoParaResumo(a);
  const referido = parseNumero(a.pesoReferido);
  if (referido !== null && peso !== null && Math.abs(referido - peso) > 0.01) avisos.push("Peso referido e peso aferido divergem. Confirmar os valores com o nutricionista.");
  if (peso !== null && d.pesoKg !== null && Math.abs(peso - d.pesoKg) > 0.01) avisos.push("O peso anexado difere do peso usado nos cálculos. Revisar a antropometria antes de interpretar a composição corporal.");
  const altura = alturaEmCm(a.alturaReferida, "m");
  if (altura !== null && d.alturaCm !== null && Math.abs(altura - d.alturaCm) > 0.01) avisos.push("Estatura referida e aferida divergem. Confirmar com o nutricionista.");
  const desejado = parseNumero(a.pesoDesejado);
  if (peso !== null && desejado !== null && ((a.objetivos.includes("Emagrecimento") && desejado >= peso) || (a.estrategia === "superavit" && desejado < peso))) avisos.push("Confirmar a coerência entre objetivo, peso desejado e estratégia com o nutricionista.");
  if (peso === null || peso <= 0) avisos.push("Peso atual não disponível ou inválido: revisar antes de definir metas de peso.");
  if (d.percentualGordura !== null && (d.percentualGordura <= 0 || d.percentualGordura >= 100)) avisos.push("Percentual de gordura inválido: revisar a avaliação.");
  return avisos;
}

function candidates(a: Assessment) {
  const itens: PatientItem[] = [];
  if (a.alergia === "sim") itens.push({ titulo: "Segurança alimentar", texto: a.alergiaDescricao ? `Alergia/intolerância informada: ${a.alergiaDescricao}` : "Alergia/intolerância informada, ainda sem descrição.", acao: "Confirmar os alimentos envolvidos e revisar rótulos e opções com o nutricionista.", acompanhamento: "Registro de exposições e sintomas relatados." });
  const exames = a.exames.filter(e => e.status === "acima" || e.status === "abaixo");
  if (exames.length) itens.push({ titulo: "Exames laboratoriais", texto: exames.map(e => `${e.exame}: ${e.resultado} ${e.unidade} (${e.status} da referência informada)`).join("; "), acao: "Revisar os resultados com o nutricionista e avaliar a necessidade de acompanhamento médico.", acompanhamento: "Resultados dos exames e orientação da equipe assistente." });
  if (a.maiorDificuldade.trim()) itens.push({ titulo: "Adesão à rotina", texto: `Dificuldade informada: ${a.maiorDificuldade}`, acao: "Combinar com o nutricionista uma adaptação viável para essa dificuldade.", acompanhamento: "Dificuldades encontradas e estratégias que foram possíveis na rotina." });
  if (a.funcaoEstomacal.some(v => !/^(normal|nenhum|nenhuma)$/i.test(v))) itens.push({ titulo: "Conforto digestivo", texto: `Relato: ${a.funcaoEstomacal.join(", ")}`, acao: "Registrar sintomas e refeições associadas para revisão, sem excluir alimentos por conta própria.", acompanhamento: "Sintomas, frequência de evacuação e padrão das fezes relatados." });
  if (a.consumoAgua.trim()) itens.push({ titulo: "Hidratação", texto: `Consumo informado: ${a.consumoAgua}`, acao: "Registrar o consumo de água ao longo da rotina e revisar a adequação com o nutricionista.", acompanhamento: "Consumo diário registrado e percepção de hidratação." });
  if (a.qualidadeSono.trim() || (a.horaDormir && a.horaAcordar)) itens.push({ titulo: "Sono e recuperação", texto: [a.qualidadeSono, a.horaDormir && `Dorme às ${a.horaDormir}`, a.horaAcordar && `Acorda às ${a.horaAcordar}`].filter(Boolean).join(" · "), acao: "Observar os horários e a qualidade do sono na rotina para discutir possíveis ajustes.", acompanhamento: "Horários de sono e qualidade percebida." });
  if (a.habitoBeliscar === "sim") itens.push({ titulo: "Fome e alimentação", texto: `Beliscos relatados${a.beliscarDescricao ? `: ${a.beliscarDescricao}` : "."}`, acao: "Registrar os momentos de fome e os beliscos para revisar a organização das refeições.", acompanhamento: "Horários de fome e episódios de beliscar relatados." });
  if (a.diarioAlimentar.some(r => r.alimentos.some(i => i.alimento.trim()))) itens.push({ titulo: "Organização das refeições", texto: "Recordatório alimentar registrado na avaliação.", acao: "Revisar as refeições registradas com o nutricionista, respeitando preferências e rotina.", acompanhamento: "Refeições realizadas e dificuldades para seguir os ajustes combinados." });
  return itens;
}

export function buildPatientBlock(bloco: PatientBlock, a: Assessment, d: DerivedResults): PatientItem[] {
  const peso = pesoAntropometricoParaResumo(a);
  const validWeight = peso !== null && peso > 0;
  const avisos = patientReviewWarnings(a, d);
  if (bloco === "A") {
    const itens: PatientItem[] = [];
    if (validWeight) itens.push({ titulo: "Peso atual", texto: `${fmt2(peso)} kg · Referência desta avaliação para acompanhar sua evolução.` });
    const gorduraValida = d.percentualGordura !== null && d.percentualGordura > 0 && d.percentualGordura < 100;
    if (gorduraValida) itens.push({ titulo: "Gordura corporal", texto: `${fmt2(d.percentualGordura)}% · Estimativa pelo método ${a.metodoGordura || "não informado; confirmar com o nutricionista"}.` });
    if (!avisos.length && gorduraValida && validWeight) {
      if (d.massaGorda !== null) itens.push({ titulo: "Massa de gordura", texto: `${fmt2(d.massaGorda)} kg · Parcela estimada do peso composta por gordura.` });
      if (d.massaLivreGordura !== null) itens.push({ titulo: "Massa livre de gordura", texto: `${fmt2(d.massaLivreGordura)} kg · Inclui músculos, água, ossos e outros tecidos.` });
    }
    return itens.slice(0, 4);
  }
  if (bloco === "B") return [...avisos.map(texto => ({ titulo: "Confirmar informações", texto })), ...candidates(a).map(({ titulo, texto }) => ({ titulo, texto }))].slice(0, 3);
  if (bloco === "C") return candidates(a).slice(0, 3);
  const indicadores: PatientItem[] = [];
  if (validWeight && a.objetivos.length && !avisos.length) indicadores.push({ titulo: "Evolução antropométrica", texto: `Peso atual: ${fmt2(peso)} kg. Comparar avaliações realizadas pelo mesmo método, considerando o objetivo: ${a.objetivos.join(", ")}.` });
  for (const item of candidates(a)) if (item.acompanhamento) indicadores.push({ titulo: item.titulo, texto: item.acompanhamento });
  return indicadores.slice(0, 4);
}

export function patientBlockKeys(a: Assessment, d: DerivedResults): Record<PatientBlock, string> {
  return Object.fromEntries(PATIENT_BLOCKS.map(b => [b, JSON.stringify(buildPatientBlock(b, a, d))])) as Record<PatientBlock, string>;
}
export function pendingPatientBlocks(progresso: PatientProgress, chaves: Record<PatientBlock, string>) {
  return PATIENT_BLOCKS.filter(b => progresso.blocos[b]?.chave !== chaves[b]);
}

/** Checkpoint each completed block; preserve edited blocks when new inputs arrive. */
export async function resumePatientReport(
  progresso: PatientProgress, chaves: Record<PatientBlock, string>,
  produzir: (b: PatientBlock) => PatientItem[] | Promise<PatientItem[]>,
  checkpoint: (p: PatientProgress) => void,
) {
  let atual = progresso;
  for (const b of pendingPatientBlocks(atual, chaves)) {
    const anterior = atual.blocos[b];
    const itens = anterior?.editado ? anterior.itens : await produzir(b);
    atual = { blocos: { ...atual.blocos, [b]: { chave: chaves[b], itens, editado: anterior?.editado ?? false } } };
    checkpoint(atual);
  }
  return atual;
}

export function patientHeader(a: Assessment) {
  return { nome: a.nome.trim(), data: fmtData(a.dataAvaliacao), objetivo: a.objetivos.join(", ") };
}