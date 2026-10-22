/** Inner-page title: World Athletics style — white, mixed-case, small section label. */
export function PageHero({ title, intro, kicker, children }: {
  title: string;
  intro?: string;
  kicker?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14">
        {kicker && <p className="label mb-5 text-ink">{kicker}</p>}
        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-base text-muted text-pretty sm:text-lg">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function SectionHeading({ title, kicker, intro, action, tone = "light" }: {
  title: string;
  kicker?: string;
  intro?: string;
  action?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        <p className={`label mb-3 ${tone === "dark" ? "text-white" : "text-ink"}`}>{kicker ?? title}</p>
        {kicker && <h2 className={`text-2xl font-bold sm:text-3xl ${tone === "dark" ? "text-white" : "text-ink"}`}>{title}</h2>}
        {intro && <p className={`mt-2 max-w-xl text-pretty ${tone === "dark" ? "text-white/70" : "text-muted"}`}>{intro}</p>}
      </div>
      {action}
    </div>
  );
}
