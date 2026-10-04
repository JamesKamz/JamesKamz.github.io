import { cn } from "@/lib/utils";
import { Reveal } from "@/components/site/Reveal";

export function SectionHeading({
  kicker,
  title,
  subtitle,
  className,
  as: Tag = "h2",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <p className="kicker">{kicker} $</p>
      <Tag className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">{title}</Tag>
      {subtitle ? <p className="mt-4 max-w-2xl text-lg text-muted">{subtitle}</p> : null}
    </Reveal>
  );
}
