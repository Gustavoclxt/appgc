import { useId, useRef, useState } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { aplicarSelecaoPreferencia } from "@/lib/assessment/food-preferences";

/**
 * Menu de seleção de preferências alimentares com etiquetas removíveis e
 * “+ Adicionar”, no mesmo padrão de HealthConditionsSelect. As regras de
 * “Nenhum(a)”/“Todos(as)” continuam centralizadas em aplicarSelecaoPreferencia.
 */
export function FoodPreferencesSelect({ label, values, options, onChange, placeholder = "Selecione os alimentos", addPlaceholder = "Nome do alimento" }: {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const chave = (item: string) => item.toLocaleLowerCase("pt-BR");
  const disponiveis = options.filter((item) => !values.some((s) => chave(s) === chave(item)));
  const adicionar = (item: string, opcoes: string[]) => {
    onChange(aplicarSelecaoPreferencia(values, [...values, item], opcoes, item));
  };
  const remover = (item: string) => {
    onChange(aplicarSelecaoPreferencia(values, values.filter((v) => v !== item), options, item));
  };
  const add = () => {
    const limpo = name.trim();
    if (!limpo) return;
    adicionar(limpo, [...options, limpo]);
    setName("");
    setAdding(false);
  };

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setAdding(false); }}>
      <PopoverAnchor asChild>
        <div className="flex min-h-14 w-full flex-wrap items-center gap-2 rounded-lg border border-input bg-card p-2" onClick={() => setOpen(true)}>
          {values.map((item) => (
            <span key={item} className="flex max-w-full items-center gap-2 rounded-full bg-primary py-1.5 pl-3 pr-1.5 text-xs text-primary-foreground">
              <span className="min-w-0 break-words">{item}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0 rounded-full text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground transition-none" aria-label={`Remover ${item} de ${label}`} onClick={(event) => { event.stopPropagation(); remover(item); }}>
                <X aria-hidden />
              </Button>
            </span>
          ))}
          <Button ref={trigger} type="button" variant="ghost" aria-label={`Selecionar ${label}`} aria-expanded={open} aria-haspopup="dialog" aria-controls={open ? id : undefined} className="h-auto min-h-9 min-w-10 flex-1 justify-between whitespace-normal px-2 text-left text-xs font-normal text-ink-soft hover:bg-muted hover:text-ink transition-none" onClick={(event) => { event.stopPropagation(); setOpen(!open); }}>
            {values.length === 0 ? <span>{placeholder}</span> : <span className="sr-only">Selecionar alimentos</span>}
            <ChevronDown aria-hidden className="ml-auto" />
          </Button>
        </div>
      </PopoverAnchor>
      <PopoverContent id={id} aria-label={label} align="start" className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto rounded-lg p-4 sm:p-5 data-[state=open]:animate-none data-[state=closed]:animate-none" onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus(); }}>
        <h3 className="mb-3 text-sm font-semibold text-ink">{label}</h3>
        <div className="flex flex-wrap gap-2">
          {disponiveis.map((item) => (
            <Button key={item} type="button" variant="secondary" className="h-auto min-h-9 max-w-full whitespace-normal rounded-full bg-muted px-3 py-2 text-left text-xs font-normal text-ink hover:bg-accent-soft hover:text-accent transition-none" onClick={() => adicionar(item, options)}>{item}</Button>
          ))}
        </div>
        {adding ? (
          <form className="mt-4 flex flex-wrap items-center gap-2" onSubmit={(event) => { event.preventDefault(); add(); }}>
            <input autoFocus aria-label={`Novo alimento em ${label}`} value={name} onChange={(event) => setName(event.target.value)} placeholder={addPlaceholder} className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:ring-2 focus:ring-ring" />
            <Button type="submit" disabled={!name.trim()} className="transition-none"><Plus aria-hidden />Adicionar</Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Cancelar inclusão" className="transition-none" onClick={() => { setAdding(false); setName(""); }}><X aria-hidden /></Button>
          </form>
        ) : (
          <Button type="button" variant="ghost" className="mt-3 text-accent hover:bg-accent-soft hover:text-accent transition-none" onClick={() => setAdding(true)}><Plus aria-hidden />Adicionar</Button>
        )}
        <div className="mt-4 border-t border-line pt-3">
          <Button type="button" variant="ghost" className="text-warn hover:bg-warn-soft hover:text-warn transition-none" onClick={() => setOpen(false)}><X aria-hidden />Fechar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
