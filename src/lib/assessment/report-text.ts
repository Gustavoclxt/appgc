import { fmt2, fmtData, fmtInt, fmtLitros, labelEstrategia, labelMetodo, type DerivedResults } from "./calculations";
import type { AnaliseIA, Assessment } from "./types";
import { anamneseParaRelatorio } from "./report-anamnesis";
import { diarioParaRelatorio } from "./food-diary";
import { examesParaRelatorio } from "./report-exams";
import { composicaoParaRelatorio, type ComposicaoDiario } from "./diet-composition";
import { linhasAlimentosRetirar } from "./food-preferences";
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
  formato?: "tabela" | "grupos" | "lista-ordenada" | "checklist";
}

const statusLabel: Record<string, string> = {
  dentro: "Dentro da referência",
  abaixo: "Abaixo",
  acima: "Acima",
  indeterminado: "Indeterminado",
};

function montar(a: Assessment, d: DerivedResults, analise: AnaliseIA, composicao: ComposicaoDiario | null): Bloco[] {
  const kv = (l: string, v: string): Linha => ({ texto: `${l}: ${v || "—"}`, rotulo: l, valor: v || "—" });
  const blocos: Bloco[] = [];
  blocos.push({
    titulo: "Dados do paciente",
    linhas: [
      kv("Data da avaliação", fmtData(a.dataAvaliacao)),
      kv("Nome", a.nome),
      kv("Idade", d.idade !== null ? `${d.idade} anos` : ""),
      kv("Sexo", a.sexo ? (a.sexo === "masculino" ? "Masculino" : "Feminino") : ""),
      kv("Altura", d.alturaCm !== null ? `${fmt2(d.alturaCm)} cm` : ""),
      kv("Peso", d.pesoKg !== null ? `${fmt2(d.pesoKg)} kg` : ""),
      kv("Profissão", a.profissao),
      kv("Objetivos", a.objetivos.join(", ")),
      kv("IMC", d.imc !== null ? `${fmt2(d.imc)} — ${d.classificacaoIMC}` : ""),
      kv("% de gordura", d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : "não informado"),
      kv("Massa gorda", d.massaGorda !== null ? `${fmt2(d.massaGorda)} kg` : ""),
      kv("Massa livre de gordura", d.massaLivreGordura !== null ? `${fmt2(d.massaLivreGordura)} kg` : ""),
      kv("Método de TMB", labelMetodo[a.metodoTMB] ?? ""),
      kv("TMB", d.tmb !== null ? `${fmtInt(d.tmb)} kcal/dia` : ""),
      kv("Fator de atividade", d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : ""),
      kv("VET", d.vet !== null ? `${fmtInt(d.vet)} kcal/dia` : ""),
      kv(
        "Hidratação",
        d.aguaMin !== null
          ? `${fmtInt(d.aguaMin)}–${fmtInt(d.aguaMax)} mL/dia (${fmtLitros(d.aguaMin)}–${fmtLitros(d.aguaMax)} L/dia)`
          : "",
      ),
      kv("Estratégia", labelEstrategia[a.estrategia] ?? ""),
      kv("Calorias sugeridas", d.caloriasSugeridas !== null ? `${fmtInt(d.caloriasSugeridas)} kcal/dia` : ""),
    ],
    formato: "tabela",
  });
  for (const s of anamneseParaRelatorio(a, d))
    blocos.push({ titulo: s.title, linhas: s.fields.map((f) => kv(f.label, f.value)), formato: "tabela" });
  const retirar = linhasAlimentosRetirar(a);
  if (retirar.length) blocos.push({ titulo: "Alimentos não consumidos", linhas: retirar.map((texto) => ({ texto })) });

  const diario = diarioParaRelatorio(a.diarioAlimentar);
  if (diario.length) {
    const linhas: Bloco["linhas"] = [];
    for (const r of diario) {
      linhas.push({ texto: [r.refeicao, r.horario, r.local].filter(Boolean).join(" · "), negrito: true });
      for (const al of r.alimentos) linhas.push({ texto: al, nivel: 1 });
    }
    blocos.push({ titulo: "Recordatório 24h", linhas, formato: "grupos" });
  }
  const comp = composicaoParaRelatorio(composicao);
  if (comp) {
    blocos.push({
      titulo: "Composição estimada do Recordatório 24h",
      linhas: comp.totais.map((t) => kv(t.label, t.valor)),
      formato: "tabela",
    });
  }
  const exames = examesParaRelatorio(a.exames);
  if (exames.length) {
    blocos.push({
      titulo: "Exames laboratoriais",
      linhas: [
        ...exames.map((e) => ({
          texto: `${e.exame}: ${e.resultado} ${e.unidade} (ref.: ${e.referencia || "—"}) — ${statusLabel[e.status] ?? e.status}`,
          nivel: 1 as const,
        })),
        ...(a.observacoesExames ? [{ texto: `Observações: ${a.observacoesExames}` }] : []),
      ],
    });
  }
  const painel = painelClinicoParaRelatorio(analise, a, d, composicao);
  if (painel.resumo.length) {
    blocos.push({ titulo: "Resumo clínico", linhas: painel.resumo.map((item) => kv(item.label, item.valor)), formato: "tabela" });
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
    blocos.push({ titulo: "Foco até o próximo retorno", linhas: painel.foco.map((texto, index) => ({ texto: `${index + 1}. ${texto}`, valor: texto })), formato: "lista-ordenada" });
  }
  if (painel.reavaliar.length) {
    blocos.push({ titulo: "Reavaliar no retorno", linhas: painel.reavaliar.map((texto) => ({ texto: `☐ ${texto}`, valor: texto })), formato: "checklist" });
  }
  return blocos;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fonte = "font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.35;color:#1f2933";

function tabelaHtml(linhas: Linha[]) {
  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 10pt 0"><tbody>${linhas
    .map((linha) => `<tr><th scope="row" style="${fonte};width:34%;padding:3pt 10pt 3pt 0;text-align:left;vertical-align:top;font-weight:700">${esc(linha.rotulo ?? "")}</th><td style="${fonte};padding:3pt 0;vertical-align:top">${esc(linha.valor ?? "—")}</td></tr>`)
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
      html += `<h3 style="${fonte};font-weight:700;margin:8pt 0 3pt 0">${esc(linha.texto)}</h3>`;
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
  if (bloco.formato === "tabela") return titulo + tabelaHtml(bloco.linhas);
  if (bloco.formato === "grupos") return titulo + gruposHtml(bloco.linhas);
  if (bloco.formato === "lista-ordenada") {
    return titulo + `<ol style="margin:0 0 10pt 20pt;padding:0">${bloco.linhas.map((linha) => `<li style="${fonte};margin:0 0 4pt 0;padding-left:2pt">${esc(linha.valor ?? linha.texto)}</li>`).join("")}</ol>`;
  }
  if (bloco.formato === "checklist") {
    return titulo + `<ul style="margin:0 0 10pt 0;padding:0;list-style:none">${bloco.linhas.map((linha) => `<li style="${fonte};margin:0 0 4pt 0">☐ ${esc(linha.valor ?? linha.texto)}</li>`).join("")}</ul>`;
  }
  return titulo + `<div>${bloco.linhas.map((linha) => `<p style="${fonte};margin:0 0 4pt ${(linha.nivel ?? 0) * 18}pt">${linha.negrito ? `<strong>${esc(linha.texto)}</strong>` : esc(linha.texto)}</p>`).join("")}</div>`;
}

/** Texto puro e HTML rico e semântico para colar em editores de texto. */
export function relatorioParaCopia(a: Assessment, d: DerivedResults, analise: AnaliseIA, composicao: ComposicaoDiario | null) {
  const blocos = montar(a, d, analise, composicao);
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
