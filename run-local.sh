#!/bin/bash
# تشغيل متحف «حين عبرت مصر» محليًا — يعمل حتى بدون إنترنت.
# الاستخدام:  bash run-local.sh
# ثم افتح الرابط المطبوع في المتصفح.
#
# كيف يعمل بدون نت؟
# - النسخ والبناء والتشغيل كلها محلية ولا تحتاج شبكة.
# - أي حزمة ناقصة/تالفة تُستعاد من كاش npm على الجهاز (npm --offline).
# - فيديوهات YouTube المدمجة فقط هي ما يحتاج إنترنت عند المشاهدة،
#   وباقي الموقع (59+ مادة محلية) يعمل كاملًا أوفلاين.

set -u
SRC="/sdcard/Projects/6-Oct/Arena-Final"
DEST="/data/user/0/com.rk.xededitor/tmp/opencode/arena"
CACHE="/data/user/0/com.rk.xededitor/tmp/opencode/cache"
PORT="5173"
HOST="127.0.0.1"

echo "── 1/5 نسخ المشروع لمساحة التنفيذ ──"
mkdir -p "$DEST" "$CACHE"
if [ -f "$DEST/src/App.tsx" ]; then
  cp -a "$SRC/src/." "$DEST/src/" 2>/dev/null
  cp -a "$SRC/public/." "$DEST/public/" 2>/dev/null
  cp -f "$SRC/index.html" "$DEST/index.html" 2>/dev/null
  cp -f "$SRC/vercel.json" "$DEST/vercel.json" 2>/dev/null || true
  echo "مزامنة سريعة تمت"
else
  cp -a "$SRC/." "$DEST/" 2>/dev/null
  echo "نسخة كاملة تمت"
fi

cd "$DEST" || exit 1

echo "── 2/5 تجهيز ثنائي esbuild (أوفلاين من الكاش) ──"
if [ ! -x "node_modules/@esbuild/android-arm64/bin/esbuild" ]; then
  npm install --offline --no-save --no-audit --no-fund --force \
    --os=android --cpu=arm64 @esbuild/android-arm64@0.27.7 >/dev/null 2>&1 || true
fi
if [ -f "node_modules/@esbuild/android-arm64/bin/esbuild" ]; then
  chmod +x node_modules/@esbuild/android-arm64/bin/esbuild 2>/dev/null || true
  cp -f node_modules/@esbuild/android-arm64/bin/esbuild \
    node_modules/@esbuild/linux-arm64/bin/esbuild 2>/dev/null || true
fi
node_modules/@esbuild/linux-arm64/bin/esbuild --version >/dev/null 2>&1 \
  && echo "esbuild يعمل" || { echo "خطأ: esbuild لا يعمل (يلزم إنترنت لأول مرة فقط)"; exit 1; }

echo "── 3/5 فحص سلامة مكتبات node (أوفلاين) ──"
node -e "require('./node_modules/@rollup/rollup-linux-arm64-gnu/rollup.linux-arm64-gnu.node')" \
  >/dev/null 2>&1 || {
  echo "إصلاح rollup من الكاش..."
  npm install --offline --no-save --no-audit --no-fund --force \
    @rollup/rollup-linux-arm64-gnu@4.64.0 >/dev/null 2>&1 || true
}
node -e "require('./node_modules/@rollup/rollup-linux-arm64-gnu/rollup.linux-arm64-gnu.node')" \
  >/dev/null 2>&1 && echo "rollup يعمل" || { echo "خطأ: rollup لا يعمل"; exit 1; }

if [ ! -f "node_modules/lucide-react/dist/esm/lucide-react.mjs" ]; then
  echo "إصلاح lucide-react من الكاش..."
  npm install --offline --no-save --no-audit --no-fund --force \
    lucide-react@1.52.0 >/dev/null 2>&1 || true
fi
[ -f "node_modules/lucide-react/dist/esm/lucide-react.mjs" ] \
  && echo "lucide-react سليمة" || { echo "خطأ: lucide-react ناقصة"; exit 1; }

echo "── 4/5 كتابة ترقيع توافق Node 18 ──"
cat > "$CACHE/node18-shims.cjs" <<'EOF'
"use strict";
try {
  const crypto = require("node:crypto");
  if (typeof crypto.hash !== "function") {
    crypto.hash = (algorithm, data, outputEncoding) => {
      const digest = crypto.createHash(algorithm).update(data).digest();
      if (!outputEncoding || outputEncoding === "buffer") return digest;
      return digest.toString(outputEncoding);
    };
  }
} catch {}
try {
  if (typeof Promise.withResolvers !== "function") {
    Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve, reject };
    };
  }
} catch {}
EOF
echo "تم"

echo "── 5/5 تشغيل السيرفر ──"
pkill -f "vite.js dev" >/dev/null 2>&1 || true
sleep 1
setsid nohup node -r "$CACHE/node18-shims.cjs" node_modules/vite/bin/vite.js dev \
  --host "$HOST" --port "$PORT" > "$CACHE/vite.log" 2>&1 < /dev/null &
echo "انتظار إقلاع السيرفر..."
for i in $(seq 1 12); do
  sleep 5
  if curl -s -o /dev/null -m 8 "http://$HOST:$PORT/"; then
    echo ""
    echo "FINAL PROJECT READY"
    echo "Local URL: http://$HOST:$PORT/"
    exit 0
  fi
done
echo ""
echo "تعذر الإقلاع — راجع السجل: $CACHE/vite.log"
tail -15 "$CACHE/vite.log"
exit 1
