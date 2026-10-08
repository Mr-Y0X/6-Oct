import type { AssetManifestEntry } from "./types";
import { mediaAssets, mediaById } from "./media";

/**
 * سجل الأصول (Asset Manifest) — طبقة توافق
 * ---------------------------------------------------------------
 * المصدر المركزي الحقيقي هو src/data/assets.json (عبر ./media).
 * هذا الملف يُبقي واجهة assetById القديمة عاملة لكل المكونات،
 * مع تحويل MediaAsset إلى الشكل القديم تلقائيًا.
 */

function toLegacy(id: string): AssetManifestEntry | undefined {
  const m = mediaById(id);
  if (!m) return undefined;
  if (!m.file && !m.embedUrl) return undefined;
  return {
    id: m.id,
    type: m.type,
    title: m.title,
    url: (m.file ?? m.embedUrl ?? "") as string,
    poster: m.poster ?? undefined,
    date: m.date ?? undefined,
    description: m.description,
    interpretive: m.authenticity === "interpretive",
    source: m.source ?? undefined,
    sourceUrl: m.sourceUrl ?? undefined,
    credit: m.credit ?? undefined,
    rights: m.rights ?? undefined,
  };
}

export const assets: AssetManifestEntry[] = mediaAssets
  .filter((m) => m.file || m.embedUrl)
  .map((m) => ({
    id: m.id,
    type: m.type,
    title: m.title,
    url: (m.file ?? m.embedUrl ?? "") as string,
    poster: m.poster ?? undefined,
    date: m.date ?? undefined,
    description: m.description,
    interpretive: m.authenticity === "interpretive",
    source: m.source ?? undefined,
    sourceUrl: m.sourceUrl ?? undefined,
    credit: m.credit ?? undefined,
    rights: m.rights ?? undefined,
  }));

export const assetById = (id?: string): AssetManifestEntry | undefined =>
  id ? toLegacy(id) : undefined;
