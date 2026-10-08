import { CalendarDays, Hourglass, Shield } from "lucide-react";

import { ArchiveQuote, ChapterHeading, Reveal } from "@/components/ui/Reveal";
import ChapterMedia from "@/components/media/ChapterMedia";

const ERAS = [
  {
    icon: CalendarDays,
    years: "1967",
    title: "يونيو — الجرح",
    body: "بعد نكسة يونيو 1967 بقيت سيناء محتلة، وتحوّلت قناة السويس إلى خط تماس صامت بين ضفتين.",
  },
  {
    icon: Hourglass,
    years: "1968–1970",
    title: "حرب الاستنزاف",
    body: "سنوات من الاشتباكات المدفعية والعمليات المتبادلة على امتداد القناة، والمدن المصرية على الضفة الغربية تُخلَى من سكانها.",
  },
  {
    icon: Shield,
    years: "1970–1973",
    title: "الإعداد والتدريب",
    body: "إعادة بناء القوات المسلحة، وتدريب مكثف على العبور، وخداع استراتيجي محكم، وصولًا إلى خطة العملية «بدر».",
  },
];

export default function Chapter01() {
  return (
    <section
      id="chapter-01"
      className="relative overflow-hidden py-28 md:py-40"
      aria-label="الفصل الأول — قبل العبور"
    >
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <ChapterHeading
          no={1}
          kicker="الفصل الأول"
          title="قبل العبور"
          lead="لم تبدأ الحرب في الساعة الثانية من ظهر 6 أكتوبر؛ بدأت قبل ذلك بست سنوات — في ليل يونيو 1967، حين أصبح العبور سؤالًا معلقًا فوق القناة."
        />

        {/* المحطات الزمنية */}
        <div className="mt-16 grid gap-5 md:mt-24 md:grid-cols-3">
          {ERAS.map((era, i) => (
            <Reveal key={era.years} delay={i * 140} variant="up">
              <article className="plate corner-frame group relative h-full p-7 transition-transform duration-500 hover:-translate-y-1.5">
                <era.icon className="text-gold/70 transition-colors duration-500 group-hover:text-gold" size={22} />
                <p className="font-mono-x mt-5 text-2xl tracking-widest text-gold-bright">
                  {era.years}
                </p>
                <h3 className="font-display mt-2 text-2xl font-bold text-paper">{era.title}</h3>
                <p className="mt-4 text-sm leading-7 text-mute">{era.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* لوحة أرشيفية */}
        <div className="mt-20 grid items-center gap-10 md:mt-28 md:grid-cols-2">
          <Reveal variant="clip">
            <figure className="corner-frame relative overflow-hidden">
              <img
                src="/images/field-night.jpg"
                alt="لقطة فنية تفسيرية لغرفة قيادة ميدانية ليلية"
                className="aspect-[4/3] w-full scale-105 object-cover transition-transform duration-[2.5s] ease-out hover:scale-100"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent px-5 py-4">
                <span className="font-mono-x text-[10px] tracking-[0.3em] text-gold/80">
                  أرشيف توضيحي / ٠٠١
                </span>
                <span className="text-[11px] text-paper-dim">غرفة قيادة ميدانية — لقطة تفسيرية</span>
              </figcaption>
            </figure>
          </Reveal>

          <div>
            <Reveal>
              <p className="font-mono-x text-xs tracking-[0.35em] text-gold/80">قراءة في السياق</p>
            </Reveal>
            <Reveal delay={120}>
              <h3 className="font-display mt-4 text-3xl font-bold leading-normal text-paper md:text-4xl">
                ست سنوات من السؤال،
                <br />
                وساعة واحدة للإجابة.
              </h3>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-6 space-y-4 text-sm leading-8 text-mute md:text-base">
                <p>
                  بين المحاولات الدبلوماسية المتعثرة وبقاء الجبهة مجمدة، اتخذ القرار المصري
                  شكله النهائي: لا استعادة للأرض إلا بالقتال.
                </p>
                <p>
                  وفي خريف 1973 اكتملت حلقات الإعداد — خطة العبور، الخداع، التوقيت —
                  واختير لساعة الصفر يومٌ يجمع بين صيام رمضان وعطلة العدو: 6 أكتوبر.
                </p>
              </div>
            </Reveal>
            <Reveal delay={360}>
              <div className="hairline mt-8" />
              <p className="mt-5 text-[11px] leading-6 text-mute/70">
                ملاحظة تحريرية: كل معلومة تاريخية في هذا الأرشيف تُدار من ملفات بيانات
                مستقلة وتدعم إسناد المصدر والتاريخ والحقوق.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-24 md:mt-32">
          <ArchiveQuote by="من كتابة المشروع — ليست اقتباسًا تاريخيًا">
            «كانت الجبهة تتحرك في صمت… وكل دقيقة كانت تُحسب بدقة ساعة رملية.»
          </ArchiveQuote>
        </div>

        {/* مواد الفصل من assets.json — وثائق / خرائط / صور قيادة */}
        <Reveal variant="up">
          <ChapterMedia chapter="01" limit={4} title="وثائق وخرائط وصور القيادة — من مواد هذا الفصل" />
        </Reveal>
      </div>
    </section>
  );
}
