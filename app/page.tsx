import { Features } from "@/components/landing/features";
import { GetStarted } from "@/components/landing/get-started";
import { Hero } from "@/components/landing/hero";
import { Stack } from "@/components/landing/stack";
import designConfig from "@/design.config";
import { resolveDesign } from "@/lib/design";

export default function Home() {
  const design = resolveDesign(designConfig);
  return (
    <>
      <Hero layout={design.layout} />
      <Features />
      <Stack />
      <GetStarted />
    </>
  );
}
