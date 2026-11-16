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
const RED: RGB = [178, 50, 45];
const TOM: Record<Tom, RGB> = { ok: REPORT_HEADER_COLOR, moderado: WARN, atencao: RED, neutro: INK };
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
  const etapa = (n: number, t: string, primeiraLinha: Bloco[]) => {
    // Reserva o título junto com o primeiro card, usando a mesma medição da impressão.
    garantir(10 + Math.max(...primeiraLinha.map((bloco) => bloco.h)));
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
  const GAP = 5;
  const COL = (LARG - GAP) / 2;
  type Bloco = { h: number; desenhar: (x: number, topo: number, altura: number) => void };
  // Ícones de status (mesmo padrão da tela): círculo verde com ✓ = dentro/adequado/bom;
  // círculo vermelho vivo com ↑/↓ = acima/abaixo da referência; círculo laranja com (!) = moderadamente dentro.
  const icone = (x: number, cy: number, tom: Tom, direcao: "up" | "down" | null) => {
    if (tom === "neutro") {
      doc.setFillColor(...LINE);
      doc.circle(x, cy, 1, "F");
      return;
    }
    const cor = tom === "ok" ? REPORT_HEADER_COLOR : tom === "moderado" ? WARN : RED;
    doc.setDrawColor(...cor);
    doc.setLineWidth(0.45);
    doc.setLineCap("round");
    doc.circle(x, cy, 1.7, "S");
    if (direcao) {
      const s = direcao === "up" ? 1 : -1;
      doc.line(x, cy + 0.85 * s, x, cy - 0.85 * s);
      doc.line(x - 0.55, cy - 0.2 * s, x, cy - 0.85 * s);
      doc.line(x + 0.55, cy - 0.2 * s, x, cy - 0.85 * s);
    } else if (tom === "ok") {
      doc.line(x - 0.75, cy + 0.05, x - 0.2, cy + 0.6);
      doc.line(x - 0.2, cy + 0.6, x + 0.75, cy - 0.55);
    } else {
      // (!): moderado em laranja; ruim/inadequado sem direção em vermelho.
      doc.line(x, cy - 0.7, x, cy + 0.2);
      doc.setFillColor(...cor);
      doc.circle(x, cy + 0.65, 0.18, "F");
    }
    doc.setLineWidth(0.3);
  };
  const caixa = (x: number, topo: number, altura: number, titulo: string[]) => {
    doc.setDrawColor(...LINE);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, topo, COL, altura, 2.5, 2.5, "FD");
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(titulo, x + 4, topo + 7);
  };
  const tituloCard = (titulo: string) => {
    doc.setFont("ReportSans", "bold");
    doc.setFontSize(10);
    return doc.splitTextToSize(titulo, COL - 8) as string[];
  };
  const card = (c: CardJornada): Bloco => {
    const titulo = tituloCard(c.titulo);
    const inicio = 13 + (titulo.length - 1) * 4.5;
    const linhas = c.linhas.map((l) => {
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(8);
      const rotulo = doc.splitTextToSize(l.rotulo, (COL - 16) * 0.48) as string[];
      const det = l.detalhe ? doc.splitTextToSize(l.detalhe, COL - 12) as string[] : [];
      const prefixo = !l.tom || l.tom === "neutro" ? (l.seta ? SETA[l.seta] : "") : "";
      doc.setFont("ReportSans", "bold");
      doc.setFontSize(8.5);
      const val = doc.splitTextToSize(`${prefixo}${l.valor}`, (COL - 16) * 0.48) as string[];
      const h = Math.max(rotulo.length * 3.8, val.length * 4) + det.length * 3.6 + 4;
      return { l, rotulo, det, val, h };
    });
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(8);
    const nota = c.nota ? doc.splitTextToSize(c.nota, COL - 8) as string[] : [];
    return {
      h: inicio + linhas.reduce((s, l) => s + l.h, 0) + nota.length * 3.6 + 3,
      desenhar: (x, topo, altura) => {
        caixa(x, topo, altura, titulo);
        let yy = topo + inicio;
        linhas.forEach(({ l, rotulo, det, val, h }, idx) => {
          if (idx > 0) {
            doc.setDrawColor(...LINE);
            doc.line(x + 4, yy - 3, x + COL - 4, yy - 3);
          }
          if (l.tom) icone(x + 5.5, yy - 1.2, l.tom, l.tom !== "neutro" && (l.seta === "up" || l.seta === "down") ? l.seta : null);
          doc.setFont("ReportSans", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...SOFT);
          doc.text(rotulo, x + 8, yy);
          doc.setFont("ReportSans", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(...TOM[l.tom ?? "neutro"]);
          doc.text(val, x + COL - 4, yy, { align: "right" });
          doc.setFont("ReportSans", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...SOFT);
          doc.text(det, x + COL - 4, yy + Math.max(rotulo.length * 3.8, val.length * 4), { align: "right" });
          yy += h;
        });
        if (nota.length) {
          doc.setFont("ReportSans", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...SOFT);
          doc.text(nota, x + 4, yy + 1);
        }
      },
    };
  };

  const exames = (lista: ExameJornada[], destino: boolean): Bloco => {
    const titulo = tituloCard(destino ? "Exames laboratoriais — metas desejáveis" : "Exames laboratoriais");
    const inicio = 13 + (titulo.length - 1) * 4.5;
    const cols = destino ? ["Marcador", "Inicial", "Alvo desejável", "Diferença esperada"] : ["Marcador", "Resultado", "Referência"];
    const larguras = destino ? [25, 17, 20, COL - 74] : [33, 18, COL - 63];
    const offsets = larguras.map((_, i) => 8 + larguras.slice(0, i).reduce((s, l) => s + l, 0) + i * 1.3);
    const quebrar = (texto: string, i: number) => doc.splitTextToSize(texto, larguras[i] ?? 16) as string[];
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(7.5);
    const cab = cols.map(quebrar);
    const cabH = Math.max(...cab.map((c) => c.length)) * 3.5 + 3;
    const rows = lista.map((e) => {
      const cel = destino ? [e.marcador, e.inicial, e.alvo, `${e.tom === "neutro" && e.seta ? SETA[e.seta] : ""}${e.diferenca}`] : [e.marcador, e.inicial, e.referencia];
      const partes = cel.map((texto, i) => {
        doc.setFont("ReportSans", i === 1 ? "bold" : "normal");
        return quebrar(texto, i);
      });
      return { e, partes, h: Math.max(...partes.map((p) => p.length)) * 3.5 + 3 };
    });
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(8);
    const mensagem = j.examesAvaliados ? "Todos os exames avaliados estão de acordo com os valores de referência." : "Exames laboratoriais ainda não informados.";
    const nota = doc.splitTextToSize(lista.length ? (destino ? "Metas desejáveis, condicionadas à evolução clínica. Não há garantia de normalização em 90 dias." : "") : mensagem, COL - 8) as string[];
    const tabelaH = lista.length ? cabH + rows.reduce((s, r) => s + r.h, 0) : 0;
    return {
      h: inicio + tabelaH + nota.length * 3.6 + 4,
      desenhar: (x, topo, altura) => {
        caixa(x, topo, altura, titulo);
        let yy = topo + inicio;
        if (lista.length) {
          doc.setFont("ReportSans", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...SOFT);
          cab.forEach((c, i) => doc.text(c, x + (offsets[i] ?? 8), yy));
          yy += cabH;
          for (const r of rows) {
            const desvio = r.e.tom === "atencao" ? (r.e.seta === "down" ? "up" : r.e.seta === "up" ? "down" : null) : null;
            icone(x + 5.5, yy - 1.2, r.e.tom, desvio);
            doc.setFontSize(7.5);
            r.partes.forEach((p, i) => {
              doc.setFont("ReportSans", i === 1 ? "bold" : "normal");
              doc.setTextColor(...(i === 1 ? TOM[r.e.tom] : INK));
              doc.text(p, x + (offsets[i] ?? 8), yy);
            });
            yy += r.h;
          }
        }
        if (nota.length) {
          doc.setFont("ReportSans", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...SOFT);
          doc.text(nota, x + 4, yy + 1);
        }
      },
    };
  };
  const linha = (blocos: Bloco[]) => {
    const h = Math.max(...blocos.map((bloco) => bloco.h));
    garantir(h);
    blocos.forEach((bloco, i) => bloco.desenhar(M + i * (COL + GAP), y, h));
    y += h + 5;
  };

  cabecalho();
  const hoje = [card(j.hoje.composicao), exames(j.hoje.exames, false)];
  etapa(1, "Como você está hoje", hoje);
  linha(hoje);
  linha([card(j.hoje.habitos), card(j.hoje.atividade)]);
  const caminho = [card(j.caminho.projecao), card(j.caminho.habitos)];
  etapa(2, "Como vamos chegar lá", caminho);
  linha(caminho);
  linha([card(j.caminho.atividade)]);
  const destino = [card(j.destino.composicao), exames(j.destino.exames, true)];
  etapa(3, "Onde vamos chegar", destino);
  linha(destino);
  linha([card(j.destino.habitos)]);
  garantir(12);
  doc.setFont("ReportSans", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SOFT);
  doc.text(doc.splitTextToSize(j.aviso, LARG) as string[], M, y + 2);

  doc.save(nomeArquivoPdf(a.dataAvaliacao, a.nome).replace(/\.pdf$/, " - Jornada de Recomposição Corporal.pdf"));
}
