/**
 * Extrai o texto de um PDF de exames no próprio navegador.
 * O arquivo nunca é armazenado — apenas lido em memória.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;

  const partes: string[] = [];
  const maxPaginas = Math.min(doc.numPages, 20);
  for (let i = 1; i <= maxPaginas; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const linha = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (linha) partes.push(linha);
  }
  await doc.destroy();
  return partes.join("\n");
}
