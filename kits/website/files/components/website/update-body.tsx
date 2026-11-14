import type { UpdateBlock } from "@/lib/website/updates";

/** Renders a post's body blocks (paragraphs, subheadings and lists). */
export function UpdateBody({ blocks }: { blocks: UpdateBlock[] }) {
  return (
    <div className="flex flex-col gap-5 text-base leading-relaxed text-pretty sm:text-lg">
      {blocks.map((block, index) => {
        // Blocks never reorder, so the index is a stable key here.
        const key = `block-${index}`;
        if (typeof block === "string") {
          return (
            <p key={key} className="text-muted-foreground">
              {block}
            </p>
          );
        }
        if ("heading" in block) {
          return (
            <h2 key={key} className="mt-4 text-2xl">
              {block.heading}
            </h2>
          );
        }
        return (
          <ul
            key={key}
            className="flex list-disc flex-col gap-2 pl-6 text-muted-foreground marker:text-primary-text"
          >
            {block.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
