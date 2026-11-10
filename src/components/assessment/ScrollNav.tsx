import { ArrowDown, ArrowUp } from "lucide-react";

const BOTAO =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90";

function irParaTopo() {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function irParaFim() {
  const fim = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.max(0, fim), behavior: "instant" as ScrollBehavior });
}

export function ScrollNav() {
  return (
    <>
      <div className="fixed right-4 top-4 z-40 no-print">
        <button
          type="button"
          onClick={irParaFim}
          aria-label="Ir para o fim da página"
          title="Ir para o fim da página"
          className={BOTAO}
        >
          <ArrowDown size={14} />
        </button>
      </div>
      <div className="fixed bottom-4 right-4 z-40 no-print">
        <button
          type="button"
          onClick={irParaTopo}
          aria-label="Ir para o início da página"
          title="Ir para o início da página"
          className={BOTAO}
        >
          <ArrowUp size={14} />
        </button>
      </div>
    </>
  );
}
