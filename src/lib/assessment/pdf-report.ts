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
import type { AnaliseIA, Assessment } from "./types";
import { examesParaRelatorio } from "./report-exams";
import { diarioParaRelatorio } from "./food-diary";
import { intervencoesParaRelatorio } from "./interventions";

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

export function generatePDF(a: Assessment, d: DerivedResults, analise: AnaliseIA | null) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const examesDoRelatorio = examesParaRelatorio(a.exames);
  const diarioDoRelatorio = diarioParaRelatorio(a.diarioAlimentar);
  let y = MARGEM;

  const quebra = (altura: number) => {
    if (y + altura > ALTURA - MARGEM - 10) {
      doc.addPage();
      y = MARGEM;
    }
  };

  const titulo = (texto: string) => {
    quebra(14);
    doc.setFont("helvetica", "bold");
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(91, 102, 114);
    doc.text(label, MARGEM, y);
    doc.setTextColor(22, 32, 43);
    doc.setFont("helvetica", "bold");
    doc.text(valor, MARGEM + 58, y);
    y += 5.5;
  };

  const paragrafo = (texto: string) => {
    if (!texto) return;
    doc.setFont("helvetica", "normal");
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

  // Cabeçalho
  doc.setFillColor(22, 32, 43);
  doc.rect(0, 0, LARGURA, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE AVALIAÇÃO NUTRICIONAL", MARGEM, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Avaliação nutricional clínica e esportiva", MARGEM, 19.5);
  doc.text(fmtData(a.dataAvaliacao), LARGURA - MARGEM, 19.5, { align: "right" });
  y = 36;

  titulo("Dados do paciente");
  linha("Nome", a.nome || "—");
  linha("Idade", d.idade !== null ? `${d.idade} anos` : "—");
  linha("Sexo", a.sexo ? (a.sexo === "masculino" ? "Masculino" : "Feminino") : "—");
  linha("Data", fmtData(a.dataAvaliacao));

  titulo("Objetivo");
  linha("Objetivos", a.objetivos.length ? a.objetivos.join(", ") : "—");

  titulo("Antropometria");
  linha("Peso", d.pesoKg !== null ? `${fmt2(d.pesoKg)} kg` : "—");
  linha("Altura", d.alturaCm !== null ? `${fmt2(d.alturaCm)} cm` : "—");
  linha("IMC", d.imc !== null ? `${fmt2(d.imc)} — ${d.classificacaoIMC}` : "—");
  if (d.percentualGordura !== null) {
    linha("% de gordura", `${fmt2(d.percentualGordura)}%`);
    linha("Método", a.metodoGordura || "—");
    linha("Massa gorda", d.massaGorda !== null ? `${fmt2(d.massaGorda)} kg` : "—");
    linha(
      "Massa livre de gordura",
      d.massaLivreGordura !== null ? `${fmt2(d.massaLivreGordura)} kg` : "—",
    );
  } else {
    paragrafo("Percentual de gordura não informado.");
  }

  titulo("Gasto energético");
  linha("Método", (labelMetodo[a.metodoTMB] ?? ""));
  linha("TMB", d.tmb !== null ? `${fmtInt(d.tmb)} kcal/dia` : "—");
  linha("Fator de atividade", d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : "—");
  linha("VET", d.vet !== null ? `${fmtInt(d.vet)} kcal/dia` : "—");

  titulo("Hidratação");
  linha("30 mL/kg", d.aguaMin !== null ? `${fmtInt(d.aguaMin)} mL/dia` : "—");
  linha("35 mL/kg", d.aguaMax !== null ? `${fmtInt(d.aguaMax)} mL/dia` : "—");
  linha(
    "Faixa estimada",
    d.aguaMin !== null
      ? `${fmtInt(d.aguaMin)}–${fmtInt(d.aguaMax)} mL/dia (${fmtLitros(d.aguaMin)}–${fmtLitros(d.aguaMax)} L/dia)`
      : "—",
  );

  titulo("Conduta energética");
  linha("Estratégia", (labelEstrategia[a.estrategia] ?? ""));
  linha(
    "Ajuste",
    d.ajusteKcal !== null
      ? `${fmtInt(d.ajusteKcal)} kcal`
      : d.percentualAjuste !== null
        ? `${d.percentualAjuste}%`
        : "—",
  );
  linha("VET", d.vet !== null ? `${fmtInt(d.vet)} kcal/dia` : "—");
  linha(
    "Calorias sugeridas",
    d.caloriasSugeridas !== null ? `${fmtInt(d.caloriasSugeridas)} kcal/dia` : "—",
  );

  if (examesDoRelatorio.length) {
    titulo("Exames laboratoriais");
    quebra(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(91, 102, 114);
    doc.text("Exame", MARGEM, y);
    doc.text("Resultado", MARGEM + 70, y);
    doc.text("Referência", MARGEM + 110, y);
    doc.text("Status", MARGEM + 145, y);
    y += 4;
    doc.setDrawColor(223, 228, 233);
    doc.setLineWidth(0.2);
    doc.line(MARGEM, y, MARGEM + CONTEUDO, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 32, 43);
    for (const e of examesDoRelatorio) {
      quebra(6);
      doc.text(doc.splitTextToSize(e.exame, 66)[0] ?? "", MARGEM, y);
      doc.text(`${e.resultado} ${e.unidade}`.trim(), MARGEM + 70, y);
      doc.text(doc.splitTextToSize(e.referencia || "—", 32)[0] ?? "—", MARGEM + 110, y);
      doc.text(statusLabel[e.status] ?? "—", MARGEM + 145, y);
      y += 5;
    }
    y += 2;
    if (a.observacoesExames) {
      paragrafo(`Observações: ${a.observacoesExames}`);
    }
  }

  if (diarioDoRelatorio.length) {
    titulo("Diário alimentar");
    for (const refeicao of diarioDoRelatorio) {
      quebra(7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(22, 32, 43);
      doc.text(refeicao.refeicao, MARGEM, y);
      const detalhes = [refeicao.horario, refeicao.local].filter(Boolean).join(" · ");
      if (detalhes) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(91, 102, 114);
        doc.text(detalhes, MARGEM + 58, y);
      }
      y += 4.8;
      for (const alimento of refeicao.alimentos) {
        paragrafo(`• ${alimento}`);
      }
      y += 1;
    }
  }

  if (analise) {
    titulo("Síntese da avaliação");
    paragrafo(analise.sintese);
    if (analise.composicaoCorporal) {
      titulo("Composição corporal");
      paragrafo(analise.composicaoCorporal);
    }
    if (analise.pontosAtencao.length) {
      titulo("Pontos de atenção");
      for (const p of analise.pontosAtencao) paragrafo(`• ${p}`);
    }
    const grupos = intervencoesParaRelatorio(analise.intervencoes);
    if (grupos.length) {
      titulo("Mudanças e intervenções sugeridas");
      const cores: Record<string, [number, number, number]> = {
        alta: [185, 50, 50],
        moderada: [15, 111, 106],
        baixa: [120, 130, 140],
      };
      for (const g of grupos) {
        quebra(10);
        const [r, gg, b] = cores[g.id] ?? [120, 130, 140];
        doc.setFillColor(r, gg, b);
        doc.roundedRect(MARGEM, y - 4, 70, 6, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(g.label.toUpperCase(), MARGEM + 2.5, y);
        y += 7;
        for (const c of g.categorias) {
          quebra(6);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(91, 102, 114);
          doc.text(c.categoria.toUpperCase(), MARGEM, y);
          y += 5;
          for (const i of c.itens) {
            if (i.problema) {
              quebra(5);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(9.5);
              doc.setTextColor(22, 32, 43);
              doc.text(doc.splitTextToSize(i.problema, CONTEUDO)[0] ?? "", MARGEM, y);
              y += 4.8;
            }
            paragrafo(`> ${i.intervencao}`);
            if (i.justificativa) paragrafo(`Justificativa: ${i.justificativa}`);
          }
        }
        y += 2;
      }
    }
    titulo("Sugestão técnica");
    paragrafo(analise.sugestaoTecnica);
  }

  // Rodapé em todas as páginas
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 130, 140);
    const aviso =
      "Documento de apoio à avaliação nutricional profissional. Não substitui o julgamento clínico do nutricionista. Os dados não são armazenados pela ferramenta.";
    const linhas = doc.splitTextToSize(aviso, CONTEUDO - 20);
    doc.text(linhas, MARGEM, ALTURA - 14);
    doc.text(`${i}/${paginas}`, LARGURA - MARGEM, ALTURA - 10, { align: "right" });
  }

  const nomeArquivo = `avaliacao-nutricional-${(a.nome || "paciente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()}.pdf`;
  doc.save(nomeArquivo);
}
