// Lignes de bulletin pouvant reveler une appartenance syndicale ou un arret maladie.
// Retirees du texte avant envoi a l'analyse quand l'utilisateur n'a pas donne son consentement.
const MOTS_SENSIBLES = /syndic|\b(cgt|cfdt|cftc|cgc|unsa|solidaires)\b|indemnit\w*\s+journ|\bijss\b|subrogation|jours?\s+de\s+carence|absences?\s+(pour\s+)?(maladie|accident)|arr[eê]t\s+(de\s+travail\s+)?(maladie|pour\s+maladie)|maintien\s+(de\s+salaire\s+)?(maladie|pendant)/i;

export function retirerLignesSensibles(texte: string): string {
  return texte
    .split("\n")
    .filter((ligne) => !MOTS_SENSIBLES.test(ligne))
    .join("\n");
}
