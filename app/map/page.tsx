import type { Metadata } from "next";
import { Container } from "@/components/container";
import { MapExplorer } from "@/components/map/map-explorer";
import { PageHeader } from "@/components/page-header";
import { places } from "@/lib/map/places";

export const metadata: Metadata = {
  title: "Map",
  description: "Sample community places around Chicago on a free map.",
};

/** The map page. Places come from lib/map/places.ts; the map itself loads in the browser. */
export default function MapPage() {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <PageHeader
        eyebrow="Map"
        title="Places to study and connect"
        description="Sample places around Chicago. Pick a category, tap a place in the list to jump to it, or sort by distance from you."
      />
      <MapExplorer data={places} />
    </Container>
  );
}
