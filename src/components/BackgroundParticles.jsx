import React, { useEffect, useRef } from 'react';

export default function BackgroundParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle types: hearts and twinkling stars
    const numParticles = Math.min(35, Math.floor(window.innerWidth / 15));
    const particles = [];

    const computedStyle = getComputedStyle(document.documentElement);
    const primaryRgb = computedStyle.getPropertyValue('--primary-rgb').trim() || '255, 77, 109';
    const secondaryRgb = computedStyle.getPropertyValue('--secondary-rgb').trim() || '255, 117, 143';

    const heartColors = [
      `rgba(${primaryRgb}, `,
      `rgba(${secondaryRgb}, `,
      `rgba(${primaryRgb}, `,
      `rgba(${secondaryRgb}, `
    ];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 6,
        speedY: -(Math.random() * 0.7 + 0.3),
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        isStar: Math.random() > 0.65
      });
    }

    function drawHeart(ctx, x, y, size, color, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, size / 3, 0, size);
      // Top right curve
      ctx.bezierCurveTo(size, size / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
      ctx.closePath();
      ctx.fillStyle = `${color}${opacity})`;
      ctx.shadowColor = 'rgba(255, 100, 130, 0.4)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    function drawStar(ctx, x, y, size, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 240, 245, ${opacity * 0.8})`;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    let time = 0;
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(time * p.swaySpeed + p.swayOffset) * 0.6;

        // Reset when floating off top
        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        const currentOpacity = p.opacity * (0.8 + 0.2 * Math.sin(time + p.swayOffset));

        if (p.isStar) {
          drawStar(ctx, p.x, p.y, p.size, currentOpacity);
        } else {
          drawHeart(ctx, p.x, p.y, p.size, p.color, currentOpacity);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
