"use client";

import { useMemo, useRef, useState } from "react";

/**
 * Fusion d'ombres — prototype jouable d'une publication.
 * Le lecteur fait glisser le soleil : les ombres de trois meubles se déplacent
 * et ne fusionnent en un animal qu'à une seule heure (16h55).
 * Il photographie l'instant, puis répond en un seul mot en commentaire.
 * Prototype 100 % local : aucune donnée n'est envoyée ni stockée.
 */

const MIN = 6 * 60; // 06:00
const MAX = 20 * 60; // 20:00
const TARGET = 16 * 60 + 55; // 16:55 — l'heure de la fusion
const START = 9 * 60 + 12; // 09:12 — ombres séparées

type CommentItem = { id: number; author: string; text: string; kind: "seed" | "player" | "page" };

const SEED_COMMENTS: CommentItem[] = [
  { id: 1, author: "Nadia", text: "cheval ??", kind: "seed" },
  { id: 2, author: "Bruno", text: "Moi je vois un cerf quand je mets le soleil le matin 😅", kind: "seed" },
  { id: 3, author: "Léa", text: "L'œil qui brille sur le mur 👀", kind: "seed" }
];

function fmt(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function normalize(word: string) {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

/* --- Silhouettes d'objets, pieds à (0,0), dessinées vers le haut (y négatif) --- */
function CoatStand({ ink }: { ink: string }) {
  return (
    <g stroke={ink} fill={ink} strokeWidth={4} strokeLinecap="round">
      <rect x={-2.5} y={-138} width={5} height={138} stroke="none" />
      <path d="M0,-130 q-16,-2 -19,-18" fill="none" />
      <path d="M0,-126 q16,-4 20,-20" fill="none" />
      <path d="M0,-110 q-14,0 -17,-12" fill="none" />
      <circle cx={-19} cy={-150} r={4.5} stroke="none" />
      <circle cx={20} cy={-148} r={4.5} stroke="none" />
      <path d="M0,-16 L-15,0 M0,-16 L15,0 M0,-16 L0,0" fill="none" />
    </g>
  );
}
function SideTable({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <ellipse cx={0} cy={-88} rx={37} ry={9} />
      <rect x={-2.5} y={-88} width={5} height={82} />
      <ellipse cx={0} cy={-4} rx={17} ry={4.5} />
    </g>
  );
}
function Stool({ ink }: { ink: string }) {
  return (
    <g stroke={ink} fill={ink} strokeWidth={4.5} strokeLinecap="round">
      <rect x={-28} y={-64} width={56} height={9} rx={4} stroke="none" />
      <path d="M-20,-55 L-24,0 M-7,-55 L-7,0 M7,-55 L7,0 M20,-55 L24,0" fill="none" />
    </g>
  );
}
function Plant() {
  return (
    <g>
      <path d="M-15,-28 L15,-28 L10,0 L-10,0 Z" fill="#A8542F" />
      <path d="M0,-28 L0,-74" stroke="#2F5D2A" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={-14} cy={-66} rx={15} ry={8} fill="#3E7A34" transform="rotate(-28 -14 -66)" />
      <ellipse cx={14} cy={-74} rx={15} ry={8} fill="#3E7A34" transform="rotate(24 14 -74)" />
      <ellipse cx={0} cy={-88} rx={14} ry={8} fill="#4C8A3F" transform="rotate(-6 0 -88)" />
      <ellipse cx={-12} cy={-46} rx={12} ry={7} fill="#356B2D" transform="rotate(-18 -12 -46)" />
      <ellipse cx={13} cy={-50} rx={12} ry={7} fill="#356B2D" transform="rotate(16 13 -50)" />
    </g>
  );
}

/* Silhouette de la girafe — visible uniquement à la fusion (viewBox 400×500, profil vers la gauche) */
const GIRAFFE_PATH =
  "M104,128 L112,106 L132,94 L134,78 L142,66 L148,80 L157,69 L165,84 L180,94 L196,116 L282,208 L348,232 L360,246 L366,306 L373,322 L362,327 L355,298 L354,360 L356,438 L343,438 L339,358 L330,316 L329,438 L317,438 L311,330 L268,302 L240,322 L239,438 L227,438 L221,318 L213,300 L207,438 L195,438 L192,302 L176,220 L150,150 L124,133 Z";

export default function ShadowFusionPrototype() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const nextId = useRef(100);

  const [minutes, setMinutes] = useState(START);
  const [attempts, setAttempts] = useState(0);
  const [captureMsg, setCaptureMsg] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentItem[]>(SEED_COMMENTS);
  const [guess, setGuess] = useState("");
  const [hearts, setHearts] = useState(128);
  const [wows, setWows] = useState(342);
  const [reacted, setReacted] = useState<"heart" | "wow" | null>(null);
  const [savedPost, setSavedPost] = useState(false);
  const [touched, setTouched] = useState(false);
  const [optinDone, setOptinDone] = useState(false);

  const t = (minutes - MIN) / (MAX - MIN);
  const targetT = (TARGET - MIN) / (MAX - MIN);
  const d = Math.abs(t - targetT);
  const fusion = smooth(clamp01(1 - d / 0.16));

  const sunX = 36 + 328 * t;
  const sunY = 106 - Math.sin(Math.PI * t) * 56;
  const shadowSkew = -30 + 42 * t;
  const shadowShift = -46 + 120 * t;
  const giraffeDx = (targetT - t) * 190;
  const giraffeSkew = (targetT - t) * -38;
  const giraffeBlur = (1 - fusion) * 7;
  const objectShadowOpacity = 0.52 * (1 - fusion * 0.88);

  const warmth = useMemo(() => Math.round(fusion * 100), [fusion]);

  function setFromPointer(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const ratio = clamp01((clientX - rect.left) / rect.width);
    setMinutes(Math.round(MIN + ratio * (MAX - MIN)));
    setTouched(true);
  }

  function pageReply(text: string) {
    window.setTimeout(() => {
      setComments((c) => [...c, { id: nextId.current++, author: "Ombre Accidentelle", text, kind: "page" }]);
    }, 650);
  }

  function capture() {
    const diff = Math.abs(minutes - TARGET);
    setAttempts((a) => a + 1);
    if (diff <= 12) {
      const s = Math.max(1, Math.round(100 - diff * 0.6));
      setScore(s);
      setRevealed(true);
      setCaptureMsg(`📸 Fusion capturée à ${fmt(minutes)} — précision ${s} %. L'animal existe ! À toi de le nommer en un mot.`);
      pageReply("Quelqu'un vient de photographier la fusion 👀 Réponse officielle dans le fil : écrivez le nom de l'animal, un seul mot.");
    } else if (diff <= 35) {
      setCaptureMsg(minutes < TARGET ? "Presque… l'ombre tremble encore. Encore un peu plus vers le soir. 🌇" : "Presque… l'ombre se défait. Reviens un peu en arrière. 🌤️");
    } else {
      setCaptureMsg(minutes < TARGET ? "Trop tôt : les ombres sont encore séparées. Fais avancer le soleil. ☀️" : "Trop tard : la fusion est passée. Rembobine le soleil. ☀️");
    }
  }

  function submitGuess(e: React.FormEvent) {
    e.preventDefault();
    const word = guess.trim();
    if (!word) return;
    setComments((c) => [...c, { id: nextId.current++, author: "Toi", text: word, kind: "player" }]);
    setGuess("");
    const ok = ["girafe", "girafes"].includes(normalize(word));
    if (revealed) {
      pageReply(ok ? "✅ Bonne réponse officielle : GIRAFE 🦒 (cou incliné, 2 ossicones sans ramures, dos en pente — et la plante était innocente)." : "La réponse officielle est tombée plus haut 👀 — ce n'était pas celui-là.");
    } else {
      pageReply(
        ok
          ? "👀 Toi, tu regardes au bon endroit… Je ne confirme rien tant que personne n'a photographié la fusion 📸"
          : "Tu regardes encore les meubles 😏 Fais glisser le soleil et pars de l'œil qui brille sur le mur."
      );
    }
  }

  function reset() {
    setMinutes(START);
    setAttempts(0);
    setCaptureMsg(null);
    setRevealed(false);
    setScore(null);
    setOptinDone(false);
    setComments(SEED_COMMENTS);
  }

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
        Prototype jouable · publication simulée
      </p>

      {/* --- La publication --- */}
      <article className="overflow-hidden rounded-2xl bg-[#F0F2F5] text-[#1C1E21] shadow-velvet ring-1 ring-black/40">
        <div className="bg-white px-4 pt-3">
          <header className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D96C2C] text-sm font-black text-white" aria-hidden>
              OA
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight">Ombre Accidentelle</p>
              <p className="text-xs text-[#65676B]">Dimanche 19:00 · 🌍 · Épisode 1</p>
            </div>
            <span className="ml-auto rounded-full bg-[#FFF3E0] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#9A4A12] ring-1 ring-[#D96C2C]/40">
              Jouable ici
            </span>
          </header>

          <div className="pb-3 pt-2 text-[15px] leading-snug">
            <p className="font-bold">90 % voient un salon. Pas l'animal. 😏</p>
            <p className="mt-1">
              👆 <strong>Fais glisser le soleil</strong> dans la photo.
              <br />
              📸 Photographie le moment où les ombres fusionnent.
              <br />
              💬 Écris le nom de l'animal — <strong>un seul mot</strong>.
            </p>
          </div>
        </div>

        {/* Média interactif 4:5 */}
        <div className="relative bg-[#B85A24]">
          <svg
            ref={svgRef}
            viewBox="0 0 400 500"
            className="block aspect-[4/5] w-full touch-none select-none"
            role="img"
            aria-label="Salon au coucher du soleil : fais glisser le soleil pour fusionner les ombres des meubles en un animal."
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setFromPointer(e.clientX);
            }}
            onPointerMove={(e) => dragging.current && setFromPointer(e.clientX)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <defs>
              <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C46228" />
                <stop offset="70%" stopColor="#D96C2C" />
                <stop offset="100%" stopColor="#B85A24" />
              </linearGradient>
              <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.2" />
              </filter>
              <filter id="fusionBlur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation={giraffeBlur} />
              </filter>
            </defs>

            <rect width="400" height="500" fill="url(#wall)" />
            {/* nappe de lumière de la fenêtre */}
            <rect x="72" y="66" width="302" height="338" fill="#F2A54A" opacity="0.5" />
            {/* sol */}
            <rect x="0" y="452" width="400" height="48" fill="#7A4A26" />
            <rect x="0" y="452" width="400" height="5" fill="#FFF3E0" opacity="0.65" />

            {/* ombres séparées des meubles (s'effacent à la fusion) */}
            <g filter="url(#soft)" opacity={objectShadowOpacity} fill="#2A1A12">
              <g transform={`translate(${118 + shadowShift} 322) skewX(${shadowSkew}) scale(1.45)`}>
                <CoatStand ink="#2A1A12" />
              </g>
              <g transform={`translate(${205 + shadowShift} 330) skewX(${shadowSkew}) scale(1.6)`}>
                <SideTable ink="#2A1A12" />
              </g>
              <g transform={`translate(${300 + shadowShift} 352) skewX(${shadowSkew}) scale(1.7)`}>
                <Stool ink="#2A1A12" />
              </g>
            </g>

            {/* la fusion : l'animal n'existe qu'à 16h55 */}
            <g
              opacity={fusion}
              filter="url(#fusionBlur)"
              transform={`translate(${200 + giraffeDx} 250) skewX(${giraffeSkew}) translate(-200 -250)`}
            >
              <path d={GIRAFFE_PATH} fill="#2A1A12" />
              <circle cx="140" cy="104" r="4.2" fill="#FFF3E0" opacity={fusion} />
            </g>

            {/* ombre au sol de la plante (l'innocente : jamais sur le mur) */}
            <ellipse cx={70 + shadowShift * 0.35} cy="466" rx="34" ry="7" fill="#2A1A12" opacity="0.35" filter="url(#soft)" />

            {/* meubles réels */}
            <g transform="translate(46 452)">
              <Plant />
            </g>
            <g transform="translate(118 452)">
              <CoatStand ink="#5A3A22" />
            </g>
            <g transform="translate(205 452)">
              <SideTable ink="#6B4527" />
            </g>
            <g transform="translate(300 452)">
              <Stool ink="#6B4527" />
            </g>

            {/* trajectoire + soleil déplaçable */}
            <path d="M36,106 Q200,8 364,106" fill="none" stroke="#FFF3E0" strokeWidth="2" strokeDasharray="5 7" opacity="0.75" />
            <circle cx={sunX} cy={sunY} r="27" fill="#FFD98A" opacity="0.35" />
            <circle cx={sunX} cy={sunY} r="16" fill="#FFE9B0" stroke="#D96C2C" strokeWidth="3" />
            <circle cx={sunX} cy={sunY} r="30" fill="transparent" />
          </svg>

          {!touched && (
            <div className="pointer-events-none absolute inset-x-0 top-[38%] mx-auto w-fit max-w-[86%] rounded-full bg-black/70 px-4 py-2 text-center text-[13px] font-bold text-white">
              👆 Glisse ton doigt sur la photo pour déplacer le soleil
            </div>
          )}

          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[13px] font-black tabular-nums text-white">
            🕒 {fmt(minutes)}
          </div>
          <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white" aria-live="polite">
            Fusion : {warmth} %
          </div>
        </div>

        {/* Contrôles du jeu */}
        <div className="bg-white px-4 pb-2 pt-3">
          <label className="block text-xs font-bold text-[#65676B]" htmlFor="sun-range">
            Heure de la photo — de 6h00 à 20h00
          </label>
          <input
            id="sun-range"
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={minutes}
            onChange={(e) => {
              setMinutes(Number(e.target.value));
              setTouched(true);
            }}
            className="mt-1 w-full accent-[#D96C2C]"
            aria-label="Déplacer le soleil, de 6 heures à 20 heures"
          />
          <button
            type="button"
            onClick={capture}
            disabled={revealed}
            className="mt-2 w-full rounded-lg bg-[#1877F2] py-2.5 text-[15px] font-bold text-white transition enabled:hover:bg-[#1466D6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            📸 Photographier l'ombre ({fmt(minutes)})
          </button>
          {captureMsg && (
            <p className={`mt-2 rounded-lg px-3 py-2 text-[13px] font-semibold ${revealed ? "bg-[#E7F6EC] text-[#14632F]" : "bg-[#FFF3E0] text-[#7A3E0E]"}`} role="status">
              {captureMsg}
              {attempts > 0 && !revealed ? ` · Tentative ${attempts}` : ""}
            </p>
          )}
          {revealed && score !== null && (
            <p className="mt-2 text-center text-[13px] font-bold text-[#14632F]">
              Heure exacte de la fusion : 16h55 🌇 · Ton score : {score} %
            </p>
          )}
        </div>

        {/* Compteurs + actions */}
        <div className="bg-white px-4">
          <p className="border-t border-[#E4E6EB] pt-2 text-[13px] text-[#65676B]">
            ❤️ {hearts} · 😮 {wows} · 💬 {comments.length} commentaires {savedPost ? "· 🔖 enregistré" : ""}
          </p>
          <div className="mt-1 grid grid-cols-4 border-t border-[#E4E6EB] py-1 text-[13px] font-semibold text-[#65676B]">
            <button
              type="button"
              className={`rounded-md py-1.5 hover:bg-[#F0F2F5] ${reacted === "heart" ? "text-[#E41E3F]" : ""}`}
              onClick={() => {
                if (reacted === "heart") return;
                setHearts((n) => n + 1);
                if (reacted === "wow") setWows((n) => n - 1);
                setReacted("heart");
              }}
            >
              ❤️ Vu &lt;10 s
            </button>
            <button
              type="button"
              className={`rounded-md py-1.5 hover:bg-[#F0F2F5] ${reacted === "wow" ? "text-[#B8860B]" : ""}`}
              onClick={() => {
                if (reacted === "wow") return;
                setWows((n) => n + 1);
                if (reacted === "heart") setHearts((n) => n - 1);
                setReacted("wow");
              }}
            >
              😮 Je cherche
            </button>
            <button type="button" className="rounded-md py-1.5 hover:bg-[#F0F2F5]" onClick={() => document.getElementById("guess-input")?.focus()}>
              💬 Répondre
            </button>
            <button type="button" className={`rounded-md py-1.5 hover:bg-[#F0F2F5] ${savedPost ? "text-[#1877F2]" : ""}`} onClick={() => setSavedPost((s) => !s)}>
              🔖 {savedPost ? "Enregistré" : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* Fil de commentaires */}
        <div className="space-y-2.5 bg-white px-4 pb-3 pt-1">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${
                  c.kind === "page" ? "bg-[#D96C2C]" : c.kind === "player" ? "bg-[#1877F2]" : "bg-[#8A8D91]"
                }`}
                aria-hidden
              >
                {c.author.slice(0, 2).toUpperCase()}
              </div>
              <div className="max-w-[85%] rounded-2xl bg-[#F0F2F5] px-3 py-1.5">
                <p className="text-[13px] font-bold leading-tight">{c.author}</p>
                <p className="text-[14px] leading-snug">{c.text}</p>
              </div>
            </div>
          ))}

          <form onSubmit={submitGuess} className="flex items-center gap-2.5 pt-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-[11px] font-black text-white" aria-hidden>
              TOI
            </div>
            <input
              id="guess-input"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Le nom de l'animal, en un seul mot…"
              className="min-w-0 flex-1 rounded-full bg-[#F0F2F5] px-3.5 py-2 text-[14px] outline-none ring-[#1877F2] placeholder:text-[#65676B] focus:ring-2"
              aria-label="Ta réponse en un seul mot"
              autoComplete="off"
            />
            <button type="submit" className="shrink-0 rounded-full bg-[#1877F2] px-3.5 py-2 text-[13px] font-bold text-white hover:bg-[#1466D6]">
              Envoyer
            </button>
          </form>
          <p className="text-center text-[11px] text-[#65676B]">Teste ton ami le plus sûr de lui : je parie qu'il répond « cheval ». 😄</p>
        </div>

        {/* Récompense — uniquement après le résultat */}
        {revealed && (
          <div className="border-t border-[#E4E6EB] bg-[#FFFBF2] px-4 py-3">
            {optinDone ? (
              <p className="text-[14px] font-semibold text-[#14632F]">✅ C'est noté ! (Prototype : aucune donnée n'est envoyée ni stockée.)</p>
            ) : (
              <>
                <p className="text-[14px] leading-snug">
                  🎁 Pour recevoir ta mini-chanson personnalisée, laisse ton numéro WhatsApp UNIQUEMENT si tu le veux ; on t'écrit une seule
                  fois, tu peux nous écrire STOP à tout moment pour te désinscrire.
                </p>
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setOptinDone(true);
                  }}
                >
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp (facultatif, démo)"
                    className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-[14px] outline-none ring-1 ring-[#E4E6EB] focus:ring-2 focus:ring-[#D96C2C]"
                    aria-label="Numéro WhatsApp, uniquement si tu le veux — champ de démonstration"
                  />
                  <button type="submit" className="shrink-0 rounded-lg bg-[#25D366] px-3.5 py-2 text-[13px] font-bold text-white hover:brightness-95">
                    Je veux ma chanson
                  </button>
                </form>
                <p className="mt-1.5 text-[11px] text-[#65676B]">Sans obligation. En production : masquer immédiatement tout numéro affiché.</p>
              </>
            )}
            <button type="button" onClick={reset} className="mt-2.5 w-full rounded-lg bg-[#1C1E21] py-2 text-[13px] font-bold text-white hover:bg-black">
              ↺ Rejouer l'épisode 1
            </button>
          </div>
        )}
      </article>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/60">
        Boucle complète dans la publication : jouer → photographier → commenter en un mot → révélation → récompense opt-in.
      </p>
    </div>
  );
}
