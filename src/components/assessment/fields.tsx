import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  titulo,
  meta,
  children,
  className,
}: {
  titulo?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      {(titulo || meta) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          {titulo && <h2 className="font-display text-base font-semibold tracking-tight">{titulo}</h2>}
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
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>
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
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
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
}: {
  value: string;
  onChange: (v: string) => void;
  unidade: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center rounded-[10px] bg-white/70 ring-1 ring-line focus-within:ring-2 focus-within:ring-accent/40">
      <input
        value={value}
        placeholder={placeholder}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value)}
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputBase, "appearance-none bg-white/70")}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function OptionRow({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const ativo = value === o.value;
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
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string; className?: string; breakAfter?: boolean }[];
}) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const ativo = values.includes(o.value);
        return (
          <Fragment key={o.value}>
            <button
              type="button"
              onClick={() => toggle(o.value)}
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

export function MetricCard({ label, valor, sub }: { label: string; valor: string; sub: string }) {
  return (
    <div className="rounded-[10px] bg-accent-soft/70 p-4 ring-1 ring-accent/15">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">{label}</p>
      <p className="mt-1 font-mono text-2xl font-medium tracking-tight tabular-nums text-ink">{valor}</p>
      <p className="text-[11px] text-ink-soft">{sub}</p>
    </div>
  );
}

export function RowButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[10px] bg-white/70 px-3 py-2 text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-white"
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
