"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MegaKabanGame from "./MegaKabanGame";

export default function MegaKabanCard() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const subscribeToPush = async () => {
    setIsPushLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Пожалуйста, разреши уведомления в настройках браузера.');
        return;
      }

      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        console.error('VAPID key missing');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey,
      });
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push:', error);
    } finally {
      setIsPushLoading(false);
    }
  };

  const handleStartGame = () => {
    setIsLoadingGame(true);
    setTimeout(() => {
      setIsLoadingGame(false);
      setGameActive(true);
    }, 1800);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!gameActive ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            className="w-full max-w-sm mx-auto px-4"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
              
              <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl">
                <div className="w-24 h-24 relative mb-6">
                  <motion.div
                    animate={isLoadingGame ? { 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    } : {
                      y: [0, -5, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: isLoadingGame ? 0.3 : 2,
                      ease: "easeInOut"
                    }}
                    className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800 shadow-inner"
                  >
                    <span className="text-5xl select-none">🐗</span>
                  </motion.div>
                </div>

                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter italic uppercase">
                  МЕГА-КАБАН
                </h1>
                
                <p className="text-zinc-500 text-xs mb-8 tracking-widest uppercase">
                  Система REDD • v1.0
                </p>

                <button 
                  onClick={handleStartGame}
                  disabled={isLoadingGame}
                  className={`relative px-6 py-4 font-black rounded-xl transition-all w-full mb-4 overflow-hidden group/btn ${
                    isLoadingGame
                    ? "bg-zinc-800 text-zinc-600 cursor-wait" 
                    : "bg-white text-black hover:bg-orange-500 hover:text-white active:scale-95"
                  }`}
                >
                  <span className="relative z-10">
                    {isLoadingGame ? "РАСПАКОВКА..." : "ИГРАТЬ"}
                  </span>
                  {isLoadingGame && (
                    <motion.div 
                      className="absolute inset-0 bg-zinc-700"
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 1.8 }}
                    />
                  )}
                </button>
                <button 
                  onClick={subscribeToPush}
                  disabled={isSubscribed || isPushLoading}
                  className={`w-full py-3 rounded-lg border text-[10px] font-bold tracking-widest transition-all uppercase ${
                    isSubscribed 
                    ? "border-green-900/30 bg-green-900/10 text-green-500 cursor-default" 
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {isPushLoading ? "ПОДКЛЮЧЕНИЕ..." : isSubscribed ? "УВЕДОМЛЕНИЯ ВКЛЮЧЕНЫ ✓" : "УВЕДОМИТЬ О ПРОБУЖДЕНИИ"}
                </button>

              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100]"
          >
            <MegaKabanGame onClose={() => setGameActive(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}