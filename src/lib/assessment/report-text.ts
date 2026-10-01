import { fmt2, fmtData, fmtInt, fmtLitros, labelEstrategia, labelMetodo, type DerivedResults } from "./calculations";
import type { AnaliseIA, Assessment } from "./types";
import { anamneseParaRelatorio } from "./report-anamnesis";
import { diarioParaRelatorio } from "./food-diary";
import { examesParaRelatorio } from "./report-exams";
import { intervencoesParaRelatorio } from "./interventions";
import { composicaoParaRelatorio, type ComposicaoDiario } from "./diet-composition";
import { fraseAlimentosRetirar } from "./food-preferences";

interface Bloco {
  titulo: string;
  linhas: { texto: string; nivel?: 0 | 1 | 2; negrito?: boolean }[];
}

const statusLabel: Record<string, string> = {
  dentro: "Dentro da referência",
  abaixo: "Abaixo",
  acima: "Acima",
  indeterminado: "Indeterminado",
};

function montar(a: Assessment, d: DerivedResults, analise: AnaliseIA, composicao: ComposicaoDiario | null): Bloco[] {
  const kv = (l: string, v: string) => ({ texto: `${l}: ${v || "—"}` });
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
  });
  for (const s of anamneseParaRelatorio(a, d))
    blocos.push({ titulo: s.title, linhas: s.fields.map((f) => kv(f.label, f.value)) });
  const retirar = fraseAlimentosRetirar(a);
  if (retirar) blocos.push({ titulo: "Alimentos não consumidos", linhas: [{ texto: retirar }] });

  const diario = diarioParaRelatorio(a.diarioAlimentar);
  if (diario.length) {
    const linhas: Bloco["linhas"] = [];
    for (const r of diario) {
      linhas.push({ texto: [r.refeicao, r.horario, r.local].filter(Boolean).join(" · "), negrito: true });
      for (const al of r.alimentos) linhas.push({ texto: al, nivel: 1 });
    }
    blocos.push({ titulo: "Diário alimentar", linhas });
  }
  const comp = composicaoParaRelatorio(composicao);
  if (comp) {
    blocos.push({
      titulo: "Composição estimada do diário alimentar",
      linhas: comp.totais.map((t) => kv(t.label, t.valor)),
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
  const txt = (titulo: string, t: string) => t && blocos.push({ titulo, linhas: t.split(/\n+/).map((x) => ({ texto: x })) });
  txt("Síntese da avaliação", analise.sintese);
  txt("Composição corporal", analise.composicaoCorporal);
  txt("Gasto energético", analise.gastoEnergetico);
  txt("Hidratação", analise.hidratacao);
  txt("Estratégia energética", analise.estrategiaEnergetica);
  if (analise.pontosAtencao.length)
    blocos.push({ titulo: "Pontos de atenção", linhas: analise.pontosAtencao.map((p) => ({ texto: p, nivel: 1 })) });
  const grupos = intervencoesParaRelatorio(analise.intervencoes);
  if (grupos.length) {
    const linhas: Bloco["linhas"] = [];
    for (const g of grupos) {
      linhas.push({ texto: g.label.toUpperCase(), negrito: true });
      for (const c of g.categorias) {
        linhas.push({ texto: c.categoria, negrito: true });
        for (const i of c.itens) {
          if (i.problema) linhas.push({ texto: i.problema, nivel: 1 });
          for (const acao of i.acoes) linhas.push({ texto: `→ ${acao}`, nivel: 2 });
          if (i.justificativa) linhas.push({ texto: `(${i.justificativa})`, nivel: 2 });
        }
      }
    }
    blocos.push({ titulo: "Mudanças e intervenções sugeridas", linhas });
  }
  txt("Sugestão técnica", analise.sugestaoTecnica);
  return blocos;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Texto puro e HTML simples para colar no Word ou no Bloco de Notas. */
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
  const html =
    `<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt"><h1 style="font-size:16pt">${cab}</h1>` +
    blocos
      .map(
        (b) =>
          `<h2 style="font-size:13pt;margin:14pt 0 6pt 0">${esc(b.titulo)}</h2>` +
          b.linhas
            .map((l) => {
              const conteudo = l.negrito ? `<b>${esc(l.texto)}</b>` : esc(l.texto);
              const margem = (l.nivel ?? 0) * 18;
              return `<p style="font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 4pt ${margem}pt">${(l.nivel ?? 0) === 1 ? "• " : ""}${conteudo}</p>`;
            })
            .join(""),
      )
      .join("") +
    "</div>";
  return { texto, html };
}
