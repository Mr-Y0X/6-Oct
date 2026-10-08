/**
 * AudioManager — محرك الصوتيات السينمائية والأرشيفية
 * يولد أصواتًا واقعية عبر WebAudio (راديو كلاسيكي، مورس، ساعة، إشارات عسكرية)
 * دون الحاجة لملفات ثقيلة تبطئ المتصفح.
 */

type SoundKey = "tick" | "type" | "pulse" | "whoosh" | "radio-tuning" | "morse";

/** أجواء محيطة توليدية (WebAudio) — طبقة خلفية هادئة حسب الفصل */
export type AmbientMood =
  | "calm"
  | "tense"
  | "crossing"
  | "water"
  | "command"
  | "archive"
  | "voices"
  | "quiet"
  | "finale";

interface MoodSpec {
  filterType: BiquadFilterType;
  freq: number;
  q?: number;
  gain: number;
  droneFreq?: number;
  droneGain?: number;
  lfoRate?: number;
  lfoDepth?: number;
}

const MOODS: Record<AmbientMood, MoodSpec> = {
  calm: { filterType: "lowpass", freq: 380, gain: 0.05, droneFreq: 55, droneGain: 0.018 },
  tense: { filterType: "bandpass", freq: 750, q: 1.2, gain: 0.035 },
  crossing: { filterType: "lowpass", freq: 600, gain: 0.065, lfoRate: 0.12, lfoDepth: 260 },
  water: { filterType: "bandpass", freq: 520, q: 0.8, gain: 0.055, lfoRate: 0.09, lfoDepth: 210 },
  command: { filterType: "highpass", freq: 2400, gain: 0.012, droneFreq: 110, droneGain: 0.012 },
  archive: { filterType: "lowpass", freq: 240, gain: 0.028 },
  voices: { filterType: "lowpass", freq: 300, gain: 0.012 },
  quiet: { filterType: "lowpass", freq: 220, gain: 0.008 },
  finale: { filterType: "lowpass", freq: 500, gain: 0.03, droneFreq: 82.5, droneGain: 0.022 },
};

interface AmbientNodes {
  src: AudioBufferSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  extra: (OscillatorNode | GainNode)[];
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private _enabled = false;
  private ambient: AmbientNodes | null = null;
  private duckGain: GainNode | null = null;
  private mood: AmbientMood | null = null;
  private pendingMood: AmbientMood | null = null;

  get enabled() {
    return this._enabled;
  }

  async setEnabled(on: boolean) {
    this._enabled = on;
    if (on && !this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        this._enabled = false;
        return;
      }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.45;
      this.master.connect(this.ctx.destination);
    }
    if (on && this.ctx?.state === "suspended") {
      await this.ctx.resume().catch(() => undefined);
    }
    if (on && this.pendingMood) {
      this.startAmbient(this.pendingMood);
    }
    if (!on) {
      this.stopAmbient(true);
    }
  }

  private blip(freq: number, dur: number, vol: number, type: OscillatorType = "sine") {
    if (!this._enabled || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  tick() {
    this.blip(1750, 0.035, 0.04, "square");
  }

  type() {
    this.blip(500 + Math.random() * 450, 0.025, 0.03, "triangle");
  }

  pulse() {
    this.blip(65, 1.2, 0.2, "sine");
  }

  morse() {
    if (!this._enabled || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    [0, 0.09, 0.18, 0.32, 0.42].forEach((offset, idx) => {
      const dur = idx % 2 === 0 ? 0.05 : 0.09;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0 + offset);
      g.gain.exponentialRampToValueAtTime(0.04, t0 + offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + dur);
      osc.connect(g).connect(this.master!);
      osc.start(t0 + offset);
      osc.stop(t0 + offset + dur + 0.01);
    });
  }

  radioTuning() {
    if (!this._enabled || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, t0);
    osc.frequency.exponentialRampToValueAtTime(1400, t0 + 0.3);
    osc.frequency.exponentialRampToValueAtTime(700, t0 + 0.6);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.75);
  }

  whoosh() {
    if (!this._enabled || !this.ctx || !this.master) return;
    const t0 = this.ctx.currentTime;
    const dur = 0.55;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(250, t0);
    filter.frequency.exponentialRampToValueAtTime(1200, t0 + dur * 0.6);
    filter.Q.value = 1.2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t0);
  }

  play(key: SoundKey) {
    if (!this._enabled) return;
    if (key === "tick") this.tick();
    else if (key === "type") this.type();
    else if (key === "pulse") this.pulse();
    else if (key === "whoosh") this.whoosh();
    else if (key === "radio-tuning") this.radioTuning();
    else if (key === "morse") this.morse();
  }

  /* ---------------------------------------------------------- */
  /* طبقة الأجواء المحيطة — fade in/out + crossfade بين الفصول   */
  /* ---------------------------------------------------------- */

  private ensureDuck(): GainNode | null {
    if (!this.ctx || !this.master) return null;
    if (!this.duckGain) {
      this.duckGain = this.ctx.createGain();
      this.duckGain.gain.value = 1;
      this.duckGain.connect(this.master);
    }
    return this.duckGain;
  }

  private noiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** خفض الخلفية تلقائيًا أثناء التسجيلات التاريخية */
  setDucked(ducked: boolean) {    if (!this.ctx || !this._enabled) return;
    const duck = this.ensureDuck();
    if (!duck) return;
    const t = this.ctx.currentTime;
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(duck.gain.value, t);
    duck.gain.linearRampToValueAtTime(ducked ? 0.22 : 1, t + 0.6);
  }

  setAmbientMood(mood: AmbientMood | null) {
    this.pendingMood = mood;
    if (!this._enabled || !this.ctx) return;
    if (mood === this.mood) return;
    if (mood === null) {
      this.stopAmbient();
      return;
    }
    this.startAmbient(mood);
  }

  private startAmbient(mood: AmbientMood) {
    if (!this.ctx) return;
    const spec = MOODS[mood];
    const duck = this.ensureDuck();
    if (!duck) return;
    /* إيقاف الطبقة السابقة بتلاشٍ سريع — لا تراكم أبدًا */
    this.stopAmbient(true);
    const t = this.ctx.currentTime;
    const buf = this.noiseBuffer();
    if (!buf) return;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = spec.filterType;
    filter.frequency.value = spec.freq;
    if (spec.q) filter.Q.value = spec.q;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, spec.gain), t + 1.8);

    src.connect(filter).connect(gain).connect(duck);
    src.start(t);

    const extra: (OscillatorNode | GainNode)[] = [];
    if (spec.droneFreq) {
      const drone = this.ctx.createOscillator();
      drone.type = "sine";
      drone.frequency.value = spec.droneFreq;
      const dg = this.ctx.createGain();
      dg.gain.setValueAtTime(0.0001, t);
      dg.gain.exponentialRampToValueAtTime(Math.max(0.0002, spec.droneGain ?? 0.015), t + 2.2);
      drone.connect(dg).connect(duck);
      drone.start(t);
      extra.push(drone, dg);
    }
    if (spec.lfoRate && spec.lfoDepth) {
      const lfo = this.ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = spec.lfoRate;
      const lg = this.ctx.createGain();
      lg.gain.value = spec.lfoDepth;
      lfo.connect(lg).connect(filter.frequency);
      lfo.start(t);
      extra.push(lfo, lg);
    }

    this.ambient = { src, filter, gain, extra };
    this.mood = mood;
  }

  private stopAmbient(immediate = false) {
    if (!this.ctx || !this.ambient) {
      this.mood = null;
      return;
    }
    const { src, gain, extra } = this.ambient;
    this.ambient = null;
    this.mood = null;
    const t = this.ctx.currentTime;
    const fade = immediate ? 0.5 : 0.9;
    try {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
      extra.forEach((n) => {
        if (n instanceof GainNode) {
          n.gain.cancelScheduledValues(t);
          n.gain.setValueAtTime(Math.max(0.0001, n.gain.value), t);
          n.gain.exponentialRampToValueAtTime(0.0001, t + fade);
        }
      });
      const nodes = [src, ...extra.filter((n): n is OscillatorNode => n instanceof OscillatorNode)];
      window.setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop();
          } catch {
            /* متوقف بالفعل */
          }
        });
        try {
          src.disconnect();
        } catch {
          /* مفصول بالفعل */
        }
      }, (fade + 0.15) * 1000);
    } catch {
      /* سياق مغلق — تجاهل */
    }
  }
  /* ---------------------------------------------------------- */
  /* النشيد الوطني — يُعزف عند تفعيل الصوت من زر الترويسة        */
  /* ---------------------------------------------------------- */

  private anthemEl: HTMLAudioElement | null = null;
  private anthemTimer: number | null = null;

  /** بدء النشيد بتلاشي ناعم مع خفض الخلفية — يعمل بضغطة المستخدم فقط */
  playAnthem() {
    if (!this._enabled || typeof window === "undefined") return;
    this.stopAnthem();
    const el = new Audio("/media/audio/anthem/bilady-navy-band.ogg");
    el.preload = "auto";
    el.volume = 0.0001;
    el.onended = () => this.setDucked(false);
    el.onerror = () => this.setDucked(false);
    this.anthemEl = el;
    this.setDucked(true);
    el.play().catch(() => this.setDucked(false));
    /* تلاشي الدخول */
    const step = () => {
      if (!this.anthemEl || this.anthemEl.paused) return;
      const v = Math.min(0.55, this.anthemEl.volume + 0.06);
      this.anthemEl.volume = v;
      if (v < 0.55) {
        this.anthemTimer = window.setTimeout(step, 180);
      } else {
        this.anthemTimer = null;
      }
    };
    this.anthemTimer = window.setTimeout(step, 350);
  }

  stopAnthem() {
    if (this.anthemTimer) {
      window.clearTimeout(this.anthemTimer);
      this.anthemTimer = null;
    }
    if (this.anthemEl) {
      try {
        this.anthemEl.pause();
      } catch {
        /* متوقف بالفعل */
      }
      this.anthemEl.onended = null;
      this.anthemEl.onerror = null;
      this.anthemEl = null;
    }
    this.setDucked(false);
  }

  get anthemPlaying(): boolean {
    return !!this.anthemEl && !this.anthemEl.paused;
  }
}

export const audioManager = new AudioManager();
