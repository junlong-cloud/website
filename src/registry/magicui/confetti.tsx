"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CanvasHTMLAttributes,
} from "react";

export type ConfettiOptions = {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  colors?: string[];
};

export type ConfettiRef = {
  fire: (options?: ConfettiOptions) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  life: number;
  opacity: number;
};

type ConfettiProps = CanvasHTMLAttributes<HTMLCanvasElement>;

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
  function Confetti({ className = "", ...props }, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number | null>(null);
    const lastFireRef = useRef(0);

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }, []);

    const animate = useCallback(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) {
        animationFrameRef.current = null;
        return;
      }

      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.vx *= particle.drag;
        particle.vy = particle.vy * particle.drag + particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.life -= 1;
        particle.opacity = Math.min(1, particle.life / 28);

        context.save();
        context.globalAlpha = particle.opacity;
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;
        context.fillRect(
          -particle.width / 2,
          -particle.height / 2,
          particle.width,
          particle.height
        );
        context.restore();

        return particle.life > 0 && particle.y < height + 36;
      });

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        context.clearRect(0, 0, width, height);
        animationFrameRef.current = null;
      }
    }, []);

    const fire = useCallback(
      ({
        particleCount = 72,
        spread = 118,
        startVelocity = 13,
        colors = ["#35c5ec", "#ed185a", "#f4c54e", "#91d9c0", "#2b160d"],
      }: ConfettiOptions = {}) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const now = Date.now();
        if (now - lastFireRef.current < 800) return;
        lastFireRef.current = now;

        canvas.dataset.fired = "true";
        resizeCanvas();
        const rect = canvas.getBoundingClientRect();
        const spreadRadians = (spread * Math.PI) / 180;

        for (let index = 0; index < particleCount; index += 1) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRadians;
          const velocity = startVelocity * (0.62 + Math.random() * 0.76);
          particlesRef.current.push({
            x: rect.width / 2 + (Math.random() - 0.5) * 70,
            y: rect.height * 0.5,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            gravity: 0.22 + Math.random() * 0.08,
            drag: 0.985,
            rotation: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.32,
            width: 5 + Math.random() * 6,
            height: 3 + Math.random() * 7,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 72 + Math.random() * 34,
            opacity: 1,
          });
        }

        if (animationFrameRef.current === null) {
          animationFrameRef.current = window.requestAnimationFrame(animate);
        }
      },
      [animate, resizeCanvas]
    );

    useImperativeHandle(forwardedRef, () => ({ fire }), [fire]);

    useEffect(() => {
      resizeCanvas();
      const observer = new ResizeObserver(resizeCanvas);
      if (canvasRef.current) observer.observe(canvasRef.current);
      return () => {
        observer.disconnect();
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [resizeCanvas]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className}
        {...props}
      />
    );
  }
);
