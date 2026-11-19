export const CONDICOES_COMUNS = [
  "Alergia à Proteína do Leite de Vaca (APLV)", "Anemia", "Ansiedade",
  "Asma", "Câncer", "Cardiopatia congênita", "Colite", "Depressão",
  "Dermatite atópica", "Diabetes", "Diabetes tipo 1", "Diabetes tipo 2", "Dislipidemia",
  "Doença celíaca", "Doença renal crônica (DRC)", "Enxaqueca", "Epilepsia", "Gastrite", "Hepatite", "Herpes", "Hipertensão",
  "Hipertireoidismo", "Hipoglicemia", "Hipotireoidismo", "Intolerância à lactose",
  "Obesidade", "Osteoporose", "Problemas cardíacos",
  "Problemas circulatórios", "Problemas renais", "Refluxo gastroesofágico", "Rinite",
  "Síndrome dos ovários policísticos (SOP)", "Sinusite", "TDAH", "Transtorno do Espectro Autista (TEA)",
];

// Newlines separate selections; legacy clinical prose stays intact, including semicolons.
export function condicoesSelecionadas(value: string): string[] {
  return value.split("\n").filter((item) => item.trim().length > 0);
}

const chave = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

export function adicionarCondicao(value: string, condition: string): string {
  const name = condition.trim();
  if (!name || condicoesSelecionadas(value).some((item) => chave(item) === chave(name))) return value;
  return value ? `${value}${value.endsWith("\n") ? "" : "\n"}${name}` : name;
}

export function removerCondicao(value: string, condition: string): string {
  return condicoesSelecionadas(value).filter((item) => item !== condition).join("\n");
}