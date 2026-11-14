import { createCn } from "cn/config";

/**
 * Merge class names (clsx + tailwind-merge semantics). Taught about the design-system
 * utilities in app/globals.css so `cn("rounded-card", "rounded-none")` keeps only the last.
 */
export const cn = createCn({
  extend: {
    theme: {
      radius: ["control", "field", "card", "badge", "avatar"],
      spacing: [
        "control",
        "control-sm",
        "control-lg",
        "control-x",
        "card",
        "stack",
        "section",
      ],
      container: ["page"],
    },
  },
});
