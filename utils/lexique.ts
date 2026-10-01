// Lexique du bulletin de paie.
// Chaque fiche explique une ligne en français simple.
// Les mots-clés servent à reconnaître la ligne sur le bulletin de l'utilisateur,
// quelle que soit la façon dont son employeur l'a écrite.

export type FamilleLexique =
  | "remuneration"
  | "sante"
  | "retraite"
  | "chomage"
  | "famille"
  | "csg"
  | "impot"
  | "avantages"
  | "totaux";

export interface FicheLexique {
  id: string;
  famille: FamilleLexique;
  titre: string;
  resume: string;        // une phrase, l'essentiel
  explication: string;   // le détail, en français simple
  aQuoiCaSert?: string;  // ce que ça finance concrètement
  bonASavoir?: string;   // le point que personne ne connaît
  motsCles: string[];    // pour retrouver la ligne sur le bulletin
}

export const FAMILLES: { id: FamilleLexique; titre: string; emoji: string; description: string }[] = [
  { id: "remuneration", titre: "Ta rémunération", emoji: "💶", description: "Ce que ton employeur te verse avant toute retenue" },
  { id: "sante", titre: "Santé", emoji: "🏥", description: "Maladie, hospitalisation, prévoyance, mutuelle" },
  { id: "retraite", titre: "Retraite", emoji: "🌴", description: "Ce que tu mets de côté pour plus tard" },
  { id: "chomage", titre: "Chômage et emploi", emoji: "🛡️", description: "Ta protection si tu perds ton emploi" },
  { id: "famille", titre: "Famille et solidarité", emoji: "👪", description: "Allocations familiales et solidarité nationale" },
  { id: "csg", titre: "CSG et CRDS", emoji: "🇫🇷", description: "Les contributions qui financent la protection sociale" },
  { id: "impot", titre: "Impôt", emoji: "🏛️", description: "Le prélèvement à la source" },
  { id: "avantages", titre: "Avantages et frais", emoji: "🍽️", description: "Titres-repas, télétravail, mobilité" },
  { id: "totaux", titre: "Les lignes du bas", emoji: "📊", description: "Net social, net imposable, net à payer : quelle différence ?" },
];

export const LEXIQUE: FicheLexique[] = [
  // ---------- RÉMUNÉRATION ----------
  {
    id: "salaire-base",
    famille: "remuneration",
    titre: "Salaire de base",
    resume: "Ta rémunération fixe, celle inscrite dans ton contrat de travail.",
    explication:
      "C'est le point de départ de tout ton bulletin. Ce montant ne dépend ni de ton activité du mois, ni de tes résultats : c'est ce que ton employeur s'est engagé à te verser. Toutes les cotisations sont ensuite calculées à partir de ce salaire, auquel s'ajoutent primes et éléments variables.",
    bonASavoir:
      "Ton salaire de base ne peut pas être inférieur au minimum prévu par ta convention collective pour ton coefficient. Ce minimum figure généralement en haut de ton bulletin.",
    motsCles: ["salaire de base", "salaire base", "appointements", "traitement de base"],
  },
  {
    id: "remuneration-brute",
    famille: "remuneration",
    titre: "Rémunération brute",
    resume: "Le total de ce que te verse ton employeur, avant la moindre retenue.",
    explication:
      "C'est la somme de ton salaire de base et de tous les éléments variables du mois : primes, heures supplémentaires, jours de RTT payés, congés. C'est le montant annoncé lors d'une embauche quand on parle de salaire annuel. Attention : tu ne touches jamais cette somme, environ 22 % partent en cotisations.",
    bonASavoir:
      "C'est aussi le montant utilisé pour calculer tes droits : retraite, chômage, indemnités journalières. Un brut plus élevé ouvre donc de meilleurs droits, pas seulement un meilleur net.",
    motsCles: ["remuneration brute", "total brut", "brut soumis", "salaire brut"],
  },
  {
    id: "rtt",
    famille: "remuneration",
    titre: "RTT (retenue et paiement)",
    resume: "Tes jours de réduction du temps de travail, retirés puis repayés.",
    explication:
      "Quand tu poses un RTT, ton employeur retire d'abord la journée de ton salaire, puis te la repaie aussitôt. Tu vois donc deux lignes qui s'annulent. Ce double mouvement sert uniquement à tracer précisément tes jours pris : au final, ton salaire n'est pas affecté.",
    bonASavoir:
      "Si les deux montants ne s'équilibrent pas exactement, cela vaut la peine de demander une explication à ton service paie.",
    motsCles: ["rtt", "retenue rtt", "paiement rtt", "reduction temps travail"],
  },

  // ---------- SANTÉ ----------
  {
    id: "secu-maladie",
    famille: "sante",
    titre: "Sécurité sociale — Maladie, maternité, invalidité, décès",
    resume: "La cotisation qui finance l'Assurance Maladie.",
    explication:
      "Elle couvre tes remboursements de soins, tes indemnités en cas d'arrêt de travail, le congé maternité ou paternité, et une pension si tu devenais invalide.",
    aQuoiCaSert:
      "C'est ce qui fait qu'une consultation chez le médecin ou une hospitalisation ne te coûte qu'une fraction de son prix réel.",
    bonASavoir:
      "Depuis 2018, les salariés ne paient plus cette cotisation : elle est entièrement à la charge de l'employeur. C'est pour cela que la colonne « part employé » est vide sur cette ligne.",
    motsCles: ["maladie maternite", "securite sociale-maladie", "maladie invalidite deces", "assurance maladie"],
  },
  {
    id: "prevoyance",
    famille: "sante",
    titre: "Prévoyance — Incapacité, invalidité, décès",
    resume: "Une protection qui prend le relais quand la Sécurité sociale ne suffit plus.",
    explication:
      "En cas d'arrêt long, la Sécurité sociale ne verse qu'une partie de ton salaire. La prévoyance complète ce montant. Elle prévoit aussi un capital versé à tes proches en cas de décès, et une rente si tu deviens invalide.",
    bonASavoir:
      "Pour les cadres, l'employeur doit obligatoirement cotiser au moins 1,50 % de la tranche A au titre du décès. C'est un héritage de la convention de 1947, toujours en vigueur.",
    motsCles: ["incapacite invalidite deces", "prevoyance", "complementaire incapacite"],
  },
  {
    id: "mutuelle",
    famille: "sante",
    titre: "Complémentaire santé (mutuelle)",
    resume: "Elle rembourse ce que la Sécurité sociale ne prend pas en charge.",
    explication:
      "La Sécurité sociale rembourse environ 70 % d'une consultation. La mutuelle couvre le reste, et finance aussi les lunettes, les soins dentaires ou une chambre individuelle à l'hôpital.",
    bonASavoir:
      "Depuis 2016, toute entreprise doit proposer une mutuelle et en financer au moins la moitié. Tu peux refuser d'y adhérer dans certains cas précis, par exemple si tu es déjà couvert par la mutuelle de ton conjoint.",
    motsCles: ["complementaire sante", "mutuelle", "frais de sante"],
  },
  {
    id: "accident-travail",
    famille: "sante",
    titre: "Accidents du travail et maladies professionnelles",
    resume: "Ta couverture si tu te blesses au travail ou sur le trajet.",
    explication:
      "Elle prend en charge tes soins à 100 %, tes indemnités pendant l'arrêt, et une rente en cas de séquelles durables. Elle couvre aussi les accidents survenus sur le trajet domicile-travail.",
    bonASavoir:
      "Cette cotisation est entièrement payée par l'employeur, et son taux dépend du risque réel de l'entreprise. Une société avec beaucoup d'accidents paie davantage : c'est une incitation financière à la prévention.",
    motsCles: ["accidents du travail", "maladies professionnelles", "at mp", "accident travail"],
  },

  // ---------- RETRAITE ----------
  {
    id: "retraite-plafonnee",
    famille: "retraite",
    titre: "Retraite Sécurité sociale plafonnée",
    resume: "Ta retraite de base, calculée jusqu'au plafond de la Sécurité sociale.",
    explication:
      "C'est la cotisation principale pour ta retraite de base. Elle ne s'applique qu'à la partie de ton salaire située sous le plafond de la Sécurité sociale, réévalué chaque 1er janvier. Au-delà, tu ne cotises plus sur cette ligne.",
    aQuoiCaSert:
      "Elle détermine le montant de ta pension de base, versée par l'Assurance retraite.",
    bonASavoir:
      "Le plafond mensuel est d'environ 4 000 €. Si ton salaire le dépasse, tu verras la cotisation plafonnée sur une base fixe, et une cotisation déplafonnée sur la totalité.",
    motsCles: ["securite sociale plafonnee", "vieillesse plafonnee", "retraite plafonnee"],
  },
  {
    id: "retraite-deplafonnee",
    famille: "retraite",
    titre: "Retraite Sécurité sociale déplafonnée",
    resume: "Une cotisation de solidarité prélevée sur tout ton salaire.",
    explication:
      "Contrairement à la précédente, celle-ci s'applique à l'intégralité de ton salaire, sans plafond. Son taux est faible, mais elle porte sur toute la somme.",
    bonASavoir:
      "Cette cotisation ne t'ouvre aucun droit supplémentaire : c'est une contribution de solidarité au financement du système.",
    motsCles: ["securite sociale deplafonnee", "vieillesse deplafonnee", "retraite deplafonnee"],
  },
  {
    id: "retraite-complementaire",
    famille: "retraite",
    titre: "Retraite complémentaire (tranches 1 et 2)",
    resume: "Ta seconde retraite, obligatoire, qui s'ajoute à celle de la Sécurité sociale.",
    explication:
      "Gérée par l'Agirc-Arrco, elle fonctionne par points : chaque euro cotisé t'achète des points, convertis en pension au moment de ta retraite. La tranche 1 concerne la partie de ton salaire sous le plafond, la tranche 2 ce qui le dépasse, avec un taux bien plus élevé.",
    bonASavoir:
      "Pour un cadre, la retraite complémentaire représente souvent entre 40 et 60 % de la pension totale. Tu peux consulter tes points acquis sur agirc-arrco.fr.",
    motsCles: ["complementaire tranche", "agirc", "arrco", "retraite complementaire"],
  },
  {
    id: "cet",
    famille: "retraite",
    titre: "Contribution d'équilibre technique",
    resume: "Une contribution qui aide à équilibrer le régime de retraite complémentaire.",
    explication:
      "Elle est due dès que ton salaire dépasse le plafond de la Sécurité sociale. Son taux est faible, mais elle s'applique à l'ensemble de ta rémunération.",
    bonASavoir:
      "Comme la retraite déplafonnée, elle ne génère aucun point supplémentaire : elle sert uniquement à l'équilibre financier du régime.",
    motsCles: ["contribution d'equilibre technique", "cet", "equilibre technique"],
  },

  // ---------- CHÔMAGE ----------
  {
    id: "chomage",
    famille: "chomage",
    titre: "Assurance chômage",
    resume: "Ce qui finance tes allocations si tu perds ton emploi.",
    explication:
      "Cette cotisation alimente France Travail, qui verse les allocations chômage. Le montant de ton indemnisation future dépendra de ton salaire des derniers mois et de ta durée de travail.",
    bonASavoir:
      "Depuis 2018, les salariés ne cotisent plus au chômage : la cotisation est entièrement supportée par l'employeur. La part salariale a été basculée sur la CSG.",
    motsCles: ["chomage", "assurance chomage", "pole emploi", "france travail"],
  },
  {
    id: "apec",
    famille: "chomage",
    titre: "APEC",
    resume: "La cotisation qui finance l'accompagnement des cadres.",
    explication:
      "L'Association pour l'emploi des cadres propose des conseils en évolution professionnelle, des ateliers et des offres d'emploi. Seuls les cadres cotisent.",
    bonASavoir:
      "Ces services sont gratuits et ouverts à tout cadre, en poste ou non. Beaucoup l'ignorent alors qu'ils cotisent chaque mois : jette un œil sur apec.fr.",
    motsCles: ["apec"],
  },

  // ---------- FAMILLE ----------
  {
    id: "famille",
    famille: "famille",
    titre: "Allocations familiales",
    resume: "La cotisation qui finance la politique familiale française.",
    explication:
      "Elle alimente la CAF : allocations familiales, aides à la garde d'enfants, prime de naissance, allocations logement.",
    bonASavoir:
      "Elle est entièrement payée par l'employeur, et tu en bénéficies même sans enfant, par exemple via les aides au logement.",
    motsCles: ["famille", "allocations familiales", "caf"],
  },
  {
    id: "autres-contributions",
    famille: "famille",
    titre: "Autres contributions dues par l'employeur",
    resume: "Un ensemble de contributions diverses, à la charge de l'entreprise.",
    explication:
      "Cette ligne regroupe plusieurs contributions : formation professionnelle, apprentissage, aide au logement, parfois transport. Elles sont rassemblées pour alléger la lecture du bulletin.",
    bonASavoir:
      "Une partie finance ton compte personnel de formation (CPF). Tu peux consulter tes droits sur moncompteformation.gouv.fr : beaucoup de salariés ne les utilisent jamais.",
    motsCles: ["autres contributions", "contributions dues par l'employeur", "formation professionnelle"],
  },

  // ---------- CSG ----------
  {
    id: "csg-deductible",
    famille: "csg",
    titre: "CSG déductible",
    resume: "Une contribution qui finance la protection sociale, déduite de ton revenu imposable.",
    explication:
      "La Contribution sociale généralisée finance la Sécurité sociale au sens large. La partie « déductible » vient en diminution de ton revenu imposable : tu paies donc un peu moins d'impôt grâce à elle.",
    bonASavoir:
      "Elle est calculée sur 98,25 % de ton brut, auquel s'ajoute la part patronale de ta mutuelle. C'est pourquoi sa base est légèrement différente de ton salaire brut.",
    motsCles: ["csg deductible", "csg deduc"],
  },
  {
    id: "csg-crds-non-deductible",
    famille: "csg",
    titre: "CSG/CRDS non déductible",
    resume: "La part de CSG et la CRDS qui ne réduisent pas ton impôt.",
    explication:
      "Cette ligne regroupe la partie non déductible de la CSG et la CRDS, créée en 1996 pour rembourser la dette de la Sécurité sociale. Contrairement à la CSG déductible, ces montants restent inclus dans ton revenu imposable.",
    bonASavoir:
      "La CRDS devait disparaître une fois la dette remboursée. Trente ans plus tard, elle est toujours là, et son échéance a été repoussée plusieurs fois.",
    motsCles: ["csg/crds non deductible", "crds", "csg non deductible"],
  },

  // ---------- IMPÔT ----------
  {
    id: "pas",
    famille: "impot",
    titre: "Impôt prélevé à la source",
    resume: "Ton impôt sur le revenu, retenu directement chaque mois.",
    explication:
      "Depuis 2019, l'impôt est prélevé au moment où tu perçois ton salaire. Ton employeur applique un taux transmis par l'administration fiscale, et reverse la somme au Trésor public. Il ne connaît pas le détail de ta situation familiale, seulement ce taux.",
    aQuoiCaSert:
      "Il finance le budget de l'État : éducation, justice, défense, hôpitaux.",
    bonASavoir:
      "Tu peux modifier ton taux à tout moment sur impots.gouv.fr, notamment après une baisse de revenus, une naissance ou un mariage. Le changement s'applique sous deux mois.",
    motsCles: ["impot sur le revenu preleve a la source", "pas", "prelevement a la source"],
  },
  {
    id: "taux-imposition",
    famille: "impot",
    titre: "Taux d'imposition personnalisé",
    resume: "Le pourcentage appliqué à ton net imposable pour calculer ton impôt.",
    explication:
      "Ce taux est calculé par l'administration fiscale à partir de ta dernière déclaration : revenus du foyer, situation familiale, nombre de parts. Il est transmis automatiquement à ton employeur.",
    bonASavoir:
      "Tu peux demander un taux individualisé si ton conjoint et toi avez des revenus très différents, ou un taux neutre pour que ton employeur ne devine pas les revenus de ton foyer.",
    motsCles: ["taux d'imposition personnalise", "taux personnalise", "taux neutre"],
  },

  // ---------- AVANTAGES ----------
  {
    id: "titres-repas",
    famille: "avantages",
    titre: "Titres-restaurant",
    resume: "Ta participation à l'achat des titres, l'employeur payant le reste.",
    explication:
      "Le montant retenu correspond à ta part : l'employeur finance généralement entre 50 et 60 % de la valeur du titre. Le nombre de titres dépend de tes jours effectivement travaillés.",
    bonASavoir:
      "La part patronale est exonérée de cotisations dans une certaine limite par titre. C'est donc un avantage nettement plus intéressant qu'une augmentation équivalente, qui serait, elle, soumise à cotisations et à l'impôt.",
    motsCles: ["titres repas", "titre restaurant", "ticket restaurant"],
  },
  {
    id: "teletravail",
    famille: "avantages",
    titre: "Allocation forfaitaire télétravail",
    resume: "Un remboursement de tes frais quand tu travailles de chez toi.",
    explication:
      "Elle compense l'électricité, le chauffage et la connexion internet utilisés pour ton travail à domicile. Comme il s'agit d'un remboursement de frais et non d'un salaire, elle n'est soumise ni à cotisations ni à l'impôt.",
    bonASavoir:
      "C'est pour cela qu'elle apparaît dans les « gains non soumis » : tu la touches intégralement, contrairement à une prime classique.",
    motsCles: ["teletravail", "alloc forf teletravail", "allocation teletravail"],
  },
  {
    id: "prime-mobilite",
    famille: "avantages",
    titre: "Prime économie mobilité",
    resume: "Une aide à tes trajets domicile-travail en mode doux ou partagé.",
    explication:
      "Appelée forfait mobilités durables, elle encourage le vélo, le covoiturage, la trottinette ou les transports en commun. Son versement est facultatif, décidé par l'entreprise.",
    bonASavoir:
      "Elle est exonérée de cotisations et d'impôt dans une limite annuelle fixée par la loi. Si ton entreprise ne la propose pas, c'est un sujet à soulever : elle coûte peu à l'employeur.",
    motsCles: ["prime economie mobilite", "forfait mobilites durables", "mobilite durable"],
  },

  // ---------- TOTAUX ----------
  {
    id: "net-social",
    famille: "totaux",
    titre: "Montant net social",
    resume: "Le montant de référence pour tes demandes d'aides sociales.",
    explication:
      "Obligatoire sur tous les bulletins depuis 2023, cette ligne correspond à ce que tu dois déclarer à la CAF pour le RSA ou la prime d'activité. Elle est calculée de façon identique pour tous les employeurs, afin d'être comparable.",
    bonASavoir:
      "Elle est généralement plus élevée que ton net à payer, car elle ne déduit ni l'impôt ni certains avantages. Ne la confonds pas avec ce que tu reçois réellement.",
    motsCles: ["montant net social", "net social"],
  },
  {
    id: "net-imposable",
    famille: "totaux",
    titre: "Net imposable",
    resume: "La base sur laquelle ton impôt est calculé.",
    explication:
      "C'est le montant que l'administration fiscale retient pour calculer ton impôt. Il est supérieur à ton net à payer, car certaines sommes non versées restent imposables, comme la CSG non déductible ou la part patronale de la mutuelle.",
    bonASavoir:
      "C'est ce cumul annuel qui apparaît prérempli dans ta déclaration de revenus. Vérifie-le avec le cumul de décembre : les erreurs sont rares mais possibles.",
    motsCles: ["net imposable", "net fiscal"],
  },
  {
    id: "net-a-payer",
    famille: "totaux",
    titre: "Net à payer",
    resume: "La somme effectivement versée sur ton compte bancaire.",
    explication:
      "C'est le résultat final : ton brut, moins les cotisations, moins l'impôt prélevé à la source, plus les remboursements de frais non soumis à cotisations.",
    bonASavoir:
      "C'est le seul montant que tu retrouveras à l'identique sur ton relevé bancaire. Tous les autres nets du bulletin servent à d'autres usages.",
    motsCles: ["net a payer", "net paye", "virement"],
  },
  {
    id: "charges-patronales",
    famille: "totaux",
    titre: "Charges patronales",
    resume: "Ce que ton employeur paie en plus de ton salaire.",
    explication:
      "Ces cotisations s'ajoutent à ton brut et ne sortent pas de ta poche. Elles financent la santé, la retraite, le chômage et la politique familiale.",
    bonASavoir:
      "Le « total versé employeur » en bas de ton bulletin représente ton coût réel pour l'entreprise. C'est un argument utile en négociation : une augmentation de 100 € brut coûte environ 140 € à ton employeur.",
    motsCles: ["charges patronales", "ch patronales", "total verse employeur", "cout employeur"],
  },
];

// Associe une ligne lue sur le bulletin à sa fiche, quelle que soit son orthographe.
export function trouverFiche(libelle: string): FicheLexique | undefined {
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const cible = normalise(libelle);
  if (!cible) return undefined;

  let meilleure: FicheLexique | undefined;
  let meilleureLongueur = 0;

  for (const fiche of LEXIQUE) {
    for (const motCle of fiche.motsCles) {
      const cle = normalise(motCle);
      if (cible.includes(cle) && cle.length > meilleureLongueur) {
        meilleure = fiche;
        meilleureLongueur = cle.length;
      }
    }
  }
  return meilleure;
}
