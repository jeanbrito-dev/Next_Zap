"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const circles = [
  "-left-24 -top-24 size-80",
  "right-10 top-16 size-24",
  "-right-32 top-1/3 size-96",
  "left-16 top-1/2 size-16",
  "-bottom-32 left-1/4 size-96",
  "bottom-20 right-1/4 size-32",
];

export default function Home() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(localStorage.getItem("isLogged") === "true");
  }, []);

  const buttonHref = isLogged ? "/chat" : "/login";
  const buttonText = isLogged ? "Abrir chat" : "Entrar";

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      {circles.map((circle) => (
        <div
          key={circle}
          className={`absolute rounded-full bg-brand/20 ${circle}`}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">
        <h1 className="text-7xl font-bold text-white">Next Zap</h1>

        <p className="text-4xl text-white/70">Converse em tempo real.</p>

        <Link
          href={buttonHref}
          className="mt-4 rounded-full bg-brand px-10 py-4 text-lg font-semibold text-black transition hover:brightness-110"
        >
          {buttonText}
        </Link>
      </div>
    </main>
  );
}