import { ETAPAS } from "@/lib/assessment/initial-state";
import { cn } from "@/lib/utils";

export function StepRail({
  etapaAtual,
  onSelecionar,
}: {
  etapaAtual: number;
  onSelecionar: (etapa: number) => void;
}) {
  const progresso = ((etapaAtual - 1) / (ETAPAS.length - 1)) * 100;

  return (
    <nav className="sticky top-[61px] z-20 border-b border-line/70 bg-white/45 backdrop-blur-xl no-print">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="flex items-center gap-1.5">
          {ETAPAS.map((etapa, i) => (
            <div key={etapa.id} className="flex flex-1 items-center gap-1.5 last:flex-none">
              <button
                type="button"
                onClick={() => onSelecionar(etapa.id)}
                className="flex items-center gap-1.5"
                aria-label={etapa.nomeCompleto}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full font-mono text-[10px] transition-colors",
                    etapa.id === etapaAtual
                      ? "bg-accent text-white"
                      : etapa.id < etapaAtual
                        ? "bg-ink text-white"
                        : "bg-white text-ink-soft ring-1 ring-line",
                  )}
                >
                  {etapa.id}
                </span>
                <span
                  className={cn(
                    "hidden text-[11px] md:inline",
                    etapa.id === etapaAtual ? "font-medium text-accent" : "text-ink-soft",
                  )}
                >
                  {etapa.titulo}
                </span>
              </button>
              {i < ETAPAS.length - 1 && <span className="h-px flex-1 bg-line" />}
            </div>
          ))}
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line/70">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
