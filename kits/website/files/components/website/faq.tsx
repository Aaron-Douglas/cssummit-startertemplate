import { ChevronDownIcon } from "lucide-react";

export type FaqItem = { question: string; answer: string };

/**
 * Questions that open and close. Built on the browser's own <details>/<summary>, so it works
 * with a keyboard and screen readers without any JavaScript.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group surface rounded-card [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card p-card font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/60">
            {item.question}
            <ChevronDownIcon
              aria-hidden
              className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <p className="px-card pb-card text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
