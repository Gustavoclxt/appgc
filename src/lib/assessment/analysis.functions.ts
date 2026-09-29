import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const analiseInput = z.object({ resumo: z.string().min(10).max(40000) });
const examesInput = z.object({ textoPdf: z.string().min(10).max(60000) });

const CATEGORIAS = [
  "Alimentação",
  "Distribuição das refeições",
  "Proteínas e composição da dieta",
  "Carboidratos e energia",
  "Hidratação",
  "Treinamento e estratégia nutricional",
  "Sono e recuperação",
  "Comportamento alimentar",
  "Preferências, aversões e adesão",
  "Trato gastrointestinal",
  "Suplementação",
  "Exames e pontos clínicos",
  "Estratégia energética",
];

const SISTEMA_ANALISE = `Você é assistente técnico de nutricionistas clínicos e esportivos, no Brasil.
Receberá os dados de uma avaliação nutricional já calculada pelo sistema.
Produza uma análise técnica objetiva, organizada e profissional, em português do Brasil.

REGRA PRINCIPAL — CONTEXTO CLÍNICO INTEGRADO:
- Antes de escrever QUALQUER seção, analise o objeto completo da anamnese preenchida.
- Trate a anamnese como um contexto clínico único e integrado, não como grupos independentes.
- TODAS as seções devem considerar TODOS os campos preenchidos relevantes: objetivo, motivação, histórico ponderal, HMA, HMP, HMF, medicamentos, exames, composição corporal, rotina profissional, sono, treinamento, função gastrointestinal, hidratação, comportamento alimentar, diário alimentar, horários de fome, preferências, aversões, restrições, suplementação, hábitos sociais e evolução recente do peso.
- Cruze as informações entre si e considere suas possíveis relações (ex.: sono curto + treino noturno + trabalho até tarde + fome noturna + poucas refeições no trabalho + baixa ingestão hídrica). Não apenas liste cada informação separadamente.

SEÇÕES:
- "sintese": visão global da anamnese; não repita campos, identifique o que é clinicamente relevante para a estratégia nutricional e as relações entre os achados.
- "pontosAtencao": derivados de toda a anamnese, não de um subconjunto predefinido.
- "intervencoes": MUDANÇAS E INTERVENÇÕES SUGERIDAS — ações práticas, específicas para ESTE paciente, para o nutricionista considerar na conduta. Cada item: categoria (uma de: ${CATEGORIAS.join("; ")}), prioridade ("alta" = maior impacto sobre o objetivo; "moderada" = ajuste relevante; "baixa" = otimização/adesão/praticidade), problema identificado (curto), intervenção sugerida (ação contextualizada e prática) e justificativa (citando os dados do paciente que a sustentam). Use apenas categorias justificadas pelos dados; não preencha todas obrigatoriamente. Evite sugestões genéricas como "comer melhor", "beber mais água", "dormir melhor".
- "sugestaoTecnica": coerência entre objetivo, composição corporal, gasto energético, histórico ponderal, rotina, treino, sono, comportamento alimentar, preferências/aversões, sintomas gastrointestinais, hidratação, medicamentos, suplementos, exames e diário alimentar.

REGRAS OBRIGATÓRIAS:
- Nunca apresente diagnóstico médico nem prescrição. Use linguagem como "Considerar...", "Uma estratégia inicial possível é...", "Os dados sugerem...", "A decisão final deve considerar...".
- Não invente dados. Nunca infira hábito, sintoma, preferência, diagnóstico ou comportamento não informado. Não invente problemas.
- Não transforme alterações laboratoriais em diagnóstico.
- Não extrapole o que o método de avaliação de composição corporal não permite determinar.
- Seja objetivo; frases curtas; sem floreios.

Responda APENAS um objeto JSON com estas chaves:
{
  "sintese": "texto",
  "composicaoCorporal": "texto",
  "gastoEnergetico": "leitura do método, TMB, FA e VET",
  "hidratacao": "leitura da faixa de 30-35 mL/kg frente à ingestão relatada",
  "estrategiaEnergetica": "leitura da estratégia escolhida, ajuste, VET e calorias sugeridas",
  "pontosAtencao": ["item", "item"],
  "intervencoes": [ { "categoria": "", "prioridade": "alta", "problema": "", "intervencao": "", "justificativa": "" } ],
  "sugestaoTecnica": "texto"
}`;

const SISTEMA_EXAMES = `Você extrai exames laboratoriais de laudos em texto, em português do Brasil.
Extraia apenas o que está explicitamente no texto. Nunca invente valores.
Use prioritariamente o intervalo de referência apresentado no próprio laudo.
Classifique o status comparando o resultado ao intervalo de referência do laudo:
"dentro", "abaixo", "acima" ou "indeterminado" (quando não for possível comparar).
Não produza diagnóstico.

Responda APENAS um objeto JSON:
{ "exames": [ { "exame": "", "resultado": "", "unidade": "", "referencia": "", "data": "", "status": "dentro" } ] }`;

export const analisarAvaliacao = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => analiseInput.parse(data))
  .handler(async ({ data }) => {
    const { chatJSON } = await import("./ai.server");
    const resultado = (await chatJSON(SISTEMA_ANALISE, data.resumo)) as Record<string, unknown>;
    const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const prioridades = ["alta", "moderada", "baixa"] as const;
    const intervencoes = (Array.isArray(resultado["intervencoes"]) ? resultado["intervencoes"] : [])
      .filter((i): i is Record<string, unknown> => typeof i === "object" && i !== null)
      .map((i) => {
        const p = texto(i["prioridade"]).toLowerCase();
        return {
          categoria: texto(i["categoria"]) || "Outros",
          prioridade: (prioridades as readonly string[]).includes(p)
            ? (p as (typeof prioridades)[number])
            : ("moderada" as const),
          problema: texto(i["problema"]),
          intervencao: texto(i["intervencao"]),
          justificativa: texto(i["justificativa"]),
        };
      })
      .filter((i) => i.intervencao !== "");
    return {
      sintese: texto(resultado["sintese"]),
      composicaoCorporal: texto(resultado["composicaoCorporal"]),
      gastoEnergetico: texto(resultado["gastoEnergetico"]),
      hidratacao: texto(resultado["hidratacao"]),
      estrategiaEnergetica: texto(resultado["estrategiaEnergetica"]),
      pontosAtencao: Array.isArray(resultado["pontosAtencao"])
        ? resultado["pontosAtencao"].filter((p): p is string => typeof p === "string")
        : [],
      intervencoes,
      sugestaoTecnica: texto(resultado["sugestaoTecnica"]),
    };
  });

export const extrairExames = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => examesInput.parse(data))
  .handler(async ({ data }) => {
    const { chatJSON } = await import("./ai.server");
    const resultado = (await chatJSON(
      SISTEMA_EXAMES,
      `Texto do laudo:\n\n${data.textoPdf}`,
      "google/gemini-3.1-flash-lite",
    )) as { exames?: unknown };

    const lista = Array.isArray(resultado["exames"]) ? resultado["exames"] : [];
    const statusValidos = ["dentro", "abaixo", "acima", "indeterminado"] as const;

    return lista
      .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((e) => {
        const status = String(e["status"] ?? "indeterminado");
        return {
          exame: String(e["exame"] ?? "").trim(),
          resultado: String(e["resultado"] ?? "").trim(),
          unidade: String(e["unidade"] ?? "").trim(),
          referencia: String(e["referencia"] ?? "").trim(),
          data: String(e["data"] ?? "").trim(),
          status: (statusValidos as readonly string[]).includes(status)
            ? (status as (typeof statusValidos)[number])
            : ("indeterminado" as const),
        };
      })
      .filter((e) => e.exame !== "");
  });
