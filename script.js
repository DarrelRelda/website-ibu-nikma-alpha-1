document.addEventListener("DOMContentLoaded", () => {
  const soalBox = document.getElementById("soalBox");
  const answersWrap = document.getElementById("answers");
  const lockBtn = document.getElementById("lockBtn");
  const skipBtn = document.getElementById("skipBtn");
  const backBtn = document.getElementById("backBtn");
  const actionRow = document.getElementById("actionRow");
  const quizBox = document.querySelector(".quiz-container");
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const closeSettings = document.getElementById("closeSettings");
  const secretMenu = document.getElementById("secretMenu");
  const closeSecret = document.getElementById("closeSecret");
  const reviewMenu = document.getElementById("reviewMenu");
  const reviewList = document.getElementById("reviewList");
  const closeReviewBtn = document.getElementById("closeReview");
  const skipWarnMenu = document.getElementById("skipWarnMenu");
  const warnGoSkipped = document.getElementById("warnGoSkipped");
  const warnFinishAnyway = document.getElementById("warnFinishAnyway");
  const endMenu = document.getElementById("endMenu");
  const endSubtitle = document.getElementById("endSubtitle");
  const endScore = document.getElementById("endScore");
  const endTotal = document.getElementById("endTotal");
  const restartBtn = document.getElementById("restartBtn");
  const reviewBtn = document.getElementById("reviewBtn");
  const creditsBtn = document.getElementById("creditsBtn");
  const creditsMenu = document.getElementById("creditsMenu");
  const closeCredits = document.getElementById("closeCredits");
  const creditDetailMenu = document.getElementById("creditDetailMenu");
  const closeCreditDetail = document.getElementById("closeCreditDetail");
  const creditDetailName = document.getElementById("creditDetailName");
  const creditDetailPhoto = document.getElementById("creditDetailPhoto");
  const creditDetailDesc = document.getElementById("creditDetailDesc");
  const extraBtn = document.getElementById("extraBtn");
  const extraMenu = document.getElementById("extraMenu");
  const closeExtra = document.getElementById("closeExtra");
  const optionBtn = document.getElementById("optionBtn");
  const optionMenu = document.getElementById("optionMenu");
  const closeOption = document.getElementById("closeOption");
  const limboToggle = document.getElementById("limboToggle");
  const darrelToggle = document.getElementById("darrelToggle");
  const hpToggle = document.getElementById("hpToggle");
  const bgBtn = document.getElementById("bgBtn");
  const bgMenu = document.getElementById("bgMenu");
  const closeBg = document.getElementById("closeBg");
  const wrapper = document.querySelector(".wrapper");
  const kaleidoscope = document.querySelector(".kaleidoscope");

  let settingsOpen = false;
  let limboMode = false;
  let useDarrelMode = false;
  let hpMode = false;
  let tidesMode = false;
  let tidesAnimId = null;
  let tidesTimeOfDay = 0.6;
  let limboTimer = null;
  let limboInterval = null;
  let pendingLimboStart = false;
  let pendingQuestionReload = false;
  let current = 0;
  let selected = null;
  let selectedValue = null;
  let phase = "answer";
  let isLoading = false;
  let settingsClickCount = 0;
  let secretReady = false;
  let lastQuestionText = "";
  let finishConfirmStep = false;

  // Menyimpan status jawaban tiap soal (null = belum dijawab/dilewati)
  // supaya navigasi "Kembali" bisa menampilkan ulang state yang benar
  // dan skor tidak dobel-hitung saat soal dijawab ulang.
  let answeredState = [];

  // ===== Background =====
  const palettes = [
    { name: "Horizon Shift", colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#F4F4F4", "#FF6B6B"] },
    { name: "Quiet Voltage", colors: ["#1A1A1D", "#4E4E50", "#6F2232", "#950740", "#C3073F", "#EAEAEA"] },
    { name: "Filtered Reality", colors: ["#1F1D36", "#3F3351", "#864879", "#E9A6A6", "#F0F0F0", "#2E2E2E"] },
    { name: "Desert Bloom", colors: ["#3E2723", "#6D4C41", "#D7CCC8", "#FFAB91", "#FF7043", "#FFF3E0"] },
    { name: "Cosmic Ink", colors: ["#0F0F1B", "#1B1B2F", "#16213E", "#533483", "#E94560", "#F5F5F5"] }
  ];

  let currentPalette = 0;

  function applyPalette(index) {
    const palette = palettes[index];
    palette.colors.forEach((color, i) => {
      document.documentElement.style.setProperty(`--c${i + 1}`, color);
    });
    currentPalette = index;

    document.querySelectorAll(".bg-toggle").forEach(toggle => {
      const idx = parseInt(toggle.dataset.palette);
      toggle.classList.toggle("on", idx === index);
    });
  }

  applyPalette(0);

  if (bgBtn) {
    bgBtn.onclick = () => {
      settingsMenu.classList.remove("show");
      setTimeout(() => {
        settingsMenu.style.display = "none";
        bgMenu.style.display = "block";
        void bgMenu.offsetWidth;
        bgMenu.classList.add("show");
      }, 450);
    };
  }

  if (closeBg) {
    closeBg.onclick = () => {
      bgMenu.classList.remove("show");
      setTimeout(() => {
        bgMenu.style.display = "none";
        settingsMenu.style.display = "block";
        settingsMenu.classList.remove("show");
        void settingsMenu.offsetWidth;
        requestAnimationFrame(() => settingsMenu.classList.add("show"));
      }, 450);
    };
  }

  document.querySelectorAll(".bg-toggle").forEach(toggle => {
    toggle.onclick = () => {
      const index = parseInt(toggle.dataset.palette);
      if (index === currentPalette && !tidesMode) return;

      // Matikan Tidal Wave dulu (kalau nyala)
      if (tidesMode) setTidesMode(false);

      kaleidoscope.classList.add("fading");
      setTimeout(() => {
        applyPalette(index);
        kaleidoscope.classList.remove("fading");
      }, 500);
    };
  });

  // ===== Tides (ocean) background =====
  const oceanCanvas = document.getElementById("ocean");
  const tidesToggle = document.getElementById("tidesToggle");
  const tidesSliderRow = document.getElementById("tidesSliderRow");
  const tidesTimeInput = document.getElementById("tidesTime");
  const tidesMoodEl = document.getElementById("tidesMood");


  function setTidesMode(on, { skipFade } = {}) {
    if (on === tidesMode && !skipFade) return;
    const audio = document.getElementById("tidesAudio");
    const sliderRow = document.getElementById("tidesSliderRow");

    if (on) {
      // Matikan semua palette toggle
      document.querySelectorAll(".bg-toggle").forEach(t => t.classList.remove("on"));

      const doEnable = () => {
        tidesMode = true;
        if (tidesToggle) tidesToggle.classList.add("on");
        if (sliderRow) {
          // smooth expand
          requestAnimationFrame(() => sliderRow.classList.add("open"));
        }
        if (oceanCanvas) oceanCanvas.classList.add("active");
        document.body.classList.add("tides-active");
        if (kaleidoscope) kaleidoscope.classList.add("hidden-by-tides");
        startTides();
        // Play best-part.mp3 dari folder yang sama dengan index.html
        (function playTidesAudio() {
          let el = audio || document.getElementById("tidesAudio");
          if (!el) {
            el = new Audio("zbest-part.mp3.mp3");
            el.id = "tidesAudio";
            el.loop = true;
            document.body.appendChild(el);
          }
          // pastikan src benar
          const src = el.querySelector("source");
          if (src && !src.src.includes("zbest-part")) {
            src.src = "zbest-part.mp3.mp3";
            el.load();
          }
          const volSlider = document.getElementById("npVol");
          const startVol = typeof npVolFromSlider === "function"
            ? npVolFromSlider(volSlider ? volSlider.value : 50)
            : 0.7;
          el.volume = startVol;
          el.loop = true;
          el.muted = false;
          try { el.currentTime = 0; } catch (e) {}
          const p = el.play();
          if (p && p.catch) {
            p.catch((err) => {
              console.warn("Audio play failed:", err && err.message);
              // coba buat Audio baru
              const a2 = new Audio("zbest-part.mp3.mp3");
              a2.loop = true;
              a2.volume = startVol;
              a2.play().catch((e2) => console.warn("Retry failed:", e2 && e2.message));
              window._tidesAudio = a2;
            });
          } else {
            window._tidesAudio = el;
          }
          showNowPlaying();
        })();
      };

      if (skipFade) {
        doEnable();
        return;
      }

      // Fade: kaleidoscope → hitam → tidal wave
      const overlay = document.getElementById("bgFadeOverlay");
      if (kaleidoscope) kaleidoscope.classList.add("hidden-by-tides");
      if (overlay) {
        overlay.classList.add("on");
        setTimeout(() => {
          doEnable();
          // sedikit delay biar ocean sudah frame pertama, lalu black hilang
          setTimeout(() => overlay.classList.remove("on"), 80);
        }, 450);
      } else {
        doEnable();
      }
    } else {
      tidesMode = false;
      hideNowPlaying();
      if (tidesToggle) tidesToggle.classList.remove("on");
      if (sliderRow) sliderRow.classList.remove("open");
      if (oceanCanvas) oceanCanvas.classList.remove("active"); document.body.classList.remove("tides-active");
      stopTides();
const a = audio || document.getElementById("tidesAudio") || window._tidesAudio;
      if (a) fadeOutAudio(a, 700);
      // Kembalikan palette aktif
      document.querySelectorAll(".bg-toggle").forEach(t => {
        const idx = parseInt(t.dataset.palette);
        t.classList.toggle("on", idx === currentPalette);
      });
      if (kaleidoscope) kaleidoscope.classList.remove("hidden-by-tides");
    }
  }

  if (tidesToggle) {
    tidesToggle.onclick = () => setTidesMode(!tidesMode);
  }
  if (tidesTimeInput) {
    tidesTimeInput.addEventListener("input", () => {
      tidesTimeOfDay = tidesTimeInput.value / 1000;
    });
  }

  /* ── Ocean renderer (Tidal Wave) ── */
  const oceanCtx = oceanCanvas ? oceanCanvas.getContext("2d") : null;
  let oW, oH, oDPR, horizonY, oceanH, oT = 0;

  const TIDES_KEYS = [
    { t: 0.0, name: "DAWN", skyTop: [38,44,86], skyHor: [247,176,128], sun: [255,238,206], glow: [255,178,120], wFar: [176,150,150], wNear: [34,62,84], foam: [255,244,234], sunH: 0.1, glit: 0.7, star: 0 },
    { t: 0.28, name: "MORNING", skyTop: [64,134,206], skyHor: [188,222,236], sun: [255,255,246], glow: [255,250,224], wFar: [120,186,196], wNear: [20,92,114], foam: [255,255,255], sunH: 0.55, glit: 0.5, star: 0 },
    { t: 0.5, name: "MIDDAY", skyTop: [58,142,214], skyHor: [176,216,230], sun: [255,255,248], glow: [255,252,232], wFar: [96,178,188], wNear: [16,96,120], foam: [255,255,255], sunH: 0.92, glit: 0.45, star: 0 },
    { t: 0.68, name: "GOLDEN HOUR", skyTop: [74,92,156], skyHor: [255,202,120], sun: [255,236,194], glow: [255,168,92], wFar: [206,164,118], wNear: [34,78,98], foam: [255,244,228], sunH: 0.3, glit: 0.95, star: 0 },
    { t: 0.84, name: "SUNSET", skyTop: [48,38,86], skyHor: [255,108,68], sun: [255,206,148], glow: [255,92,58], wFar: [188,98,84], wNear: [30,42,72], foam: [255,222,200], sunH: 0.06, glit: 1.0, star: 0.15 },
    { t: 1.0, name: "MOONLIT", skyTop: [8,12,30], skyHor: [34,44,82], sun: [228,234,255], glow: [140,164,216], wFar: [28,42,76], wNear: [6,16,32], foam: [196,208,234], sunH: 0.55, glit: 0.55, star: 1 }
  ];

  function tLerp(a, b, t) { return a + (b - a) * t; }
  function tLerpRGB(a, b, t) { return [tLerp(a[0], b[0], t), tLerp(a[1], b[1], t), tLerp(a[2], b[2], t)]; }
  function tRgb(c, a = 1) { return `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`; }

  function getTidesPalette(t) {
    let i = 0;
    while (i < TIDES_KEYS.length - 1 && t > TIDES_KEYS[i + 1].t) i++;
    const A = TIDES_KEYS[i], B = TIDES_KEYS[Math.min(i + 1, TIDES_KEYS.length - 1)];
    const span = B.t - A.t || 1;
    const k = Math.max(0, Math.min(1, (t - A.t) / span));
    return {
      name: k < 0.5 ? A.name : B.name,
      skyTop: tLerpRGB(A.skyTop, B.skyTop, k),
      skyHor: tLerpRGB(A.skyHor, B.skyHor, k),
      sun: tLerpRGB(A.sun, B.sun, k),
      glow: tLerpRGB(A.glow, B.glow, k),
      wFar: tLerpRGB(A.wFar, B.wFar, k),
      wNear: tLerpRGB(A.wNear, B.wNear, k),
      foam: tLerpRGB(A.foam, B.foam, k),
      sunH: tLerp(A.sunH, B.sunH, k),
      glit: tLerp(A.glit, B.glit, k),
      star: tLerp(A.star, B.star, k)
    };
  }

  const tStars = Array.from({ length: 120 }, () => ({
    x: Math.random(), y: Math.random() * 0.4, r: Math.random() * 1.2 + 0.3, tw: Math.random() * Math.PI * 2
  }));
  const tClouds = Array.from({ length: 5 }, () => ({
    x: Math.random(), y: 0.08 + Math.random() * 0.18, w: 0.18 + Math.random() * 0.22, speed: 0.000015 + Math.random() * 0.00002
  }));

  function resizeOcean() {
    if (!oceanCanvas || !oceanCtx) return;
    oDPR = Math.min(window.devicePixelRatio || 1, 2);
    // ceil + clientWidth agar tidak ada celah 1px di kanan
    oW = Math.ceil(Math.max(window.innerWidth, document.documentElement.clientWidth));
    oH = Math.ceil(Math.max(window.innerHeight, document.documentElement.clientHeight));
    oceanCanvas.width = Math.ceil(oW * oDPR);
    oceanCanvas.height = Math.ceil(oH * oDPR);
    oceanCanvas.style.width = "100vw";
    oceanCanvas.style.height = "100dvh";
    oceanCanvas.style.left = "0";
    oceanCanvas.style.top = "0";
    oceanCtx.setTransform(oDPR, 0, 0, oDPR, 0, 0);
    horizonY = oH * 0.42;
    oceanH = oH - horizonY;
  }
  window.addEventListener("resize", () => { if (tidesMode) resizeOcean(); });

  function drawTides() {
    if (!tidesMode || !oceanCtx) return;
    oT += 0.016;
    const P = getTidesPalette(tidesTimeOfDay);
    if (tidesMoodEl) tidesMoodEl.textContent = P.name;

    // Matahari/bulan tetap di kiri (tidak ikut kursor)
    const sunX = oW * 0.22;
    const sunY = horizonY - P.sunH * horizonY * 0.82;

    const sky = oceanCtx.createLinearGradient(0, 0, 0, horizonY + oceanH * 0.1);
    sky.addColorStop(0, tRgb(P.skyTop));
    sky.addColorStop(0.7, tRgb(tLerpRGB(P.skyTop, P.skyHor, 0.55)));
    sky.addColorStop(1, tRgb(P.skyHor));
    oceanCtx.fillStyle = sky;
    oceanCtx.fillRect(0, 0, oW, horizonY + 2);

    if (P.star > 0.01) {
      tStars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(oT * 2 + s.tw);
        oceanCtx.fillStyle = tRgb([255, 255, 255], P.star * tw * 0.9);
        oceanCtx.beginPath();
        oceanCtx.arc(s.x * oW, s.y * horizonY, s.r, 0, Math.PI * 2);
        oceanCtx.fill();
      });
    }

    const glowR = Math.min(oW, oH) * 0.5;
    const g = oceanCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
    g.addColorStop(0, tRgb(P.glow, 0.55));
    g.addColorStop(0.25, tRgb(P.glow, 0.22));
    g.addColorStop(1, tRgb(P.glow, 0));
    oceanCtx.fillStyle = g;
    oceanCtx.fillRect(0, 0, oW, horizonY + oceanH * 0.4);

    const sunR = Math.min(oW, oH) * 0.045;
    const sd = oceanCtx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sd.addColorStop(0, tRgb(P.sun, 1));
    sd.addColorStop(0.7, tRgb(P.sun, 0.95));
    sd.addColorStop(1, tRgb(P.sun, 0.2));
    oceanCtx.fillStyle = sd;
    oceanCtx.beginPath();
    oceanCtx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    oceanCtx.fill();

    tClouds.forEach(c => {
      c.x += c.speed;
      if (c.x > 1.3) c.x = -0.3;
      const cx = c.x * oW, cy = c.y * horizonY, cw = c.w * oW;
      oceanCtx.fillStyle = tRgb(tLerpRGB(P.skyHor, [255, 255, 255], 0.25), 0.16);
      for (let j = 0; j < 4; j++) {
        oceanCtx.beginPath();
        oceanCtx.ellipse(cx + j * cw * 0.22, cy + Math.sin(j) * 6, cw * (0.3 - j * 0.04), cw * 0.06, 0, 0, Math.PI * 2);
        oceanCtx.fill();
      }
    });

    const haze = oceanCtx.createLinearGradient(0, horizonY - 40, 0, horizonY + 40);
    haze.addColorStop(0, tRgb(P.skyHor, 0));
    haze.addColorStop(0.5, tRgb(P.skyHor, 0.45));
    haze.addColorStop(1, tRgb(P.wFar, 0));
    oceanCtx.fillStyle = haze;
    oceanCtx.fillRect(0, horizonY - 40, oW, 80);

    const NUM = 22;
    for (let i = 0; i < NUM; i++) {
      const depth = i / (NUM - 1);
      const yTop = horizonY + Math.pow(depth, 1.9) * oceanH;
      const amp = tLerp(0.6, 28, depth);
      const wlen = tLerp(46, 340, depth);
      const speed = tLerp(0.25, 0.9, depth);
      const phase = oT * speed + i * 0.9;
      const col = tLerpRGB(P.wFar, P.wNear, depth);

      oceanCtx.beginPath();
      oceanCtx.moveTo(0, oH);
      oceanCtx.lineTo(0, yTop + Math.sin(phase) * amp);
      for (let x = 0; x <= oW + 16; x += 8) {
        const y = yTop + Math.sin(x / wlen + phase) * amp + Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;
        oceanCtx.lineTo(x, y);
      }
      oceanCtx.lineTo(oW + 16, oH);
      oceanCtx.closePath();
      oceanCtx.fillStyle = tRgb(col);
      oceanCtx.fill();

      oceanCtx.lineWidth = tLerp(0.6, 2.0, depth);
      oceanCtx.beginPath();
      let started = false;
      for (let x = 0; x <= oW + 16; x += 8) {
        const y = yTop + Math.sin(x / wlen + phase) * amp + Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;
        if (started) oceanCtx.lineTo(x, y); else { oceanCtx.moveTo(x, y); started = true; }
      }
      oceanCtx.strokeStyle = tRgb(tLerpRGB(col, P.sun, 0.55), tLerp(0.05, 0.28, depth));
      oceanCtx.stroke();

      if (depth > 0.62) {
        const foamA = (depth - 0.62) / 0.38;
        for (let x = 0; x <= oW + 16; x += 12) {
          const y = yTop + Math.sin(x / wlen + phase) * amp + Math.sin(x / (wlen * 0.4) + phase * 1.6) * amp * 0.3;
          const crest = Math.sin(x / wlen + phase);
          if (crest > 0.55 && Math.random() > 0.5) {
            oceanCtx.fillStyle = tRgb(P.foam, foamA * (0.18 + Math.random() * 0.3));
            oceanCtx.fillRect(x + (Math.random() - 0.5) * 6, y - Math.random() * 3, 1.5 + Math.random() * 3, 1.5 + Math.random() * 2);
          }
        }
      }
    }

    for (let i = 0; i < 160; i++) {
      const dy = Math.random();
      const y = horizonY + Math.pow(dy, 1.5) * oceanH;
      const spread = tLerp(6, oW * 0.3, dy);
      const x = sunX + (Math.random() - 0.5) * 2 * spread;
      const distFade = 1 - Math.min(1, Math.abs(x - sunX) / (spread + 1));
      const flick = 0.25 + Math.random() * 0.75;
      const a = distFade * distFade * flick * P.glit * (1 - dy * 0.25);
      if (a < 0.02) continue;
      oceanCtx.fillStyle = tRgb(P.sun, a * 0.85);
      oceanCtx.fillRect(x, y, 1 + Math.random() * (2 + dy * 4), 1 + dy);
    }

    const vig = oceanCtx.createRadialGradient(oW / 2, oH * 0.55, oH * 0.25, oW / 2, oH * 0.55, oH * 0.9);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,8,0.34)");
    oceanCtx.fillStyle = vig;
    oceanCtx.fillRect(0, 0, oW, oH);

    tidesAnimId = requestAnimationFrame(drawTides);
  }

  function startTides() {
    if (!oceanCanvas) return;
    resizeOcean();
    if (tidesAnimId) cancelAnimationFrame(tidesAnimId);
    drawTides();
  }
  function stopTides() {
    if (tidesAnimId) {
      cancelAnimationFrame(tidesAnimId);
      tidesAnimId = null;
    }
  }



  // ===== Auto detect mobile (CSS media query + class helper) =====
  function isMobileDevice() {
    const narrow = window.matchMedia("(max-width: 700px)").matches;
    const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    return narrow || (touch && ua);
  }
  function syncAutoMobileClass() {
    document.body.classList.toggle("auto-mobile", isMobileDevice());
  }
  syncAutoMobileClass();
  window.addEventListener("resize", syncAutoMobileClass);
  window.matchMedia("(max-width: 700px)").addEventListener("change", syncAutoMobileClass);

  // ===== HP Mode =====
  if (hpToggle) {
    hpToggle.onclick = () => {
      hpMode = !hpMode;
      hpToggle.classList.toggle("on", hpMode);
      document.body.classList.toggle("hp-mode", hpMode);
    };
  }

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const NEXT_TEXT = ["lanjut coy", "sebaiknya lanjut saja bung", "lanjut woe lama kali", "aduh kaka ayo lanjut"];
  const WRONG_TEXT = ["aduh kaka knp bisa salah?", "salah woe makana blajar!", "waduh kok salah?", "salah coi!"];

  const normalQuestionBank = [
    { text: "Siapa yang buat ini?", answers: ["Darrel", "Ghazi", "Nizam", "Hatim"], correct: ["Darrel"] },
    { text: "berapa lama ini dibuat???", answers: ["gatau", "11 tahun", "3 bulan", "5 bulan"], correct: ["3 bulan"] },
    { text: "siapa yang bantu darrel buat ini?", answers: ["ghazi", "nizam", "feisya", "ndak ada"], correct: ["ndak ada"] },
    { text: "apa yang dilakukan darrel waktu buat ini?", answers: ["nolep", "main", "makan", "ha?"], correct: ["nolep"] },
    { text: "berapa versi sudah darrel buat utk projek ini?", answers: ["6", "4", "9", "2"], correct: ["4"] },
    { text: "berapa lama semua projek ini untuk dibuat?", answers: ["2 tahun", "10 bulan", "1 tahun", "5 bulan"], correct: ["1 tahun"] },
    { text: "menganyam itu seru kan anak-anak?", answers: ["tidak"], correct: ["tidak"], special: "menganyam itu tidak seru" },
    { text: "apa fungsi apel di belakang lemari", answers: ["di fermentasi", "pajangan", "apel?", "ga ada yang benar"], correct: ["di fermentasi"] },
    { text: "guru mana yang masih hidup", answers: ["bu nikma", "bu dewi", "bu ema", "bu nur"], correct: ["bu nikma"] },
    { text: "kalo keliat muka darrel 1 frame harus", answers: ["sapa", "balik palanya", "bilang halo", "ga ngapa2in"], correct: ["balik palanya"] },
    { text: "bapak luki itu aneh", answers: ["betul", "salah", "gatau", "bapak yg mn?"], correct: ["bapak yg mn?"] },
    { text: "apa", answers: ["ha?", "apasih", "gajelas", "apa?"], correct: ["ha?", "apasih", "gajelas", "apa?"] },
    { text: "nama full terpanjang ada di", answers: ["feisya", "nizam", "ghazi", "raisa"], correct: ["feisya"] },
    { text: "berapa jumlah murid sd 81", answers: ["1211", "1069", "67", "873"], correct: ["1211"] },
    { text: "iklan mana yang paling bagus", answers: ["logotech", "matcha", "mobil", "tv"], correct: ["logotech"] },
    { text: "apa fungsi projek ini", answers: ["ga ada", "utk bu nikma", "utk presentasi", "gatau"], correct: ["utk bu nikma"] },
    { text: "apa motivasi darrel buat ini", answers: ["tidak ada", "kamu", "lele", "hmmmm"], correct: ["tidak ada"] },
    { text: "apa alasan darrel lama buat ini", answers: ["sibuk", "mati lampu", "malas", "kursina rusak"], correct: ["malas"] }
  ];

  const darrelQuestionBank = [
    { text: "kenapa aku buat ini", answers: ["utk main", "utk bu nikma", "utk iseng²", "utk sidequest"], correct: ["utk sidequest"] },
    { text: "Kenapa lama amat buat ini", answers: ["idk", "males", "ga ada ide", "ga ada temen"], correct: ["ga ada ide"] }
  ];

  // Urutan jawaban diacak SEKALI di sini dan disimpan tetap selama sesi,
  // supaya saat "Kembali" ke soal sebelumnya, posisi tombol jawaban tidak berubah-ubah.
  function buildQuestions() {
    const source = useDarrelMode ? darrelQuestionBank : normalQuestionBank;
    return shuffle(source.map(q => ({
      text: q.text,
      answers: shuffle(q.answers),
      correct: [...q.correct],
      special: q.special || null
    })));
  }

  let questions = buildQuestions();

  function isAnySubMenuOpen() {
    return (
      creditsMenu.classList.contains("show") ||
      creditDetailMenu.classList.contains("show") ||
      extraMenu.classList.contains("show") ||
      optionMenu.classList.contains("show") ||
      secretMenu.classList.contains("show") ||
      bgMenu.classList.contains("show") ||
      reviewMenu.classList.contains("show") ||
      skipWarnMenu.classList.contains("show") ||
      endMenu.classList.contains("show")
    );
  }

  function currentScore() {
    return answeredState.reduce((sum, s) => sum + (s && s.correct ? 1 : 0), 0);
  }

  function hasSkippedQuestions() {
    return answeredState.some(s => s === null);
  }

  function firstSkippedIndex() {
    return answeredState.findIndex(s => s === null);
  }

  // Dipanggil setiap kali mau lanjut ke soal berikutnya (dari Kunci Jawaban
  // atau Lewati). Kalau sudah di soal terakhir tapi masih ada yang dilewati,
  // tampilkan peringatan dulu alih-alih langsung menyelesaikan kuis.
  function advanceOrFinish() {
    if (current < questions.length) {
      loadQuestion();
    } else if (hasSkippedQuestions()) {
      openSkipWarning();
    } else {
      finishQuiz();
    }
  }

  function buildReviewList() {
    reviewList.innerHTML = "";
    questions.forEach((q, idx) => {
      const state = answeredState[idx];
      let statusText = "Dilewati";
      let statusClass = "status-skip";
      if (state && !state.wasSkipped) {
        statusText = state.correct ? "Benar" : "Salah";
        statusClass = state.correct ? "status-correct" : "status-wrong";
      }

      const item = document.createElement("div");
      item.className = "review-item";
      item.innerHTML = `
        <span class="review-num">${idx + 1}.</span>
        <span class="review-text"></span>
        <span class="review-status ${statusClass}">${statusText}</span>
      `;
      item.querySelector(".review-text").textContent = q.text;
      item.onclick = () => {
        closeReviewMenu(() => {
          current = idx;
          loadQuestion();
        });
      };
      reviewList.appendChild(item);
    });
  }

  function openReviewMenu() {
    buildReviewList();
    endMenu.classList.remove("show");
    setTimeout(() => {
      endMenu.style.display = "none";
      reviewMenu.style.display = "block";
      setTimeout(() => reviewMenu.classList.add("show"), 20);
    }, 450);
  }

  function closeReviewMenu(afterCallback) {
    reviewMenu.classList.remove("show");
    setTimeout(() => {
      reviewMenu.style.display = "none";
      if (afterCallback) {
        // Balik ke soal aktif (misal user klik salah satu soal di daftar review)
        wrapper.style.display = "flex";
        actionRow.style.display = "flex";
        wrapper.classList.add("screen-fade");
        void wrapper.offsetWidth;
        requestAnimationFrame(() => wrapper.classList.remove("screen-fade"));
        afterCallback();
      } else {
        // Ditutup lewat tombol ✖: kembali ke layar skor
        endMenu.style.display = "block";
        setTimeout(() => endMenu.classList.add("show"), 20);
      }
    }, 450);
  }

  function openSkipWarning() {
    finishConfirmStep = false;
    warnFinishAnyway.textContent = "Tetap Selesaikan";
    wrapper.classList.add("screen-fade");
    setTimeout(() => {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      skipWarnMenu.style.display = "block";
      setTimeout(() => skipWarnMenu.classList.add("show"), 20);
    }, 450);
  }

  // revealWrapper: kalau false, kotak soal TIDAK ditampilkan ulang setelah popup
  // peringatan ditutup — dipakai saat lanjut langsung ke menu nilai, supaya soal
  // tidak sempat "berkedip" muncul sebelum layar nilai tampil.
  function closeSkipWarning(afterCallback, { revealWrapper = true } = {}) {
    skipWarnMenu.classList.remove("show");
    setTimeout(() => {
      skipWarnMenu.style.display = "none";
      if (revealWrapper) {
        wrapper.style.display = "flex";
        actionRow.style.display = "flex";
        setTimeout(() => wrapper.classList.remove("screen-fade"), 20);
      }
      if (afterCallback) afterCallback();
    }, 450);
  }

  closeReviewBtn.onclick = () => closeReviewMenu();

  warnGoSkipped.onclick = () => {
    finishConfirmStep = false;
    warnFinishAnyway.textContent = "Tetap Selesaikan";
    closeSkipWarning(() => {
      const idx = firstSkippedIndex();
      if (idx !== -1) {
        current = idx;
        loadQuestion();
      }
    });
  };

  warnFinishAnyway.onclick = () => {
    if (!finishConfirmStep) {
      finishConfirmStep = true;
      warnFinishAnyway.textContent = "Serius?";
      return;
    }
    finishConfirmStep = false;
    warnFinishAnyway.textContent = "Tetap Selesaikan";
    // revealWrapper: false — langsung ke menu nilai, tanpa kotak soal muncul dulu.
    closeSkipWarning(() => {
      // Soal yang masih dilewati dikunci sebagai "tidak dijawab" (dihitung salah/0 poin),
      // tapi ditandai wasSkipped supaya di Review tetap tampil "Dilewati", bukan "Salah".
      answeredState = answeredState.map(s => s || { value: null, correct: false, message: "Tidak dijawab", wasSkipped: true });
      finishQuiz();
    }, { revealWrapper: false });
  };

  function finishQuiz() {
    const total = questions.length;
    const score = currentScore();
    const skippedCount = answeredState.filter(s => s === null || s.wasSkipped).length;
    const ratio = total === 0 ? 0 : score / total;
    const hue = ratio * 120;
    const scoreColor = `hsl(${hue}, 100%, 55%)`;
    const glowColor = `hsla(${hue}, 100%, 55%, 0.45)`;

    endSubtitle.textContent = skippedCount > 0 ? `nilai (${skippedCount} dilewati)` : "nilai";
    endScore.textContent = score;
    endScore.style.color = scoreColor;
    endScore.style.textShadow = `0 0 18px ${glowColor}, 0 0 30px ${glowColor}`;
    endTotal.textContent = total;

    answersWrap.innerHTML = "";
    lockBtn.classList.remove("show", "fade-out");

    wrapper.classList.add("screen-fade");
    setTimeout(() => {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      endMenu.style.display = "block";
      setTimeout(() => endMenu.classList.add("show"), 20);
    }, 450);
  }

  restartBtn.onclick = () => {
    endMenu.classList.remove("show");
    setTimeout(() => {
      endMenu.style.display = "none";
      resetQuizData();
      renderQuestionInstant();
      wrapper.style.display = "flex";
      actionRow.style.display = "flex";
      wrapper.classList.add("screen-fade");
      void wrapper.offsetWidth;
      requestAnimationFrame(() => wrapper.classList.remove("screen-fade"));
    }, 450);
  };

  reviewBtn.onclick = () => openReviewMenu();

  function clearLimboState() {
    if (limboTimer) { clearTimeout(limboTimer); limboTimer = null; }
    if (limboInterval) { clearInterval(limboInterval); limboInterval = null; }
    answersWrap.classList.remove("limbo-shuffling", "limbo-locked");
    answersWrap.querySelectorAll(".answer-btn").forEach(btn => {
      btn.style.transform = "";
      btn.classList.remove("pulse-correct", "pulse-wrong");
      const span = btn.querySelector(".answer-text");
      if (span) span.classList.remove("hidden-text");
    });
  }

  // savedState (opsional): { value, correct, message } dari jawaban sebelumnya di soal ini
  function renderAnswerButtons(q, savedState) {
    answersWrap.innerHTML = "";
    q.answers.forEach(text => {
      const btn = document.createElement("div");
      btn.className = "answer-btn";
      btn.dataset.answer = text;
      const span = document.createElement("span");
      span.className = "answer-text";
      span.textContent = text;
      btn.appendChild(span);
      if (q.answers.length === 1) btn.classList.add("single-answer");

      if (savedState) {
        if (q.correct.includes(text)) btn.classList.add("correct");
        if (text === savedState.value && !q.correct.includes(text)) btn.classList.add("wrong");
        if (text === savedState.value) {
          btn.classList.add("selected");
          selected = btn;
          selectedValue = text;
        }
      }

      btn.onclick = () => {
        if (phase !== "answer") return;
        if (limboMode && answersWrap.classList.contains("limbo-locked")) return;

        answersWrap.querySelectorAll(".answer-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selected = btn;
        // Baca langsung dari dataset (lebih aman setelah shuffle)
        selectedValue = btn.dataset.answer;

        if (selectedValue !== "Darrel") secretReady = false;
        lockBtn.classList.remove("fade-out");
        lockBtn.classList.add("show");
      };
      answersWrap.appendChild(btn);
    });
  }

  function updateBackBtn() {
    backBtn.disabled = current === 0;
  }

  function setupQuestionUI(q) {
    soalBox.style.animation = "";
    lastQuestionText = q.text;
    settingsClickCount = 0;
    secretReady = false;
    soalBox.textContent = q.text;

    const savedState = answeredState[current] || null;
    selected = null;
    selectedValue = null;

    lockBtn.style.display = "block";
    skipBtn.style.display = "flex";
    backBtn.style.display = "flex";
    updateBackBtn();

    if (savedState) {
      // Soal ini sudah pernah dijawab: tampilkan ulang hasilnya, siap lanjut.
      phase = "next";
      lockBtn.classList.remove("fade-out");
      lockBtn.classList.add("show");
      lockBtn.textContent = savedState.message;
      lockBtn.style.background = savedState.correct ? "#00c853" : "#ff3b3b";
      skipBtn.disabled = true;
    } else {
      phase = "answer";
      lockBtn.classList.remove("show", "fade-out");
      lockBtn.textContent = "Kunci Jawaban";
      lockBtn.style.background = "#3a7dff";
      skipBtn.disabled = false;
    }

    renderAnswerButtons(q, savedState);
  }

  function renderQuestionInstant() {
    if (current >= questions.length) { finishQuiz(); return; }
    clearLimboState();
    const q = questions[current];
    setupQuestionUI(q);
    quizBox.classList.remove("fade-out");
    isLoading = false;
    if (limboMode && phase === "answer") {
      requestAnimationFrame(() => requestAnimationFrame(() => startLimboSequence(q)));
    }
  }

  function resetQuizData() {
    clearLimboState();
    questions = buildQuestions();
    answeredState = new Array(questions.length).fill(null);
    current = 0;
    selected = null;
    selectedValue = null;
    phase = "answer";
    settingsClickCount = 0;
    secretReady = false;
    lastQuestionText = "";
    pendingQuestionReload = false;
    lockBtn.style.display = "block";
    lockBtn.classList.remove("show", "fade-out");
    lockBtn.textContent = "Kunci Jawaban";
    lockBtn.style.background = "#3a7dff";
    skipBtn.style.display = "flex";
    skipBtn.disabled = false;
    backBtn.style.display = "flex";
    updateBackBtn();
  }

  function loadQuestion() {
    if (current >= questions.length) { finishQuiz(); return; }
    if (isLoading) return;
    isLoading = true;
    quizBox.classList.add("fade-out");
    if (lockBtn.classList.contains("show")) lockBtn.classList.add("fade-out");
    setTimeout(() => {
      clearLimboState();
      const q = questions[current];
      setupQuestionUI(q);
      quizBox.classList.remove("fade-out");
      isLoading = false;
      if (limboMode && phase === "answer") {
        requestAnimationFrame(() => requestAnimationFrame(() => startLimboSequence(q)));
      }
    }, 450);
  }

  function startLimboSequence(q) {
    const btns = [...answersWrap.querySelectorAll(".answer-btn")];
    if (btns.length === 0) return;

    answersWrap.classList.add("limbo-locked");

    // Hanya jawaban benar yang dapat pulse kuning
    btns.forEach(btn => {
      if (q.correct.includes(btn.dataset.answer)) {
        btn.classList.add("pulse-correct");
      }
    });

    setTimeout(() => {
      btns.forEach(btn => {
        btn.classList.remove("pulse-correct");
        const span = btn.querySelector(".answer-text");
        if (span) span.classList.add("hidden-text");
      });

      setTimeout(() => {
        if (btns.length < 2) {
          answersWrap.classList.remove("limbo-locked");
        } else {
          beginShuffleSwap(btns);
        }
      }, 400);
    }, 1500);
  }

  function beginShuffleSwap(btns) {
    if (wrapper.offsetParent === null || answersWrap.offsetParent === null) {
      limboTimer = setTimeout(() => beginShuffleSwap(btns), 150);
      return;
    }

    // Posisi slot asli (tetap)
    const positions = btns.map(btn => ({
      top: btn.offsetTop,
      left: btn.offsetLeft
    }));

    // Urutan visual saat ini
    let currentOrder = [...btns];

    function shuffleNoFixedPoints(arr) {
      if (arr.length < 2) return [...arr];
      let result;
      do {
        result = shuffle([...arr]);
      } while (result.some((val, idx) => val === arr[idx]));
      return result;
    }

    answersWrap.classList.add("limbo-shuffling");

    function applyVisualOrder(order) {
      order.forEach((btn, newIndex) => {
        const target = positions[newIndex];
        const originIndex = btns.indexOf(btn);
        const origin = positions[originIndex];
        const dx = target.left - origin.left;
        const dy = target.top - origin.top;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    }

    // Shuffle visual setiap 500ms
    limboInterval = setInterval(() => {
      currentOrder = shuffleNoFixedPoints(currentOrder);
      applyVisualOrder(currentOrder);
    }, 500);

    // Setelah 15 detik
    limboTimer = setTimeout(() => {
      clearInterval(limboInterval);
      limboInterval = null;

      // Pastikan visual terakhir sudah diterapkan
      applyVisualOrder(currentOrder);

      // Tunggu animasi CSS selesai (0.4s) supaya tidak loncat
      setTimeout(() => {
        // Commit urutan DOM sesuai visual terakhir
        currentOrder.forEach(btn => {
          answersWrap.appendChild(btn);
        });

        // Hapus transform → posisi permanen
        btns.forEach(btn => {
          btn.style.transform = "";
        });

        answersWrap.classList.remove("limbo-shuffling");
        answersWrap.classList.remove("limbo-locked");
      }, 450);
    }, 15000);
  }

  function revealLimboText() { clearLimboState(); }

  settingsBtn.onclick = () => {
    if (isLoading) return;
    if (isAnySubMenuOpen()) return;
    settingsClickCount++;
    if (settingsClickCount > 4) settingsClickCount = 4;
    if (settingsClickCount === 4) secretReady = true;
    if (settingsOpen) closeSettingsMenu();
    else openSettings();
  };

  function openSettings() {
    settingsOpen = true;
    wrapper.classList.add("screen-fade");
    actionRow.classList.add("screen-fade");
    setTimeout(() => {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      settingsMenu.style.display = "block";
      settingsMenu.style.opacity = "0";
      settingsMenu.classList.remove("show");
      void settingsMenu.offsetWidth;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          settingsMenu.style.opacity = "";
          settingsMenu.classList.add("show");
        });
      });
    }, 420);
  }

  function closeSettingsMenu() {
    settingsOpen = false;
    settingsMenu.classList.remove("show");
    setTimeout(() => {
      settingsMenu.style.display = "none";
      const shouldReload = pendingQuestionReload;
      if (shouldReload) {
        resetQuizData();
        pendingLimboStart = false;
        renderQuestionInstant();
      }
      // Tampilkan quiz dalam keadaan faded dulu
      wrapper.style.display = "flex";
      actionRow.style.display = "flex";
      wrapper.classList.add("screen-fade");
      actionRow.classList.add("screen-fade");
      // Double rAF + sedikit delay supaya browser sempat paint opacity:0
      // baru kemudian fade in — tanpa ini sering tidak ada animasi
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            wrapper.classList.remove("screen-fade");
            actionRow.classList.remove("screen-fade");
            if (!shouldReload && pendingLimboStart) {
              pendingLimboStart = false;
              const q = questions[current];
              if (q && phase === "answer") startLimboSequence(q);
            }
          }, 20);
        });
      });
    }, 450);
  }

  

  closeSettings.onclick = closeSettingsMenu;

  creditsBtn.onclick = () => {
    settingsMenu.classList.remove("show");
    setTimeout(() => {
      settingsMenu.style.display = "none";
      creditsMenu.style.display = "block";
      void creditsMenu.offsetWidth;
      creditsMenu.classList.add("show");
    }, 450);
  };
  closeCredits.onclick = () => {
    creditsMenu.classList.remove("show");
    setTimeout(() => {
      creditsMenu.style.display = "none";
      settingsMenu.style.display = "block";
      settingsMenu.classList.remove("show");
      void settingsMenu.offsetWidth;
      requestAnimationFrame(() => settingsMenu.classList.add("show"));
    }, 450);
  };

  // ===== Detail Credits (tombol "Lihat" per orang) =====
  // Data foto/deskripsi tiap orang. Deskripsi masih kosong, akan diisi belakangan.
  const creditPeople = {
    "bu-nikma": { name: "Ibu Nikma", photo: "data:image/jpeg;base64,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", desc: "" },
    "raisa": { name: "Raisa", photo: "data:image/jpeg;base64,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", desc: "" },
    "lucky": { name: "Lucky", photo: "data:image/jpeg;base64,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", desc: "" },
    "kaisan": { name: "Kaisan", photo: "data:image/jpeg;base64,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", desc: "" },
    "darrel": { name: "Darrel", photo: "", desc: "" }
  };

  document.querySelectorAll(".credit-view-btn").forEach(btn => {
    btn.onclick = () => {
      const person = creditPeople[btn.dataset.person];
      if (!person) return;
      creditDetailName.textContent = person.name;
      if (person.photo) {
        creditDetailPhoto.src = person.photo;
        creditDetailPhoto.alt = person.name;
      } else {
        creditDetailPhoto.setAttribute("src", "");
        creditDetailPhoto.alt = "";
      }
      creditDetailDesc.textContent = person.desc || "Deskripsi belum ditambahkan.";

      creditsMenu.classList.remove("show");
      setTimeout(() => {
        creditsMenu.style.display = "none";
        creditDetailMenu.style.display = "block";
        setTimeout(() => creditDetailMenu.classList.add("show"), 20);
      }, 450);
    };
  });

  closeCreditDetail.onclick = () => {
    creditDetailMenu.classList.remove("show");
    setTimeout(() => {
      creditDetailMenu.style.display = "none";
      creditsMenu.style.display = "block";
      setTimeout(() => creditsMenu.classList.add("show"), 20);
    }, 450);
  };

  extraBtn.onclick = () => {
    settingsMenu.classList.remove("show");
    setTimeout(() => {
      settingsMenu.style.display = "none";
      extraMenu.style.display = "block";
      void extraMenu.offsetWidth;
      extraMenu.classList.add("show");
    }, 450);
  };
  closeExtra.onclick = () => {
    extraMenu.classList.remove("show");
    setTimeout(() => {
      extraMenu.style.display = "none";
      settingsMenu.style.display = "block";
      settingsMenu.classList.remove("show");
      void settingsMenu.offsetWidth;
      requestAnimationFrame(() => settingsMenu.classList.add("show"));
    }, 450);
  };

  limboToggle.onclick = () => {
    limboMode = !limboMode;
    limboToggle.classList.toggle("on", limboMode);
    if (!limboMode) {
      revealLimboText();
      pendingLimboStart = false;
      return;
    }
    if (phase === "answer" && !answersWrap.classList.contains("limbo-locked") && !answersWrap.classList.contains("limbo-shuffling")) {
      pendingLimboStart = true;
    }
  };

  darrelToggle.onclick = () => {
    useDarrelMode = !useDarrelMode;
    darrelToggle.classList.toggle("on", useDarrelMode);
    pendingQuestionReload = true;
  };

  optionBtn.onclick = () => {
    settingsMenu.classList.remove("show");
    setTimeout(() => {
      settingsMenu.style.display = "none";
      optionMenu.style.display = "block";
      void optionMenu.offsetWidth;
      optionMenu.classList.add("show");
    }, 450);
  };
  closeOption.onclick = () => {
    optionMenu.classList.remove("show");
    setTimeout(() => {
      optionMenu.style.display = "none";
      settingsMenu.style.display = "block";
      settingsMenu.classList.remove("show");
      void settingsMenu.offsetWidth;
      requestAnimationFrame(() => settingsMenu.classList.add("show"));
    }, 450);
  };

  function openSecret() {
    if (secretMenu.classList.contains("show")) return;
    settingsBtn.classList.add("disabled");
    wrapper.classList.add("screen-fade");
    setTimeout(() => {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      secretMenu.style.display = "block";
      setTimeout(() => secretMenu.classList.add("show"), 20);
    }, 450);
  }

  function closeSecretMenu() {
    secretMenu.classList.remove("show");
    setTimeout(() => {
      secretMenu.style.display = "none";
      wrapper.style.display = "flex";
      actionRow.style.display = "flex";
      settingsBtn.classList.remove("disabled");
      setTimeout(() => wrapper.classList.remove("screen-fade"), 20);
      current++;
      advanceOrFinish();
    }, 450);
  }
  closeSecret.onclick = closeSecretMenu;

  lockBtn.onclick = () => {
    const q = questions[current];
    if (!q) return;
    if (phase === "answer") {
      if (!selected || !selectedValue) return;
      phase = "next";
      const benar = q.correct.includes(selectedValue);
      if (limboMode) revealLimboText();
      answersWrap.querySelectorAll(".answer-btn").forEach(btn => {
        btn.classList.remove("pulse-correct", "pulse-wrong");
        if (q.correct.includes(btn.dataset.answer)) btn.classList.add("correct");
        if (btn === selected && !q.correct.includes(btn.dataset.answer)) btn.classList.add("wrong");
      });
      if (!useDarrelMode && secretReady && lastQuestionText === "Siapa yang buat ini?" && selectedValue === "Darrel") {
        answeredState[current] = { value: selectedValue, correct: benar, message: "Lanjut" };
        openSecret();
        return;
      }
      const message = benar
        ? (q.special || NEXT_TEXT[Math.floor(Math.random() * NEXT_TEXT.length)])
        : WRONG_TEXT[Math.floor(Math.random() * WRONG_TEXT.length)];
      answeredState[current] = { value: selectedValue, correct: benar, message };
      skipBtn.disabled = true;
      lockBtn.style.background = benar ? "#00c853" : "#ff3b3b";
      lockBtn.textContent = message;
    } else {
      current++;
      advanceOrFinish();
    }
  };

  // ===== Lewati (ganti soal tanpa kunci jawaban) =====
  skipBtn.onclick = () => {
    if (isLoading) return;
    if (isAnySubMenuOpen() || settingsOpen) return;
    if (phase !== "answer") return;
    if (limboMode) revealLimboText();
    current++;
    advanceOrFinish();
  };

  // ===== Kembali ke soal sebelumnya =====
  backBtn.onclick = () => {
    if (isLoading) return;
    if (isAnySubMenuOpen() || settingsOpen) return;
    if (current === 0) return;
    if (limboMode) revealLimboText();
    current--;
    loadQuestion();
  };




  // ===== Now Playing widget =====
  const npWidget = document.getElementById("nowPlaying");
  const npFill = document.getElementById("npFill");
  const npThumb = document.getElementById("npThumb");
  const npSeek = document.getElementById("npSeek");
  const npCur = document.getElementById("npCur");
  const npRem = document.getElementById("npRem");
  const npPlay = document.getElementById("npPlay");
  const npVol = document.getElementById("npVol");
  let npRaf = null;
  let npSeeking = false;
  let npMinimized = false;

  function npFormatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  // Tengah (50) = volume normal 0.7; kiri = lebih kecil (0=mute); kanan = lebih besar (100=1)
  function npVolFromSlider(v) {
    v = Math.max(0, Math.min(100, Number(v) || 0));
    if (v <= 50) return (v / 50) * 0.7;
    return 0.7 + ((v - 50) / 50) * 0.3;
  }

  function npUpdateVolTrack(v) {
    if (!npVol) return;
    const pct = Math.max(0, Math.min(100, Number(v) || 0));
    npVol.style.background = `linear-gradient(to right,
      rgba(255,255,255,0.55) 0%,
      rgba(255,255,255,0.55) ${pct}%,
      rgba(255,255,255,0.18) ${pct}%,
      rgba(255,255,255,0.18) 100%)`;
  }

  function npSetProgress(pct) {
    pct = Math.max(0, Math.min(100, pct));
    if (npFill) npFill.style.width = pct + "%";
    if (npThumb) npThumb.style.left = pct + "%";
    if (npSeek && !npSeeking) npSeek.value = Math.round(pct * 10); // 0-1000
  }

  function npGetAudio() {
    return document.getElementById("tidesAudio") || window._tidesAudio || null;
  }

  function npTick() {
    const el = npGetAudio();
    if (!el || npSeeking) {
      npRaf = requestAnimationFrame(npTick);
      return;
    }
    const dur = el.duration;
    const cur = el.currentTime || 0;
    if (isFinite(dur) && dur > 0) {
      const pct = (cur / dur) * 100;
      npSetProgress(pct);
      if (npCur) npCur.textContent = npFormatTime(cur);
      if (npRem) npRem.textContent = "-" + npFormatTime(Math.max(0, dur - cur));
    }
    // sync: playing → class is-playing (II), paused → ▶ saja
    if (npPlay) {
      npPlay.classList.toggle("is-playing", !el.paused);
    }
    npRaf = requestAnimationFrame(npTick);
  }

  function showNowPlaying() {
    if (!npWidget) return;
    npWidget.classList.add("show");
    npWidget.setAttribute("aria-hidden", "false");
    if (npRaf) cancelAnimationFrame(npRaf);
    npRaf = requestAnimationFrame(npTick);
    const el = npGetAudio();
    if (npVol) {
      const v = Number(npVol.value) || 50;
      npUpdateVolTrack(v);
      if (el) el.volume = npVolFromSlider(v);
    }
    if (npPlay) {
      npPlay.classList.toggle("is-playing", !!(el && !el.paused));
    }
  }

  function hideNowPlaying() {
    if (!npWidget) return;
    npWidget.classList.remove("show");
    npWidget.classList.remove("minimized");
    npMinimized = false;
    npWidget.setAttribute("aria-hidden", "true");
    if (npRaf) {
      cancelAnimationFrame(npRaf);
      npRaf = null;
    }
  }


  // Minimize / expand now playing
  const npMinBtn = document.getElementById("npMinBtn");

  function setNpMinimized(on) {
    npMinimized = !!on;
    if (!npWidget) return;
    if (npMinimized) {
      npWidget.classList.add("minimized");
    } else {
      npWidget.classList.remove("minimized");
    }
    if (npMinBtn) {
      npMinBtn.setAttribute("aria-label", npMinimized ? "Expand player" : "Minimize player");
      npMinBtn.title = npMinimized ? "Expand" : "Minimize";
    }
  }

  if (npMinBtn) {
    npMinBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setNpMinimized(!npMinimized);
    });
  }
  // Klik cover saat minimized = expand
  if (npWidget) {
    npWidget.addEventListener("click", (e) => {
      if (!npMinimized) return;
      if (e.target.closest("#npMinBtn")) return;
      setNpMinimized(false);
    });
  }

  if (npPlay) {
    npPlay.onclick = (e) => {
      e.stopPropagation();
      const el = npGetAudio();
      if (!el) return;
      if (el.paused) {
        el.play().then(() => {
          npPlay.classList.add("is-playing");
        }).catch(() => {});
      } else {
        el.pause();
        npPlay.classList.remove("is-playing");
      }
    };
  }

  let npSeekFadeTimer = null;
  let npSeekSavedVol = 0.7;
  let npWasPlayingBeforeSeek = false;

  function npFadeVol(el, from, to, ms, done) {
    if (!el) { if (done) done(); return; }
    const steps = Math.max(6, Math.floor(ms / 16));
    let i = 0;
    if (npSeekFadeTimer) clearInterval(npSeekFadeTimer);
    npSeekFadeTimer = setInterval(() => {
      i++;
      const t = i / steps;
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (i >= steps) {
        clearInterval(npSeekFadeTimer);
        npSeekFadeTimer = null;
        el.volume = to;
        if (done) done();
      }
    }, ms / steps);
  }

  if (npSeek) {
    npSeek.addEventListener("pointerdown", () => {
      npSeeking = true;
      const el = npGetAudio();
      if (!el) return;
      npWasPlayingBeforeSeek = !el.paused;
      npSeekSavedVol = el.volume;
      // fade out dulu biar seek tidak berderit
      npFadeVol(el, el.volume, 0, 90);
    });
    const finishSeek = () => {
      const el = npGetAudio();
      npSeeking = false;
      if (!el) return;
      // set posisi final dari slider
      if (isFinite(el.duration) && el.duration > 0) {
        const pct = Number(npSeek.value) / 10;
        try { el.currentTime = (pct / 100) * el.duration; } catch (e) {}
      }
      // fade in kembali
      const target = npSeekSavedVol > 0 ? npSeekSavedVol : npVolFromSlider(npVol ? npVol.value : 50);
      npFadeVol(el, 0, target, 140, () => {
        if (npWasPlayingBeforeSeek && el.paused) {
          el.play().catch(() => {});
        }
      });
    };
    npSeek.addEventListener("pointerup", finishSeek);
    npSeek.addEventListener("change", finishSeek);
    npSeek.addEventListener("input", () => {
      const el = npGetAudio();
      if (!el || !isFinite(el.duration) || el.duration <= 0) return;
      const pct = Number(npSeek.value) / 10; // 0-100
      npSetProgress(pct);
      // update label saja saat drag; currentTime di-set saat release (lebih bersih)
      const t = (pct / 100) * el.duration;
      if (npCur) npCur.textContent = npFormatTime(t);
      if (npRem) npRem.textContent = "-" + npFormatTime(Math.max(0, el.duration - t));
    });
  }

  if (npVol) {
    npVol.addEventListener("input", () => {
      const v = Number(npVol.value) || 0;
      npUpdateVolTrack(v);
      const el = npGetAudio();
      if (el) {
        el.muted = false;
        el.volume = npVolFromSlider(v);
      }
    });
    npUpdateVolTrack(npVol.value);
  }


  // ===== Hide UI button =====
  const hideBtn = document.getElementById("hideBtn");
  let uiHidden = false;
  let lastMenuBeforeHide = null; // "settings" | "credits" | "extra" | "option" | "bg" | "quiz" | null

  function getOpenMenuName() {
    if (settingsMenu && settingsMenu.classList.contains("show") && settingsMenu.style.display !== "none") return "settings";
    if (creditsMenu && creditsMenu.classList.contains("show")) return "credits";
    if (creditDetailMenu && creditDetailMenu.classList.contains("show")) return "creditDetail";
    if (extraMenu && extraMenu.classList.contains("show")) return "extra";
    if (optionMenu && optionMenu.classList.contains("show")) return "option";
    if (bgMenu && bgMenu.classList.contains("show")) return "bg";
    if (secretMenu && secretMenu.classList.contains("show")) return "secret";
    if (reviewMenu && reviewMenu.classList.contains("show")) return "review";
    if (endMenu && endMenu.classList.contains("show")) return "end";
    // quiz visible?
    if (wrapper && wrapper.style.display !== "none") return "quiz";
    return "quiz";
  }

  function showMenuByName(name) {
    const all = [
      settingsMenu, creditsMenu, creditDetailMenu, extraMenu,
      optionMenu, bgMenu, secretMenu, reviewMenu, skipWarnMenu, endMenu
    ];
    all.forEach(m => {
      if (!m) return;
      m.classList.remove("show");
      m.style.display = "none";
    });
    settingsOpen = false;

    if (name === "settings") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      settingsMenu.style.display = "block";
      void settingsMenu.offsetWidth;
      settingsMenu.classList.add("show");
      settingsOpen = true;
    } else if (name === "credits") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      creditsMenu.style.display = "block";
      void creditsMenu.offsetWidth;
      creditsMenu.classList.add("show");
    } else if (name === "creditDetail") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      creditDetailMenu.style.display = "block";
      void creditDetailMenu.offsetWidth;
      creditDetailMenu.classList.add("show");
    } else if (name === "extra") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      extraMenu.style.display = "block";
      void extraMenu.offsetWidth;
      extraMenu.classList.add("show");
    } else if (name === "option") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      optionMenu.style.display = "block";
      void optionMenu.offsetWidth;
      optionMenu.classList.add("show");
    } else if (name === "bg") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      bgMenu.style.display = "block";
      void bgMenu.offsetWidth;
      bgMenu.classList.add("show");
    } else if (name === "secret") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      secretMenu.style.display = "block";
      void secretMenu.offsetWidth;
      secretMenu.classList.add("show");
    } else if (name === "review") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      reviewMenu.style.display = "block";
      void reviewMenu.offsetWidth;
      reviewMenu.classList.add("show");
    } else if (name === "end") {
      wrapper.style.display = "none";
      actionRow.style.display = "none";
      endMenu.style.display = "block";
      void endMenu.offsetWidth;
      endMenu.classList.add("show");
    } else {
      // quiz
      wrapper.style.display = "flex";
      actionRow.style.display = "flex";
      wrapper.classList.remove("screen-fade");
      actionRow.classList.remove("screen-fade");
    }
  }

  function fadeOutAudio(el, duration = 600) {
    if (!el) return;
    const startVol = el.volume;
    const steps = 20;
    const stepTime = duration / steps;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      el.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) {
        clearInterval(timer);
        el.pause();
        try { el.currentTime = 0; } catch (e) {}
        el.volume = startVol || 0.7;
      }
    }, stepTime);
  }

  function setUiHidden(on) {
    if (on === uiHidden) return;

    if (on) {
      // Simpan menu terakhir sebelum hide
      lastMenuBeforeHide = getOpenMenuName();
      uiHidden = true;
      document.body.classList.add("ui-hidden");
      if (hideBtn) hideBtn.classList.add("ui-hidden");
      if (settingsBtn) settingsBtn.classList.add("settings-delayed-hide");
    } else {
      // Unhide: hide btn dulu kembali ke bawah, baru settings muncul
      uiHidden = false;
      document.body.classList.remove("ui-hidden");
      if (hideBtn) hideBtn.classList.remove("ui-hidden");

      // Kembalikan menu terakhir (bukan selalu quiz)
      const restore = lastMenuBeforeHide || "quiz";
      showMenuByName(restore);

      // Tunggu animasi hide-btn selesai (~450ms) baru fade in settings
      if (settingsBtn) {
        settingsBtn.classList.add("settings-delayed-hide");
        setTimeout(() => {
          settingsBtn.classList.remove("settings-delayed-hide");
        }, 480);
      }
    }
  }

  if (hideBtn) {
    hideBtn.onclick = (e) => {
      e.stopPropagation();
      setUiHidden(!uiHidden);
    };
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
      if (uiHidden) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }


  resetQuizData();
  renderQuestionInstant();

  // Smooth entrance animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wrapper.classList.remove("page-fade");
      actionRow.classList.remove("page-fade");

      setTimeout(() => {
        settingsBtn.classList.add("ready");
        if (hideBtn) hideBtn.classList.add("ready");
        const creditEl = document.querySelector(".credit");
        if (creditEl) creditEl.classList.add("ready");
      }, 40);
    });
  });
});
