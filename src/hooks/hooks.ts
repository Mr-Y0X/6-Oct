import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* prefers-reduced-motion                                               */
/* ------------------------------------------------------------------ */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return reduced;
}

/* ------------------------------------------------------------------ */
/* IntersectionObserver-driven reveal                                   */
/* ------------------------------------------------------------------ */
export function useInView<T extends HTMLElement>(
  threshold = 0.2,
  once = true
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}

/* ------------------------------------------------------------------ */
/* Typewriter — كتابة حرفًا حرفًا                                       */
/* ------------------------------------------------------------------ */
export function useTypewriter(
  text: string,
  opts: {
    active: boolean;
    speed?: number;
    startDelay?: number;
    reduced?: boolean;
    onDone?: () => void;
    onChar?: () => void;
  }
) {
  const { active, speed = 55, startDelay = 0, reduced = false, onDone, onChar } = opts;
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  const onCharRef = useRef(onChar);
  onDoneRef.current = onDone;
  onCharRef.current = onChar;

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setOut(text);
      setDone(true);
      onDoneRef.current?.();
      return;
    }
    let i = 0;
    let timer: number;
    setOut("");
    setDone(false);

    const tick = () => {
      i += 1;
      setOut(text.slice(0, i));
      onCharRef.current?.();
      if (i < text.length) {
        const ch = text[i - 1];
        const pause = "…،.".includes(ch) ? speed * 4 : speed;
        timer = window.setTimeout(tick, pause);
      } else {
        setDone(true);
        onDoneRef.current?.();
      }
    };

    timer = window.setTimeout(tick, startDelay);
    return () => window.clearTimeout(timer);
  }, [active, text, speed, startDelay, reduced]);

  return { out, done };
}

/* ------------------------------------------------------------------ */
/* ثانية متحركة (لساعة العد)                                            */
/* ------------------------------------------------------------------ */
export function useTickSecond(running: boolean, reduced: boolean) {
  const [second, setSecond] = useState(56);
  useEffect(() => {
    if (!running || reduced) return;
    const id = window.setInterval(() => {
      setSecond((s) => (s + 1) % 60);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, reduced]);
  return second;
}

/* ------------------------------------------------------------------ */
/* hover capability (تعطيل المؤشر المخصص على اللمس)                     */
/* ------------------------------------------------------------------ */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const fn = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return fine;
}

/* ------------------------------------------------------------------ */
/* قفل تمرير الصفحة (للمودالات)                                         */
/* ------------------------------------------------------------------ */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/* ------------------------------------------------------------------ */
/* مفتاح الهروب                                                         */
/* ------------------------------------------------------------------ */
export function useEscape(onEscape: () => void, active = true) {
  const cb = useCallback(onEscape, [onEscape]);
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, cb]);
}
