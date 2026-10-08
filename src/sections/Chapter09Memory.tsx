import { ExternalLink, Flag, Landmark } from "lucide-react";
import { ChapterHeading, Reveal, toArabicDigits } from "@/components/ui/Reveal";
import ChapterMedia from "@/components/media/ChapterMedia";

/**
 * الفصل التاسع — «ما بقي في الذاكرة»
 * صور النصر والعلم والمواد الاجتماعية + Timeline ختامي من وقائع
 * مؤرخة وموثقة المصدر — دون أي ادعاء غير مدعوم.
 */

const CLOSING_EVENTS = [
  {
    id: "c-oct16",
    date: "16 أكتوبر 1973",
    title: "خطاب مجلس الشعب",
    body: "ألقى الرئيس أنور السادات خطابه أمام مجلس الشعب المصري لعرض سير العمليات منذ العبور — الخطاب الذي وُثّق نصه وتسجيله في الأرشيف الوطني.",
    source: "التلفزيون المصري — الأرشيف الوطني / الهيئة العامة للاستعلامات",
    sourceUrl: "https://www.sis.gov.eg/?lang=ar",
  },
  {
    id: "c-338",
    date: "22 أكتوبر 1973",
    title: "قرار مجلس الأمن 338",
    body: "أصدر مجلس الأمن الدولي القرار 338 الداعي إلى وقف إطلاق النار خلال 12 ساعة — ورغم استمرار القتال أيامًا بعده، شكّل القرار بداية المسار نحو وقف النار ثم مفاوضات فض الاشتباك.",
    source: "الأمم المتحدة — وثائق مجلس الأمن S/RES/338(1973)",
    sourceUrl: "https://docs.un.org/ar/S/RES/338(1973)",
  },
  {
    id: "c-panorama",
    date: "5 أكتوبر 1989",
    title: "افتتاح بانوراما حرب أكتوبر",
    body: "افتُتح متحف بانوراما حرب أكتوبر بشارع صلاح سالم بالقاهرة ليوثق الحرب عبر عرض متحفي — وما يزال شاهدًا حيًا على بطولات الشعب المصري وفق وزارة الدفاع.",
    source: "وزارة الدفاع المصرية — بانوراما أكتوبر",
    sourceUrl: "https://www.mod.gov.eg/ModWebSite/MuseumDetailsAr.aspx?id=2",
  },
];

export default function Chapter09Memory() {
  return (
    <section
      id="memory"
      className="relative overflow-hidden bg-night py-28 md:py-36"
      aria-label="الفصل التاسع — ما بقي في الذاكرة"
    >
      <div className="noise-bg pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <ChapterHeading
          no={9}
          kicker="الفصل التاسع"
          title="ما بقي في الذاكرة"
          lead="النصر والعلم والذاكرة الاجتماعية: صور ختامية ووقائع مؤرخة تروي كيف تحوّل يوم العبور إلى ذاكرة وطن."
        />

        {/* صور النصر والعلم */}
        <Reveal variant="up" delay={80}>
          <div className="plate corner-frame mt-12 grid items-center gap-8 p-6 md:grid-cols-2 md:p-8">
            <figure className="relative overflow-hidden">
              <img
                src="/images/flag-east.jpg"
                alt="إعادة تصور بصرية للحظة رفع العلم المصري على الضفة الشرقية"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="font-mono-x mt-2 flex items-center gap-2 text-[9px] tracking-[0.25em] text-mute/70">
                <Flag size={11} className="text-gold/60" />
                إعادة تصور بصرية للحظة رفع العلم
              </figcaption>
            </figure>
            <div>
              <p className="font-mono-x text-xs tracking-[0.35em] text-gold/80">العلم فوق الضفة الشرقية</p>
              <h3 className="font-display mt-4 text-3xl font-bold leading-snug text-paper md:text-4xl">
                راية واحدة…
                <br />
                وذاكرة أمة.
              </h3>
              <p className="mt-5 text-sm leading-8 text-mute md:text-base">
                فوق الساتر الترابي شرق القناة ارتفعت الأعلام المصرية في 6 أكتوبر 1973 —
                اللحظة التي تحوّلت فيها المعركة العسكرية إلى رمز وطني ما يزال حاضرًا في
                أسماء المدن والشوارع والذاكرة اليومية للمصريين.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Timeline ختامي */}
        <div className="mt-20">
          <Reveal>
            <div className="flex items-center gap-3">
              <Landmark size={20} className="text-gold/80" />
              <h3 className="font-display text-2xl font-bold text-paper md:text-3xl">
                Timeline ختامي — وقائع مؤرخة
              </h3>
            </div>
          </Reveal>

          <ol className="relative mt-10 space-y-6 border-r border-line pr-7">
            {CLOSING_EVENTS.map((ev, i) => (
              <Reveal key={ev.id} delay={i * 120} variant="up" as="li">
                <div className="plate relative p-5 md:p-6">
                  <span
                    className="absolute -right-[38px] top-6 h-4 w-4 rounded-full border-2 border-gold-bright bg-gold shadow-[0_0_16px_rgba(207,166,79,0.8)]"
                    aria-hidden="true"
                  />
                  <p className="font-mono-x text-[11px] tracking-[0.2em] text-gold-bright">
                    {ev.date} — {toArabicDigits(i + 1)}
                  </p>
                  <h4 className="font-display mt-2 text-2xl font-bold text-paper">{ev.title}</h4>
                  <p className="mt-3 text-sm leading-7 text-mute">{ev.body}</p>
                  <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-mute">
                    المصدر: <span className="text-paper-dim">{ev.source}</span>
                    <a
                      href={ev.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gold-bright underline-offset-4 hover:underline"
                    >
                      المصدر <ExternalLink size={10} />
                    </a>
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal variant="up">
          <ChapterMedia chapter="09" limit={4} title="صور النصر والمواد الاجتماعية — من مواد هذا الفصل" />
        </Reveal>
      </div>
    </section>
  );
}
