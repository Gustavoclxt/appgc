import jsPDF from "jspdf";
import type { DerivedResults } from "./calculations";
import type { Assessment } from "./types";
import type { MetasPesoResultado } from "./weight-goals";
import { construirJornada, type CardJornada, type ExameJornada, type Seta, type Tom } from "./jornada";
import { REPORT_HEADER_COLOR } from "./report-theme";
import { registerReportFonts } from "./pdf-font";
import { LOGO_BRANCO_PNG, LOGO_PROPORCAO } from "./pdf-logo";
import { nomeArquivoPdf } from "./pdf-report";

type RGB = [number, number, number];
const INK: RGB = [22, 32, 43];
const SOFT: RGB = [91, 102, 114];
const LINE: RGB = [220, 226, 232];
const WARN: RGB = [176, 110, 20];
const TOM: Record<Tom, RGB> = { ok: REPORT_HEADER_COLOR, atencao: WARN, neutro: INK };
const SETA: Record<Exclude<Seta, null>, string> = { up: "↑ ", down: "↓ ", igual: "→ " };

export function generateJornadaPDF(a: Assessment, d: DerivedResults, metas: MetasPesoResultado | null) {
  // A fonte incorporada não possui "≈"; troca apenas na impressão.
  const j = JSON.parse(JSON.stringify(construirJornada(a, d, metas)).replace(/≈/g, "~")) as ReturnType<typeof construirJornada>;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerReportFonts(doc);
  const W = 210;
  const H = 297;
  const M = 14;
  let y = 0;

  const cabecalho = () => {
    doc.setFillColor(...REPORT_HEADER_COLOR);
    doc.rect(0, 0, W, 26, "F");
    doc.addImage(LOGO_BRANCO_PNG, "PNG", M, 5, 16 * LOGO_PROPORCAO, 16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(13);
    doc.text("Jornada de Recomposição Corporal", W / 2, 11, { align: "center" });
    doc.setFontSize(10.5);
    doc.text(j.nome, W / 2, 17, { align: "center" });
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(8.5);
    doc.text(`Avaliação de ${j.data}`, W / 2, 22.5, { align: "center" });
    y = 34;
  };
  const garantir = (h: number) => {
    if (y + h > H - 14) {
      doc.addPage();
      cabecalho();
    }
  };
  const etapa = (n: number, t: string) => {
    garantir(16);
    doc.setFillColor(...REPORT_HEADER_COLOR);
    doc.circle(M + 4, y + 1, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(10);
    doc.text(String(n), M + 4, y + 2.6, { align: "center" });
    doc.setTextColor(...INK);
    doc.setFontSize(12);
    doc.text(t.toUpperCase(), M + 11, y + 2.6);
    y += 10;
  };

  const LARG = W - 2 * M;
  const card = (c: CardJornada) => {
    doc.setFontSize(9);
    const linhas = c.linhas.map((l) => {
      const det = l.detalhe ? (doc.splitTextToSize(l.detalhe, LARG / 2 - 6) as string[]) : [];
      const val = doc.splitTextToSize(`${l.seta ? SETA[l.seta] : ""}${l.valor}`, LARG / 2 - 6) as string[];
      return { l, det, val, h: 4.6 * val.length + 3.8 * det.length + 2.6 };
    });
    const nota = c.nota ? (doc.splitTextToSize(c.nota, LARG - 8) as string[]) : [];
    const h = 11 + linhas.reduce((s, x) => s + x.h, 0) + nota.length * 3.8 + 3;
    garantir(h);
    doc.setDrawColor(...LINE);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, LARG, h, 2.5, 2.5, "FD");
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(c.titulo, M + 4, y + 7);
    let yy = y + 13;
    linhas.forEach(({ l, det, val, h: lh }, idx) => {
      if (idx > 0) {
        doc.setDrawColor(...LINE);
        doc.line(M + 4, yy - 4.4, W - M - 4, yy - 4.4);
      }
      if (l.tom) {
        doc.setFillColor(...(l.tom === "neutro" ? LINE : TOM[l.tom]));
        doc.circle(M + 5, yy - 1.2, 1, "F");
      }
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SOFT);
      doc.text(l.rotulo, M + 8, yy);
      doc.setFont("ReportSans", "bold");
      doc.setTextColor(...TOM[l.tom ?? "neutro"]);
      doc.text(val, W - M - 4, yy, { align: "right" });
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SOFT);
      doc.text(det, W - M - 4, yy + 4.6 * (val.length - 1) + 3.8, { align: "right" });
      yy += lh;
    });
    if (nota.length) {
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SOFT);
      doc.text(nota, M + 4, yy + 1);
    }
    y += h + 5;
  };

  const exames = (lista: ExameJornada[], destino: boolean) => {
    if (lista.length === 0) {
      const mensagem = j.examesAvaliados
        ? "Todos os exames avaliados estão de acordo com os valores de referência."
        : "Exames laboratoriais ainda não informados.";
      const h = 14;
      garantir(h);
      doc.setDrawColor(...LINE);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(M, y, LARG, h, 2.5, 2.5, "FD");
      doc.setFont("ReportSans", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      doc.text(destino ? "Exames laboratoriais — metas desejáveis" : "Exames laboratoriais", M + 4, y + 7);
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...SOFT);
      doc.text(mensagem, M + 4, y + 11.5);
      y += h + 5;
      return;
    }
    const cols = destino ? ["Marcador", "Inicial", "Alvo desejável", "Diferença esperada"] : ["Marcador", "Resultado", "Referência"];
    const xs = destino ? [M + 8, M + 50, M + 92, M + 134] : [M + 8, M + 60, M + 110];
    const largs = destino ? [40, 40, 40, 44] : [50, 48, 70];
    const rows = lista.map((e) => {
      const cel = destino
        ? [e.marcador, e.inicial, e.alvo, `${e.seta ? SETA[e.seta] : ""}${e.diferenca}`]
        : [e.marcador, e.inicial, e.referencia];
      doc.setFontSize(8.5);
      const partes = cel.map((c, i) => doc.splitTextToSize(c, largs[i]!) as string[]);
      return { e, partes, h: Math.max(...partes.map((p) => p.length)) * 3.8 + 2.4 };
    });
    const nota = destino ? ["Metas desejáveis, condicionadas à evolução clínica. Não há garantia de normalização em 90 dias."] : [];
    const h = 18 + rows.reduce((s, r) => s + r.h, 0) + nota.length * 4 + 2;
    garantir(h);
    doc.setDrawColor(...LINE);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M, y, LARG, h, 2.5, 2.5, "FD");
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(destino ? "Exames laboratoriais — metas desejáveis" : "Exames laboratoriais", M + 4, y + 7);
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SOFT);
    cols.forEach((c, i) => doc.text(c, xs[i]!, y + 13));
    let yy = y + 18;
    for (const r of rows) {
      doc.setFillColor(...(r.e.tom === "neutro" ? LINE : TOM[r.e.tom]));
      doc.circle(M + 5, yy - 1.2, 1, "F");
      doc.setFontSize(8.5);
      r.partes.forEach((p, i) => {
        doc.setFont("ReportSans", i === 1 ? "bold" : "normal");
        doc.setTextColor(...(i === 1 ? TOM[r.e.tom] : INK));
        doc.text(p, xs[i]!, yy);
      });
      yy += r.h;
    }
    if (nota.length) {
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SOFT);
      doc.text(nota, M + 4, yy + 1);
    }
    y += h + 5;
  };

  cabecalho();
  etapa(1, "Como você está hoje");
  card(j.hoje.composicao);
  exames(j.hoje.exames, false);
  card(j.hoje.habitos);
  card(j.hoje.atividade);
  etapa(2, "Como vamos chegar lá");
  card(j.caminho.projecao);
  card(j.caminho.habitos);
  card(j.caminho.atividade);
  etapa(3, "Onde vamos chegar");
  card(j.destino.composicao);
  exames(j.destino.exames, true);
  card(j.destino.habitos);
  garantir(12);
  doc.setFont("ReportSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SOFT);
  doc.text(doc.splitTextToSize(j.aviso, LARG) as string[], M, y + 2);

  doc.save(nomeArquivoPdf(a.dataAvaliacao, a.nome).replace(/\.pdf$/, " - Jornada de Recomposição Corporal.pdf"));
}
