import { Panel } from "../fields";

const btn =
  "inline-flex cursor-pointer items-center rounded-[10px] bg-accent px-5 py-2.5 text-sm font-medium text-white ring-1 ring-accent/40 transition-colors hover:bg-accent/90";

export function Step8Pdf({
  onGerar,
  onJornada,
  temAnalise,
}: {
  onGerar: () => void;
  onJornada: () => void;
  temAnalise: boolean;
}) {
  return (
    <Panel titulo="Laudo em PDF">
      <p className="text-[13px] leading-relaxed text-ink-soft">
        O PDF reúne os dados do paciente, a antropometria, os cálculos energéticos, a necessidade
        hídrica, a conduta energética, os exames laboratoriais identificados e os textos produzidos na
        análise.
      </p>
      {!temAnalise && (
        <p className="mt-4 rounded-[10px] bg-warn-soft px-4 py-3 font-mono text-[11px] text-warn">
          A análise técnica ainda não foi gerada. O PDF sairá apenas com os dados e cálculos.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onGerar} className={btn}>
          Salvar PDF
        </button>
        <button type="button" onClick={onJornada} className={btn}>
          Gerar Relatório do Paciente
        </button>
      </div>
    </Panel>
  );
}
