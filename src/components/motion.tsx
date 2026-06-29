"use client";

import { cn } from "@/lib/utils";
import { Children, type ReactElement, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: 100 | 150 | 200 | 300 | 400 | 500;
  direction?: "up" | "fade" | "scale";
}

export function FadeIn({ children, className, delay, direction = "up" }: FadeInProps) {
  const animation = {
    up: "animate-slide-up",
    fade: "animate-fade-in",
    scale: "animate-scale-in",
  };
  return (
    <div className={cn(animation[direction], delay && `animate-delay-${delay}`, className)}>
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: 100 | 150 | 200;
}

const delayClass = (index: number, stagger: number) => {
  const ms = (index + 1) * stagger;
  if (ms <= 100) return "animate-delay-100";
  if (ms <= 150) return "animate-delay-150";
  if (ms <= 200) return "animate-delay-200";
  if (ms <= 300) return "animate-delay-300";
  if (ms <= 400) return "animate-delay-400";
  return "animate-delay-500";
};

export function StaggerContainer({ children, className, stagger = 100 }: StaggerContainerProps) {
  return (
    <div className={cn(className)}>
      {Children.map(children, (child, index) => (
        <div className={cn("animate-slide-up", delayClass(index, stagger))}>
          {child as ReactElement}
        </div>
      ))}
    </div>
  );
}
