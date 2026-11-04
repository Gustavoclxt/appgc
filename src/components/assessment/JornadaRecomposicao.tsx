import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardJornada, ExameJornada, Jornada, Seta, Tom } from "@/lib/assessment/jornada";

const tomClasse: Record<Tom, string> = {
  ok: "text-accent",
  atencao: "text-warn",
  neutro: "text-ink",
};
const pontoClasse: Record<Tom, string> = { ok: "bg-accent", atencao: "bg-warn", neutro: "bg-line" };

function IconeSeta({ seta }: { seta?: Seta | undefined }) {
  if (!seta) return null;
  const C = seta === "up" ? ArrowUp : seta === "down" ? ArrowDown : ArrowRight;
  return <C className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />;
}

function Card({ card }: { card: CardJornada }) {
  return (
    <div className="rounded-[14px] bg-white p-5 ring-1 ring-line">
      <h4 className="mb-3 text-sm font-semibold tracking-tight text-ink">{card.titulo}</h4>
      <ul className="divide-y divide-line/70">
        {card.linhas.map((l, i) => (
          <li key={i} className="flex items-start justify-between gap-4 py-2">
            <span className="flex items-center gap-2 text-[12px] text-ink-soft">
              {l.tom && <span className={cn("h-2 w-2 shrink-0 rounded-full", pontoClasse[l.tom])} />}
              {l.rotulo}
            </span>
            <span className="text-right">
              <span className={cn("inline-flex items-center gap-1 text-[13px] font-semibold", tomClasse[l.tom ?? "neutro"])}>
                <IconeSeta seta={l.seta} />
                {l.valor}
              </span>
              {l.detalhe && <span className="block text-[11px] text-ink-soft">{l.detalhe}</span>}
            </span>
          </li>
        ))}
      </ul>
      {card.nota && <p className="mt-3 text-[11px] italic text-ink-soft">{card.nota}</p>}
    </div>
  );
}

function CardExames({ exames, destino }: { exames: ExameJornada[]; destino?: boolean }) {
  return (
    <div className="rounded-[14px] bg-white p-5 ring-1 ring-line">
      <h4 className="mb-3 text-sm font-semibold tracking-tight text-ink">
        {destino ? "Exames laboratoriais — metas desejáveis" : "Exames laboratoriais"}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[11px] text-ink-soft">
              <th className="py-1.5 pr-3 font-medium">Marcador</th>
              <th className="py-1.5 pr-3 font-medium">{destino ? "Inicial" : "Resultado"}</th>
              {destino ? (
                <>
                  <th className="py-1.5 pr-3 font-medium">Alvo desejável</th>
                  <th className="py-1.5 font-medium">Diferença esperada</th>
                </>
              ) : (
                <th className="py-1.5 font-medium">Referência</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {exames.map((e) => (
              <tr key={e.marcador}>
                <td className="py-2 pr-3 text-ink">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", pontoClasse[e.tom])} />
                    {e.marcador}
                  </span>
                </td>
                <td className={cn("py-2 pr-3 font-semibold", tomClasse[e.tom])}>{e.inicial}</td>
                {destino ? (
                  <>
                    <td className="py-2 pr-3 text-ink">{e.alvo}</td>
                    <td className="py-2 text-ink">
                      <span className="inline-flex items-center gap-1">
                        <IconeSeta seta={e.seta} />
                        {e.diferenca}
                      </span>
                    </td>
                  </>
                ) : (
                  <td className="py-2 text-ink-soft">{e.referencia}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {destino && (
        <p className="mt-3 text-[11px] italic text-ink-soft">
          Metas desejáveis, condicionadas à evolução clínica. Não há garantia de normalização em 90 dias.
        </p>
      )}
    </div>
  );
}

function Etapa({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          {numero}
        </span>
        <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-ink">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

export function JornadaRecomposicao({ jornada, onExportar }: { jornada: Jornada; onExportar: () => void }) {
  const j = jornada;
  return (
    <div className="panel space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[14px] bg-accent px-6 py-5 text-white">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">Avaliação de {j.data}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{j.titulo}</h2>
        </div>
        <button
          type="button"
          onClick={onExportar}
          className="rounded-[10px] bg-white px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-paper"
        >
          Exportar PDF
        </button>
      </div>

      <Etapa numero={1} titulo="Como você está hoje">
        <div className="grid gap-4 md:grid-cols-2">
          <Card card={j.hoje.composicao} />
          <CardExames exames={j.hoje.exames} />
          <Card card={j.hoje.habitos} />
          <Card card={j.hoje.atividade} />
        </div>
      </Etapa>

      <Etapa numero={2} titulo="Como vamos chegar lá">
        <div className="grid gap-4 md:grid-cols-3">
          <Card card={j.caminho.projecao} />
          <Card card={j.caminho.habitos} />
          <Card card={j.caminho.atividade} />
        </div>
      </Etapa>

      <Etapa numero={3} titulo="Onde vamos chegar">
        <div className="grid gap-4 md:grid-cols-2">
          <Card card={j.destino.composicao} />
          <Card card={j.destino.habitos} />
        </div>
        <CardExames exames={j.destino.exames} destino />
      </Etapa>

      <p className="rounded-[10px] bg-paper px-4 py-3 text-[11px] text-ink-soft">{j.aviso}</p>
    </div>
  );
}
