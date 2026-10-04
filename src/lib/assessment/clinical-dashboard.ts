import { fmt2, fmtInt, fmtLitros, type DerivedResults } from "./calculations";
import type { ComposicaoDiario } from "./diet-composition";
import type { AnaliseIA, Assessment } from "./types";

export interface PainelSecaoLista {
  titulo: string;
  itens: string[];
  tom?: "prioridade" | "monitorar" | "favoravel";
}

/** Estrutura compartilhada pela prévia, cópia e PDF do painel clínico. */
export function painelClinicoParaRelatorio(
  analise: AnaliseIA,
  a: Assessment,
  d: DerivedResults,
  composicao: ComposicaoDiario | null,
) {
  const adesao = analise.resumoClinico.find((item) => item.label === "ADESÃO");
  const treino = a.modalidades
    .filter((item) => item.modalidade.trim())
    .map((item) => [item.modalidade, item.frequenciaSemanal, item.duracao, item.horario].filter(Boolean).join(" · "))
    .join("; ");
  const sono = [
    d.sono ? `${d.sono.horas}h ${d.sono.restoMinutos}min` : "",
    a.qualidadeSono,
  ].filter(Boolean).join(" · ");
  const hidratacao = [
    a.consumoAgua && `Atual: ${a.consumoAgua}`,
    d.aguaMin !== null && `Referência: ${fmtLitros(d.aguaMin)}–${fmtLitros(d.aguaMax)} L/dia`,
  ].filter(Boolean).join(" · ");
  const intestino = [a.frequenciaEvacuacao, a.bristol && `Bristol ${a.bristol}`].filter(Boolean).join(" · ");
  const peso = [d.pesoKg !== null && `${fmt2(d.pesoKg)} kg`, a.evolucaoPeso].filter(Boolean).join(" · ");
  const composicaoCorporal = [
    d.percentualGordura !== null && `${fmt2(d.percentualGordura)}% de gordura`,
    d.massaGorda !== null && `${fmt2(d.massaGorda)} kg de massa gorda`,
    d.massaLivreGordura !== null && `${fmt2(d.massaLivreGordura)} kg de massa livre de gordura`,
  ].filter(Boolean).join(" · ");
  const resumo = [
    { label: "OBJETIVO", valor: a.objetivos[0] ?? "" },
    { label: "PRINCIPAL INCÔMODO", valor: a.incomodoFisico },
    adesao,
    { label: "TREINO", valor: treino },
    { label: "SONO", valor: sono },
    { label: "HIDRATAÇÃO", valor: hidratacao },
    { label: "INTESTINO", valor: intestino },
    { label: "PESO", valor: peso },
    { label: "COMPOSIÇÃO CORPORAL", valor: composicaoCorporal },
    { label: "VET", valor: d.vet !== null ? `${fmtInt(d.vet)} kcal/dia` : "" },
    { label: "CALORIAS R24H", valor: composicao ? `${fmtInt(composicao.totais.kcal)} kcal` : "" },
  ].filter((item): item is { label: string; valor: string } => Boolean(item?.label && item.valor));

  const achados: PainelSecaoLista[] = ([
    { titulo: "Prioridade", itens: analise.achados.prioridade, tom: "prioridade" },
    { titulo: "Monitorar", itens: analise.achados.monitorar, tom: "monitorar" },
    { titulo: "Favoráveis", itens: analise.achados.favoraveis, tom: "favoravel" },
  ] satisfies PainelSecaoLista[]).filter((grupo) => grupo.itens.length > 0);

  return {
    resumo,
    achados,
    estrategia: analise.estrategiaInicial.filter((grupo) => grupo.acoes.length > 0),
    foco: analise.focoProximoRetorno.slice(0, 5),
    reavaliar: analise.reavaliarRetorno,
  };
}