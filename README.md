<div dir="rtl">

# حين عبرت مصر — أرشيف أكتوبر 1973 التفاعلي

متحف رقمي تفاعلي سينمائي عن حرب أكتوبر 1973: سرد من 9 فصول، خط زمني تفاعلي، خريطة قناة السويس،
أرشيف موثق (صور، وثائق، خرائط، تسجيلات، فيديوهات)، وتجربة صوتية — بالعربية أولًا.

</div>

## ✨ أبرز المزايا

- **9 فصول سردية سينمائية**: من «قبل العبور» حتى «ما بقي في الذاكرة» + خاتمة.
- **خط زمني تفاعلي** مرتبط بخريطة SVG توضيحية لجبهة القناة (الضفتان، العبور، الكباري، خط بارليف).
- **أرشيف رقمي موحد** يقرأ من `src/data/assets.json`: صور، وثائق، خرائط، تسجيلات، خطب، صحف —
  مع بحث وفلاتر (التاريخ، النوع، الفصل، المصدر، الشخص، الوسوم).
- **70 مادة أرشيفية** (53 جاهزة): صور حقيقية Public Domain، بورتريهات القادة الستة،
  14 فيديو رسميًا مضمّنًا (وزارة الدفاع، ماسبيرو، eXtra، CBC)، وثائق PDF، خرائط مرجعية.
- **تجربة صوتية**: أجواء محيطية لكل فصل + النشيد الوطني عند تفعيل الصوت + Sound Design مولّد محليًا.
- **توثيق صارم**: كل مادة تحمل مصدرها وتاريخها وحقوقها؛ واللقطات التفسيرية موسومة بصراحة.
- **عربي RTL**، دعم `prefers-reduced-motion`، تنقل بلوحة المفاتيح، وتحسينات أداء (lazy loading).

## 🛠️ التقنيات

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · GSAP (ScrollTrigger) · lucide-react

## 🚀 التشغيل محليًا

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # إنتاج dist/
npm run preview # معاينة نسخة الإنتاج
```

## ☁️ النشر على Vercel

المشروع جاهز (ملف `vercel.json` موجود):

- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

## 🗂️ هيكل الميديا

```
public/media/
  images/archival|leaders|documents|newspapers|panorama
  videos/archival|interviews
  audio/speeches|ambient|anthem
  maps/canal|crossing|timeline
  documents/archival
src/data/assets.json   ← السجل المركزي لكل الميديا
```

## ©️ المصادر والحقوق

المواد من: مكتبة الإسكندرية، وزارة الدفاع المصرية، الهيئة العامة للاستعلامات،
الهيئة الوطنية للإعلام (ماسبيرو)، الأمم المتحدة، CIA وWest Point عبر Commons —
كل مادة موثقة المصدر والترخيص داخل `assets.json` (راجع `MEDIA_REPORT.md`).

## 👥 فكرة وتطوير

**Mohamed Omar** · **Hany Khaled**

<div dir="rtl">
<small>من طلاب مدرسة WE للتكنولوجيا التطبيقية</small>
</div>
