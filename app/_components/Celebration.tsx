"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const COLORS = ["#8B4F58", "#E8B4BC", "#FFE4E1", "#E6C687", "#C9788A"];

type Piece = {
  id: number;
  left: number; // vw
  size: number; // px
  delay: number;
  duration: number;
  drift: number; // horizontal drift px
  rotate: number;
  color: string;
  petal: boolean;
};

function buildPieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: 8 + Math.random() * 12,
    delay: Math.random() * 0.6,
    duration: 2.8 + Math.random() * 1.8,
    drift: (Math.random() - 0.5) * 220,
    rotate: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    petal: Math.random() > 0.4,
  }));
}

/**
 * Full-screen rain of rose petals + confetti. Purely decorative and
 * non-interactive; auto-dismisses after the pieces fall.
 */
export default function Celebration({
  show,
  onDone,
}: {
  show: boolean;
  onDone?: () => void;
}) {
  const pieces = useMemo(() => (show ? buildPieces(70) : []), [show]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), 4200);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}vw`,
                width: p.size,
                height: p.petal ? p.size : p.size * 0.5,
                backgroundColor: p.color,
                borderRadius: p.petal ? "50% 0 50% 0" : "2px",
              }}
              initial={{ y: "-12vh", opacity: 0, rotate: p.rotate }}
              animate={{
                y: "112vh",
                x: p.drift,
                opacity: [0, 1, 1, 0.9],
                rotate: p.rotate + 360,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
