import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Film,
  Map as MapIcon,
  Maximize,
  Mic,
  Minus,
  Plus,
  RotateCcw,
  ScrollText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { ArchiveItem } from "@/data/types";
import { assetById } from "@/data/assets";
import { videoForAudioRef } from "@/data/media";
import { useEscape, useScrollLock } from "@/hooks/hooks";
import { AudioPlayer, VideoPlayer } from "./Players";
import SourceBadge from "./SourceBadge";

const CATEGORY_META: Record<ArchiveItem["category"], { label: string; icon: typeof FileText }> = {
  document: { label: "وثيقة", icon: FileText },
  photo: { label: "صورة", icon: ImageIcon },
  video: { label: "فيديو", icon: Film },
  audio: { label: "صوت", icon: Mic },
  speech: { label: "خطاب", icon: ScrollText },
  map: { label: "خريطة", icon: MapIcon },
};

/* ------------------------------------------------------------ */
/* صورة قابلة للتكبير والسحب                                     */
/* ------------------------------------------------------------ */
function ZoomImage({ src, alt, tall = false }: { src: string; alt: string; tall?: boolean }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const clamp = (v: number) => Math.min(4, Math.max(1, v));
  const zoom = (d: number) =>
    setScale((s) => {
      const n = clamp(s + d);
      if (n === 1) setPos({ x: 0, y: 0 });
      return n;
    });

  return (
    <div className="relative">
      <div
        className={cn(
          "relative overflow-hidden border border-line bg-black/50",
          tall ? "aspect-[3/4] md:aspect-auto md:h-[62vh]" : "aspect-[4/3] md:aspect-video",
          scale > 1 ? "cursor-grab" : "cursor-zoom-in"
        )}
        onPointerDown={(e) => {
          if (scale <= 1) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setPos({
            x: drag.current.ox + (e.clientX - drag.current.sx),
            y: drag.current.oy + (e.clientY - drag.current.sy),
          });
        }}
        onPointerUp={() => (drag.current = null)}
        onDoubleClick={() => (scale > 1 ? (setScale(1), setPos({ x: 0, y: 0 })) : setScale(2))}
        onWheel={(e) => zoom(e.deltaY < 0 ? 0.25 : -0.25)}
        role="img"
        aria-label={alt}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full select-none object-contain transition-transform duration-150 ease-out"
          style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})` }}
        />
      </div>

      {/* أدوات التكبير */}
      <div className="mt-3 flex items-center justify-center gap-2" role="toolbar" aria-label="أدوات التكبير">
        {[
          { icon: Minus, fn: () => zoom(-0.5), label: "تصغير" },
          { icon: Plus, fn: () => zoom(0.5), label: "تكبير" },
          {
            icon: RotateCcw,
            fn: () => {
              setScale(1);
              setPos({ x: 0, y: 0 });
            },
            label: "إعادة الضبط",
          },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.fn}
            aria-label={b.label}
            className="grid h-9 w-9 place-items-center border border-line text-mute transition-colors hover:border-gold/50 hover:text-gold-bright"
          >
            <b.icon size={14} />
          </button>
        ))}
        <span className="font-mono-x min-w-14 text-center text-[11px] text-gold/80">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ */
/* عارف الوثائق                                                  */
/* ------------------------------------------------------------ */
function DocumentViewer({ item }: { item: ArchiveItem }) {
  const pages = item.pages && item.pages.length > 0 ? item.pages : ["/images/paper-texture.jpg"];
  const [page, setPage] = useState(0);
  const src = pages[page];
  const isPdf = /\.pdf($|\?)/i.test(src);

  if (isPdf) {
    return (
      <div>
        <div className="relative overflow-hidden border border-line bg-black/50">
          <embed
            src={src}
            type="application/pdf"
            title={`${item.title} — وثيقة PDF`}
            className="h-[62vh] w-full bg-white"
          />
          <div className="pointer-events-none absolute left-4 top-4 border border-gold/40 bg-ink/60 px-3 py-1.5 backdrop-blur-sm">
            <span className="stamp text-[9px]">وثيقة معتمدة / {item.date}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="font-mono-x text-[11px] tracking-wider text-mute">
            وثيقة PDF — تُعرض داخل العارف
          </p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="border border-gold/40 px-4 py-2 text-[11px] text-gold-bright transition-colors hover:border-gold hover:bg-gold/10"
          >
            فتح الوثيقة في تبويب جديد
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <ZoomImage
          key={page}
          src={pages[page]}
          alt={`${item.title} — صفحة ${page + 1}`}
          tall
        />
        {/* ختم أرشيفي ورأس الوثيقة */}
        <div className="pointer-events-none absolute left-4 top-4 border border-gold/40 bg-ink/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="stamp text-[9px]">وثيقة معتمدة / {item.date}</span>
        </div>

        {/* النص التاريخي المنقوش فوق الورقة */}
        <div className="pointer-events-none absolute inset-x-8 top-16 bottom-16 flex flex-col justify-center text-center">
          <p className="font-display text-xs text-amber-950/70 dark:text-amber-200/50 mb-2">
            جمهورية مصر العربية — القيادة العامة للقوات المسلحة
          </p>
          <h4 className="font-display text-lg md:text-xl font-bold text-amber-950/90 dark:text-amber-100/80 leading-relaxed px-4">
            {item.title}
          </h4>
          <p className="font-display text-sm md:text-base text-amber-950/80 dark:text-amber-200/70 mt-4 leading-relaxed max-w-lg mx-auto px-4">
            {item.description}
          </p>
          <span className="stamp text-[8px] text-amber-900/60 dark:text-gold/60 mt-6 block">
            [سجل الأرشيف الحربي — 1973]
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <p className="font-mono-x text-[11px] tracking-wider text-mute">
          صفحة {page + 1} من {pages.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="الصفحة السابقة"
            className="grid h-9 w-9 place-items-center border border-line text-mute transition-colors enabled:hover:border-gold/50 enabled:hover:text-gold-bright disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={page >= pages.length - 1}
            aria-label="الصفحة التالية"
            className="grid h-9 w-9 place-items-center border border-line text-mute transition-colors enabled:hover:border-gold/50 enabled:hover:text-gold-bright disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-mute/70">
        نموذج عرض بخامة ورق أرشيفي — تُستبدل بالمسح الضوئي الموثق للوثيقة فور اعتماده من
        جهة الأرشيف.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ */
/* المودال الأرشيفي الموحّد                                       */
/* ------------------------------------------------------------ */
export default function ArchiveModal({
  item,
  items,
  onNavigate,
  onClose,
}: {
  item: ArchiveItem | null;
  /** قائمة السياق للتنقل previous/next — اختياري */
  items?: ArchiveItem[];
  onNavigate?: (item: ArchiveItem) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const idx = item && items ? items.findIndex((x) => x.id === item.id) : -1;
  const hasNav = idx >= 0 && items && items.length > 1;
  const goPrev = () => {
    if (!hasNav || !items || !onNavigate) return;
    onNavigate(items[(idx - 1 + items.length) % items.length]);
  };
  const goNext = () => {
    if (!hasNav || !items || !onNavigate) return;
    onNavigate(items[(idx + 1) % items.length]);
  };
  const toggleFs = () => {
    const el = panelRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void el.requestFullscreen?.().catch(() => undefined);
  };

  useEffect(() => {
    if (item) {
      setMounted(true);
      window.setTimeout(() => closeRef.current?.focus(), 60);
    } else {
      const t = window.setTimeout(() => setMounted(false), 450);
      return () => window.clearTimeout(t);
    }
  }, [item]);

  useScrollLock(!!item);
  useEscape(onClose, !!item);

  /* أسهم لوحة المفاتيح للتنقل بين المواد */
  useEffect(() => {
    if (!item || !hasNav) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      else if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  if (!mounted && !item) return null;

  const asset = item?.assetId ? assetById(item.assetId) : undefined;
  const meta = item ? CATEGORY_META[item.category] : null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[140] flex items-end justify-center transition-all duration-500 md:items-center md:p-8",
        item ? "pointer-events-auto" : "pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-label={item?.title ?? "عارف الأرشيف"}
    >
      {/* الخلفية */}
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500",
          item ? "opacity-100" : "opacity-0"
        )}
      />

      {/* اللوحة */}
      <div
        ref={panelRef}
        className={cn(
          "plate relative flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,0.8,0.24,1)] md:max-h-[88vh]",
          item
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-12 opacity-0 md:translate-y-0 md:scale-95"
        )}
      >
        {item && meta && (
          <>
            {/* الترويسة */}
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center border border-gold/30 text-gold/80">
                  <meta.icon size={15} />
                </span>
                <div className="min-w-0">
                  <p className="font-mono-x text-[9px] tracking-[0.3em] text-gold/70">
                    {meta.label} — {item.date ?? "غير مؤرخ"}
                  </p>
                  <h3 className="font-display truncate text-xl font-bold text-paper md:text-2xl">
                    {item.title}
                  </h3>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {hasNav && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="المادة السابقة"
                      className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition-colors hover:border-gold/50 hover:text-paper"
                    >
                      <ChevronRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="المادة التالية"
                      className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition-colors hover:border-gold/50 hover:text-paper"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span className="font-mono-x hidden text-[10px] tracking-[0.2em] text-mute/60 sm:block">
                      {idx + 1} / {items?.length}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  onClick={toggleFs}
                  aria-label="ملء الشاشة"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition-colors hover:border-gold/50 hover:text-paper"
                >
                  <Maximize size={14} />
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق العارف"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-mute transition-colors hover:border-gold/50 hover:text-paper"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* المحتوى */}
            <div className="overflow-y-auto px-5 py-5 md:px-7 md:py-6">
              {item.category === "document" && <DocumentViewer item={item} />}

              {(item.category === "photo" || item.category === "map") &&
                (asset ? (
                  <ZoomImage src={asset.url} alt={item.title} />
                ) : item.sourceUrl ? (
                  <div className="relative grid aspect-video place-items-center overflow-hidden border border-gold/25 bg-[radial-gradient(100%_100%_at_50%_0%,#141b28_0%,#0a1017_75%)]">
                    <div className="relative px-6 text-center">
                      <p className="font-mono-x text-[9px] tracking-[0.3em] text-gold/70">
                        مجموعة أرشيفية خارجية
                      </p>
                      <p className="font-display mt-3 text-xl font-bold leading-snug text-paper md:text-2xl">
                        {item.title}
                      </p>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 border border-gold/50 bg-gold/[0.07] px-5 py-2.5 text-[12px] text-gold-bright transition-all duration-300 hover:border-gold hover:bg-gold/[0.14]"
                      >
                        استكشف المجموعة الأصلية <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="grid aspect-video place-items-center border border-line bg-navy-2/60">
                    <p className="font-mono-x px-6 text-center text-[11px] tracking-[0.3em] text-mute">
                      سجل أرشيفي
                    </p>
                  </div>
                ))}

              {(item.category === "audio" || item.category === "speech") &&
                (() => {
                  const via =
                    item.mediaStatus === "placeholder" ? videoForAudioRef(item.mediaRef) : undefined;
                  if (via) {
                    return (
                      <div>
                        <VideoPlayer item={via} />
                        <p className="mt-3 border-r-2 border-gold/50 pr-3 text-[11px] leading-5 text-mute">
                          التسجيل الأصلي متاح للاستماع والمشاهدة عبر الفيديو الرسمي أعلاه —
                          {via.source}
                        </p>
                      </div>
                    );
                  }
                  return <AudioPlayer item={item} />;
                })()}

              {item.category === "video" && <VideoPlayer item={item} />}

              <p className="mt-5 text-sm leading-7 text-paper-dim">{item.description}</p>

              {/* شارة الأصالة + المتحدث */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                {item.authenticity === "interpretive" || asset?.interpretive ? (
                  <span className="border border-gold/40 px-2.5 py-1 text-gold-bright">
                    إعادة تصور بصرية للمشهد — ليست صورة تاريخية أصلية
                  </span>
                ) : item.mediaStatus === "placeholder" && !item.sourceUrl ? (
                  <span className="border border-line px-2.5 py-1 text-paper-dim">
                    سجل أرشيفي
                  </span>
                ) : (
                  <span className="border border-line px-2.5 py-1 text-paper-dim">
                    {item.sourceUrl ? "مرجع موثق — المصدر الأصلي متاح بالأسفل" : "مادة أرشيفية موثقة المصدر"}
                  </span>
                )}
                {item.speaker && (
                  <span className="text-mute">
                    المتحدث: <span className="text-paper-dim">{item.speaker}</span>
                  </span>
                )}
                {item.date && (
                  <span className="font-mono-x text-[10px] tracking-[0.2em] text-mute">
                    {item.date}
                  </span>
                )}
              </div>

              <SourceBadge
                source={item.source}
                sourceUrl={item.sourceUrl}
                date={item.date}
                credit={item.credit ?? asset?.credit}
                chapter={item.chapter}
                authenticity={item.authenticity ?? (asset?.interpretive ? "interpretive" : undefined)}
                className="mt-4"
              />

              {/* البيانات الوصفية */}
              <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line text-[12px] md:grid-cols-4">
                {[
                  { k: "المصدر", v: item.source ?? "—", href: item.sourceUrl },
                  { k: "الحقوق", v: item.rights ?? "—" },
                  { k: "الائتمان", v: item.credit ?? asset?.credit ?? "—" },
                  { k: "الوسوم", v: item.tags.join(" · ") },
                ].map((f) => (
                  <div key={f.k} className="bg-navy-2 p-3">
                    <dt className="font-mono-x text-[9px] tracking-[0.25em] text-gold/60">
                      {f.k}
                    </dt>
                    <dd className="mt-1.5 leading-5 text-paper-dim">
                      {f.href ? (
                        <a
                          href={f.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-gold-bright underline-offset-4 hover:underline"
                        >
                          {f.v} <ExternalLink size={10} />
                        </a>
                      ) : (
                        f.v
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {asset?.interpretive && (
                <p className="mt-4 border-r-2 border-gold/50 pr-3 text-[11px] leading-5 text-mute">
                  لقطة فنية تفسيرية أُنتجت للمشروع — ليست صورة أرشيفية تاريخية، وستُستبدل
                  باللقطة الموثقة فور توفرها.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
