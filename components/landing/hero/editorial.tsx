import { Container } from "@/components/container";
import { site } from "@/lib/site";
import { hero } from "../content";
import { HeroActions, HeroLede } from "./parts";

const index = [
  {
    n: "01",
    title: "Pick a kit",
    text: "One or two of seven. The rest stay out.",
  },
  {
    n: "02",
    title: "Pick a look",
    text: "Eight design axes, six presets, Shuffle.",
  },
  {
    n: "03",
    title: "Build with Claude",
    text: "Ask for a feature; it knows the codebase.",
  },
];

/** layout="editorial": a magazine cover with a masthead rule, giant type and an index. */
export function HeroEditorial() {
  return (
    <section className="py-section">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y-2 border-foreground py-3 font-mono text-xs tracking-[0.12em] uppercase">
          <span>Issue 01</span>
          <span className="hidden sm:inline">{site.name}</span>
          <span className="text-primary-text">{hero.eyebrow}</span>
        </div>
        <h1 className="text-[clamp(3rem,11vw,9rem)] leading-[0.95]">
          {hero.titleStart} <em>{hero.titleEm}</em>
          <br className="hidden sm:block" /> {hero.titleEnd}
        </h1>
        <div className="grid gap-10 border-t pt-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
          <div className="flex flex-col items-start gap-8">
            <HeroLede className="text-xl sm:text-2xl" />
            <HeroActions />
          </div>
          <ol className="flex flex-col divide-y border-y">
            {index.map((item) => (
              <li key={item.n} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                <span className="font-mono text-sm text-primary-text">
                  {item.n}
                </span>
                <div>
                  <h2 className="text-xl">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
