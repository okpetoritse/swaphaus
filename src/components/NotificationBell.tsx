"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: "unread" | "read";
  created_at: string;
  actor?: { display_name: string; avatar_url: string | null };
}

export default function NotificationBell() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
      setLoading(false);
    }

    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  async function markAsRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition"
      >
        <Bell size={18} className="text-paper" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-stamp" />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg bg-ink-soft border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-body font-bold text-paper">Notifications</h3>
            <button onClick={() => setOpen(false)}>
              <X size={16} className="text-paper-dim" />
            </button>
          </div>

          {loading ? (
            <p className="p-4 text-xs text-paper-dim">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-xs text-paper-dim">No notifications yet</p>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`w-full text-left p-3 transition hover:bg-white/5 ${
                    notif.status === "unread" ? "bg-white/5" : ""
                  }`}
                >
                  <p className="text-sm font-body font-bold text-paper">
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-paper-dim mt-1">{notif.message}</p>
                  )}
                  <p className="text-[10px] text-paper-dim/50 mt-2">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}