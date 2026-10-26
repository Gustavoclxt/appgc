import type { IndicadorAntropometrico } from "./types";
import type { CategoriaAntropometrica } from "./anthropometry-groups";

export type BodySite = { view: "front" | "back"; x: number; y: number };
export type SexoSilhueta = "masculino" | "feminino";
export type VistaSilhueta = "front" | "back";

/** Placement of each silhouette image inside the 360x540 viewBox; all figures share top (24) and feet (512) lines. */
export const SILHUETAS: Record<SexoSilhueta, Record<VistaSilhueta, { x: number; y: number; width: number; height: number }>> = {
  masculino: {
    front: { x: 104, y: 24, width: 151, height: 488 },
    back: { x: 105, y: 24, width: 150, height: 488 },
  },
  feminino: {
    front: { x: 108, y: 24, width: 144, height: 488 },
    back: { x: 107, y: 24, width: 146, height: 488 },
  },
};

/** Anatomical landmarks measured on each silhouette; the listed point is the one drawn on the viewer's left. */
const PONTOS: Record<SexoSilhueta, Record<VistaSilhueta, Record<string, [number, number]>>> = {
  masculino: {
    front: {
      ombro: [133, 121],
      pescoco: [180, 104],
      braco: [127, 178],
      bracoContraido: [128, 159],
      antebraco: [116, 236],
      peitoral: [180, 156],
      cintura: [180, 207],
      abdomen: [180, 218],
      quadril: [180, 264],
      coxaProximal: [154, 320],
      coxaDistal: [154, 369],
      panturrilha: [151, 429],
      biceps: [127, 164],
      axilar: [143, 138],
      peitoralDobra: [162, 144],
      abdominal: [184, 216],
      suprailiaca: [154, 239],
      coxaDobra: [154, 345],
      panturrilhaDobra: [151, 429],
    },
    back: {
      triceps: [126, 177],
      subescapular: [168, 159],
    },
  },
  feminino: {
    front: {
      ombro: [145, 125],
      pescoco: [180, 103],
      braco: [130, 182],
      bracoContraido: [136, 160],
      antebraco: [118, 253],
      peitoral: [180, 149],
      cintura: [180, 242],
      abdomen: [180, 258],
      quadril: [180, 298],
      coxaProximal: [154, 319],
      coxaDistal: [152, 381],
      panturrilha: [154, 444],
      biceps: [132, 178],
      axilar: [150, 142],
      peitoralDobra: [165, 149],
      abdominal: [185, 261],
      suprailiaca: [156, 255],
      coxaDobra: [153, 352],
      panturrilhaDobra: [154, 444],
    },
    back: {
      triceps: [127, 182],
      subescapular: [170, 161],
    },
  },
};

/** Coordinates locate reported sites only; no measurements are calculated or inferred. */
export function bodySite(nome: string, categoria: CategoriaAntropometrica, sexo: SexoSilhueta): BodySite | null {
  const n = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ");
  const left = /\b(esquerd\w*|esq|e)\b/.test(n);
  const fig = PONTOS[sexo];
  const ponto = (view: VistaSilhueta, key: string, espelhar: boolean): BodySite => {
    const [x, y] = fig[view][key];
    return { view, x: espelhar ? 360 - x : x, y };
  };
  // Anterior view: the default drawn side is the patient's right; posterior view: the patient's left.
  if (categoria === "Circunferências") {
    if (/\b(ombros?)\b/.test(n)) return ponto("front", "ombro", false);
    if (/\b(pescoco|cervical)\b/.test(n)) return ponto("front", "pescoco", false);
    if (/\b(antebraco)\b/.test(n)) return ponto("front", "antebraco", left);
    if (/\b(braco)\b/.test(n)) return ponto("front", /contraido|flexionado/.test(n) ? "bracoContraido" : "braco", left);
    if (/\b(peitoral|torax|toracica)\b/.test(n)) return ponto("front", "peitoral", false);
    if (/\b(cintura)\b/.test(n)) return ponto("front", "cintura", false);
    if (/\b(abdomen|abdominal)\b/.test(n)) return ponto("front", "abdomen", false);
    if (/\b(quadril|gluteo)\b/.test(n)) return ponto("front", "quadril", false);
    if (/\b(coxa)\b/.test(n)) return ponto("front", /proximal/.test(n) ? "coxaProximal" : /distal/.test(n) ? "coxaDistal" : "coxaProximal", left);
    if (/\b(panturrilha|perna)\b/.test(n)) return ponto("front", "panturrilha", left);
  }
  if (categoria === "Dobras cutâneas") {
    if (/\b(triceps|tricipital)\b/.test(n)) return ponto("back", "triceps", !left);
    if (/\b(subescapular)\b/.test(n)) return ponto("back", "subescapular", !left);
    if (/\b(biceps|bicipital)\b/.test(n)) return ponto("front", "biceps", left);
    if (/\b(axilar)\b/.test(n)) return ponto("front", "axilar", left);
    if (/\b(peitoral|torax|toracica)\b/.test(n)) return ponto("front", "peitoralDobra", left);
    if (/\b(abdominal|abdomen)\b/.test(n)) return ponto("front", "abdominal", false);
    if (/\b(suprailiaca|supra iliaca|supraespinal|supra espinal)\b/.test(n)) return ponto("front", "suprailiaca", left);
    if (/\b(coxa)\b/.test(n)) return ponto("front", "coxaDobra", left);
    if (/\b(panturrilha|medial)\b/.test(n)) return ponto("front", "panturrilhaDobra", left);
  }
  return null;
}

export function bodyMeasurements(indicadores: IndicadorAntropometrico[], categoria: CategoriaAntropometrica, sexo: SexoSilhueta) {
  return indicadores.flatMap(indicador => {
    const site = bodySite(indicador.nome, categoria, sexo);
    return site ? [{ indicador, site }] : [];
  });
}
