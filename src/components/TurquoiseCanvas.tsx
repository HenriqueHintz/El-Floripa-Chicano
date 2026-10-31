import { useEffect, useRef } from 'react';

export const TurquoiseCanvas = () => {
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

    class Particle {
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
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 0.6;
        this.speedY = Math.random() * 0.16 + 0.05;
        this.speedX = Math.random() * 0.28 + 0.08;
        this.life = Math.random() * 280 + 120;
        this.maxLife = this.life;
        this.alpha = 0;
        this.color = Math.random() > 0.5 
          ? `rgba(148, 210, 189, ${Math.random() * 0.25 + 0.1})` 
          : `rgba(10, 147, 150, ${Math.random() * 0.25 + 0.1})`;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life--;
        this.speedX += Math.sin(this.life * 0.01) * 0.004;

        if (this.life > this.maxLife * 0.7) {
          this.alpha = (this.maxLife - this.life) / (this.maxLife * 0.3);
        } else {
          this.alpha = this.life / (this.maxLife * 0.7);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const count = isMobile ? 14 : 24;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    const render = () => {
      if (document.hidden || !isIntersecting) {
        animId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0 || p.y < 0 || p.x > width) {
          particles[i] = new Particle();
          particles[i].x = Math.random() * (width * 0.3);
          particles[i].y = height;
        }
      }
      animId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (prefersReducedMotion) {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => p.draw());
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
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]" 
      style={{ mixBlendMode: 'screen' }} 
    />
  );
};
