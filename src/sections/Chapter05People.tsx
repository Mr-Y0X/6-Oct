import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { ChapterHeading, Reveal } from "@/components/ui/Reveal";
import ChapterMedia from "@/components/media/ChapterMedia";
import { people } from "@/data/people";
import type { Person } from "@/data/types";
import { mediaByPerson } from "@/data/media";

/**
 * الفصل الخامس — «القيادة والقرار»
 * بطاقات بورتريه بطراز صالات الأرشيف: أرقام لوحات، إطارات ذهبية،
 * والبورتريهات الموثقة من السجل المركزي مع تنقل بين صور الشخصية.
 */

function PersonCard({ p }: { p: Person }) {
  /* كل الصور الجاهزة لهذه الشخصية من assets.json */
  const portraits = mediaByPerson(p.id).filter((m) => m.file && m.status === "ready");
  const [sel, setSel] = useState(0);
  const current = portraits[Math.min(sel, Math.max(0, portraits.length - 1))];
  const portrait = p.image ?? current?.file ?? null;

  return (
    <article className="group plate relative h-full overflow-hidden p-6 transition-transform duration-500 hover:-translate-y-1.5">
      {/* بورتريه موثق من السجل المركزي — أو بطاقة تعريفية بنقش أرشيفي */}
      <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden border border-gold/25">
        {portrait ? (
          <figure className="h-full w-full overflow-hidden">
            <img
              key={current?.id ?? p.image}
              src={portrait}
              alt={`بورتريه ${p.name}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{
                objectPosition: (!p.image && current?.focus) || "50% 18%",
                transform: !p.image && current?.zoom ? `scale(${current.zoom})` : undefined,
              }}
              loading="lazy"
              decoding="async"
            />
            {!p.image && current && (
              <figcaption className="font-mono-x absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2.5 pb-1.5 pt-6 text-center text-[8px] leading-4 tracking-[0.12em] text-paper-dim/90">
                      {current.date ? `${current.date} · ${current.source ?? ""}`.trim() : (current.source ?? "")}
              </figcaption>
            )}
          </figure>
        ) : (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(120%_120%_at_50%_0%,#141d29_0%,#0a1017_70%)]">
            {/* نقش صامت بدل وجوه غير موثقة */}
            <svg viewBox="0 0 120 120" className="h-2/3 w-2/3 opacity-70" aria-hidden="true">
              <circle cx="60" cy="44" r="18" fill="none" stroke="#cfa64f" strokeWidth="1" opacity="0.5" />
              <path
                d="M22 98 C 28 74, 46 66, 60 66 C 74 66, 92 74, 98 98"
                fill="none"
                stroke="#cfa64f"
                strokeWidth="1"
                opacity="0.5"
              />
              <rect x="6" y="6" width="108" height="108" fill="none" stroke="#cfa64f" strokeWidth="0.5" opacity="0.35" />
              <rect x="12" y="12" width="96" height="96" fill="none" stroke="#cfa64f" strokeWidth="0.5" opacity="0.2" />
            </svg>
                      <span className="stamp absolute bottom-3 text-[7px]">بطاقة تعريفية</span>
          </div>
        )}
        <span className="font-mono-x absolute left-2.5 top-2.5 border border-gold/40 bg-ink/70 px-2 py-1 text-[8px] tracking-[0.25em] text-gold/90 backdrop-blur-sm">
          {p.archivalNo}
        </span>
      </div>

      {/* عدّاد صور الشخصية */}
      {portraits.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5" role="group" aria-label={`صور ${p.name}`}>
          {portraits.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSel(idx)}
              aria-label={`صورة ${idx + 1} لـ${p.name}`}
              aria-pressed={idx === sel}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === sel ? "w-6 bg-gold" : "w-2.5 bg-line hover:bg-gold/50"
              )}
            />
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <h3 className="font-display text-2xl font-bold text-paper transition-colors duration-300 group-hover:text-gold-bright">
          {p.name}
        </h3>
        <p className="font-mono-x mt-2 text-[10px] leading-5 tracking-[0.12em] text-gold/75">
          {p.role}
        </p>
        <div className="hairline mx-auto mt-4 w-16" />
        <p className="mt-4 text-[12.5px] leading-6 text-mute">{p.shortBio}</p>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-[9px] text-mute/50">
        <BadgeCheck size={11} className="text-gold/50" />
        {portraits.length > 0
          ? `${portraits.length} ${portraits.length === 1 ? "بورتريه موثق" : portraits.length === 2 ? "بورتريهان موثقان" : "بورتريهات موثقة"} — ${portraits[0]?.source ?? p.source}`
          : p.source}
      </p>
    </article>
  );
}

export default function Chapter05People() {
  return (
    <section
      id="people"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="الفصل الخامس — القيادة والقرار"
    >
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <ChapterHeading
          no={5}
          kicker="الفصل الخامس"
          title="القيادة والقرار"
          lead="صالة القيادات في الأرشيف: بطاقات تعريفية مقتضبة بأدوارها العسكرية في أكتوبر 1973 — والصور الرسمية الموثقة تُضاف فور اعتمادها."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 120} variant="up">
              <PersonCard p={p} />
            </Reveal>
          ))}
        </div>

        <Reveal variant="fade">
          <p className="mx-auto mt-14 max-w-2xl text-center text-[12px] leading-7 text-mute/70">
            يقف خلف كل اسم في هذه الصفحة آلاف الأسماء التي عبرت وخططت وقاتلت.
            بيانات الشخصيات وصورها من الأرشيف الرسمي الموثق، وتُحدَّث دون تغيير الواجهة.
          </p>
        </Reveal>

        {/* وثائق / صور قيادة / تسجيلات الفصل الخامس */}
        <Reveal variant="up">
          <ChapterMedia chapter="05" limit={4} title="وثائق وصور قيادة وتسجيلات — من مواد هذا الفصل" />
        </Reveal>
      </div>
    </section>
  );
}
