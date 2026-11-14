import { Container } from "@/components/container";
import { hero } from "../content";
import { HeroActions, HeroLede, HeroTitle, KitChips } from "./parts";

/** layout="centered": one centred column under a soft accent glow, kits as chips below. */
export function HeroCentered() {
  return (
    <section className="relative isolate overflow-hidden py-section">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(ellipse_at_top,var(--primary-tint),transparent_65%)]"
      />
      <Container className="flex flex-col items-center gap-8 text-center">
        <p className="eyebrow">{hero.eyebrow}</p>
        <HeroTitle className="max-w-4xl text-[clamp(2.75rem,9vw,6.5rem)]" />
        <HeroLede className="mx-auto" />
        <HeroActions className="justify-center" />
        <KitChips className="mt-6 max-w-2xl justify-center" />
      </Container>
    </section>
  );
}
