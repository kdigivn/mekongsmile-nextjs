import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
};

export default function SectionHeading({ title, subtitle, className, centered = false }: Props) {
  return (
    <div className={cn("mb-8", centered && "text-center", className)}>
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
