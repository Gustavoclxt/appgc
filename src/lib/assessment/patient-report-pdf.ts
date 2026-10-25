import jsPDF from "jspdf";
import { registerReportFonts } from "./pdf-font";
import { REPORT_HEADER_COLOR, PATIENT_PDF_COLORS } from "./report-theme";
import { PATIENT_BLOCKS, PATIENT_TITLES, PATIENT_REPORT_FINAL_MESSAGE, patientFilename, type PatientProgress } from "./patient-report";

export function generatePatientPDF(nome: string, data: string, objetivo: string, progresso: PatientProgress, avisos: string[]) {
  const filename = patientFilename(nome);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerReportFonts(doc);
  doc.setProperties({ title: `Relatório do Paciente - ${nome}` });
  let y = 18;
  const space = (height: number) => { if (y + height > 280) { doc.addPage(); y = 18; } };
  const text = (value: string, bold = false, size = 9, x = 16, width = 178) => {
    doc.setFont("ReportSans", bold ? "bold" : "normal").setFontSize(size).setTextColor(...PATIENT_PDF_COLORS.ink);
    const lines: string[] = doc.splitTextToSize(value, width);
    for (const line of lines) { space(size * 0.4 + 0.7); doc.text(line, x, y); y += size * 0.4 + 0.7; }
  };
  doc.setFillColor(...REPORT_HEADER_COLOR).rect(0, 0, 210, 3, "F");
  text("Relatório do Paciente", true, 20);
  text(nome, true, 12);
  text([data, objetivo].filter(Boolean).join(" · "), false, 9);
  y += 3;
  for (const b of PATIENT_BLOCKS) {
    space(22);
    doc.setDrawColor(...REPORT_HEADER_COLOR).setLineWidth(0.4).line(16, y, 194, y);
    y += 6;
    text(`${b} — ${PATIENT_TITLES[b]}`, true, 11);
    y += 1;
    const itens = progresso.blocos[b]?.itens ?? [];
    if (!itens.length) text("Dados insuficientes para este bloco. Revisão pelo nutricionista necessária.");
    if (b === "A" && itens.length) {
      for (let i = 0; i < itens.length; i += 2) {
        const row = itens.slice(i, i + 2);
        doc.setFont("ReportSans", "normal").setFontSize(8);
        const height = Math.max(...row.map(item => doc.splitTextToSize(item.texto, 79).length * 4.5 + 14));
        space(height + 3);
        row.forEach((item, col) => {
          const x = 16 + col * 91;
          doc.setDrawColor(...REPORT_HEADER_COLOR).setLineWidth(0.25).roundedRect(x, y - 2, 87, height, 2, 2, "S");
          doc.setFont("ReportSans", "bold").setFontSize(9).setTextColor(...PATIENT_PDF_COLORS.ink).text(item.titulo, x + 4, y + 3);
          doc.setFont("ReportSans", "normal").setFontSize(8);
          doc.text(doc.splitTextToSize(item.texto, 79), x + 4, y + 9);
        });
        y += height + 3;
      }
      y += 1;
      continue;
    }
    for (const item of itens) {
      space(15);
      text(item.titulo, true);
      text(item.texto);
      if (item.acao) text(`Ação prática: ${item.acao}`);
      if (item.acompanhamento) text(`Como acompanhar: ${item.acompanhamento}`);
      y += 2;
    }
    y += 1;
  }
  if (avisos.length) { text("Revisão pelo nutricionista", true); for (const aviso of avisos) text(aviso, false, 8); y += 3; }
  text(PATIENT_REPORT_FINAL_MESSAGE, true, 9);
  y += 2;
  text("GC - Excelência em Nutrição", false, 8);
  doc.save(filename);
  return doc;
}