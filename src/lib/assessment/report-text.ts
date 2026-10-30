import { metasParaRelatorio } from "./weight-goals-report";
import type { MetasPesoResultado } from "./weight-goals";
import type { DerivedResults } from "./calculations";
import type { AnaliseIA, Assessment, Refeicao } from "./types";
import { relatorioEstruturado } from "./report-structure";
import type { ComposicaoDiario } from "./diet-composition";
import { painelClinicoParaRelatorio } from "./clinical-dashboard";

interface Linha {
  texto: string;
  nivel?: 0 | 1 | 2;
  negrito?: boolean;
  rotulo?: string;
  valor?: string;
}

interface Bloco {
  titulo: string;
  linhas: Linha[];
  colunas?: string[];
  celulas?: string[][];
  formato?: "tabela" | "grupos" | "lista" | "lista-ordenada" | "checklist";
}

const statusLabel: Record<string, string> = {
  dentro: "Dentro da referência",
  abaixo: "Abaixo",
  acima: "Acima",
  indeterminado: "Indeterminado",
};

function montar(
  a: Assessment,
  d: DerivedResults,
  analise: AnaliseIA,
  composicao: ComposicaoDiario | null,
  metas: MetasPesoResultado | null = null,
  diaAtipico: Refeicao[] | null = null,
  composicaoAtipica: ComposicaoDiario | null = null,
): Bloco[] {
  const kv = (l: string, v: string): Linha => ({
    texto: `${l}: ${v || "—"}`,
    rotulo: l,
    valor: v || "—",
  });
  const blocos: Bloco[] = [];
  for (const b of relatorioEstruturado(a, d, composicao, diaAtipico, composicaoAtipica, metas !== null)) {
    if (b.tipo === "campos") blocos.push({ titulo: b.titulo, linhas: b.campos.map((f) => kv(f.label, f.value)), formato: "tabela" });
    else if (b.tipo === "lista") blocos.push({ titulo: b.titulo, linhas: b.itens.map((texto) => ({ texto })), formato: "lista" });
    else if (b.tipo === "refeicoes") {
      const linhas: Bloco["linhas"] = [];
      for (const r of b.refeicoes) {
        linhas.push({ texto: [r.refeicao, r.horario, r.local].filter(Boolean).join(" · "), negrito: true });
        for (const al of r.alimentos) linhas.push({ texto: al, nivel: 1 });
      }
      blocos.push({ titulo: b.titulo, linhas, formato: "grupos" });
    } else if (b.tipo === "exames") {
      blocos.push({
        titulo: b.titulo,
        linhas: b.exames.map((e) => ({
          texto: `${e.exame}: ${e.resultado} ${e.unidade} (ref.: ${e.referencia || "—"}) — ${statusLabel[e.status] ?? e.status}`,
          nivel: 1 as const,
        })),
        formato: "lista",
      });
    } else if (b.tipo === "metas" && metas) {
      blocos.push({ titulo: "Metas e Projeção de Peso", linhas: [] });
      for (const secao of metasParaRelatorio(metas)) {
        if (secao.colunas && secao.linhas) blocos.push({
          titulo: secao.titulo, formato: "tabela",
          colunas: secao.colunas, celulas: secao.linhas,
          linhas: secao.linhas.map(l => ({ texto: l.join(" | ") })),
        });
        if (secao.itens?.length) blocos.push({ titulo: secao.colunas ? `${secao.titulo} — observações` : secao.titulo, formato: "lista", linhas: secao.itens.map(texto => ({ texto })) });
      }
    }
  }
  const painel = painelClinicoParaRelatorio(analise, a, d, composicao);
  if (painel.resumo.length) {
    blocos.push({
      titulo: "Resumo clínico",
      linhas: painel.resumo.map((item) => kv(item.label, item.valor)),
      formato: "tabela",
    });
  }
  if (painel.achados.length) {
    blocos.push({
      titulo: "Principais achados",
      linhas: painel.achados.flatMap((grupo) => [
        { texto: grupo.titulo.toUpperCase(), negrito: true },
        ...grupo.itens.map((texto) => ({ texto, nivel: 1 as const })),
      ]),
      formato: "grupos",
    });
  }
  if (painel.estrategia.length) {
    blocos.push({
      titulo: "Estratégia inicial",
      linhas: painel.estrategia.flatMap((grupo) => [
        { texto: grupo.categoria, negrito: true },
        ...grupo.acoes.map((texto) => ({ texto: `→ ${texto}`, nivel: 1 as const })),
      ]),
      formato: "grupos",
    });
  }
  if (painel.foco.length) {
    blocos.push({
      titulo: "Foco até o próximo retorno",
      linhas: painel.foco.map((texto, index) => ({
        texto: `${index + 1}. ${texto}`,
        valor: texto,
      })),
      formato: "lista-ordenada",
    });
  }
  if (painel.reavaliar.length) {
    blocos.push({
      titulo: "Reavaliar no retorno",
      linhas: painel.reavaliar.map((texto) => ({ texto: `☐ ${texto}`, valor: texto })),
      formato: "checklist",
    });
  }
  return blocos;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fonte = "font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.35;color:#1f2933";

function tabelaHtml(linhas: Linha[]) {
  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 10pt 0"><tbody>${linhas
    .map(
      (linha) =>
        `<tr><th scope="row" style="${fonte};width:34%;padding:3pt 10pt 3pt 0;text-align:left;vertical-align:top;font-weight:700">${esc(linha.rotulo ?? "")}</th><td style="${fonte};padding:3pt 0;vertical-align:top">${esc(linha.valor ?? "—")}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}

function gruposHtml(linhas: Linha[]) {
  let html = "";
  let listaAberta = false;
  const fecharLista = () => {
    if (!listaAberta) return "";
    listaAberta = false;
    return "</ul>";
  };
  for (const linha of linhas) {
    if (linha.negrito) {
      html += fecharLista();
      html += `<h3 style="${fonte};font-weight:700;margin:8pt 0 3pt 0"><strong>${esc(linha.texto)}</strong></h3>`;
      continue;
    }
    if ((linha.nivel ?? 0) > 0) {
      if (!listaAberta) {
        html += `<ul style="margin:0 0 8pt 18pt;padding:0">`;
        listaAberta = true;
      }
      html += `<li style="${fonte};margin:0 0 3pt 0;padding-left:2pt">${esc(linha.texto)}</li>`;
      continue;
    }
    html += fecharLista();
    html += `<p style="${fonte};margin:0 0 4pt 0">${esc(linha.texto)}</p>`;
  }
  return html + fecharLista();
}

function blocoHtml(bloco: Bloco) {
  const titulo = `<h2 style="${fonte};font-size:13pt;font-weight:700;margin:16pt 0 7pt 0;padding-bottom:3pt;border-bottom:1px solid #cfd6dc">${esc(bloco.titulo)}</h2>`;
  if (bloco.colunas && bloco.celulas) return titulo + `<table style="width:100%;border-collapse:collapse;margin:0 0 10pt 0"><thead><tr>${bloco.colunas.map(c => `<th scope="col" style="${fonte};padding:3pt;text-align:left;font-weight:700">${esc(c)}</th>`).join("")}</tr></thead><tbody>${bloco.celulas.map(l => `<tr>${l.map(c => `<td style="${fonte};padding:3pt;vertical-align:top">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  if (bloco.formato === "tabela") return titulo + tabelaHtml(bloco.linhas);
  if (bloco.formato === "grupos") return titulo + gruposHtml(bloco.linhas);
  if (bloco.formato === "lista") {
    return (
      titulo +
      `<ul style="margin:0 0 10pt 18pt;padding:0">${bloco.linhas.map((linha) => `<li style="${fonte};margin:0 0 4pt 0;padding-left:2pt">${linha.negrito ? `<strong>${esc(linha.texto)}</strong>` : esc(linha.texto)}</li>`).join("")}</ul>`
    );
  }
  if (bloco.formato === "lista-ordenada") {
    return (
      titulo +
      `<ol style="margin:0 0 10pt 20pt;padding:0">${bloco.linhas.map((linha) => `<li style="${fonte};margin:0 0 4pt 0;padding-left:2pt">${esc(linha.valor ?? linha.texto)}</li>`).join("")}</ol>`
    );
  }
  if (bloco.formato === "checklist") {
    return (
      titulo +
      `<ul style="margin:0 0 10pt 0;padding:0;list-style:none">${bloco.linhas.map((linha) => `<li style="${fonte};margin:0 0 4pt 0">☐ ${esc(linha.valor ?? linha.texto)}</li>`).join("")}</ul>`
    );
  }
  return (
    titulo +
    `<div>${bloco.linhas.map((linha) => `<p style="${fonte};margin:0 0 4pt ${(linha.nivel ?? 0) * 18}pt">${linha.negrito ? `<strong>${esc(linha.texto)}</strong>` : esc(linha.texto)}</p>`).join("")}</div>`
  );
}

/** Texto puro e HTML rico e semântico para colar em editores de texto. */
export function relatorioParaCopia(
  a: Assessment,
  d: DerivedResults,
  analise: AnaliseIA,
  composicao: ComposicaoDiario | null,
  metas: MetasPesoResultado | null = null,
  diaAtipico: Refeicao[] | null = null,
  composicaoAtipica: ComposicaoDiario | null = null,
) {
  const blocos = montar(a, d, analise, composicao, metas, diaAtipico, composicaoAtipica);
  const cab = "RELATÓRIO DE AVALIAÇÃO NUTRICIONAL";
  const recuo = ["", "  - ", "      "];
  const texto =
    [cab, "=".repeat(cab.length), ""]
      .concat(
        blocos.flatMap((b) => [
          b.titulo.toUpperCase(),
          "-".repeat(b.titulo.length),
          ...b.linhas.map((l) => `${recuo[l.nivel ?? 0]}${l.texto}`),
          "",
        ]),
      )
      .join("\r\n")
      .trim() + "\r\n";
  const html = `<article style="${fonte};max-width:760px"><header><h1 style="${fonte};font-size:16pt;font-weight:700;margin:0 0 12pt 0">${cab}</h1></header>${blocos.map(blocoHtml).join("")}</article>`;
  return { texto, html };
}
