"use client";

import { Bot, X } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
        className={cn(
          "fixed bottom-4 end-4 z-[65] flex h-14 items-center justify-center gap-2.5 rounded-full bg-accent text-accent-fg shadow-lg shadow-black/30 transition hover:scale-105 sm:end-5",
          open ? "w-14" : "ps-2 pe-5",
        )}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20 [animation-iteration-count:3] motion-reduce:hidden" aria-hidden />
        {open ? (
          <X className="relative size-6" aria-hidden />
        ) : (
          <>
            {/* Visible label + robot so visitors know it's an assistant before they click. */}
            <span className="relative grid size-10 place-items-center rounded-full bg-accent-fg/10">
              <Bot className="size-6" aria-hidden />
            </span>
            <span className="relative text-sm font-semibold whitespace-nowrap">{t("launcher")}</span>
          </>
        )}
      </button>
    </>
  );
}
