import { calculateBMI, type DerivedResults } from "./calculations";
import type { Assessment } from "./types";
import { DIAS_POR_MES } from "./weight-projection";
import type { MetasPesoResultado } from "./weight-goals";

export interface MarcoLinhaTempo {
  rotulo: string;
  dias: number;
  peso: number;
  imc: number | null;
  percentualGordura: number | null;
  metaAtingida: boolean;
}

const rotuloDias = (dias: number) => {
  if (dias === 0) return "Hoje";
  const meses = dias / DIAS_POR_MES;
  if (dias === 365) return "12 meses";
  if (Math.abs(meses - Math.round(meses)) < 0.05) {
    const m = Math.round(meses);
    return m === 1 ? "1 mês" : `${m} meses`;
  }
  return `${meses.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} meses`;
};

/**
 * Linha do tempo do relatório do paciente: situação atual e, em emagrecimento,
 * os pesos projetados em cada intervalo até o peso desejado (ou todos os
 * intervalos da calculadora quando não há peso desejado). Sem arredondamento.
 */
export function linhaDoTempoPaciente(
  a: Assessment,
  d: DerivedResults,
  metas: MetasPesoResultado | null,
): MarcoLinhaTempo[] {
  if (d.pesoKg === null) return [];
  const marcos: MarcoLinhaTempo[] = [
    { rotulo: "Hoje", dias: 0, peso: d.pesoKg, imc: d.imc, percentualGordura: d.percentualGordura, metaAtingida: false },
  ];
  if (!metas || !a.objetivos.includes("Emagrecimento")) return marcos;
  const alvo = metas.expectativa?.pesoAlvo ?? null;
  const imc = (p: number) => (d.alturaCm !== null ? calculateBMI(p, d.alturaCm) : null);

  if (metas.modelo) {
    const serie = metas.modelo.serie;
    const pct = (dia: number) => {
      const pt = serie[dia];
      return pt?.gordura !== undefined && d.percentualGordura !== null ? (pt.gordura / pt.peso) * 100 : null;
    };
    for (const p of metas.projecoes) {
      if (alvo !== null && metas.diasMeta !== null && p.dias >= metas.diasMeta) break;
      marcos.push({ rotulo: rotuloDias(p.dias), dias: p.dias, peso: p.peso, imc: imc(p.peso), percentualGordura: pct(p.dias), metaAtingida: false });
    }
    if (alvo !== null && metas.diasMeta !== null) {
      const peso = serie[metas.diasMeta]!.peso;
      marcos.push({ rotulo: rotuloDias(metas.diasMeta), dias: metas.diasMeta, peso, imc: imc(peso), percentualGordura: pct(metas.diasMeta), metaAtingida: true });
    }
    return marcos;
  }

  // Sem modelo dinâmico: metas de referência da calculadora.
  for (const m of metas.metas) {
    if (m.rotulo.includes("mín")) continue;
    const dias = Math.round(m.meses * DIAS_POR_MES);
    const atingiu = alvo !== null && m.pesoMeta <= alvo;
    const peso = atingiu ? alvo! : m.pesoMeta;
    marcos.push({ rotulo: rotuloDias(dias), dias, peso, imc: imc(peso), percentualGordura: null, metaAtingida: atingiu });
    if (atingiu) break;
  }
  return marcos;
}
