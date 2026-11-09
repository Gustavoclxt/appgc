export function parseNumero(valor: string): number | null {
  if (valor === undefined || valor === null) return null;
  const normalizado = String(valor).trim().replace(",", ".");
  if (normalizado === "") return null;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

// Mantém apenas números com, no máximo, a quantidade informada de casas decimais.
// Aceita vírgula ou ponto como separador e descarta qualquer outro caractere.
export function limitarCasasDecimais(valor: string, casas = 2): string {
  let out = "";
  let sep = -1;
  for (const ch of valor) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if ((ch === "," || ch === ".") && sep === -1) {
      sep = out.length;
      out += ch;
    }
  }
  if (sep >= 0 && out.length - sep - 1 > casas) out = out.slice(0, sep + 1 + casas);
  return out;
}
