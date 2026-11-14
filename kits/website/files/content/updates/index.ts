import type { Update } from "@/lib/website/updates";
import { firstPrototype } from "./first-prototype";
import { meetTheTeam } from "./meet-the-team";
import { whatWeHeard } from "./what-we-heard";

/**
 * Every post on /updates. To add one:
 *   1. Copy a file in this folder (for example first-prototype.ts) and rename it.
 *   2. Change the export name, slug, title, date, summary and body.
 *   3. Import it below and add it to the list. Order doesn't matter: newest shows first.
 */
export const updates: Update[] = [firstPrototype, whatWeHeard, meetTheTeam];
