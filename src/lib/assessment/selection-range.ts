/**
 * Shared selection-range helper for MultiOptionRow buttons.
 * Shift+click selects every option between the anchor and the clicked option, inclusive.
 */
export function comIntervalo(
  options: string[],
  anchor: string | null,
  target: string,
  values: string[],
): string[] {
  const i = anchor ? options.indexOf(anchor) : -1;
  const j = options.indexOf(target);
  if (i < 0 || j < 0) return values;
  const [inicio, fim] = i <= j ? [i, j] : [j, i];
  const intervalo = options.slice(inicio, fim + 1);
  return [...values, ...intervalo.filter((v) => !values.includes(v))];
}
