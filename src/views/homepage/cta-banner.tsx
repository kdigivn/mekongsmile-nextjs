import Link from "@/components/link-base";

export default function CtaBanner() {
  return (
    <section className="bg-brand-navy py-16">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-6 px-4 text-center">
        <h2 className="font-heading text-display font-bold text-white">
          Ready to Explore the Mekong Delta?
        </h2>
        <p className="max-w-lg text-white/70">
          Let us craft your perfect journey through floating markets, river
          villages, and lush landscapes.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/tours/"
            className="rounded-xl bg-brand-gold px-8 py-4 font-bold text-brand-navy transition-all hover:bg-brand-gold-light active:scale-[0.98]"
          >
            Browse Tours
          </Link>
          <Link
            href="/contact-us/"
            className="rounded-xl border-2 border-white/30 px-8 py-4 font-bold text-white transition-all hover:border-white hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
