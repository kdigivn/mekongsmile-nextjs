"use client";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 10000, label: "Happy Guests", suffix: "+" },
  { value: 50, label: "Unique Tours", suffix: "+" },
  { value: 7, label: "Years Experience", suffix: "" },
];

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, triggered]);

  return { count, ref };
}

function StatItem({
  value,
  label,
  suffix,
}: {
  value: number;
  label: string;
  suffix: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <span className="text-4xl font-extrabold text-primary md:text-5xl">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function StatsCounterSection() {
  return (
    <section className="py-12">
      <div className="rounded-2xl bg-muted px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
