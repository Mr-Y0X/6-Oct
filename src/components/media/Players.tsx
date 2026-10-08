import { useEffect, useMemo, useRef, useState } from "react";
import {
  ExternalLink,
  Film,
  Maximize,
  Mic2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { ArchiveItem } from "@/data/types";
import { assetById } from "@/data/assets";
import { mediaById } from "@/data/media";
import { audioManager } from "@/audio/audioManager";
import SourceBadge from "./SourceBadge";

/* ------------------------------------------------------------ */
/* مولّد شكل موجي شبه عشوائي ثابت لكل عنصر                       */
/* ------------------------------------------------------------ */
function seededBars(seed: string, count: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, () => 0.18 + rand() * 0.82);
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return "--:--";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

function metaFor(item: ArchiveItem) {
  const media = item.mediaRef ? mediaById(item.mediaRef) : undefined;
  const asset = assetById(item.assetId);
  return { media, asset };
}

/* ------------------------------------------------------------ */
/* مشغل صوت تاريخي منفصل — للتسجيلات والخطب فقط                   */
/* المؤثرات (typewriter/clock/radio/pulse/whoosh) تبقى Sound     */
/* Design للموقع ولا تُعرض هنا كتسجيلات تاريخية.                 */
/* ------------------------------------------------------------ */
export function AudioPlayer({
  item,
  compact = false,
}: {
  item: ArchiveItem;
  compact?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const { media, asset } = metaFor(item);
  const fileUrl = media?.file ?? asset?.url;
  const hasAudio =
    Boolean(fileUrl) && /\.(mp3|ogg|wav|m4a)$/i.test(fileUrl ?? "");
  const pending = !hasAudio;
  const speaker = item.speaker ?? media?.speaker ?? null;

  const bars = useMemo(() => seededBars(item.id, 64), [item.id]);

  /* رسم الشكل الموجي */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const bw = w / bars.length;
    const progress = dur > 0 ? cur / dur : 0;
    bars.forEach((b, i) => {
      const bh = b * (h - 8);
      const x = i * bw + bw * 0.22;
      const y = (h - bh) / 2;
      const played = i / bars.length <= progress;
      ctx.fillStyle = played
        ? "rgba(236,210,143,0.95)"
        : pending
          ? "rgba(138,148,160,0.28)"
          : "rgba(207,166,79,0.3)";
      ctx.fillRect(x, y, bw * 0.56, bh);
    });
  }, [bars, cur, dur, pending]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.volume = vol;
      el.muted = muted;
    }
  }, [vol, muted]);

  /* إغلاق العارف أثناء التشغيل يعيد مستوى الخلفية */
  useEffect(() => () => audioManager.setDucked(false), []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el || pending) return;
    if (playing) el.pause();
    else void el.play().catch(() => undefined);
  };

  const seek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const el = audioRef.current;
    if (!el || !dur || pending) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  };

  /* بدون ملف صوتي: بطاقة سياق تاريخي مكتملة — لا مشغل وهمي ولا نص انتظار */
  if (pending) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden border border-gold/25 bg-[radial-gradient(120%_120%_at_50%_0%,#141b28_0%,#0a1017_75%)]",
          compact ? "p-4" : "p-5 md:p-6"
        )}
        data-cursor
      >
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-bright">
            <Mic2 size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-paper">{item.title}</p>
            <p className="mt-1 truncate text-[11px] text-mute/80">
              {[item.speaker ? `المتحدث: ${item.speaker}` : null, item.date].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        {item.description && (
          <p className="mt-3 border-r-2 border-gold/50 pr-3 text-[12px] leading-6 text-mute">
            {item.description}
          </p>
        )}
        {/* الشكل الموجي الزخرفي — هوية بصرية لا توحي بتشغيل */}
        <canvas
          ref={canvasRef}
          className="mt-3 h-10 w-full opacity-60"
          role="img"
          aria-label="زخرفة صوتية أرشيفية"
        />
        <p className="mt-3 text-[11px] text-mute/80">
          المصدر: <span className="text-paper-dim">{item.source ?? "—"}</span>
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full border border-line bg-navy-2/70",
        compact ? "p-4" : "p-5 md:p-6"
      )}
      data-cursor
    >
      <audio
        ref={audioRef}
        src={fileUrl}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          audioManager.setDucked(true);
        }}
        onPause={() => {
          setPlaying(false);
          audioManager.setDucked(false);
        }}
        onEnded={() => {
          setPlaying(false);
          audioManager.setDucked(false);
        }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/60 text-gold-bright transition-all duration-300 hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(207,166,79,0.35)]"
        >
          {playing ? <Pause size={17} /> : <Play size={17} className="-mr-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold text-paper">{item.title}</p>
            <p className="font-mono-x shrink-0 text-[11px] tracking-wider text-mute">
              {`${fmt(cur)} / ${fmt(dur)}`}
            </p>
          </div>
          {(speaker || item.date) && (
            <p className="mt-1 truncate text-[11px] text-mute/80">
              {speaker ? `المتحدث: ${speaker}` : ""}
              {speaker && item.date ? " · " : ""}
              {item.date ?? ""}
            </p>
          )}
          <canvas
            ref={canvasRef}
            onClick={seek}
            className="mt-2 h-12 w-full cursor-pointer"
            role="img"
            aria-label="تمثيل موجي للتسجيل"
          />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "إلغاء الكتم" : "كتم"}
            className="text-mute transition-colors hover:text-gold-bright disabled:opacity-40"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={vol}
            onChange={(e) => setVol(Number(e.target.value))}
            className="volume"
            aria-label="مستوى الصوت"
          />
        </div>
      </div>

      {item.description && !compact && (
        <p className="mt-3 text-[12px] leading-6 text-mute">{item.description}</p>
      )}

      <SourceBadge
        source={item.source}
        sourceUrl={item.sourceUrl}
        date={item.date}
        credit={item.credit}
        chapter={item.chapter}
        authenticity={item.authenticity}
        className="mt-3"
      />
    </div>
  );
}

/* ------------------------------------------------------------ */
/* مشغل فيديو موحد — ملف محلي / embed رسمي / بطاقة مرجع أرشيفي */
/* يدعم: play/pause · mute · fullscreen · progress · poster      */
/* + source/credit · chapter · historical date                   */
/* ------------------------------------------------------------ */
export function VideoPlayer({ item }: { item: ArchiveItem }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const { media, asset } = metaFor(item);
  const fileUrl = media?.file ?? (asset?.type === "video" ? asset.url : undefined);
  const hasFile = Boolean(fileUrl);
  const poster = media?.poster ?? asset?.poster ?? undefined;
  const chapters = item.chapter
    ? Array.isArray(item.chapter)
      ? item.chapter.join(" · ")
      : item.chapter
    : null;

  const toggleFs = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    else void el.requestFullscreen?.().catch(() => undefined);
  };

  /* واجهة يوتيوب خفيفة — لا يُحمَّل الـ iframe إلا بضغطة المستخدم */
  if (item.youtubeId) {
    return (
      <figure>
        <div className="relative aspect-video w-full overflow-hidden border border-line bg-black">
          {activated ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setActivated(true)}
              className="group relative grid h-full w-full place-items-center"
              aria-label={`تشغيل فيديو: ${item.title}`}
            >
              <img
                src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-75"
                loading="lazy"
                decoding="async"
              />
              <span className="relative grid h-16 w-16 place-items-center rounded-full border border-gold/70 bg-black/60 text-gold-bright backdrop-blur transition-transform duration-300 group-hover:scale-110">
                <Play size={22} className="-mr-1" />
              </span>
            </button>
          )}
        </div>
        <VideoMeta item={item} chapters={chapters} />
      </figure>
    );
  }

  if (hasFile) {
    const progress = dur > 0 ? (cur / dur) * 100 : 0;
    return (
      <figure>
        <div ref={wrapRef} className="relative w-full overflow-hidden border border-line bg-black">
          <video
            ref={videoRef}
            className="aspect-video w-full"
            src={fileUrl}
            poster={poster}
            preload="none"
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (v.paused) void v.play().catch(() => undefined);
              else v.pause();
            }}
          />
          {/* شريط التحكم الموحد */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2.5 pt-8">
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (playing) v.pause();
                else void v.play().catch(() => undefined);
              }}
              aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
              className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 text-gold-bright transition-colors hover:bg-gold/15"
            >
              {playing ? <Pause size={14} /> : <Play size={14} className="-mr-0.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.muted = !muted;
                setMuted(!muted);
              }}
              aria-label={muted ? "إلغاء الكتم" : "كتم"}
              className="grid h-9 w-9 place-items-center text-paper-dim transition-colors hover:text-gold-bright"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <div
              className="group/bar relative h-1.5 flex-1 cursor-pointer bg-white/15"
              role="slider"
              aria-label="شريط التقدم"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              onClick={(e) => {
                const v = videoRef.current;
                if (!v || !dur) return;
                const rect = e.currentTarget.getBoundingClientRect();
                v.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
              }}
            >
              <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
            </div>
            <span className="font-mono-x text-[10px] tracking-wider text-paper-dim">
              {fmt(cur)} / {fmt(dur)}
            </span>
            <button
              type="button"
              onClick={toggleFs}
              aria-label="ملء الشاشة"
              className="grid h-9 w-9 place-items-center text-paper-dim transition-colors hover:text-gold-bright"
            >
              <Maximize size={15} />
            </button>
          </div>
        </div>
        <VideoMeta item={item} chapters={chapters} />
      </figure>
    );
  }

  /* مرجع أرشيفي خارجي — بطاقة مجموعة مكتملة بزر يعمل */
  return (
    <figure>
      <div className="relative grid aspect-video w-full place-items-center overflow-hidden border border-gold/25 bg-[radial-gradient(100%_100%_at_50%_0%,#141b28_0%,#0a1017_75%)]">
        <div className="noise-bg absolute inset-0 opacity-[0.05]" aria-hidden="true" />
        <div className="relative px-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/50 text-gold-bright">
            <Film size={22} />
          </span>
          <p className="font-display mt-4 text-xl text-paper/90">{item.title}</p>
          {item.date && (
            <p className="font-mono-x mt-2 text-[10px] tracking-[0.35em] text-mute">
              {item.date}
            </p>
          )}
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 border border-gold/50 bg-gold/[0.07] px-5 py-2.5 text-[12px] text-gold-bright transition-all duration-300 hover:border-gold hover:bg-gold/[0.14]"
            >
              استكشف الأرشيف الأصلي <ExternalLink size={12} />
            </a>
          ) : (
            <p className="mx-auto mt-3 max-w-md text-[11px] leading-5 text-mute/70">
              {item.description}
            </p>
          )}
        </div>
      </div>
      <VideoMeta item={item} chapters={chapters} />
    </figure>
  );
}

function VideoMeta({ item, chapters }: { item: ArchiveItem; chapters: string | null }) {
  return (
    <figcaption className="border border-t-0 border-line bg-navy-2/50 px-3 py-2.5">
      <div className="font-mono-x flex flex-wrap items-center justify-between gap-2 text-[9px] tracking-[0.2em] text-mute/70">
        <span className="text-paper-dim">{item.title}</span>
        <span>
          {[item.date, chapters ? `فصل ${chapters}` : null].filter(Boolean).join(" · ") || "—"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-mute">
        <span>
          المصدر: <span className="text-paper-dim">{item.source ?? "—"}</span>
        </span>
        {item.credit && (
          <span>
            Credit: <span className="text-paper-dim">{item.credit}</span>
          </span>
        )}
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gold-bright underline-offset-4 hover:underline"
          >
            المصدر <ExternalLink size={10} />
          </a>
        )}
      </div>
    </figcaption>
  );
}
