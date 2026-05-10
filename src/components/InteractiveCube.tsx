"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const CubeFace = ({ transform, size }: { transform: string, size: number }) => {
  const squareSize = 40; // Small grid size
  const maxCols = Math.floor(size / squareSize);

  return (
    <div
      className="absolute border-2 border-[var(--color-foreground)] opacity-60 overflow-hidden"
      style={{
        width: size,
        height: size,
        transform,
        transformStyle: "preserve-3d",
        // The highly performant base static grid
        backgroundImage: "linear-gradient(to right, var(--color-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--color-foreground) 1px, transparent 1px)",
        backgroundSize: `${squareSize}px ${squareSize}px`
      }}
    >
      {/* Overlay a small number of "active" animating squares to simulate the effect without lag */}
      {Array.from({ length: 9 }).map((_, i) => {
        // Place one square in each of the 3x3 grid slots
        const col = i % maxCols;
        const row = Math.floor(i / maxCols);

        const duration = 1 + (i % 4);
        const delay = (i % 5) * 0.3;

        return (
          <div
            key={i}
            className="absolute bg-[var(--color-background)]"
            style={{
              width: squareSize,
              height: squareSize,
              left: col * squareSize,
              top: row * squareSize,
              // Using our optimized scale animation from globals.css
              animation: `cellPop ${duration}s infinite ease-in-out ${delay}s`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

const Cube = ({ size }: { size: number }) => {
  const half = size / 2;
  return (
    <>
      <CubeFace size={size} transform={`translateZ(${half}px)`} />
      <CubeFace size={size} transform={`translateZ(-${half}px) rotateY(180deg)`} />
      <CubeFace size={size} transform={`translateX(${half}px) rotateY(90deg)`} />
      <CubeFace size={size} transform={`translateX(-${half}px) rotateY(-90deg)`} />
      <CubeFace size={size} transform={`translateY(-${half}px) rotateX(90deg)`} />
      <CubeFace size={size} transform={`translateY(${half}px) rotateX(-90deg)`} />
    </>
  );
};

export default function InteractiveCube() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Map mouse position to a subtle rotation offset (+- 15 degrees)
  const mouseRotateX = useTransform(springY, [-1, 1], [15, -15]);
  const mouseRotateY = useTransform(springX, [-1, 1], [-15, 15]);

  // Base rotation (Rubik's Snaps)
  const baseRotateX = useSpring(0, { damping: 10, stiffness: 5, mass: 1.5 });
  const baseRotateY = useSpring(0, { damping: 10, stiffness: 5, mass: 1.5 });
  const baseRotateZ = useSpring(0, { damping: 10, stiffness: 5, mass: 1.5 });

  useEffect(() => {
    // Every 2.5 seconds, sharply rotate the cube 90 degrees on a random axis
    const interval = setInterval(() => {
      const axes = ['x', 'y', 'z'] as const;
      const randomAxis = axes[Math.floor(Math.random() * axes.length)];
      const direction = Math.random() > 0.5 ? 90 : -90;

      if (randomAxis === 'x') baseRotateX.set(baseRotateX.get() + direction);
      if (randomAxis === 'y') baseRotateY.set(baseRotateY.get() + direction);
      if (randomAxis === 'z') baseRotateZ.set(baseRotateZ.get() + direction);
    }, 2500);

    return () => clearInterval(interval);
  }, [baseRotateX, baseRotateY, baseRotateZ]);

  // Combine Rubik's snapping rotation with subtle mouse interaction
  const rotateX = useTransform(() => baseRotateX.get() + mouseRotateX.get());
  const rotateY = useTransform(() => baseRotateY.get() + mouseRotateY.get());
  const rotateZ = useTransform(() => baseRotateZ.get());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth) * 2 - 1);
      mouseY.set((e.clientY / innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10 overflow-hidden"
      style={{ perspective: "1500px" }}
    >
      <motion.div
        style={{
          width: 0,
          height: 0,
          rotateX,
          rotateY,
          rotateZ,
          transformStyle: "preserve-3d",
          scale: 9// Zoom the cube so it covers the screen like a flat grid
        }}
        className="flex justify-center items-center"
      >
        {/* Outer Cube (Massive grid environment) */}
        <div className="absolute flex justify-center items-center" style={{ transformStyle: "preserve-3d" }}>
          <Cube size={140} />
        </div>
      </motion.div>
    </div>
  );
}


