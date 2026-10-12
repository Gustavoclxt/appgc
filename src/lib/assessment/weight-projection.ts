import type { Sexo } from "./types";

/**
 * Metas e Projeção de Peso.
 * Modelo dinâmico adulto de Hall et al. (Lancet 2011), base do NIH Body Weight Planner.
 * Implementação em dois compartimentos (massa gorda e massa livre de gordura),
 * sem os transientes de glicogênio e água extracelular. Nada é arredondado aqui.
 */

export interface MetasPesoEstado {
  modo: "peso" | "kg";
  pesoDesejado: string;
  kgPerder: string;
  prazoMeses: string;
  meta1: string;
  meta3: string;
  meta6Min: string;
  meta6Max: string;
  deficitKcal: string;
}

export function metasPesoIniciais(): MetasPesoEstado {
  return {
    modo: "peso",
    pesoDesejado: "",
    kgPerder: "",
    prazoMeses: "",
    meta1: "2.5",
    meta3: "5",
    meta6Min: "5",
    meta6Max: "10",
    deficitKcal: "",
  };
}

export const DIAS_POR_MES = 30.4375;
const RHO_F = 9440;
const RHO_L = 1816;
const GAMMA_F = 3.2;
const GAMMA_L = 22;
const ETA_F = 180;
const ETA_L = 230;
const BETA_TEF = 0.1;
const BETA_AT = 0.14;
const TAU_AT = 14;
const C_FORBES = (10.4 * RHO_L) / RHO_F;

export interface EntradaModelo {
  sexo: Sexo;
  idade: number;
  alturaCm: number;
  pesoKg: number;
  percentualGordura: number | null;
  pal: number;
  deficitKcal: number;
}

export interface PontoTrajetoria {
  dia: number;
  peso: number;
}

export interface ResultadoModelo {
  serie: PontoTrajetoria[];
  ingestaoBasal: number;
  ingestaoAlvo: number;
  massaGordaInicial: number;
  gorduraEstimada: boolean;
}

/** Massa gorda inicial estimada (Jackson et al., usada por Hall) quando não há % de gordura. */
export function estimarMassaGorda(sexo: Sexo, idade: number, pesoKg: number, alturaCm: number): number {
  const imc = pesoKg / (alturaCm / 100) ** 2;
  const pct =
    sexo === "feminino"
      ? 0.14 * idade + 39.96 * Math.log(imc) - 102.01
      : 0.14 * idade + 37.31 * Math.log(imc) - 103.94;
  return (pesoKg * Math.max(pct, 5)) / 100;
}

export function simularHall(e: EntradaModelo, dias = 365 * 3): ResultadoModelo {
  const rmr =
    10 * e.pesoKg + 6.25 * e.alturaCm - 5 * e.idade + (e.sexo === "masculino" ? 5 : -161);
  const ei0 = e.pal * rmr;
  const gorduraEstimada = e.percentualGordura === null;
  const f0 = gorduraEstimada
    ? estimarMassaGorda(e.sexo, e.idade, e.pesoKg, e.alturaCm)
    : (e.pesoKg * e.percentualGordura!) / 100;
  const l0 = e.pesoKg - f0;
  const delta = (((1 - BETA_TEF) * e.pal - 1) * rmr) / e.pesoKg;
  const k = ei0 - GAMMA_F * f0 - GAMMA_L * l0 - delta * e.pesoKg;
  const ei = ei0 - e.deficitKcal;
  const dEI = ei - ei0;

  let f = f0;
  let l = l0;
  let at = 0;
  const serie: PontoTrajetoria[] = [{ dia: 0, peso: e.pesoKg }];
  for (let dia = 1; dia <= dias; dia++) {
    const bw = f + l;
    const p = C_FORBES / (C_FORBES + f);
    const tef = BETA_TEF * dEI;
    at += (BETA_AT * dEI - at) / TAU_AT;
    const fatorF = (ETA_F * (1 - p)) / RHO_F;
    const fatorL = (ETA_L * p) / RHO_L;
    const ee =
      (k + GAMMA_F * f + GAMMA_L * l + delta * bw + tef + at + ei * (fatorF + fatorL)) /
      (1 + fatorF + fatorL);
    const balanco = ei - ee;
    f = Math.max(0.5, f + ((1 - p) * balanco) / RHO_F);
    l = l + (p * balanco) / RHO_L;
    serie.push({ dia, peso: f + l });
  }
  return { serie, ingestaoBasal: ei0, ingestaoAlvo: ei, massaGordaInicial: f0, gorduraEstimada };
}

export function pesoNoDia(serie: PontoTrajetoria[], dia: number): number | null {
  return serie[Math.round(dia)]?.peso ?? null;
}

export function diasParaMeta(serie: PontoTrajetoria[], meta: number): number | null {
  const ponto = serie.find((p) => p.peso <= meta);
  return ponto ? ponto.dia : null;
}

export interface MetaReferencia {
  rotulo: string;
  meses: number;
  percentual: number;
  kg: number;
  pesoMeta: number;
  kgSemana: number;
  pctSemana: number;
  kgMes: number;
}

export function metaReferencia(rotulo: string, meses: number, percentual: number, pesoKg: number): MetaReferencia {
  const semanas = (meses * DIAS_POR_MES) / 7;
  const kg = (pesoKg * percentual) / 100;
  return {
    rotulo,
    meses,
    percentual,
    kg,
    pesoMeta: pesoKg - kg,
    kgSemana: kg / semanas,
    pctSemana: percentual / semanas,
    kgMes: kg / meses,
  };
}

export interface ParametrosReferencia {
  meta1: number;
  meta3: number;
  meta6Max: number;
}

/** Percentual máximo de referência para o prazo (interpolação entre 1, 3 e 6 meses; acima de 6 meses permanece no teto de 6 meses). */
export function percentualReferenciaParaPrazo(meses: number, r: ParametrosReferencia): number {
  if (meses <= 1) return r.meta1 * meses;
  if (meses <= 3) return r.meta1 + ((meses - 1) * (r.meta3 - r.meta1)) / 2;
  if (meses <= 6) return r.meta3 + ((meses - 3) * (r.meta6Max - r.meta3)) / 3;
  return r.meta6Max;
}

export type ClassificacaoExpectativa = "compativel" | "agressiva" | "muito-agressiva";

export const labelClassificacao: Record<ClassificacaoExpectativa, string> = {
  compativel: "Compatível",
  agressiva: "Mais agressiva",
  "muito-agressiva": "Muito agressiva",
};

export function classificarExpectativa(percentualDesejado: number, percentualReferencia: number): ClassificacaoExpectativa {
  if (percentualReferencia <= 0) return "muito-agressiva";
  const razao = percentualDesejado / percentualReferencia;
  if (razao <= 1) return "compativel";
  if (razao <= 1.5) return "agressiva";
  return "muito-agressiva";
}
