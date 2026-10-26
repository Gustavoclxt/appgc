import type { IndicadorAntropometrico } from "./types";
import type { CategoriaAntropometrica } from "./anthropometry-groups";

export type BodySite = { view: "front" | "back"; x: number; y: number };

/** Coordinates locate reported sites only; no measurements are calculated or inferred. */
export function bodySite(nome: string, categoria: CategoriaAntropometrica): BodySite | null {
  const n = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const left = /\b(esquerd\w*|esq|e)\b/.test(n);
  const limb = left ? 224 : 136; // Patient's left is on the viewer's right in anterior view.
  const leg = left ? 202 : 158;
  if (categoria === "Circunferências") {
    if (/\b(ombros?)\b/.test(n)) return { view: "front", x: 180, y: 124 };
    if (/\b(pescoco|cervical)\b/.test(n)) return { view: "front", x: 180, y: 99 };
    if (/\b(antebraco)\b/.test(n)) return { view: "front", x: left ? 244 : 116, y: 237 };
    if (/\b(braco)\b/.test(n)) return { view: "front", x: limb, y: /contraido|flexionado/.test(n) ? 164 : 192 };
    if (/\b(peitoral|torax|toracica)\b/.test(n)) return { view: "front", x: 180, y: 156 };
    if (/\b(cintura)\b/.test(n)) return { view: "front", x: 180, y: 209 };
    if (/\b(abdomen|abdominal)\b/.test(n)) return { view: "front", x: 180, y: 239 };
    if (/\b(quadril|gluteo)\b/.test(n)) return { view: "front", x: 180, y: 278 };
    if (/\b(coxa)\b/.test(n)) return { view: "front", x: leg, y: /proximal/.test(n) ? 309 : /distal/.test(n) ? 363 : 334 };
    if (/\b(panturrilha|perna)\b/.test(n)) return { view: "front", x: leg, y: 435 };
  }
  if (categoria === "Dobras cutâneas") {
    if (/\b(triceps|tricipital)\b/.test(n)) return { view: "back", x: left ? 136 : 224, y: 183 };
    if (/\b(subescapular)\b/.test(n)) return { view: "back", x: left ? 163 : 197, y: 166 };
    if (/\b(biceps|bicipital)\b/.test(n)) return { view: "front", x: limb, y: 183 };
    if (/\b(axilar)\b/.test(n)) return { view: "front", x: left ? 210 : 150, y: 183 };
    if (/\b(peitoral|torax|toracica)\b/.test(n)) return { view: "front", x: left ? 200 : 160, y: 148 };
    if (/\b(abdominal|abdomen)\b/.test(n)) return { view: "front", x: 190, y: 236 };
    if (/\b(suprailiaca|supra iliaca|supraespinal|supra espinal)\b/.test(n)) return { view: "front", x: left ? 208 : 152, y: 258 };
    if (/\b(coxa)\b/.test(n)) return { view: "front", x: leg, y: 334 };
    if (/\b(panturrilha|medial)\b/.test(n)) return { view: "front", x: leg, y: 435 };
  }
  return null;
}

export function bodyMeasurements(indicadores: IndicadorAntropometrico[], categoria: CategoriaAntropometrica) {
  return indicadores.flatMap(indicador => {
    const site = bodySite(indicador.nome, categoria);
    return site ? [{ indicador, site }] : [];
  });
}