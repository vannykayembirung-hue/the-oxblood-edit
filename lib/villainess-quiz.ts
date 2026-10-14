/**
 * Villainess reading — shared data model.
 *
 * Lives outside the client component on purpose: `/quiz` is a server component
 * and needs to render the four verdicts statically (for readers with JS off and
 * for search), so the data cannot be exported from a "use client" module.
 */

export type ArchetypeKey = "velvet-widow" | "library-siren" | "crimson-heiress" | "thorned-muse";

/**
 * The dossier a reader receives by email after the reading.
 *
 * Kept next to the archetype rather than in the API route so the quiz page, the
 * capture form and `/api/subscribe` all describe the same deliverable — the
 * desk never promises a document the reader cannot actually be sent.
 */
export interface ArchetypeDossier {
  title: string;
  dek: string;
  chapters: { heading: string; note: string }[];
  keyPieces: { label: string; note: string }[];
  care: string;
}

export interface Archetype {
  key: ArchetypeKey;
  name: string;
  roman: string;
  epithet: string;
  motto: string;
  verdict: string;
  uniform: string;
  lip: string;
  book: string;
  formula: string[];
  palette: { hex: string; name: string }[];
  articleSlug: string;
  articleLabel: string;
  dossier: ArchetypeDossier;
}

export interface QuizOption {
  label: string;
  archetype: ArchetypeKey;
  note: string;
}

export interface QuizQuestion {
  prompt: string;
  standing: string;
  options: QuizOption[];
}

export const ARCHETYPE_ORDER: ArchetypeKey[] = [
  "velvet-widow",
  "library-siren",
  "crimson-heiress",
  "thorned-muse"
];

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  "velvet-widow": {
    key: "velvet-widow",
    name: "THE VELVET WIDOW",
    roman: "I",
    epithet: "Mourning, worn as armour.",
    motto: "She does not raise her voice. The room lowers its own.",
    verdict:
      "You wield restraint the way others wield scandal. Black velvet, a hem that pools before you do, and a composure so complete it reads as a verdict. People confess to you because you never appear to be listening for it.",
    uniform:
      "A floor-sweeping double-faced wool coat in jet, over a bias silk column lined in wine.",
    lip: "Oxblood balm pressed into the centre of the mouth and left unlined.",
    book: "Rebecca — Daphne du Maurier. Read twice; quoted never.",
    formula: [
      "Jet velvet cape, oxblood lining, gold signet clasp",
      "Sheer black hosiery, square-toe boot in burnished burgundy",
      "One ornament only: the mourning ring already on your hand"
    ],
    palette: [
      { hex: "#0B0A08", name: "Jet" },
      { hex: "#6E1423", name: "Oxblood" },
      { hex: "#C6A15B", name: "Antique Gold" }
    ],
    articleSlug: "how-to-dress-like-the-villainess-dark-romance-outfits",
    articleLabel: "How to Dress Like the Villainess",
    dossier: {
      title: "The Velvet Widow · A Dossier on Mourning as Armour",
      dek: "Nine pages on length, weight and the single ornament — written for readers who would rather be read than noticed.",
      chapters: [
        {
          heading: "The floor-length architecture",
          note: "Hem weights, interlining and the reason a cape should pool one inch before you do."
        },
        {
          heading: "Bias against straight grain",
          note: "Why the Widow's column is cut on the bias and where straight grain still wins."
        },
        {
          heading: "The candlelight check",
          note: "Jet and oxblood judged at 6pm, in the light the garment will actually be worn in."
        },
        {
          heading: "Sourcing double-faced wool",
          note: "UK mill first, US importers second — with the GSM floor for each."
        },
        {
          heading: "The single-ornament rule",
          note: "One ring, one clasp, nothing that catches the candle twice."
        }
      ],
      keyPieces: [
        { label: "Floor-sweeping cape coat", note: "Double-faced wool, 520gsm+, jet with a wine lining" },
        { label: "Bias silk column", note: "Lined in oxblood; hem finished by hand, never by machine" },
        { label: "Square-toe boot", note: "Burnished burgundy calfskin, 65mm sculptural heel" },
        { label: "Mourning signet", note: "Antique gold, matte — the house's one permitted brightness" }
      ],
      care: "Brush the wool after every wear, rest it 24 hours between outings, and never press velvet — steam it, facing the nap down."
    }
  },
  "library-siren": {
    key: "library-siren",
    name: "THE LIBRARY SIREN",
    roman: "II",
    epithet: "Seduction by footnote.",
    motto: "She keeps the ink on her fingertips where others keep perfume.",
    verdict:
      "Your power is archival. You win rooms by knowing the thing that will be said in three years, and you dress for the long evening: soft silk at the throat, hard structure at the shoulder. Kohl, deliberately unfixed, is the only evidence you leave.",
    uniform:
      "An ivory silk poet blouse beneath a deep wine velvet blazer, ink-dark merino at the collar bone.",
    lip: "Plum-brown liner drawn past the Cupid's bow, then blurred with a fingertip.",
    book: "The Bloody Chamber — Angela Carter. Dog-eared, deliberately.",
    formula: [
      "Poet blouse, Chantilly camisole, pleated wide-leg wool trouser",
      "Carbon kohl on the upper tightline only, diffused before it sets",
      "Antique gold at the wrist: a man's watch, worn loose"
    ],
    palette: [
      { hex: "#120F0D", name: "Smoke" },
      { hex: "#EDE4D0", name: "Parchment" },
      { hex: "#C6A15B", name: "Antique Gold" }
    ],
    articleSlug: "smudged-kohl-oxblood-lips-tutorial",
    articleLabel: "The Smudged Kohl & Oxblood Lip",
    dossier: {
      title: "The Library Siren · A Dossier on Seduction by Footnote",
      dek: "Nine pages on unfixed kohl, silk at the throat and the archive you wear rather than cite.",
      chapters: [
        {
          heading: "Kohl on the tightline only",
          note: "The diffusion window — how long you have before the pencil sets, and what to use."
        },
        {
          heading: "Softening the shoulder line",
          note: "Why a velvet blazer reads academic and a padded shoulder reads corporate."
        },
        {
          heading: "Ink, gold-warmed",
          note: "Building the two-tone palette that lets antique gold sit beside black without glare."
        },
        {
          heading: "Archive sourcing",
          note: "Second-hand couture, catalogued by weight and closure rather than by label."
        },
        {
          heading: "The watch worn loose",
          note: "Proportion at the wrist: case diameter against bone, and the strap you replace first."
        }
      ],
      keyPieces: [
        { label: "Ivory silk poet blouse", note: "Cuff detail, one button left open, sleeve worn pushed" },
        { label: "Deep wine velvet blazer", note: "Unstructured, single-breasted, unlined sleeve head" },
        { label: "Pleated wide-leg wool trouser", note: "High waist, drape tested at 320gsm" },
        { label: "Man's gold watch", note: "Worn loose over the cuff — the house's least quiet piece" }
      ],
      care: "Silk is hand-washed cold and dried flat, away from light; velvet is stored on a padded hanger with nothing touching the nap."
    }
  },
  "crimson-heiress": {
    key: "crimson-heiress",
    name: "THE CRIMSON HEIRESS",
    roman: "III",
    epithet: "She inherited, then over-invested.",
    motto: "Oxblood, precisely #6E1423 — and never one degree brighter.",
    verdict:
      "You treat a wardrobe as a portfolio: few positions, held heavily. Satin cut on the bias, hardware in unlacquered gold, silhouette architectural enough to survive a photograph taken without warning. You are never underdressed and never trying.",
    uniform:
      "Oxblood satin slip under a beltless cavalry coat, structured top-handle at the crook of the arm.",
    lip: "Matte burgundy, pressed in with the ring finger, edges left soft as a stain.",
    book: "Brideshead Revisited — Evelyn Waugh. The first third, underlined.",
    formula: [
      "Bias-cut satin midi, liquid against heavyweight wool outerwear",
      "Horsebit loafer in cordovan, worn with ribbed cashmere",
      "Gold signet hardware belt, cinching nothing, settling everything"
    ],
    palette: [
      { hex: "#6E1423", name: "Oxblood" },
      { hex: "#4C0E18", name: "Dried Wine" },
      { hex: "#C6A15B", name: "Antique Gold" }
    ],
    articleSlug: "vamp-romantic-capsule-wardrobe",
    articleLabel: "The 12-Piece Vamp Romantic Capsule",
    dossier: {
      title: "The Crimson Heiress · A Dossier on a Portfolio Held Heavily",
      dek: "Nine pages on bias-cut satin, unlacquered hardware and the 70/20/10 arithmetic of a wardrobe that behaves like capital.",
      chapters: [
        {
          heading: "The 70/20/10 palette",
          note: "Structure, depth, permitted brightness — with the exact hex references."
        },
        {
          heading: "Bias-cut satin, audited",
          note: "Weight, lining and stretch recovery: the three numbers that decide whether a slip lasts."
        },
        {
          heading: "Hardware, unlacquered",
          note: "Why gold that patinates reads older money than gold that shines."
        },
        {
          heading: "Cost per wear across two markets",
          note: "The same garment priced in USD and GBP, divided by the wears it will actually get."
        },
        {
          heading: "The belt that cinches nothing",
          note: "Placement, drop and the length where a signet belt finally stops looking like a mistake."
        }
      ],
      keyPieces: [
        { label: "Bias-cut oxblood midi", note: "Heavy satin, #6E1423, lined to match — never contrast" },
        { label: "Beltless cavalry coat", note: "Structured shoulder, no waist seam, worn open at dusk" },
        { label: "Oxblood horsebit loafer", note: "Cordovan finish; ribbed cashmere sock from October" },
        { label: "Structured top-handle bag", note: "Croc-embossed, crook of the arm, hardware aged" }
      ],
      care: "Satin is dry-cleaned only; shoes are rested 48 hours between wears and treed overnight, which is what keeps a cordovan finish from cracking."
    }
  },
  "thorned-muse": {
    key: "thorned-muse",
    name: "THE THORNED MUSE",
    roman: "IV",
    epithet: "Beautifully ungovernable.",
    motto: "She arrived late, on purpose, and left before the applause.",
    verdict:
      "You wear the moor indoors. The look is unfinished by design — a hem let down, a collar open, one gloved hand — because perfection would suggest you dressed for the wrong audience. Nothing about you is decorative, and everything about you is remembered.",
    uniform:
      "Black lace-trimmed camisole under an oversized charcoal coat, trousers pleated and unpressed.",
    lip: "Bare, bitten, with a single smudge of kohl that will not entirely be a mistake.",
    book: "Wuthering Heights — Emily Brontë. Carried, not read.",
    formula: [
      "Chantilly lace against matte jet wool; let the texture argue",
      "Unlacquered brass rings, mismatched by intent",
      "A ribbon at the throat, tied by yourself, in the dark"
    ],
    palette: [
      { hex: "#0B0A08", name: "Jet" },
      { hex: "#120F0D", name: "Smoke Velvet" },
      { hex: "#EDE4D0", name: "Parchment" }
    ],
    articleSlug: "the-3-piece-british-autumn-formula",
    articleLabel: "The 3-Piece British Autumn Formula",
    dossier: {
      title: "The Thorned Muse · A Dossier on Being Beautifully Ungovernable",
      dek: "Nine pages on unfinished edges, Chantilly against matte wool, and getting dressed in the dark.",
      chapters: [
        {
          heading: "The unfinished hem",
          note: "Which edges may be left raw, and the two seams that never should be."
        },
        {
          heading: "Lace against matte",
          note: "Chantilly weight and the wool it must argue with — texture, not pattern."
        },
        {
          heading: "A ribbon at the throat",
          note: "Width, fibre and the knot that survives a whole evening outdoors."
        },
        {
          heading: "Dressing in the dark",
          note: "A five-piece floor plan so nothing has to be seen to be chosen."
        },
        {
          heading: "Brass, mismatched",
          note: "How to wear two unlacquered rings without either looking accidental."
        }
      ],
      keyPieces: [
        { label: "Chantilly-trimmed camisole", note: "Silk body, lace at the neckline only" },
        { label: "Oversized charcoal coat", note: "Shoulder dropped by 2cm, hem unpressed, wool at 480gsm" },
        { label: "Unpressed pleated trouser", note: "Store on a clip hanger to keep the pleat honest" },
        { label: "Mismatched brass rings", note: "One wide, one thin — never the same hand twice" }
      ],
      care: "Lace is washed in a mesh bag with pH-neutral soap; wool is aired outside in cool weather and only dry-cleaned when the nap flattens."
    }
  }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    prompt: "The household has gone quiet. Where are you found?",
    standing: "Question I · The house at rest",
    options: [
      {
        label: "In the long gallery, walking the portraits. The coats do not need an audience.",
        archetype: "velvet-widow",
        note: "solitude, kept like jewellery"
      },
      {
        label: "At the library desk, a candle guttering over a book I have already read twice.",
        archetype: "library-siren",
        note: "the second reading, for the footnotes"
      },
      {
        label: "At the head of the table. The silence is mine; I merely let it stand.",
        archetype: "crimson-heiress",
        note: "quiet as a proprietary right"
      },
      {
        label: "In the garden at dusk, where the roses have gone to seed and no one follows.",
        archetype: "thorned-muse",
        note: "absent, deliberately"
      }
    ]
  },
  {
    prompt: "Name the colour that answers when you say yourself aloud.",
    standing: "Question II · The chromatic spine",
    options: [
      {
        label: "Jet — with one thread of wine beneath the lining.",
        archetype: "velvet-widow",
        note: "restraint, with a secret"
      },
      {
        label: "Ink, warmed by antique gold until it forgives you.",
        archetype: "library-siren",
        note: "shadow with a friendly tongue"
      },
      {
        label: "Oxblood. #6E1423 precisely, and never one degree brighter.",
        archetype: "crimson-heiress",
        note: "a specification, not a preference"
      },
      {
        label: "Parchment, held to the window until it goes translucent.",
        archetype: "thorned-muse",
        note: "light, weaponised"
      }
    ]
  },
  {
    prompt: "A guest arrives unannounced at dusk. You —",
    standing: "Question III · The uninvited hour",
    options: [
      {
        label: "…receive him for eleven minutes, then let the footman lie.",
        archetype: "velvet-widow",
        note: "measured cruelty, politely timed"
      },
      {
        label: "…offer the chair by the fire and ask what he is reading.",
        archetype: "library-siren",
        note: "interrogation dressed as hospitality"
      },
      {
        label: "…let him wait in the hall while I finish my sentence.",
        archetype: "crimson-heiress",
        note: "the sentence comes first"
      },
      {
        label: "…answer the door myself, which is precisely the problem.",
        archetype: "thorned-muse",
        note: "no staff, no manners"
      }
    ]
  },
  {
    prompt: "What does the house fear most about you?",
    standing: "Question IV · The household verdict",
    options: [
      {
        label: "That I have stopped wanting to be forgiven.",
        archetype: "velvet-widow",
        note: "amnesty declined"
      },
      {
        label: "That I remember every kind of detail.",
        archetype: "library-siren",
        note: "the archive is armed"
      },
      {
        label: "That the ledger and I have long since come to an agreement.",
        archetype: "crimson-heiress",
        note: "complicity, audited"
      },
      {
        label: "That I would rather be true than welcome.",
        archetype: "thorned-muse",
        note: "candour as trespass"
      }
    ]
  },
  {
    prompt: "Choose your weapon at the dinner table.",
    standing: "Question V · The long supper",
    options: [
      {
        label: "Composure — and a silence that outlasts the courses.",
        archetype: "velvet-widow",
        note: "the dessert arrives before the apology"
      },
      {
        label: "A quotation, badly attributed on purpose.",
        archetype: "library-siren",
        note: "corrected in print, later"
      },
      {
        label: "One sentence, spoken after everyone has finished.",
        archetype: "crimson-heiress",
        note: "the room rewinds"
      },
      {
        label: "Honesty, delivered far too late in the evening.",
        archetype: "thorned-muse",
        note: "candles low, nothing spared"
      }
    ]
  },
  {
    prompt: "Midnight. How do you leave the room?",
    standing: "Question VI · The departure",
    options: [
      {
        label: "Unhurried, so the door is the last thing anyone remembers.",
        archetype: "velvet-widow",
        note: "an exit with a hem"
      },
      {
        label: "With his book under my arm. He notices at breakfast.",
        archetype: "library-siren",
        note: "a theft with a title"
      },
      {
        label: "I do not leave. The room is asked to consider its position.",
        archetype: "crimson-heiress",
        note: "possession, asserted"
      },
      {
        label: "Out through the garden, before the question is finished.",
        archetype: "thorned-muse",
        note: "unfinished, therefore remembered"
      }
    ]
  }
];
