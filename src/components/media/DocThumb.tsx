import { FileText } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ArchiveItem } from "@/data/types";

/**
 * مصغّرة وثائقية — بطاقة بخامة ورق أرشيفي وعنوان الوثيقة
 * للمواد النصية (وثائق/صحف) التي لا تملك صورة مصغرة —
 * تبدو كقطعة أرشيفية حقيقية لا كموضع فارغ.
 */
export default function DocThumb({
  item,
  className,
  aspect = "aspect-[16/10]",
}: {
  item: ArchiveItem;
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-ink", aspect, className)}>
      <img
        src="/images/paper-texture.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <FileText size={20} className="text-amber-200/60" aria-hidden="true" />
        <p className="font-display mt-2.5 max-w-full truncate text-base font-bold leading-snug text-amber-100/90 md:text-lg">
          {item.title}
        </p>
        {item.date && (
          <p className="font-mono-x mt-1.5 text-[8px] tracking-[0.3em] text-amber-200/50">
            {item.date}
          </p>
        )}
      </div>
      <span className="stamp absolute bottom-2 left-2 text-[7px] opacity-80">وثيقة أرشيفية</span>
    </div>
  );
}
