import React, { useEffect, useRef } from 'react';

export const AmberCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    class AmberDust {
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
        this.size = Math.random() * 1.6 + 0.4;
        this.speedY = Math.random() * 0.35 + 0.1;
        this.speedX = Math.random() * 0.24 - 0.12;
        this.life = Math.random() * 220 + 80;
        this.maxLife = this.life;
        this.alpha = 0;
        this.color = `rgba(238, 155, 0, ${Math.random() * 0.3 + 0.15})`;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life--;

        if (this.life > this.maxLife * 0.8) {
          this.alpha = (this.maxLife - this.life) / (this.maxLife * 0.2);
        } else {
          this.alpha = this.life / (this.maxLife * 0.8);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = '#EE9B00';
        ctx.fill();
        ctx.restore();
      }
    }

    const particles: AmberDust[] = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      particles.push(new AmberDust());
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0 || p.y < 0) {
          particles[i] = new AmberDust();
          particles[i].y = height;
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]" 
    />
  );
};
