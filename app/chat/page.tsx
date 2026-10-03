"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { navigateWithTransition } from "../components/PageTransition";
import { conversations as mockConversations } from "@/app/data";
import { Menu, Trash2 } from "@deemlol/next-icons";

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  name: string;
  messages: Message[];
};

const CONVERSATIONS_KEY = "conversations";

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [text, setText] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (localStorage.getItem("isLogged") !== "true" || !savedUser) {
      localStorage.removeItem("isLogged");
      router.replace("/login");
      return;
    }

    const savedConversations = localStorage.getItem(CONVERSATIONS_KEY);

    setUserName(JSON.parse(savedUser).name);
    setConversations(
      savedConversations ? JSON.parse(savedConversations) : mockConversations,
    );
  }, [router]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  function updateSelectedMessages(messages: Message[]) {
    const updatedConversations = conversations.map((conversation) =>
      conversation.id === selectedId ? { ...conversation, messages } : conversation,
    );

    localStorage.setItem(
      CONVERSATIONS_KEY,
      JSON.stringify(updatedConversations),
    );
    setConversations(updatedConversations);
  }

  function handleOpenConversation(conversationId: string) {
    setSelectedId(conversationId);
    setIsChatOpen(true);
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || !selectedConversation) {
      return;
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      fromMe: true,
      text: trimmedText,
      createdAt: new Date().toISOString(),
    };

    updateSelectedMessages([...selectedConversation.messages, newMessage]);
    setText("");
  }

  function handleDeleteMessage(messageId: string) {
    if (!selectedConversation) {
      return;
    }

    const messageToDelete = selectedConversation.messages.find(
      (message) => message.id === messageId,
    );

    if (!messageToDelete || !messageToDelete.fromMe) {
      return;
    }

    updateSelectedMessages(
      selectedConversation.messages.filter((message) => message.id !== messageId),
    );
  }

  function handleLogout() {
    localStorage.removeItem("isLogged");
    localStorage.removeItem("currentUser");
    navigateWithTransition("/login");
  }

  return (
    <main className="relative flex h-dvh overflow-hidden bg-black text-white">
      <aside
        className={`absolute inset-0 flex flex-col border-r border-white/10 bg-black transition-transform duration-300 ease-out motion-reduce:transition-none md:static md:w-96 md:shrink-0 md:translate-x-0 ${
          isChatOpen ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Next Zap</h1>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:border-brand hover:text-brand"
          >
            Sair
          </button>
        </header>

        <ul className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const lastMessage =
              conversation.messages[conversation.messages.length - 1];

            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => handleOpenConversation(conversation.id)}
                  className={`flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-white/5 ${
                    conversation.id === selectedId ? "bg-brand/15" : ""
                  }`}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand/20 text-lg font-semibold text-brand">
                    {conversation.name.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">
                        {conversation.name}
                      </span>

                      {lastMessage && (
                        <span className="shrink-0 text-xs text-white/50">
                          {formatTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <p className="truncate text-sm text-white/60">
                      {lastMessage ? lastMessage.text : "Sem mensagens"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        className={`absolute inset-0 flex min-w-0 flex-col bg-black transition-transform duration-300 ease-out motion-reduce:transition-none md:static md:flex-1 md:translate-x-0 ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedConversation ? (
          <>
            <header className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="text-sm text-white/60 transition hover:text-brand md:hidden"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>

              <h2 className="truncate text-xl font-semibold">
                {selectedConversation.name}
              </h2>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 py-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2.5 md:max-w-[60%] ${
                    message.fromMe
                      ? "self-end bg-brand text-black"
                      : "self-start bg-white/10 text-white"
                  }`}
                >
                  <p className="wrap-break-word">{message.text}</p>

                  <div className="flex items-center justify-end gap-3 text-xs opacity-60">
                    <span>{formatTime(message.createdAt)}</span>

                    {message.fromMe && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="underline transition hover:opacity-100"
                      >
                        <Trash2 size={20} color="#ef4444" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div ref={endOfMessagesRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="flex gap-3 border-t border-white/10 p-4"
            >
              <input
                type="text"
                placeholder="Digite uma mensagem"
                aria-label="Mensagem"
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 focus:border-brand focus:outline-none"
              />

              <button
                type="submit"
                className="rounded-full bg-brand px-6 py-3 font-semibold text-black transition hover:brightness-110"
              >
                Enviar
              </button>
            </form>
          </>
        ) : (
          <p className="m-auto text-xl text-white/50">Selecione uma conversa</p>
        )}
      </section>
    </main>
  );
}