"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  iconColor?: string;
}

export default function ThemeToggle({ className = "", iconColor }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en mode jour" : "Passer en mode nuit"}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all hover:opacity-70 active:scale-90 ${className}`}
    >
      {isDark ? (
        <Sun size={16} style={{ color: iconColor }} />
      ) : (
        <Moon size={16} style={{ color: iconColor }} />
      )}
    </button>
  );
}
