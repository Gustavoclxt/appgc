import type { ExameLaboratorial } from "./types";

/** Chave numérica yyyymmdd para ordenar datas em formato dd/mm/aaaa. */
function chaveCronologica(data: string): number | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(data);
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  return ano * 10000 + mes * 100 + dia;
}

function compararDatas(a: string, b: string): number {
  const ca = chaveCronologica(a);
  const cb = chaveCronologica(b);
  if (ca !== null && cb !== null) return ca - cb;
  return a.localeCompare(b);
}

/** Datas distintas informadas nos exames, em ordem cronológica. */
export function datasDosExames(exames: ExameLaboratorial[]): string[] {
  const unicas = new Set<string>();
  for (const exame of exames) {
    const data = exame.data?.trim();
    if (data) unicas.add(data);
  }
  return [...unicas].sort(compararDatas);
}

/** Texto do cabeçalho do painel de exames: contagem seguida das datas. */
export function metaExamesIdentificados(exames: ExameLaboratorial[]): string {
  const base = `${exames.length} resultado(s)`;
  const datas = datasDosExames(exames);
  return datas.length ? `${base} · ${datas.join(" · ")}` : base;
}
