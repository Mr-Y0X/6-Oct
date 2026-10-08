import raw from "./assets.json";
import type {
  ArchiveCategory,
  ArchiveItem,
  ChapterId,
  MediaAsset,
} from "./types";

/**
 * السجل المركزي للميديا — يقرأ مباشرة من src/data/assets.json
 * ---------------------------------------------------------------
 * القاعدة الذهبية: لا تُضف أي مادة وهمية. ما ليس جاهزًا يبقى
 * status=placeholder ويُعرض كموضع محجوز واضح.
 */

export const mediaAssets: MediaAsset[] = (raw as unknown as { assets: MediaAsset[] }).assets;

export const mediaById = (id?: string | null): MediaAsset | undefined =>
  id ? mediaAssets.find((a) => a.id === id) : undefined;

/** مواد جاهزة فقط (لها ملف أو embed رسمي) */
export const readyMedia = (): MediaAsset[] =>
  mediaAssets.filter(
    (a) => a.status === "ready" && (Boolean(a.file) || Boolean(a.embedUrl))
  );

/** مواد فصل معين — تتضمن المواضع المحجوزة بترتيب: الجاهز أولًا */
export function mediaByChapter(ch: ChapterId): MediaAsset[] {
  return mediaAssets
    .filter((a) => a.chapter.includes(ch) || a.chapter.includes("all"))
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "ready" ? -1 : 1));
}

/** مواد شخصية قيادية (3–5 صور لكل شخصية عند توفرها) */
export function mediaByPerson(personId: string): MediaAsset[] {
  return mediaAssets.filter((a) => a.person === personId);
}

/** بحث شامل: title + description + tags + speaker + source */
export function searchMedia(q: string, pool: MediaAsset[] = mediaAssets): MediaAsset[] {
  const query = q.trim();
  if (!query) return pool;
  return pool.filter((a) => {
    const hay = `${a.title} ${a.description ?? ""} ${(a.tags ?? []).join(" ")} ${a.speaker ?? ""} ${a.source ?? ""}`;
    return hay.includes(query);
  });
}

/* ------------------------------------------------------------------ */
/* جسر التوافق: تحويل MediaAsset إلى ArchiveItem للواجهات الحالية       */
/* ------------------------------------------------------------------ */

const TYPE_TO_CATEGORY: Record<MediaAsset["type"], ArchiveCategory> = {
  image: "photo",
  video: "video",
  audio: "audio",
  document: "document",
  map: "map",
};

function categoryForSpeech(a: MediaAsset): ArchiveCategory {
  if (a.category === "speeches") return "speech";
  return TYPE_TO_CATEGORY[a.type];
}

/** استخراج youtubeId من embedUrl رسمي عند الحاجة */
function youtubeIdFromEmbed(embedUrl: string | null): string | undefined {
  if (!embedUrl) return undefined;
  const m =
    embedUrl.match(/[?&]v=([\w-]{6,})/) ??
    embedUrl.match(/youtu\.be\/([\w-]{6,})/) ??
    embedUrl.match(/embed\/([\w-]{6,})/);
  return m?.[1];
}

export function toArchiveItem(a: MediaAsset): ArchiveItem {
  return {
    id: a.id,
    category: categoryForSpeech(a),
    title: a.title,
    date: a.date ?? undefined,
    description:
      a.description ??
      "مادة أرشيفية من سجل المتحف — بياناتها ومصدرها الكامل داخل البطاقة.",
    tags: a.tags ?? [],
    source: a.source ?? undefined,
    sourceUrl: a.sourceUrl ?? undefined,
    credit: a.credit ?? undefined,
    rights: a.rights ?? undefined,
    youtubeId: youtubeIdFromEmbed(a.embedUrl),
    pages: a.type === "document" && a.file ? [a.file] : undefined,
    durationLabel: a.durationLabel ?? undefined,
    // ربط إضافي عبر حقول موسعة (تُقرأ من mediaById عند العرض)
    assetId: a.file ? a.id : undefined,
    mediaRef: a.id,
    speaker: a.speaker ?? undefined,
    chapter: a.chapter,
    authenticity: a.authenticity,
    mediaStatus: a.status,
  };
}

/** كل الأرشيف مشتق من assets.json — مرتب: الجاهز أولًا ثم المحجوز */
export const unifiedArchive: ArchiveItem[] = mediaAssets.map(toArchiveItem);

/* التسجيل المحجوز ← الفيديو الرسمي الذي يحمل صوته الأصلي (يعمل فورًا) */
export const AUDIO_PLAYS_VIA: Record<string, string> = {
  "aud-radio-communique-7": "vid-communique-7",
  "aud-sadat-excerpt": "vid-sadat-speech",
};

export function videoForAudioRef(audioMediaRef?: string): ArchiveItem | undefined {
  if (!audioMediaRef) return undefined;
  const target = AUDIO_PLAYS_VIA[audioMediaRef];
  if (!target) return undefined;
  return unifiedArchive.find((x) => x.mediaRef === target);
}

/* خريطة الفصول السردية — النص → الصورة → الوثيقة → الخريطة → الصوت → الفيديو → المصدر */
export const CHAPTER_MEDIA_ORDER: Record<string, MediaAsset["type"][]> = {
  "01": ["document", "map", "image"],
  "02": ["image", "audio", "video"],
  "03": ["video", "image", "map"],
  "04": ["image", "map", "video"],
  "05": ["document", "image", "audio"],
  "06": ["document", "map", "image"],
  "07": ["audio", "video", "document"],
  "08": ["image", "video"],
  "09": ["image", "document", "video"],
  finale: ["image", "video", "audio"],
};
