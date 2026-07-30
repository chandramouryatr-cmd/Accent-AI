"use client";

import { useEffect, useRef } from "react";

interface WaveformCanvasProps {
  active?: boolean;
  height?: number;
  color?: string;
  className?: string;
}

// Animated layered sine waves — used on login & lesson intro screens.
export function WaveformCanvas({
  active = true,
  height = 220,
  color,
  className,
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);

  // Keep the ref in sync with the prop WITHOUT writing during render
  // (writing refs during render is forbidden by react-hooks/refs).
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const waves = [
      { freq: 0.0022, amp: 70, speed: 1.2, phase: 0, color: color || "rgba(99,102,241,0.28)" },
      { freq: 0.0031, amp: 48, speed: 1.8, phase: 2, color: "rgba(139,92,246,0.22)" },
      { freq: 0.0018, amp: 90, speed: 0.9, phase: 4, color: "rgba(34,211,238,0.14)" },
      { freq: 0.004, amp: 32, speed: 2.4, phase: 1, color: "rgba(99,102,241,0.12)" },
    ];

    let t = 0;
    let lastTime = 0;
    // Use deltaTime so animation speed is consistent at 60Hz, 90Hz, and 120Hz.
    // The magic constant 0.016 is one 60fps frame in seconds; we scale to that.
    const TARGET_DT = 1 / 60;
    const draw = (now: number) => {
      const dt = lastTime === 0 ? TARGET_DT : Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ctx.clearRect(0, 0, w, h);
      const cy = h / 2;
      for (const wv of waves) {
        ctx.beginPath();
        ctx.moveTo(0, cy);
        for (let x = 0; x <= w; x += 2) {
          const y =
            cy +
            Math.sin(x * wv.freq + t * wv.speed + wv.phase) * wv.amp * (activeRef.current ? 1 : 0.3);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wv.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      t += dt;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height }}
      className={className}
      aria-hidden
    />
  );
}
