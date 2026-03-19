"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const ALL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "inclusions", label: "Inclusions" },
  { id: "faq", label: "FAQ" },
  { id: "reviews", label: "Reviews" },
];

const NAV_OFFSET = 64; // navbar height in px

export default function TourStickyTabs({ availableSections }: { availableSections?: string[] }) {
  const TABS = availableSections
    ? ALL_TABS.filter((t) => availableSections.includes(t.id))
    : ALL_TABS;
  const [activeTab, setActiveTab] = useState("overview");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);

      const scrollPos = window.scrollY + NAV_OFFSET + 80;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(TABS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(TABS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.offsetTop - NAV_OFFSET - 60;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto flex gap-8 overflow-x-auto px-4 py-3 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={cn(
              "whitespace-nowrap pb-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
