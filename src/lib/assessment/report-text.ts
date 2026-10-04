import { fmt2, fmtData, fmtInt, fmtLitros, labelEstrategia, labelMetodo, type DerivedResults } from "./calculations";
import type { AnaliseIA, Assessment } from "./types";
import { anamneseParaRelatorio } from "./report-anamnesis";
import { diarioParaRelatorio } from "./food-diary";
import { examesParaRelatorio } from "./report-exams";
import { composicaoParaRelatorio, type ComposicaoDiario } from "./diet-composition";
import { linhasAlimentosRetirar } from "./food-preferences";
import { painelClinicoParaRelatorio } from "./clinical-dashboard";

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
  const retirar = linhasAlimentosRetirar(a);
  if (retirar.length) blocos.push({ titulo: "Alimentos não consumidos", linhas: retirar.map((texto) => ({ texto })) });

  const diario = diarioParaRelatorio(a.diarioAlimentar);
  if (diario.length) {
    const linhas: Bloco["linhas"] = [];
    for (const r of diario) {
      linhas.push({ texto: [r.refeicao, r.horario, r.local].filter(Boolean).join(" · "), negrito: true });
      for (const al of r.alimentos) linhas.push({ texto: al, nivel: 1 });
    }
    blocos.push({ titulo: "Recordatório 24h", linhas });
  }
  const comp = composicaoParaRelatorio(composicao);
  if (comp) {
    blocos.push({
      titulo: "Composição estimada do Recordatório 24h",
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
  const painel = painelClinicoParaRelatorio(analise, a, d, composicao);
  if (painel.resumo.length) {
    blocos.push({ titulo: "Resumo clínico", linhas: painel.resumo.map((item) => kv(item.label, item.valor)) });
  }
  if (painel.achados.length) {
    blocos.push({
      titulo: "Principais achados",
      linhas: painel.achados.flatMap((grupo) => [
        { texto: grupo.titulo.toUpperCase(), negrito: true },
        ...grupo.itens.map((texto) => ({ texto, nivel: 1 as const })),
      ]),
    });
  }
  if (painel.estrategia.length) {
    blocos.push({
      titulo: "Estratégia inicial",
      linhas: painel.estrategia.flatMap((grupo) => [
        { texto: grupo.categoria, negrito: true },
        ...grupo.acoes.map((texto) => ({ texto: `→ ${texto}`, nivel: 1 as const })),
      ]),
    });
  }
  if (painel.foco.length) {
    blocos.push({ titulo: "Foco até o próximo retorno", linhas: painel.foco.map((texto, index) => ({ texto: `${index + 1}. ${texto}` })) });
  }
  if (painel.reavaliar.length) {
    blocos.push({ titulo: "Reavaliar no retorno", linhas: painel.reavaliar.map((texto) => ({ texto: `☐ ${texto}` })) });
  }
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
