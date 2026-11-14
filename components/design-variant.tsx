import type { ReactNode } from "react";
import type { AxisOption } from "@/lib/design";
import { isDesignSwitcherEnabled } from "@/lib/env";

type StructuralAxis = "layout" | "nav";

/**
 * Picks the component for a structural axis (`layout` or `nav`).
 *
 * With the design switcher off, only the configured variant is rendered, so the page stays
 * static and small. With it on, every variant is rendered and styles/design/{layout,nav}.css
 * hides all but the one named on <html>, so switching is instant and there is no flash on
 * reload (the cookie is applied to <html> by an inline script before first paint).
 */
export function DesignVariant<A extends StructuralAxis>({
  axis,
  active,
  variants,
}: {
  axis: A;
  active: AxisOption<A>;
  variants: Record<AxisOption<A>, ReactNode>;
}) {
  const attribute = `data-${axis}-variant`;
  if (!isDesignSwitcherEnabled()) {
    return (
      <div className="contents" {...{ [attribute]: active }}>
        {variants[active]}
      </div>
    );
  }
  return (
    <>
      {(Object.keys(variants) as AxisOption<A>[]).map((key) => (
        <div key={key} className="contents" {...{ [attribute]: key }}>
          {variants[key]}
        </div>
      ))}
    </>
  );
}
