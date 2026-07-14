"use client";

import { useEffect, useRef } from "react";

type CloudIcon = {
  src: string;
  label: string;
};

type CropBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LoadedIcon = {
  image: HTMLImageElement;
  crop: CropBounds;
};

type Point = LoadedIcon & {
  x: number;
  y: number;
  z: number;
};

function spherePoint(index: number, total: number) {
  const y = 1 - ((index + 0.5) / Math.max(total, 1)) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = Math.PI * (3 - Math.sqrt(5)) * index;
  return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring };
}

function getVisibleBounds(image: HTMLImageElement): CropBounds {
  const helper = document.createElement("canvas");
  helper.width = image.naturalWidth;
  helper.height = image.naturalHeight;
  const helperContext = helper.getContext("2d", { willReadFrequently: true });

  if (!helperContext) {
    return { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  }

  helperContext.drawImage(image, 0, 0);
  const pixels = helperContext.getImageData(0, 0, helper.width, helper.height).data;
  let minX = helper.width;
  let minY = helper.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < helper.height; y += 1) {
    for (let x = 0; x < helper.width; x += 1) {
      if (pixels[(y * helper.width + x) * 4 + 3] < 12) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function IconCloud({
  icons,
  copies = 1,
}: {
  icons: readonly CloudIcon[];
  copies?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let stopped = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotationX = -0.2;
    let rotationY = 0.35;
    let momentumX = 0;
    let momentumY = 0;
    let points: Point[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loadImages = async () => {
      const loaded = (
        await Promise.all(
          icons.map(
            (icon) =>
              new Promise<LoadedIcon | null>((resolve) => {
                const image = new window.Image();
                image.onload = () => resolve({ image, crop: getVisibleBounds(image) });
                image.onerror = () => resolve(null);
                image.src = icon.src;
              }),
          ),
        )
      ).filter((icon): icon is LoadedIcon => icon !== null);

      const total = loaded.length * Math.max(1, copies);
      points = Array.from({ length: total }, (_, index) => ({
        ...spherePoint(index, total),
        ...loaded[index % loaded.length],
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const nextWidth = Math.round(width * ratio);
      const nextHeight = Math.round(height * ratio);

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      return { width, height };
    };

    const draw = () => {
      if (stopped) return;
      const { width, height } = resize();
      context.clearRect(0, 0, width, height);

      if (!dragging && !reduceMotion) {
        rotationY += 0.0026 + momentumY;
        rotationX += 0.0007 + momentumX;
        momentumX *= 0.94;
        momentumY *= 0.94;
      }

      const sinX = Math.sin(rotationX);
      const cosX = Math.cos(rotationX);
      const sinY = Math.sin(rotationY);
      const cosY = Math.cos(rotationY);
      const radius = Math.min(width, height) * 0.35;

      const projected = points
        .map((point) => {
          const x1 = point.x * cosY - point.z * sinY;
          const z1 = point.x * sinY + point.z * cosY;
          const y1 = point.y * cosX - z1 * sinX;
          const z2 = point.y * sinX + z1 * cosX;
          const perspective = 2.8 / (3.45 - z2);
          return {
            ...point,
            z: z2,
            screenX: width / 2 + x1 * radius * perspective,
            screenY: height / 2 + y1 * radius * perspective,
            scale: 0.5 + ((z2 + 1) / 2) * 0.62,
          };
        })
        .sort((a, b) => a.z - b.z);

      projected.forEach((point) => {
        const size = Math.max(16, Math.min(width, height) * 0.14) * point.scale;
        const alpha = 0.38 + ((point.z + 1) / 2) * 0.62;
        const sourceRatio = point.crop.width / point.crop.height;
        let drawWidth = size;
        let drawHeight = size / sourceRatio;

        if (drawHeight > size) {
          drawHeight = size;
          drawWidth = size * sourceRatio;
        }

        context.save();
        context.globalAlpha = alpha;
        context.shadowColor = `rgba(24, 19, 15, ${0.08 + alpha * 0.08})`;
        context.shadowBlur = Math.max(2, 6 * point.scale);
        context.shadowOffsetY = Math.max(1, 2 * point.scale);
        context.drawImage(
          point.image,
          point.crop.x,
          point.crop.y,
          point.crop.width,
          point.crop.height,
          point.screenX - drawWidth / 2,
          point.screenY - drawHeight / 2,
          drawWidth,
          drawHeight,
        );
        context.restore();
      });

      frame = window.requestAnimationFrame(draw);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      momentumX = 0;
      momentumY = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      rotationY += dx * 0.008;
      rotationX += dy * 0.008;
      momentumY = dx * 0.00065;
      momentumX = dy * 0.00065;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const endDrag = (event: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      canvas.style.cursor = "grab";
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    void loadImages().then(draw);

    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
    };
  }, [copies, icons]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-grab touch-pan-y"
      role="img"
      aria-label={`可拖动的 AI 工具图标云：${icons.map((icon) => icon.label).join("、")}`}
    />
  );
}
