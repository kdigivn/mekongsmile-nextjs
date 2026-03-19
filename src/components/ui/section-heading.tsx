import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
  chip?: string;
  emphasisWord?: string;
};

function renderTitle(title: string, emphasisWord?: string) {
  if (!emphasisWord) return title;
  const idx = title.indexOf(emphasisWord);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic">{emphasisWord}</em>
      {title.slice(idx + emphasisWord.length)}
    </>
  );
}

export default function SectionHeading({
  title,
  subtitle,
  className,
  centered = false,
  chip,
  emphasisWord,
}: Props) {
  return (
    <div className={cn("mb-8", centered && "text-center", className)}>
      {chip && <span className="section-chip">{chip}</span>}
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        {renderTitle(title, emphasisWord)}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
