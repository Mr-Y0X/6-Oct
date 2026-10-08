import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import Opening from "@/components/opening/Opening";
import Atmosphere from "@/components/effects/Atmosphere";
import ChapterAmbience from "@/components/effects/ChapterAmbience";
import { CustomCursor, Header, ScrollProgressBar } from "@/components/ui/Chrome";
import Chapter01 from "@/sections/Chapter01";
import Chapter02 from "@/sections/Chapter02";
import Chapter03 from "@/sections/Chapter03";
import Chapter04Map from "@/sections/Chapter04Map";
import Chapter05People from "@/sections/Chapter05People";
import Chapter06Archive from "@/sections/Chapter06Archive";
import Chapter07Media from "@/sections/Chapter07Media";
import Chapter08Gallery from "@/sections/Chapter08Gallery";
import Chapter09Memory from "@/sections/Chapter09Memory";
import Finale from "@/sections/Finale";

/**
 * «حين عبرت مصر» — أرشيف رقمي تفاعلي سينمائي عن أكتوبر 1973
 * الترتيب: الافتتاحية ثم تسعة فصول سردية ثم الخاتمة، مترابطة بالتمرير.
 */
export default function App() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    if (document.fonts) {
      document.fonts.ready.then(refresh).catch(() => undefined);
    }
    const t = window.setTimeout(refresh, 1200);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <>
      <a
        href="#chapter-01"
        className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[200] focus:border focus:border-gold focus:bg-ink focus:px-4 focus:py-2 focus:text-gold-bright"
      >
        تخطَّ إلى المحتوى
      </a>

      <Atmosphere />
      <ChapterAmbience />
      <Header />
      <ScrollProgressBar />
      <CustomCursor />

      <main>
        <Opening />
        <Chapter01 />
        <Chapter02 />
        <Chapter03 />
        <Chapter04Map />
        <Chapter05People />
        <Chapter06Archive />
        <Chapter07Media />
        <Chapter08Gallery />
        <Chapter09Memory />
        <Finale />
      </main>

      {/* طبقات الفيلم العامة */}
      <div className="film-grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
    </>
  );
}
