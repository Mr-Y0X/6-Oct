import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ChapterHeading, Reveal } from "@/components/ui/Reveal";
import ChapterMedia from "@/components/media/ChapterMedia";
import { useReducedMotion } from "@/hooks/hooks";
import { to12h } from "@/utils/time";

/**
 * الفصل الثاني — «الساعة 01:58 م»
 * مشهد مثبَّت: التمرير يحرّك الدقائق من 01:58 م حتى 02:00 م — ساعة الصفر.
 */

const RING_R = 140;
const RING_C = 2 * Math.PI * RING_R;

export default function Chapter02() {
  const rootRef = useRef<HTMLElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const proxy = { m: 58 };
      const mins = root.querySelector<HTMLElement>(".js-min");
      const ring = root.querySelector<SVGCircleElement>(".js-ring");

      const renderMin = (s24: string) => {
        const [t, p] = to12h(s24).split(" ");
        return `${t} <span class="align-middle text-lg text-gold/80 md:text-xl">${p ?? ""}</span>`;
      };
      const applyTime = () => {
        const v = Math.floor(proxy.m);
        if (mins) {
          mins.innerHTML =
            v < 60 ? renderMin(`13:${String(v).padStart(2, "0")}`) : renderMin("14:00");
        }
        if (ring) {
          const p = Math.min(1, Math.max(0, (proxy.m - 58) / 2));
          ring.style.strokeDasharray = `${p * RING_C} ${RING_C}`;
        }
      };
      applyTime();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=280%",
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        ".c2-a",
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.7 },
        0
      )
        .to(
          proxy,
          { m: 102, duration: 4.4, ease: "none", onUpdate: applyTime },
          0
        )
        .to(".c2-a", { opacity: 0, y: -24, duration: 0.55 }, 1.35)
        .fromTo(
          ".c2-b",
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.7 },
          1.6
        )
        .to(".c2-b", { opacity: 0, y: -24, duration: 0.55 }, 2.75)
        .to(flashRef.current, { opacity: 0.95, duration: 0.1 }, 3.42)
        .to(flashRef.current, { opacity: 0, duration: 0.35 }, 3.54)
        .fromTo(
          ".c2-zero",
          { opacity: 0, scale: 0.94, filter: "blur(10px)" },
          { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.9 },
          3.6
        )
        .fromTo(
          ".c2-c",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          4.35
        )
        .to({}, { duration: 0.5 });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="chapter-02"
      className="relative overflow-hidden"
      aria-label="الفصل الثاني — الساعة 01:58 م"
    >
      <div className="relative flex h-svh min-h-[640px] flex-col">

        {/* توهج مركزي */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(207,166,79,0.09), transparent)",
          }}
          aria-hidden="true"
        />

        {/* ومضة ساعة الصفر */}
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 48%, rgba(236,210,143,0.5), rgba(176,114,46,0.22) 55%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col px-6 pt-24 md:pt-28">
          <ChapterHeading
            no={2}
            kicker="الفصل الثاني"
            title="الساعة 01:58 م"
            lead="دقيقتان بين الصمت ومطلع التاريخ. مرّر ببطء — ودَع الساعة تتحرك."
            className="max-w-2xl"
          />

          {/* المسرح */}
          <div className="relative grid flex-1 place-items-center">
            {/* الساعة الكبرى */}
            <div className={`c2-a relative place-items-center ${reduced ? "hidden" : "grid"}`}>
              <svg viewBox="0 0 320 320" className="h-[300px] w-[300px] md:h-[420px] md:w-[420px]" aria-hidden="true">
                <circle cx="160" cy="160" r={RING_R} fill="none" stroke="rgba(207,166,79,0.12)" strokeWidth="1" />
                <circle
                  className="js-ring"
                  cx="160"
                  cy="160"
                  r={RING_R}
                  fill="none"
                  stroke="rgba(236,210,143,0.9)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray={`0 ${RING_C}`}
                  transform="rotate(-90 160 160)"
                  style={{ filter: "drop-shadow(0 0 8px rgba(207,166,79,0.7))" }}
                />
                {Array.from({ length: 60 }).map((_, i) => {
                  const a = (i * 6 * Math.PI) / 180;
                  const main = i % 5 === 0;
                  const r1 = main ? 148 : 151;
                  return (
                    <line
                      key={i}
                      x1={160 + Math.sin(a) * r1}
                      y1={160 - Math.cos(a) * r1}
                      x2={160 + Math.sin(a) * 154}
                      y2={160 - Math.cos(a) * 154}
                      stroke={main ? "rgba(207,166,79,0.5)" : "rgba(207,166,79,0.18)"}
                      strokeWidth={main ? 1.4 : 1}
                    />
                  );
                })}
              </svg>
              <div className="absolute text-center">
                <p className="js-min font-mono-x text-glow-gold text-5xl font-medium tracking-[0.06em] text-paper md:text-6xl">
                  01:58 <span className="align-middle text-lg text-gold/80 md:text-xl">م</span>
                </p>
                <p className="font-mono-x mt-4 text-[10px] tracking-[0.2em] text-mute">
                  الجبهة صامتة
                </p>
              </div>
            </div>

            {/* العبارة الوسيطة */}
            <div className={`c2-b absolute inset-0 grid place-items-center ${reduced ? "hidden" : "opacity-0"}`}>
              <div className="text-center">
                <p className="font-display text-3xl leading-[1.8] text-paper/95 md:text-5xl">
                  الدقائق الأخيرة تمرّ كأنها سنوات.
                </p>
                <p className="font-mono-x mt-5 text-[11px] tracking-[0.2em] text-gold/70">
                  انتظار الإشارة
                </p>
              </div>
            </div>

            {/* ساعة الصفر */}
            <div className={`c2-zero absolute inset-0 grid place-items-center ${reduced ? "" : "opacity-0"}`}>
              <div className="text-center">
                <p className="font-mono-x text-glow-gold text-5xl font-medium tracking-[0.05em] text-gold-bright md:text-7xl">
                  02:00 <span className="align-middle text-xl text-gold/80 md:text-2xl">م</span>
                </p>
                <p className="font-display mt-3 text-3xl font-bold text-paper md:text-5xl">
                  ساعة الصفر
                </p>
              </div>
            </div>

            {/* النتيجة */}
            <div className={`c2-c absolute inset-x-0 bottom-4 md:bottom-8 ${reduced ? "" : "opacity-0"}`}>
              <div className="mx-auto max-w-2xl text-center">
                <div className="hairline mx-auto mb-6 w-40" />
                <p className="font-display text-2xl leading-[1.9] text-paper/95 md:text-3xl">
                  عبرت الضربة الجوية الأولى السماء نحو سيناء،
                  <br />
                  وتزامن معها القصف المدفعي التمهيدي على الضفة الشرقية.
                </p>
                <p className="font-mono-x mt-4 text-[10px] tracking-[0.35em] text-mute">
                  توزيع زمني مقتضب — كما وثّقته بيانات الأرشيف
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مواد الفصل — صور الساعات الأولى والتسجيلات */}
      <div className="relative mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <Reveal variant="up">
          <ChapterMedia chapter="02" limit={4} title="صور الساعات الأولى والتسجيلات — من مواد هذا الفصل" />
        </Reveal>
      </div>
    </section>
  );
}
