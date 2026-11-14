import {
  ArrowRightIcon,
  CheckCircle2Icon,
  InfoIcon,
  MenuIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { Metadata } from "next";
import type * as React from "react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import designConfig from "@/design.config";
import { resolveDesign } from "@/lib/design";
import { CurrentDesign, ToastDemo } from "./client-demos";

export const metadata: Metadata = {
  title: "Styleguide",
  description:
    "Every UI component and design token in this project, under the current design.",
};

const semanticColors = [
  { name: "background", swatch: "bg-background", text: "text-foreground" },
  { name: "foreground", swatch: "bg-foreground", text: "text-background" },
  { name: "card", swatch: "bg-card", text: "text-card-foreground" },
  { name: "popover", swatch: "bg-popover", text: "text-popover-foreground" },
  { name: "primary", swatch: "bg-primary", text: "text-primary-foreground" },
  {
    name: "secondary",
    swatch: "bg-secondary",
    text: "text-secondary-foreground",
  },
  { name: "muted", swatch: "bg-muted", text: "text-muted-foreground" },
  { name: "accent", swatch: "bg-accent", text: "text-accent-foreground" },
  {
    name: "destructive",
    swatch: "bg-destructive",
    text: "text-destructive-foreground",
  },
  { name: "success", swatch: "bg-success", text: "text-success-foreground" },
  { name: "warning", swatch: "bg-warning", text: "text-warning-foreground" },
  {
    name: "primary-tint",
    swatch: "bg-primary-tint",
    text: "text-primary-text",
  },
  { name: "border", swatch: "bg-border", text: "text-foreground" },
  { name: "input", swatch: "bg-input", text: "text-background" },
  { name: "ring", swatch: "bg-ring", text: "text-background" },
];

const charts = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

const brandPalette = [
  "paper",
  "card",
  "panel",
  "ink",
  "muted",
  "orange",
  "teal",
  "green",
  "yellow",
  "danger",
  "edge",
];

const radii = [
  { name: "rounded-control", className: "rounded-control" },
  { name: "rounded-field", className: "rounded-field" },
  { name: "rounded-card", className: "rounded-card" },
  { name: "rounded-badge", className: "rounded-badge" },
  { name: "rounded-avatar", className: "rounded-avatar" },
];

const utilities = [
  ["eyebrow", "Mono label with the accent bar"],
  ["surface", "Card/panel treatment for the current surface option"],
  ["text-display", "Hero-sized heading"],
  ["font-heading", "Heading font of the current type option"],
  ["rounded-control / -field / -card / -badge", "Radius per shape option"],
  ["h-control / -sm / -lg", "Control heights per density option"],
  ["p-card · gap-stack · py-section", "Spacing per density option"],
  ["max-w-page", "Page width per layout option (or use <Container>)"],
  ["text-primary-text", "Accent-coloured text that passes 4.5:1"],
  ["bg-primary-tint", "Soft accent background"],
];

function Block({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-24 flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id={`${id}-title`} className="text-2xl sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const configured = resolveDesign(designConfig);

  return (
    <Container className="flex flex-col gap-16 py-section">
      <PageHeader
        eyebrow="Styleguide"
        title="Every component, one design."
        description="This page renders every UI component and token under the current design. Flip the design switcher and watch it all change; kits use exactly these pieces."
        actions={
          <Button asChild variant="outline">
            <a href="#tokens">Jump to tokens</a>
          </Button>
        }
      />

      <Block
        id="design"
        title="Current design"
        description="Set in design.config.ts. In development the switcher can override it for you only (stored in a cookie)."
      >
        <CurrentDesign configured={configured} />
      </Block>

      <Block id="type" title="Typography">
        <div className="flex flex-col gap-5">
          <p className="eyebrow">Eyebrow label</p>
          <p className="text-display font-heading">Display heading</p>
          <h1 className="text-5xl">Heading one</h1>
          <h2 className="text-4xl">Heading two</h2>
          <h3 className="text-2xl">Heading three</h3>
          <h4 className="text-xl">Heading four</h4>
          <p className="max-w-2xl text-lg">
            Body text. Build something real this weekend: a map of free study
            spots, a chatbot for course questions, a game for the closing demo.
          </p>
          <p className="max-w-2xl text-muted-foreground">
            Muted text for supporting copy, captions and hints.
          </p>
          <p>
            Inline{" "}
            <a href="#type" className="text-primary-text underline">
              link
            </a>{" "}
            and <code className="font-mono text-sm">inline code</code>.
          </p>
        </div>
      </Block>

      <Block
        id="buttons"
        title="Buttons"
        description="The primary button follows the buttons axis (offset, solid, outline, glow, brutal); every button follows shape and density."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">
            Large
            <ArrowRightIcon />
          </Button>
          <Button size="icon" aria-label="Add">
            <PlusIcon />
          </Button>
          <Button variant="outline" size="icon" aria-label="Menu">
            <MenuIcon />
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Block>

      <Block id="badges" title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="tint">Tint</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Block>

      <Block id="forms" title="Form fields">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-name">Team name</Label>
            <Input id="sg-name" placeholder="The Debuggers" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-email">Email</Label>
            <Input
              id="sg-email"
              type="email"
              defaultValue="not-an-email"
              aria-invalid
              aria-describedby="sg-email-error"
            />
            <p id="sg-email-error" className="text-sm text-destructive">
              Enter a valid email address.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sg-disabled">Disabled</Label>
            <Input id="sg-disabled" disabled value="Read only" readOnly />
          </div>
          <div className="flex flex-col gap-2 md:row-span-2">
            <Label htmlFor="sg-idea">Your idea</Label>
            <Textarea
              id="sg-idea"
              placeholder="An app that finds free study rooms on campus…"
            />
          </div>
        </div>
      </Block>

      <Block
        id="cards"
        title="Cards"
        description="Cards follow the surface axis (raised, flat, bordered, glass)."
      >
        <div className="grid gap-stack md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Team Pulse</CardTitle>
              <CardDescription>
                A dashboard for club attendance.
              </CardDescription>
              <CardAction>
                <Badge variant="tint">dashboard</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stat tiles, a chart and a sortable table from a JSON file.
              </p>
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm">Open</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Plain card</CardTitle>
              <CardDescription>Header and content only.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Ada Douglas</p>
                <p className="text-sm text-muted-foreground">Team lead</p>
              </div>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Small card</CardTitle>
              <CardDescription>
                size=&quot;sm&quot; tightens padding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl font-bold">128</p>
              <p className="text-sm text-muted-foreground">check-ins today</p>
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block id="alerts" title="Alerts">
        <div className="grid gap-4 md:grid-cols-2">
          <Alert>
            <InfoIcon />
            <AlertTitle>Default</AlertTitle>
            <AlertDescription>Neutral information.</AlertDescription>
          </Alert>
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>Connect your own Supabase</AlertTitle>
            <AlertDescription>
              The app kit runs in demo mode until you add your keys.
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2Icon />
            <AlertTitle>Deployed</AlertTitle>
            <AlertDescription>Your site is live on Vercel.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>Build failed</AlertTitle>
            <AlertDescription>Run pnpm verify to see why.</AlertDescription>
          </Alert>
        </div>
      </Block>

      <Block id="overlays" title="Menus, sheets and toasts">
        <div className="flex flex-wrap items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>My team</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>A sheet</SheetTitle>
                <SheetDescription>
                  Slides in from the side. Good for filters and mobile menus.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        <ToastDemo />
        <Separator />
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
        </div>
      </Block>

      <Block
        id="tokens"
        title="Colour tokens"
        description="Semantic tokens (use these as Tailwind classes: bg-primary, text-muted-foreground, border-border ...). They change with the accent and surface axes."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {semanticColors.map((color) => (
            <li key={color.name} className="flex flex-col gap-2">
              <div
                className={`flex h-16 items-end rounded-control border p-2 text-xs font-semibold ${color.swatch} ${color.text}`}
              >
                Aa
              </div>
              <span className="font-mono text-xs">{color.name}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-muted-foreground">
            chart-1 … chart-5
          </p>
          <div className="flex h-10 overflow-hidden rounded-control">
            {charts.map((chart) => (
              <div key={chart} className={`flex-1 ${chart}`} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs text-muted-foreground">
            Brand palette (raw, --brand-*): for reference, not for components
          </p>
          <ul className="flex flex-wrap gap-2">
            {brandPalette.map((name) => (
              <li key={name} className="flex items-center gap-2 text-xs">
                <span
                  className="size-6 rounded-sm border"
                  style={{ background: `var(--brand-${name})` }}
                />
                <span className="font-mono">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </Block>

      <Block
        id="shape"
        title="Shape and density"
        description="Radius follows the shape axis; control height and spacing follow the density axis."
      >
        <ul className="flex flex-wrap gap-4">
          {radii.map((radius) => (
            <li key={radius.name} className="flex flex-col items-start gap-2">
              <div
                className={`size-20 border-2 border-primary bg-primary-tint ${radius.className}`}
              />
              <span className="font-mono text-xs">{radius.name}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex h-control-sm items-center rounded-control bg-muted px-3 font-mono text-xs">
            h-control-sm
          </div>
          <div className="flex h-control items-center rounded-control bg-muted px-3 font-mono text-xs">
            h-control
          </div>
          <div className="flex h-control-lg items-center rounded-control bg-muted px-3 font-mono text-xs">
            h-control-lg
          </div>
        </div>
      </Block>

      <Block
        id="utilities"
        title="Utilities for kits"
        description="Defined in app/globals.css. Kits use these and the semantic colours, never raw hex values."
      >
        <dl className="grid gap-px overflow-hidden rounded-card border bg-border md:grid-cols-2">
          {utilities.map(([name, text]) => (
            <div key={name} className="flex flex-col gap-1 bg-background p-4">
              <dt className="font-mono text-sm text-primary-text">{name}</dt>
              <dd className="text-sm text-muted-foreground">{text}</dd>
            </div>
          ))}
        </dl>
      </Block>
    </Container>
  );
}
