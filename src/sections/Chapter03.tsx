import { useLayoutEffect, useRef, useState } from "react";
import { Flag, Waves, Wrench } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/utils/cn";
import ArchiveModal from "@/components/media/ArchiveModal";
import { ChapterHeading, Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/hooks/hooks";
import type { ArchiveItem } from "@/data/types";
import { unifiedArchive } from "@/data/media";
import { assetById } from "@/data/assets";
import { VideoPlayer } from "@/components/media/Players";

/**
 * الفصل الثالث — «العبور»
 * ثلاثة مشاهد بصرية متتابعة بحركة كاميرا بطيئة (بارالاكس مع التمرير)
 * ثم معرض لقطات يفتح داخل العارف الأرشيفي.
 */

const SCENES = [
  {
    id: "scene-boats",
    img: "/images/crossing-boats.jpg",
    icon: Waves,
    no: "٠١",
    title: "قوارب الموجات الأولى",
    body: "تحت ستر النيران انطلقت موجات المشاة في قوارب العبور — دقائق معدودة فصلت بين ضفتين، وبين حقبتين.",
    caption: "أرشيف توضيحي / ٠٠٢ — لقطة فنية تفسيرية",
    align: "start" as const,
  },
  {
    id: "scene-pumps",
    img: "/images/water-pumps.jpg",
    icon: Wrench,
    no: "٠٢",
    title: "مضخات المياه تشقّ الساتر",
    body: "بفكرة هندسية مصرية، وجّه المهندسون مضخات مياه عالية الضغط نحو الساتر الترابي فانهارت التربة وفُتحت الثغرات أمام المعدات.",
    caption: "أرشيف توضيحي / ٠٠٣ — لقطة فنية تفسيرية",
    align: "end" as const,
  },
  {
    id: "scene-flag",
    img: "/images/flag-east.jpg",
    icon: Flag,
    no: "٠٣",
    title: "العلم يعلو على الضفة الشرقية",
    body: "على الساتر المفتوح ارتفعت الراية الأولى — إعلان ميداني بأن القوات المصرية عادت إلى أرض سيناء.",
    caption: "أرشيف توضيحي / ٠٠٤ — لقطة فنية تفسيرية",
    align: "start" as const,
  },
];

export default function Chapter03() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState<ArchiveItem | null>(null);

  const galleryItems = unifiedArchive.filter((i) =>
    ["a-flag-east", "a-crossing-boats", "a-water-pumps", "a-operations-room"].includes(
      i.mediaRef ?? i.assetId ?? ""
    )
  );

  /* الفيديو المحوري للفصل — ملحمة العبور (القناة الرسمية لوزارة الدفاع) */
  const featureVideo =
    unifiedArchive.find((i) => i.mediaRef === "vid-crossing-doc") ?? null;

  useLayoutEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      /* بارالاكس الكاميرا داخل كل مشهد */
      gsap.utils.toArray<HTMLElement>(".c3-img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -8, scale: 1.18 },
          {
            yPercent: 8,
            scale: 1.18,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".c3-scene"),
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });

      /* انزياح لوحات النص ببطء مخالف */
      gsap.utils.toArray<HTMLElement>(".c3-panel").forEach((panel) => {
        gsap.fromTo(
          panel,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            scrollTrigger: {
              trigger: panel,
              start: "top 78%",
              once: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="chapter-03"
      className="relative"
      aria-label="الفصل الثالث — العبور"
    >
      <div className="relative overflow-hidden py-28 md:py-36">
        <div className="relative mx-auto max-w-6xl px-6 md:px-10">
          <ChapterHeading
            no={3}
            kicker="الفصل الثالث"
            title="العبور"
            lead="عملية «بدر»: من الصمت إلى الموجة الأولى. ثلاث لقطات من قلب الساعات الأولى — بمزيج من اللقطات الأرشيفية الموثقة واللقطات الفنية التفسيرية الموسومة."
          />
        </div>
      </div>

      {/* المشاهد */}
      {SCENES.map((s) => (
        <div
          key={s.id}
          className="c3-scene relative h-[86svh] min-h-[540px] overflow-hidden"
        >
          <img
            src={s.img}
            alt={s.title}
            className="c3-img absolute inset-0 h-full w-full object-cover will-change-transform"
            loading="lazy"
            decoding="async"
          />
          <div
            className={cn(
              "absolute inset-0",
              s.align === "start"
                ? "bg-gradient-to-l from-ink via-ink/35 to-transparent"
                : "bg-gradient-to-r from-ink via-ink/35 to-transparent"
            )}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />

          <div
            className={cn(
              "absolute inset-0 mx-auto flex max-w-6xl items-center px-6 md:px-10",
              s.align === "start" ? "justify-start" : "justify-end"
            )}
          >
            <div className="c3-panel relative max-w-md">
              <p className="font-mono-x flex items-center gap-3 text-xs tracking-[0.35em] text-gold/80">
                <s.icon size={16} />
                مشهد {s.no}
              </p>
              <h3 className="font-display mt-4 text-3xl font-bold leading-snug text-paper md:text-5xl">
                {s.title}
              </h3>
              <p className="mt-5 text-sm leading-8 text-paper-dim md:text-base">
                {s.body}
              </p>
              <p className="font-mono-x mt-6 text-[9px] tracking-[0.3em] text-mute/70">
                {s.caption}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* الفيديو المحوري — انتقال سينمائي داخل السرد */}
      {featureVideo && (
        <div className="relative mx-auto max-w-6xl px-6 pb-4 md:px-10">
          <Reveal variant="up">
            <p className="font-mono-x text-xs tracking-[0.35em] text-gold/80">من قلب المعركة — فيلم توثيقي</p>
            <h3 className="font-display mt-3 text-3xl font-bold text-paper md:text-4xl">
              {featureVideo.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-mute">
              من إنتاج الشؤون المعنوية: التخطيط والتنفيذ، غرفة القيادة، الضربة الجوية
              والمدفعية والكباري — ثم نعود إلى لقطات اليوم الأول.
            </p>
          </Reveal>
          <Reveal delay={140} variant="clip" className="mt-8">
            <div className="corner-frame">
              <VideoPlayer item={featureVideo} />
            </div>
          </Reveal>
          <Reveal delay={220}>
            <button
              type="button"
              onClick={() => setActive(featureVideo)}
              className="mt-5 border border-gold/40 px-5 py-2.5 text-xs text-gold-bright transition-all duration-300 hover:border-gold hover:bg-gold/10"
            >
              بطاقة التوثيق والمصدر
            </button>
          </Reveal>
        </div>
      )}

      {/* معرض اللقطات */}
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono-x text-xs tracking-[0.35em] text-gold/80">من الأرشيف البصري</p>
              <h3 className="font-display mt-3 text-3xl font-bold text-paper md:text-4xl">
                لقطات اليوم الأول
              </h3>
            </div>
            <p className="max-w-sm text-[12px] leading-6 text-mute">
              اضغط أي لوحة لفتحها في عارف الأرشيف مع بياناتها الوصفية.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {galleryItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 110} variant="clip">
              <button
                type="button"
                onClick={() => setActive(item)}
                className={cn(
                  "group corner-frame relative block w-full overflow-hidden text-start",
                  i % 2 === 0 ? "md:translate-y-6" : ""
                )}
                aria-label={`فتح: ${item.title}`}
              >
                <img
                  src={assetById(item.assetId)?.url ?? "/images/canal-aerial.jpg"}
                  alt={item.title}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:scale-[1.05]"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="font-mono-x block text-[8px] tracking-[0.3em] text-gold/80">
                    لوحة {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display mt-1 block text-lg font-bold leading-snug text-paper">
                    {item.title}
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <ArchiveModal item={active} items={galleryItems} onNavigate={setActive} onClose={() => setActive(null)} />
    </section>
  );
}
