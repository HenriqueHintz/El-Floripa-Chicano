/**
 * Mexican Music Ambient Audio Engine for El Chicano
 *
 * Plays authentic Mexican background music with smooth volume fade-in and fade-out.
 * Uses HTML5 Audio with autoplay mitigation and persistent loop.
 */

class AmbientAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private fadeInterval: number | null = null;
  private targetVolume: number = 0.35; // Gentle, atmospheric background volume

  public init() {
    if (this.audio) return;
    if (typeof window === 'undefined') return;

    this.audio = new Audio('/audio/mexican-music.mp3');
    this.audio.loop = true;
    this.audio.volume = 0;
    this.audio.preload = 'auto';

    this.audio.addEventListener('ended', () => {
      if (this.audio && this.isPlaying) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    });
  }

  public start(): boolean {
    try {
      this.init();
      if (!this.audio) return false;

      this.clearFade();
      this.isPlaying = true;

      this.audio
        .play()
        .then(() => {
          this.fadeIn();
        })
        .catch((err) => {
          console.warn('Playback blocked or pending interaction:', err);
          this.isPlaying = false;
        });

      return true;
    } catch (e) {
      console.warn('Mexican music audio could not start:', e);
      return false;
    }
  }

  public stop() {
    this.isPlaying = false;
    if (!this.audio) return;

    this.fadeOut(() => {
      if (this.audio && !this.isPlaying) {
        this.audio.pause();
      }
    });
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

  private clearFade() {
    if (this.fadeInterval !== null) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  private fadeIn() {
    if (!this.audio) return;
    this.clearFade();
    const step = 0.04;
    this.fadeInterval = window.setInterval(() => {
      if (!this.audio) {
        this.clearFade();
        return;
      }
      if (this.audio.volume + step >= this.targetVolume) {
        this.audio.volume = this.targetVolume;
        this.clearFade();
      } else {
        this.audio.volume += step;
      }
    }, 40);
  }

  private fadeOut(onComplete?: () => void) {
    if (!this.audio) {
      onComplete?.();
      return;
    }
    this.clearFade();
    const step = 0.05;
    this.fadeInterval = window.setInterval(() => {
      if (!this.audio) {
        this.clearFade();
        onComplete?.();
        return;
      }
      if (this.audio.volume - step <= 0) {
        this.audio.volume = 0;
        this.clearFade();
        onComplete?.();
      } else {
        this.audio.volume -= step;
      }
    }, 35);
  }
}

export const ambientAudio = new AmbientAudioEngine();
