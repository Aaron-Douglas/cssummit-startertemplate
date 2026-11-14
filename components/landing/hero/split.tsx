import { Container } from "@/components/container";
import { hero } from "../content";
import {
  HeroActions,
  HeroLede,
  HeroTitle,
  KitChips,
  TerminalCard,
} from "./parts";

/** layout="split": copy on the left, a live-looking terminal on the right. */
export function HeroSplit() {
  return (
    <section className="py-section">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 nav-sidebar:lg:grid-cols-1 nav-sidebar:xl:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col items-start gap-7">
          <p className="eyebrow">{hero.eyebrow}</p>
          <HeroTitle />
          <HeroLede />
          <HeroActions />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <TerminalCard className="lg:rotate-1" />
          <KitChips />
        </div>
      </Container>
    </section>
  );
}
