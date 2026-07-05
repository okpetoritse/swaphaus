"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Check, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SwapOffer, Message } from "@/types/database";
import { sendMessage, updateOfferStatus } from "@/lib/supabase/actions";

interface SwapThreadProps {
  offer: SwapOffer;
  currentUserId: string;
}

export default function SwapThread({
  offer,
  currentUserId,
}: SwapThreadProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<SwapOffer["status"]>(offer.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOfferer = currentUserId === offer.offerer_id;
  const otherUser = isOfferer ? offer.recipient_profile : offer.offerer_profile;

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("swap_offer_id", offer.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    }

    loadMessages();

    const channel = supabase
      .channel(`swap_${offer.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `swap_offer_id=eq.${offer.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [offer.id, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim()) return;

    const msg = input;
    setInput("");
    setSending(true);

    try {
      await sendMessage(offer.id, msg);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          swap_offer_id: offer.id,
          sender_id: currentUserId,
          content: msg,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setInput(msg);
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function handleStatusUpdate(newStatus: "accepted" | "declined" | "cancelled") {
  setUpdatingStatus(true);
  try {
    await updateOfferStatus(offer.id, newStatus);
    setStatus(newStatus);
  } catch (err) {
    console.error(err);
  } finally {
    setUpdatingStatus(false);
  }
}

  return (
    <div className="flex flex-col h-screen bg-ink">
      <header className="shrink-0 px-4 py-4 border-b border-white/10 bg-ink-soft flex items-center justify-between">
        <Link href="/swaps" className="p-1">
          <ChevronLeft size={20} className="text-paper" />
        </Link>
        <div className="flex-1 ml-3">
          <p className="text-[11px] uppercase tracking-widest text-stamp font-mono">
            {isOfferer ? "Trading with" : "Offer from"}
          </p>
          <h2 className="text-sm font-body font-bold text-paper">
            {otherUser?.display_name || "User"}
          </h2>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded ${
            status === "pending"
              ? "bg-brass/20 text-brass"
              : status === "accepted"
              ? "bg-swap/20 text-swap"
              : "bg-stamp/20 text-stamp"
          }`}
        >
          {status}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-ink">
        {loading ? (
          <p className="text-center text-paper-dim text-sm">Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-paper-dim text-sm mt-6">
            Start the conversation — tell them what you're looking for!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-3.5 py-2.5 text-sm break-words rounded-lg ${
                  msg.sender_id === currentUserId
                    ? "bg-swap text-paper"
                    : "bg-ink-soft text-paper border border-white/10"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.sender_id === currentUserId
                      ? "text-white/60"
                      : "text-paper-dim/60"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {status === "pending" && !isOfferer && (
  <div className="shrink-0 px-4 py-3 border-t border-white/10 bg-ink-soft flex gap-2">
    <button
      onClick={() => handleStatusUpdate("accepted")}
      disabled={updatingStatus}
      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-3 font-semibold text-sm bg-swap text-paper active:scale-95 transition-transform disabled:opacity-60"
    >
      <Check size={16} /> Accept
    </button>
    <button
      onClick={() => handleStatusUpdate("declined")}
      disabled={updatingStatus}
      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-3 font-semibold text-sm bg-stamp text-paper active:scale-95 transition-transform disabled:opacity-60"
    >
      <X size={16} /> Decline
    </button>
  </div>
)}

{status === "accepted" && (
  <div className="shrink-0 px-4 py-3 border-t border-white/10 bg-ink-soft">
    <p className="text-xs text-swap font-semibold mb-2 uppercase">Swap accepted!</p>
    <button
      onClick={async () => {
        try {
          const res = await fetch("/api/shipping/create-label", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ offerId: offer.id }),
          });

          if (!res.ok) {
            const error = await res.json();
            alert(`Error: ${error.error}`);
            return;
          }

          const label = await res.json();
console.log("Label response:", label);

if (label.labelUrl) {
  window.open(label.labelUrl, "_blank");
}

const trackingMsg = label.testMode
  ? `Test Mode - Transaction ID: ${label.transactionId}`
  : `Tracking: ${label.trackingNumber}`;

alert(`✓ Label generated!\n\n${trackingMsg}\n\n${label.labelUrl ? "PDF ready to print" : "PDF will be available in production"}`);
        } catch (err) {
          alert(`Error: ${err instanceof Error ? err.message : "Failed to generate label"}`);
        }
      }}
      className="w-full rounded-lg py-3 bg-swap text-paper font-semibold text-sm active:scale-95 transition-transform"
    >
      📦 Print Shipping Label
    </button>
  </div>
)}

      {!["declined", "cancelled"].includes(status) && (
        <div className="shrink-0 p-4 border-t border-white/10 bg-ink-soft flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Say something..."
            className="flex-1 rounded-lg px-3.5 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !input.trim()}
            className="rounded-lg px-4 py-3 bg-swap text-paper font-semibold text-sm active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
}