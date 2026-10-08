/**
 * أنواع البيانات الأساسية للأرشيف الرقمي
 * كل عنصر محتوى يدعم التوثيق الكامل (المصدر، الحقوق، التاريخ، الائتمان)
 */

export interface Sourceable {
  /** جهة الأرشيف أو المصدر */
  source?: string;
  /** رابط المصدر */
  sourceUrl?: string;
  /** الائتمان / حقوق النشر المعروضة */
  credit?: string;
  /** بيان الحقوق */
  rights?: string;
}

export type ArchiveCategory =
  | "document"
  | "photo"
  | "video"
  | "audio"
  | "speech"
  | "map";

export interface TimelineEvent extends Sourceable {
  id: string;
  /** التاريخ النصي المعروض */
  date: string;
  /** الوقت — اتركه فارغًا إن كان غير موثق */
  time?: string;
  title: string;
  description: string;
  /** مُعرّف نقطة الخريطة المرتبطة (مزامنة الخريطة) */
  mapFocus?: string;
  /** وسائط مرتبطة من سجل الأصول */
  mediaId?: string;
}

export interface MapMarker {
  id: string;
  label: string;
  /** إحداثيات داخل viewBox 0 0 800 1000 */
  x: number;
  y: number;
  bank: "west" | "east";
  kind: "city" | "crossing" | "fort" | "army";
  note?: string;
}

export interface Person extends Sourceable {
  id: string;
  name: string;
  role: string;
  archivalNo: string;
  shortBio: string;
  /** اختياري — يمكن تركه فارغًا حتى يتوفر بورتريه موثق */
  image?: string;
}

export interface AssetManifestEntry extends Sourceable {
  id: string;
  type: "image" | "video" | "audio" | "document" | "map";
  title: string;
  /** مسار الملف داخل /public أو رابط خارجي */
  url: string;
  poster?: string;
  date?: string;
  description?: string;
  /** هل المادة لقطة فنية تفسيرية (غير أرشيفية)؟ */
  interpretive?: boolean;
}

/* ------------------------------------------------------------------ */
/* نظام الميديا الحقيقي — السجل المركزي src/data/assets.json            */
/* ------------------------------------------------------------------ */

/** الفصول السردية المرتبطة بالميديا */
export type ChapterId =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "finale"
  | "all";

/** درجة الأصالة — ممنوع تقديم interpretive على أنها archival */
export type Authenticity = "archival" | "interpretive";

/** حالة التوفر — placeholder = موضع محجوز واضح وليس مادة مزيفة */
export type MediaStatus = "ready" | "placeholder";

export type MediaType = "image" | "video" | "audio" | "document" | "map";

export type MediaCategory =
  | "archival"
  | "leaders"
  | "documents"
  | "newspapers"
  | "panorama"
  | "canal"
  | "crossing"
  | "timeline"
  | "speeches"
  | "anthem"
  | "ambient"
  | "interviews"
  | "interpretive";

export interface MediaAsset extends Sourceable {
  id: string;
  title: string;
  type: MediaType;
  category: MediaCategory;
  /** مسار الملف المحلي داخل /public/media أو /images — null إن لم تتوفر المادة */
  file: string | null;
  /** رابط embed رسمي (يوتيوب رسمي / أرشيف رسمي) — null إن لم يتوفر */
  embedUrl: string | null;
  poster?: string | null;
  speaker?: string | null;
  /** معرّف الشخصية المرتبطة (من people.ts) */
  person?: string | null;
  /** تجاوز nullable لحقول Sourceable — لأن assets.json يستخدم null صراحة */
  source?: string | null;
  sourceUrl?: string | null;
  credit?: string | null;
  rights?: string | null;
  date?: string | null;
  description?: string;
  tags: string[];
  chapter: ChapterId[];
  authenticity: Authenticity;
  status: MediaStatus;
  durationLabel?: string;
  /** الترخيص — null/unknown عند عدم المعرفة، ممنوع الافتراض */
  license?: string | null;
  /** سياسة الاستخدام: local | embed | external —Default external */
  usage?: string | null;
  /** تركيز عرض البورتريه (object-position) — لإبراز الشخصية فقط */
  focus?: string | null;
  /** تقريب عرض البورتريه (مضاعف scale) — لإبراز الشخصية فقط */
  zoom?: number | null;
}

export interface ArchiveItem extends Sourceable {
  id: string;
  category: ArchiveCategory;
  title: string;
  date?: string;
  description: string;
  tags: string[];
  /** مرجع إلى أصل من سجل الأصول */
  assetId?: string;
  /** لمحتوى الفيديو الخارجي */
  youtubeId?: string;
  /** صفحات الوثيقة (صور ممسوحة) */
  pages?: string[];
  /** مدة الصوت النصية عند غياب الملف */
  durationLabel?: string;
  /** --- حقول نظام الميديا الحقيقي (اختيارية للتوافق) --- */
  /** معرّف المادة في assets.json */
  mediaRef?: string;
  /** المتحدث (للتسجيلات والخطب) */
  speaker?: string;
  /** الفصول المرتبطة */
  chapter?: ChapterId[] | string[];
  /** درجة الأصالة */
  authenticity?: Authenticity | string;
  /** حالة التوفر */
  mediaStatus?: MediaStatus | string;
}
