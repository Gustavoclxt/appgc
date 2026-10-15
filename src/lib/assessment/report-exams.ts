import type { ExameLaboratorial } from "./types";

const EXAMES_SEMPRE_INCLUIDOS = [
  ["vitamina d", "vitamina d3", "25 oh vitamina d", "25 hidroxi vitamina d", "25 hidroxivitamina d", "hidroxivitamina d", "25 oh d", "calcidiol"],
  ["vitamina b12", "vit b12", "b12", "cobalamina"],
  ["ferro", "ferro serico", "ferro total"],
  ["ferritina"],
];

function normalizarNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function examesParaRelatorio(exames: ExameLaboratorial[]) {
  return exames.filter((exame) => {
    if (exame.status === "abaixo" || exame.status === "acima") return true;

    const nome = normalizarNome(exame.exame);
    return EXAMES_SEMPRE_INCLUIDOS.some((aliases) =>
      aliases.some(
        (alias) => ` ${nome} `.includes(` ${alias} `),
      ),
    );
  });
}