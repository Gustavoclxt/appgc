import type { ExameLaboratorial } from "@/lib/assessment/types";
import { cn } from "@/lib/utils";

const rotulo: Record<ExameLaboratorial["status"], string> = {
  dentro: "Dentro da referência",
  abaixo: "Abaixo",
  acima: "Acima",
  indeterminado: "Indeterminado",
};

const cores: Record<ExameLaboratorial["status"], string> = {
  dentro: "bg-accent-soft text-accent",
  abaixo: "bg-destructive-soft text-destructive",
  acima: "bg-warn-soft text-warn",
  indeterminado: "bg-white text-ink-soft ring-1 ring-line",
};

const pontos: Record<ExameLaboratorial["status"], string> = {
  dentro: "bg-accent",
  abaixo: "bg-destructive",
  acima: "bg-warn",
  indeterminado: "bg-ink-soft",
};

export function ExamesTable({ exames }: { exames: ExameLaboratorial[] }) {
  if (!exames.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            <th className="py-2 pr-4 font-medium">Exame</th>
            <th className="py-2 pr-4 font-medium">Resultado</th>
            <th className="py-2 pr-4 font-medium">Unidade</th>
            <th className="py-2 pr-4 font-medium">Referência</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {exames.map((e) => (
            <tr key={e.id} className="border-b border-line/60 last:border-0">
              <td className="py-2.5 pr-4">{e.exame}</td>
              <td className="py-2.5 pr-4 font-mono tabular-nums">{e.resultado || "—"}</td>
              <td className="py-2.5 pr-4 font-mono text-ink-soft">{e.unidade || "—"}</td>
              <td className="py-2.5 pr-4 font-mono text-ink-soft">{e.referencia || "—"}</td>
              <td className="py-2.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px]",
                    cores[e.status],
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", pontos[e.status])} />
                  {rotulo[e.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
