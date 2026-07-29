"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

function offset(direction: Direction) {
  switch (direction) {
    case "up":
      return { y: 32 };
    case "down":
      return { y: -24 };
    case "left":
      return { x: 36 };
    case "right":
      return { x: -36 };
    default:
      return {};
  }
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  once?: boolean;
}

/** Scroll-triggered fade + slide. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

/** Parent for staggered children — wrap each child in StaggerItem. */
export function Stagger({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  once = true,
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15, margin: "0px 0px -40px 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  ...rest
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  const from = offset(direction);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...from },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.5, ease: EASE },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  duration?: number;
}

/** Mount-only entrance (hero, page headers). */
export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset(direction) }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
