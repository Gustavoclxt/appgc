import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { limitarCasasDecimais } from "@/lib/assessment/numeric";
import { comIntervalo } from "@/lib/assessment/selection-range";

export function Panel({
  titulo,
  meta,
  extra,
  children,
  className,
}: {
  titulo?: string;
  meta?: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      {(titulo || meta) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            {titulo && <h2 className="font-display text-base font-semibold tracking-tight">{titulo}</h2>}
            {extra}
          </div>
          {meta && <span className="eyebrow">{meta}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>}
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-soft">{hint}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-[10px] bg-white/70 px-3 py-2.5 text-sm text-ink outline-none ring-1 ring-line transition-shadow placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent/40";

export function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  mono,
  onKeyDown,
  dataAlimentoId,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  dataAlimentoId?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}) {
  return (
    <input
      ref={inputRef}
      type={type}
      value={value}
      placeholder={placeholder}
      data-alimento-id={dataAlimentoId}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={cn(inputBase, mono && "font-mono")}
    />
  );
}


export function DoseInput({
  value,
  onChange,
  unit = "mg",
}: {
  value: string;
  onChange: (v: string) => void;
  unit?: string;
}) {
  const isNumeric = /^\d+(?:[.,]\d*)?$/.test(value.trim());
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder="Dose"
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, isNumeric && "pr-12")}
      />
      {isNumeric && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft">
          {unit}
        </span>
      )}
    </div>
  );
}


export function UnitInput({
  value,
  onChange,
  unidade,
  placeholder,
  casas,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  unidade: string;
  placeholder?: string;
  casas?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center rounded-[10px] bg-white/70 ring-1 ring-line focus-within:ring-2 focus-within:ring-accent/40", className)}>
      <input
        value={value}
        placeholder={placeholder}
        inputMode="decimal"
        onChange={(e) => onChange(casas == null ? e.target.value : limitarCasasDecimais(e.target.value, casas))}
        className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-ink-soft/60"
      />
      <span className="pr-3 font-mono text-[11px] text-ink-soft">{unidade}</span>
    </div>
  );
}

export function LongText({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputBase, "resize-y leading-relaxed")}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecione",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputBase, "appearance-none bg-white/70 pr-10")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={16}
        strokeWidth={2}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  );
}

const ARMSTRONG_OPCOES: { value: string; label: string; cor: string }[] = [
  { value: "A1", label: "A1 - Normal", cor: "#fafad4" },
  { value: "A2", label: "A2 - Normal", cor: "#f7f6be" },
  { value: "A3", label: "A3 - Normal", cor: "#f5f190" },
  { value: "A4", label: "A4 - Má hidratação", cor: "#f2ec62" },
  { value: "A5", label: "A5 - Má hidratação", cor: "#f1ea21" },
  { value: "A6", label: "A6 - Má hidratação", cor: "#eac80e" },
  { value: "A7", label: "A7 - Desidratação severa", cor: "#deab14" },
  { value: "A8", label: "A8 - Desidratação severa", cor: "#c58929" },
];

function BolinhaArmstrong({ cor }: { cor: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-ink/15"
      style={{ backgroundColor: cor }}
    />
  );
}

export function ArmstrongSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const selecionada = ARMSTRONG_OPCOES.find((o) => o.value === value);

  useEffect(() => {
    if (!aberto) return;
    const fecharFora = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };
    const fecharEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharEsc);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharEsc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
        className={cn(inputBase, "flex items-center justify-between gap-2 text-left")}
      >
        {selecionada ? (
          <span className="flex items-center gap-2">
            <BolinhaArmstrong cor={selecionada.cor} />
            {selecionada.label}
          </span>
        ) : (
          <span className="text-ink-soft/60">Selecione</span>
        )}
        <ChevronDown aria-hidden size={16} strokeWidth={2} className="shrink-0 text-ink-soft" />
      </button>
      {aberto && (
        <ul
          role="listbox"
          aria-label="Escala de Armstrong"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-[10px] bg-white py-1 shadow-lg ring-1 ring-line"
        >
          {ARMSTRONG_OPCOES.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setAberto(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-accent/10",
                  o.value === value && "bg-accent/5 font-medium",
                )}
              >
                <BolinhaArmstrong cor={o.cor} />
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OptionRow({
  value,
  onChange,
  options,
  circular = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  circular?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center", circular || options.some((o) => o.label === "Sim" || o.label === "Não") ? "gap-x-6 gap-y-2" : "gap-2")}>
      {options.map((o) => {
        const ativo = value === o.value;
        if (circular || o.label === "Sim" || o.label === "Não") {
          return (
            <Button
              key={o.value}
              type="button"
              variant="ghost"
              aria-pressed={ativo}
              onClick={() => onChange(ativo ? "" : o.value)}
              className="h-auto min-h-9 gap-2 rounded-sm px-0 py-2 text-[13px] font-normal text-ink hover:bg-transparent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring transition-none [&_svg]:size-4"
            >
              <span aria-hidden className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", ativo ? "border-accent" : "border-ink-soft/60")}>
                {ativo && <span className="h-2 w-2 rounded-full bg-accent" />}
              </span>
              {o.label}
            </Button>
          );
        }
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(ativo ? "" : o.value)}
            className={cn(
              "rounded-[10px] px-3 py-2 text-[13px] transition-colors",
              ativo
                ? "bg-accent text-white ring-1 ring-accent/40"
                : "bg-white/70 text-ink ring-1 ring-line hover:bg-white",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function MultiOptionRow({
  values,
  onChange,
  options,
  circular = false,
}: {
  values: string[];
  onChange: (v: string[], info?: { alvo: string; porIntervalo: boolean }) => void;
  options: { value: string; label: string; className?: string; breakAfter?: boolean }[];
  circular?: boolean;
}) {
  const ancoraNova = useRef<string | null>(null);
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v], { alvo: v, porIntervalo: false });
  const selecionar = (v: string, shift: boolean) => {
    if (shift && ancoraNova.current) {
      // Shift+click: seleciona todos os botões entre a âncora e o alvo, inclusive os extremos.
      onChange(comIntervalo(options.map((o) => o.value), ancoraNova.current, v, values), {
        alvo: v,
        porIntervalo: true,
      });
      return;
    }
    ancoraNova.current = v;
    toggle(v);
  };
  return (
    <div className={cn("flex flex-wrap", circular ? "gap-x-6 gap-y-2" : "gap-2")}>
      {options.map((o) => {
        const ativo = values.includes(o.value);
        return (
          <Fragment key={o.value}>
            {circular ? (
              <Button
                type="button"
                variant="ghost"
                aria-pressed={ativo}
                onClick={(e) => selecionar(o.value, e.shiftKey)}
                className={cn(
                  "h-auto min-h-9 gap-2 rounded-sm px-0 py-2 text-[13px] font-normal text-ink hover:bg-transparent hover:text-ink focus-visible:ring-2 focus-visible:ring-ring transition-none [&_svg]:size-4",
                  o.className,
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    ativo ? "border-accent" : "border-ink-soft/60",
                  )}
                >
                  {ativo && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                {o.label}
              </Button>
            ) : (
              <button
                type="button"
                onClick={(e) => selecionar(o.value, e.shiftKey)}
                className={cn(
                  "rounded-[10px] px-3 py-2 text-[13px] transition-colors",
                  o.className,
                  ativo
                    ? "bg-accent text-white ring-1 ring-accent/40"
                    : "bg-white/70 text-ink ring-1 ring-line hover:bg-white",
                )}
              >
                {o.label}
              </button>
            )}
            {o.breakAfter && <div aria-hidden className={cn("h-0 w-full sm:hidden", o.className)} />}
          </Fragment>
        );
      })}
    </div>
  );
}

export function Readout({
  label,
  valor,
  sub,
  destaque,
}: {
  label: string;
  valor: string;
  sub?: string | undefined;
  destaque?: string | undefined;
}) {
  return (
    <div className="settle">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-white">{label}</span>
        <span className="font-mono text-3xl font-medium tracking-tight tabular-nums text-white">{valor}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-[11px] text-white">{sub}</span>
        {destaque && (
          <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px] text-white">
            {destaque}
          </span>
        )}
      </div>
    </div>
  );
}

export function MetricCard({ label, valor, sub, extra }: { label: string; valor: string; sub: string; extra?: ReactNode }) {
  return (
    <div className="rounded-[10px] bg-accent-soft/70 p-4 ring-1 ring-accent/15">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">{label}</p>
      <p className="mt-1 font-mono text-2xl font-medium tracking-tight tabular-nums text-ink">{valor}</p>
      <p className="text-[11px] text-ink-soft">{sub}</p>
      {extra}
    </div>
  );
}

export function RowButton({
  onClick,
  children,
  className,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[10px] bg-white/70 px-3 py-2 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-white",
        disabled && "cursor-not-allowed opacity-50 hover:bg-white/70",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SubTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("mb-3 mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent", className)}>
      {children}
    </h3>
  );
}
