import Link from "@/components/link-base";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden">
      {/* Dark overlay on image placeholder — using gradient until real photo available */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/90 to-primary-900" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="font-heading text-hero font-bold text-white">
          Explore the Mekong Delta
        </h1>
        <p className="max-w-xl text-lg text-white/70">
          Authentic tours, river cruises, and cultural experiences in
          Vietnam&apos;s most vibrant region.
        </p>
        <Link
          href="/tours/"
          className="mt-4 inline-flex items-center rounded-xl bg-brand-gold px-8 py-4 text-base font-bold text-brand-navy shadow-lg transition-all hover:bg-brand-gold-light hover:shadow-xl active:scale-[0.98]"
        >
          Explore All Tours
        </Link>
      </div>
    </section>
  );
}
