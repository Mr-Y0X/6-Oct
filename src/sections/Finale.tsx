import { useLayoutEffect, useRef } from "react";
import { Heart, ScrollText } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/hooks";
import { goTo } from "@/components/ui/Chrome";

/**
 * الخاتمة — «ما بقي في الذاكرة»
 * مشهد ختامي مثبَّت: العبارات تظهر وتختفي مع التمرير، ثم الاعتمادات.
 */

const LINES = [
  "بعض الأيام لا تُروى كخبر…",
  "بل تبقى في الذاكرة.",
  "6 أكتوبر 1973",
  "ذاكرة وطن.",
];

export default function Finale() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.querySelector(".finale-stage"),
          start: "top top",
          end: "+=320%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      LINES.forEach((_, i) => {
        const sel = `.finale-line-${i}`;
        tl.fromTo(
          sel,
          { opacity: 0, y: 44, filter: "blur(10px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 },
          i * 2
        );
        if (i < LINES.length - 1) {
          tl.to(
            sel,
            { opacity: 0, y: -40, filter: "blur(10px)", duration: 1 },
            i * 2 + 1.3
          );
        }
      });
      tl.to({}, { duration: 0.8 });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="finale"
      className="relative"
      aria-label="الخاتمة — ما بقي في الذاكرة"
    >
      {/* المشهد المثبَّت */}
      <div className="finale-stage relative flex h-svh min-h-[600px] items-center justify-center overflow-hidden bg-ink">
        {/* أشرطة سينمائية */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-black/70" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-black/70" aria-hidden="true" />

        {reduced ? (
          <div className="space-y-8 px-6 text-center">
            {LINES.map((line, i) => (
              <p
                key={line}
                className={`font-display leading-[1.7] text-paper ${
                  i === 2
                    ? "font-mono-x text-glow-gold text-3xl font-medium tracking-[0.12em] text-gold-bright md:text-6xl"
                    : "text-3xl font-bold md:text-6xl"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          LINES.map((line, i) => (
            <p
              key={line}
              className={`finale-line-${i} font-display absolute px-6 text-center leading-[1.7] text-paper opacity-0 ${
                i === 2
                  ? "font-mono-x text-glow-gold text-4xl font-medium tracking-[0.12em] text-gold-bright md:text-7xl"
                  : "text-4xl font-bold md:text-7xl"
              }`}
            >
              {line}
            </p>
          ))
        )}

        <p className="font-mono-x absolute bottom-24 text-[10px] tracking-[0.18em] text-mute/60">
          الخاتمة — بعد تسعة فصول
        </p>
      </div>

      {/* الاعتمادات */}
      <div className="relative border-t border-line bg-night py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <Reveal>
            <p className="font-mono-x text-xs tracking-[0.2em] text-gold/70">
              هذا الأرشيف محاولة رقمية لحفظ القصة
            </p>
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-mute md:text-base">
              كل مادة هنا تحمل مصدرها وحقوقها، وكل لقطة تفسيرية موسومة بصراحة بما هي عليه —
              لأن الدقة عندنا تسبق المؤثر.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="hairline mx-auto mt-12 w-40" />
            <div className="mt-10 grid gap-10 sm:grid-cols-2">
              {[
                { name: "Mohamed Omar", role: "فكرة وتطوير" },
                { name: "Hany Khaled", role: "فكرة وتطوير" },
              ].map((m) => (
                <figure key={m.name}>
                  <figcaption className="font-mono-x text-[10px] tracking-[0.35em] text-mute/70">
                    {m.role}
                  </figcaption>
                  <p className="font-display mt-2 text-3xl font-bold tracking-wide text-paper md:text-4xl">
                    {m.name}
                  </p>
                </figure>
              ))}
            </div>
          </Reveal>

          <Reveal delay={340}>
            <button
              type="button"
              onClick={() => goTo("#top")}
              className="mx-auto mt-14 flex items-center gap-3 border border-gold/40 px-8 py-3.5 text-[12px] tracking-wide text-gold-bright transition-all duration-500 hover:border-gold hover:bg-gold/10 hover:shadow-[0_0_28px_rgba(207,166,79,0.25)]"
            >
              <ScrollText size={14} />
              العودة إلى بداية الأرشيف
            </button>
          </Reveal>

          <Reveal variant="fade" delay={420}>
            <p className="mt-16 flex items-center justify-center gap-2 text-[11px] leading-6 text-mute/50">
              <Heart size={11} className="text-gold/50" />
              «حين عبرت مصر» — مشروع أرشيف رقمي تفاعلي، 1973–2026
            </p>
            <p className="font-mono-x mt-3 text-center text-[9px] tracking-[0.25em] text-mute/40">
              من طلاب مدرسة WE للتكنولوجيا التطبيقية
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
