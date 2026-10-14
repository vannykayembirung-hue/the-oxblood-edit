"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import WaxSeal from "@/components/WaxSeal";
import NewsletterCapture from "@/components/NewsletterCapture";
import {
  ARCHETYPE_ORDER,
  ARCHETYPES,
  QUIZ_QUESTIONS,
  type ArchetypeKey
} from "@/lib/villainess-quiz";

/**
 * VillainessQuiz — "WHICH VILLAINESS ARE YOU?"
 * Six questions, one verdict, four archetypes, sealed in oxblood wax.
 *
 * Every answer carries a single archetype weight; the reading is the highest
 * total, with ties resolved by the later question (the house believes you
 * answer more truthfully as the evening goes on).
 */

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

function tallyScores(answers: (ArchetypeKey | null)[]) {
  const scores: Record<ArchetypeKey, number> = {
    "velvet-widow": 0,
    "library-siren": 0,
    "crimson-heiress": 0,
    "thorned-muse": 0
  };
  const lastHit: Record<ArchetypeKey, number> = {
    "velvet-widow": -1,
    "library-siren": -1,
    "crimson-heiress": -1,
    "thorned-muse": -1
  };

  answers.forEach((answer, index) => {
    if (!answer) return;
    scores[answer] += 1;
    lastHit[answer] = index;
  });

  const verdict = ARCHETYPE_ORDER.reduce((best, key) => {
    if (scores[key] > scores[best]) return key;
    if (scores[key] === scores[best] && lastHit[key] > lastHit[best]) return key;
    return best;
  }, ARCHETYPE_ORDER[0]);

  return { scores, verdict };
}

export default function VillainessQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(ArchetypeKey | null)[]>(
    Array(TOTAL_QUESTIONS).fill(null)
  );

  const answeredCount = answers.filter(Boolean).length;
  const complete = answeredCount === TOTAL_QUESTIONS;
  const finished = complete && step >= TOTAL_QUESTIONS;

  const { scores, verdict } = useMemo(() => tallyScores(answers), [answers]);
  const archetype = ARCHETYPES[verdict];
  const question = QUIZ_QUESTIONS[Math.min(step, TOTAL_QUESTIONS - 1)];
  const selectedForStep = answers[step];

  function choose(archetypeKey: ArchetypeKey) {
    const next = [...answers];
    next[step] = archetypeKey;
    setAnswers(next);
    setStep((current) => Math.min(current + 1, TOTAL_QUESTIONS));
  }

  function revise() {
    setStep((current) => Math.max(0, current - 1));
  }

  function beginAgain() {
    setAnswers(Array(TOTAL_QUESTIONS).fill(null));
    setStep(0);
  }

  if (finished) {
    const mix = ARCHETYPE_ORDER.map((key) => ({
      key,
      name: ARCHETYPES[key].name,
      percent: Math.round((scores[key] / TOTAL_QUESTIONS) * 100)
    }));
    const notes = QUIZ_QUESTIONS.map((q, i) => {
      const key = answers[i];
      if (!key) return null;
      return q.options.find((opt) => opt.archetype === key)?.note ?? null;
    }).filter((n): n is string => Boolean(n));

    return (
      <div className="velvet-card velvet-card--rule p-7 sm:p-10" aria-live="polite">
        <div className="flex flex-col sm:flex-row items-center gap-7 sm:gap-10 text-center sm:text-left">
          <WaxSeal size={124} className="shrink-0" />
          <div>
            <p className="eyebrow mb-2">THE READING · SEALED &amp; COUNTERSIGNED</p>
            <h2 className="text-3xl sm:text-5xl mb-2">{archetype.name}</h2>
            <p className="text-xl italic text-gold/90 mb-3">{archetype.epithet}</p>
            <p className="font-cinzel text-[0.68rem] tracking-[0.3em] uppercase text-parchment/55">
              {archetype.motto}
            </p>
          </div>
        </div>

        <p className="text-xl text-parchment/85 mt-8 max-w-3xl">{archetype.verdict}</p>

        <div className="grid sm:grid-cols-3 gap-px bg-gold/25 mt-9 border border-gold/25">
          {[
            { label: "Her uniform", body: archetype.uniform },
            { label: "Her lip", body: archetype.lip },
            { label: "Her book", body: archetype.book }
          ].map((row) => (
            <div key={row.label} className="bg-velvet p-6">
              <p className="font-cinzel text-[0.66rem] tracking-[0.28em] uppercase text-gold mb-3">
                {row.label}
              </p>
              <p className="text-lg text-parchment/85">{row.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 grid lg:grid-cols-2 gap-8">
          <div>
            <p className="eyebrow mb-3">THE SIGNATURE MIX</p>
            <ul className="space-y-3">
              {mix.map((row) => (
                <li key={row.key}>
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className="font-cinzel text-[0.66rem] tracking-[0.18em] uppercase text-parchment/75">
                      {row.name}
                    </span>
                    <span className="text-sm text-gold/80">{row.percent}%</span>
                  </div>
                  <div className="quiz-bar">
                    <span style={{ width: `${row.percent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">THE WARDROBE FORMULA</p>
            <ul className="space-y-2.5 text-lg text-parchment/85">
              {archetype.formula.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="text-oxblood mt-0.5 select-none">✦</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {notes.length > 0 && (
              <p className="mt-6 text-base italic text-parchment/60 leading-relaxed">
                Noted in the margin: {notes.join(" · ")}.
              </p>
            )}
          </div>
        </div>

        {/* The dossier — promised by name, listed chapter by chapter, then sent. */}
        <div className="mt-10 pt-9 border-t border-gold/20">
          <p className="eyebrow mb-3">The dossier · Nine pages, sent by email</p>
          <h3 className="text-2xl sm:text-3xl mb-3">{archetype.dossier.title}</h3>
          <p className="text-lg text-parchment/75 mb-7 max-w-2xl">{archetype.dossier.dek}</p>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="eyebrow mb-3">Inside the dossier</p>
              <ul className="space-y-2.5">
                {archetype.dossier.chapters.map((chapter, index) => (
                  <li key={chapter.heading} className="text-base text-parchment/80 flex gap-3">
                    <span className="font-cinzel text-[0.62rem] tracking-[0.22em] uppercase text-gold/85 mt-1 shrink-0">
                      {ROMAN[index]}
                    </span>
                    <span>
                      <strong className="text-parchment">{chapter.heading}</strong> — {chapter.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-3">The pieces it names</p>
              <ul className="space-y-2.5">
                {archetype.dossier.keyPieces.map((piece) => (
                  <li key={piece.label} className="text-base text-parchment/80 flex gap-3">
                    <span className="text-oxblood mt-0.5 select-none">✦</span>
                    <span>
                      <strong className="text-parchment">{piece.label}</strong> — {piece.note}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-parchment/55 leading-relaxed">{archetype.dossier.care}</p>
            </div>
          </div>

          <NewsletterCapture
            source="villainess-quiz"
            archetype={verdict}
            variant="footer"
            heading="Send me this dossier"
            subheading={`The full ${archetype.dossier.title.split("·")[0].trim()} dossier, plus the Sunday Dispatch. One email, ticked by you.`}
            ctaLabel="SEND THE DOSSIER"
            revealDossier
          />
        </div>

        <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link href={`/journal/${archetype.articleSlug}`} className="btn-oxblood flex-1 text-center">
            READ THE FULL FORMULA
          </Link>
          <Link href="/shop/the-oxblood-code" className="btn-ghost flex-1 text-center">
            THE OXBLOOD CODE · $27
          </Link>
          <button
            type="button"
            onClick={beginAgain}
            className="font-cinzel text-[0.68rem] tracking-[0.24em] uppercase bg-transparent border-0 text-parchment/60 hover:text-gold cursor-pointer py-3"
          >
            Begin the reading again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="velvet-card velvet-card--rule p-6 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="eyebrow">{question.standing}</p>
        <p className="font-cinzel text-[0.66rem] tracking-[0.24em] uppercase text-parchment/55">
          {ROMAN[Math.min(step, 5)]} of {ROMAN[5]}
        </p>
      </div>

      <div className="quiz-meter mb-8" role="presentation">
        <span style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }} />
      </div>

      <h2 className="text-2xl sm:text-4xl leading-snug mb-7 max-w-2xl">{question.prompt}</h2>

      <div className="grid gap-3">
        {question.options.map((option, index) => (
          <button
            key={option.archetype}
            type="button"
            className="quiz-option"
            data-selected={selectedForStep === option.archetype ? "true" : "false"}
            onClick={() => choose(option.archetype)}
          >
            <span className="flex gap-4 items-start">
              <span className="font-cinzel text-[0.7rem] tracking-[0.2em] text-gold mt-1.5 shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option.label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gold/20">
        <button
          type="button"
          onClick={revise}
          disabled={step === 0}
          className="font-cinzel text-[0.68rem] tracking-[0.24em] uppercase bg-transparent border-0 text-parchment/60 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          ← Revise
        </button>
        <p className="text-sm text-parchment/50 italic">
          {answeredCount === 0
            ? "Answer with the first thing you would wear, not the second."
            : `${answeredCount} of ${TOTAL_QUESTIONS} answered · the seal is struck at the end.`}
        </p>
      </div>
    </div>
  );
}
