import { useState } from "react";
import { cn } from "@/utils/cn";
import type { ArchiveItem } from "@/data/types";
import { mediaByChapter, toArchiveItem } from "@/data/media";
import type { ChapterId } from "@/data/types";
import ArchiveModal from "./ArchiveModal";
import DocThumb from "./DocThumb";
import { Play } from "lucide-react";
import { videoForAudioRef } from "@/data/media";
import { assetById } from "@/data/assets";

/**
 * شريط سردي مدمج — النص → الصورة → الوثيقة → الخريطة → الصوت → الفيديو → المصدر
 * يسحب مواده من assets.json حسب الفصل، دون تغيير التصميم السينمائي.
 * يعرض الجاهز أولًا، والمواضع المحجوزة بشارة صادقة.
 */
export default function ChapterMedia({
  chapter,
  limit = 4,
  title = "من مواد هذا الفصل",
  className,
}: {
  chapter: ChapterId;
  limit?: number;
  title?: string;
  className?: string;
}) {
  const [active, setActive] = useState<ArchiveItem | null>(null);
  const assets = mediaByChapter(chapter).slice(0, limit);
  if (assets.length === 0) return null;
  const items = assets.map(toArchiveItem);

  return (
    <div className={cn("mt-12", className)}>
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono-x text-[10px] tracking-[0.3em] text-gold/70">{title}</p>
        <a
          href="#archive"
          className="text-[11px] text-mute underline-offset-4 hover:text-gold-bright hover:underline"
        >
          فتح في الأرشيف ←
        </a>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const thumb = assetById(item.assetId)?.url;
          const placeholder = item.mediaStatus === "placeholder";
          const linkedVideo = item.mediaRef ? videoForAudioRef(item.mediaRef) : undefined;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="group relative overflow-hidden border border-line bg-navy-2/60 text-start transition-all duration-500 hover:-translate-y-0.5 hover:border-gold/40"
              aria-label={`فتح: ${item.title}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-ink">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-85 transition-transform duration-[1.6s] group-hover:scale-[1.04]"
                  />
                ) : item.category === "document" ? (
                  <DocThumb item={item} />
                ) : item.category === "video" && item.youtubeId ? (
                  <div className="grid h-full w-full place-items-center bg-[radial-gradient(100%_100%_at_50%_0%,#121a26_0%,#0a1017_75%)]">
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-gold-bright">
                      <Play size={15} className="-mr-0.5" />
                    </span>
                  </div>
                ) : linkedVideo ? (
                  <div className="grid h-full w-full place-items-center gap-2 bg-[radial-gradient(100%_100%_at_50%_0%,#121a26_0%,#0a1017_75%)]">
                    <span className="font-mono-x px-4 text-center text-[9px] leading-5 tracking-[0.25em] text-gold-bright/90">
                      التسجيل الأصلي
                    </span>
                  </div>
                ) : item.sourceUrl ? (
                  <div className="grid h-full w-full place-items-center bg-[radial-gradient(100%_100%_at_50%_0%,#121a26_0%,#0a1017_75%)]">
                    <span className="font-mono-x px-4 text-center text-[9px] tracking-[0.25em] text-paper-dim/80">
                      مرجع خارجي
                    </span>
                  </div>
                ) : (
                  <div className="grid h-full w-full place-items-center bg-[radial-gradient(100%_100%_at_50%_0%,#121a26_0%,#0a1017_75%)]">
                    <span className="font-mono-x px-4 text-center text-[9px] tracking-[0.3em] text-mute">
                      {item.category === "audio" || item.category === "speech"
                        ? "تسجيل"
                        : "خريطة"}
                    </span>
                  </div>
                )}
                {placeholder && thumb && (
                  <span className="font-mono-x absolute bottom-2 right-2 border border-dashed border-line bg-ink/75 px-2 py-0.5 text-[8px] text-mute">
                    مرجع خارجي
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[12px] font-semibold text-paper group-hover:text-gold-bright">
                  {item.title}
                </p>
                <p className="font-mono-x mt-1 text-[9px] tracking-[0.2em] text-mute/70">
                  {[item.date, item.source].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <ArchiveModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}
