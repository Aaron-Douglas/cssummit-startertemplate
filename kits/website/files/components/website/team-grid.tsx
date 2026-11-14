import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type TeamMember = {
  /** One to three letters shown in the circle. */
  initials: string;
  name: string;
  role: string;
  /** Optional one-liner. */
  bio?: string;
};

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <ul className="grid grid-cols-1 gap-stack sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <li
          key={member.name}
          className="surface flex items-center gap-4 rounded-card p-card sm:flex-col sm:items-start"
        >
          <Avatar className="size-14 shrink-0">
            <AvatarFallback className="bg-primary-tint font-mono text-base font-semibold text-primary-text">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-heading text-lg font-semibold">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.role}</p>
            {member.bio ? <p className="mt-1 text-sm">{member.bio}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
