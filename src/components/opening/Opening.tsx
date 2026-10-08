import { useEffect, useRef, useState } from "react";
import { ChevronDown, FastForward } from "lucide-react";
import { cn } from "@/utils/cn";
import { gsap } from "@/lib/gsap";
import { GoldButton } from "@/components/ui/Chrome";
import { audioManager } from "@/audio/audioManager";
import { useReducedMotion, useTickSecond, useTypewriter } from "@/hooks/hooks";
import { COUNTDOWN_LABEL, WAR_DATE_LABEL, ZERO_HOUR_LABEL } from "@/data/timeline";
import { to12h } from "@/utils/time";

type Phase =
  | "black"
  | "pulse"
  | "date"
  | "clock"
  | "type1"
  | "type2"
  | "blackout"
  | "ready";

const PHRASE_1 = "في لحظةٍ واحدة…";
const PHRASE_2 = "تغيّر كل شيء.";

export default function Opening() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("black");
  const [leaving, setLeaving] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const barTopRef = useRef<HTMLDivElement | null>(null);
  const barBotRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /* ------------------------------------------------- آلة الحالات الزمنية */
  useEffect(() => {
    if (reduced) {
      setPhase("ready");
      return;
    }
    switch (phase) {
      case "black":
        later(() => setPhase("pulse"), 800);
        break;
      case "pulse":
        audioManager.play("pulse");
        later(() => setPhase("date"), 1700);
        break;
      case "date":
        later(() => setPhase("clock"), 2400);
        break;
      case "clock":
        later(() => setPhase("type1"), 2900);
        break;
      case "blackout":
        /* الانتقال إلى البطل يُدار هنا — لا تُعشّش later داخل مؤقت آخر
           لأن تنظيف المؤقتات عند تغيّر المرحلة كان يمسحه ويعلّق المشهد. */
        later(() => setPhase("ready"), 520);
        break;
      default:
        break;
    }
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [phase, reduced]);

  /* شبكة أمان: الافتتاحية لا تعلق أبدًا — مهما حدث ننتقل للبطل */
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setPhase("ready"), 20000);
    return () => window.clearTimeout(t);
  }, [reduced]);

  /* ------------------------------------------------- الآلة الكاتبة */
  const t1 = useTypewriter(PHRASE_1, {
    active: phase === "type1",
    speed: 70,
    reduced,
    onChar: () => audioManager.play("type"),
    onDone: () => later(() => setPhase("type2"), 700),
  });
  const t2 = useTypewriter(PHRASE_2, {
    active: phase === "type2",
    speed: 78,
    reduced,
    onChar: () => audioManager.play("type"),
    onDone: () => later(() => setPhase("blackout"), 1250),
  });

  /* ------------------------------------------------- نبض الساعة */
  const clockRunning = phase === "clock" || phase.startsWith("type") || phase === "blackout";
  const second = useTickSecond(clockRunning, reduced);
  useEffect(() => {
    if (clockRunning && !reduced) audioManager.play("tick");
  }, [second, clockRunning, reduced]);

  /* ------------------------------------------------- حركة الصورة البطيئة */
  const ready = phase === "ready";
  useEffect(() => {
    if (!ready || reduced || !imgRef.current) return;
    const tween = gsap.to(imgRef.current, {
      scale: 1.12,
      duration: 36,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, [ready, reduced]);

  const skip = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPhase("ready");
  };

  /* ------------------------------------------------- الانتقال السينمائي */
  const beginJourney = () => {
    if (leaving) return;
    setLeaving(true);
    audioManager.play("whoosh");
    const top = barTopRef.current;
    const bot = barBotRef.current;
    const target = document.querySelector("#chapter-01");
    if (!top || !bot || !target) {
      setLeaving(false);
      return;
    }
    gsap.set([top, bot], { scaleY: 0 });
    const tl = gsap.timeline({
      onComplete: () => setLeaving(false),
    });
    tl.to([top, bot], { scaleY: 1, duration: 0.65, ease: "power3.inOut" }, 0)
      .to(
        sectionRef.current,
        { opacity: 0.25, filter: "blur(6px)", duration: 0.7 },
        0
      )
      .add(
        gsap.to(window, {
          scrollTo: { y: target as Element, offsetY: 0 },
          duration: reduced ? 0.01 : 1.9,
          ease: "power3.inOut",
        }),
        0.6
      )
      .to(sectionRef.current, { opacity: 1, filter: "blur(0px)", duration: 0.5 }, 2.15)
      .to([top, bot], { scaleY: 0, duration: 0.75, ease: "power3.inOut" }, 2.3);
  };

  const showSequence = !ready;
  const clockVisible =
    phase === "clock" || phase === "type1" || phase === "type2" || phase === "blackout";

  /* مؤشر تقدم مراحل الافتتاحية */
  const SEQ_STAGES: Phase[] = ["pulse", "date", "clock", "type1", "ready"];
  const seqIdx = Math.max(
    0,
    SEQ_STAGES.indexOf(phase === "type2" || phase === "blackout" ? "type1" : phase)
  );

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex h-svh min-h-[620px] flex-col overflow-hidden"
      aria-label="افتتاحية التجربة — 6 أكتوبر 1973"
    >
      {/* الخلفية الحية */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-[2200ms]",
          ready ? "opacity-100" : "opacity-0"
        )}
      >
        <img
          ref={imgRef}
          src="/images/hero-bg.jpg"
          alt=""
          className="h-full w-full scale-105 object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/70" />
      </div>

      {/* ====== مراحل الافتتاحية ====== */}
      {showSequence && (
        <div className="absolute inset-0 z-10 bg-ink" aria-hidden={ready}>
          {/* نبضة البداية */}
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700",
              phase === "pulse" ? "opacity-100" : "opacity-0"
            )}
          >
            <span className="block h-px w-28 bg-gold/80 shadow-[0_0_24px_rgba(207,166,79,0.9)]" />
            <span className="mx-auto mt-3 block h-1 w-1 animate-ping rounded-full bg-gold" />
          </div>

          {/* التاريخ */}
          <h1
            className={cn(
              "font-display absolute left-1/2 top-[38%] w-full -translate-x-1/2 px-6 text-center text-4xl font-bold tracking-wide text-paper transition-all duration-[1400ms] md:text-6xl",
              phase === "date"
                ? "translate-y-0 opacity-100 blur-0"
                : phase === "black" || phase === "pulse"
                  ? "translate-y-4 opacity-0 blur-sm"
                  : "opacity-0"
            )}
          >
            <span className="mx-auto mb-5 block h-px w-24 bg-gradient-to-l from-transparent via-gold/70 to-transparent" />
            <span className="text-glow-gold">{WAR_DATE_LABEL}</span>
            <span className="font-mono-x mt-4 block text-xs font-normal tracking-[0.2em] text-mute">
              ١٠ رمضان ١٣٩٣ﻫ
            </span>
            <span className="mx-auto mt-5 block h-px w-24 bg-gradient-to-l from-transparent via-gold/70 to-transparent" />
          </h1>

          {/* الساعة */}
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000",
              clockVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="relative grid place-items-center">
              {/* حلقة الثواني */}
              <svg
                viewBox="0 0 200 200"
                className="absolute h-64 w-64 md:h-80 md:w-80"
                aria-hidden="true"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="rgba(207,166,79,0.14)"
                  strokeWidth="1"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="none"
                  stroke="rgba(207,166,79,0.85)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeDasharray={`${(second / 60) * 578} 578`}
                  transform="rotate(-90 100 100)"
                  className="transition-[stroke-dasharray] duration-1000 ease-linear"
                  style={{ filter: "drop-shadow(0 0 6px rgba(207,166,79,0.8))" }}
                />
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={100 + Math.sin(a) * 84}
                      y1={100 - Math.cos(a) * 84}
                      x2={100 + Math.sin(a) * 88}
                      y2={100 - Math.cos(a) * 88}
                      stroke="rgba(207,166,79,0.4)"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>

              <div className="text-center">
                <p
                  className={cn(
                    "font-mono-x font-medium tracking-[0.08em] text-paper transition-all duration-500 md:text-6xl text-5xl",
                    clockVisible && "text-glow-gold"
                  )}
                >
                  {to12h(COUNTDOWN_LABEL).split(" ")[0]}{" "}
                  <span className="align-middle text-xl text-gold/80 md:text-2xl">
                    {to12h(COUNTDOWN_LABEL).split(" ")[1]}
                  </span>
                </p>
                <p className="font-mono-x mt-3 text-[10px] tracking-[0.2em] text-mute">
                  توقيت القاهرة — الجبهة صامتة
                  <span className={cn("mr-3 inline-block h-1.5 w-1.5 rounded-full align-middle transition-colors duration-300", second % 2 === 0 ? "bg-gold shadow-[0_0_8px_rgba(207,166,79,0.9)]" : "bg-line")} />
                </p>
              </div>
            </div>
          </div>

          {/* عبارات الآلة الكاتبة */}
          <p
            className={cn(
              "font-display text-glow-gold absolute left-1/2 top-[68%] w-full -translate-x-1/2 px-6 text-center text-3xl leading-relaxed text-paper/95 md:text-5xl",
              phase === "type1" || phase === "type2"
                ? "opacity-100 transition-opacity duration-500"
                : "opacity-0 transition-opacity duration-300"
            )}
            role="status"
          >
            {phase === "type2" ? (
              <span className="text-gold-bright [animation:glitch-in_.3s_steps(3)]">
                {t2.out}
              </span>
            ) : (
              t1.out
            )}
            {(phase === "type1" || phase === "type2") && <span className="type-caret" />}
          </p>

          {/* تعتيم سريع */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-black transition-opacity duration-300",
              phase === "blackout" ? "opacity-100" : "opacity-0"
            )}
          />

          {/* مؤشر التقدم + تخطي */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-2 transition-opacity duration-500",
                phase === "black" ? "opacity-0" : "opacity-100"
              )}
              aria-hidden="true"
            >
              {SEQ_STAGES.map((s, i) => (
                <span
                  key={s}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    i < seqIdx
                      ? "w-6 bg-gold/80"
                      : i === seqIdx
                        ? "w-6 animate-pulse bg-gold-bright shadow-[0_0_10px_rgba(207,166,79,0.8)]"
                        : "w-2 bg-line"
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={skip}
              className={cn(
                "font-mono-x flex items-center gap-2 border border-line px-5 py-2 text-[11px] tracking-[0.25em] text-mute transition-all duration-500 hover:border-gold/50 hover:text-paper",
                phase === "black" ? "opacity-0" : "opacity-100"
              )}
            >
              <FastForward size={12} />
              تخطي المقدمة
            </button>
          </div>
        </div>
      )}

      {/* ====== حالة البطل (Hero) ====== */}
      <div
        className={cn(
          "relative z-10 flex h-full flex-col items-center justify-center px-6 text-center transition-opacity duration-1000",
          ready ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {/* شريط معلومات علوي */}
        <div
          className={cn(
            "font-mono-x absolute top-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] tracking-[0.18em] text-mute transition-all delay-[900ms] duration-1000 md:top-24",
            ready ? "opacity-100" : "opacity-0"
          )}
        >
          <span>{WAR_DATE_LABEL}</span>
          <span className="text-gold">◦</span>
          <span>
            {to12h(ZERO_HOUR_LABEL)} — ساعة الصفر
          </span>
          <span className="text-gold">◦</span>
          <span>جبهة قناة السويس</span>
        </div>

        <div className="overflow-hidden py-4">
          <h1
            className={cn(
              "font-display text-glow-gold text-7xl font-bold leading-[1.15] text-paper transition-all duration-[1500ms] ease-[cubic-bezier(0.22,0.8,0.24,1)] md:text-[9rem] md:leading-[1.1]",
              ready ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}
          >
            حين عبرت <span className="text-gold">مصر</span>
          </h1>
        </div>

        <p
          className={cn(
            "font-plex mt-2 max-w-xl text-base font-light leading-8 text-paper-dim transition-all delay-300 duration-1000 md:text-lg",
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          6 أكتوبر 1973 — يومٌ لم يكن مجرد تاريخ.
          <span className="mt-1 block text-sm text-mute">
            أرشيف رقمي تفاعلي يعيد سرد قصة يومٍ غيّر مجرى التاريخ.
          </span>
          <span className="font-mono-x mt-4 inline-block border border-gold/30 bg-ink/60 px-4 py-1.5 text-[10px] tracking-[0.3em] text-gold/80 backdrop-blur-sm">
            ٩ فصول · خط زمني · خريطة · أرشيف موثق
          </span>
        </p>

        <div
          className={cn(
            "mt-10 transition-all delay-[600ms] duration-1000",
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <GoldButton onClick={beginJourney} ariaLabel="ابدأ الرحلة إلى الفصل الأول">
            <span>ابدأ الرحلة</span>
            <ChevronDown size={15} className="transition-transform duration-500 group-hover:translate-y-0.5" />
          </GoldButton>
        </div>

        {/* مؤشر التمرير */}
        <div
          className={cn(
            "absolute bottom-8 flex flex-col items-center gap-3 transition-opacity delay-[1100ms] duration-1000",
            ready ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="font-mono-x text-[9px] tracking-[0.18em] text-mute">
            مرّر داخل الأرشيف
          </span>
          <span className="scroll-hint-line block h-14 w-px bg-white/10" />
        </div>

        {/* مؤشر الفصول الجانبي */}
        <div
          className={cn(
            "font-mono-x absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 text-[10px] tracking-[0.3em] text-mute/70 transition-opacity delay-[1300ms] duration-1000 md:flex",
            ready ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <span className="text-gold">٠١</span>
          <span className="h-16 w-px bg-line" />
          <span>٠٩</span>
        </div>
      </div>

      {/* أشرطة الانتقال السينمائي */}
      <div
        ref={barTopRef}
        className="fixed inset-x-0 top-0 z-[120] h-1/2 origin-top bg-black"
        style={{ transform: "scaleY(0)" }}
        aria-hidden="true"
      />
      <div
        ref={barBotRef}
        className="fixed inset-x-0 bottom-0 z-[120] h-1/2 origin-bottom bg-black"
        style={{ transform: "scaleY(0)" }}
        aria-hidden="true"
      />

      <style>{`@keyframes glitch-in{0%{opacity:0;transform:translateX(6px);clip-path:inset(0 0 55% 0)}50%{opacity:.6;transform:translateX(-4px);clip-path:inset(40% 0 10% 0)}100%{opacity:1;transform:none;clip-path:none}}`}</style>
    </section>
  );
}
