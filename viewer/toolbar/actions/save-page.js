import { toolbar } from "../registry.js";

toolbar.register({
  id: "save-page",
  label: "🖼 Sauver la page",
  order: 16,
  isAvailable: ({ pdf }) => !!pdf,
  handler: async ({ viewer, pdfName }) => {
    if (!viewer?.pdfDocument) return;

    const pageNum = viewer.currentPageNumber;
    const page = await viewer.pdfDocument.getPage(pageNum);
    const vp = page.getViewport({ scale: 2 }); // 2× pour une qualité d'impression
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Conversion PNG échouée");

    const baseName = (pdfName || "document").replace(/\.pdf$/i, "");
    const filename = `${baseName}_p${pageNum}.png`;
    const url = URL.createObjectURL(blob);

    const id = await browser.downloads.download({ url, filename, saveAs: false });
    browser.downloads.onChanged.addListener(function handler(delta) {
      if (delta.id !== id) return;
      if (delta.state?.current === "complete" || delta.state?.current === "interrupted") {
        browser.downloads.onChanged.removeListener(handler);
        try { URL.revokeObjectURL(url); } catch (_) {}
      }
    });
  },
});
