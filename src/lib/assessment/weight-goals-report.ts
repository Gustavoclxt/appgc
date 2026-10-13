import { fmt2, fmtData, fmtInt } from "./calculations";
import type { MetasPesoResultado } from "./weight-goals";
import { labelClassificacao } from "./weight-projection";

export interface SecaoMetasRelatorio {
  titulo: string;
  colunas?: string[];
  linhas?: string[][];
  itens?: string[];
}

/** Display existing unrounded reference results without recalculating the goals. */
export function cardsMetasReferencia(r: MetasPesoResultado) {
  return [1, 3, 6].flatMap(meses => {
    const metas = r.metas.filter(m => m.meses === meses);
    const primeira = metas[0];
    const ultima = metas[metas.length - 1];
    if (!primeira || !ultima) return [];
    const intervalo = (a: number, b: number, unidade: string) => a === b ? `${fmt2(a)}${unidade}` : `${fmt2(Math.min(a, b))} a ${fmt2(Math.max(a, b))}${unidade}`;
    // Mantém a ordem da menor para a maior perda: 5% primeiro, 10% depois.
    const intervaloMeta = (a: number, b: number, unidade: string) => a === b ? `${fmt2(a)}${unidade}` : `${fmt2(a)} a ${fmt2(b)}${unidade}`;
    return [{
      prazo: meses === 1 ? "1 mês" : `${meses} meses`,
      percentual: intervalo(primeira.percentual, ultima.percentual, "%"),
      perda: intervalo(primeira.kg, ultima.kg, " kg"),
      peso: intervaloMeta(primeira.pesoMeta, ultima.pesoMeta, " kg"),
      velocidades: `${intervalo(primeira.kgSemana, ultima.kgSemana, " kg/semana")} · ${intervalo(primeira.pctSemana, ultima.pctSemana, "%/semana")} · ${intervalo(primeira.kgMes, ultima.kgMes, " kg/mês")}`,
    }];
  });
}

/** A mesma apresentação dos resultados para tela, cópia e PDF final. */
export function metasParaRelatorio(r: MetasPesoResultado): SecaoMetasRelatorio[] {
  const secoes: SecaoMetasRelatorio[] = [{
    titulo: "Dados da projeção",
    colunas: ["Indicador", "Valor"],
    linhas: [
      ["Avaliação antropométrica", fmtData(r.dataAvaliacao)],
      ["Peso inicial", r.pesoInicial !== null ? `${fmt2(r.pesoInicial)} kg` : "Não informado"],
      ["Déficit energético da projeção", r.deficitUsado !== null ? `${fmtInt(r.deficitUsado)} kcal/dia` : "Não definido"],
    ],
  }];
  const e = r.expectativa;
  secoes.push({
    titulo: "Expectativa do paciente",
    itens: e ? [
      `Perder ${fmt2(e.kg)} kg (${fmt2(e.percentual)}% do peso inicial), meta de ${fmt2(e.pesoAlvo)} kg${e.prazoMeses !== null ? ` em ${fmt2(e.prazoMeses)} meses` : ""}.`,
      ...(e.kgSemana !== null ? [`Velocidade necessária: ${fmt2(e.kgSemana)} kg/semana · ${fmt2(e.pctSemana)}%/semana.`] : ["Informe o prazo para classificar a expectativa."]),
      ...(r.classificacao ? [`Classificação: ${labelClassificacao[r.classificacao]} (referência para o prazo: até ${fmt2(r.percentualReferencia)}%).`] : []),
    ] : ["Expectativa não informada."],
  });
  if (r.metas.length) secoes.push({
    titulo: "Metas clínicas de referência (ajustáveis)",
    colunas: ["Meta", "% perda", "Kg", "Peso meta", "kg/sem", "%/sem", "kg/mês"],
    linhas: r.metas.map(m => [m.rotulo, `${fmt2(m.percentual)}%`, fmt2(m.kg), `${fmt2(m.pesoMeta)} kg`, fmt2(m.kgSemana), fmt2(m.pctSemana), fmt2(m.kgMes)]),
    itens: ["Referências ajustáveis — não são metas universais nem garantia de resultado."],
  });
  if (r.modelo) secoes.push({
    titulo: "Modelo dinâmico de perda de peso (Hall/NIH)",
    colunas: ["Prazo", "Peso projetado", "Perda estimada"],
    linhas: r.projecoes.map(p => [`${p.dias} dias`, `${fmt2(p.peso)} kg`, r.pesoInicial !== null ? `${fmt2(r.pesoInicial - p.peso)} kg` : "—"]),
    itens: [
      `Tempo até objetivo: ${r.diasMeta !== null ? `${fmtInt(r.diasMeta)} dias · ~${fmt2(r.diasMeta / 30.4375)} meses` : e ? "Não atingido em 3 anos" : "Informe a expectativa"}.`,
      `Ingestão basal estimada ${fmtInt(r.modelo.ingestaoBasal)} kcal/dia → ${fmtInt(r.modelo.ingestaoAlvo)} kcal/dia.`,
    ],
  });
  secoes.push({ titulo: "Limitações da estimativa", itens: [
    ...r.limitacoes,
    "Modelo de Hall implementado em dois compartimentos (sem glicogênio/água); estimativas podem diferir da calculadora oficial do NIH.",
  ] });
  if (r.interpretacao.length) secoes.push({ titulo: "Interpretação clínica (sugestão)", itens: r.interpretacao });
  return secoes;
}