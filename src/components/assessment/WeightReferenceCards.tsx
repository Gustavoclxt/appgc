import type { MetasPesoResultado } from "@/lib/assessment/weight-goals";
import { cardsMetasReferencia } from "@/lib/assessment/weight-goals-report";

import { type MarcoLinhaDoTempo, LinhaDoTempo } from "./LinhaDoTempo";

export function WeightReferenceCards({ resultado }: { resultado: MetasPesoResultado }) {
  const cards = cardsMetasReferencia(resultado);
  if (!cards.length) return null;
  const marcos: MarcoLinhaDoTempo[] = cards.map((card) => ({
    rotulo: card.prazo,
    meses: card.meses,
    valor: card.peso,
    detalhe: `Perda de peso de referência: ${card.perda}`,
    nota: `Referência: ${card.percentual} · ${card.velocidades}`,
  }));
  return <LinhaDoTempo marcos={marcos} />;
}
