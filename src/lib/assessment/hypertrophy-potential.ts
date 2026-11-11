import type { Assessment, Sexo } from "./types";

export interface FaixaEstimativa {
  min: number;
  max: number;
}

export interface ProjecaoHipertrofia {
  dias: 30 | 45 | 60;
  ganho: FaixaEstimativa;
  peso: FaixaEstimativa;
}

export interface PotencialHipertrofia {
  sexo: Sexo;
  tempoMeses: number;
  estagio: string;
  mensal: FaixaEstimativa;
  projecoes: ProjecaoHipertrofia[];
  anual: {
    ganho: FaixaEstimativa;
    peso: FaixaEstimativa;
  };
  recomposicao: boolean;
}

interface Estagio {
  rotulo: string;
  inicio: number;
  fim: number | null;
  anual: Record<Sexo, FaixaEstimativa>;
}

// Modelo de Lyle McDonald. Valores anuais em kg de massa muscular.
const ESTAGIOS: Estagio[] = [
  {
    rotulo: "1º ano",
    inicio: 0,
    fim: 12,
    anual: {
      masculino: { min: 9, max: 11.5 },
      feminino: { min: 4.5, max: 5.75 },
    },
  },
  {
    rotulo: "2º ano",
    inicio: 12,
    fim: 24,
    anual: {
      masculino: { min: 4.5, max: 5.5 },
      feminino: { min: 2.25, max: 2.75 },
    },
  },
  {
    rotulo: "3º ano",
    inicio: 24,
    fim: 36,
    anual: {
      masculino: { min: 2.2, max: 2.7 },
      feminino: { min: 1.1, max: 1.35 },
    },
  },
  {
    rotulo: "4º ano em diante",
    inicio: 36,
    fim: null,
    anual: {
      masculino: { min: 0.9, max: 1.3 },
      feminino: { min: 0.45, max: 0.65 },
    },
  },
];

const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export function objetivoPermiteHipertrofia(objetivos: string[]): boolean {
  return objetivos.some((objetivo) => {
    const normalizado = normalizar(objetivo);
    return normalizado === "hipertrofia" || normalizado === "recomposicao corporal";
  });
}

/** Interpreta textos como "6 meses", "2 anos" e "1 ano e 6 meses". */
export function tempoPraticaEmMeses(valor: string): number | null {
  const texto = normalizar(valor).replace(",", ".");
  if (!texto || /-\s*\d/.test(texto)) return null;

  const padrao = /(\d+(?:\.\d+)?)\s*(anos|ano|meses|mes|a|m)\b/g;
  let total = 0;
  let encontrou = false;
  for (const correspondencia of texto.matchAll(padrao)) {
    const quantidade = Number(correspondencia[1]);
    if (!Number.isFinite(quantidade) || quantidade < 0) return null;
    const unidade = correspondencia[2];
    total += unidade === "ano" || unidade === "anos" || unidade === "a" ? quantidade * 12 : quantidade;
    encontrou = true;
  }
  return encontrou && Number.isFinite(total) ? total : null;
}

function estagioPara(tempoMeses: number): Estagio {
  return ESTAGIOS.find((estagio) => tempoMeses >= estagio.inicio && (estagio.fim === null || tempoMeses < estagio.fim)) ?? ESTAGIOS[ESTAGIOS.length - 1]!;
}

function projecaoCurta(pesoKg: number, mensal: FaixaEstimativa, dias: 30 | 45 | 60): ProjecaoHipertrofia {
  const fator = dias / 30;
  const ganho = { min: mensal.min * fator, max: mensal.max * fator };
  return {
    dias,
    ganho,
    peso: { min: pesoKg + ganho.min, max: pesoKg + ganho.max },
  };
}

/** Integra cada faixa de experiência ao longo dos próximos 12 meses. */
function projecaoAnual(pesoKg: number, sexo: Sexo, tempoMeses: number) {
  let cursor = tempoMeses;
  let restante = 12;
  const ganho = { min: 0, max: 0 };

  while (restante > 1e-9) {
    const estagio = estagioPara(cursor);
    const ateProximoEstagio = estagio.fim === null ? restante : Math.max(0, estagio.fim - cursor);
    const meses = Math.min(restante, ateProximoEstagio);
    const anual = estagio.anual[sexo];
    ganho.min += (anual.min / 12) * meses;
    ganho.max += (anual.max / 12) * meses;
    cursor += meses;
    restante -= meses;
  }

  return { ganho, peso: { min: pesoKg + ganho.min, max: pesoKg + ganho.max } };
}

/** Resultado único, sem arredondamento, consumido pela tela e por todos os relatórios. */
export function calcularPotencialHipertrofia(a: Assessment, pesoKg: number | null): PotencialHipertrofia | null {
  if (!objetivoPermiteHipertrofia(a.objetivos) || a.sexo === "" || pesoKg === null || !Number.isFinite(pesoKg) || pesoKg <= 0) return null;

  let tempoMeses: number | null = null;
  for (const modalidade of a.modalidades) {
    if (normalizar(modalidade.modalidade) !== "musculacao") continue;
    const tempo = tempoPraticaEmMeses(modalidade.tempoPratica);
    if (tempo !== null) {
      tempoMeses = tempo;
      break;
    }
  }
  if (tempoMeses === null) return null;

  const estagio = estagioPara(tempoMeses);
  const anualAtual = estagio.anual[a.sexo];
  const mensal = { min: anualAtual.min / 12, max: anualAtual.max / 12 };

  return {
    sexo: a.sexo,
    tempoMeses,
    estagio: estagio.rotulo,
    mensal,
    projecoes: [
      projecaoCurta(pesoKg, mensal, 30),
      projecaoCurta(pesoKg, mensal, 45),
      projecaoCurta(pesoKg, mensal, 60),
    ],
    anual: projecaoAnual(pesoKg, a.sexo, tempoMeses),
    recomposicao: a.objetivos.some((objetivo) => normalizar(objetivo) === "recomposicao corporal"),
  };
}

const numero = (valor: number) =>
  valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const faixaEmGramas = (faixa: FaixaEstimativa) => `${numero(faixa.min * 1000)} a ${numero(faixa.max * 1000)} g`;
export const faixaEmKg = (faixa: FaixaEstimativa) => `${numero(faixa.min)} a ${numero(faixa.max)} kg`;
export const faixaPeso = (faixa: FaixaEstimativa) => `${numero(faixa.min)} a ${numero(faixa.max)} kg`;
export const formatarMeses = (meses: number) =>
  `${meses.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${meses === 1 ? "mês" : "meses"}`;

/** Data da projeção: soma dias corridos à data base, sem influência de fuso ou horário de verão. */
export function dataProjetada(base: Date, dias: number): string {
  const data = new Date(Date.UTC(base.getFullYear(), base.getMonth(), base.getDate() + dias));
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}
