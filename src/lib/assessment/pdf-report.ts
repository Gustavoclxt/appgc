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
import { anamneseParaRelatorio } from "./report-anamnesis";
import { composicaoParaRelatorio, type ComposicaoDiario } from "./diet-composition";
import { linhasAlimentosRetirar } from "./food-preferences";
import { painelClinicoParaRelatorio } from "./clinical-dashboard";
import { REPORT_HEADER_COLOR } from "./report-theme";

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
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const examesDoRelatorio = examesParaRelatorio(a.exames);
  const diarioDoRelatorio = diarioParaRelatorio(a.diarioAlimentar);
  const anamneseDoRelatorio = anamneseParaRelatorio(a, d);
  const indiceEvolucaoPeso = anamneseDoRelatorio.findIndex(
    (section) => section.title === "Evolução do peso",
  );
  const anamneseAntesEvolucao =
    indiceEvolucaoPeso >= 0
      ? anamneseDoRelatorio.slice(0, indiceEvolucaoPeso)
      : anamneseDoRelatorio;
  const anamneseAPartirDaEvolucao =
    indiceEvolucaoPeso >= 0 ? anamneseDoRelatorio.slice(indiceEvolucaoPeso) : [];
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

  const linhaPaciente = (label: string, valor: string) => {
    quebra(6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(91, 102, 114);
    const pergunta = `${label}:`;
    doc.text(pergunta, MARGEM, y);
    doc.setTextColor(22, 32, 43);
    doc.setFont("helvetica", "bold");
    doc.text(valor, MARGEM + doc.getTextWidth(pergunta) + 2.5, y);
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

  const campoAnamnese = (label: string, valor: string) => {
    const pergunta = /[:?]$/.test(label.trim()) ? label.trim() : `${label.trim()}:`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const larguraPergunta = doc.getTextWidth(pergunta);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const larguraResposta = doc.getTextWidth(valor);
    const respostaCurta = !valor.includes("\n") && larguraPergunta + 2.5 + larguraResposta <= CONTEUDO;

    quebra(respostaCurta ? 6 : 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(91, 102, 114);
    doc.text(pergunta, MARGEM, y);

    if (respostaCurta) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(40, 50, 60);
      doc.text(valor, MARGEM + larguraPergunta + 2.5, y);
      y += 5.5;
      return;
    }

    y += 4.2;
    paragrafo(valor);
  };

  // Cabeçalho
  doc.setFillColor(...REPORT_HEADER_COLOR);
  doc.rect(0, 0, LARGURA, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RELATÓRIO DE AVALIAÇÃO NUTRICIONAL", LARGURA / 2, 13, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("GC - Excelência em Nutrição", LARGURA / 2, 19.5, { align: "center" });
  y = 36;

  titulo("Dados do paciente");
  linhaPaciente("Data", fmtData(a.dataAvaliacao));
  linhaPaciente("Nome", a.nome || "—");
  linhaPaciente("Idade", d.idade !== null ? `${d.idade} anos` : "—");
  linhaPaciente("Sexo", a.sexo ? (a.sexo === "masculino" ? "Masculino" : "Feminino") : "—");
  linhaPaciente("Profissão", a.profissao || "—");

  for (const section of anamneseAntesEvolucao) {
    titulo(section.title);
    for (const field of section.fields) {
      campoAnamnese(field.label, field.value);
    }
  }

  if (diarioDoRelatorio.length) {
    titulo("Recordatório 24h");
    for (const refeicao of diarioDoRelatorio) {
      quebra(7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(22, 32, 43);
      const detalhes = [
        refeicao.horario ? `- ${refeicao.horario}` : "",
        refeicao.local ? `(${refeicao.local})` : "",
      ]
        .filter(Boolean)
        .join(" ");
      doc.text(detalhes ? `${refeicao.refeicao} ${detalhes}` : refeicao.refeicao, MARGEM, y);
      y += 4.8;
      for (const alimento of refeicao.alimentos) {
        paragrafo(`• ${alimento}`);
      }
      y += 1;
    }
  }

  const comp = composicaoParaRelatorio(composicao);
  if (comp) {
    titulo("Composição estimada do Recordatório 24h");
    for (const t of comp.totais) linha(t.label, t.valor);
  }

  for (const section of anamneseAPartirDaEvolucao) {
    titulo(section.title);
    for (const field of section.fields) {
      campoAnamnese(field.label, field.value);
    }
  }

  titulo("Antropometria");
  linha("Peso", d.pesoKg !== null ? `${fmt2(d.pesoKg)} kg` : "—");
  linha("Altura", d.alturaCm !== null ? `${fmt2(d.alturaCm)} cm` : "—");
  linha("IMC", d.imc !== null ? `${fmt2(d.imc)} — ${d.classificacaoIMC}` : "—");
  if (d.pio !== null) linha("PIO", `${fmt2(d.pio)} kg`);
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

  const retirar = linhasAlimentosRetirar(a);
  if (retirar.length) {
    titulo("Alimentos não consumidos");
    for (const linha of retirar) paragrafo(linha);
  }

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
  }

  if (analise) {
    const painel = painelClinicoParaRelatorio(analise, a, d, composicao);
    if (painel.resumo.length) {
      titulo("Resumo clínico");
      for (const item of painel.resumo) linhaPaciente(item.label, item.valor);
    }
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
        doc.setFont("helvetica", "bold");
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
        doc.setFont("helvetica", "bold");
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
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 130, 140);
    doc.text(`${i}/${paginas}`, LARGURA - MARGEM, ALTURA - 10, { align: "right" });
  }

  const nomeArquivo = `avaliacao-nutricional-${(a.nome || "paciente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()}.pdf`;
  doc.save(nomeArquivo);
}
