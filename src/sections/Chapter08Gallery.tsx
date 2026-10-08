import { useMemo, useState } from "react";
import { Images } from "lucide-react";
import { cn } from "@/utils/cn";
import { ChapterHeading, Reveal } from "@/components/ui/Reveal";
import ArchiveModal from "@/components/media/ArchiveModal";
import type { ArchiveItem } from "@/data/types";
import { unifiedArchive } from "@/data/media";
import { assetById } from "@/data/assets";

/**
 * الفصل الثامن — «صور لا تُنسى»
 * Gallery كبير: اللقطات التفسيرية الجاهزة أولًا، ثم المواضع المحجوزة
 * للصور الأرشيفية الموثقة — كل لوحة تفتح العارف مع بياناتها.
 */
export default function Chapter08Gallery() {
  const [active, setActive] = useState<ArchiveItem | null>(null);

  const items = useMemo(() => {
    const photos = unifiedArchive.filter((i) => i.category === "photo");
    return [...photos].sort((a, b) => {
      const rank = (x: ArchiveItem) =>
        x.mediaStatus === "placeholder" ? 1 : x.authenticity === "interpretive" ? 0 : -1;
      return rank(a) - rank(b);
    });
  }, []);

  return (
    <section
      id="gallery"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="الفصل الثامن — صور لا تُنسى"
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <ChapterHeading
          no={8}
          kicker="الفصل الثامن"
          title="صور لا تُنسى"
          lead="جدار الذاكرة البصري: لقطات أرشيفية موثقة إلى جانب اللقطات التفسيرية الموسومة بصراحة. اضغط أي لوحة لفتحها مع مصدرها وبياناتها."
        />

        <Reveal delay={100}>
          <p className="font-mono-x mt-8 flex items-center gap-2 text-[10px] tracking-[0.3em] text-mute/60">
            <Images size={13} className="text-gold/60" />
            الجاهز أولًا — ثم المراجع الخارجية الموثقة
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item, i) => {
            const thumb = assetById(item.assetId)?.url;
            const placeholder = item.mediaStatus === "placeholder";
            const interpretive = item.authenticity === "interpretive";
            const wide = i % 5 === 0;
            return (
              <Reveal
                key={item.id}
                delay={(i % 4) * 90}
                variant="clip"
                className={cn(wide && "col-span-2")}
              >
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="group corner-frame relative block w-full overflow-hidden text-start"
                  aria-label={`فتح: ${item.title}`}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.title}
                      className={cn(
                        "w-full object-cover transition-transform duration-[1.8s] ease-[cubic-bezier(0.22,0.8,0.24,1)] group-hover:scale-[1.05]",
                        wide ? "aspect-[16/9]" : "aspect-[3/4]"
                      )}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : item.sourceUrl ? (
                    <div
                      className={cn(
                        "relative grid w-full place-items-center overflow-hidden border border-gold/25 bg-[radial-gradient(100%_100%_at_50%_0%,#141b28_0%,#0a1017_75%)]",
                        wide ? "aspect-[16/9]" : "aspect-[3/4]"
                      )}
                    >
                      <div className="relative px-6 text-center">
                        <p className="font-mono-x text-[9px] tracking-[0.3em] text-gold/70">
                          مجموعة أرشيفية خارجية
                        </p>
                        <p className="font-display mt-2.5 text-xl font-bold leading-snug text-paper">
                          {item.title}
                        </p>
                        <p className="font-mono-x mt-2 text-[8px] tracking-[0.25em] text-gold-bright/80">
                          استكشف المصدر الأصلي ←
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "grid w-full place-items-center border border-line bg-[radial-gradient(100%_100%_at_50%_0%,#121a26_0%,#0a1017_75%)]",
                        wide ? "aspect-[16/9]" : "aspect-[3/4]"
                      )}
                    >
                      <span className="font-mono-x px-6 text-center text-[10px] leading-6 tracking-[0.3em] text-mute">
                        {item.title}
                      </span>
                    </div>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                  {placeholder && item.sourceUrl && (
                    <span className="font-mono-x absolute right-3 top-3 border border-line bg-ink/75 px-2 py-0.5 text-[8px] tracking-[0.2em] text-paper-dim/80 backdrop-blur-sm">
                      أرشيف خارجي
                    </span>
                  )}
                  {interpretive && !placeholder && (
                    <span className="font-mono-x absolute right-3 top-3 border border-gold/40 bg-ink/75 px-2 py-0.5 text-[8px] tracking-[0.2em] text-gold-bright backdrop-blur-sm">
                      إعادة تصور بصرية
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="font-mono-x block text-[8px] tracking-[0.3em] text-gold/80">
                      لوحة {String(i + 1).padStart(2, "0")}{item.date ? ` · ${item.date}` : ""}
                    </span>
                    <span className="font-display mt-1 block text-lg font-bold leading-snug text-paper">
                      {item.title}
                    </span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      <ArchiveModal item={active} items={items} onNavigate={setActive} onClose={() => setActive(null)} />
    </section>
  );
}
