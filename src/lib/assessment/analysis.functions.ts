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
- "intervencoes": MUDANÇAS E INTERVENÇÕES SUGERIDAS — um checklist de condutas, curto e escaneável, para o nutricionista considerar. Cada item: categoria (uma de: ${CATEGORIAS.join("; ")}), prioridade ("alta" = maior impacto sobre o objetivo; "moderada" = ajuste relevante; "baixa" = otimização/adesão/praticidade), "problema" (o que observar: constatação curta e objetiva, máx. 8 palavras, citando o dado relevante quando útil — ex.: "Superávit atual: 500 kcal"), "acoes" (2 a 4 ações curtas e diretas, cada uma com no máximo ~10 palavras, iniciadas por verbo no infinitivo, cada uma em um item separado do array; sem justificar dentro da ação) e "justificativa" (opcional, uma frase muito curta citando o dado do paciente que sustenta a conduta; omitir quando o problema já for autoexplicativo). Use apenas categorias justificadas pelos dados; não preencha todas obrigatoriamente. Evite sugestões genéricas como "comer melhor", "beber mais água", "dormir melhor". Frases longas e parágrafos corridos são proibidos neste bloco.
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
  "intervencoes": [ { "categoria": "", "prioridade": "alta", "problema": "", "acoes": ["", ""], "justificativa": "" } ],
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
        const acoesBrutas = Array.isArray(i["acoes"]) ? (i["acoes"] as unknown[]) : [];
        const acoes = acoesBrutas
          .map(texto)
          .filter(Boolean);
        if (acoes.length === 0) {
          // Compatibilidade: aceita intervenção em texto único e quebra em itens.
          acoes.push(
            ...texto(i["intervencao"])
              .split(/\n|→|;|\.\s/)
              .map((t) => t.replace(/^[\s>•\-–*]*→?[\s]*/, "").trim())
              .filter(Boolean),
          );
        }
        return {
          categoria: texto(i["categoria"]) || "Outros",
          prioridade: (prioridades as readonly string[]).includes(p)
            ? (p as (typeof prioridades)[number])
            : ("moderada" as const),
          problema: texto(i["problema"]),
          acoes,
          justificativa: texto(i["justificativa"]),
        };
      })
      .filter((i) => i.acoes.length > 0);
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

const composicaoInput = z.object({
  itens: z
    .array(z.object({ refeicao: z.string().max(200), alimento: z.string().max(300), quantidade: z.string().max(200) }))
    .min(1)
    .max(150),
});

const SISTEMA_COMPOSICAO = `Você é assistente técnico de nutricionistas no Brasil.
Para cada alimento de um diário alimentar, estime calorias (kcal), carboidratos (g), proteínas (g) e lipídios (g) da quantidade informada.
Use prioritariamente a Tabela Brasileira de Composição de Alimentos (TACO/NEPA-UNICAMP) e a Tabela de Composição Química dos Alimentos de Sônia Tucunduva Philippi, bem como as medidas caseiras usuais dessas referências.
Se o alimento não existir nessas tabelas, use outra fonte confiável (ex.: IBGE POF, USDA, rótulo típico) e indique-a em "fonte".
Se a quantidade não for informada, considere uma porção usual e informe isso na fonte (ex.: "TACO — porção usual").
Mantenha a mesma ordem e a mesma quantidade de itens recebidos.
Responda APENAS JSON: { "itens": [ { "kcal": 0, "carboidratos": 0, "proteinas": 0, "lipidios": 0, "fonte": "TACO" } ] }`;

export const calcularComposicaoDiario = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => composicaoInput.parse(data))
  .handler(async ({ data }) => {
    const { chatJSON } = await import("./ai.server");
    const lista = data.itens
      .map((i, n) => `${n + 1}. ${i.alimento} | quantidade: ${i.quantidade || "não informada"} | refeição: ${i.refeicao}`)
      .join("\n");
    const resultado = (await chatJSON(SISTEMA_COMPOSICAO, `Alimentos:\n${lista}`)) as { itens?: unknown };
    const brutos = Array.isArray(resultado["itens"]) ? (resultado["itens"] as Record<string, unknown>[]) : [];
    const num = (v: unknown) => {
      const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
      return Number.isFinite(n) && n >= 0 ? n : 0;
    };
    return data.itens.map((i, n) => {
      const r = brutos[n] ?? {};
      return {
        ...i,
        kcal: num(r["kcal"]),
        carboidratos: num(r["carboidratos"]),
        proteinas: num(r["proteinas"]),
        lipidios: num(r["lipidios"]),
        fonte: typeof r["fonte"] === "string" ? r["fonte"].trim() : "",
      };
    });
  });
