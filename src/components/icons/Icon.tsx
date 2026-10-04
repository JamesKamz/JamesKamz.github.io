import {
  Blocks,
  Boxes,
  Braces,
  Code2,
  Container,
  Database,
  Layers,
  Monitor,
  PenTool,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** Icons selectable from the admin (by name). */
export const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  layers: Layers,
  boxes: Boxes,
  workflow: Workflow,
  braces: Braces,
  shield: Shield,
  server: Server,
  monitor: Monitor,
  database: Database,
  container: Container,
  "pen-tool": PenTool,
  code: Code2,
  blocks: Blocks,
  sparkles: Sparkles,
};

export const iconNames = Object.keys(iconMap);

export function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Cmp = iconMap[name] ?? Sparkles;
  return <Cmp className={className} aria-hidden="true" strokeWidth={1.6} />;
}
