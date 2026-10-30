import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { novoId } from "@/lib/assessment/initial-state";
import { chaveDiario, composicaoParaRelatorio, type ComposicaoDiario } from "@/lib/assessment/diet-composition";
import { opcoesDeLocal } from "@/lib/assessment/food-diary";
import type { Refeicao } from "@/lib/assessment/types";
import { Select, TextInput } from "./fields";

export function novaRefeicaoAtipica(): Refeicao {
  return { id: novoId(), refeicao: "", horario: "", local: "", alimentos: [{ id: novoId(), alimento: "", quantidade: "" }] };
}

interface Props {
  refeicoes: Refeicao[];
  onChange: (refeicoes: Refeicao[]) => void;
  composicao: ComposicaoDiario | null;
  calculando: boolean;
  onCalcular: () => void;
  onCopiarR24h: () => void;
  r24h?: ReactNode;
}

export function AtypicalDay({ refeicoes, onChange, composicao, calculando, onCalcular, onCopiarR24h, r24h }: Props) {
  const comp = composicaoParaRelatorio(composicao);
  const [foco, setFoco] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLInputElement>());
  useEffect(() => {
    if (!foco) return;
    refs.current.get(foco)?.focus();
    setFoco(null);
  }, [foco, refeicoes]);
  const atualizar = (id: string, patch: Partial<Refeicao>) => onChange(refeicoes.map(r => r.id === id ? { ...r, ...patch } : r));
  const adicionarAlimento = (r: Refeicao) => {
    const item = { id: novoId(), alimento: "", quantidade: "" };
    atualizar(r.id, { alimentos: [...r.alimentos, item] });
    return item.id;
  };
  return (
    <section aria-labelledby="dia-atipico-titulo" className="mt-6 border-t border-line pt-6">
      <h2 id="dia-atipico-titulo" className="mb-5 font-display text-base font-semibold tracking-tight">Dia atípico</h2>
      <div className="space-y-4">
        {refeicoes.map(r => (
          <div key={r.id} className="rounded-lg bg-card/50 p-4 ring-1 ring-line">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr_auto]">
              <TextInput value={r.refeicao} placeholder="Refeição" onChange={v => atualizar(r.id, { refeicao: v })} />
              <TextInput type="time" value={r.horario} onChange={v => atualizar(r.id, { horario: v })} />
              <Select value={r.local} placeholder="Local" options={opcoesDeLocal(r.local)} onChange={v => atualizar(r.id, { local: v })} />
              <Button variant="outline" className="h-auto whitespace-normal" onClick={() => onChange(refeicoes.filter(x => x.id !== r.id))}>Remover refeição</Button>
            </div>
            <div className="mt-4 space-y-2 border-t border-line/70 pt-4">
              {r.alimentos.map((item, i) => (
                <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <TextInput value={item.alimento} placeholder="Alimento" inputRef={el => { if (el) refs.current.set(item.id, el); else refs.current.delete(item.id); }} onChange={v => atualizar(r.id, { alimentos: r.alimentos.map(x => x.id === item.id ? { ...x, alimento: v } : x) })} />
                  <TextInput value={item.quantidade} placeholder="Quantidade" onChange={v => atualizar(r.id, { alimentos: r.alimentos.map(x => x.id === item.id ? { ...x, quantidade: v } : x) })} onKeyDown={e => { if (e.key === "Tab" && !e.shiftKey && i === r.alimentos.length - 1) { e.preventDefault(); setFoco(adicionarAlimento(r)); } }} />
                  <Button variant="outline" className="h-auto whitespace-normal" onClick={() => atualizar(r.id, { alimentos: r.alimentos.filter(x => x.id !== item.id) })}>Remover alimento</Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => adicionarAlimento(r)}>+ Adicionar alimento</Button>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => onChange([...refeicoes, novaRefeicaoAtipica()])}>+ Adicionar refeição</Button>
          <Button onClick={onCopiarR24h} className="h-auto whitespace-normal text-center text-[13px]">Copiar R24h</Button>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Button disabled={calculando} onClick={onCalcular} className="h-auto whitespace-normal text-center text-[13px]">{calculando ? "Calculando…" : "Calcular R24h + dia atípico"}</Button>
      </div>
      {(comp || r24h) && (
        <div className="mt-4 rounded-[14px] bg-accent p-5 text-white" aria-live="polite">
          {r24h && (
            <div className="mb-5 border-b border-white/20 pb-5">
              <h3 className="mb-2 font-display text-sm font-semibold">Recordatório 24 horas</h3>
              {r24h}
            </div>
          )}
          {comp && <>
          <h3 className="mb-2 font-display text-sm font-semibold">Dia atípico</h3>
          {composicao?.chave !== chaveDiario(refeicoes) && <p className="mb-3 text-xs">O dia atípico foi alterado. Recalcule para atualizar.</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {comp.totais.map(t => <div key={t.label}><p className="text-[11px] opacity-70">{t.label}</p><p className="mt-1 font-mono text-sm tabular-nums">{t.valor}</p></div>)}
          </div>
          <ul className="mt-4 space-y-2">
            {composicao?.itens.map((item, i) => <li key={i} className="text-xs"><strong>{item.refeicao}</strong> — {comp.itens[i]?.texto}<span className="block font-mono text-[11px] opacity-70">{comp.itens[i]?.valores}</span></li>)}
          </ul>
          <p className="mt-3 text-[11px] opacity-70">{comp.nota}</p>
          </>}
        </div>
      )}
    </section>
  );
}