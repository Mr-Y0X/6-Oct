/**
 * تنسيق الوقت بنظام 12 ساعة مع ص/م
 * "13:58" ← "01:58 م" · "02:15" ← "02:15 ص" · "14:05 تقريبًا" ← "02:05 م تقريبًا"
 * أي نص بلا نمط HH:MM يُمرَّر كما هو دون تغيير.
 */
export function to12h(input: string): string {
  const m = input.match(/(\d{1,2}):(\d{2})/);
  if (!m) return input;
  let h = Number(m[1]);
  if (h < 0 || h > 23) return input;
  const min = m[2];
  const period = h < 12 ? "ص" : "م";
  h = h % 12;
  if (h === 0) h = 12;
  return input.replace(
    /(\d{1,2}):(\d{2})/,
    `${String(h).padStart(2, "0")}:${min} ${period}`
  );
}
