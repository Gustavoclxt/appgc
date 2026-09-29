import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const analiseInput = z.object({ resumo: z.string().min(10).max(40000) });
const examesInput = z.object({ textoPdf: z.string().min(10).max(60000) });

const SISTEMA_ANALISE = `Você é assistente técnico de nutricionistas clínicos e esportivos, no Brasil.
Receberá os dados de uma avaliação nutricional já calculada pelo sistema.
Produza uma sugestão técnica objetiva, organizada e profissional, em português do Brasil.

REGRAS OBRIGATÓRIAS:
- Nunca apresente diagnóstico médico nem prescrição. Use linguagem como "Considerar...", "Uma estratégia inicial possível é...", "Os dados sugerem...", "A decisão final deve considerar...".
- Não invente dados que não foram fornecidos. Se algo não foi informado, diga que não foi informado.
- Não transforme alterações laboratoriais em diagnóstico.
- Não extrapole o que o método de avaliação de composição corporal não permite determinar.
- Seja objetivo; frases curtas; sem floreios.

Responda APENAS um objeto JSON com estas chaves de texto:
{
  "sintese": "resumo dos principais achados",
  "composicaoCorporal": "interpretação dos dados disponíveis",
  "gastoEnergetico": "leitura do método, TMB, FA e VET",
  "hidratacao": "leitura da faixa de 30-35 mL/kg",
  "estrategiaEnergetica": "leitura da estratégia escolhida, percentual, VET e calorias sugeridas",
  "pontosAtencao": ["item", "item"],
  "sugestaoTecnica": "recomendação objetiva para auxiliar o nutricionista na prescrição"
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
    const texto = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      sintese: texto(resultado["sintese"]),
      composicaoCorporal: texto(resultado["composicaoCorporal"]),
      gastoEnergetico: texto(resultado["gastoEnergetico"]),
      hidratacao: texto(resultado["hidratacao"]),
      estrategiaEnergetica: texto(resultado["estrategiaEnergetica"]),
      pontosAtencao: Array.isArray(resultado["pontosAtencao"])
        ? resultado["pontosAtencao"].filter((p): p is string => typeof p === "string")
        : [],
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
