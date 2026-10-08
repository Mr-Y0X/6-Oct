import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Compass, MousePointerClick } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/utils/cn";
import { ChapterHeading, Reveal, toArabicDigits } from "@/components/ui/Reveal";
import ChapterMedia from "@/components/media/ChapterMedia";
import { to12h } from "@/utils/time";
import {
  FALLBACK_FOCUS,
  mapMarkers,
  timelineEvents,
} from "@/data/timeline";
import type { MapMarker } from "@/data/types";

/**
 * الفصل الرابع — «على امتداد القناة»
 * خريطة SVG تاريخية مأسلبة (توضيحية) + خط زمني تفاعلي متزامن.
 */

const ARROWS = [
  { id: "arrow-n", d: "M 300 300 L 414 300", from: 2 },
  { id: "arrow-m", d: "M 282 470 L 398 470", from: 2 },
  { id: "arrow-s", d: "M 305 640 L 419 640", from: 6 },
];

function MarkerGlyph({
  m,
  active,
  onClick,
}: {
  m: MapMarker;
  active: boolean;
  onClick: (id: string) => void;
}) {
  const isCity = m.kind === "city";
  const showLabel = isCity || active;
  return (
    <g
      transform={`translate(${m.x}, ${m.y})`}
      onClick={() => onClick(m.id)}
      className="cursor-pointer"
      role="button"
      aria-label={m.label}
    >
      {active && <circle r={13} fill="none" stroke="#ecd28f" strokeWidth="1.4" className="marker-pulse" />}
      {isCity ? (
        <circle r={active ? 5 : 3.4} fill={active ? "#ecd28f" : "#8a94a0"} />
      ) : m.kind === "fort" ? (
        <rect
          x={-5}
          y={-5}
          width={10}
          height={10}
          transform="rotate(45)"
          fill={active ? "#ecd28f" : "#b0722e"}
          stroke="#06090d"
          strokeWidth="1"
        />
      ) : m.kind === "crossing" ? (
        <circle r={active ? 7 : 4.5} fill={active ? "#ecd28f" : "#cfa64f"} stroke="#06090d" strokeWidth="1.2" />
      ) : (
        <path
          d="M0,-6 L2,-2 L6,-2 L3,1 L4,5 L0,3 L-4,5 L-3,1 L-6,-2 L-2,-2 Z"
          fill={active ? "#ecd28f" : "#6b7150"}
          stroke="#06090d"
          strokeWidth="0.6"
        />
      )}
      {showLabel && (
        <text
          x={m.bank === "west" ? -12 : 12}
          y={5}
          textAnchor={m.bank === "west" ? "end" : "start"}
          fill={active ? "#ecd28f" : "#c9c2b0"}
          fontSize={isCity ? 17 : 19}
          fontWeight={active ? 700 : 400}
          style={{
            fontFamily: "Cairo, sans-serif",
            paintOrder: "stroke",
            stroke: "rgba(6,9,13,0.9)",
            strokeWidth: 4,
          }}
        >
          {m.label}
        </text>
      )}
      <circle r={22} fill="transparent" />
    </g>
  );
}

export default function Chapter04Map() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const active = timelineEvents[activeIdx];
  /* طبقات العرض التدريجي — قناة / ضفتان / عبور / كباري / بارليف / حركة */
  const [layers, setLayers] = useState({
    canal: true,
    west: true,
    east: true,
    crossings: true,
    bridgeheads: true,
    barlev: true,
    movement: true,
  });
  const toggleLayer = (k: keyof typeof layers) =>
    setLayers((l) => ({ ...l, [k]: !l[k] }));

  const focusId = useMemo(() => {
    const raw = active.mapFocus ?? "";
    return FALLBACK_FOCUS[raw] ?? raw;
  }, [active]);

  /* مزامنة التمرير: بطاقة الحدث تفعّل نقطة الخريطة */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      timelineEvents.forEach((ev, i) => {
        const card = root.querySelector(`#card-${ev.id}`);
        if (!card) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top 58%",
          end: "bottom 42%",
          onToggle: (st) => {
            if (st.isActive) setActiveIdx(i);
          },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const activateFromMap = (markerId: string) => {
    const idx = timelineEvents.findIndex((e) => {
      const raw = e.mapFocus ?? "";
      return (FALLBACK_FOCUS[raw] ?? raw) === markerId;
    });
    if (idx >= 0) {
      setActiveIdx(idx);
      const card = document.querySelector(`#card-${timelineEvents[idx].id}`);
      if (card && window.innerWidth < 1024) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const arrowsVisible = (from: number) => activeIdx >= from;

  return (
    <section
      ref={rootRef}
      id="map"
      className="relative overflow-hidden bg-night py-28 md:py-36"
      aria-label="الفصل الرابع — على امتداد القناة"
    >
      <div className="noise-bg pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <ChapterHeading
          no={4}
          kicker="الفصل الرابع"
          title="على امتداد القناة"
          lead="خريطة توضيحية لمحور قناة السويس تتحرّك مع الخط الزمني: مرّر بين الأحداث أو المس نقاط الخريطة مباشرة."
        />

        <div id="timeline" className="mt-16 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-14">
          {/* الخريطة */}
          <div className="lg:order-2">
            <div className="lg:sticky lg:top-24">
              <Reveal variant="fade">
                <div className="plate corner-frame relative overflow-hidden">
                  {/* شريط علوي كارتوغرافي */}
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                    <span className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-gold/70">
                      <Compass size={12} />
                      لوحة توضيحية — جبهة القناة
                    </span>
                    <span className="font-mono-x text-[9px] tracking-[0.2em] text-mute/70">
                      29°58′N — 32°33′E
                    </span>
                  </div>

                  {/* مفاتيح الطبقات التدريجية */}
                  <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2.5" role="group" aria-label="طبقات الخريطة">
                    {(
                      [
                        ["canal", "القناة"],
                        ["west", "الغربية"],
                        ["east", "الشرقية"],
                        ["crossings", "العبور"],
                        ["bridgeheads", "الكباري"],
                        ["barlev", "بارليف"],
                        ["movement", "الحركة"],
                      ] as const
                    ).map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggleLayer(k)}
                        aria-pressed={layers[k]}
                        className={cn(
                          "border px-2.5 py-1 text-[10px] transition-colors",
                          layers[k]
                            ? "border-gold/60 bg-gold/10 text-gold-bright"
                            : "border-line text-mute/60 hover:text-paper"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <svg
                    viewBox="0 0 800 1000"
                    className="block h-[56svh] min-h-[420px] w-full lg:h-[72vh]"
                    role="img"
                    aria-label="خريطة توضيحية لمحور قناة السويس ونقاط العبور"
                  >
                    <defs>
                      <linearGradient id="westG" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0e1913" />
                        <stop offset="100%" stopColor="#0a1210" />
                      </linearGradient>
                      <linearGradient id="eastG" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#181409" />
                        <stop offset="100%" stopColor="#100d07" />
                      </linearGradient>
                      <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2c4157" />
                        <stop offset="100%" stopColor="#22364a" />
                      </linearGradient>
                      <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 z" fill="#ecd28f" />
                      </marker>
                      <pattern id="mgrid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M60 0H0V60" fill="none" stroke="rgba(207,166,79,0.06)" strokeWidth="0.6" />
                      </pattern>
                    </defs>

                    {/* خلفية وشبكة */}
                    <rect width="800" height="1000" fill="#0b0e10" />
                    <rect width="800" height="1000" fill="url(#mgrid)" />

                    {/* الضفتان */}
                    <g opacity={layers.west ? 1 : 0.12} className="transition-opacity duration-500">
                    <path
                      d="M 0 30 L 322 52 C 312 180, 300 280, 296 410 C 293 490, 298 560, 312 620 C 328 705, 342 810, 356 890 L 362 1000 L 0 1000 Z"
                      fill="url(#westG)"
                    />
                    </g>
                    <g opacity={layers.east ? 1 : 0.12} className="transition-opacity duration-500">
                    <path
                      d="M 800 30 L 438 52 C 428 180, 416 280, 410 410 C 406 490, 412 560, 426 622 C 442 710, 456 814, 466 892 L 472 1000 L 800 1000 Z"
                      fill="url(#eastG)"
                    />
                    </g>

                    {/* القناة */}
                    <g opacity={layers.canal ? 1 : 0.12} className="transition-opacity duration-500">
                    <path
                      d="M 380 112 C 366 200, 340 260, 334 320 C 328 390, 312 440, 320 486 C 326 528, 320 566, 330 606 C 344 668, 356 760, 372 838 C 378 868, 380 884, 384 902"
                      fill="none"
                      stroke="url(#waterG)"
                      strokeWidth="30"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 380 112 C 366 200, 340 260, 334 320 C 328 390, 312 440, 320 486 C 326 528, 320 566, 330 606 C 344 668, 356 760, 372 838 C 378 868, 380 884, 384 902"
                      fill="none"
                      stroke="rgba(120,155,190,0.28)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    </g>

                    {/* البحيرات */}
                    <ellipse cx="322" cy="472" rx="26" ry="34" fill="#2c4157" opacity={layers.canal ? 0.9 : 0.1} />
                    <ellipse cx="332" cy="566" rx="18" ry="24" fill="#2c4157" opacity={layers.canal ? 0.8 : 0.1} />
                    <ellipse cx="350" cy="650" rx="30" ry="46" fill="#22364a" opacity={layers.canal ? 0.85 : 0.1} />

                    {/* خط بارليف */}
                    <g opacity={layers.barlev ? 1 : 0.1} className="transition-opacity duration-500">
                    <path
                      d="M 436 90 C 424 200, 412 300, 406 425 C 402 500, 408 568, 422 630 C 438 718, 452 820, 462 895"
                      fill="none"
                      stroke={focusId === "barlev" ? "#ecd28f" : "#b0722e"}
                      strokeWidth={focusId === "barlev" ? 3 : 2}
                      strokeDasharray="7 6"
                      opacity="0.85"
                      className="transition-all duration-500"
                      style={{
                        filter:
                          focusId === "barlev"
                            ? "drop-shadow(0 0 6px rgba(236,210,143,0.8))"
                            : undefined,
                      }}
                    />
                    </g>

                    {/* أسهم العبور — الحركة الزمنية */}
                    <g opacity={layers.movement ? 1 : 0} className="transition-opacity duration-500">
                    {ARROWS.map((a) => (
                      <path
                        key={a.id}
                        d={a.d}
                        fill="none"
                        stroke="#ecd28f"
                        strokeWidth="2.6"
                        markerEnd="url(#ah)"
                        className="route-dash transition-opacity duration-700"
                        opacity={arrowsVisible(a.from) ? 0.95 : 0}
                        style={{ filter: "drop-shadow(0 0 4px rgba(236,210,143,0.6))" }}
                      />
                    ))}
                    </g>

                    {/* وسوم ثابتة */}
                    <text x="120" y="520" fill="#6b7150" fontSize="20" letterSpacing="6" style={{ fontFamily: "Cairo, sans-serif" }} opacity="0.75">
                      الضفة الغربية
                    </text>
                    <text x="610" y="520" fill="#b0722e" fontSize="20" letterSpacing="6" style={{ fontFamily: "Cairo, sans-serif" }} opacity="0.8">
                      سيناء
                    </text>
                    <text x="348" y="80" fill="#8a94a0" fontSize="15" style={{ fontFamily: "Cairo, sans-serif" }} opacity="0.8">
                      البحر المتوسط
                    </text>
                    <text x="330" y="968" fill="#8a94a0" fontSize="15" style={{ fontFamily: "Cairo, sans-serif" }} opacity="0.8">
                      خليج السويس
                    </text>

                    {/* البوصلة */}
                    <g transform="translate(74,110)" opacity="0.8">
                      <circle r="26" fill="none" stroke="rgba(207,166,79,0.4)" strokeWidth="1" />
                      <path d="M0,-18 L5,6 L0,2 L-5,6 Z" fill="#cfa64f" />
                      <text y="-32" textAnchor="middle" fill="#cfa64f" fontSize="13" style={{ fontFamily: "Cairo, sans-serif" }}>
                        شمال
                      </text>
                    </g>

                    {/* النقاط — تُفلتر حسب الطبقات */}
                    {mapMarkers
                      .filter((m) => {
                        if (m.kind === "crossing" && !layers.crossings) {
                          if (m.id === "bridges") return layers.bridgeheads;
                          return false;
                        }
                        if ((m.id === "bridges" || m.id === "front") && !layers.bridgeheads) return false;
                        if (m.kind === "fort" && m.id !== "barlev" && !layers.bridgeheads) return false;
                        if (m.id === "barlev" && !layers.barlev) return false;
                        if (m.kind === "army" && !layers.movement) return false;
                        if (m.kind === "city" && !layers.west && !layers.east) return false;
                        return true;
                      })
                      .map((m) => (
                        <MarkerGlyph
                          key={m.id}
                          m={m}
                          active={m.id === focusId}
                          onClick={activateFromMap}
                        />
                      ))}

                    {/* إطار اللوحة */}
                    <rect x="6" y="6" width="788" height="988" fill="none" stroke="rgba(207,166,79,0.22)" strokeWidth="1" />
                  </svg>

                  {/* قراءة الحدث النشط */}
                  <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-mono-x text-[9px] tracking-[0.3em] text-gold/70">
                        الحدث {toArabicDigits(activeIdx + 1)} / {toArabicDigits(timelineEvents.length)}
                        {active.time ? ` — ${to12h(active.time)}` : ""}
                      </p>
                      <p className="font-display mt-0.5 truncate text-lg font-bold text-paper">
                        {active.title}
                      </p>
                    </div>
                    <span className="stamp hidden text-[8px] md:block">خريطة توضيحية</span>
                  </div>
                </div>
              </Reveal>
              <p className="mt-3 flex items-center gap-2 text-[11px] text-mute/70">
                <MousePointerClick size={12} className="text-gold/60" />
                رسم توضيحي غير ملتزم بمقياس (Interactive Visualization من تنفيذ المشروع) — التمرير
                أو اللمس يحرّك الخط الزمني. الخريطة رسم توضيحي من تنفيذ المشروع،
                ومواد الأرشيف مرجع لمعلوماتها فقط.
              </p>
              <p className="mt-2 text-[11px] leading-5 text-mute/60">
                مرجع الخرائط: <span className="font-mono-x text-gold/60">خارطة سيناء 6–13 أكتوبر</span> و{" "}
                <span className="font-mono-x text-gold/60">الخارطة العربية للجبهة</span> في الأرشيف —
                مرتبطة بالـ Timeline عبر mapFocus.
              </p>
            </div>
          </div>

          {/* الخط الزمني */}
          <div className="lg:order-1">
            <ol className="relative space-y-8 border-r border-line pr-7 lg:space-y-12">
              {timelineEvents.map((ev, i) => {
                const isActive = i === activeIdx;
                return (
                  <li key={ev.id} id={`card-${ev.id}`} className="relative">
                    {/* نقطة الخط */}
                    <span
                      className={cn(
                        "absolute -right-[38px] top-2 h-4 w-4 rounded-full border-2 transition-all duration-500",
                        isActive
                          ? "border-gold-bright bg-gold shadow-[0_0_16px_rgba(207,166,79,0.8)]"
                          : "border-line bg-night"
                      )}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={cn(
                        "block w-full border p-5 text-start transition-all duration-500 md:p-6",
                        isActive
                          ? "corner-frame border-gold/50 bg-navy-2/90 shadow-[0_16px_44px_rgba(0,0,0,0.45)]"
                          : "border-transparent bg-navy-2/35 hover:border-line"
                      )}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <span
                          className={cn(
                            "font-mono-x text-[11px] tracking-[0.2em] transition-colors duration-500",
                            isActive ? "text-gold-bright" : "text-mute"
                          )}
                        >
                          {ev.time ? to12h(ev.time) : "—"}
                        </span>
                        <span className="font-mono-x text-[10px] tracking-[0.2em] text-mute/60">
                          {ev.date}
                        </span>
                      </div>
                      <h3
                        className={cn(
                          "font-display mt-2 text-2xl font-bold transition-colors duration-500",
                          isActive ? "text-paper" : "text-paper-dim/80"
                        )}
                      >
                        {ev.title}
                      </h3>
                      <div
                        className={cn(
                          "grid transition-all duration-700 ease-[cubic-bezier(0.22,0.8,0.24,1)]",
                          isActive ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <p className="overflow-hidden text-sm leading-7 text-mute">
                          {ev.description}
                          <span className="mt-2 block text-[10px] leading-4 text-mute/50">
                            {ev.source}
                          </span>
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* مواد الفصل — صور الجبهة والخرائط المرجعية */}
        <Reveal variant="up">
          <ChapterMedia chapter="04" limit={4} title="صور الجبهة والخرائط — من مواد هذا الفصل" />
        </Reveal>
      </div>
    </section>
  );
}
