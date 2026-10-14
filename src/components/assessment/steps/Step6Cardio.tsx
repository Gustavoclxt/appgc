import { fmtInt } from "@/lib/assessment/calculations";

import { MetricCard, Panel } from "../fields";
import type { StepProps } from "./types";

export function Step6Cardio({ d }: Pick<StepProps, "d">) {
  return (
    <Panel titulo="Frequência cardíaca recomendada (cardio)">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="FcMax"
          valor={d.fcMax !== null ? fmtInt(d.fcMax) : "—"}
          sub={`bpm · 220 − Idade${d.idade !== null ? ` (${fmtInt(d.idade)} anos)` : ""}`}
        />
        <MetricCard
          label="Cardio — FcMax × 0,6"
          valor={d.cardioMin !== null ? fmtInt(d.cardioMin) : "—"}
          sub="bpm · limite inferior da faixa"
        />
        <MetricCard
          label="Cardio — FcMax × 0,7"
          valor={d.cardioMax !== null ? fmtInt(d.cardioMax) : "—"}
          sub="bpm · limite superior da faixa"
        />
      </div>
      {d.fcMax !== null && d.cardioMin !== null && d.cardioMax !== null && (
        <p className="mt-4 font-mono text-[11px] text-ink-soft">
          Faixa recomendada para o cardio: {fmtInt(d.cardioMin)} a {fmtInt(d.cardioMax)} bpm
        </p>
      )}
      {d.fcMax === null && (
        <p className="mt-4 font-mono text-[11px] text-ink-soft">
          Informe a data de nascimento para calcular a FcMax e a faixa do cardio.
        </p>
      )}
    </Panel>
  );
}
