import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/hooks";

/**
 * خلفية سينمائية فائقة السرعة:
 * - Canvas خفيف جدًا (30 جسيم فقط)
 * - استهلاك معالج شبه منعدم
 * - توقف فوري عند عدم الرؤية أو الأجهزة التي تفضل تقليل الحركة
 */
export default function Atmosphere({ dim = false }: { dim?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let isVisible = true;

    interface Particle {
      x: number;
      y: number;
      r: number;
      vy: number;
      alpha: number;
      drift: number;
    }

    let particles: Particle[] = [];

    const init = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * 0.75); // دقة منخفضة ذكية وموفرة للطاقة
      canvas.height = Math.floor(h * 0.75);
      ctx.scale(0.75, 0.75);

      const count = Math.min(32, Math.floor(w / 45));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.4,
        vy: 0.15 + Math.random() * 0.35,
        alpha: 0.08 + Math.random() * 0.28,
        drift: (Math.random() - 0.5) * 0.2,
      }));
    };

    init();
    const onResize = () => init();
    window.addEventListener("resize", onResize, { passive: true });

    const onVis = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!isVisible) return;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgb(220, 185, 110)";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.vy;
        p.x += p.drift;

        if (p.y < -5) {
          p.y = h + 5;
          p.x = Math.random() * w;
        }

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* تدرج عميق خفيف */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_110%,#0e1622_0%,#080c12_50%,#05070a_100%)]" />

      {/* توهج دافئ في الأسفل */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          background: dim
            ? "radial-gradient(80% 100% at 50% 100%, rgba(180,120,40,0.08), transparent 75%)"
            : "radial-gradient(80% 100% at 50% 100%, rgba(180,120,40,0.16), transparent 75%)",
        }}
      />

      {/* شبكة خريطة خفيفة */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
        <defs>
          <pattern id="atm-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M80 0H0V80" fill="none" stroke="#cfa64f" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#atm-grid)" />
      </svg>

      {/* كانفاس الجزيئات الموفر */}
      {!reduced && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full opacity-80"
        />
      )}
    </div>
  );
}
