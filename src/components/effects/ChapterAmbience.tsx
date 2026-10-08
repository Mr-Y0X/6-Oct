import { useEffect } from "react";
import { audioManager, type AmbientMood } from "@/audio/audioManager";

/**
 * أجواء صوتية ديناميكية حسب الفصل المرئي في منتصف الشاشة
 * - fade in/out + crossfade تلقائي (داخل audioManager — لا تراكم)
 * - لا يبدأ إلا بعد تفعيل الصوت (زر الصوت) — يحترم سياسات autoplay
 * - الافتتاحية بلا مزاج (لها أصواتها الخاصة) = صمت تلقائي
 */
const MAP: [string, AmbientMood][] = [
  ["chapter-01", "calm"],
  ["chapter-02", "tense"],
  ["chapter-03", "crossing"],
  ["map", "water"],
  ["people", "command"],
  ["archive", "archive"],
  ["media", "voices"],
  ["gallery", "quiet"],
  ["memory", "finale"],
  ["finale", "finale"],
];

export default function ChapterAmbience() {
  useEffect(() => {
    let raf = 0;
    let last: AmbientMood | null | undefined = undefined;

    const pick = () => {
      raf = 0;
      const cy = window.innerHeight / 2;
      let best: AmbientMood | null = null;
      let bestD = Infinity;
      for (const [id, mood] of MAP) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const d = Math.abs(r.top + r.height / 2 - cy);
        if (d < bestD) {
          bestD = d;
          best = mood;
        }
      }
      if (best !== last) {
        last = best;
        audioManager.setAmbientMood(best);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
