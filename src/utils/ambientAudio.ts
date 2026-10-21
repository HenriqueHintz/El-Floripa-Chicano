// Ambient Audio Engine using Web Audio API
// Generates a subtle, realistic, organic warm wood-fire & embers crackle
// No external MP3 downloads required, zero latency, 100% reliable.

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private crackleTimer: number | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      this.ctx = new AudioCtxClass();
    }
  }

  public start(): boolean {
    try {
      this.init();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) return true;

      // Master gain node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime); // gentle, background volume
      this.gainNode.connect(this.ctx.destination);

      // Low rumble filter for the warmth of the fire
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise (warm rumble)
        lastOut = data[i];
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(320, this.ctx.currentTime); // deep rumble

      noiseSource.connect(lowpass);
      lowpass.connect(this.gainNode);
      noiseSource.start(0);
      this.noiseNode = noiseSource;

      // Realistic crackle sparks generator
      const scheduleCrackle = () => {
        if (!this.isPlaying || !this.ctx || !this.gainNode) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const sparkGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800 + Math.random() * 2400, now);
        filter.Q.setValueAtTime(3 + Math.random() * 5, now);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300 + Math.random() * 800, now);

        const duration = 0.01 + Math.random() * 0.03;
        const sparkVol = 0.02 + Math.random() * 0.06;

        sparkGain.gain.setValueAtTime(sparkVol, now);
        sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(sparkGain);
        sparkGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + duration);

        const nextInterval = Math.random() * 260 + 60;
        this.crackleTimer = window.setTimeout(scheduleCrackle, nextInterval);
      };

      this.isPlaying = true;
      scheduleCrackle();
      return true;
    } catch (e) {
      console.warn('Ambient audio could not start:', e);
      return false;
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      } catch {
        // ignore
      }
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const ambientAudio = new AmbientAudioEngine();
