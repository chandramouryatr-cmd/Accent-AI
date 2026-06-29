"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  height?: number;
  color?: string;
  active?: boolean;
  className?: string;
}

// Live audio waveform from microphone input (Web Audio API).
// Falls back to a simulated waveform if mic permission denied.

export function MicWaveform({ height = 120, color = "#6366f1", active = false, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bufRef = useRef<Uint8Array>(new Uint8Array(64));
  const simRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
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

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cy = h / 2;
      const bars = 48;
      const barW = w / bars;

      const buf = bufRef.current;
      if (analyserRef.current && active) {
        analyserRef.current.getByteFrequencyData(buf);
      } else if (simRef.current && active) {
        // simulated waveform
        for (let i = 0; i < buf.length; i++) {
          buf[i] = Math.max(
            0,
            60 + 80 * Math.abs(Math.sin(Date.now() * 0.005 + i * 0.3)) * (1 - i / buf.length)
          );
        }
      } else {
        buf.fill(0);
      }

      for (let i = 0; i < bars; i++) {
        const v = buf[Math.min(i, buf.length - 1)] / 255;
        const barH = Math.max(2, v * h * 0.9);
        const x = i * barW + barW * 0.2;
        if (active) {
          const grad = ctx.createLinearGradient(0, cy - barH / 2, 0, cy + barH / 2);
          grad.addColorStop(0, color);
          grad.addColorStop(0.5, "#8b5cf6");
          grad.addColorStop(1, "#22d3ee");
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.08)";
        }
        ctx.fillRect(x, cy - barH / 2, barW * 0.6, barH);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, active]);

  // Mic setup / teardown
  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
      simRef.current = false;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-mic");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;
        bufRef.current = new Uint8Array(analyser.frequencyBinCount);
        setError(null);
      } catch (e: any) {
        if (e?.name === "NotAllowedError" || e?.message === "no-mic") {
          setError("Mic unavailable — using simulated waveform");
          simRef.current = true;
          bufRef.current = new Uint8Array(64);
        } else {
          setError("Mic error — using simulated waveform");
          simRef.current = true;
          bufRef.current = new Uint8Array(64);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      analyserRef.current = null;
      simRef.current = false;
    };
  }, [active]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} style={{ width: "100%", height }} aria-hidden />
      {error && <p className="text-[10px] text-[var(--t3)] text-center mt-1">{error}</p>}
    </div>
  );
}
