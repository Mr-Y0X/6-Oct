import { useEffect, useRef, useState } from "react";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { gsap } from "@/lib/gsap";
import { audioManager } from "@/audio/audioManager";
import { useFinePointer, useReducedMotion } from "@/hooks/hooks";

/* ------------------------------------------------------------ */
/* شريط تقدم التمرير                                            */
/* ------------------------------------------------------------ */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const p = max > 0 ? window.scrollY / max : 0;
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${p})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] h-[2px] bg-white/[0.04]"
      role="progressbar"
      aria-label="تقدم القراءة"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-right bg-gradient-to-l from-gold via-gold-bright to-gold shadow-[0_0_12px_rgba(207,166,79,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------ */
/* الترويسة المصغرة                                               */
/* ------------------------------------------------------------ */
const NAV = [
  { href: "#chapter-01", label: "القصة" },
  { href: "#timeline", label: "الخط الزمني" },
  { href: "#map", label: "الخريطة" },
  { href: "#people", label: "الشخصيات" },
  { href: "#archive", label: "الأرشيف" },
  { href: "#gallery", label: "المعرض" },
  { href: "#memory", label: "الذاكرة" },
  { href: "#archive", label: "الوثائق", tab: "document" },
];

export function goTo(hash: string, tab?: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  audioManager.play("whoosh");
  gsap.to(window, {
    scrollTo: { y: el as Element, offsetY: 0 },
    duration: 1.6,
    ease: "power3.inOut",
    onStart: () => {
      if (tab) window.dispatchEvent(new CustomEvent("archive:tab", { detail: tab }));
    },
  });
}

function SoundToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "كتم الصوت" : "تشغيل الصوت — يبدأ بالنشيد الوطني"}
      onClick={async () => {
        const next = !on;
        await audioManager.setEnabled(next);
        setOn(audioManager.enabled);
        if (audioManager.enabled) {
          /* النشيد الوطني تحيةً للذكرى عند أول تفعيل */
          audioManager.playAnthem();
        } else {
          audioManager.stopAnthem();
        }
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border transition-all duration-300",
        on
          ? "border-gold/60 text-gold shadow-[0_0_14px_rgba(207,166,79,0.35)]"
          : "border-line text-mute hover:border-gold/40 hover:text-paper"
      )}
    >
      {on ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[95] transition-all duration-700",
          scrolled
            ? "border-b border-white/[0.05] bg-ink/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 md:px-10">
          <button
            type="button"
            onClick={() => goTo("#top")}
            className="font-display text-lg font-bold tracking-wide text-paper transition-colors hover:text-gold-bright"
            aria-label="حين عبرت مصر — العودة للبداية"
          >
            <span className="text-gold">◦</span> حين عبرت مصر
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
            {NAV.map((n) => (
              <button
                key={n.label}
                type="button"
                onClick={() => goTo(n.href, n.tab)}
                className="group relative py-2 text-[13px] text-mute transition-colors duration-300 hover:text-paper"
              >
                {n.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-right scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SoundToggle />
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition-colors hover:border-gold/40 hover:text-paper lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="فتح القائمة"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* قائمة الجوال */}
      <div
        className={cn(
          "fixed inset-0 z-[110] flex flex-col bg-ink/[0.98] backdrop-blur-md transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-display text-lg font-bold text-paper">حين عبرت مصر</span>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col items-start justify-center gap-2 overflow-y-auto px-8 py-6" aria-label="تنقل الجوال">
          {NAV.map((n, i) => (
            <button
              key={n.label}
              type="button"
              onClick={() => {
                setOpen(false);
                window.setTimeout(() => goTo(n.href, n.tab), 120);
              }}
              className={cn(
                "font-display flex items-baseline gap-4 py-2 text-3xl text-paper/85 transition-all duration-500 hover:text-gold-bright",
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              )}
              style={{ transitionDelay: `${120 + i * 60}ms` }}
            >
              <span className="font-mono-x text-xs text-gold/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {n.label}
            </button>
          ))}
        </nav>
        <p className="font-mono-x px-8 pb-10 text-[10px] tracking-[0.3em] text-mute/60">
          6 أكتوبر 1973 — أرشيف تفاعلي
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ */
/* مؤشر مخصص — نقطة وتوهج متباين                                */
/* ------------------------------------------------------------ */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let visible = !document.hidden;

    const onVis = () => {
      visible = !document.hidden;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      setActive(!!t.closest("button, a, [role='button'], input, [data-cursor]"));
    };
    const loop = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      rx += (x - rx) * 0.14;
      ry += (y - ry) * 0.14;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf);
      raf = 0;
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[130] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gold mix-blend-screen"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[130] -ml-5 -mt-5 h-10 w-10 rounded-full border transition-all duration-300",
          active ? "scale-125 border-gold/70" : "scale-100 border-gold/25"
        )}
        aria-hidden="true"
      />
    </>
  );
}

/* ------------------------------------------------------------ */
/* زر ذهبي — تأثير مغناطيسي خفيف                                */
/* ------------------------------------------------------------ */
export function GoldButton({
  children,
  onClick,
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  const magnetic = (e: React.PointerEvent) => {
    if (!fine || reduced || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    btnRef.current.style.transform = `translate3d(${dx * 10}px, ${dy * 6}px, 0)`;
  };
  const release = () => {
    if (btnRef.current) btnRef.current.style.transform = "translate3d(0,0,0)";
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      onPointerMove={magnetic}
      onPointerLeave={release}
      className={cn(
        "group relative inline-flex items-center gap-3 overflow-hidden border border-gold/50 bg-gold/[0.06] px-9 py-4 text-sm font-semibold tracking-wide text-gold-bright transition-[border-color,box-shadow,background] duration-500 hover:border-gold hover:bg-gold/[0.12] hover:shadow-[0_0_36px_rgba(207,166,79,0.28)]",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-gold/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative">{children}</span>
    </button>
  );
}
