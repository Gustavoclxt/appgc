import type { MetasPesoResultado } from "@/lib/assessment/weight-goals";
import { WeightGoalsChart } from "./WeightGoalsChart";
import { metasParaRelatorio } from "@/lib/assessment/weight-goals-report";

export function WeightGoalsReport({ resultado: r }: { resultado: MetasPesoResultado }) {
  return (
    <section aria-labelledby="metas-relatorio-titulo" className="mt-8 border-t border-line pt-6">
      <h3 id="metas-relatorio-titulo" className="font-display text-xl font-semibold">Metas e Projeção de Peso</h3>
      {metasParaRelatorio(r).map(secao => (
        <section key={secao.titulo} className="mt-5">
          <h4 className="font-display text-sm font-semibold text-accent">{secao.titulo}</h4>
          {secao.colunas && secao.linhas && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead><tr>{secao.colunas.map(c => <th key={c} scope="col" className="whitespace-nowrap border-b border-line px-2 py-2 font-semibold">{c}</th>)}</tr></thead>
                <tbody>{secao.linhas.map((linha, i) => <tr key={i}>{linha.map((valor, j) => <td key={j} className="border-b border-line/60 px-2 py-2 tabular-nums">{valor}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {secao.itens && <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed">{secao.itens.map((item, i) => <li key={i}>{item}</li>)}</ul>}
        </section>
      ))}
      <WeightGoalsChart resultado={r} />
    </section>
  );
}