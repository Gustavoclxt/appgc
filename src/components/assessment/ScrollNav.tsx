import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

// Oculta até o mouse passar por cima; a zona de hover é um pouco maior que o botão.
const ZONA = "fixed z-40 p-2 no-print group";
const BOTAO =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white opacity-0 ring-1 ring-accent/40 group-hover:opacity-100 focus:opacity-100 hover:bg-accent/90";

// A seta só existe na faixa inicial/final da página.
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
        <div className={`${ZONA} right-2 top-2`}>
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
        <div className={`${ZONA} bottom-2 right-2`}>
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
