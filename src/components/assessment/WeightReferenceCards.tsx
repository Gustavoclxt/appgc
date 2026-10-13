import type { MetasPesoResultado } from "@/lib/assessment/weight-goals";
import { cardsMetasReferencia } from "@/lib/assessment/weight-goals-report";

export function WeightReferenceCards({ resultado }: { resultado: MetasPesoResultado }) {
  const cards = cardsMetasReferencia(resultado);
  if (!cards.length) return null;
  return (
    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(card => (
        <article key={card.prazo} className="rounded-lg border border-accent/15 bg-accent-soft/70 p-4">
          <h4 className="font-display text-base font-semibold text-accent">{card.prazo} — {card.percentual}</h4>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-ink-soft">Perda de peso de referência</dt><dd className="font-mono text-lg font-medium text-ink">{card.perda}</dd></div>
            <div><dt className="text-ink-soft">Peso após a perda</dt><dd className="font-mono text-lg font-medium text-ink">{card.peso}</dd></div>
          </dl>
          <p className="mt-4 border-t border-accent/15 pt-3 text-[11px] leading-relaxed text-ink-soft">{card.velocidades}</p>
        </article>
      ))}
    </div>
  );
}