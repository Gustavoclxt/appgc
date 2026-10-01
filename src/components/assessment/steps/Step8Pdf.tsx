import { Panel } from "../fields";

export function Step8Pdf({
  onGerar,
  temAnalise,
}: {
  onGerar: () => void;
  temAnalise: boolean;
}) {
  return (
    <Panel titulo="Gerar PDF">
      <p className="max-w-2xl text-[13px] leading-relaxed text-ink-soft">
        O PDF reúne os dados do paciente, a antropometria, os cálculos energéticos, a necessidade
        hídrica, a conduta energética, os exames laboratoriais identificados e os textos produzidos na
        análise. Nada além do que foi informado ou calculado é incluído.
      </p>
      {!temAnalise && (
        <p className="mt-4 rounded-[10px] bg-warn-soft px-4 py-3 font-mono text-[11px] text-warn">
          A análise técnica ainda não foi gerada. O PDF sairá apenas com os dados e cálculos.
        </p>
      )}
      <button
        type="button"
        onClick={onGerar}
        className="mt-6 w-full rounded-[10px] bg-accent px-6 py-5 font-display text-xl font-semibold tracking-tight text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90"
      >
        GERAR PDF
      </button>
    </Panel>
  );
}
