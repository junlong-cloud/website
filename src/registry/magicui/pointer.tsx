"use client";

import { motion, useSpring, type HTMLMotionProps } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type PointerProps = HTMLMotionProps<"div">;

const subscribeToClient = () => () => undefined;

export function Pointer({ children, className = "", ...props }: PointerProps) {
  const x = useSpring(-80, { stiffness: 700, damping: 48, mass: 0.22 });
  const y = useSpring(-80, { stiffness: 700, damping: 48, mass: 0.22 });
  const [visible, setVisible] = useState(false);
  const mounted = useSyncExternalStore(subscribeToClient, () => true, () => false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    document.documentElement.classList.add("custom-pointer-active");

    const move = (event: PointerEvent) => {
      x.set(event.clientX - 4);
      y.set(event.clientY - 4);
      setVisible(true);
    };
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) setVisible(false);
    };
    const blur = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("blur", blur);

    return () => {
      document.documentElement.classList.remove("custom-pointer-active");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", blur);
    };
  }, [x, y]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-[10000] block ${className}`}
      style={{ x, y }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.65 }}
      transition={{ opacity: { duration: 0.12 }, scale: { duration: 0.18 } }}
      {...props}
    >
      {children}
    </motion.div>,
    document.body,
  );
}
