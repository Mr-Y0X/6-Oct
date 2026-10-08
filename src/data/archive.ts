import type { ArchiveItem } from "./types";
import { unifiedArchive } from "./media";

/**
 * جسر الأرشيف — يُبقي الواردات القديمة عاملة
 * المصدر الحقيقي: src/data/assets.json عبر unifiedArchive
 * حُذفت معرّفات يوتيوب العشوائية غير الموثقة — الفيديو الآن
 * موضع محجوز صادق حتى يتوفر embed رسمي.
 */

export const archiveCategories: { id: ArchiveItem["category"] | "all"; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "document", label: "الوثائق والبيانات" },
  { id: "photo", label: "الصور" },
  { id: "video", label: "الفيديو" },
  { id: "audio", label: "التسجيلات الصوتية" },
  { id: "speech", label: "الخطب التاريخية" },
  { id: "map", label: "الخرائط التكتيكية" },
];

/** كل المواد مشتقة من assets.json — لا مواد وهمية */
export const archiveItems: ArchiveItem[] = unifiedArchive;

export const archiveTags: string[] = Array.from(
  new Set(archiveItems.flatMap((i) => i.tags))
);
