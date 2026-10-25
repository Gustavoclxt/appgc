import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DIRETRIZES_ANALISE_COMPLETA } from "./analysis-guidance";

const analiseInput = z.object({ resumo: z.string().min(10).max(40000) });
const examesInput = z.object({ textoPdf: z.string().min(10).max(60000) });

const SISTEMA_ANALISE = `Você é assistente técnico de nutricionistas clínicos e esportivos, no Brasil.
Receberá os dados de uma avaliação nutricional já calculada pelo sistema.
Produza um painel clínico de decisão rápida, objetivo e profissional, em português do Brasil.

REGRA PRINCIPAL — CONTEXTO CLÍNICO INTEGRADO:
- Antes de escrever QUALQUER seção, analise o objeto completo da anamnese preenchida.
- Trate a anamnese como um contexto clínico único e integrado, não como grupos independentes.
- TODAS as seções devem considerar TODOS os campos preenchidos relevantes: objetivo, motivação, histórico ponderal, HMA, HMP, HMF, medicamentos, exames, composição corporal, rotina profissional, sono, treinamento, função gastrointestinal, hidratação, comportamento alimentar, Recordatório 24h, horários de fome, preferências, aversões, restrições, suplementação, hábitos sociais e evolução recente do peso.
- Cruze as informações entre si, sem afirmar causalidade. Trate restrições alimentares como obrigatórias nas condutas.

SEÇÕES:
- "resumoClinico": pares de rótulo e valor. Use somente rótulos aplicáveis entre OBJETIVO, PRINCIPAL INCÔMODO, ADESÃO, TREINO, SONO, HIDRATAÇÃO, INTESTINO, PESO, COMPOSIÇÃO CORPORAL, VET e CALORIAS R24h. Omita dados ausentes. Valores factuais e compactos, sem recomendações.
- "achados": separar constatações em prioridade, monitorar e favoraveis. Não preencher artificialmente grupos. Usar frases concisas, mas completas, com o número observado quando útil. Achado não contém conduta. Incluir todos os pontos de atenção relevantes, sem limite artificial de itens.
- "estrategiaInicial": categorias conforme os temas relevantes, incluindo ENERGIA, ADESÃO/MOTIVAÇÃO, HISTÓRIA CLÍNICA, MEDICAMENTOS/EAAs, EXAMES, ALERGIAS/RESTRIÇÕES, HÁBITOS SOCIAIS, HIDRATAÇÃO, INTESTINO, SONO/RECUPERAÇÃO, TRABALHO/PREPARO, TREINO, HÁBITOS ALIMENTARES, SUPLEMENTAÇÃO, RECORDATÓRIO e EVOLUÇÃO DO PESO. Ações concisas, específicas e suficientes para cobrir as respostas; não limitar a três ações quando houver mais orientações pertinentes. Conduta não repete toda a descrição do achado.
- "focoProximoRetorno": 3 a 5 prioridades específicas, ordenadas por impacto e ligadas aos achados.
- "reavaliarRetorno": checklist curto e dinâmico, somente com itens relevantes aos problemas encontrados.

REGRAS OBRIGATÓRIAS:
- Nunca apresente diagnóstico médico nem prescrição. Use linguagem como "Considerar...", "Uma estratégia inicial possível é...", "Os dados sugerem...", "A decisão final deve considerar...".
- Não invente dados. Nunca infira hábito, sintoma, preferência, diagnóstico ou comportamento não informado. Não invente problemas.
- Não transforme alterações laboratoriais em diagnóstico.
- Não extrapole o que o método de avaliação de composição corporal não permite determinar.
- Nunca escreva parágrafos. Use frases curtas, números e palavras-chave.
- Não repita a mesma informação em vários blocos.
- Diferencie achado de conduta.
- Para dados que exigem confirmação, use Confirmar, Investigar, Monitorar, Correlacionar clinicamente ou Conferir no laudo.
- Alteração laboratorial não é diagnóstico: informe o status e recomende correlação clínica ou avaliação médica quando pertinente.

${DIRETRIZES_ANALISE_COMPLETA}

Responda APENAS um objeto JSON com estas chaves:
{
  "resumoClinico": [{ "label": "OBJETIVO", "valor": "Recomposição corporal" }],
  "achados": { "prioridade": ["item"], "monitorar": ["item"], "favoraveis": ["item"] },
  "estrategiaInicial": [{ "categoria": "ENERGIA", "acoes": ["Considerar estratégia normocalórica", "Monitorar peso e performance"] }],
  "focoProximoRetorno": ["item específico", "item específico", "item específico"],
  "reavaliarRetorno": ["Peso", "Sono"]
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
    const listaTextos = (valor: unknown, limite?: number) =>
      (Array.isArray(valor) ? valor : []).map(texto).filter(Boolean).slice(0, limite);
    const objetos = (valor: unknown) =>
      (Array.isArray(valor) ? valor : []).filter(
        (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
      );
    const achados =
      typeof resultado["achados"] === "object" && resultado["achados"] !== null
        ? (resultado["achados"] as Record<string, unknown>)
        : {};
    return {
      resumoClinico: objetos(resultado["resumoClinico"])
        .map((item) => ({ label: texto(item["label"]).toUpperCase(), valor: texto(item["valor"]) }))
        .filter((item) => item.label && item.valor)
        .slice(0, 11),
      achados: {
        prioridade: listaTextos(achados["prioridade"]),
        monitorar: listaTextos(achados["monitorar"]),
        favoraveis: listaTextos(achados["favoraveis"]),
      },
      estrategiaInicial: objetos(resultado["estrategiaInicial"])
        .map((item) => ({
          categoria: texto(item["categoria"]).toUpperCase(),
          acoes: listaTextos(item["acoes"]),
        }))
        .filter((item) => item.categoria && item.acoes.length > 0),
      focoProximoRetorno: listaTextos(resultado["focoProximoRetorno"], 5),
      reavaliarRetorno: listaTextos(resultado["reavaliarRetorno"]),
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

const SISTEMA_ANTROPOMETRIA = `Você extrai dados antropométricos de relatórios em texto (bioimpedância, DEXA, dobras cutâneas, avaliações físicas), em português do Brasil.
Extraia apenas o que está explicitamente no texto. Nunca invente nem calcule valores.
Preserve nomes dos indicadores, valores, unidades e datas como aparecem no documento.
Inclua também altura e peso no array indicadores, mesmo quando preencher os campos principais. Leia todas as linhas e colunas do documento, distinguindo medidas, circunferências (incluindo lado esquerdo/direito e braço relaxado/contraído), dobras cutâneas e resultados. Não omita indicadores nem confunda circunferência em cm com dobra em mm. Se houver várias avaliações, use a mais recente nos campos principais e preserve cada indicador com sua própria data.
Campos principais (deixe "" se não identificar com segurança):
- altura: em metros com vírgula (ex.: "1,75"); converta de cm se necessário.
- peso: em kg com vírgula (ex.: "78,4").
- percentualGordura: número com vírgula, sem "%".
- metodo: um de "Bioimpedância", "DEXA", "Dobras cutâneas", "Estimativa", "Outro" ou "".
- data: data da avaliação no formato AAAA-MM-DD ou "".
Responda APENAS um objeto JSON:
{ "altura": "", "peso": "", "percentualGordura": "", "metodo": "", "data": "", "indicadores": [ { "nome": "", "valor": "", "unidade": "", "data": "" } ] }`;

export const extrairAntropometria = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => examesInput.parse(data))
  .handler(async ({ data }) => {
    const { chatJSON } = await import("./ai.server");
    const r = (await chatJSON(
      SISTEMA_ANTROPOMETRIA,
      `Texto do relatório:\n\n${data.textoPdf}`,
      "google/gemini-3.1-flash-lite",
    )) as Record<string, unknown>;
    const t = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v).trim() : "");
    const num = (v: unknown) => {
      const x = t(v).replace(/[^\d.,]/g, "").replace(".", ",");
      return /^\d+(,\d+)?$/.test(x) ? x : "";
    };
    const metodos = ["Bioimpedância", "DEXA", "Dobras cutâneas", "Estimativa", "Outro"];
    const dataIso = t(r["data"]);
    return {
      altura: num(r["altura"]),
      peso: num(r["peso"]),
      percentualGordura: num(r["percentualGordura"]),
      metodo: metodos.includes(t(r["metodo"])) ? t(r["metodo"]) : "",
      data: /^\d{4}-\d{2}-\d{2}$/.test(dataIso) ? dataIso : "",
      indicadores: (Array.isArray(r["indicadores"]) ? r["indicadores"] : [])
        .filter((i): i is Record<string, unknown> => typeof i === "object" && i !== null)
        .map((i) => ({ nome: t(i["nome"]), valor: t(i["valor"]), unidade: t(i["unidade"]), data: t(i["data"]) }))
        .filter((i) => i.nome && i.valor)
        .slice(0, 80),
    };
  });

const composicaoInput = z.object({
  itens: z
    .array(z.object({ refeicao: z.string().max(200), alimento: z.string().max(300), quantidade: z.string().max(200) }))
    .min(1)
    .max(150),
});

const SISTEMA_COMPOSICAO = `Você é assistente técnico de nutricionistas no Brasil.
Para cada alimento de um Recordatório 24h, estime calorias (kcal), carboidratos (g), proteínas (g) e lipídios (g) da quantidade informada.
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
