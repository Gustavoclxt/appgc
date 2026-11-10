import { ArrowDown, ArrowUp } from "lucide-react";

function irParaTopo() {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function irParaFim() {
  const fim = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.max(0, fim), behavior: "instant" as ScrollBehavior });
}

export function ScrollNav() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex gap-2 no-print">
      <button
        type="button"
        onClick={irParaTopo}
        aria-label="Ir para o início da página"
        title="Ir para o início da página"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90"
      >
        <ArrowUp size={20} />
      </button>
      <button
        type="button"
        onClick={irParaFim}
        aria-label="Ir para o fim da página"
        title="Ir para o fim da página"
        className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90"
      >
        <ArrowDown size={20} />
      </button>
    </div>
  );
}
