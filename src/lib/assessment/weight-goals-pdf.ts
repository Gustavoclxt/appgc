import jsPDF from "jspdf";

import type { DerivedResults } from "./calculations";
import { fmt2, fmtData, fmtInt } from "./calculations";
import { REPORT_HEADER_COLOR } from "./report-theme";
import type { Assessment } from "./types";
import { REFERENCIAS_METAS, type MetasPesoResultado } from "./weight-goals";
import { labelClassificacao } from "./weight-projection";

export function generateWeightGoalsPDF(a: Assessment, d: DerivedResults, r: MetasPesoResultado) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 15;
  let y = 0;

  doc.setFillColor(...REPORT_HEADER_COLOR);
  doc.rect(0, 0, W, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold").setFontSize(15);
  doc.text("METAS E PROJEÇÃO DE PESO", W / 2, 12, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text("GC - Excelência em Nutrição", W / 2, 19, { align: "center" });
  doc.setTextColor(30, 30, 30);
  y = 34;

  const quebra = (h: number) => {
    if (y + h > 285) {
      doc.addPage();
      y = 18;
    }
  };
  const titulo = (t: string) => {
    quebra(12);
    y += 3;
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...REPORT_HEADER_COLOR);
    doc.text(t, M, y);
    doc.setTextColor(30, 30, 30);
    y += 6;
  };
  const linha = (t: string) => {
    doc.setFont("helvetica", "normal").setFontSize(9.5);
    const ls = doc.splitTextToSize(t, W - 2 * M) as string[];
    quebra(ls.length * 4.6);
    doc.text(ls, M, y);
    y += ls.length * 4.6;
  };
  const tabela = (cab: string[], linhas: string[][]) => {
    const cw = (W - 2 * M) / cab.length;
    quebra(6 + linhas.length * 5.5);
    doc.setFont("helvetica", "bold").setFontSize(8.5);
    cab.forEach((c, i) => doc.text(c, M + i * cw, y));
    y += 5;
    doc.setFont("helvetica", "normal");
    for (const l of linhas) {
      l.forEach((c, i) => doc.text(c, M + i * cw, y));
      doc.setDrawColor(220).line(M, y + 1.5, W - M, y + 1.5);
      y += 5.5;
    }
  };

  titulo("DADOS UTILIZADOS");
  linha(`Paciente: ${a.nome || "—"} · Sexo: ${a.sexo || "—"} · Idade: ${d.idade ?? "—"} anos`);
  linha(`Avaliação antropométrica: ${fmtData(r.dataAvaliacao)} · Peso inicial: ${fmt2(r.pesoInicial)} kg · Altura: ${d.alturaCm ? fmt2(d.alturaCm / 100) : "—"} m · IMC: ${fmt2(d.imc)} kg/m² (${d.classificacaoIMC ?? "—"})`);
  linha(`% de gordura: ${d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : "não informado"} · Fator de atividade: ${fmt2(d.fatorAtividade)} · Déficit da projeção: ${r.deficitUsado !== null ? `${fmtInt(r.deficitUsado)} kcal/dia` : "—"}`);

  titulo("EXPECTATIVA DO PACIENTE");
  if (r.expectativa) {
    linha(`Perder ${fmt2(r.expectativa.kg)} kg (${fmt2(r.expectativa.percentual)}% do peso inicial) → meta ${fmt2(r.expectativa.pesoAlvo)} kg${r.expectativa.prazoMeses ? ` em ${fmt2(r.expectativa.prazoMeses)} meses` : ""}.`);
    if (r.expectativa.kgSemana !== null) linha(`Velocidade necessária: ${fmt2(r.expectativa.kgSemana)} kg/semana · ${fmt2(r.expectativa.pctSemana)}%/semana.`);
    if (r.classificacao) linha(`Classificação: ${labelClassificacao[r.classificacao]} (referência para o prazo: até ${fmt2(r.percentualReferencia)}%).`);
  } else linha("Expectativa não informada.");

  titulo("METAS CLÍNICAS DE REFERÊNCIA");
  tabela(
    ["Meta", "% perda", "Kg", "Peso meta", "kg/sem", "%/sem", "kg/mês"],
    r.metas.map((m) => [m.rotulo, `${fmt2(m.percentual)}%`, fmt2(m.kg), fmt2(m.pesoMeta), fmt2(m.kgSemana), fmt2(m.pctSemana), fmt2(m.kgMes)]),
  );

  titulo("PROJEÇÃO — MODELO DINÂMICO (HALL/NIH)");
  if (r.modelo) {
    tabela(
      ["30 dias", "60 dias", "90 dias", "180 dias", "365 dias", "Tempo até objetivo"],
      [[
        ...r.projecoes.map((p) => `${fmt2(p.peso)} kg`),
        r.diasMeta !== null ? `${fmtInt(r.diasMeta)} dias` : r.expectativa ? "> 3 anos" : "—",
      ]],
    );
  }
  for (const l of r.limitacoes) linha(`• ${l}`);

  // Gráfico
  if (r.pesoInicial !== null) {
    titulo("GRÁFICO COMPARATIVO");
    const gh = 60;
    quebra(gh + 12);
    const gx = M + 12;
    const gw = W - 2 * M - 14;
    const vals = [r.pesoInicial, ...r.metas.map((m) => m.pesoMeta)];
    if (r.expectativa) vals.push(r.expectativa.pesoAlvo);
    if (r.modelo) vals.push(r.modelo.serie[365]?.peso ?? r.pesoInicial);
    const max = Math.max(...vals) + 1;
    const min = Math.min(...vals) - 1;
    const px = (dia: number) => gx + (dia / 365) * gw;
    const py = (p: number) => y + gh - ((p - min) / (max - min)) * gh;
    doc.setDrawColor(180).setLineWidth(0.2).rect(gx, y, gw, gh);
    doc.setFontSize(7).setTextColor(100);
    for (const t of [0, 30, 90, 180, 365]) doc.text(`${t}d`, px(t), y + gh + 4, { align: "center" });
    for (let i = 0; i <= 4; i++) {
      const v = min + ((max - min) * i) / 4;
      doc.text(fmt2(v), gx - 1, py(v) + 1, { align: "right" });
    }
    doc.setLineDashPattern([1, 1], 0).setDrawColor(120);
    doc.line(gx, py(r.pesoInicial), gx + gw, py(r.pesoInicial));
    if (r.expectativa) {
      doc.setDrawColor(200, 140, 0);
      doc.line(gx, py(r.expectativa.pesoAlvo), gx + gw, py(r.expectativa.pesoAlvo));
    }
    doc.setLineDashPattern([], 0);
    if (r.modelo) {
      doc.setDrawColor(...REPORT_HEADER_COLOR).setLineWidth(0.6);
      for (let dia = 5; dia <= 365; dia += 5) { const p0 = r.modelo.serie[dia - 5]; const p1 = r.modelo.serie[dia]; if (p0 && p1) doc.line(px(dia - 5), py(p0.peso), px(dia), py(p1.peso)); }
    }
    doc.setFillColor(30, 30, 30);
    for (const m of r.metas) doc.circle(px(m.meses * 30.4375), py(m.pesoMeta), 0.9, "F");
    y += gh + 7;
    doc.setTextColor(80).setFontSize(7.5);
    doc.text("— Trajetória dinâmica (verde)   - - Peso inicial (cinza)   - - Peso desejado (laranja)   • Metas de referência", M, y);
    doc.setTextColor(30, 30, 30);
    y += 4;
  }

  if (r.interpretacao.length) {
    titulo("INTERPRETAÇÃO CLÍNICA (SUGESTÃO)");
    for (const t of r.interpretacao) linha(`→ ${t}`);
  }

  titulo("REFERÊNCIAS CIENTÍFICAS");
  for (const ref of REFERENCIAS_METAS) linha(`• ${ref}`);
  linha("Implementação do modelo dinâmico adulto de Hall et al. (2011) em dois compartimentos (massa gorda e livre de gordura), sem transientes de glicogênio/água; os resultados são estimativas e podem diferir da calculadora oficial do NIH.");

  doc.save(`metas-projecao-peso${a.nome ? `-${a.nome.trim().replace(/\s+/g, "-").toLowerCase()}` : ""}.pdf`);
}
