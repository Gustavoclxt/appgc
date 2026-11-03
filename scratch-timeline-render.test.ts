import { describe, it, vi } from "vitest";
import fs from "node:fs";

type Op = { op: string; args: unknown[]; font?: string; size?: number };
const ops: Op[] = [];
let curFont = { font: "", size: 11 };

vi.mock("jspdf", () => ({
  default: class {
    constructor() {
      return new Proxy(this, {
        get: (_t, key) => {
          const k = String(key);
          if (k === "setFont") return (f: string) => { curFont.font = f; return this; };
          if (k === "setFontSize") return (s: number) => { curFont.size = s; return this; };
          if (["text", "circle", "line", "roundedRect", "rect"].includes(k)) {
            return (...args: unknown[]) => { ops.push({ op: k, args, font: curFont.font, size: curFont.size }); return this; };
          }
          return () => this;
        },
      });
    }
  },
}));

import { createExampleAssessment } from "./src/lib/assessment/example-patient";
import { deriveResults } from "./src/lib/assessment/calculations";
import { calcularMetasPeso } from "./src/lib/assessment/weight-goals";
import { generatePatientPDF } from "./src/lib/assessment/patient-pdf";

describe("scratch", () => {
  it("renderiza svg", () => {
    const a = { ...createExampleAssessment(), objetivos: ["Emagrecimento"] };
    const d = deriveResults(a);
    const metas = calcularMetasPeso(a, d, { modo: "peso", pesoDesejado: "78", kgPerder: "", prazoMeses: "", meta1: "", meta3: "", meta6Min: "", meta6Max: "", deficitKcal: "250" });
    generatePatientPDF(a, d, metas);
    const mm = (v: number) => v * 4;
    const parts: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${297 * 4}" height="${210 * 4}" viewBox="0 0 ${297 * 4} ${210 * 4}"><rect width="100%" height="100%" fill="white"/>`];
    for (const o of ops) {
      const a2 = o.args as number[];
      if (o.op === "rect") parts.push(`<rect x="0" y="0" width="${mm(a2[0])}" height="${mm(a2[1])}" fill="rgb(20,120,110)"/>`);
      else if (o.op === "roundedRect") parts.push(`<rect x="${mm(a2[0])}" y="${mm(a2[1])}" width="${mm(a2[2])}" height="${mm(a2[3])}" rx="10" fill="#f2f6f5" stroke="#ddd"/>`);
      else if (o.op === "circle") parts.push(`<circle cx="${mm(a2[0])}" cy="${mm(a2[1])}" r="${mm(a2[2])}" fill="#147870" stroke="#147870"/>`);
      else if (o.op === "line") parts.push(`<line x1="${mm(a2[0])}" y1="${mm(a2[1])}" x2="${mm(a2[2])}" y2="${mm(a2[3])}" stroke="#147870" stroke-width="4"/>`);
      else if (o.op === "text") {
        const anchor = (a2[3] as { align?: string })?.align === "center" ? "middle" : "start";
        const texto = String(a2[0]);
        parts.push(`<text x="${mm(a2[1])}" y="${mm(a2[2])}" text-anchor="${anchor}" font-family="DejaVu Sans" font-size="${o.size! * 4}" font-weight="${o.font?.includes("bold") ? "bold" : "normal"}" fill="#222">${texto.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`);
      }
    }
    parts.push("</svg>");
    fs.writeFileSync("/tmp/browser/timeline/timeline.svg", parts.join("\n"));
  });
});
