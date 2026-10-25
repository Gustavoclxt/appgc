import { useRef, useState } from "react";
import { Download, FileHeart, Pencil, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Assessment } from "@/lib/assessment/types";
import type { DerivedResults } from "@/lib/assessment/calculations";
import { buildPatientBlock, newPatientProgress, PATIENT_BLOCKS, PATIENT_TITLES, PATIENT_REPORT_FINAL_MESSAGE, patientBlockKeys, patientHeader, patientReviewWarnings, pendingPatientBlocks, resumePatientReport, type PatientBlock, type PatientItem, type PatientProgress } from "@/lib/assessment/patient-report";

export function PatientReport({ a, d, visible }: { a: Assessment; d: DerivedResults; visible: boolean }) {
  const [progress, setProgress] = useState<PatientProgress>(newPatientProgress);
  const progressRef = useRef(progress);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const running = useRef(false);
  const keys = patientBlockKeys(a, d);
  const pending = pendingPatientBlocks(progress, keys);
  const warnings = patientReviewWarnings(a, d);
  const header = patientHeader(a);
  const saveProgress = (p: PatientProgress) => { progressRef.current = p; setProgress(p); };

  async function resume() {
    if (running.current) return;
    running.current = true;
    setBusy(true); setOpened(true); setError(false);
    try {
      await resumePatientReport(progressRef.current, keys, async b => {
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        return buildPatientBlock(b, a, d);
      }, saveProgress);
    } catch {
      setError(true);
      toast.error("O processamento foi interrompido. Os blocos concluídos foram preservados; tente retomar.");
    } finally { running.current = false; setBusy(false); }
  }

  function edit(b: PatientBlock, index: number, field: keyof PatientItem, value: string) {
    const section = progressRef.current.blocos[b];
    if (!section) return;
    saveProgress({ blocos: { ...progressRef.current.blocos, [b]: { ...section, editado: true, itens: section.itens.map((i, n) => n === index ? { ...i, [field]: value } : i) } } });
  }
  async function exportPDF() {
    try {
      const { generatePatientPDF } = await import("@/lib/assessment/patient-report-pdf");
      generatePatientPDF(header.nome, header.data, header.objetivo, progressRef.current, warnings);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível exportar o relatório do paciente. Sua revisão foi preservada."); }
  }
  if (!visible) return null;
  return <section className="mt-6 border-t border-line pt-6" aria-label="Relatório do paciente">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-semibold">Relatório do Paciente</h2>
      <Button onClick={() => void resume()} disabled={busy} className="h-auto min-h-10 whitespace-normal text-left"><FileHeart />{busy ? "Processando…" : "Gerar Relatório do Paciente"}</Button>
    </div>
    {opened && <>
      <div className="my-4 flex flex-wrap items-center gap-2">
        {PATIENT_BLOCKS.map(b => <span key={b} className="text-xs text-ink-soft">{b}: {progress.blocos[b] ? (pending.includes(b) ? "revisar atualização" : "concluído") : "pendente"}</span>)}
        <div className="ml-auto flex flex-wrap gap-2">
          {(pending.length > 0 || error) && <Button variant="outline" disabled={busy} onClick={() => void resume()}><RotateCcw />Retomar pendentes</Button>}
          <Button variant="outline" disabled={busy} onClick={() => setEditing(v => !v)}><Pencil />{editing ? "Concluir revisão" : "Editar"}</Button>
          <Button disabled={busy || pending.length > 0 || !header.nome} onClick={() => void exportPDF()}><Download />Salvar PDF do paciente</Button>
          <Button variant="ghost" size="icon" title="Fechar prévia" aria-label="Fechar prévia" onClick={() => setOpened(false)}><X /></Button>
        </div>
      </div>
      {!header.nome && <p className="mb-3 text-sm text-warn">Informe o nome completo para exportar o PDF.</p>}
      {warnings.length > 0 && <div className="mb-4 border-l-2 border-warn bg-warn-soft p-3 text-sm text-warn">{warnings.map(w => <p key={w}>{w}</p>)}</div>}
      {pending.some(b => progress.blocos[b]?.editado) && <p className="mb-3 text-sm text-warn">A avaliação mudou. A retomada preservará seus textos editados; revise-os com os dados atuais.</p>}
      <article className="mx-auto max-w-3xl bg-card px-5 py-6 text-card-foreground sm:px-8" aria-label="Prévia do Relatório do Paciente">
        <header className="mb-5 border-b-2 border-accent pb-4">
          <h2 className="text-2xl font-semibold">Relatório do Paciente</h2>
          <p className="mt-1 text-lg font-medium">{header.nome || "Nome não informado"}</p>
          <p className="mt-1 text-sm text-ink-soft">{[header.data, header.objetivo].filter(Boolean).join(" · ")}</p>
        </header>
        {PATIENT_BLOCKS.map(b => <section key={b} className="mb-5" aria-label={PATIENT_TITLES[b]}>
          <h3 className="mb-3 text-base font-semibold text-accent">{b} — {PATIENT_TITLES[b]}</h3>
          {!progress.blocos[b] ? <p className="text-sm text-ink-soft">Pendente</p> : !progress.blocos[b]?.itens.length ? <p className="text-sm text-ink-soft">Dados insuficientes para este bloco. Revisão pelo nutricionista necessária.</p> : <div className={b === "A" ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "space-y-3"}>
            {progress.blocos[b]?.itens.map((item, index) => <div key={`${b}-${index}`} className={b === "A" ? "rounded-lg bg-accent-soft p-3" : "border-b border-line pb-3"}>
              {editing ? <div className="space-y-2">
                {(["titulo", "texto", ...(b === "C" ? ["acao", "acompanhamento"] : [])] as (keyof PatientItem)[]).map(field => <label key={field} className="block text-xs text-ink-soft">{field === "titulo" ? "Título" : field === "texto" ? "O que será melhorado / informação" : field === "acao" ? "Ação prática" : "Como acompanhar"}<textarea aria-label={`${b}${index + 1} ${field}`} rows={2} className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground" value={item[field] ?? ""} onChange={e => edit(b, index, field, e.target.value)} /></label>)}
              </div> : <><h4 className="font-semibold">{item.titulo}</h4><p className="mt-1 text-sm leading-relaxed">{item.texto}</p>{item.acao && <p className="mt-1 text-sm leading-relaxed"><strong>Ação prática: </strong>{item.acao}</p>}{item.acompanhamento && <p className="mt-1 text-sm leading-relaxed"><strong>Como acompanhar: </strong>{item.acompanhamento}</p>}</>}
            </div>)}
          </div>}
        </section>)}
        <p className="border-t border-line pt-4 text-sm font-medium leading-relaxed">{PATIENT_REPORT_FINAL_MESSAGE}</p>
        <p className="mt-3 text-xs text-ink-soft">GC - Excelência em Nutrição</p>
      </article>
    </>}
  </section>;
}