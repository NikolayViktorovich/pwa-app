"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MegaKabanGame from "./MegaKabanGame";
interface Leader {
  id: string;
  bestScore: number;
}

export default function MegaKabanCard() {
  const [gameActive, setGameActive] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);

    fetchLeaders();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const fetchLeaders = async () => {
    try {
      const res = await fetch("/api/score/leaderboard");
      const data = await res.json();
      if (data.success) setLeaders(data.players);
    } catch (e) {
      console.log("Ошибка загрузки лидеров");
    }
  };

  const handleSubscribe = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!PUBLIC_VAPID_KEY) {
        console.error("VAPID KEY не найден в .env");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PUBLIC_VAPID_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "local_user",
          subscription,
        }),
      });

      setIsSubscribed(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      if (window.navigator.vibrate) window.navigator.vibrate(100);
    } catch (err) {
      console.error("Ошибка подписки:", err);
    }
  };

  const startGame = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    setGameActive(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none"
      >
        <div className={`px-4 py-1 rounded-full border text-[10px] font-bold tracking-tighter flex items-center gap-2 backdrop-blur-md ${
          isOnline ? "bg-zinc-900/80 border-green-500/50 text-green-400" : "bg-red-900/80 border-red-500/50 text-red-400"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {isOnline ? "СЕТЬ АКТИВНА" : "АВТОНОМНЫЙ РЕЖИМ"}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!gameActive ? (
          <motion.main
            key="lobby"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, filter: "blur(10px)" }}
            className="flex flex-col items-center justify-center p-6 min-h-screen"
          >
            <div className="w-full max-w-sm bg-zinc-900 rounded-[3rem] p-8 border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/10 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 bg-zinc-800 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner"
                >
                  🐗
                </motion.div>

                <h1 className="text-4xl font-black italic tracking-tighter mb-1 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
                  МЕГА КАБАН
                </h1>
                <p className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase mb-8">
                  Rapid PWA Edition
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-900/20 transition-colors"
                >
                  ИГРАТЬ
                </motion.button>

                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribed}
                  className={`mt-4 w-full py-3 rounded-xl border text-[10px] font-bold transition-all ${
                    isSubscribed 
                      ? "border-zinc-800 text-zinc-600 cursor-default" 
                      : "border-zinc-700 text-zinc-400 hover:bg-zinc-800 active:scale-95"
                  }`}
                >
                  {isSubscribed ? "УВЕДОМЛЕНИЯ ВКЛЮЧЕНЫ ✓" : "🔔 ВКЛЮЧИТЬ ПУШ-УВЕДОМЛЕНИЯ"}
                </button>
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-sm mt-8"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Зал славы</h2>
                <div className="h-px flex-1 bg-zinc-800 mx-4" />
              </div>
              
              <div className="space-y-2">
                {leaders.length > 0 ? leaders.map((player, i) => (
                  <div key={player.id} className="flex justify-between items-center bg-zinc-900/30 p-3 rounded-xl border border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-400">
                      <span className="mr-2 opacity-50">#{i + 1}</span>
                      {player.id.slice(0, 10)}...
                    </span>
                    <span className="text-sm font-black text-orange-500">{player.bestScore}</span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-zinc-700 text-[10px] uppercase tracking-tighter">
                    Данные загружаются из Docker...
                  </div>
                )}
              </div>
            </motion.div>
          </motion.main>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-black"
          >
            <MegaKabanGame onClose={() => setGameActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-white text-black px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3"
          >
            <span>🐗</span>
            <span className="text-sm">Теперь ты узнаешь, если рекорд побьют!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}