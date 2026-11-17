// Lecture du texte d'un bulletin PDF dans le navigateur, avec masquage du numéro de
// sécurité sociale (NIR). Le PDF lui-même ne quitte pas le navigateur pour l'analyse :
// seul le texte nettoyé est envoyé au service d'extraction.

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export const ERREUR_PDF_SANS_TEXTE = "PDF_SANS_TEXTE";

const SEP = "[ .\\-]{0,2}";
const NIR_REGEX = new RegExp(
  "(?<!\\d)[1-478]" + SEP + "\\d{2}" + SEP + "(?:0[1-9]|1[0-2]|[2-9]\\d)" + SEP +
    "(?:\\d{2}|2[AB])" + SEP + "\\d{3}" + SEP + "\\d{3}(?:" + SEP + "\\d{2})?(?!\\d)",
  "gi"
);

export function masquerNir(texte: string): string {
  return texte.replace(NIR_REGEX, "[NIR MASQUE]");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function lireTexteDepuisPdf(lib: any, buffer: ArrayBuffer): Promise<string> {
  const pdf = await lib.getDocument({ data: new Uint8Array(buffer) }).promise;
  let sortie = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const contenu = await page.getTextContent();
    const lignes = new Map<number, { x: number; t: string }[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const it of contenu.items as any[]) {
      if (!it.str || !String(it.str).trim()) continue;
      const y = Math.round(it.transform[5] / 3);
      const liste = lignes.get(y) || [];
      liste.push({ x: it.transform[4], t: String(it.str) });
      lignes.set(y, liste);
    }
    const ys = Array.from(lignes.keys()).sort((a, b) => b - a);
    for (const y of ys) {
      const ligne = (lignes.get(y) || []).sort((a, b) => a.x - b.x).map((i) => i.t).join("  ");
      sortie += masquerNir(ligne) + "\n";
    }
    sortie += "\n";
  }
  const texte = masquerNir(sortie);
  if (texte.replace(/\s/g, "").length < 200) throw new Error(ERREUR_PDF_SANS_TEXTE);
  return texte;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chargerPdfjs(): Promise<any> {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.pdfjsLib) return resolve(w.pdfjsLib);
    const s = document.createElement("script");
    s.src = PDFJS_URL;
    s.onload = async () => {
      try {
        const lib = w.pdfjsLib;
        const r = await fetch(PDFJS_WORKER_URL);
        const blob = new Blob([await r.text()], { type: "text/javascript" });
        lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
        resolve(lib);
      } catch (e) {
        reject(e);
      }
    };
    s.onerror = () => reject(new Error("pdf.js indisponible"));
    document.head.appendChild(s);
  });
  return pdfjsPromise;
}

export async function lirePdfSansNir(buffer: ArrayBuffer): Promise<string> {
  const lib = await chargerPdfjs();
  return lireTexteDepuisPdf(lib, buffer);
}
