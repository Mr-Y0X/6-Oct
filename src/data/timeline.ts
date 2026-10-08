import type { TimelineEvent, MapMarker } from "./types";

/**
 * الخط الزمني التفاعلي — 6 أكتوبر 1973
 * ---------------------------------------------------------------
 * ملاحظة تحريرية: الصياغات مقتضبة عمدًا وتلتزم بالوقائع المتفق عليها
 * على نطاق واسع. أضِف أو عدّل الأحداث هنا فقط، وستنعكس تلقائيًا على
 * الخط الزمني والخريطة. لا تُدرج أي تفصيلة دون مصدر.
 */

export const WAR_DATE_LABEL = "6 أكتوبر 1973";
export const ZERO_HOUR_LABEL = "14:00";
export const COUNTDOWN_LABEL = "13:58";

export const timelineEvents: TimelineEvent[] = [
  {
    id: "t-1358",
    date: "6 أكتوبر 1973",
    time: "13:58",
    title: "دقائق ما قبل الصفر",
    description:
      "صمتٌ كامل على امتداد الجبهة. القوات في مواقعها، والمعدات عند خط الانتشار، في انتظار إشارة البدء.",
    mapFocus: "canal-front",
    source: "أرشيف المشروع",
  },
  {
    id: "t-1400",
    date: "6 أكتوبر 1973",
    time: "14:00",
    title: "ساعة الصفر",
    description:
      "انطلقت الضربة الجوية الأولى، وتزامن معها القصف المدفعي التمهيدي على مواقع العدو شرق القناة، معلنًا بدء العمليات.",
    mapFocus: "air-raid",
    source: "أرشيف المشروع",
  },
  {
    id: "t-first-wave",
    date: "6 أكتوبر 1973",
    time: "14:05 تقريبًا",
    title: "موجات العبور الأولى",
    description:
      "اندفعت موجات المشاة الأولى في قوارب العبور نحو الضفة الشرقية تحت ستر النيران، في إطار عملية «بدر».",
    mapFocus: "boats",
    source: "أرشيف المشروع",
  },
  {
    id: "t-engineers",
    date: "6 أكتوبر 1973",
    title: "مضخات المياه تفتح الثغرات",
    description:
      "استخدمت قوات المهندسين مضخات مياه عالية الضغط لفتح ثغرات في الساتر الترابي — الفكرة التي مكّنت لعبور المعدات الثقيلة لاحقًا.",
    mapFocus: "breaches",
    source: "أرشيف المشروع",
  },
  {
    id: "t-flag",
    date: "6 أكتوبر 1973",
    title: "العلم فوق الضفة الشرقية",
    description:
      "رُفع العلم المصري فوق نقاط في الضفة الشرقية، بعد سنوات من وجود القوات الإسرائيلية في سيناء منذ 1967.",
    mapFocus: "flag",
    source: "أرشيف المشروع",
  },
  {
    id: "t-barlev",
    date: "6 أكتوبر 1973",
    title: "اقتحام خط بارليف",
    description:
      "هاجمت القوات النقاط الحصينة لخط بارليف الممتد على طول الضفة الشرقية، وسقطت تباعًا تحت ضغط الهجوم المصري.",
    mapFocus: "barlev",
    source: "أرشيف المشروع",
  },
  {
    id: "t-bridges",
    date: "6–7 أكتوبر 1973",
    title: "الكباري وعبور المعدات",
    description:
      "أُقيمت الكباري العائمة فوق القناة، وبدأت الدبابات والمعدات الثقيلة تعبر لتعزيز رؤوس الكباري على الضفة الشرقية.",
    mapFocus: "bridges",
    source: "أرشيف المشروع",
  },
  {
    id: "t-front",
    date: "الأيام التالية",
    title: "تثبيت رؤوس الكباري",
    description:
      "ثبّت الجيشان الثاني والثالث مواقعهما شرق القناة على امتداد الجبهة، وتحوّلت المعركة إلى مرحلة جديدة من القتال.",
    mapFocus: "front",
    source: "أرشيف المشروع",
  },
];

/**
 * خريطة توضيحية (غير مقياس رسمي) — محور قناة السويس
 * الإحداثيات داخل viewBox: 0 0 800 1000
 */
export const mapMarkers: MapMarker[] = [
  { id: "port-said", label: "بورسعيد", x: 355, y: 120, bank: "west", kind: "city" },
  { id: "qantara", label: "القنطرة", x: 330, y: 300, bank: "west", kind: "city" },
  { id: "ismailia", label: "الإسماعيلية", x: 300, y: 505, bank: "west", kind: "city" },
  { id: "suez", label: "السويس", x: 385, y: 895, bank: "west", kind: "city" },
  {
    id: "boats",
    label: "محاور عبور المشاة",
    x: 360,
    y: 430,
    bank: "east",
    kind: "crossing",
    note: "موجات القوارب الأولى",
  },
  {
    id: "breaches",
    label: "ثغرات الساتر الترابي",
    x: 415,
    y: 560,
    bank: "east",
    kind: "crossing",
    note: "عمل سلاح المهندسين",
  },
  {
    id: "air-raid",
    label: "اتجاه الضربة الجوية",
    x: 300,
    y: 470,
    bank: "west",
    kind: "army",
    note: "من مطارات غرب القناة نحو سيناء",
  },
  {
    id: "barlev",
    label: "خط بارليف",
    x: 470,
    y: 350,
    bank: "east",
    kind: "fort",
    note: "نقاط حصينة على الضفة الشرقية",
  },
  {
    id: "flag",
    label: "رفع العلم",
    x: 455,
    y: 470,
    bank: "east",
    kind: "crossing",
    note: "أولى الرايات على الضفة الشرقية",
  },
  {
    id: "bridges",
    label: "الكباري العائمة",
    x: 390,
    y: 640,
    bank: "east",
    kind: "crossing",
    note: "عبور الدبابات والمعدات",
  },
  {
    id: "army-2",
    label: "الجيش الثاني الميداني",
    x: 240,
    y: 380,
    bank: "west",
    kind: "army",
    note: "القطاع الشمالي والأوسط",
  },
  {
    id: "army-3",
    label: "الجيش الثالث الميداني",
    x: 300,
    y: 760,
    bank: "west",
    kind: "army",
    note: "القطاع الجنوبي",
  },
  {
    id: "front",
    label: "خط رؤوس الكباري",
    x: 480,
    y: 620,
    bank: "east",
    kind: "fort",
    note: "تثبيت المواقع شرق القناة",
  },
];

/** معرّفات افتراضية لربط أحداث بلا نقطة خريطة مباشرة */
export const FALLBACK_FOCUS: Record<string, string> = {
  "canal-front": "boats",
};
