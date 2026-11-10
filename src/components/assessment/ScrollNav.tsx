import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const BOTAO =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90";

// A seta só aparece na faixa inicial/final da página.
const FAIXA = 0.25;

type Estado = { pertoDoInicio: boolean; pertoDoFim: boolean };

const SEM_SETA: Estado = { pertoDoInicio: false, pertoDoFim: false };

function medir(): Estado {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return SEM_SETA;
  const y = window.scrollY;
  return {
    pertoDoInicio: y <= max * FAIXA,
    pertoDoFim: y >= max * (1 - FAIXA),
  };
}

function irParaTopo() {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

function irParaFim() {
  const fim = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.max(0, fim), behavior: "instant" as ScrollBehavior });
}

export function ScrollNav() {
  const [estado, setEstado] = useState<Estado>(SEM_SETA);

  useEffect(() => {
    const atualizar = () => {
      const proximo = medir();
      setEstado((atual) =>
        atual.pertoDoInicio === proximo.pertoDoInicio &&
        atual.pertoDoFim === proximo.pertoDoFim
          ? atual
          : proximo,
      );
    };
    atualizar();
    window.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    const observador = new ResizeObserver(atualizar);
    observador.observe(document.documentElement);
    return () => {
      window.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
      observador.disconnect();
    };
  }, []);

  return (
    <>
      {estado.pertoDoInicio && (
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
      )}
      {estado.pertoDoFim && (
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
      )}
    </>
  );
}
