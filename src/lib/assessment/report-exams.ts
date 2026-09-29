import type { ExameLaboratorial } from "./types";

const EXAMES_SEMPRE_INCLUIDOS = ["vitamina d", "vitamina b12", "ferro", "ferritina"];

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
    return EXAMES_SEMPRE_INCLUIDOS.some(
      (exameObrigatorio) => nome === exameObrigatorio || nome.startsWith(`${exameObrigatorio} `),
    );
  });
}