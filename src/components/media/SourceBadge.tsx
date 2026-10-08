import { ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * شارة المصدر الموحدة — كل مادة تاريخية
 * يعرض: المصدر / التاريخ / Credit + زر "المصدر" للمصدر الأصلي
 */
export default function SourceBadge({
  source,
  sourceUrl,
  date,
  credit,
  chapter,
  authenticity,
  className,
}: {
  source?: string;
  sourceUrl?: string;
  date?: string;
  credit?: string;
  chapter?: string[] | string;
  authenticity?: string;
  className?: string;
}) {
  const chapters = Array.isArray(chapter) ? chapter.join(" · ") : chapter;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] leading-5 text-mute",
        className
      )}
    >
      <span>
        المصدر: <span className="text-paper-dim">{source ?? "—"}</span>
      </span>
      {date && (
        <span>
          التاريخ: <span className="text-paper-dim">{date}</span>
        </span>
      )}
      {credit && (
        <span>
          Credit: <span className="text-paper-dim">{credit}</span>
        </span>
      )}
      {chapters && (
        <span className="font-mono-x text-[10px] tracking-[0.2em] text-gold/60">
          فصل {chapters}
        </span>
      )}
      {authenticity === "interpretive" && (
        <span className="border border-gold/40 px-2 py-0.5 text-[10px] text-gold-bright">
          إعادة تصور بصرية للمشهد — ليست مادة أرشيفية
        </span>
      )}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mr-auto inline-flex items-center gap-1.5 border border-gold/40 px-3 py-1.5 text-[11px] text-gold-bright transition-colors hover:border-gold hover:bg-gold/10"
        >
          المصدر <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
}
