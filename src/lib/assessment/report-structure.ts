import {
  fmt2,
  fmtData,
  fmtInt,
  fmtLitros,
  labelEstrategia,
  labelMetodo,
  type DerivedResults,
} from "./calculations";
import type { Assessment, ExameLaboratorial, Refeicao } from "./types";
import { anamneseParaRelatorio, observacoesRecordatorioParaRelatorio, type ReportField } from "./report-anamnesis";
import { diarioParaRelatorio, type RefeicaoRelatorio } from "./food-diary";
import { composicaoParaRelatorio, type ComposicaoDiario } from "./diet-composition";
import { linhasAlimentosRetirar } from "./food-preferences";
import { examesParaRelatorio } from "./report-exams";
import { resumoVetFinal } from "./free-meal";
import { agruparAntropometria, rotuloIndicador, valorComUnidade } from "./anthropometry-groups";

export type BlocoRelatorio =
  | { tipo: "campos"; titulo: string; campos: ReportField[] }
  | { tipo: "refeicoes"; titulo: string; refeicoes: RefeicaoRelatorio[] }
  | { tipo: "lista"; titulo: string; itens: string[] }
  | { tipo: "exames"; titulo: string; exames: ExameLaboratorial[] }
  | { tipo: "metas"; titulo: string };

const preenchidos = (campos: Array<[string, string | null | undefined]>): ReportField[] =>
  campos.flatMap(([label, value]) => (value && value.trim() ? [{ label, value: value.trim() }] : []));

/**
 * Ordem única do relatório, idêntica à do formulário, usada pela tela, cópia e PDF.
 */
export function relatorioEstruturado(
  a: Assessment,
  d: DerivedResults,
  composicao: ComposicaoDiario | null,
  diaAtipico: Refeicao[] | null = null,
  composicaoAtipica: ComposicaoDiario | null = null,
  temMetas = false,
): BlocoRelatorio[] {
  const blocos: BlocoRelatorio[] = [];
  const push = (b: BlocoRelatorio) => {
    if (b.tipo === "campos" && !b.campos.length) return;
    if (b.tipo === "refeicoes" && !b.refeicoes.length) return;
    if (b.tipo === "lista" && !b.itens.length) return;
    if (b.tipo === "exames" && !b.exames.length) return;
    blocos.push(b);
  };

  push({
    tipo: "campos",
    titulo: "Informações pessoais",
    campos: preenchidos([
      ["Data da avaliação", a.dataAvaliacao ? fmtData(a.dataAvaliacao) : ""],
      ["Nome completo", a.nome],
      ["Sexo", a.sexo ? (a.sexo === "masculino" ? "Masculino" : "Feminino") : ""],
      ["Data de nascimento", a.dataNascimento ? `${fmtData(a.dataNascimento)}${d.idade !== null ? ` (${d.idade} anos)` : ""}` : ""],
      ["Profissão", a.profissao],
    ]),
  });

  const anamnese = anamneseParaRelatorio(a, d);
  const secao = (id: string) => {
    const s = anamnese.find((x) => x.id === id);
    if (s) push({ tipo: "campos", titulo: s.title, campos: s.fields });
  };
  for (const id of ["objetivo", "historia", "exames-habitos", "sistemas-sono", "rotina", "habitos-alimentares", "suplementacao", "preferencias"]) secao(id);

  push({ tipo: "lista", titulo: "Alimentos não consumidos", itens: linhasAlimentosRetirar(a) });

  push({ tipo: "refeicoes", titulo: "Recordatório 24 horas", refeicoes: diarioParaRelatorio(a.diarioAlimentar) });
  const comp = composicaoParaRelatorio(composicao);
  if (comp) push({ tipo: "campos", titulo: "Composição estimada do Recordatório 24h", campos: comp.totais });
  const obsR24 = observacoesRecordatorioParaRelatorio(a);
  if (obsR24) push({ tipo: "campos", titulo: obsR24.title, campos: obsR24.fields });

  if (diaAtipico) push({ tipo: "refeicoes", titulo: "Recordatório 24 horas — Dia atípico", refeicoes: diarioParaRelatorio(diaAtipico) });
  const compAtipica = composicaoParaRelatorio(composicaoAtipica);
  if (compAtipica) push({ tipo: "campos", titulo: "Composição estimada do R24h — Dia atípico", campos: compAtipica.totais });

  secao("evolucao");

  push({
    tipo: "campos",
    titulo: "Avaliação antropométrica",
    campos: preenchidos([
      ["Data da avaliação antropométrica", a.dataAvaliacaoAntropometrica ? fmtData(a.dataAvaliacaoAntropometrica) : ""],
      ["Altura", d.alturaCm !== null ? `${fmt2(d.alturaCm)} cm` : ""],
      ["Peso atual", d.pesoKg !== null ? `${fmt2(d.pesoKg)} kg` : ""],
      ["IMC", d.imc !== null ? `${fmt2(d.imc)} — ${d.classificacaoIMC}` : ""],
      ["PIO", d.pio !== null ? `${fmt2(d.pio)} kg` : ""],
      ["Percentual de gordura", d.percentualGordura !== null ? `${fmt2(d.percentualGordura)}%` : ""],
      ["Método do percentual de gordura", d.percentualGordura !== null ? a.metodoGordura : ""],
      ["Massa gorda", d.massaGorda !== null ? `${fmt2(d.massaGorda)} kg` : ""],
      ["Massa livre de gordura", d.massaLivreGordura !== null ? `${fmt2(d.massaLivreGordura)} kg` : ""],
    ]),
  });
  for (const g of agruparAntropometria(a.indicadoresAntropometricos, a.dataAvaliacaoAntropometrica)) {
    push({
      tipo: "campos",
      titulo: `Antropometria — ${g.categoria}${g.data ? ` (${fmtData(g.data)})` : ""}`,
      campos: g.indicadores.map((i) => ({ label: rotuloIndicador(i.nome, g.categoria), value: valorComUnidade(i, g.categoria) })),
    });
  }

  push({ tipo: "exames", titulo: "Exames laboratoriais", exames: examesParaRelatorio(a.exames) });

  push({
    tipo: "campos",
    titulo: "Determinação do GET",
    campos: preenchidos([
      ["Equação para GER", labelMetodo[a.metodoTMB] ?? ""],
      ["GER", d.tmb !== null ? `${fmtInt(d.tmb)} kcal/dia` : ""],
      ["Fator de atividade", d.fatorAtividade !== null ? fmt2(d.fatorAtividade) : ""],
      ["GET", d.vet !== null ? `${fmtInt(d.vet)} kcal/dia` : ""],
      [
        "Hidratação recomendada",
        d.aguaMin !== null && d.aguaMax !== null
          ? `${fmtInt(d.aguaMin)}–${fmtInt(d.aguaMax)} mL/dia (${fmtLitros(d.aguaMin)}–${fmtLitros(d.aguaMax)} L/dia)`
          : "",
      ],
    ]),
  });
  push({
    tipo: "campos",
    titulo: "Estratégia energética",
    campos: preenchidos([
      ["Estratégia", labelEstrategia[a.estrategia] ?? ""],
      [
        "Ajuste",
        d.ajusteKcal !== null ? `${fmtInt(d.ajusteKcal)} kcal` : d.percentualAjuste !== null ? `${d.percentualAjuste}%` : "",
      ],
      ["VET prescrito", d.caloriasSugeridas !== null ? `${fmtInt(d.caloriasSugeridas)} kcal/dia` : ""],
    ]),
  });
  const vetFinal = resumoVetFinal(d.caloriasSugeridas, a.refeicoesLivresSemana, a.vetRefeicoesLivres);
  if (vetFinal)
    push({
      tipo: "campos",
      titulo: "Cálculo do VET corrigido",
      campos: preenchidos([
        ["Nº de refeições livres/semana", vetFinal.quantidade],
        ["VET das refeições livres", vetFinal.vetRefeicao],
        ["VET corrigido", vetFinal.vetFinal !== null ? `${fmtInt(vetFinal.vetFinal)} kcal/dia` : ""],
      ]),
    });

  if (temMetas) blocos.push({ tipo: "metas", titulo: "Metas e Projeção de Peso" });

  push({
    tipo: "campos",
    titulo: "Frequência cardíaca para o cardio",
    campos: preenchidos([
      ["FcMax (220 − idade)", d.fcMax !== null ? `${fmtInt(d.fcMax)} bpm` : ""],
      [
        "Faixa recomendada (60–70%)",
        d.cardioMin !== null && d.cardioMax !== null ? `${fmtInt(d.cardioMin)}–${fmtInt(d.cardioMax)} bpm` : "",
      ],
    ]),
  });

  return blocos;
}
