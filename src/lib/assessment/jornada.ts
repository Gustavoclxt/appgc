import { calculateBMI, fmt2, fmtData, fmtInt, parseNumero, type DerivedResults } from "./calculations";
import { valorComUnidade } from "./anthropometry-groups";
import { lerLitrosAgua, formatarLitros as litrosBase } from "./hydration";
const formatarLitros = (l: number) => `${litrosBase(l).replace(/\s*L$/i, "")} L`;
import type { Assessment, ExameLaboratorial, IndicadorAntropometrico } from "./types";
import type { MetasPesoResultado } from "./weight-goals";
import { pesoNoDia } from "./weight-projection";

/**
 * Jornada de Recomposição Corporal: relatório resumido para o paciente.
 * Construído uma única vez aqui para que tela e PDF exibam exatamente o mesmo conteúdo.
 * Usa apenas dados já cadastrados; ausências viram "Não informado".
 */

export const NI = "Não informado";
export type Tom = "ok" | "moderado" | "atencao" | "neutro";
export type Seta = "up" | "down" | "igual" | null;

export interface LinhaJornada {
  rotulo: string;
  valor: string;
  detalhe?: string | undefined;
  tom?: Tom | undefined;
  seta?: Seta | undefined;
}

export interface CardJornada {
  titulo: string;
  linhas: LinhaJornada[];
  nota?: string;
}

export interface ExameJornada {
  marcador: string;
  inicial: string;
  referencia: string;
  tom: Tom;
  status: string;
  alvo: string;
  diferenca: string;
  seta: Seta;
}

export interface Jornada {
  titulo: string;
  nome: string;
  data: string;
  // Tabela de exames mostra apenas marcadores alterados (acima/abaixo da referência).
  // examesOk/examesAvaliados orientam a mensagem quando a lista vem vazia.
  examesOk: boolean;
  examesAvaliados: boolean;
  hoje: { composicao: CardJornada; exames: ExameJornada[]; habitos: CardJornada; atividade: CardJornada };
  caminho: { projecao: CardJornada; habitos: CardJornada; atividade: CardJornada };
  destino: { composicao: CardJornada; exames: ExameJornada[]; habitos: CardJornada };
  aviso: string;
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const fN = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const f1 = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ---------- Antropometria ----------
function indicador(a: Assessment, teste: (n: string) => boolean): IndicadorAntropometrico | null {
  const lista = a.indicadoresAntropometricos.filter((i) => teste(norm(i.nome)));
  if (lista.length === 0) return null;
  return [...lista].sort((x, y) => (Date.parse(y.data) || 0) - (Date.parse(x.data) || 0))[0]!;
}
const ehVisceral = (n: string) => n.includes("visceral");
const ehCintura = (n: string) => n.includes("cintura") && !n.includes("quadril") && !n.includes("relacao") && !n.includes("rcq");
const ehAbdomen = (n: string) => n.includes("abdom") && !n.includes("dobra") && !n.includes("skinfold");
const mostrar = (i: IndicadorAntropometrico | null) => (i ? valorComUnidade(i, "Circunferências") : NI);
const numInd = (i: IndicadorAntropometrico | null) => (i ? parseNumero(i.valor.replace(/[^\d.,-]/g, "")) : null);

// ---------- Exames ----------
export const MARCADORES_JORNADA: { rotulo: string; aliases: string[]; excluir?: string[] }[] = [
  { rotulo: "Glicose em jejum", aliases: ["glicose", "glicemia"], excluir: ["pos", "curva", "media estimada"] },
  { rotulo: "Insulina em jejum", aliases: ["insulina"], excluir: ["homa", "anticorpo"] },
  { rotulo: "Hemoglobina glicada", aliases: ["hemoglobina glicada", "hba1c", "a1c", "glicohemoglobina"] },
  { rotulo: "Colesterol total", aliases: ["colesterol total"] },
  { rotulo: "HDL", aliases: ["hdl"] },
  { rotulo: "LDL", aliases: ["ldl"] },
  { rotulo: "Triglicerídeos", aliases: ["triglicerideos", "triglicerides", "triglicerídeos", "trigliceris"] },
  { rotulo: "Vitamina D", aliases: ["vitamina d", "25 oh", "hidroxivitamina d", "calcidiol"] },
  { rotulo: "Vitamina B12", aliases: ["b12", "b 12", "cobalamina"] },
  { rotulo: "Ferro", aliases: ["ferro"], excluir: ["ferritina", "capacidade", "saturacao"] },
  { rotulo: "Ferritina", aliases: ["ferritina"] },
  { rotulo: "TSH", aliases: ["tsh", "tireoestimulante"] },
  { rotulo: "T3 livre", aliases: ["t3 livre", "t3l", "triiodotironina livre"] },
  { rotulo: "T4 livre", aliases: ["t4 livre", "t4l", "tiroxina livre"] },
];

export function encontrarExame(exames: ExameLaboratorial[], aliases: string[], excluir: string[] = []) {
  return (
    exames.find((e) => {
      const n = ` ${norm(e.exame)} `;
      return aliases.some((al) => n.includes(` ${norm(al)} `) || n.includes(` ${norm(al)}`)) && !excluir.some((x) => n.includes(norm(x)));
    }) ?? null
  );
}

const statusTexto: Record<ExameLaboratorial["status"], string> = {
  dentro: "Dentro da referência",
  abaixo: "Abaixo da referência",
  acima: "Acima da referência",
  indeterminado: "Sem classificação",
};

function limitesReferencia(ref: string): { min: number | null; max: number | null } {
  const nums = (ref.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => Number(x.replace(",", ".")));
  const r = norm(ref);
  if (nums.length === 0) return { min: null, max: null };
  if (/^(<|ate|inferior|menor)/.test(ref.trim().toLowerCase()) || r.startsWith("ate ") || r.startsWith("inferior") || r.startsWith("menor")) return { min: null, max: nums[0]! };
  if (/^(>|superior|maior|acima)/.test(ref.trim().toLowerCase()) || r.startsWith("superior") || r.startsWith("maior") || r.startsWith("acima")) return { min: nums[0]!, max: null };
  if (nums.length >= 2) return { min: nums[0]!, max: nums[1]! };
  return { min: null, max: null };
}

export function exameJornada(e: ExameLaboratorial | null, rotulo: string): ExameJornada {
  if (!e || !e.resultado.trim()) {
    return { marcador: rotulo, inicial: NI, referencia: NI, tom: "neutro", status: NI, alvo: NI, diferenca: "—", seta: null };
  }
  const un = e.unidade ? ` ${e.unidade}` : "";
  const valor = parseNumero(e.resultado.replace(/[^\d.,-]/g, ""));
  const { min, max } = limitesReferencia(e.referencia);
  const referencia = e.referencia.trim() || NI;
  let alvo = referencia === NI ? NI : `Dentro de ${referencia}`;
  let diferenca = "Conforme evolução clínica";
  let seta: Seta = null;
  let tom: Tom = "ok";
  if (e.status === "dentro") {
    alvo = "Manter dentro da referência";
    diferenca = "Manter";
    seta = "igual";
  } else if (e.status === "acima") {
    tom = "atencao";
    seta = "down";
    if (max !== null) {
      alvo = `≤ ${fN(max)}${un}`;
      if (valor !== null) diferenca = `Reduzir ≈ ${fN(valor - max)}${un}`;
    }
  } else if (e.status === "abaixo") {
    tom = "atencao";
    seta = "up";
    if (min !== null) {
      alvo = `≥ ${fN(min)}${un}`;
      if (valor !== null) diferenca = `Aumentar ≈ ${fN(min - valor)}${un}`;
    }
  }
  return {
    marcador: rotulo,
    inicial: `${e.resultado}${un}`,
    referencia,
    tom,
    status: statusTexto[e.status],
    alvo,
    diferenca,
    seta,
  };
}

// ---------- Hábitos ----------
const ULTRAPROCESSADOS = [
  "refrigerante", "salgadinho", "biscoito recheado", "bolacha recheada", "embutido", "salsicha", "presunto", "mortadela",
  "salame", "nuggets", "miojo", "macarrao instantaneo", "pizza", "hamburguer", "lanche", "fast food", "chocolate",
  "sorvete", "suco de caixinha", "suco em po", "achocolatado", "cereal matinal", "bolo pronto", "doce", "bala",
];

export function indicadoresAlimentares(a: Assessment): string[] {
  const achados: string[] = [];
  const alimentos = a.diarioAlimentar.flatMap((r) => r.alimentos.map((x) => norm(x.alimento))).filter(Boolean);
  if (alimentos.some((x) => ULTRAPROCESSADOS.some((u) => ` ${x} `.includes(` ${u}`)))) achados.push("Excesso de ultraprocessados");
  if (a.consomeFritos === "sim") achados.push("Consumo frequente de frituras");
  if (a.habitoBeliscar === "sim") achados.push("Beliscos entre as refeições");
  const refeicoes = a.diarioAlimentar.filter((r) => r.alimentos.some((x) => x.alimento.trim()));
  if (refeicoes.some((r) => /^(2[1-3]|0[0-3]):/.test(r.horario))) achados.push("Refeições tardias");
  if (refeicoes.length > 0 && refeicoes.length < 3) achados.push("Poucas refeições ao dia");
  if (refeicoes.length > 7) achados.push("Muitas refeições ao dia");
  if (a.comeFora === "sim") achados.push("Alimentação frequente fora de casa");
  const fds = /sab|dom|fim de semana|final de semana/.test(norm(a.comeForaDias)) || (parseNumero(a.refeicoesLivresSemana) ?? 0) > 0;
  if (fds) achados.push("Excessos aos finais de semana");
  if (a.consomeFritos === "as-vezes" && achados.length === 0) achados.push("Frituras ocasionais");
  return achados;
}

const ehEtilista = (a: Assessment) => a.habitosSociais.some((h) => norm(h).startsWith("etilis"));

const KCAL_BEBIDA: [RegExp, number, string][] = [
  [/taca|vinho/, 125, "taça de vinho"],
  [/long neck/, 140, "long neck"],
  [/garrafa/, 250, "garrafa de cerveja"],
  [/lata|cerveja/, 150, "lata de cerveja"],
  [/chopp|chope/, 100, "chope"],
  [/dose|destilad|whisk|vodka|cachaca|gin|tequila/, 100, "dose"],
  [/drink|caipirinha|coquetel/, 200, "drink"],
];

export function estimativaAlcool(a: Assessment): { kcalSemana: number; detalhe: string } | null {
  if (!ehEtilista(a)) return null;
  const q = norm(a.etilismoQuantidade);
  const qtd = parseNumero((a.etilismoQuantidade.match(/\d+(?:[.,]\d+)?/) ?? [""])[0]);
  const bebida = KCAL_BEBIDA.find(([re]) => re.test(q));
  const f = norm(a.etilismoFrequencia);
  let vezes: number | null = null;
  if (/diari|todo dia|todos os dias/.test(f)) vezes = 7;
  else if (/fim de semana|final de semana/.test(f)) vezes = 2;
  else {
    const m = f.match(/(\d+)\s*(x|vez|vezes)?\s*(por|na|\/)?\s*semana/) ?? f.match(/(\d+)\s*x/);
    if (m) vezes = Number(m[1]);
    else if (/semana/.test(f)) vezes = 1;
    else if (/mes/.test(f)) {
      const mm = f.match(/(\d+)/);
      vezes = (mm ? Number(mm[1]) : 1) / 4.345;
    }
  }
  if (!qtd || !bebida || vezes === null) return null;
  const kcal = qtd * bebida[1] * vezes;
  return { kcalSemana: kcal, detalhe: `≈ ${fmtInt(qtd * bebida[1])} kcal por ocasião (${f1(qtd).replace(",0", "")} × ${bebida[2]})` };
}

const bristolAdequado = (b: string) => b === "B3" || b === "B4";
const armstrongNivel = (s: string) => parseNumero(s.replace(/\D/g, "")) ;

// ---------- Atividade física ----------
const FORCA = ["musculacao", "crossfit", "hyrox", "treinamento funcional", "calistenia", "pilates", "levantamento", "powerlifting"];
const minutos = (s: string) => {
  const n = norm(s);
  const h = n.match(/(\d+(?:[.,]\d+)?)\s*h/);
  const m = n.match(/(\d+)\s*(min|m\b)/) ?? (!h ? n.match(/(\d+)/) : null);
  return (h ? Number(h[1]!.replace(",", ".")) * 60 : 0) + (m ? Number(m[1]) : 0) || null;
};
const freq = (s: string) => parseNumero((s.match(/\d+/) ?? [""])[0]);

export function resumoAtividade(a: Assessment) {
  const temModalidade = a.modalidades.some((m) => m.modalidade.trim());
  const pratica = a.praticaAtividadeFisica === "sim" || (a.praticaAtividadeFisica === "" && temModalidade);
  const forca = a.modalidades.filter((m) => FORCA.some((f) => norm(m.modalidade).includes(f)));
  const aerobicas = a.modalidades.filter((m) => m.modalidade.trim() && !forca.includes(m));
  const forcaSemana = forca.reduce((s, m) => s + (freq(m.frequenciaSemanal) ?? 0), 0);
  const aerobicoVezes = aerobicas.reduce((s, m) => s + (freq(m.frequenciaSemanal) ?? 0), 0);
  const aerobicoMin = aerobicas.reduce((s, m) => s + (freq(m.frequenciaSemanal) ?? 0) * (minutos(m.duracao) ?? 0), 0);
  return { pratica, forca, aerobicas, forcaSemana, aerobicoVezes, aerobicoMin };
}

// ---------- Projeções ----------
const DIAS_PROJECAO = 90;

function projecaoNoDia(d: DerivedResults, metas: MetasPesoResultado | null, dia: number) {
  if (!metas || d.pesoKg === null) return null;
  const alvo = metas.expectativa?.pesoAlvo ?? null;
  let peso: number | null = null;
  let gordura: number | null = null;
  if (metas.modelo) {
    peso = pesoNoDia(metas.modelo.serie, dia);
    const pt = metas.modelo.serie[Math.round(dia)];
    if (pt?.gordura !== undefined && d.massaGorda !== null) gordura = pt.gordura;
  } else if (metas.expectativa?.kgSemana) {
    peso = d.pesoKg - (metas.expectativa.kgSemana * dia) / 7;
  }
  if (peso === null) return null;
  if (alvo !== null && peso < alvo) peso = alvo;
  return { peso, gordura };
}

export function construirJornada(a: Assessment, d: DerivedResults, metas: MetasPesoResultado | null): Jornada {
  const nome = a.nome.trim() || "Paciente";
  const visceral = indicador(a, ehVisceral);
  const cintura = indicador(a, ehCintura);
  const abdomen = indicador(a, ehAbdomen);
  const magraAtual = d.massaLivreGordura;

  // ===== Hoje =====
  // Referência do usuário: para mulheres, gordura corporal acima de 15% recebe seta vermelha para cima.
  const gorduraAlta = a.sexo === "feminino" && d.percentualGordura !== null && d.percentualGordura > 15;
  const composicao: CardJornada = {
    titulo: "Composição corporal",
    linhas: [
      { rotulo: "Peso atual", valor: d.pesoKg !== null ? `${fmt2(d.pesoKg)} kg` : NI },
      { rotulo: "IMC", valor: d.imc !== null ? `${fmt2(d.imc)} kg/m²` : NI, detalhe: d.classificacaoIMC ?? undefined, tom: d.imc === null ? "neutro" : d.imc >= 18.5 && d.imc < 25 ? "ok" : "atencao" },
      { rotulo: "Gordura corporal", valor: d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : NI, tom: gorduraAlta ? "atencao" : undefined, seta: gorduraAlta ? ("up" as Seta) : null },
      { rotulo: "Gordura em kg", valor: d.massaGorda !== null ? `${fmt2(d.massaGorda)} kg` : NI, tom: gorduraAlta ? "atencao" : undefined, seta: gorduraAlta ? ("up" as Seta) : null },
      ...(visceral
        ? [{ rotulo: "Gordura visceral", valor: `${visceral.valor}${visceral.unidade ? ` ${visceral.unidade}` : ""}` }]
        : []),
      { rotulo: "Massa magra", valor: magraAtual !== null ? `${fmt2(magraAtual)} kg` : NI },
      { rotulo: "Circunferência de cintura", valor: mostrar(cintura) },
      { rotulo: "Circunferência de abdômen", valor: mostrar(abdomen) },
    ],
  };

  const examesTodos = MARCADORES_JORNADA.map((m) => exameJornada(encontrarExame(a.exames, m.aliases, m.excluir), m.rotulo));
  const examesAvaliados = examesTodos.some((e) => e.inicial !== NI);
  const examesOk = examesAvaliados && examesTodos.every((e) => e.tom !== "atencao");
  // Apenas exames alterados (acima ou abaixo da referência) entram na lista; não há "moderados".
  const examesHoje = examesTodos.filter((e) => e.tom === "atencao");

  const achados = indicadoresAlimentares(a);
  const temR24 = a.diarioAlimentar.some((r) => r.alimentos.some((x) => x.alimento.trim()));
  const alcool = estimativaAlcool(a);
  const litros = a.consumoAgua ? lerLitrosAgua(a.consumoAgua) : null;
  const arm = armstrongNivel(a.armstrong);
  const habitos: CardJornada = {
    titulo: "Saúde e Estilo de Vida",
    linhas: [
      {
        rotulo: "Qualidade alimentar",
        valor: !temR24 && achados.length === 0 ? NI : achados.length === 0 ? "Boa" : "Ruim",
        detalhe: achados.length > 0 ? `Principal ponto: ${achados[0]!.toLowerCase()}` : undefined,
        tom: !temR24 && achados.length === 0 ? "neutro" : achados.length === 0 ? "ok" : "atencao",
        seta: achados.length > 0 ? ("down" as Seta) : null,
      },
      {
        rotulo: "Sono",
        valor: a.qualidadeSono || NI,
        detalhe: d.sono ? `${d.sono.horas}h${d.sono.restoMinutos ? `${String(d.sono.restoMinutos).padStart(2, "0")}` : ""} por noite` : undefined,
        tom: !a.qualidadeSono ? "neutro" : a.qualidadeSono === "Boa" ? "ok" : a.qualidadeSono === "Moderada" ? "moderado" : "atencao",
      },
      {
        rotulo: "Intestino",
        valor: a.frequenciaEvacuacao || NI,
        detalhe: a.bristol ? `Bristol tipo ${a.bristol.slice(1)}${bristolAdequado(a.bristol) ? " (adequado)" : ""}` : "Bristol: não informado",
        tom: !a.bristol ? "neutro" : bristolAdequado(a.bristol) ? "ok" : "atencao",
      },
      {
        rotulo: "Ingestão de água",
        valor: litros !== null ? `${formatarLitros(litros)} por dia` : NI,
        detalhe: arm !== null ? `Cor da urina: nível ${arm} de 8 (Armstrong)` : "Armstrong: não informado",
        tom: arm === null ? "neutro" : arm <= 3 ? "ok" : arm <= 5 ? "moderado" : "atencao",
      },
      {
        rotulo: "Bebida alcoólica",
        valor: ehEtilista(a) ? [a.etilismoQuantidade, a.etilismoFrequencia].filter(Boolean).join(" · ") || "Consome" : a.habitosSociais.length ? "Não consome" : NI,
        detalhe: ehEtilista(a) ? (alcool ? `Estimativa: ≈ ${fmtInt(alcool.kcalSemana)} kcal por semana` : "Estimativa calórica: não informado") : undefined,
        tom: ehEtilista(a) ? "atencao" : a.habitosSociais.length ? "ok" : "neutro",
      },
    ],
  };

  const at = resumoAtividade(a);
  const atividade: CardJornada = {
    titulo: "Atividade física",
    linhas: [
      { rotulo: "Pratica atividade física", valor: a.praticaAtividadeFisica === "" && !at.pratica ? NI : at.pratica ? "Sim" : "Não", tom: a.praticaAtividadeFisica === "" && !at.pratica ? "neutro" : at.pratica ? "ok" : "atencao" },
      ...(at.pratica
        ? [
            {
              rotulo: "Treino de força",
              valor: at.forca.length ? `${fmtInt(at.forcaSemana)}× por semana` : "Não pratica",
              detalhe: at.forca.map((m) => m.modalidade).join(", ") || undefined,
              tom: (at.forcaSemana >= 3 ? "ok" : "atencao") as Tom,
            },
            {
              rotulo: "Atividade aeróbica",
              valor: at.aerobicas.length ? `${fmtInt(at.aerobicoVezes)}× · ${fmtInt(at.aerobicoMin)} min/semana` : "Não pratica",
              detalhe: `Meta mínima: 150 min/semana${at.aerobicas.length ? ` · ${at.aerobicas.map((m) => m.modalidade).join(", ")}` : ""}`,
              tom: (at.aerobicoMin >= 150 ? "ok" : "atencao") as Tom,
              seta: at.aerobicas.length === 0 ? ("down" as Seta) : null,
            },
          ]
        : []),
    ],
  };

  // ===== Caminho =====
  const exp = metas?.expectativa ?? null;
  const deficit = metas?.deficitUsado ?? (d.ajusteKcal !== null && d.ajusteKcal < 0 ? Math.abs(d.ajusteKcal) : null);
  const prazo =
    metas?.diasMeta != null
      ? `≈ ${f1(metas.diasMeta / 30.4375)} meses (${fmtInt(metas.diasMeta)} dias)`
      : exp?.prazoMeses != null
        ? `≈ ${f1(exp.prazoMeses)} meses`
        : NI;
  const checkpoints = [30, 45, 60].map((dia) => {
    const p = projecaoNoDia(d, metas, dia);
    return {
      rotulo: `Revisão em ${dia} dias`,
      valor: p ? `≈ ${fmt2(p.peso)} kg` : "Avaliar adesão",
      detalhe: "Adesão, evolução do peso e ajustes do plano",
      seta: (p ? "down" : null) as Seta,
    };
  });
  const projecao: CardJornada = {
    titulo: "Projeção de emagrecimento",
    linhas: [
      { rotulo: "Peso desejado", valor: exp ? `${fmt2(exp.pesoAlvo)} kg` : NI, detalhe: exp ? `Perda de ${fmt2(exp.kg)} kg` : undefined },
      { rotulo: "Prazo estimado", valor: prazo },
      ...checkpoints,
      { rotulo: "Déficit calórico diário", valor: deficit !== null ? `${fmtInt(deficit)} kcal` : NI },
      { rotulo: "Meta calórica diária", valor: d.caloriasSugeridas !== null ? `${fmtInt(d.caloriasSugeridas)} kcal` : NI, tom: "ok" },
    ],
    nota: metas ? "Estimativas que dependem da adesão e da resposta individual." : "Projeção disponível quando o objetivo inclui emagrecimento.",
  };

  const metaAguaMl = d.pesoKg !== null ? d.pesoKg * 30 : null;
  const pontosAlimentares = [
    achados.includes("Excesso de ultraprocessados") || achados.includes("Consumo frequente de frituras") || achados.includes("Frituras ocasionais")
      ? "Reduzir ultraprocessados, frituras e alimentos muito calóricos"
      : "Manter base de alimentos naturais e pouco processados",
    "Organizar as refeições conforme sua rotina e preferências",
    ...(achados.includes("Beliscos entre as refeições") ? ["Substituir beliscos por lanches planejados"] : []),
    ...(achados.includes("Refeições tardias") ? ["Antecipar a última refeição do dia"] : []),
    ...(achados.includes("Alimentação frequente fora de casa") ? ["Fazer escolhas estratégicas ao comer fora"] : []),
    ...(achados.includes("Excessos aos finais de semana") ? ["Planejar a alimentação dos finais de semana"] : []),
  ];
  const habitosMelhora: CardJornada = {
    titulo: "Pontos de melhora dos hábitos",
    linhas: [
      ...pontosAlimentares.map((p, i) => ({ rotulo: i === 0 ? "Alimentação" : "", valor: p })),
      {
        rotulo: "Água",
        valor: metaAguaMl !== null ? `Chegar a ${formatarLitros(metaAguaMl / 1000)} por dia` : "Pelo menos 30 mL por kg/dia",
        detalhe: litros !== null && metaAguaMl !== null && litros * 1000 < metaAguaMl ? `Aumentar aos poucos: +0,5 L a cada 2 semanas (hoje ${formatarLitros(litros)})` : "Meta progressiva de 30 mL/kg/dia",
        seta: "up",
      },
      ...(ehEtilista(a)
        ? [{ rotulo: "Bebida alcoólica", valor: "Reduzir de forma progressiva", detalhe: "Diminuir a frequência e a quantidade a cada mês", seta: "down" as Seta }]
        : []),
      { rotulo: "Intestino", valor: "Funcionamento regular", detalhe: "Fezes entre os tipos 3 e 4 de Bristol", seta: bristolAdequado(a.bristol) ? ("igual" as Seta) : ("up" as Seta) },
    ],
  };

  const atividadeMelhora: CardJornada = {
    titulo: "Pontos de melhora na atividade física",
    linhas: [
      { rotulo: "Musculação", valor: "Mínimo 3× por semana", detalhe: `Hoje: ${at.pratica && at.forca.length ? `${fmtInt(at.forcaSemana)}×` : "não pratica"}`, tom: at.forcaSemana >= 3 ? "ok" : "atencao", seta: at.forcaSemana >= 3 ? "igual" : "up" },
      { rotulo: "Aeróbico", valor: "Mínimo 150 min por semana", detalhe: `Hoje: ${at.pratica && at.aerobicas.length ? `${fmtInt(at.aerobicoMin)} min` : "não pratica"}`, tom: at.aerobicoMin >= 150 ? "ok" : "atencao", seta: at.aerobicoMin >= 150 ? "igual" : "up" },
    ],
  };

  // ===== Destino (90 dias) =====
  const p90 = projecaoNoDia(d, metas, DIAS_PROJECAO);
  const perda = p90 && d.pesoKg !== null ? d.pesoKg - p90.peso : null;
  // Sem trajetória de gordura do modelo, estimativa conservadora: ~75% da perda como gordura.
  const gord90 = p90 ? (p90.gordura ?? (d.massaGorda !== null && perda !== null ? Math.max(0, d.massaGorda - perda * 0.75) : null)) : null;
  const magra90 = p90 && gord90 !== null ? p90.peso - gord90 : null;
  const pct90 = p90 && gord90 !== null ? (gord90 / p90.peso) * 100 : null;
  const imc90 = p90 && d.alturaCm !== null ? calculateBMI(p90.peso, d.alturaCm) : null;
  const cin = numInd(cintura);
  const abd = numInd(abdomen);
  const comp = (antes: number | null, depois: number | null, un: string, casas = fmt2): LinhaJornada["detalhe"] =>
    antes !== null && depois !== null ? `Hoje ${casas(antes)}${un} → ${casas(depois)}${un}` : undefined;
  // Peso-alvo é sempre o peso desejado informado pelo paciente na anamnese; sem esse valor, usa o PIO.
  const desejado = exp?.pesoAlvo ?? (parseNumero(a.pesoDesejado) ?? d.pio);
  const destinoComp: CardJornada = {
    titulo: "Composição corporal em 90 dias",
    linhas: [
      { rotulo: "Peso-alvo", valor: desejado !== null ? `${fmt2(desejado)} kg` : NI, detalhe: comp(d.pesoKg, desejado, " kg"), seta: desejado !== null && d.pesoKg !== null && desejado < d.pesoKg ? ("down" as Seta) : null, tom: desejado !== null ? "ok" : "neutro" },
      { rotulo: "IMC-alvo", valor: imc90 !== null ? `≈ ${fmt2(imc90)} kg/m²` : NI, detalhe: comp(d.imc, imc90, ""), seta: imc90 !== null ? "down" : null },
      { rotulo: "Gordura corporal", valor: pct90 !== null ? `≈ ${fmt2(pct90)}%` : NI, detalhe: comp(d.percentualGordura, pct90, "%"), seta: pct90 !== null ? "down" : null },
      { rotulo: "Gordura em kg", valor: gord90 !== null ? `≈ ${fmt2(gord90)} kg` : NI, detalhe: comp(d.massaGorda, gord90, " kg"), seta: gord90 !== null ? "down" : null },
      ...(visceral ? [{ rotulo: "Gordura visceral", valor: "Tendência de redução", seta: (visceral && p90 ? "down" : null) as Seta }] : []),
      { rotulo: "Massa magra", valor: magra90 !== null ? `≈ ${fmt2(magra90)} kg` : NI, detalhe: magra90 !== null ? "Preservar com treino de força e proteína" : undefined, seta: magra90 !== null ? "igual" : null },
      { rotulo: "Cintura", valor: cin !== null && perda !== null && perda > 0 ? `≈ −${f1(perda)} cm` : NI, detalhe: cin !== null && perda !== null && perda > 0 ? `Hoje ${f1(cin)} cm → ≈ ${f1(cin - perda)} cm` : undefined, seta: cin !== null && perda ? "down" : null },
      { rotulo: "Abdômen", valor: abd !== null && perda !== null && perda > 0 ? `≈ −${f1(perda)} cm` : NI, detalhe: abd !== null && perda !== null && perda > 0 ? `Hoje ${f1(abd)} cm → ≈ ${f1(abd - perda)} cm` : undefined, seta: abd !== null && perda ? "down" : null },
    ],
    nota: "Valores estimados, não garantidos. Medidas de cintura e abdômen estimadas em ≈ 1 cm por kg perdido.",
  };

  const destinoHabitos: CardJornada = {
    titulo: "Hábitos ideais",
    linhas: [
      { rotulo: "Alimentação", valor: "Equilibrada e variada", detalhe: "Poucos ultraprocessados e frituras, sem beliscos frequentes, refeições bem distribuídas e mais controle nas refeições livres dos finais de semana", tom: "ok" },
      { rotulo: "Sono", valor: "7 a 9 horas por noite", detalhe: "Boa qualidade, horários regulares e sensação de descanso ao acordar", tom: "ok" },
      { rotulo: "Intestino", valor: "Funcionamento regular", detalhe: "Fezes predominantemente entre os tipos 3 e 4 de Bristol", tom: "ok" },
      { rotulo: "Água", valor: metaAguaMl !== null ? `≈ ${formatarLitros(metaAguaMl / 1000)} por dia` : "Adequada às suas necessidades", detalhe: "Urina entre os níveis 1 e 3 de Armstrong", tom: "ok" },
      { rotulo: "Bebida alcoólica", valor: "Ausente ou bem reduzida", detalhe: "Frequência e calorias semanais próximas de zero", tom: "ok" },
    ],
  };

  return {
    titulo: `Jornada de Recomposição Corporal — ${nome}`,
    nome,
    data: fmtData(a.dataAvaliacaoAntropometrica || a.dataAvaliacao),
    examesOk,
    examesAvaliados,
    hoje: { composicao, exames: examesHoje, habitos, atividade },
    caminho: { projecao, habitos: habitosMelhora, atividade: atividadeMelhora },
    destino: { composicao: destinoComp, exames: examesHoje, habitos: destinoHabitos },
    aviso:
      "Todas as projeções são estimativas e não representam resultados garantidos. Metas dos exames são desejáveis e dependem da evolução clínica e de reavaliação.",
  };
}

