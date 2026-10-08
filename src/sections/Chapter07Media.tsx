import { useState } from "react";
import { Radio, Signal, Tv, Volume2 } from "lucide-react";
import { ChapterHeading, Reveal } from "@/components/ui/Reveal";
import { AudioPlayer, VideoPlayer } from "@/components/media/Players";
import ArchiveModal from "@/components/media/ArchiveModal";
import type { ArchiveItem } from "@/data/types";
import { unifiedArchive, videoForAudioRef } from "@/data/media";
import { audioManager } from "@/audio/audioManager";

const FREQUENCIES = [
  { freq: "88.2 MHz", label: "إذاعة القاهرة — البيانات العسكرية", sound: "radio-tuning" as const },
  { freq: "102.4 MHz", label: "صوت العرب — نقل وقائع الجبهة", sound: "radio-tuning" as const },
  { freq: "14.200 kHz", label: "الإشارة التكتيكية (مورس)", sound: "morse" as const },
];

export default function Chapter07Media() {
  const [active, setActive] = useState<ArchiveItem | null>(null);
  const [activeFreq, setActiveFreq] = useState(0);

  const audios = unifiedArchive.filter((i) => i.category === "audio" || i.category === "speech");
  const videos = unifiedArchive.filter((i) => i.category === "video");

  /* التسجيل المحجوز ← الفيديو الرسمي الذي يحمل صوته الأصلي */
  const videoForAudio = (audioId: string) => {
    const item = audios.find((x) => x.id === audioId);
    return videoForAudioRef(item?.mediaRef) ?? null;
  };

  const tuneRadio = async (idx: number, sound: "radio-tuning" | "morse") => {
    setActiveFreq(idx);
    await audioManager.setEnabled(true);
    audioManager.play(sound);
  };

  return (
    <section
      id="media"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="الفصل السابع — الصوت والصورة"
    >
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <ChapterHeading
          no={7}
          kicker="الفصل السابع"
          title="الصوت والصورة"
          lead="أرشيف حي للتسجيلات التاريخية والأفلام الوثائقية وبيانات الجبهة العسكرية — موثقة ومتاحة للمشاهدة والاستماع المباشر."
        />

        {/* مذياع الترددات التكتيكية */}
        <Reveal variant="up" delay={80}>
          <div className="plate corner-frame mt-12 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="font-mono-x flex items-center gap-2 text-xs tracking-[0.2em] text-gold/80">
                  <Signal size={14} className="animate-pulse text-gold" />
                  مستقبل الترددات اللاسلكية التاريخية
                </span>
                <h3 className="font-display mt-2 text-2xl font-bold text-paper">
                  أثير أكتوبر 1973
                </h3>
                <p className="mt-1 text-sm text-mute">
                  اضغط على أي موجة لتفعيل تردد الإشارة والاستماع للمحاكاة الصوتية.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {FREQUENCIES.map((f, idx) => (
                  <button
                    key={f.freq}
                    type="button"
                    onClick={() => tuneRadio(idx, f.sound)}
                    className={`border px-4 py-2.5 text-xs transition-all duration-300 ${
                      activeFreq === idx
                        ? "border-gold bg-gold/15 text-gold-bright shadow-[0_0_16px_rgba(207,166,79,0.3)]"
                        : "border-line text-mute hover:border-gold/40 hover:text-paper"
                    }`}
                  >
                    <span className="font-mono-x block font-bold text-gold-bright">{f.freq}</span>
                    <span className="mt-0.5 block text-[10.5px] opacity-80">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* منصة الفيديوهات الأرشيفية */}
        <div className="mt-16 space-y-12">
          {videos.map((vid, i) => (
            <div
              key={vid.id}
              className={`grid items-center gap-8 lg:grid-cols-[1.25fr_1fr] ${
                i % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              <Reveal variant="clip" className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <figure className="corner-frame p-1">
                  <VideoPlayer item={vid} />
                  <figcaption className="font-mono-x flex items-center justify-between px-2 py-2.5 text-[9px] tracking-[0.2em] text-mute/70">
                    <span className="flex items-center gap-2">
                      <Tv size={11} className="text-gold/60" />
                      {vid.title}
                    </span>
                    <span>{vid.date}</span>
                  </figcaption>
                </figure>
              </Reveal>

              <div className={i % 2 === 1 ? "lg:col-start-1" : ""}>
                <Reveal delay={120}>
                  <span className="font-mono-x text-xs text-gold/80">توثيق مرئي / {vid.date}</span>
                  <h3 className="font-display mt-2 text-2xl font-bold text-paper md:text-3xl">
                    {vid.title}
                  </h3>
                </Reveal>
                <Reveal delay={180}>
                  <p className="mt-4 text-sm leading-8 text-mute md:text-base">
                    {vid.description}
                  </p>
                </Reveal>
                <Reveal delay={240}>
                  <div className="mt-5 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActive(vid)}
                      className="border border-gold/40 px-5 py-2.5 text-xs text-gold-bright transition-all duration-300 hover:border-gold hover:bg-gold/10"
                    >
                      بطاقة التوثيق والمصدر
                    </button>
                    <span className="text-[11px] text-mute/60">{vid.source}</span>
                  </div>
                </Reveal>
              </div>
            </div>
          ))}
        </div>

        {/* الأدراج الصوتية والبيانات العسكرية */}
        <div className="mt-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <Radio size={20} className="text-gold/80" />
              <h3 className="font-display text-2xl font-bold text-paper md:text-3xl">
                التسجيلات والبيانات الإذاعية
              </h3>
            </div>
          </Reveal>

          <div className="mt-8 space-y-8">
            {audios.map((a, i) => {
              const via = videoForAudio(a.id);
              const pending = a.mediaStatus === "placeholder";
              /* التسجيل المحجوز يُعرض عبر الفيديو الرسمي الذي يحمل صوته الأصلي — يعمل فورًا */
              if (pending && via) {
                return (
                <Reveal key={a.id} delay={i * 90}>
                  <div className="grid gap-3 md:grid-cols-[60px_1fr] md:items-start">
                    <span className="font-mono-x hidden text-xl tracking-widest text-gold/25 md:block md:pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-display text-xl font-bold text-paper">{a.title}</h4>
                        <span className="font-mono-x text-[10px] tracking-[0.2em] text-mute/70">
                          {a.date ?? ""}
                          {a.speaker ? ` · ${a.speaker}` : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] leading-6 text-mute">{a.description}</p>
                      <div className="corner-frame mt-4">
                        <VideoPlayer item={via} />
                      </div>
                      <p className="mt-2.5 text-[11px] text-mute/70">
                        المصدر: <span className="text-paper-dim">{via.source}</span>
                        {" · "}
                        <button
                          type="button"
                          onClick={() => setActive(via)}
                          className="text-gold-bright underline-offset-4 hover:underline"
                        >
                          بطاقة التوثيق والمصدر
                        </button>
                      </p>
                    </div>
                  </div>
                </Reveal>
                );
              }
              return (
              <Reveal key={a.id} delay={i * 90}>
                <div className="grid gap-3 md:grid-cols-[60px_1fr] md:items-center">
                  <span className="font-mono-x hidden text-xl tracking-widest text-gold/25 md:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative">
                    <AudioPlayer item={a} compact />
                  </div>
                </div>
              </Reveal>
              );
            })}
          </div>

          <Reveal variant="fade">
            <p className="mt-8 flex items-center gap-2 text-[11px] text-mute/70">
              <Volume2 size={13} className="text-gold/60" />
              مشغل التسجيلات جاهز للملفات الموثقة من الإذاعة والتلفزيون — لا يُعرض أي تسجيل
              على أنه «موثق» أو «أصلي» إلا بمصدر معروف. المؤثرات (typewriter / clock tick /
              radio noise / pulse / whoosh) هي Sound Design للموقع وليست تسجيلات تاريخية.
            </p>
          </Reveal>
        </div>
      </div>

      <ArchiveModal item={active} items={[...videos, ...audios]} onNavigate={setActive} onClose={() => setActive(null)} />
    </section>
  );
}
