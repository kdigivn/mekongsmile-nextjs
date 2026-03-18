import Link from "@/components/link-base";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = { label: string; href?: string };

export default function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link href="/" className="text-white/70 hover:text-white">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-white/50" />
          {item.href ? (
            <Link href={item.href} className="text-white/70 hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
