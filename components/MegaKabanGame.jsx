"use client";

import { useEffect, useRef } from "react";
import "./game-embedded.css";

export default function MegaKabanGame({ onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    containerRef.current.innerHTML = `
      <div class="mega-kaban-game">
        <div class="background-effects" id="backgroundEffects"></div>
        <div class="container">
          <div class="header" id="mainHeader">
            <h1 id="gameTitle">МЕГА КАБАН: БИТВА ЗА БУРГЕРЫ</h1>
            <p class="subtitle">Лови бургеры, уворачивайся от бомб, собирай бонусы!</p>
          </div>
          <div class="game-info">
            <div class="info-item">
              <div class="info-label">ОЧКИ</div>
              <div id="score">0</div>
            </div>
            <div class="info-item">
              <div class="info-label">ЖИЗНИ</div>
              <div id="lives">3</div>
            </div>
            <div class="info-item">
              <div class="info-label">КОМБО</div>
              <div id="combo">1x</div>
            </div>
            <div class="combo-meter" id="comboMeter"></div>
          </div>
          <div class="power-up-indicators">
            <div class="power-up-indicator" id="shieldIndicator" title="Щит">🛡️</div>
            <div class="power-up-indicator" id="magnetIndicator" title="Магнит">🧲</div>
            <div class="power-up-indicator" id="slowmoIndicator" title="Замедление">🐌</div>
            <div class="power-up-indicator" id="doublePointsIndicator" title="Удвоение очков">✯✯</div>
          </div>
          <div class="canvas-container">
            <canvas id="gameCanvas" width="480" height="600"></canvas>
            <div class="level-indicator">Уровень: <span id="level">1</span></div>
            <div class="fps-counter" id="fpsCounter">FPS: 60</div>
          </div>
        </div>
        <div class="controls">
          <button class="control-btn" id="leftBtn">← ВЛЕВО</button>
          <button class="control-btn" id="rightBtn">ВПРАВО →</button>
        </div>
        <div id="startScreen" class="screen active">
          <h1>МЕГА КАБАН: БИТВА ЗА БУРГЕРЫ</h1>
          <div class="instructions">
            <p>Помоги голодному кабану собрать как можно больше бургеров, уворачиваясь от бомб и собирая бонусы!</p>
            <ul>
              <li>Используйте кнопки ВЛЕВО и ВПРАВО для управления кабаном</li>
              <li>Ловите падающие бургеры, чтобы получить очки</li>
              <li>Избегайте бомб - они отнимают жизнь</li>
              <li>Собирайте бонусы для особых способностей</li>
              <li>Комбинируйте бургеры для увеличения множителя очков!</li>
              <li>С каждым уровнем игра ускоряется</li>
            </ul>
          </div>
          <button class="action-btn" id="startBtn">НАЧАТЬ ИГРУ</button>
        </div>
        <div id="gameOverScreen" class="screen">
          <h1>ИГРА ОКОНЧЕНА!</h1>
          <div class="stats">
            <p>Ваш счет: <span id="finalScore">0</span></p>
            <p>Максимальное комбо: <span id="maxCombo">0</span>x</p>
            <p>Поймано бургеров: <span id="burgersCaught">0</span></p>
            <p>Достигнут уровень: <span id="finalLevel">1</span></p>
          </div>
          <button class="action-btn" id="restartBtn">ИГРАТЬ СНОВА</button>
        </div>
        <div class="combo-display" id="comboDisplay">COMBO x1!</div>
      </div>
    `;
    const runGameScript = () => {
      const gameRoot = containerRef.current.querySelector(".mega-kaban-game");
      if (!gameRoot) return;
      const $ = (id) => gameRoot.querySelector(`#${id}`);
      const $$ = (sel) => gameRoot.querySelectorAll(sel);
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.expand();
        tg.enableClosingConfirmation();
      }

      function createBackgroundEffects() {
        const container = $(`backgroundEffects`);
        if (!container) return;
        for (let i = 0; i < 5; i++) {
          const el = document.createElement("div");
          el.className = "floating-element";
          el.style.width = `${Math.random() * 35 + 10}px`;
          el.style.height = el.style.width;
          el.style.left = `${Math.random() * 100}%`;
          el.style.top = `${Math.random() * 100 + 100}%`;
          el.style.animationDuration = `${Math.random() * 17 + 10}s`;
          el.style.animationDelay = `${Math.random() * 4}s`;
          el.style.background = `rgba(200, 200, 200, ${Math.random() * 0.03})`;
          container.appendChild(el);
        }
      }

      const canvas = $(`gameCanvas`);
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scoreElement = $(`score`);
      const livesElement = $(`lives`);
      const comboElement = $(`combo`);
      const comboMeter = $(`comboMeter`);
      const comboDisplay = $(`comboDisplay`);
      const startScreen = $(`startScreen`);
      const gameOverScreen = $(`gameOverScreen`);
      const finalScoreElement = $(`finalScore`);
      const maxComboElement = $(`maxCombo`);
      const burgersCaughtElement = $(`burgersCaught`);
      const startBtn = $(`startBtn`);
      const restartBtn = $(`restartBtn`);
      const leftBtn = $(`leftBtn`);
      const rightBtn = $(`rightBtn`);
      const shieldIndicator = $(`shieldIndicator`);
      const magnetIndicator = $(`magnetIndicator`);
      const slowmoIndicator = $(`slowmoIndicator`);
      const doublePointsIndicator = $(`doublePointsIndicator`);
      const levelElement = $(`level`);
      const finalLevelElement = $(`finalLevel`);
      const fpsCounter = $(`fpsCounter`);
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
        pointsPerLevel: 800,
      };

      let score = 0;
      let lives = 3;
      let level = 1;
      let gameRunning = false;
      let animationId;
      let lastSpeedIncrease = 0;
      let currentItemSpeed = gameSettings.initialItemSpeed;
      let comboMultiplier = 1;
      let comboTimeout;
      let lastBurgerTime = 0;
      let maxCombo = 1;
      let burgersCaught = 0;
      let lastFrameTime = 0;
      let frameCount = 0;
      let fps = 60;
      let screenShake = 0;
      let powerUps = {
        shield: { active: false, timeLeft: 0, duration: 10000 },
        magnet: { active: false, timeLeft: 0, duration: 8000 },
        slowmo: { active: false, timeLeft: 0, duration: 5000 },
        doublePoints: { active: false, timeLeft: 0, duration: 7000 },
      };

      const playerWidth = 80;
      const playerHeight = 30;
      const getGroundY = () => canvas.height * 0.89;
      const itemSize = 40;

      let player = {
        x: canvas.width / 2 - playerWidth / 2,
        y: getGroundY() - playerHeight - 3,
        width: playerWidth,
        height: playerHeight,
        speed: gameSettings.initialPlayerSpeed,
        movingLeft: false,
        movingRight: false,
        tilt: 0,
      };

      let burgers = [];
      let bombs = [];
      let powerUpsList = [];
      let particles = [];

      function hideMainHeader() {
        const header = gameRoot.querySelector("#mainHeader");
        if (header) header.style.display = "none";
      }

      function showMainHeader() {
        const header = gameRoot.querySelector("#mainHeader");
        if (header) header.style.display = "block";
      }
      function createFallingItem(type) {
        const x = Math.random() * (canvas.width - itemSize);
        if (type === "burger") {
          const burgerType = Math.random();
          let burgerVariant = "normal";
          if (burgerType < 0.06) burgerVariant = "golden";
          else if (burgerType < 0.14) burgerVariant = "double";
          burgers.push({
            x,
            y: -itemSize,
            width: itemSize,
            height: itemSize,
            speed: currentItemSpeed + Math.random() * 0.7,
            type: burgerVariant,
            floatPhase: Math.random() * Math.PI * 2,
          });
        } else if (type === "bomb") {
          const bombType = Math.random();
          let bombVariant = "normal";
          if (bombType < 0.04) bombVariant = "black";
          else if (bombType < 0.08) bombVariant = "blinking";
          bombs.push({
            x,
            y: -itemSize,
            width: itemSize,
            height: itemSize,
            speed: currentItemSpeed + Math.random() * 0.7,
            type: bombVariant,
            blinkState: true,
            blinkTimer: 0,
            floatPhase: Math.random() * Math.PI * 2,
          });
        } else if (type === "powerup") {
          const powerUpTypes = [
            "shield",
            "magnet",
            "slowmo",
            "life",
            "doublePoints",
          ];
          const powerUpType =
            powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
          powerUpsList.push({
            x,
            y: -itemSize,
            width: itemSize,
            height: itemSize,
            speed: currentItemSpeed + Math.random() * 0.7,
            type: powerUpType,
            floatPhase: Math.random() * Math.PI * 2,
          });
        }
      }

      function createParticles(x, y, color, count = 10) {
        const maxParticles = 35;
        const particlesToAdd = Math.min(count, maxParticles - particles.length);
        for (let i = 0; i < particlesToAdd; i++) {
          particles.push({
            x,
            y,
            size: Math.random() * 6 + 2,
            color,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            life: 1,
          });
        }
      }

      function drawPlayer() {
        let shakeX = 0,
          shakeY = 0;
        if (screenShake > 0) {
          shakeX = (Math.random() - 0.5) * screenShake;
          shakeY = (Math.random() - 0.5) * screenShake;
          screenShake *= 0.9;
          if (screenShake < 0.5) screenShake = 0;
        }
        ctx.save();
        ctx.translate(
          player.x + player.width / 2 + shakeX,
          player.y + player.height / 2 + shakeY
        );
        ctx.rotate(player.tilt);
        const px = -player.width / 2;
        const py = -player.height / 2;

        if (powerUps.shield.active) {
          ctx.strokeStyle = "#00FFFF";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            px + player.width / 2,
            py + player.height / 2,
            player.width / 2 + 10,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          const pulse = Math.sin(Date.now() / 200) * 3;
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + pulse / 10})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            px + player.width / 2,
            py + player.height / 2,
            player.width / 2 + 15 + pulse,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        const bodyGradient = ctx.createLinearGradient(
          px,
          py,
          px,
          py + player.height
        );
        bodyGradient.addColorStop(0, "#e0bb7e");
        bodyGradient.addColorStop(0.7, "#b67945");
        bodyGradient.addColorStop(1, "#70481e");
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.roundRect?.(px, py, player.width, player.height, 14) ||
          ctx.rect(px, py, player.width, player.height);
        ctx.fill();

        ctx.shadowColor = "rgba(0,0,0,0.14)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "rgba(0,0,0,0.11)";
        ctx.beginPath();
        ctx.ellipse?.(
          px + player.width / 2,
          py + player.height + 6,
          player.width / 2.5,
          7,
          0,
          0,
          Math.PI * 2
        ) ||
          ctx.arc(
            px + player.width / 2,
            py + player.height + 6,
            7,
            0,
            Math.PI * 2
          );
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#cb9450";
        ctx.beginPath();
        ctx.ellipse?.(px + 10, py + 4, 7, 9, 0, 0, Math.PI * 2);
        ctx.ellipse?.(px + player.width - 10, py + 4, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#eac39a";
        ctx.beginPath();
        ctx.ellipse?.(px + 10, py + 4, 4, 6, 0, 0, Math.PI * 2);
        ctx.ellipse?.(px + player.width - 10, py + 4, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = "#fffad7";
        ctx.shadowBlur = 7;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(px + 20, py + 16, 5.3, 0, Math.PI * 2);
        ctx.arc(px + player.width - 20, py + 16, 5.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#160d04";
        ctx.beginPath();
        ctx.arc(px + 20, py + 16, 2.5, 0, Math.PI * 2);
        ctx.arc(px + player.width - 20, py + 16, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff8";
        ctx.beginPath();
        ctx.arc(px + 18, py + 14, 1, 0, Math.PI * 2);
        ctx.arc(px + player.width - 22, py + 14, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,120,120,0.19)";
        ctx.beginPath();
        ctx.arc(px + 20, py + 22, 2.6, 0, Math.PI * 2);
        ctx.arc(px + player.width - 20, py + 22, 2.6, 0, Math.PI * 2);
        ctx.fill();

        const noseGradient = ctx.createRadialGradient(
          px + player.width / 2,
          py + player.height - 9,
          0,
          px + player.width / 2,
          py + player.height - 9,
          9
        );
        noseGradient.addColorStop(0, "#d98c80");
        noseGradient.addColorStop(1, "#ad544b");
        ctx.fillStyle = noseGradient;
        ctx.beginPath();
        ctx.ellipse?.(
          px + player.width / 2,
          py + player.height - 9,
          11,
          7.7,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#603328";
        ctx.beginPath();
        ctx.arc(
          px + player.width / 2 - 4,
          py + player.height - 9,
          1.27,
          0,
          Math.PI * 2
        );
        ctx.arc(
          px + player.width / 2 + 4,
          py + player.height - 9,
          1.27,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#603328";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(
          px + player.width / 2,
          py + player.height - 6.5,
          5,
          0.25 * Math.PI,
          0.75 * Math.PI
        );
        ctx.stroke();
        ctx.restore();
      }

      function drawBurger(burger) {
        const glowColor =
          burger.type === "golden"
            ? "#ffd86f"
            : burger.type === "double"
            ? "#ff6b6b"
            : "transparent";
        if (glowColor !== "transparent") {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = burger.type === "golden" ? 18 : 12;
        }
        const bunTop =
          burger.type === "golden"
            ? "#ffb347"
            : burger.type === "double"
            ? "#d6903b"
            : "#f5c07a";
        const bunBottom =
          burger.type === "golden"
            ? "#f29b38"
            : burger.type === "double"
            ? "#bf7a30"
            : "#e3a85f";
        const meat =
          burger.type === "golden"
            ? "#c17b0d"
            : burger.type === "double"
            ? "#a83232"
            : "#8b4b2b";
        const lettuce = burger.type === "golden" ? "#b7ff7a" : "#7cf074";
        const cheese = burger.type === "golden" ? "#ffe38a" : "#ffcf6f";

        ctx.fillStyle = bunTop;
        ctx.beginPath();
        ctx.roundRect?.(
          burger.x,
          burger.y,
          burger.width,
          burger.height * 0.28,
          12
        ) || ctx.rect(burger.x, burger.y, burger.width, burger.height * 0.28);
        ctx.fill();

        ctx.fillStyle = "#fffaf0";
        ctx.beginPath();
        ctx.arc(burger.x + 10, burger.y + 6, 2, 0, Math.PI * 2);
        ctx.arc(burger.x + burger.width - 12, burger.y + 10, 2, 0, Math.PI * 2);
        ctx.arc(burger.x + 22, burger.y + 4, 2, 0, Math.PI * 2);
        ctx.arc(burger.x + burger.width - 22, burger.y + 12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = lettuce;
        ctx.beginPath();
        ctx.roundRect?.(
          burger.x + 3,
          burger.y + burger.height * 0.26,
          burger.width - 6,
          burger.height * 0.22,
          10
        ) ||
          ctx.rect(
            burger.x + 3,
            burger.y + burger.height * 0.26,
            burger.width - 6,
            burger.height * 0.22
          );
        ctx.fill();

        ctx.fillStyle = cheese;
        ctx.beginPath();
        ctx.roundRect?.(
          burger.x + 4,
          burger.y + burger.height * 0.42,
          burger.width - 8,
          burger.height * 0.14,
          8
        ) ||
          ctx.rect(
            burger.x + 4,
            burger.y + burger.height * 0.42,
            burger.width - 8,
            burger.height * 0.14
          );
        ctx.fill();

        ctx.fillStyle = meat;
        ctx.beginPath();
        ctx.roundRect?.(
          burger.x + 6,
          burger.y + burger.height * 0.54,
          burger.width - 12,
          burger.height * 0.18,
          8
        ) ||
          ctx.rect(
            burger.x + 6,
            burger.y + burger.height * 0.54,
            burger.width - 12,
            burger.height * 0.18
          );
        ctx.fill();

        if (burger.type === "double") {
          ctx.fillStyle = "#903030";
          ctx.beginPath();
          ctx.roundRect?.(
            burger.x + 6,
            burger.y + burger.height * 0.68,
            burger.width - 12,
            burger.height * 0.16,
            8
          ) ||
            ctx.rect(
              burger.x + 6,
              burger.y + burger.height * 0.68,
              burger.width - 12,
              burger.height * 0.16
            );
        }

        ctx.fillStyle = bunBottom;
        ctx.beginPath();
        ctx.roundRect?.(
          burger.x,
          burger.y + burger.height * 0.76,
          burger.width,
          burger.height * 0.24,
          10
        ) ||
          ctx.rect(
            burger.x,
            burger.y + burger.height * 0.76,
            burger.width,
            burger.height * 0.24
          );
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      function drawBomb(bomb) {
        const baseColor = bomb.type === "black" ? "#222b36" : "#d9383c";
        const glowColor = bomb.type === "black" ? "#ff6060" : "#ffb347";
        if (bomb.type === "blinking") {
          bomb.blinkTimer += 16;
          if (bomb.blinkTimer > 220) {
            bomb.blinkState = !bomb.blinkState;
            bomb.blinkTimer = 0;
          }
        }
        const activeGlow =
          bomb.type === "blinking"
            ? bomb.blinkState
              ? "#ff5656"
              : "#ff9b4a"
            : glowColor;
        ctx.shadowColor = activeGlow;
        ctx.shadowBlur = bomb.type === "black" ? 16 : 12;
        const grad = ctx.createLinearGradient(
          bomb.x,
          bomb.y,
          bomb.x,
          bomb.y + bomb.height
        );
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, bomb.type === "black" ? "#1a1f27" : "#b52f33");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect?.(bomb.x, bomb.y, bomb.width, bomb.height, 12) ||
          ctx.rect(bomb.x, bomb.y, bomb.width, bomb.height);
        ctx.fill();

        ctx.fillStyle = activeGlow;
        ctx.beginPath();
        ctx.roundRect?.(
          bomb.x + bomb.width * 0.18,
          bomb.y + bomb.height * 0.18,
          bomb.width * 0.64,
          bomb.height * 0.64,
          10
        ) ||
          ctx.rect(
            bomb.x + bomb.width * 0.18,
            bomb.y + bomb.height * 0.18,
            bomb.width * 0.64,
            bomb.height * 0.64
          );
        ctx.fill();

        ctx.fillStyle = "#2a2f3a";
        ctx.beginPath();
        ctx.roundRect?.(
          bomb.x + bomb.width / 3,
          bomb.y - 6,
          bomb.width / 3,
          8,
          3
        ) || ctx.rect(bomb.x + bomb.width / 3, bomb.y - 6, bomb.width / 3, 8);
        ctx.fill();

        ctx.strokeStyle = "#ffd86f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bomb.x + bomb.width / 2, bomb.y - 6);
        ctx.lineTo(bomb.x + bomb.width / 2, bomb.y - 16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bomb.x + bomb.width / 2 - 4, bomb.y - 12);
        ctx.lineTo(bomb.x + bomb.width / 2 + 4, bomb.y - 12);
        ctx.stroke();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      function drawPowerUp(powerUp) {
        let color, symbol, glowColor;
        switch (powerUp.type) {
          case "shield":
            color = "#00FFFF";
            glowColor = "#00DDFF";
            symbol = "🛡️";
            break;
          case "magnet":
            color = "#FFD700";
            glowColor = "#FFAA00";
            symbol = "🧲";
            break;
          case "slowmo":
            color = "#9370DB";
            glowColor = "#B886DB";
            symbol = "🐌";
            break;
          case "life":
            color = "#32CD32";
            glowColor = "#00FF00";
            symbol = "❤️";
            break;
          case "doublePoints":
            color = "#FF1493";
            glowColor = "#FF69B4";
            symbol = "✯✯";
            break;
        }
        const pulse = Math.sin(Date.now() / 300) * 0.1 + 1;
        const size = powerUp.width * pulse;
        const offset = (powerUp.width - size) / 2;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 20;
        const gradient = ctx.createRadialGradient(
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          0,
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          size / 2
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, glowColor);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect?.(
          powerUp.x + offset,
          powerUp.y + offset,
          size,
          size,
          12
        ) || ctx.rect(powerUp.x + offset, powerUp.y + offset, size, size);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.roundRect?.(
          powerUp.x + offset + 2,
          powerUp.y + offset + 2,
          size * 0.6,
          size * 0.3,
          8
        ) ||
          ctx.rect(
            powerUp.x + offset + 2,
            powerUp.y + offset + 2,
            size * 0.6,
            size * 0.3
          );
        ctx.fill();

        ctx.font = "bold 22px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 3;
        ctx.fillText(
          symbol,
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2
        );
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      function drawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          p.x += p.speedX;
          p.y += p.speedY;
          p.life -= 0.03;
          if (p.life <= 0) particles.splice(i, 1);
        }
        ctx.globalAlpha = 1;
        if (particles.length > 100) particles.splice(0, particles.length - 100);
      }

      function updatePlayer() {
        const speed = player.speed;
        if (player.movingLeft) player.x = Math.max(0, player.x - speed);
        if (player.movingRight)
          player.x = Math.min(canvas.width - player.width, player.x + speed);
        const maxY = getGroundY() - playerHeight - 3;
        player.y = Math.min(player.y, maxY);
        const targetTilt = player.movingLeft
          ? -0.08
          : player.movingRight
          ? 0.08
          : 0;
        player.tilt += (targetTilt - player.tilt) * 0.25;
      }

      function updatePowerUps() {
        Object.keys(powerUps).forEach((key) => {
          if (powerUps[key].active) {
            powerUps[key].timeLeft -= 16;
            const indicator = $(`${key}Indicator`);
            if (indicator) {
              const wasActive = indicator.classList.contains("active");
              const isActive = powerUps[key].timeLeft > 0;
              if (isActive && !wasActive) {
                indicator.classList.add("active");
                indicator.style.transform = "scale(1.5)";
                setTimeout(() => (indicator.style.transform = ""), 200);
              } else if (!isActive && wasActive) {
                indicator.classList.remove("active");
              }
              indicator.style.opacity = Math.max(
                0.5,
                powerUps[key].timeLeft / powerUps[key].duration
              );
            }
            if (powerUps[key].timeLeft <= 0) {
              powerUps[key].active = false;
              const indicator = $(`${key}Indicator`);
              if (indicator) {
                indicator.classList.remove("active");
                indicator.style.opacity = "0.5";
              }
            }
          } else {
            const indicator = $(`${key}Indicator`);
            if (indicator && indicator.classList.contains("active")) {
              indicator.classList.remove("active");
              indicator.style.opacity = "0.5";
            }
          }
        });
      }

      let lastComboUpdate = 0;
      function updateComboDisplay() {
        const now = Date.now();
        if (now - lastComboUpdate < 50) return;
        lastComboUpdate = now;
        const timeSince = now - lastBurgerTime;
        const progress = Math.max(
          0,
          1 - timeSince / gameSettings.comboTimeWindow
        );
        if (comboMultiplier > 1 && timeSince < gameSettings.comboTimeWindow) {
          comboElement.textContent = `${comboMultiplier.toFixed(1)}x`;
          const intensity = Math.min(
            comboMultiplier / gameSettings.maxComboMultiplier,
            1
          );
          comboElement.style.color =
            intensity > 0.6 ? "#ff6b00" : intensity > 0.3 ? "#ff8a00" : "#fff";
          comboElement.style.textShadow = `0 0 ${10 + intensity * 15}px ${
            intensity > 0.6 ? "#ff6b00" : "#ff8a00"
          }`;
          comboElement.style.transform = `scale(${1 + intensity * 0.1})`;
        } else {
          comboMultiplier = 1;
          comboElement.textContent = "1x";
          comboElement.style.color = "#fff";
          comboElement.style.textShadow = "none";
          comboElement.style.transform = "scale(1)";
        }
        comboMeter.style.width = `${progress * 100}%`;
      }

      function checkCollisions() {
        for (let i = burgers.length - 1; i >= 0; i--) {
          const b = burgers[i];
          if (
            player.x < b.x + b.width &&
            player.x + player.width > b.x &&
            player.y < b.y + b.height &&
            player.y + player.height > b.y
          ) {
            const now = Date.now();
            let points =
              b.type === "golden" ? 50 : b.type === "double" ? 20 : 10;
            if (powerUps.doublePoints.active) points *= 2;
            if (now - lastBurgerTime < gameSettings.comboTimeWindow) {
              comboMultiplier = Math.min(
                gameSettings.maxComboMultiplier,
                comboMultiplier + 0.3
              );
              comboDisplay.textContent = `COMBO x${comboMultiplier.toFixed(
                1
              )}!`;
              comboDisplay.style.display = "block";
              comboElement.textContent = `${comboMultiplier.toFixed(1)}x`;
              comboElement.style.color =
                comboMultiplier >= 3
                  ? "#ff6b00"
                  : comboMultiplier >= 2
                  ? "#ff8a00"
                  : "#fff";
              comboElement.style.textShadow = `0 0 10px ${
                comboMultiplier >= 3 ? "#ff6b00" : "#ff8a00"
              }`;
              comboDisplay.style.animation = "none";
              setTimeout(
                () =>
                  (comboDisplay.style.animation =
                    "pulse 0.5s infinite alternate"),
                10
              );
            } else {
              comboMultiplier = 1;
              comboDisplay.style.display = "none";
              comboElement.textContent = "1x";
              comboElement.style.color = "#fff";
              comboElement.style.textShadow = "none";
            }
            lastBurgerTime = now;
            maxCombo = Math.max(maxCombo, comboMultiplier);
            clearTimeout(comboTimeout);
            comboTimeout = setTimeout(() => {
              comboMultiplier = 1;
              comboDisplay.style.display = "none";
              comboElement.textContent = "1x";
              comboElement.style.color = "#fff";
              comboElement.style.textShadow = "none";
            }, gameSettings.comboTimeWindow);
            score += Math.floor(points * comboMultiplier);
            scoreElement.style.transform = "scale(1.2)";
            scoreElement.style.color = "#00ffaa";
            setTimeout(() => {
              scoreElement.style.transform = "scale(1)";
              scoreElement.style.color = "#00ff88";
            }, 200);
            scoreElement.textContent = score;
            burgersCaught++;
            let col =
              b.type === "golden"
                ? "#FFD700"
                : b.type === "double"
                ? "#8B0000"
                : "#32CD32";
            createParticles(b.x + b.width / 2, b.y + b.height / 2, col, 18);
            burgers.splice(i, 1);
            checkLevelUp();
          }
        }

        for (let i = bombs.length - 1; i >= 0; i--) {
          const b = bombs[i];
          if (
            player.x < b.x + b.width &&
            player.x + player.width > b.x &&
            player.y < b.y + b.height &&
            player.y + player.height > b.y
          ) {
            if (!powerUps.shield.active) {
              const damage = b.type === "black" ? 2 : 1;
              lives -= damage;
              livesElement.style.transform = "scale(1.3)";
              livesElement.classList.toggle("low", lives <= 1);
              setTimeout(
                () => (livesElement.style.transform = "scale(1)"),
                300
              );
              livesElement.textContent = lives;
              screenShake = 15;
              let col =
                b.type === "black"
                  ? "#2F4F4F"
                  : b.type === "blinking"
                  ? "#FF4500"
                  : "#DC143C";
              createParticles(b.x + b.width / 2, b.y + b.height / 2, col, 22);
              if (lives <= 0) gameOver();
            } else {
              createParticles(
                b.x + b.width / 2,
                b.y + b.height / 2,
                "#00FFFF",
                15
              );
            }
            bombs.splice(i, 1);
          }
        }

        for (let i = powerUpsList.length - 1; i >= 0; i--) {
          const p = powerUpsList[i];
          if (
            player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y
          ) {
            if (p.type === "life") {
              lives = Math.min(5, lives + 1);
              livesElement.style.transform = "scale(1.3)";
              livesElement.style.color = "#00ff00";
              setTimeout(() => {
                livesElement.style.transform = "scale(1)";
                livesElement.style.color = "#D9686A";
              }, 300);
              livesElement.classList.remove("low");
              livesElement.textContent = lives;
            } else {
              powerUps[p.type].active = true;
              powerUps[p.type].timeLeft = powerUps[p.type].duration;
              const ind = $(`${p.type}Indicator`);
              if (ind) {
                ind.classList.add("active");
                ind.style.opacity = "1";
                ind.style.transform = "scale(1.5) rotate(360deg)";
                setTimeout(() => (ind.style.transform = ""), 300);
              }
            }
            let col;
            switch (p.type) {
              case "shield":
                col = "#00FFFF";
                break;
              case "magnet":
                col = "#FFD700";
                break;
              case "slowmo":
                col = "#9370DB";
                break;
              case "life":
                col = "#32CD32";
                break;
              case "doublePoints":
                col = "#FF1493";
                break;
            }
            createParticles(p.x + p.width / 2, p.y + p.height / 2, col, 15);
            powerUpsList.splice(i, 1);
          }
        }
        updateComboDisplay();
        if (powerUps.magnet.active) {
          burgers.forEach((b) => {
            const dx = player.x + player.width / 2 - (b.x + b.width / 2);
            const dy = player.y + player.height / 2 - (b.y + b.height / 2);
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 150) {
              b.x += dx * 0.08;
              b.y += dy * 0.08;
            }
          });
        }
      }

      function checkLevelUp() {
        const newLevel = Math.floor(score / gameSettings.pointsPerLevel) + 1;
        if (newLevel > level) {
          level = newLevel;
          levelElement.textContent = level;
          currentItemSpeed = Math.min(
            gameSettings.maxItemSpeed,
            gameSettings.initialItemSpeed + (level - 1) * 0.4
          );
          createParticles(canvas.width / 2, canvas.height / 2, "#FFD700", 35);
          const el = gameRoot.querySelector(".level-indicator");
          el.classList.add("active");
          setTimeout(() => el.classList.remove("active"), 750);
        }
      }

      function updateItems() {
        const sm = powerUps.slowmo.active ? 0.5 : 1;
        [burgers, bombs, powerUpsList].forEach((list) => {
          for (let i = list.length - 1; i >= 0; i--) {
            const item = list[i];
            item.y += item.speed * sm;
            item.floatPhase += 0.045;
            item.x += Math.sin(item.floatPhase) * 0.28;
            item.x = Math.max(0, Math.min(canvas.width - item.width, item.x));
            if (item.y > canvas.height + 50) list.splice(i, 1);
          }
        });
      }

      function updateDifficulty(now) {
        if (now - lastSpeedIncrease > gameSettings.speedIncreaseInterval) {
          currentItemSpeed = Math.min(
            gameSettings.maxItemSpeed,
            currentItemSpeed + gameSettings.speedIncreaseAmount
          );
          lastSpeedIncrease = now;
        }
      }

      let bgGradient = null;
      let grassSpikes = [];
      function initDrawCache() {
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, "#081022");
        bgGradient.addColorStop(0.45, "#111d3a");
        bgGradient.addColorStop(1, "#0b2244");
        const groundY = getGroundY();
        grassSpikes = [];
        for (let i = 0; i < canvas.width; i += 9) {
          grassSpikes.push({ x: i, height: 3 + Math.random() * 5 });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!bgGradient) initDrawCache();
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawStars();
        const groundY = getGroundY();
        ctx.fillStyle = "#1c3d1c";
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
        ctx.fillStyle = "#2f6b2f";
        for (const spike of grassSpikes) {
          ctx.fillRect(spike.x, groundY, 4, -spike.height);
        }
        burgers.forEach(drawBurger);
        bombs.forEach(drawBomb);
        powerUpsList.forEach(drawPowerUp);
        drawPlayer();
        drawParticles();
      }

      let stars = [];
      function initStars() {
        stars = [];
        for (let i = 0; i < 12; i++) {
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.3 + 0.5,
            opacity: Math.random() * 0.3 + 0.2,
            twinkleSpeed: Math.random() * 0.01 + 0.005,
            twinklePhase: Math.random() * Math.PI * 2,
          });
        }
      }

      function drawStars() {
        ctx.fillStyle = "white";
        for (const star of stars) {
          star.twinklePhase += star.twinkleSpeed;
          ctx.globalAlpha =
            star.opacity * (Math.sin(star.twinklePhase) * 0.2 + 0.8);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      let lastFPSTick = 0;
      function updateFPS(now) {
        frameCount++;
        if (now - lastFPSTick >= 350) {
          fps = Math.round((frameCount * 1000) / (now - lastFPSTick));
          fpsCounter.textContent = `FPS: ${fps}`;
          frameCount = 0;
          lastFPSTick = now;
        }
      }

      let lastSpawnTime = 0;
      function gameLoop(ts) {
        if (!gameRunning) return;
        updateFPS(ts);
        updatePlayer();
        updateItems();
        updatePowerUps();
        checkCollisions();
        updateDifficulty(ts);
        updateComboDisplay();
        draw();
        if (ts - lastSpawnTime > 16) {
          if (Math.random() < gameSettings.burgerSpawnChance)
            createFallingItem("burger");
          if (Math.random() < gameSettings.bombSpawnChance)
            createFallingItem("bomb");
          if (Math.random() < gameSettings.powerUpSpawnChance)
            createFallingItem("powerup");
          lastSpawnTime = ts;
        }
        animationId = requestAnimationFrame(gameLoop);
      }

      function startGame() {
        gameRoot.querySelector("#mainHeader").style.display = "none";
        score = 0;
        lives = 3;
        level = 1;
        burgers = [];
        bombs = [];
        powerUpsList = [];
        particles = [];
        currentItemSpeed = gameSettings.initialItemSpeed;
        lastSpeedIncrease = 0;
        comboMultiplier = 1;
        maxCombo = 1;
        burgersCaught = 0;
        frameCount = 0;
        screenShake = 0;
        lastBurgerTime = 0;
        initStars();
        initDrawCache();
        for (const key of Object.keys(powerUps)) {
          powerUps[key].active = false;
          powerUps[key].timeLeft = 0;
        }
        [
          shieldIndicator,
          magnetIndicator,
          slowmoIndicator,
          doublePointsIndicator,
        ].forEach((el) => {
          el.classList.remove("active");
          el.style.opacity = "0.5";
        });
        scoreElement.textContent = "0";
        livesElement.textContent = "3";
        livesElement.classList.remove("low");
        levelElement.textContent = "1";
        comboElement.textContent = "1x";
        comboElement.style.color = "#fff";
        comboElement.style.textShadow = "none";
        comboElement.style.transform = "scale(1)";
        comboDisplay.style.display = "none";
        player.x = canvas.width / 2 - playerWidth / 2;
        player.y = getGroundY() - playerHeight - 3;
        player.movingLeft = false;
        player.movingRight = false;
        player.tilt = 0;
        startScreen.classList.remove("active");
        gameOverScreen.classList.remove("active");
        gameRunning = true;
        animationId = requestAnimationFrame(gameLoop);
      }

      async function handleGameOver(finalScore) {
        try {
          const tg = window.Telegram?.WebApp;
          if (tg?.initDataUnsafe?.user?.id) {
            const response = await fetch("/api/score/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: tg.initDataUnsafe.user.id,
                username: tg.initDataUnsafe.user.first_name,
                score: finalScore,
              }),
            });

            if (!response.ok) {
              console.warn("Failed to save score:", await response.text());
            }
          } else {
            console.warn("Telegram WebApp data unavailable — score not saved");
          }
        } catch (error) {
          console.error("Error saving score:", error);
        }
      }

      function gameOver() {
        showMainHeader();
        gameRunning = false;
        cancelAnimationFrame(animationId);

        finalScoreElement.textContent = score;
        maxComboElement.textContent = maxCombo.toFixed(1);
        burgersCaughtElement.textContent = burgersCaught;
        finalLevelElement.textContent = level;
        gameOverScreen.classList.add("active");

        handleGameOver(score).then(() => {
          if (
            typeof window !== "undefined" &&
            window.Telegram?.WebApp?.sendData
          ) {
            window.Telegram.WebApp.sendData(
              JSON.stringify({
                score: score,
                maxCombo: maxCombo,
                burgersCaught: burgersCaught,
                level: level,
              })
            );
          }
          if (onClose) onClose();
        });
      }

      function setupTouchControls() {
        const leftStart = (e) => {
          e.preventDefault();
          player.movingLeft = true;
        };
        const leftEnd = (e) => {
          e.preventDefault();
          player.movingLeft = false;
        };
        const rightStart = (e) => {
          e.preventDefault();
          player.movingRight = true;
        };
        const rightEnd = (e) => {
          e.preventDefault();
          player.movingRight = false;
        };
        [leftBtn, rightBtn].forEach((btn) => {
          btn.addEventListener(
            "touchstart",
            btn === leftBtn ? leftStart : rightStart
          );
          btn.addEventListener(
            "touchend",
            btn === leftBtn ? leftEnd : rightEnd
          );
          btn.addEventListener(
            "touchcancel",
            btn === leftBtn ? leftEnd : rightEnd
          );
          btn.addEventListener(
            "mousedown",
            btn === leftBtn ? leftStart : rightStart
          );
          btn.addEventListener("mouseup", btn === leftBtn ? leftEnd : rightEnd);
          btn.addEventListener(
            "mouseleave",
            btn === leftBtn ? leftEnd : rightEnd
          );
        });
      }

      function setupKeyboardControls() {
        const keyDown = (e) => {
          if (!gameRunning) return;
          if (e.key === "ArrowLeft" || e.key === "a") player.movingLeft = true;
          else if (e.key === "ArrowRight" || e.key === "d")
            player.movingRight = true;
        };
        const keyUp = (e) => {
          if (e.key === "ArrowLeft" || e.key === "a") player.movingLeft = false;
          else if (e.key === "ArrowRight" || e.key === "d")
            player.movingRight = false;
        };
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
      }

      function resizeGameCanvas() {
        const container = gameRoot.querySelector(".canvas-container");
        const controls = gameRoot.querySelector(".controls");
        const aspect = 3 / 4;
        let width = Math.min(
          700,
          container?.offsetWidth || window.innerWidth * 0.98
        );
        let maxH = window.innerHeight - (controls?.offsetHeight || 0);
        let height = Math.round(width / aspect);
        if (height > maxH) {
          height = maxH;
          width = Math.round(height * aspect);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        initDrawCache();
        initStars();
        player.width = 60;
        player.height = 30;
        player.y = getGroundY() - player.height - 3;
      }

      createBackgroundEffects();
      initStars();
      setupTouchControls();
      setupKeyboardControls();
      startBtn.addEventListener("click", startGame);
      restartBtn.addEventListener("click", startGame);

      const setViewportHeight = () => {
        document.documentElement.style.setProperty(
          "--vh",
          `${window.innerHeight * 0.01}px`
        );
      };
      setViewportHeight();
      window.addEventListener("resize", setViewportHeight);
      window.addEventListener("orientationchange", setViewportHeight);
      window.addEventListener("resize", resizeGameCanvas);
      window.addEventListener("orientationchange", resizeGameCanvas);
      document.addEventListener("DOMContentLoaded", resizeGameCanvas);
      window.addEventListener("load", resizeGameCanvas);
      resizeGameCanvas();

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && gameRunning) {
          gameRunning = false;
          cancelAnimationFrame(animationId);
        } else if (!document.hidden && !gameRunning && lives > 0) {
          gameRunning = true;
          animationId = requestAnimationFrame(gameLoop);
        }
      });

      gameRoot.querySelector("#mainHeader").style.display = "block";
    };

    runGameScript();
    return () => {};
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    />
  );
}
