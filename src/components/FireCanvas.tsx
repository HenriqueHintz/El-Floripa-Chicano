import { useEffect, useRef } from 'react';

export const FireCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number | null = null;
    let isIntersecting = false;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimer: number | undefined;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 640;

    class Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      life: number;
      maxLife: number;
      alpha: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.size = Math.random() * 2.2 + 0.6;
        this.speedY = Math.random() * 1.2 + 0.4;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.life = Math.random() * 180 + 60;
        this.maxLife = this.life;
        this.alpha = 1;
        this.color = `rgba(238, 155, 0, ${Math.random() * 0.5 + 0.3})`;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life--;
        this.alpha = Math.max(0, this.life / this.maxLife);
        this.speedX += (Math.random() - 0.5) * 0.08;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        // Optimize GPU draw: blur only on desktop/larger particles to prevent mobile lag
        if (!isMobile && this.size > 1.4) {
          ctx.shadowBlur = this.size * 2.5;
          ctx.shadowColor = '#EE9B00';
        }
        ctx.fill();
        ctx.restore();
      }
    }

    const count = isMobile ? 22 : 42;
    const embers: Ember[] = [];
    for (let i = 0; i < count; i++) {
      const e = new Ember();
      e.y = Math.random() * height;
      embers.push(e);
    }

    const render = () => {
      if (document.hidden || !isIntersecting) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.update();
        e.draw();
        if (e.life <= 0 || e.y < -10) {
          embers[i] = new Ember();
        }
      }
      animId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (prefersReducedMotion) {
        // Draw one static frame for reduced motion users
        ctx.clearRect(0, 0, width, height);
        embers.forEach((e) => e.draw());
        return;
      }
      if (animId === null && !document.hidden && isIntersecting) {
        animId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (isIntersecting) {
        startAnimation();
      }
    };

    // IntersectionObserver: automatically sleep particle loop when offscreen
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isIntersecting = !!entry?.isIntersecting;
          if (isIntersecting) {
            startAnimation();
          } else {
            stopAnimation();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    } else {
      isIntersecting = true;
      startAnimation();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimer);
      if (observer) {
        observer.disconnect();
      }
      stopAnimation();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-[3]" 
    />
  );
};
