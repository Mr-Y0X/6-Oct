import type { CSSProperties, ReactNode } from "react";
import { useInView } from "@/hooks/hooks";
import { cn } from "@/utils/cn";

/** غلاف ظهور تدريجي عند التمرير — يحترم reduced motion عبر CSS */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: "up" | "fade" | "zoom" | "clip";
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span" | "figure" | "li" | "p";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      data-variant={variant}
      className={cn("reveal", inView && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/** رقم فصل عربي-هندي كبير خلف العناوين */
const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
export const toArabicDigits = (n: string | number) =>
  String(n).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

export function ChapterHeading({
  no,
  kicker,
  title,
  lead,
  className,
}: {
  no: number;
  kicker: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden="true"
        className="font-mono-x pointer-events-none absolute -top-14 select-none text-[7rem] leading-none text-gold/[0.07] md:-top-24 md:text-[13rem]"
      >
        {String(no).padStart(2, "0")}
      </span>
      <Reveal>
        <p className="font-mono-x flex items-center gap-3 text-xs tracking-[0.35em] text-gold/80">
          <span className="inline-block h-px w-10 bg-gold/60" />
          {kicker} — {toArabicDigits(String(no).padStart(2, "0"))}
        </p>
      </Reveal>
      <Reveal delay={120}>
        <h2 className="font-display mt-5 text-4xl font-bold leading-[1.25] text-paper md:text-6xl">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={240}>
          <p className="mt-6 max-w-2xl text-base leading-8 text-mute md:text-lg md:leading-9">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/** شريط اقتباس أرشيفي */
export function ArchiveQuote({
  children,
  by,
}: {
  children: ReactNode;
  by?: string;
}) {
  return (
    <Reveal variant="fade">
      <figure className="relative mx-auto max-w-3xl px-6 py-4 text-center">
        <span
          aria-hidden="true"
          className="font-display pointer-events-none absolute -top-8 right-0 select-none text-8xl text-gold/15"
        >
          ”
        </span>
        <blockquote className="font-display text-2xl leading-[1.9] text-paper/90 md:text-3xl md:leading-[2]">
          {children}
        </blockquote>
        {by && (
          <figcaption className="font-mono-x mt-5 text-[11px] tracking-[0.3em] text-gold/70">
            {by}
          </figcaption>
        )}
      </figure>
    </Reveal>
  );
}
