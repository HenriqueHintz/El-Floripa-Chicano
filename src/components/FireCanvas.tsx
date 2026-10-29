import { useEffect, useRef } from 'react';

export const FireCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number | null = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

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
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = '#EE9B00';
        ctx.fill();
        ctx.restore();
      }
    }

    const embers: Ember[] = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      const e = new Ember();
      e.y = Math.random() * height;
      embers.push(e);
    }

    const render = () => {
      if (document.hidden) {
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
      if (animId === null && !document.hidden) {
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
      } else {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    startAnimation();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
