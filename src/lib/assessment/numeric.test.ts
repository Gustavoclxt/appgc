import { describe, expect, it } from "vitest";

import { limitarCasasDecimais } from "./numeric";

describe("limitarCasasDecimais", () => {
  it("mantém no máximo duas casas decimais", () => {
    expect(limitarCasasDecimais("1,755")).toBe("1,75");
    expect(limitarCasasDecimais("1.7555")).toBe("1.75");
  });

  it("descarta letras, espaços e separadores repetidos", () => {
    expect(limitarCasasDecimais("1,75 m")).toBe("1,75");
    expect(limitarCasasDecimais("1,7.5")).toBe("1,75");
  });

  it("preserva valores inteiros e a digitação incompleta", () => {
    expect(limitarCasasDecimais("78")).toBe("78");
    expect(limitarCasasDecimais("78,")).toBe("78,");
    expect(limitarCasasDecimais("")).toBe("");
  });
});
