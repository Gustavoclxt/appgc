import jsPDF from "jspdf";
import { fmt2, fmtData, type DerivedResults } from "./calculations";
import type { Assessment } from "./types";
import type { MetasPesoResultado } from "./weight-goals";
import { linhaDoTempoPaciente } from "./patient-timeline";
import { REPORT_HEADER_COLOR } from "./report-theme";
import { registerReportFonts } from "./pdf-font";
import { nomeArquivoPdf } from "./pdf-report";

const fmt1 = (v: number | null) =>
  v === null ? "—" : v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const somarDias = (iso: string, dias: number) => {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return "";
  d.setUTCDate(d.getUTCDate() + dias);
  return fmtData(d.toISOString());
};

export function generatePatientPDF(a: Assessment, d: DerivedResults, metas: MetasPesoResultado | null) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  registerReportFonts(doc);
  const W = 297;
  const M = 16;
  const data = a.dataAvaliacaoAntropometrica || a.dataAvaliacao;

  doc.setFillColor(...REPORT_HEADER_COLOR);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("ReportSans", "bold");
  doc.setFontSize(16);
  doc.text("Sua linha do tempo", M, 13);
  doc.setFont("ReportSans", "normal");
  doc.setFontSize(10);
  doc.text(`${a.nome.trim() || "Paciente"} · Consulta: ${fmtData(data)}`, M, 21);
  doc.text("GC - NUTRIÇÃO • PERFORMANCE • LONGEVIDADE", W - M, 21, { align: "right" });

  const marcos = linhaDoTempoPaciente(a, d, metas);
  doc.setTextColor(22, 32, 43);
  if (marcos.length === 0) {
    doc.setFontSize(11);
    doc.text("Informe o peso na avaliação para gerar a linha do tempo.", M, 50);
    doc.save(nomeArquivoPdf(a.dataAvaliacao, a.nome).replace(/\.pdf$/, " - Relatório Paciente.pdf"));
    return;
  }

  const yLinha = 80;
  const x0 = M + 22;
  const x1 = W - M - 22;
  const passo = marcos.length > 1 ? (x1 - x0) / (marcos.length - 1) : 0;
  const cx = (i: number) => (marcos.length > 1 ? x0 + passo * i : W / 2);
  doc.setDrawColor(...REPORT_HEADER_COLOR);
  doc.setLineWidth(1.2);
  if (marcos.length > 1) doc.line(x0, yLinha, x1, yLinha);

  const larg = Math.min(44, marcos.length > 1 ? passo - 3 : 60);
  marcos.forEach((m, i) => {
    const x = cx(i);
    const destaque = i === 0 || m.metaAtingida;
    doc.setFillColor(...(destaque ? REPORT_HEADER_COLOR : ([255, 255, 255] as [number, number, number])));
    doc.circle(x, yLinha, 3.2, "FD");

    doc.setFont("ReportSans", "bold");
    doc.setFontSize(11);
    doc.setTextColor(22, 32, 43);
    doc.text(m.rotulo, x, yLinha - 12, { align: "center" });
    doc.setFont("ReportSans", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(91, 102, 114);
    const dt = somarDias(data, m.dias);
    if (dt) doc.text(dt, x, yLinha - 7, { align: "center" });

    const top = yLinha + 9;
    doc.setDrawColor(220, 226, 232);
    doc.setLineWidth(0.3);
    doc.setFillColor(...(destaque ? ([232, 243, 241] as [number, number, number]) : ([248, 250, 251] as [number, number, number])));
    doc.roundedRect(x - larg / 2, top, larg, 44, 2.5, 2.5, "FD");
    const linhas: [string, string][] = [
      ["Peso", `${fmt1(m.peso)} kg`],
      ["IMC", m.imc === null ? "—" : `${fmt1(m.imc)} kg/m²`],
      ["% Gordura", m.percentualGordura === null ? "—" : `${fmt1(m.percentualGordura)}%`],
    ];
    linhas.forEach(([l, v], j) => {
      const yy = top + 9 + j * 12;
      doc.setFont("ReportSans", "normal");
      doc.setFontSize(8);
      doc.setTextColor(91, 102, 114);
      doc.text(l, x, yy, { align: "center" });
      doc.setFont("ReportSans", "bold");
      doc.setFontSize(11);
      doc.setTextColor(22, 32, 43);
      doc.text(v, x, yy + 5, { align: "center" });
    });
    if (m.metaAtingida) {
      doc.setFont("ReportSans", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...REPORT_HEADER_COLOR);
      doc.text("Peso desejado", x, top + 51, { align: "center" });
    }
  });

  doc.setFont("ReportSans", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(91, 102, 114);
  const notas: string[] = [];
  if (marcos.length > 1) {
    const alvo = metas?.expectativa?.pesoAlvo;
    notas.push(
      alvo != null
        ? `Projeção estimada até o peso desejado de ${fmt2(alvo)} kg, seguindo o plano alimentar proposto.`
        : "Projeção estimada pela calculadora, seguindo o plano alimentar proposto.",
    );
    notas.push("Valores são estimativas e podem variar conforme adesão, sono, treino e respostas individuais; serão reavaliados nas consultas.");
  }
  notas.forEach((n, i) => doc.text(n, M, 175 + i * 5));

  doc.save(nomeArquivoPdf(a.dataAvaliacao, a.nome).replace(/\.pdf$/, " - Relatório Paciente.pdf"));
}
