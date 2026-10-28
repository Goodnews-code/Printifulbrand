"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

function offset(direction: Direction) {
  switch (direction) {
    case "up":
      return { y: 24 };
    case "down":
      return { y: -20 };
    case "left":
      return { x: 24 };
    case "right":
      return { x: -24 };
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

/** Scroll-triggered fade + slide. Respects prefers-reduced-motion and ensures immediate visibility before mount. */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduce || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.7, ...offset(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.05, margin: "0px 0px 50px 0px" }}
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
  stagger = 0.1,
  delay = 0,
  once = true,
}: StaggerProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduce || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.05, margin: "0px 0px 50px 0px" }}
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
  const [mounted, setMounted] = useState(false);
  const from = offset(direction);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduce || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0.7, ...from },
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

/** Mount-only entrance (hero, page headers). Immediately visible before mount. */
export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: FadeInProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduce || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.7, ...offset(direction) }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
