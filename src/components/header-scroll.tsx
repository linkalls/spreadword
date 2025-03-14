"use client";

import { useEffect, useState } from "react";

export function HeaderScroll({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md py-2"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 py-4"
      }`}
    >
      {children}
    </header>
  );
}
