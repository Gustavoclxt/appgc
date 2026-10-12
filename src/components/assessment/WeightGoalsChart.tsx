import { CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { fmt2 } from "@/lib/assessment/calculations";
import type { MetasPesoResultado } from "@/lib/assessment/weight-goals";


export function WeightGoalsChart({ resultado: r }: { resultado: MetasPesoResultado }) {
  const pontos: { dia: number; dinamico?: number | undefined; meta?: number }[] = [];
  for (let dia = 0; dia <= 365; dia += 7) pontos.push({ dia, dinamico: r.modelo?.serie[dia]?.peso });
  if (r.modelo) pontos.push({ dia: 365, dinamico: r.modelo.serie[365]?.peso });
  for (const m of r.metas) pontos.push({ dia: m.meses * 30.4375, meta: m.pesoMeta });
  pontos.sort((a, b) => a.dia - b.dia);
  if (r.pesoInicial === null) return <p className="mt-5 text-[12px] text-ink-soft">Informe o peso na antropometria para visualizar o gráfico.</p>;
  return (
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
  );
}
