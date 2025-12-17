"use client";

import React, { useEffect, useRef, useState } from 'react';

interface MegaKabanGameProps {
  onClose?: () => void;
}

export default function MegaKabanGame({ onClose }: MegaKabanGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const livesRef = useRef<HTMLDivElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);
  const comboMeterRef = useRef<HTMLDivElement>(null);
  const comboDisplayRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);
  const finalScoreRef = useRef<HTMLSpanElement>(null);
  const maxComboRef = useRef<HTMLSpanElement>(null);
  const caughtRef = useRef<HTMLSpanElement>(null);
  const finalLevelRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameSettings = {
        initialPlayerSpeed: 7,
        initialItemSpeed: 3,
        maxItemSpeed: 7,
        speedIncreaseInterval: 10000,
        speedIncreaseAmount: 0.2,
        burgerSpawnChance: 0.045,
        bombSpawnChance: 0.022,
        powerUpSpawnChance: 0.009,
        comboTimeWindow: 2000,
        maxComboMultiplier: 5,
        pointsPerLevel: 800
    };

    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let animationId: number;
    let currentItemSpeed = gameSettings.initialItemSpeed;
    let comboMultiplier = 1;
    let lastBurgerTime = 0;
    let maxCombo = 1;
    let burgersCaught = 0;
    let lastFrameTime = 0;
    let screenShake = 0;

    let powerUps = {
        shield: { active: false, timeLeft: 0, duration: 10000 },
        magnet: { active: false, timeLeft: 0, duration: 8000 },
        slowmo: { active: false, timeLeft: 0, duration: 5000 },
        doublePoints: { active: false, timeLeft: 0, duration: 7000 }
    };

    const player = {
        x: canvas.width / 2 - 40,
        y: canvas.height * 0.89 - 33,
        width: 80,
        height: 30,
        speed: gameSettings.initialPlayerSpeed,
        movingLeft: false,
        movingRight: false,
        tilt: 0
    };

    let burgers: any[] = [];
    let bombs: any[] = [];
    let powerUpsList: any[] = [];
    function drawPlayer() {
        ctx!.save();
        if (screenShake > 0) {
            ctx!.translate(Math.random() * screenShake - screenShake/2, Math.random() * screenShake - screenShake/2);
        }
        
        ctx!.translate(player.x + player.width/2, player.y + player.height/2);
        ctx!.rotate(player.tilt);
        
        const bodyGrad = ctx!.createLinearGradient(-player.width/2, 0, player.width/2, 0);
        bodyGrad.addColorStop(0, '#a66935');
        bodyGrad.addColorStop(0.5, '#b67945');
        bodyGrad.addColorStop(1, '#a66935');
        
        ctx!.fillStyle = bodyGrad;
        ctx!.beginPath();
        // @ts-ignore
        if(ctx!.roundRect) ctx!.roundRect(-player.width/2, -player.height/2, player.width, player.height, 14);
        else ctx!.rect(-player.width/2, -player.height/2, player.width, player.height);
        ctx!.fill();
        ctx!.fillStyle = '#ad544b';
        ctx!.beginPath();
        ctx!.ellipse(0, 5, 11, 7, 0, 0, Math.PI*2);
        ctx!.fill();
        
        ctx!.restore();
    }

    function update() {
        if (!gameRunning) return;
        if (player.movingLeft && player.x > 0) {
            player.x -= player.speed;
            player.tilt = -0.1;
        } else if (player.movingRight && player.x < canvas!.width - player.width) {
            player.x += player.speed;
            player.tilt = 0.1;
        } else {
            player.tilt = 0;
        }
        if (Math.random() < gameSettings.burgerSpawnChance) {
            burgers.push({ x: Math.random() * (canvas!.width - 40), y: -40, speed: currentItemSpeed + Math.random() });
        }

        burgers.forEach((b, i) => {
            b.y += b.speed;
            if (b.y + 40 > player.y && b.x < player.x + player.width && b.x + 40 > player.x) {
                score += 10 * comboMultiplier;
                burgersCaught++;
                updateUI();
                burgers.splice(i, 1);
            }
        });
        
        burgers = burgers.filter(b => b.y < canvas!.height);
    }

    function updateUI() {
        if (scoreRef.current) scoreRef.current.innerText = score.toString();
        if (levelRef.current) levelRef.current.innerText = level.toString();
    }

    function gameLoop(time: number) {
        if (!gameRunning) return;
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        update();
        
        ctx!.font = '30px Arial';
        burgers.forEach(b => ctx!.fillText('🍔', b.x, b.y + 30));
        
        drawPlayer();
        animationId = requestAnimationFrame(gameLoop);
    }

    const startMoving = (dir: 'l' | 'r') => {
        if (dir === 'l') player.movingLeft = true;
        else player.movingRight = true;
    };
    const stopMoving = () => {
        player.movingLeft = false;
        player.movingRight = false;
    };
    // @ts-ignore
    window.startGame = () => {
        setGameState('playing');
        gameRunning = true;
        requestAnimationFrame(gameLoop);
    };

    return () => {
        gameRunning = false;
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#252525] flex flex-col items-center overflow-hidden font-['Montserrat']">
      <div className="w-full max-w-[520px] p-2 flex flex-col gap-1">
        <div className="flex justify-between bg-[#272a39] p-3 rounded-xl border border-[#3c4dab]/30 shadow-lg">
            <div className="text-center flex-1">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Очки</div>
                <div ref={scoreRef} className="text-xl font-black text-white">0</div>
            </div>
            <div className="text-center flex-1 border-x border-zinc-700">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Жизни</div>
                <div ref={livesRef} className="text-xl font-black text-[#D9686A]">3</div>
            </div>
            <div className="text-center flex-1">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Комбо</div>
                <div ref={comboRef} className="text-xl font-black text-orange-400">1x</div>
            </div>
        </div>
        <div className="flex justify-center gap-3 my-1">
            {['shield', 'magnet', 'slowmo', 'doublePoints'].map(id => (
                <div key={id} id={`${id}Indicator`} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-30 grayscale transition-all">
                    {id === 'shield' && '🛡️'}
                    {id === 'magnet' && '🧲'}
                    {id === 'slowmo' && '🐌'}
                    {id === 'doublePoints' && '✯'}
                </div>
            ))}
        </div>
      </div>
      <div className="relative flex-1 w-full max-w-[480px] flex items-center justify-center px-4">
        <canvas 
          ref={canvasRef} 
          width={480} 
          height={600} 
          className="w-full h-auto aspect-[4/5] bg-[#22242E] rounded-[20px] border-4 border-[#3c4dab] shadow-2xl"
        />
        <div className="absolute top-4 left-8 text-[12px] font-bold text-white/50 bg-black/20 px-3 py-1 rounded-full border border-white/10">
            Уровень: <span ref={levelRef}>1</span>
        </div>
      </div>
      <div className="w-full max-w-[540px] p-4 flex gap-4 mb-safe">
        <button 
          onPointerDown={() => {/*Л*/}}
          onPointerUp={() => {/*С*/}}
          className="flex-1 py-6 bg-[#41444d] rounded-2xl text-white font-black active:bg-zinc-600 transition-colors shadow-lg border-b-4 border-black/30"
        >
          ← ВЛЕВО
        </button>
        <button 
          onPointerDown={() => {/*Л*/}}
          onPointerUp={() => {/*С*/}}
          className="flex-1 py-6 bg-[#41444d] rounded-2xl text-white font-black active:bg-zinc-600 transition-colors shadow-lg border-b-4 border-black/30"
        >
          ВПРАВО →
        </button>
      </div>
      {gameState === 'start' && (
        <div className="absolute inset-0 z-[110] bg-[#252525]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter italic">МЕГА КАБАН:<br/>БИТВА ЗА БУРГЕРЫ</h1>
            <div className="bg-zinc-900/50 border border-orange-500/30 p-6 rounded-2xl max-w-sm mb-8">
                <ul className="text-left text-zinc-300 text-sm space-y-3">
                    <li className="flex items-start gap-2">🧡 Лови бургеры для очков</li>
                    <li className="flex items-start gap-2">💣 Уворачивайся от бомб</li>
                    <li className="flex items-start gap-2">⚡ Собирай бонусы</li>
                </ul>
            </div>
            <button 
                // @ts-ignore
                onClick={() => window.startGame()} 
                className="px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all active:scale-95"
            >
                НАЧАТЬ ИГРУ
            </button>
        </div>
      )}
    </div>
  );
}