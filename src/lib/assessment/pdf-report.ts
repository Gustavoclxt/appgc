import { metasParaRelatorio } from "./weight-goals-report";
import type { MetasPesoResultado } from "./weight-goals";
import jsPDF from "jspdf";

import {
  fmt2,
  fmtData,
  fmtInt,
  fmtLitros,
  labelEstrategia,
  labelMetodo,
  type DerivedResults,
} from "./calculations";
import type { AnaliseIA, Assessment, Refeicao } from "./types";
import { relatorioEstruturado } from "./report-structure";
import { examesParaRelatorio } from "./report-exams";
import { diarioParaRelatorio } from "./food-diary";
import { anamneseParaRelatorio } from "./report-anamnesis";
import { composicaoParaRelatorio, type ComposicaoDiario } from "./diet-composition";
import { linhasAlimentosRetirar } from "./food-preferences";
import { painelClinicoParaRelatorio } from "./clinical-dashboard";
import { resumoVetFinal } from "./free-meal";
import { REPORT_HEADER_COLOR } from "./report-theme";
import { registerReportFonts } from "./pdf-font";
import { LOGO_BRANCO_PNG, LOGO_PROPORCAO } from "./pdf-logo";

const MARGEM = 16;
const LARGURA = 210;
const ALTURA = 297;
const CONTEUDO = LARGURA - MARGEM * 2;

const statusLabel: Record<string, string> = {
  dentro: "Dentro da referencia",
  abaixo: "Abaixo",
  acima: "Acima",
  indeterminado: "Indeterminado",
};

export function generatePDF(
  a: Assessment,
  d: DerivedResults,
  analise: AnaliseIA | null,
  composicao: ComposicaoDiario | null = null,
  metas: MetasPesoResultado | null = null,
  composicaoAtipica: ComposicaoDiario | null = null,
  diaAtipico: Refeicao[] | null = null,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerReportFonts(doc);
  let y = MARGEM;

  const quebra = (altura: number) => {
    if (y + altura > ALTURA - MARGEM - 10) {
      doc.addPage();
      y = MARGEM;
    }
  };

  const titulo = (texto: string) => {
    if (y > MARGEM) y += 4;
    quebra(14);
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(11);
    doc.setTextColor(22, 32, 43);
    doc.text(texto.toUpperCase(), MARGEM, y);
    y += 2;
    doc.setDrawColor(15, 111, 106);
    doc.setLineWidth(0.4);
    doc.line(MARGEM, y, MARGEM + CONTEUDO, y);
    y += 5;
  };

  const linha = (label: string, valor: string) => {
    quebra(6);
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(91, 102, 114);
    doc.text(label, MARGEM, y);
    doc.setTextColor(22, 32, 43);
    doc.setFont("ReportSans", "bold");
    doc.text(valor, MARGEM + 58, y);
    y += 5.5;
  };

  const linhaPaciente = (label: string, valor: string) => {
    quebra(6);
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(91, 102, 114);
    const pergunta = `${label}:`;
    doc.text(pergunta, MARGEM, y);
    doc.setTextColor(22, 32, 43);
    doc.setFont("ReportSans", "bold");
    doc.text(valor, MARGEM + doc.getTextWidth(pergunta) + 2.5, y);
    y += 5.5;
  };

  const paragrafo = (texto: string) => {
    if (!texto) return;
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(40, 50, 60);
    const linhas = doc.splitTextToSize(texto, CONTEUDO);
    for (const l of linhas) {
      quebra(5);
      doc.text(l, MARGEM, y);
      y += 4.6;
    }
    y += 2;
  };

  const campoAnamnese = (label: string, valor: string) => {
    const pergunta = /[:?]$/.test(label.trim()) ? label.trim() : `${label.trim()}:`;
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(9);
    const larguraPergunta = doc.getTextWidth(pergunta);
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(9.5);
    const larguraResposta = doc.getTextWidth(valor);
    const respostaCurta = !valor.includes("\n") && larguraPergunta + 2.5 + larguraResposta <= CONTEUDO;

    quebra(respostaCurta ? 6 : 10);
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(9);
    doc.setTextColor(91, 102, 114);
    doc.text(pergunta, MARGEM, y);

    if (respostaCurta) {
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(40, 50, 60);
      doc.text(valor, MARGEM + larguraPergunta + 2.5, y);
      y += 5.5;
      return;
    }

    y += 4.2;
    paragrafo(valor);
  };

  // Cabeçalho centralizado: logotipo, título e subtítulo empilhados no centro
  doc.setFillColor(...REPORT_HEADER_COLOR);
  doc.rect(0, 0, LARGURA, 36, "F");
  doc.addImage(LOGO_BRANCO_PNG, "PNG", (LARGURA - 14 * LOGO_PROPORCAO) / 2, 3.5, 14 * LOGO_PROPORCAO, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("ReportSans", "bold");
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE AVALIAÇÃO NUTRICIONAL", LARGURA / 2, 25, { align: "center" });
  doc.setFont("ReportSans", "normal");
  doc.setFontSize(9);
  doc.text("GC - Excelência em Nutrição", LARGURA / 2, 31, { align: "center" });
  y = 44;

  const renderExames = (exames: ReturnType<typeof examesParaRelatorio>) => {
    const colunas = [
      { x: MARGEM, largura: 64 },
      { x: MARGEM + 64, largura: 36 },
      { x: MARGEM + 100, largura: 43 },
      { x: MARGEM + 143, largura: CONTEUDO - 143 },
    ];
    const linhaTabela = (valores: string[], cabecalho = false) => {
      doc.setFont("ReportSans", cabecalho ? "bold" : "normal");
      doc.setFontSize(8.5);
      const celulas = valores.map((valor, i) => doc.splitTextToSize(valor, (colunas[i]?.largura ?? 30) - 3) as string[]);
      const altura = Math.max(1, ...celulas.map(c => c.length)) * 4 + 2;
      if (!cabecalho && y + altura > ALTURA - MARGEM - 10) {
        quebra(altura);
        linhaTabela(["Exame", "Resultado", "Referência", "Status"], true);
        doc.setFont("ReportSans", "normal");
        doc.setFontSize(8.5);
      } else {
        quebra(altura);
      }
      doc.setTextColor(...(cabecalho ? [91, 102, 114] : [22, 32, 43]) as [number, number, number]);
      celulas.forEach((celula, i) => {
        const coluna = colunas[i];
        if (coluna) doc.text(celula, coluna.x, y, { lineHeightFactor: 1.33 });
      });
      y += altura;
      if (cabecalho) {
        doc.setDrawColor(223, 228, 233);
        doc.setLineWidth(0.2);
        doc.line(MARGEM, y - 2, MARGEM + CONTEUDO, y - 2);
        y += 2;
      }
    };
    linhaTabela(["Exame", "Resultado", "Referência", "Status"], true);
    for (const e of exames) {
      linhaTabela([e.exame, `${e.resultado} ${e.unidade}`.trim(), e.referencia || "—", statusLabel[e.status] ?? "—"]);
    }
    y += 2;
    };

  const renderMetas = (metas: MetasPesoResultado) => {
    for (const secao of metasParaRelatorio(metas)) {
      titulo(secao.titulo);
      if (secao.colunas && secao.linhas) {
        const largura = CONTEUDO / secao.colunas.length;
        const desenharLinha = (valores: string[], negrito: boolean) => {
          doc.setFont("ReportSans", negrito ? "bold" : "normal").setFontSize(8);
          const celulas = valores.map(v => doc.splitTextToSize(v, largura - 3) as string[]);
          const altura = Math.max(...celulas.map(c => c.length)) * 4 + 3;
          quebra(altura);
          doc.setTextColor(40, 50, 60);
          celulas.forEach((c, i) => doc.text(c, MARGEM + i * largura, y));
          y += altura;
        };
        desenharLinha(secao.colunas, true);
        for (const valores of secao.linhas) desenharLinha(valores, false);
      }
      for (const item of secao.itens ?? []) paragrafo(`• ${item.replace(/→/g, ">")}`);
    }
    };

  for (const bloco of relatorioEstruturado(a, d, composicao, diaAtipico, composicaoAtipica, metas !== null)) {
    if (bloco.tipo === "metas") {
      if (!metas) continue;
      titulo(bloco.titulo);
      renderMetas(metas);
      continue;
    }
    titulo(bloco.titulo);
    if (bloco.tipo === "campos") for (const f of bloco.campos) campoAnamnese(f.label, f.value);
    else if (bloco.tipo === "lista") for (const item of bloco.itens) paragrafo(item);
    else if (bloco.tipo === "exames") renderExames(bloco.exames);
    else if (bloco.tipo === "refeicoes") {
      for (const refeicao of bloco.refeicoes) {
        quebra(7);
        doc.setFont("ReportSans", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(22, 32, 43);
        const detalhes = [refeicao.horario ? `- ${refeicao.horario}` : "", refeicao.local ? `(${refeicao.local})` : ""].filter(Boolean).join(" ");
        doc.text(detalhes ? `${refeicao.refeicao} ${detalhes}` : refeicao.refeicao, MARGEM, y);
        y += 4.8;
        for (const alimento of refeicao.alimentos) paragrafo(`• ${alimento}`);
        y += 1;
      }
    }
  }

  if (analise) {
    const painel = painelClinicoParaRelatorio(analise, a, d, composicao);
    if (painel.achados.length) {
      titulo("Principais achados");
      const cores: Record<string, [number, number, number]> = {
        prioridade: [185, 50, 50], monitorar: [184, 133, 20], favoravel: [15, 111, 106],
      };
      for (const grupo of painel.achados) {
        quebra(9);
        const [r, g, b] = cores[grupo.tom ?? "favoravel"] ?? [15, 111, 106];
        doc.setFillColor(r, g, b);
        doc.rect(MARGEM, y - 3.5, 3, 5, "F");
        doc.setFont("ReportSans", "bold");
        doc.setFontSize(9);
        doc.setTextColor(22, 32, 43);
        doc.text(grupo.titulo.toUpperCase(), MARGEM + 6, y);
        y += 5;
        for (const item of grupo.itens) paragrafo(`• ${item}`);
      }
    }
    if (painel.estrategia.length) {
      titulo("Estratégia inicial");
      for (const grupo of painel.estrategia) {
        quebra(7);
        doc.setFont("ReportSans", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 111, 106);
        doc.text(grupo.categoria, MARGEM, y);
        y += 4.5;
        for (const acao of grupo.acoes) paragrafo(`> ${acao}`);
      }
    }
    if (painel.foco.length) {
      titulo("Foco até o próximo retorno");
      painel.foco.forEach((item, index) => paragrafo(`${index + 1}. ${item}`));
    }
    if (painel.reavaliar.length) {
      titulo("Reavaliar no retorno");
      for (const item of painel.reavaliar) paragrafo(`[ ] ${item}`);
    }
  }

  // Rodapé em todas as páginas
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 130, 140);
    doc.text(`${i}/${paginas}`, LARGURA - MARGEM, ALTURA - 10, { align: "right" });
  }

  doc.save(nomeArquivoPdf(a.dataAvaliacao, a.nome));
}

const MESES_EXTENSO = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;

export const nomeArquivoPdf = (dataAvaliacao: string, nome: string) => {
  let mesExt: string | null = null;
  let ano: string | null = null;
  const m = /^(\d{4})-(\d{2})/.exec((dataAvaliacao || "").trim());
  if (m) {
    const indiceMes = Number(m[2]) - 1;
    const mes = indiceMes >= 0 && indiceMes < 12 ? MESES_EXTENSO[indiceMes] : undefined;
    if (mes) {
      mesExt = mes;
      ano = m[1] ?? "";
    }
  }
  if (!mesExt || !ano) {
    const hoje = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
    }).format(new Date());
    const [aHj, mHj] = hoje.split("-");
    const mes = MESES_EXTENSO[Number(mHj) - 1] ?? "Janeiro";
    mesExt = mes;
    ano = aHj ?? "";
  }
  const nomePaciente = (nome || "").replace(/\s+/g, " ").trim();
  return `Avaliação de 1ª consulta ${mesExt} ${ano} - ${nomePaciente || "Paciente"}.pdf`;
};
