import { Droplets, Hash, RotateCcw, ThermometerSnowflake } from "lucide-react";

const CARE = [
  {
    icon: RotateCcw,
    title: "Wash Inside Out",
    body: "Protects graphic ink surfaces and embroidery stitches from abrasion during wash cycles.",
  },
  {
    icon: ThermometerSnowflake,
    title: "Avoid Direct Ironing",
    body: "Do not iron directly on print designs. Iron inside-out or cover print layers with parchment paper.",
  },
  {
    icon: Droplets,
    title: "Do Not Bleach",
    body: "Strong bleach chemicals break down ink pigmentation binding agents and damage cotton fibers.",
  },
  {
    icon: Hash,
    title: "Tag Us on Social",
    body: "Share your vision and prints with the community. Tag us when you rock your vision: @printifulbrand",
  },
];

export function CareGuide() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block bg-brand-purple px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            Merch Maintenance
          </span>
          <h2 className="mt-4 font-heading text-4xl italic sm:text-5xl">
            Product Care Instructions
          </h2>
          <p className="mt-4 text-muted">
            This isn&apos;t just custom apparel — it is your vision brought to
            life. Maintain sharpness and fabric quality with these guidelines.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARE.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="border border-border bg-surface p-5 text-center"
              >
                <Icon
                  className="mx-auto text-brand-purple dark:text-brand-yellow"
                  size={28}
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 font-heading text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
