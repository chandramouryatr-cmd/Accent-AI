"use client";

import { create } from "zustand";

export type ToastVariant =
  | "lesson"
  | "badge"
  | "goal"
  | "streak"
  | "info"
  | "milestone";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  subtitle?: string;
  emoji?: string;
  // Optional gradient override (CSS string). Falls back to variant default.
  gradient?: string;
  // Auto-dismiss delay (ms). 0 = sticky.
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;
function nextId() {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId();
    const item: ToastItem = { id, duration: 5200, ...toast };
    set({ toasts: [...get().toasts, item] });
    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, item.duration);
    }
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}));

// Variant → default gradient (indigo/violet/amber/cyan, no blue)
export const TOAST_GRADIENT: Record<ToastVariant, string> = {
  lesson: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(167,139,250,0.95))",
  badge: "linear-gradient(135deg, rgba(245,158,11,0.95), rgba(236,72,153,0.95))",
  goal: "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(34,211,238,0.95))",
  streak: "linear-gradient(135deg, rgba(245,158,11,0.95), rgba(239,68,68,0.95))",
  info: "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(99,102,241,0.95))",
  milestone:
    "linear-gradient(135deg, rgba(236,72,153,0.95), rgba(167,139,250,0.95))",
};

export const TOAST_EMOJI: Record<ToastVariant, string> = {
  lesson: "🎉",
  badge: "🏅",
  goal: "🎯",
  streak: "🔥",
  info: "💡",
  milestone: "⭐",
};
