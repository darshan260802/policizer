"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      setLoading(false);
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed", error);
    } finally {
      setLoading(false);
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  async function subscribeToPush() {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
      await fetch("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify(sub),
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error subscribing to push", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-slate-500">Push notifications not supported in this browser.</p>;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={loading}
      onClick={subscription ? undefined : subscribeToPush}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
        subscription
          ? "bg-slate-100 text-slate-500 cursor-default dark:bg-slate-800 dark:text-slate-400"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
      }`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : subscription ? (
        <>
          <BellOff className="w-5 h-5" />
          Notifications Enabled
        </>
      ) : (
        <>
          <Bell className="w-5 h-5" />
          Enable Notifications
        </>
      )}
    </motion.button>
  );
}
