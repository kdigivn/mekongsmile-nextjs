import Link from "@/components/link-base";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-secondary-800 to-primary-700 animate-gradient" />
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='white'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-white md:text-6xl">
          Discover the Heart of the Delta
        </h1>
        <p className="max-w-xl text-lg text-white/80">
          Authentic day tours, river cruises, and cultural experiences in
          Vietnam&apos;s most vibrant region.
        </p>
        <Link
          href="/tours/"
          className="mt-2 inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl active:scale-[0.98]"
        >
          Explore All Tours
        </Link>
      </div>
    </section>
  );
}
