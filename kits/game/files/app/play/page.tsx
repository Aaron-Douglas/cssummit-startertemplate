import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Game } from "@/components/game/game";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Rain Barrel: catch raindrops for the community garden and dodge the hail.",
};

export default function PlayPage() {
  return (
    <Container className="flex flex-col gap-8 py-section">
      <PageHeader
        eyebrow="Play"
        title="Rain Barrel"
        description="A summer storm over the community garden. Catch the rain, dodge the hail. Scores are saved on this device."
      />
      <Game />
    </Container>
  );
}
