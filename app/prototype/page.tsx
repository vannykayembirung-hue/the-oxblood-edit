import type { Metadata } from "next";
import ShadowFusionPrototype from "@/components/ShadowFusionPrototype";

export const metadata: Metadata = {
  title: "Prototype — Fusion d'ombres, la publication qui se joue",
  description:
    "Prototype jouable d'une publication : fais glisser le soleil, fusionne les ombres des meubles en un animal à 16h55, photographie l'instant et réponds en un seul mot.",
  robots: { index: false, follow: false }
};

export default function PrototypePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
        Mécanique inédite · Prototype n°1
      </p>
      <h1 className="mt-3 text-center font-cinzel text-4xl leading-tight text-cream sm:text-5xl">
        Fusion d&apos;ombres
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-cream/80 sm:text-lg">
        Une publication normale… sauf qu&apos;elle se joue du doigt, sans jamais la quitter.
        L&apos;animal n&apos;est pas caché dans l&apos;image : <strong className="text-cream">tu dois fabriquer
        l&apos;heure où il existe</strong>. Fais glisser le soleil, photographie la fusion, nomme l&apos;animal en un mot.
      </p>

      <ol className="mx-auto mt-6 flex max-w-xl flex-col gap-2 text-[15px] text-cream/85 sm:flex-row sm:justify-center sm:gap-6">
        <li>☀️ <strong>1.</strong> Glisse le soleil</li>
        <li>📸 <strong>2.</strong> Photographie la fusion</li>
        <li>💬 <strong>3.</strong> Un seul mot en commentaire</li>
      </ol>

      <div className="mt-10">
        <ShadowFusionPrototype />
      </div>

      <section className="mx-auto mt-12 max-w-xl text-[15px] leading-relaxed text-cream/75">
        <h2 className="font-cinzel text-xl text-cream">Pourquoi c&apos;est nouveau</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong className="text-cream">Un seul twist :</strong> la réponse n&apos;existe qu&apos;à une heure précise (16h55) — le geste remplace le calcul et la devinette statique.</li>
          <li><strong className="text-cream">Jouable dans le fil :</strong> réaction, sauvegarde, commentaires simulés et réponse en un mot restent dans la publication.</li>
          <li><strong className="text-cream">Ancre de mémoire :</strong> l&apos;œil de lumière qui s&apos;allume dans la tête de l&apos;animal au moment de la fusion.</li>
          <li><strong className="text-cream">Récompense conforme :</strong> l&apos;opt-in WhatsApp (mention STOP) n&apos;apparaît qu&apos;après la révélation — jamais avant le résultat.</li>
        </ul>
        <p className="mt-4 text-sm text-cream/60">
          Prototype de démonstration : tout se déroule localement dans ton navigateur, aucune donnée n&apos;est collectée.
          Déclinable en série — Épisode 2 : la cuisine, autre heure, autre animal.
        </p>
      </section>
    </main>
  );
}
