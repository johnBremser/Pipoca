class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private musicPlaying = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.14,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playJump(jumpNumber: 1 | 2) {
    if (jumpNumber === 1) {
      this.playTone(280, 580, 0.16, 'triangle', 0.16);
    } else {
      this.playTone(440, 860, 0.18, 'sine', 0.15);
      this.playTone(660, 980, 0.12, 'triangle', 0.08, 0.04);
    }
  }

  public playRoll() {
    this.playTone(220, 480, 0.14, 'sawtooth', 0.07);
    this.playTone(330, 560, 0.12, 'triangle', 0.1, 0.03);
  }

  public playSpring() {
    this.playTone(240, 880, 0.28, 'triangle', 0.18);
    this.playTone(360, 1080, 0.22, 'sine', 0.1, 0.05);
  }

  public playCollect(combo = 0) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const note = scale[combo % scale.length];
    this.playTone(note, note * 1.15, 0.11, 'sine', 0.12);
    this.playTone(note * 1.5, note * 1.5, 0.09, 'triangle', 0.06, 0.04);
  }

  public playGoldenSecret() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, n, 0.18, 'triangle', 0.14, idx * 0.07);
    });
  }

  public playBounce(combo = 0) {
    const base = 300 + Math.min(combo, 6) * 55;
    this.playTone(base, base * 1.8, 0.15, 'triangle', 0.17);
  }

  public playCrateSmash() {
    this.playTone(180, 85, 0.12, 'square', 0.08);
    this.playTone(340, 140, 0.1, 'triangle', 0.1, 0.02);
  }

  public playCheckpoint() {
    this.playTone(523.25, 523.25, 0.12, 'triangle', 0.13, 0);
    this.playTone(659.25, 659.25, 0.12, 'triangle', 0.13, 0.09);
    this.playTone(783.99, 783.99, 0.22, 'triangle', 0.15, 0.18);
  }

  public playHeart() {
    this.playTone(440, 554.37, 0.14, 'sine', 0.13, 0);
    this.playTone(554.37, 659.25, 0.2, 'sine', 0.14, 0.09);
  }

  public playDamage() {
    this.playTone(260, 120, 0.24, 'sawtooth', 0.12);
  }

  public playBalloonRescue() {
    this.playTone(340, 520, 0.25, 'sine', 0.11, 0);
    this.playTone(440, 660, 0.25, 'sine', 0.11, 0.14);
  }

  public playBossTelegraph() {
    this.playTone(380, 440, 0.12, 'triangle', 0.11, 0);
    this.playTone(440, 520, 0.12, 'triangle', 0.11, 0.12);
  }

  public playBossHit() {
    this.playTone(200, 90, 0.18, 'square', 0.11, 0);
    this.playTone(480, 740, 0.18, 'triangle', 0.15, 0.05);
  }

  public playVictoryFanfare() {
    const melody = [
      {f: 523.25, t: 0, d: 0.14},
      {f: 659.25, t: 0.12, d: 0.14},
      {f: 783.99, t: 0.24, d: 0.14},
      {f: 1046.5, t: 0.36, d: 0.36},
      {f: 783.99, t: 0.56, d: 0.12},
      {f: 1046.5, t: 0.7, d: 0.45},
    ];
    melody.forEach((m) => this.playTone(m.f, m.f, m.d, 'triangle', 0.16, m.t));
  }

  public startMusic(stageId: number) {
    this.stopMusic();
    if (this.muted || typeof window === 'undefined') return;
    this.musicPlaying = true;
    this.musicStep = 0;

    // Gentle cheerful pentatonic marimba-style patterns per world
    const melodies: number[][] = [
      [523, 659, 784, 659, 587, 659, 784, 880],
      [440, 523, 659, 523, 587, 659, 784, 659],
      [392, 523, 659, 784, 659, 523, 587, 659],
      [523, 587, 659, 784, 880, 784, 659, 587],
      [392, 494, 587, 740, 587, 494, 440, 587],
      [523, 659, 880, 784, 659, 784, 1046, 880],
      [587, 659, 784, 880, 784, 659, 587, 523],
      [523, 659, 784, 1046, 880, 784, 659, 784],
    ];
    const pattern = melodies[(stageId - 1) % melodies.length];

    this.musicTimer = window.setInterval(() => {
      if (!this.musicPlaying || this.muted) return;
      if (!this.ctx || this.ctx.state !== 'running') return;
      const freq = pattern[this.musicStep % pattern.length];
      this.playTone(freq, freq, 0.16, 'sine', 0.032);
      if (this.musicStep % 2 === 0) {
        this.playTone(freq * 0.5, freq * 0.5, 0.22, 'triangle', 0.025);
      }
      this.musicStep += 1;
    }, 340);
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
