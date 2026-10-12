import { CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { fmt2 } from "@/lib/assessment/calculations";
import type { MetasPesoResultado } from "@/lib/assessment/weight-goals";
import { metasParaRelatorio } from "@/lib/assessment/weight-goals-report";

export function WeightGoalsReport({ resultado: r }: { resultado: MetasPesoResultado }) {
  const pontos: { dia: number; dinamico?: number; meta?: number }[] = [];
  for (let dia = 0; dia <= 365; dia += 7) pontos.push({ dia, dinamico: r.modelo?.serie[dia]?.peso });
  if (r.modelo) pontos.push({ dia: 365, dinamico: r.modelo.serie[365]?.peso });
  for (const m of r.metas) pontos.push({ dia: m.meses * 30.4375, meta: m.pesoMeta });
  pontos.sort((a, b) => a.dia - b.dia);
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
      {r.pesoInicial !== null && (
        <section className="mt-5">
          <h4 className="font-display text-sm font-semibold text-accent">Gráfico comparativo</h4>
          <div className="mt-3 h-[320px] min-w-0 w-full">
            <ResponsiveContainer>
              <ComposedChart data={pontos} margin={{ top: 15, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="dia" type="number" domain={[0, 365]} ticks={[0, 30, 60, 90, 180, 365]} tick={{ fontSize: 11 }} unit="d" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} unit="kg" width={56} />
                <Tooltip formatter={(v: number) => `${fmt2(v)} kg`} labelFormatter={l => `Dia ${l}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={r.pesoInicial} stroke="var(--ink-soft)" strokeDasharray="4 4" label={{ value: "Peso inicial", fontSize: 10, position: "insideTopRight" }} />
                {r.expectativa && <ReferenceLine y={r.expectativa.pesoAlvo} stroke="var(--warn)" strokeDasharray="4 4" label={{ value: "Peso desejado", fontSize: 10, position: "insideBottomRight" }} />}
                {r.modelo && <Line dataKey="dinamico" name="Trajetória dinâmica" stroke="var(--accent)" strokeWidth={2} dot={false} connectNulls />}
                <Scatter dataKey="meta" name="Metas de referência" fill="var(--ink)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </section>
  );
}