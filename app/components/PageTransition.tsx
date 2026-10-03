"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function navigateWithTransition(href: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app:navigate", { detail: { href } })
    );
  }
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);
  const isNavigatingRef = useRef(false);

  // Reseta o estado quando a nova página é carregada para fazer o zoom de entrada
  useEffect(() => {
    setIsExiting(false);
    isNavigatingRef.current = false;
  }, [pathname]);

  const triggerExitAndNavigate = (href: string) => {
    if (isNavigatingRef.current || href === pathname) return;
    isNavigatingRef.current = true;
    setIsExiting(true);

    // Faz a animação de saída primeiro e só depois muda de página
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  // Intercepta cliques em links para animar antes de navegar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        anchor.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        if (href === pathname) return;
        e.preventDefault();
        e.stopPropagation();
        triggerExitAndNavigate(href);
      }
    };

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<{ href: string }>;
      if (customEvent.detail?.href) {
        triggerExitAndNavigate(customEvent.detail.href);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("app:navigate", handleCustomNav);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("app:navigate", handleCustomNav);
    };
  }, [pathname, router]);

  return (
    <div className="w-full h-full min-h-dvh overflow-hidden bg-black">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={
          isExiting
            ? { opacity: 0, scale: 0.96 }
            : { opacity: 1, scale: 1 }
        }
        transition={{
          duration: isExiting ? 0.18 : 0.22,
          ease: isExiting ? [0.4, 0, 0.2, 1] : [0.22, 1, 0.36, 1],
        }}
        className="w-full h-full min-h-dvh flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
}
