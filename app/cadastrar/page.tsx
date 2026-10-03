"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateWithTransition } from "../components/PageTransition";

type User = {
  name: string;
  email: string;
  password: string;
};

const MIN_PASSWORD_LENGTH = 6;

const circles = [
  "-left-24 -top-24 size-80",
  "right-10 top-16 size-24",
  "-right-32 top-1/3 size-96",
  "left-16 top-1/2 size-16",
  "-bottom-32 left-1/4 size-96",
  "bottom-20 right-1/4 size-32",
];

const inputClassName =
  "w-full rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-brand focus:outline-none sm:py-3.5 sm:text-base";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("isLogged") === "true") {
      router.replace("/chat");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const users: User[] = JSON.parse(localStorage.getItem("users") ?? "[]");
    const normalizedEmail = email.trim().toLowerCase();

    const emailAlreadyExists = users.some(
      (item) => item.email === normalizedEmail,
    );

    if (emailAlreadyExists) {
      setError("Este e-mail já está cadastrado.");
      return;
    }

    const newUser: User = {
      name: name.trim(),
      email: normalizedEmail,
      password,
    };

    localStorage.setItem("users", JSON.stringify([...users, newUser]));
    navigateWithTransition("/login");
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black px-2">
      {circles.map((circle) => (
        <div
          key={circle}
          className={`absolute rounded-full bg-brand/20 ${circle}`}
        />
      ))}

      <div className="relative z-10 flex size-[min(96vw,92dvh,40rem)] items-center justify-center rounded-full border border-brand/30 bg-black text-center">
        <div className="flex w-[68%] flex-col items-center gap-4 sm:w-3/5 sm:gap-6">
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            Criar conta
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-3 sm:gap-4"
          >
            <input
              type="text"
              placeholder="Nome"
              aria-label="Nome"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              required
            />

            <input
              type="email"
              placeholder="E-mail"
              aria-label="E-mail"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              aria-label="Senha"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
              required
            />

            <button
              type="submit"
              className="w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-black transition hover:brightness-110 sm:py-3.5 sm:text-base"
            >
              Criar conta
            </button>
          </form>

          {error && (
            <p role="alert" className="text-sm text-red-400 sm:text-base">
              {error}
            </p>
          )}

          <p className="text-sm text-white/60 sm:text-base">
            Já tem conta?{" "}
            <Link href="/login" className="text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}