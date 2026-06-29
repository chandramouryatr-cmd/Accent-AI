"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Sparkles, Palette, RotateCcw, ShoppingBag, Check, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";

interface ShopItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  isUnique: boolean; // can only buy once
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "streakFreeze",
    emoji: "🛡️",
    name: "Streak Freeze",
    description: "Protects your streak for 1 missed day. Auto-applies when you miss a day.",
    cost: 50,
    icon: <Shield className="w-5 h-5" />,
    isUnique: false,
  },
  {
    id: "lessonRetry",
    emoji: "🔄",
    name: "Lesson Retry",
    description: "Reset a lesson's score to try again for a higher score.",
    cost: 30,
    icon: <RotateCcw className="w-5 h-5" />,
    isUnique: false,
  },
  {
    id: "doubleXP",
    emoji: "⚡",
    name: "Double XP",
    description: "Next completed lesson earns 2× XP. Consumed automatically.",
    cost: 100,
    icon: <Zap className="w-5 h-5" />,
    isUnique: true,
  },
  {
    id: "customTheme",
    emoji: "🎨",
    name: "Custom Theme",
    description: "Unlock a special gradient theme accent. Cosmetic only.",
    cost: 200,
    icon: <Palette className="w-5 h-5" />,
    isUnique: true,
  },
];

export function XPShop() {
  const xp = useAppStore((s) => s.xp);
  const xpShopItems = useAppStore((s) => s.xpShopItems);
  const buyStreakFreeze = useAppStore((s) => s.buyStreakFreeze);
  const buyDoubleXP = useAppStore((s) => s.buyDoubleXP);
  const buyCustomTheme = useAppStore((s) => s.buyCustomTheme);
  const buyLessonRetry = useAppStore((s) => s.buyLessonRetry);
  const pushToast = useToastStore((s) => s.push);

  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [justBought, setJustBought] = useState<string | null>(null);
  const [xpDelta, setXpDelta] = useState<{ from: number; to: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleBuy = useCallback(
    (item: ShopItem) => {
      // Check if unique item already owned
      if (item.isUnique) {
        if (item.id === "doubleXP" && xpShopItems.doubleXP) return;
        if (item.id === "customTheme" && xpShopItems.customTheme) return;
      }

      if (xp < item.cost) return;

      setPurchasingId(item.id);
      const prevXP = xp;

      // Small delay for animation
      setTimeout(() => {
        let success = false;
        switch (item.id) {
          case "streakFreeze":
            success = buyStreakFreeze();
            break;
          case "doubleXP":
            success = buyDoubleXP();
            break;
          case "customTheme":
            success = buyCustomTheme();
            break;
          case "lessonRetry":
            success = buyLessonRetry();
            break;
        }

        if (success) {
          setXpDelta({ from: prevXP, to: prevXP - item.cost });
          setJustBought(item.id);
          pushToast({
            variant: "badge",
            emoji: item.emoji,
            title: `${item.name} Purchased!`,
            subtitle: `−${item.cost} XP · ${item.name} is now active`,
            duration: 4000,
            gradient:
              "linear-gradient(135deg, rgba(245,158,11,0.95), rgba(249,115,22,0.95))",
          });
          setTimeout(() => {
            setJustBought(null);
            setXpDelta(null);
          }, 1200);
        }

        setPurchasingId(null);
      }, 300);
    },
    [xp, xpShopItems, buyStreakFreeze, buyDoubleXP, buyCustomTheme, buyLessonRetry, pushToast]
  );

  const isOwned = (item: ShopItem) => {
    if (item.id === "doubleXP") return xpShopItems.doubleXP;
    if (item.id === "customTheme") return xpShopItems.customTheme;
    return false;
  };

  const getOwnedCount = (item: ShopItem) => {
    if (item.id === "streakFreeze") return xpShopItems.streakFreezes;
    if (item.id === "lessonRetry") return xpShopItems.lessonRetries;
    return isOwned(item) ? 1 : 0;
  };

  const hasActiveItems =
    xpShopItems.streakFreezes > 0 ||
    xpShopItems.doubleXP ||
    xpShopItems.customTheme ||
    xpShopItems.lessonRetries > 0;

  return (
    <div className="space-y-5">
      {/* Header with XP counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="font-d text-base font-bold">XP Shop</h2>
        </div>
        <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
          <Zap className="w-4 h-4 text-[#f59e0b]" />
          <motion.span
            key={xp}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm font-mono font-bold text-[#f59e0b]"
          >
            {xp} XP
          </motion.span>
          {/* XP delta animation */}
          <AnimatePresence>
            {xpDelta && (
              <motion.span
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute -top-4 right-1 text-xs font-mono font-bold text-[#ef4444]"
              >
                −{xpDelta.from - xpDelta.to}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Shop items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item) => {
          const canAfford = xp >= item.cost;
          const owned = isOwned(item);
          const ownedCount = getOwnedCount(item);
          const isPurchasing = purchasingId === item.id;
          const wasBought = justBought === item.id;
          const isDisabled = !canAfford || owned || isPurchasing;

          return (
            <motion.div
              key={item.id}
              onHoverStart={() => setHoveredId(item.id)}
              onHoverEnd={() => setHoveredId(null)}
              whileHover={!isDisabled ? { y: -4, scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              className={`relative rounded-2xl overflow-hidden transition-colors ${
                owned
                  ? "bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.3)]"
                  : canAfford
                    ? "bg-[rgba(245,158,11,0.04)] border border-[rgba(245,158,11,0.2)] hover:border-[rgba(245,158,11,0.4)]"
                    : "bg-[var(--overlay-1)] border border-[var(--border)] opacity-60"
              }`}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {/* Gold shimmer sweep on affordable items (ambient) */}
              {canAfford && !owned && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.08) 45%, rgba(245,158,11,0.15) 50%, rgba(245,158,11,0.08) 55%, transparent 100%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2,
                    }}
                  />
                </div>
              )}

              {/* Hover shimmer sweep — brighter single-pass highlight on any card */}
              <AnimatePresence>
                {hoveredId === item.id && !owned && (
                  <motion.div
                    key="hover-shimmer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-[2]"
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 45%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.16) 55%, transparent 100%)",
                      }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.9, ease: "easeInOut" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Purchase success overlay */}
              <AnimatePresence>
                {wasBought && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(16,185,129,0.15)] rounded-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-12 h-12 rounded-full bg-[rgba(16,185,129,0.3)] flex items-center justify-center"
                    >
                      <Check className="w-6 h-6 text-[#10b981]" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative p-4 z-[1]">
                <div className="flex items-start gap-3">
                  {/* Emoji icon */}
                  <motion.div
                    animate={
                      isPurchasing
                        ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                        : wasBought
                          ? { scale: [1, 1.2, 1] }
                          : {}
                    }
                    transition={{ duration: 0.4 }}
                    className="flex-shrink-0 w-11 h-11 rounded-xl bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center text-xl"
                  >
                    {item.emoji}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[var(--t1)]">
                        {item.name}
                      </span>
                      {ownedCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] font-semibold"
                        >
                          {owned ? "Owned ✓" : `×${ownedCount}`}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--t2)] leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Buy button */}
                    <motion.button
                      onClick={() => handleBuy(item)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.03 } : {}}
                      whileTap={!isDisabled ? { scale: 0.97 } : {}}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        owned
                          ? "bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)] cursor-default"
                          : canAfford
                            ? "bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white shadow-[0_2px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]"
                            : "bg-[var(--card)] text-[var(--t3)] border border-[var(--border)] cursor-not-allowed"
                      }`}
                    >
                      {isPurchasing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </motion.div>
                      ) : owned ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Owned
                        </>
                      ) : canAfford ? (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Buy · </span>
                          <motion.span
                            className="inline-block font-mono"
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            {item.cost}
                          </motion.span>
                          <span> XP</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          Not enough XP
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Items / Inventory */}
      {hasActiveItems && (
        <div>
          <h3 className="font-d text-sm font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            Active Items
          </h3>
          <div className="space-y-2">
            {xpShopItems.streakFreezes > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]"
              >
                <span className="text-lg">🛡️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t1)]">
                    Streak Freeze
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] font-semibold">
                      Active ✓
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--t2)]">
                    {xpShopItems.streakFreezes} {xpShopItems.streakFreezes === 1 ? "freeze" : "freezes"} ready — auto-applies on missed days
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-[#f59e0b]">
                  ×{xpShopItems.streakFreezes}
                </div>
              </motion.div>
            )}

            {xpShopItems.doubleXP && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)] animate-gold-glow"
              >
                <span className="text-lg">⚡</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t1)]">
                    Double XP
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#f59e0b] font-semibold">
                      Ready ⚡
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--t2)]">
                    Next lesson earns 2× XP
                  </div>
                </div>
              </motion.div>
            )}

            {xpShopItems.customTheme && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.2)]"
              >
                <span className="text-lg">🎨</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t1)]">
                    Custom Theme
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] font-semibold">
                      Unlocked ✓
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--t2)]">
                    Special gradient accent applied
                  </div>
                </div>
                <div
                  className="w-6 h-6 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316, #ec4899, #8b5cf6)",
                  }}
                />
              </motion.div>
            )}

            {xpShopItems.lessonRetries > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(34,211,238,0.06)] border border-[rgba(34,211,238,0.15)]"
              >
                <span className="text-lg">🔄</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t1)]">
                    Lesson Retry
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(34,211,238,0.15)] text-[#22d3ee] font-semibold">
                      Available
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--t2)]">
                    Reset a completed lesson to try for a higher score
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-[#22d3ee]">
                  ×{xpShopItems.lessonRetries}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Empty state when no active items */}
      {!hasActiveItems && (
        <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)] text-center">
          <div className="text-3xl mb-2">🛍️</div>
          <div className="text-sm text-[var(--t2)] mb-1">No active items yet</div>
          <div className="text-[10px] text-[var(--t3)]">
            Earn XP from lessons and spend them here on power-ups!
          </div>
        </div>
      )}
    </div>
  );
}
