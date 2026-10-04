"use client";

import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

// The panel (and its logic) is only downloaded when the visitor first opens the chat.
const ChatPanel = dynamic(() => import("./ChatPanel"), { ssr: false });

export function ChatWidget() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {loaded ? <ChatPanel open={open} setOpen={setOpen} /> : null}
      <button
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen(!open);
        }}
        onPointerEnter={() => setLoaded(true)}
        aria-expanded={open}
        aria-label={open ? t("close") : t("open")}
        className="fixed bottom-4 right-4 z-[65] grid size-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-black/30 transition hover:scale-105 sm:right-5"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20 [animation-iteration-count:3] motion-reduce:hidden" aria-hidden />
        {open ? <X className="relative size-6" aria-hidden /> : <MessageCircle className="relative size-6" aria-hidden />}
      </button>
    </>
  );
}
