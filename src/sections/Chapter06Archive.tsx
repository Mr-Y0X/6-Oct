import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Film,
  Headphones,
  Image as ImageIcon,
  Map as MapIcon,
  Mic2,
  Newspaper,
  Search,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ChapterHeading, Reveal, toArabicDigits } from "@/components/ui/Reveal";
import ArchiveModal from "@/components/media/ArchiveModal";
import DocThumb from "@/components/media/DocThumb";
import type { ArchiveItem } from "@/data/types";
import { unifiedArchive, mediaById } from "@/data/media";
import { people } from "@/data/people";
import { assetById } from "@/data/assets";

/**
 * الفصل السادس — «الأرشيف الرقمي»
 * مستكشف أرشيف يقرأ مباشرة من src/data/assets.json:
 * تبويبات All/Photos/Videos/Audio/Documents/Maps/Speeches
 * + فلاتر التاريخ/النوع/الفصل/المصدر/الشخص/tags
 * + بحث في title/description/tags/speaker/source
 */

const CAT_ICON: Record<string, typeof FileText> = {
  document: FileText,
  photo: ImageIcon,
  video: Film,
  audio: Headphones,
  speech: Mic2,
  map: MapIcon,
  newspaper: Newspaper,
};

const TABS: { id: string; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "photo", label: "Photos" },
  { id: "video", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "document", label: "Documents" },
  { id: "map", label: "Maps" },
  { id: "speech", label: "Speeches" },
  { id: "newspaper", label: "Newspapers" },
];

const CHAPTER_LABELS: Record<string, string> = {
  "01": "٠١ قبل العبور",
  "02": "٠٢ الساعة 01:58 م",
  "03": "٠٣ لحظة العبور",
  "04": "٠٤ على امتداد القناة",
  "05": "٠٥ القرار",
  "06": "٠٦ وثائق من الزمن",
  "07": "٠٧ أصوات من الذاكرة",
  "08": "٠٨ صور لا تُنسى",
  "09": "٠٩ ما بقي في الذاكرة",
  finale: "الختام",
};

export default function Chapter06Archive() {
  const [cat, setCat] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [person, setPerson] = useState<string | null>(null);
  const [dateF, setDateF] = useState<string | null>(null);
  const [showReadyOnly, setShowReadyOnly] = useState(false);
  const [active, setActive] = useState<ArchiveItem | null>(null);

  /* تبويب خارجي (رابط «الوثائق» في الترويسة) */
  useEffect(() => {
    const fn = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (TABS.some((c) => c.id === detail)) {
        setCat(detail);
      }
    };
    window.addEventListener("archive:tab", fn);
    return () => window.removeEventListener("archive:tab", fn);
  }, []);

  const sources = useMemo(
    () => Array.from(new Set(unifiedArchive.map((i) => i.source).filter(Boolean))) as string[],
    []
  );
  const dates = useMemo(
    () => Array.from(new Set(unifiedArchive.map((i) => i.date).filter(Boolean))) as string[],
    []
  );
  const allTags = useMemo(
    () => Array.from(new Set(unifiedArchive.flatMap((i) => i.tags))),
    []
  );

  const isNewspaper = (i: ArchiveItem) => {
    const m = i.mediaRef ? mediaById(i.mediaRef) : undefined;
    return m?.category === "newspapers";
  };

  const filtered = useMemo(() => {
    const q = query.trim();
    return unifiedArchive.filter((i) => {
      if (cat === "newspaper") {
        if (!isNewspaper(i)) return false;
      } else if (cat !== "all" && i.category !== cat) return false;
      if (tag && !i.tags.includes(tag)) return false;
      if (chapter && !(i.chapter ?? []).includes(chapter)) return false;
      if (source && i.source !== source) return false;
      if (dateF && i.date !== dateF) return false;
      if (person && i.mediaRef) {
        const m = mediaById(i.mediaRef);
        if (m?.person && m.person !== person) return false;
        if (!m?.person && i.speaker) {
          const pname = people.find((p) => p.id === person)?.name ?? "";
          const first = pname.split(" ")[0] ?? "";
          const hay = `${i.speaker} ${i.tags.join(" ")} ${i.title}`;
          if (first && !hay.includes(first) && !hay.includes(pname.slice(0, 6))) return false;
        } else if (!m?.person && !i.speaker) {
          return false;
        }
      } else if (person && !i.mediaRef) {
        return false;
      }
      if (showReadyOnly && i.mediaStatus === "placeholder") return false;
      if (q) {
        const hay = `${i.title} ${i.description} ${i.tags.join(" ")} ${i.speaker ?? ""} ${i.source ?? ""}`;
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cat, query, tag, chapter, source, dateF, person, showReadyOnly]);

  const list = filtered;

  const resetAll = () => {
    setQuery("");
    setTag(null);
    setChapter(null);
    setSource(null);
    setPerson(null);
    setDateF(null);
    setShowReadyOnly(false);
    setCat("all");
  };

  return (
    <section
      id="archive"
      className="relative overflow-hidden bg-night py-28 md:py-36"
      aria-label="الفصل السادس — الأرشيف الرقمي"
    >
      <div className="noise-bg pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <ChapterHeading
          no={6}
          kicker="الفصل السادس — وثائق من الزمن"
          title="الأرشيف الرقمي"
          lead="مستكشف موحّد لكل المواد: وثائق، صور، تسجيلات، خطب، خرائط. كل بطاقة تحمل مصدرها وحقوقها."
        />

        {/* أدوات الاستكشاف */}
        <Reveal delay={100}>
          <div className="mt-12 border border-line bg-navy-2/50 p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* بحث شامل */}
              <label className="relative flex-1">
                <span className="sr-only">البحث في الأرشيف</span>
                <Search size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث في العنوان والوصف والوسوم والمتحدث والمصدر…"
                  className="w-full border border-line bg-ink/70 py-3 pl-4 pr-10 text-sm text-paper placeholder:text-mute/50 focus:border-gold/50 focus:outline-none"
                />
              </label>

              {/* تبويبات النوع */}
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="تصنيف الأرشيف">
                {TABS.map((c) => (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={cat === c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={cn(
                      "border px-3.5 py-2 text-[12px] transition-all duration-300",
                      cat === c.id
                        ? "border-gold/70 bg-gold/10 text-gold-bright shadow-[0_0_16px_rgba(207,166,79,0.2)]"
                        : "border-line text-mute hover:border-gold/30 hover:text-paper"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* فلاتر: التاريخ / الفصل / المصدر / الشخص */}
            <div className="mt-4 grid gap-2.5 md:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5 text-[11px] text-mute">
                الفصل
                <select
                  value={chapter ?? ""}
                  onChange={(e) => setChapter(e.target.value || null)}
                  className="border border-line bg-ink/70 px-3 py-2.5 text-[12px] text-paper focus:border-gold/50 focus:outline-none"
                >
                  <option value="">كل الفصول</option>
                  {Object.entries(CHAPTER_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] text-mute">
                المصدر
                <select
                  value={source ?? ""}
                  onChange={(e) => setSource(e.target.value || null)}
                  className="border border-line bg-ink/70 px-3 py-2.5 text-[12px] text-paper focus:border-gold/50 focus:outline-none"
                >
                  <option value="">كل المصادر</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] text-mute">
                التاريخ
                <select
                  value={dateF ?? ""}
                  onChange={(e) => setDateF(e.target.value || null)}
                  className="border border-line bg-ink/70 px-3 py-2.5 text-[12px] text-paper focus:border-gold/50 focus:outline-none"
                >
                  <option value="">كل التواريخ</option>
                  {dates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] text-mute">
                الشخص
                <select
                  value={person ?? ""}
                  onChange={(e) => setPerson(e.target.value || null)}
                  className="border border-line bg-ink/70 px-3 py-2.5 text-[12px] text-paper focus:border-gold/50 focus:outline-none"
                >
                  <option value="">كل الشخصيات</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* وسوم + خيارات */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="font-mono-x text-[9px] tracking-[0.3em] text-mute/50">وسوم:</span>
              {allTags.slice(0, 12).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(tag === t ? null : t)}
                  aria-pressed={tag === t}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] transition-all duration-300",
                    tag === t
                      ? "border-gold bg-gold/15 text-gold-bright"
                      : "border-line/70 text-mute/80 hover:border-gold/40 hover:text-paper"
                  )}
                >
                  {t}
                </button>
              ))}
              <span className="ms-auto flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-[11px] text-mute">
                  <input
                    type="checkbox"
                    checked={showReadyOnly}
                    onChange={(e) => setShowReadyOnly(e.target.checked)}
                    className="accent-[#cfa64f]"
                  />
                  الجاهز فقط (إخفاء المراجع الخارجية)
                </label>
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-[11px] text-gold/70 underline-offset-4 hover:underline"
                >
                  مسح الفلاتر
                </button>
              </span>
            </div>
          </div>
        </Reveal>

        {/* العدّاد */}
        <p className="font-mono-x mt-6 text-[10px] tracking-[0.3em] text-mute/60" role="status">
          {toArabicDigits(list.length)} مادة من {toArabicDigits(unifiedArchive.length)} — مُصنّفة ومُوثقة البيانات
        </p>

        {/* الشبكة */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((item, i) => {
            const Icon = CAT_ICON[item.category];
            const thumb = assetById(item.assetId)?.url;
            const isVisual = (item.category === "photo" || item.category === "map") && thumb;
            const isInterpretive = item.authenticity === "interpretive";
            const hasPlayable = Boolean(thumb || item.youtubeId);
            const isExternalRef =
              item.mediaStatus === "placeholder" && !hasPlayable && Boolean(item.sourceUrl);
            return (
              <Reveal key={item.id} delay={(i % 4) * 90} variant="up">
                <article className="group h-full">
                  <button
                    type="button"
                    onClick={() => setActive(item)}
                    className="corner-frame flex h-full w-full flex-col overflow-hidden border border-line bg-navy-2/60 text-start transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    aria-label={`فتح مادة أرشيفية: ${item.title}`}
                  >
                    {/* الرأس البصري */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                      {isVisual ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover opacity-90 transition-all duration-[1.6s] ease-out group-hover:scale-[1.04] group-hover:opacity-100"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : item.category === "document" ? (
                        <DocThumb item={item} />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-[radial-gradient(100%_100%_at_50%_0%,#121a26_0%,#0a1017_75%)]">
                          <Icon size={34} className="text-gold/35 transition-colors duration-500 group-hover:text-gold/70" />
                        </div>
                      )}
                      <span className="font-mono-x absolute right-2.5 top-2.5 border border-gold/30 bg-ink/75 px-2 py-0.5 text-[8px] tracking-[0.25em] text-gold/85 backdrop-blur-sm">
                        {TABS.find((c) => c.id === item.category)?.label ?? item.category}
                      </span>
                      {isExternalRef ? (
                        <span className="font-mono-x absolute bottom-2.5 right-2.5 border border-line bg-ink/75 px-2 py-0.5 text-[8px] tracking-[0.2em] text-paper-dim/80 backdrop-blur-sm">
                          مرجع خارجي
                        </span>
                      ) : null}
                      {isInterpretive && (
                        <span className="font-mono-x absolute bottom-2.5 right-2.5 border border-gold/40 bg-ink/75 px-2 py-0.5 text-[8px] tracking-[0.2em] text-gold-bright backdrop-blur-sm">
                          إعادة تصور بصرية
                        </span>
                      )}
                    </div>

                    {/* النص */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-lg font-bold leading-snug text-paper transition-colors group-hover:text-gold-bright">
                        {item.title}
                      </h3>
                      <p className="font-mono-x mt-1.5 text-[9px] tracking-[0.25em] text-mute/70">
                        {[item.date, item.speaker].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <p className="mt-2.5 line-clamp-2 text-[12px] leading-6 text-mute">
                        {item.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span className="flex gap-1.5">
                          {item.tags.slice(0, 2).map((t) => (
                            <span key={t} className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-mute">
                              {t}
                            </span>
                          ))}
                        </span>
                        <span className="font-mono-x text-[9px] tracking-[0.2em] text-gold/60 opacity-0 transition-all duration-300 group-hover:opacity-100">
                          فتح ←
                        </span>
                      </div>
                    </div>
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="mt-10 border border-dashed border-line py-16 text-center">
            <p className="font-display text-2xl text-paper/70">لا نتائج مطابقة</p>
            <p className="mt-2 text-sm text-mute">جرّب وسمًا آخر أو امسح الفلاتر.</p>
          </div>
        )}
      </div>

      <ArchiveModal item={active} items={list} onNavigate={setActive} onClose={() => setActive(null)} />
    </section>
  );
}
