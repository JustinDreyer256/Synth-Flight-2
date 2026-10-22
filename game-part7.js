function drawCorruptedBackgroundSun(theme, colorProgress) {
  if (colorProgress <= 0) return;
  const sunCX = W * 0.75;
  const sunCY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.25;
  const sunR = (PLAY_BOTTOM - PLAY_TOP) * 0.17;
  ctx.save();
  ctx.globalAlpha = colorProgress * 0.85;
  const sunGrad = ctx.createLinearGradient(0, sunCY - sunR, 0, sunCY + sunR);
  sunGrad.addColorStop(0, '#ffd23f');
  sunGrad.addColorStop(0.5, theme.phase3AccentA);
  sunGrad.addColorStop(1, theme.phase3AccentB);
  ctx.beginPath();
  ctx.arc(sunCX, sunCY, sunR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sunCX - sunR, sunCY - sunR, sunR * 2, sunR * 2);
  ctx.fillStyle = theme.phase3SkyTop;
  for (let i = 0; i < 5; i++) {
    const y = sunCY + sunR * 0.15 * i - 2;
    ctx.fillRect(sunCX - sunR, y, sunR * 2, 3 + i);
  }
  ctx.restore();
}

function drawCorruptedGlitchBlocks(theme, colorProgress) {
  if (colorProgress <= 0) return;
  ctx.save();
  const blocks = [
    { x: 0.03, y: 0.15, w: 60, h: 8 }, { x: 0.10, y: 0.15, w: 8, h: 40 },
    { x: 0.03, y: 0.30, w: 100, h: 5 }, { x: 0.15, y: 0.22, w: 5, h: 60 },
    { x: 0.06, y: 0.40, w: 40, h: 5 }, { x: 0.02, y: 0.45, w: 5, h: 25 },
    { x: 0.12, y: 0.10, w: 30, h: 5 }, { x: 0.08, y: 0.35, w: 5, h: 15 }
  ];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const flicker = Math.sin(frame * 0.15 + i * 2.3) > 0.1 ? 1 : 0.2;
    ctx.globalAlpha = colorProgress * flicker * 0.7;
    ctx.fillStyle = theme.phase3AccentA;
    ctx.shadowColor = theme.phase3AccentA;
    ctx.shadowBlur = 4;
    const bx = W * b.x, by = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * b.y;
    ctx.fillRect(bx, by, b.w, b.h);
  }
  ctx.restore();
}

function drawCorruptedSmoke(theme, colorProgress) {
  if (colorProgress <= 0) return;
  ctx.save();
  const wisps = [
    { x: 0.15, seed: 0 }, { x: 0.35, seed: 1.7 }, { x: 0.55, seed: 3.1 },
    { x: 0.75, seed: 4.5 }, { x: 0.9, seed: 5.8 }
  ];
  for (const w of wisps) {
    const baseX = W * w.x + Math.sin(frame * 0.008 + w.seed) * 20;
    const baseY = PLAY_BOTTOM;
    const height = (PLAY_BOTTOM - PLAY_TOP) * 0.35;
    const grad = ctx.createLinearGradient(baseX, baseY, baseX, baseY - height);
    grad.addColorStop(0, theme.phase3AccentA + '00');
    grad.addColorStop(0.3, theme.phase3AccentA + '40');
    grad.addColorStop(1, theme.phase3AccentA + '00');
    ctx.fillStyle = grad;
    ctx.globalAlpha = colorProgress * 0.6;
    ctx.beginPath();
    ctx.ellipse(baseX, baseY - height * 0.5, 25, height * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// true converging perspective grid for phase 3+, replacing the flat
// uniform grid -- horizontal lines use 1/depth spacing (classic
// perspective-floor trick: line at "depth" d sits at horizonY +
// groundHeight/d, which naturally bunches lines together near the
// horizon and spreads them out near the viewer) and vertical lines
// all converge to a single vanishing point at the horizon
// deterministic ember particle seeds -- generated once so particles
// stay consistent frame to frame rather than jittering randomly
const BOSS_ASH_EMBERS = (() => {
  const embers = [];
  for (let i = 0; i < 45; i++) {
    const seed = i * 12.9898;
    const pseudoRand = (n) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); };
    embers.push({
      xFrac: pseudoRand(seed),
      yFrac: pseudoRand(seed + 1),
      size: 1 + pseudoRand(seed + 2) * 2.5,
      brightness: 0.4 + pseudoRand(seed + 3) * 0.6,
      driftSpeed: 0.15 + pseudoRand(seed + 4) * 0.35,
      flickerSeed: pseudoRand(seed + 5) * 100,
      xDrift: (pseudoRand(seed + 6) - 0.5) * 0.3
    });
  }
  return embers;
})();

function drawVolcanicAshBackground(theme, progress) {
  if (progress <= 0) return;
  ctx.save();

  // darkening overlay for the hazy, dim atmosphere
  ctx.globalAlpha = progress * 0.55;
  ctx.fillStyle = bossAshGrayVariant ? '#0a0a0a' : '#0a0505';
  ctx.fillRect(0, PLAY_TOP, W, PLAY_BOTTOM - PLAY_TOP);

  // soft dark smoke blobs in the corners -- skipped for the gray
  // variant, whose reference shows a clean backdrop with no smoke
  if (!bossAshGrayVariant) {
    ctx.globalAlpha = progress * 0.4;
    const smokeSpots = [
      { x: W * 0.08, y: PLAY_TOP + 20, r: 90 },
      { x: W * 0.02, y: PLAY_TOP + 60, r: 60 },
      { x: W * 0.95, y: PLAY_BOTTOM - 30, r: 100 },
      { x: W * 0.88, y: PLAY_BOTTOM - 70, r: 65 }
    ];
    for (const s of smokeSpots) {
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      grad.addColorStop(0, 'rgba(40,35,35,0.8)');
      grad.addColorStop(1, 'rgba(40,35,35,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // glowing embers, drifting slowly upward and wrapping
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  for (const e of BOSS_ASH_EMBERS) {
    const riseOffset = ((frame * e.driftSpeed) % (playHeight + 40)) / playHeight;
    let y = PLAY_TOP + ((e.yFrac - riseOffset) % 1 + 1) % 1 * playHeight;
    const x = W * ((e.xFrac + Math.sin(frame * 0.01 + e.flickerSeed) * e.xDrift * 0.05 + 1) % 1);
    const flicker = 0.6 + 0.4 * Math.sin(frame * 0.08 + e.flickerSeed);
    ctx.globalAlpha = progress * e.brightness * flicker;
    ctx.fillStyle = '#ff5020';
    ctx.shadowColor = '#ff5020';
    ctx.shadowBlur = e.size * 2.5;
    ctx.beginPath();
    ctx.arc(x, y, e.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPerspectiveGrid(theme, colorProgress) {
  if (colorProgress <= 0) return;
  const horizonY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.58;
  const vanishX = W / 2;
  const groundHeight = PLAY_BOTTOM - horizonY;

  ctx.save();
  ctx.strokeStyle = theme.phase3AccentA;
  ctx.lineWidth = 1;

  // horizontal lines, slowly scrolling toward the viewer over time
  const scrollPhase = (frame * SCROLL_SPEED * (theme.scrollMult || 1) * 0.01) % 1;
  const numLines = 14;
  for (let i = 1; i <= numLines; i++) {
    const depth = i + scrollPhase;
    const y = horizonY + groundHeight / depth;
    if (y > PLAY_BOTTOM || y < horizonY) continue;
    const fadeIn = Math.min(1, (y - horizonY) / (groundHeight * 0.15));
    ctx.globalAlpha = colorProgress * fadeIn;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // vertical lines converging to the vanishing point, fanning out to
  // well beyond the visible width at the bottom edge
  ctx.globalAlpha = colorProgress * 0.8;
  const numVLines = 16;
  const spread = W * 2.2;
  for (let i = -numVLines; i <= numVLines; i++) {
    const bottomX = vanishX + (i / numVLines) * spread;
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(bottomX, PLAY_BOTTOM);
    ctx.stroke();
  }

  ctx.restore();
}

function drawSynthwaveScene(top, bottom) {
  const h = Math.max(1, bottom - top);
  const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;
  const skyGrad = ctx.createLinearGradient(0, top, 0, bottom);
  skyGrad.addColorStop(0, '#1a0836');
  skyGrad.addColorStop(0.42, '#2a1050');
  skyGrad.addColorStop(0.62, '#16082c');
  skyGrad.addColorStop(1, '#0e041c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, top, W, h);

  const sunCX = W * 0.5;
  const sunR = Math.min(W, h) * 0.27;
  const sunCY = top + h * 0.36;
  const horizonY = Math.min(bottom, sunCY + sunR * 0.98);
  const skyH = Math.max(1, horizonY - top);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, W, skyH);
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 78; i++) {
    const hx = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const hy = Math.sin(i * 39.346 + 11.135) * 23421.631;
    const hs = Math.sin(i * 7.13 + 4.2) * 9123.17;
    const fx = hx - Math.floor(hx);
    const fy = hy - Math.floor(hy);
    const fs = hs - Math.floor(hs);
    const sx = fx * W;
    const sy = top + fy * skyH;
    const ddx = sx - sunCX;
    const ddy = sy - sunCY;
    if (ddx * ddx + ddy * ddy < sunR * sunR * 1.08) continue;
    const twinkle = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(t * (0.9 + fs * 2.1) + i * 1.7));
    ctx.globalAlpha = (0.18 + fs * 0.55) * twinkle;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7 + fs * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  const bloomPulse = 0.94 + 0.08 * Math.sin(t * 0.55);
  const bloomR = sunR * 1.92 * bloomPulse;
  const bloom = ctx.createRadialGradient(sunCX, sunCY, sunR * 0.35, sunCX, sunCY, bloomR);
  bloom.addColorStop(0, 'rgba(255, 214, 120, 0.42)');
  bloom.addColorStop(0.28, 'rgba(255, 150, 120, 0.22)');
  bloom.addColorStop(0.55, 'rgba(255, 80, 160, 0.12)');
  bloom.addColorStop(0.78, 'rgba(140, 40, 180, 0.05)');
  bloom.addColorStop(1, 'rgba(40, 10, 60, 0)');
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(sunCX, sunCY, bloomR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const sunGrad = ctx.createLinearGradient(0, sunCY - sunR, 0, sunCY + sunR);
  sunGrad.addColorStop(0, '#ffe98a');
  sunGrad.addColorStop(0.38, '#ffcc5a');
  sunGrad.addColorStop(0.68, '#ff7a9a');
  sunGrad.addColorStop(1, '#ff3d9a');
  ctx.save();
  ctx.shadowColor = 'rgba(255, 170, 110, 0.7)';
  ctx.shadowBlur = sunR * (0.38 + 0.08 * Math.sin(t * 0.55));
  ctx.beginPath();
  ctx.arc(sunCX, sunCY, sunR, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(sunCX, sunCY, sunR, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#0a0418';
  const bandCount = 8;
  const bandStart = sunCY - sunR * 0.1;
  const bandSpan = sunR * 0.7;
  for (let i = 0; i < bandCount; i++) {
    const t = i / (bandCount - 1);
    const y = bandStart + t * bandSpan;
    const thickness = sunR * (0.014 + t * 0.028);
    ctx.fillRect(sunCX - sunR, y, sunR * 2, thickness);
  }
  ctx.restore();

  ctx.save();
  const vanishX = W / 2;
  const groundHeight = Math.max(1, bottom - horizonY);
  ctx.strokeStyle = '#ff4db8';
  ctx.lineWidth = 1.15;
  const scrollPhase = (t * 0.32) % 1;
  const numLines = 16;
  for (let i = 1; i <= numLines; i++) {
    const depth = i + scrollPhase;
    const y = horizonY + groundHeight / depth;
    if (y > bottom || y < horizonY) continue;
    const fadeIn = Math.min(1, (y - horizonY) / (groundHeight * 0.12));
    ctx.globalAlpha = 0.55 * fadeIn;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.5;
  const numVLines = 16;
  const spread = W * 2.4;
  for (let i = -numVLines; i <= numVLines; i++) {
    const bottomX = vanishX + (i / numVLines) * spread;
    ctx.beginPath();
    ctx.moveTo(vanishX, horizonY);
    ctx.lineTo(bottomX, bottom);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHomeBackground() {
  drawSynthwaveScene(0, H);
}

function drawMenuBackground() {
  drawSynthwaveScene(PLAY_TOP, PLAY_BOTTOM);
}

function drawInfernoHeatBackdrop(theme) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const floorGlow = ctx.createLinearGradient(0, PLAY_BOTTOM - playHeight * 0.28, 0, PLAY_BOTTOM);
  floorGlow.addColorStop(0, 'rgba(255, 40, 0, 0)');
  floorGlow.addColorStop(0.55, 'rgba(255, 70, 10, 0.10)');
  floorGlow.addColorStop(1, 'rgba(255, 140, 20, 0.22)');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, PLAY_BOTTOM - playHeight * 0.28, W, playHeight * 0.28);

  const roofGlow = ctx.createLinearGradient(0, PLAY_TOP, 0, PLAY_TOP + playHeight * 0.16);
  roofGlow.addColorStop(0, 'rgba(255, 80, 20, 0.14)');
  roofGlow.addColorStop(1, 'rgba(255, 40, 0, 0)');
  ctx.fillStyle = roofGlow;
  ctx.fillRect(0, PLAY_TOP, W, playHeight * 0.16);

  ctx.strokeStyle = 'rgba(255, 90, 20, 0.18)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < bgParticles.length; i++) {
    const p = bgParticles[i];
    ctx.beginPath();
    ctx.moveTo(p.x + (p.len || 12), p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}

function drawToxicWastelandBackdrop(theme) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const scroll = frame * 0.22;

  const sunX = W * 0.78;
  const sunY = PLAY_TOP + playHeight * 0.28;
  const sunR = playHeight * 0.34;
  const sun = ctx.createRadialGradient(sunX, sunY, sunR * 0.12, sunX, sunY, sunR);
  sun.addColorStop(0, 'rgba(210, 190, 70, 0.16)');
  sun.addColorStop(0.35, 'rgba(120, 130, 40, 0.08)');
  sun.addColorStop(1, 'rgba(40, 50, 10, 0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, PLAY_TOP, W, playHeight);
  ctx.clip();

  for (let i = 0; i < 3; i++) {
    const fy = PLAY_TOP + playHeight * (0.22 + i * 0.2);
    const fx = ((W * 0.45 * i - scroll * (0.4 + i * 0.12)) % (W + 320)) - 160;
    const haze = ctx.createRadialGradient(fx, fy, 0, fx, fy, 220);
    haze.addColorStop(0, `rgba(140, 150, 55, ${0.07 - i * 0.015})`);
    haze.addColorStop(1, 'rgba(40, 50, 15, 0)');
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.ellipse(fx, fy, 240, 36 + i * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(10, 16, 6, 0.38)';
  ctx.beginPath();
  ctx.moveTo(0, PLAY_BOTTOM);
  const hillScroll = (scroll * 0.45) % 90;
  for (let hx = -hillScroll; hx <= W + 90; hx += 18) {
    const hill = 28 + Math.sin(hx * 0.018 + 0.4) * 18 + Math.sin(hx * 0.05) * 8;
    ctx.lineTo(hx, PLAY_BOTTOM - hill);
  }
  ctx.lineTo(W, PLAY_BOTTOM);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(18, 28, 10, 0.55)';
  ctx.beginPath();
  ctx.moveTo(0, PLAY_BOTTOM);
  const bermStep = 48;
  const bermScroll = scroll % bermStep;
  for (let bx = -bermScroll; bx <= W + bermStep; bx += bermStep) {
    const hump = 16 + (Math.sin(bx * 0.035 + frame * 0.01) * 0.5 + 0.5) * 14;
    ctx.lineTo(bx, PLAY_BOTTOM - hump);
  }
  ctx.lineTo(W, PLAY_BOTTOM);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(22, 32, 12, 0.4)';
  ctx.beginPath();
  ctx.moveTo(0, PLAY_TOP);
  for (let tx = -((scroll * 0.6) % 40); tx <= W + 40; tx += 40) {
    const hang = 8 + Math.abs(Math.sin(tx * 0.08 + 1.2)) * 11;
    ctx.lineTo(tx, PLAY_TOP + hang);
  }
  ctx.lineTo(W, PLAY_TOP);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  for (let p of bgParticles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = '#6d7c38';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.r * (p.stretch || 1), p.r, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// Zone 1's decorative sun is the same orb that later becomes The Signal.
// At 900 m it glitches, shrinks, and leaves the sky so the last stretch
// of Synthwave plays without it -- purely visual, no gameplay change.
function getSynthwaveSunVanishT(theme) {
  if (!theme || theme.name !== 'SYNTHWAVE' || theme.isBossZone) return 0;
  const t = (distance - zoneStartDistance - SYNTHWAVE_SUN_VANISH_START) / SYNTHWAVE_SUN_VANISH_DURATION;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

function drawSynthwaveBackdropSun(theme) {
  const vanishT = getSynthwaveSunVanishT(theme);
  if (vanishT >= 1) return;

  const ease = vanishT * vanishT * (3 - 2 * vanishT);
  const playH = PLAY_BOTTOM - PLAY_TOP;
  const baseCX = W * 0.78;
  const baseCY = PLAY_TOP + playH * 0.32;
  const baseR = playH * 0.22;
  const jitter = vanishT > 0 ? Math.sin(frame * 0.55 + vanishT * 14) * ease * 7 : 0;
  const sunCX = baseCX + jitter;
  const sunCY = baseCY - ease * baseR * 0.42;
  const sunR = baseR * (1 - ease * 0.9);
  const alpha = 1 - Math.pow(ease, 1.25);
  if (sunR < 1 || alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (vanishT > 0 && vanishT < 0.62) {
    const bloomPulse = 0.28 * (1 - vanishT / 0.62);
    const bloom = ctx.createRadialGradient(sunCX, sunCY, sunR * 0.18, sunCX, sunCY, sunR * (1.75 + vanishT * 0.8));
    bloom.addColorStop(0, 'rgba(255, 210, 63, ' + bloomPulse + ')');
    bloom.addColorStop(0.45, 'rgba(255, 32, 121, ' + (bloomPulse * 0.45) + ')');
    bloom.addColorStop(1, 'rgba(15, 240, 252, 0)');
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.arc(sunCX, sunCY, sunR * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawSunBody = (cx, cy, bodyAlpha) => {
    ctx.save();
    ctx.globalAlpha = alpha * bodyAlpha;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
    ctx.clip();
    const sunGrad = ctx.createLinearGradient(0, cy - sunR, 0, cy + sunR);
    sunGrad.addColorStop(0, '#ffd23f');
    sunGrad.addColorStop(0.5, theme.accentA);
    sunGrad.addColorStop(1, theme.accentB);
    ctx.fillStyle = sunGrad;
    ctx.fillRect(cx - sunR, cy - sunR, sunR * 2, sunR * 2);
    ctx.fillStyle = theme.skyTop;
    const bandCount = 5 + Math.floor(ease * 8);
    const bandGap = sunR * (0.15 + ease * 0.08);
    for (let i = 0; i < bandCount; i++) {
      const y = cy + bandGap * i - sunR * 0.08 - ease * sunR * 0.2;
      ctx.fillRect(cx - sunR, y, sunR * 2, (3 + i) * (1 + ease * 2.4));
    }
    ctx.restore();
  };

  if (vanishT > 0.08 && vanishT < 0.88) {
    const split = ease * 10;
    drawSunBody(sunCX - split, sunCY, 0.28);
    drawSunBody(sunCX + split, sunCY + split * 0.25, 0.22);
  }
  drawSunBody(sunCX, sunCY, 1);

  if (vanishT > 0.2 && vanishT < 0.95) {
    ctx.globalAlpha = alpha * 0.55 * (1 - Math.abs(vanishT - 0.55) * 1.6);
    ctx.strokeStyle = theme.accentB;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sunCX, sunCY, sunR * (1.12 + vanishT * 0.8), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBackground(theme) {
  const colorProgress = theme.isBossZone ? getBossColorProgress() : 0;
  const phase5Progress = theme.isBossZone ? getPhase5BackgroundProgress() : 0;
  let effSkyTop = colorProgress > 0 ? lerpHexColor(theme.skyTop, theme.phase3SkyTop, colorProgress) : theme.skyTop;
  let effSkyMid = colorProgress > 0 ? lerpHexColor(theme.skyMid, theme.phase3SkyMid, colorProgress) : theme.skyMid;
  let effSkyBottom = colorProgress > 0 ? lerpHexColor(theme.skyBottom, theme.phase3SkyBottom, colorProgress) : theme.skyBottom;
  if (bossAshGrayVariant && phase5Progress > 0) {
    effSkyTop = lerpHexColor(effSkyTop, '#0e0e0e', phase5Progress);
    effSkyMid = lerpHexColor(effSkyMid, '#0a0a0a', phase5Progress);
    effSkyBottom = lerpHexColor(effSkyBottom, '#050505', phase5Progress);
  }
  const skyGrad = ctx.createLinearGradient(0, PLAY_TOP, 0, PLAY_BOTTOM);
  skyGrad.addColorStop(0, effSkyTop);
  skyGrad.addColorStop(0.55, effSkyMid);
  skyGrad.addColorStop(1, effSkyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, PLAY_TOP, W, PLAY_BOTTOM - PLAY_TOP);

  if (theme.isBossZone) {
    drawPerspectiveGrid(theme, colorProgress * (1 - phase5Progress));
    drawVolcanicAshBackground(theme, phase5Progress);
  }

  if (theme.bgStyle === 'grid') {
    if (!theme.isBossZone) {
      drawSynthwaveBackdropSun(theme);
    }

    // the perspective grid fully replaces this one in boss zones once
    // the transition begins -- skip rendering it entirely at that
    // point rather than paying its full stroke cost while it fades to
    // near-invisible, which was doubling grid-related draw calls
    // during the whole transition window
    if (!(theme.isBossZone && colorProgress > 0)) {
    ctx.save();
    ctx.strokeStyle = theme.accentA + '59';
    ctx.lineWidth = 1;
    ctx.globalAlpha = bossGridFadeEnabled ? 1 - colorProgress : 1;
    const gridSpacing = 40;
    const offset = (mobileRenderFrame() * SCROLL_SPEED * (theme.scrollMult || 1)) % gridSpacing;
    for (let x = -offset; x < W; x += gridSpacing) {
      const px = MOBILE_PERFORMANCE_MODE ? x + 0.5 : Math.round(x) + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, PLAY_TOP);
      ctx.lineTo(px, PLAY_BOTTOM);
      ctx.stroke();
    }
    for (let y = PLAY_TOP; y < PLAY_BOTTOM; y += gridSpacing) {
      const py = Math.round(y) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }
    ctx.restore();
    }
  } else if (theme.bgStyle === 'matrix') {
    drawGravityWellBackdrop(theme);
    const tints = [theme.accentA, theme.accentB, theme.wellAccent || '#e85cff'];
    for (let p of bgParticles) {
      const col = tints[p.tint] || theme.accentA;
      const grad = ctx.createLinearGradient(p.x, p.y - p.len, p.x, p.y);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, col);
      ctx.strokeStyle = grad;
      ctx.globalAlpha = p.alpha;
      ctx.lineWidth = p.tint === 2 ? 1.5 : 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.len);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'stars') {
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = theme.accentB;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'frozen') {
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#f7fbff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'embers') {
    drawInfernoHeatBackdrop(theme);
  } else if (theme.bgStyle === 'ruins') {
    const playHeight = PLAY_BOTTOM - PLAY_TOP;

    // stone block wall texture behind everything
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    const blockW = 70, blockH = 38;
    const rowOffset = (frame * 0.6) % blockW;
    let row = 0;
    for (let by = PLAY_TOP; by < PLAY_BOTTOM; by += blockH) {
      const stagger = (row % 2 === 0) ? 0 : blockW / 2;
      for (let bx = -rowOffset - blockW + stagger; bx < W + blockW; bx += blockW) {
        ctx.strokeRect(bx, by, blockW, blockH);
      }
      row++;
    }

    // fluted stone pillars, solid and clearly load-bearing
    const pillarSpacing = 220;
    const pillarWidth = 50;
    const pillarOffset = (frame * 0.6) % pillarSpacing;
    for (let px = -pillarOffset; px < W + pillarSpacing; px += pillarSpacing) {
      const pgrad = ctx.createLinearGradient(px, 0, px + pillarWidth, 0);
      pgrad.addColorStop(0, 'rgba(8,14,20,0.9)');
      pgrad.addColorStop(0.5, 'rgba(30,45,55,0.9)');
      pgrad.addColorStop(1, 'rgba(8,14,20,0.9)');
      ctx.fillStyle = pgrad;
      ctx.fillRect(px, PLAY_TOP, pillarWidth, playHeight);

      // vertical fluting grooves
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1.5;
      for (let fx = px + 8; fx < px + pillarWidth; fx += 9) {
        ctx.beginPath();
        ctx.moveTo(fx, PLAY_TOP + 16);
        ctx.lineTo(fx, PLAY_BOTTOM - 16);
        ctx.stroke();
      }

      // capital and base
      ctx.fillStyle = 'rgba(15,25,32,0.95)';
      ctx.fillRect(px - 8, PLAY_TOP, pillarWidth + 16, 16);
      ctx.fillRect(px - 8, PLAY_BOTTOM - 16, pillarWidth + 16, 16);

      // torch brazier glow mounted on the pillar
      const torchY = PLAY_TOP + playHeight * 0.28;
      const flicker = 0.7 + 0.3 * Math.sin(frame * 0.15 + px * 0.1);
      const tgrad = ctx.createRadialGradient(px + pillarWidth / 2, torchY, 0, px + pillarWidth / 2, torchY, 34);
      tgrad.addColorStop(0, `rgba(120,220,255,${0.55 * flicker})`);
      tgrad.addColorStop(1, 'rgba(120,220,255,0)');
      ctx.fillStyle = tgrad;
      ctx.beginPath();
      ctx.arc(px + pillarWidth / 2, torchY, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.accentA;
      ctx.beginPath();
      ctx.arc(px + pillarWidth / 2, torchY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // soft drifting dust in the torchlight (kept subtle, not star-like)
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha * 0.5;
      ctx.fillStyle = theme.accentB;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'toxic') {
    drawToxicWastelandBackdrop(theme);
  } else if (theme.bgStyle === 'station') {
    const playHeight = PLAY_BOTTOM - PLAY_TOP;

    // structural hull panel grid
    ctx.strokeStyle = 'rgba(94,200,232,0.08)';
    ctx.lineWidth = 1;
    const panelW = 90, panelH = 70;
    const offX = (frame * 0.4) % panelW;
    for (let px = -offX; px < W + panelW; px += panelW) {
      ctx.beginPath();
      ctx.moveTo(px, PLAY_TOP);
      ctx.lineTo(px, PLAY_BOTTOM);
      ctx.stroke();
    }
    for (let py = PLAY_TOP; py < PLAY_BOTTOM; py += panelH) {
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.stroke();
    }

    // hull-breach windows showing distant starfield, spaced along the wall
    const winSpacing = 260;
    const winOffset = (frame * 0.6) % winSpacing;
    for (let wx = -winOffset; wx < W + winSpacing; wx += winSpacing) {
      const wy = PLAY_TOP + playHeight * 0.5;
      ctx.fillStyle = 'rgba(2,4,8,0.6)';
      ctx.beginPath();
      ctx.ellipse(wx, wy, 26, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(94,200,232,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      // tiny stars inside the window
      for (let s = 0; s < 5; s++) {
        const sx = wx + (Math.sin(s * 7.1) * 16);
        const sy = wy + (Math.cos(s * 5.3) * 26);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }
    }

    // flickering emergency light strips along the top/bottom edges
    const lightSpacing = 140;
    const lightOffset = (frame * 0.5) % lightSpacing;
    for (let lx = -lightOffset; lx < W + lightSpacing; lx += lightSpacing) {
      const flicker = 0.4 + 0.4 * Math.max(0, Math.sin(frame * 0.08 + lx * 0.3));
      ctx.fillStyle = theme.accentB;
      ctx.globalAlpha = flicker * 0.5;
      ctx.fillRect(lx, PLAY_TOP + 2, 24, 3);
      ctx.fillRect(lx + 40, PLAY_BOTTOM - 5, 24, 3);
    }
    ctx.globalAlpha = 1;

    // drifting metal dust
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = theme.accentA;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'void') {
    // deliberately sparse -- almost nothing but a few faint distant stars,
    // letting the black holes dominate an otherwise empty, dark scene
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = theme.accentA;
      ctx.fillRect(p.x, p.y, p.r, p.r);
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'storm') {
    // deterministic lightning: a brief flash on a fixed schedule, not random
    const flashCycle = 210;
    const flashT = frame % flashCycle;
    if (flashT < 6) {
      const flashAlpha = (1 - flashT / 6) * 0.35;
      ctx.fillStyle = `rgba(230,230,255,${flashAlpha})`;
      ctx.fillRect(0, PLAY_TOP, W, PLAY_BOTTOM - PLAY_TOP);
    }
    // cloud bands
    ctx.fillStyle = 'rgba(20,22,40,0.4)';
    for (let i = 0; i < 4; i++) {
      const cy = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * (0.1 + i * 0.22);
      const cx = (W * 0.3 * i - frame * 0.3) % (W + 300) - 150;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 180, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // rain streaks
    for (let p of bgParticles) {
      const grad = ctx.createLinearGradient(p.x, p.y - p.len, p.x, p.y);
      grad.addColorStop(0, 'rgba(200,210,255,0)');
      grad.addColorStop(1, theme.accentB);
      ctx.strokeStyle = grad;
      ctx.globalAlpha = p.alpha;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.len);
      ctx.lineTo(p.x - p.len * 0.35, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawDiamondGate(g, theme) {
  const { radius, centerX, centerY } = diamondGeometry(g);
  if (radius <= 2) return;

  ctx.save();
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 16;

  const grad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  grad.addColorStop(0, theme.accentA);
  grad.addColorStop(1, theme.accentB);
  ctx.fillStyle = grad;

  // filled bounding square with a diamond-shaped hole (evenodd rule) = the solid frame
  ctx.beginPath();
  ctx.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX + radius, centerY);
  ctx.lineTo(centerX, centerY + radius);
  ctx.lineTo(centerX - radius, centerY);
  ctx.closePath();
  ctx.fill('evenodd');

  // bright diamond outline to sell the "frame" edge
  ctx.shadowBlur = 20;
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius);
  ctx.lineTo(centerX + radius, centerY);
  ctx.lineTo(centerX, centerY + radius);
  ctx.lineTo(centerX - radius, centerY);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawOrbiter(g, theme) {
  const pos = liveOrbiterPos(g);
  ctx.save();

  // planet sphere with simple shading for a rounded look
  ctx.shadowColor = g.color;
  ctx.shadowBlur = 10;
  const grad = ctx.createRadialGradient(pos.x - g.r * 0.35, pos.y - g.r * 0.35, g.r * 0.1, pos.x, pos.y, g.r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, g.color);
  grad.addColorStop(1, '#1a1220');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, g.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSupernovaPlanet(g, theme) {
  if (g.detonated) {
    drawSupernovaFlash(g, theme);
    return;
  }
  const warning = supernovaIsWarning(g);
  const warningT = warning ? (supernovaPhaseElapsed(g) - supernovaEffectiveDormant(g)) / g.warningFrames : 0;

  ctx.save();
  ctx.translate(g.x, g.y);

  // base sphere: smooth blended amber/rust gradient (vertical, since gas
  // giant bands run horizontally across latitude)
  const grad = ctx.createLinearGradient(0, -g.planetR, 0, g.planetR);
  grad.addColorStop(0, '#e8c48c');
  grad.addColorStop(0.2, '#c98a4a');
  grad.addColorStop(0.38, '#8a4a28');
  grad.addColorStop(0.5, '#e0b878');
  grad.addColorStop(0.65, '#7a3a20');
  grad.addColorStop(0.8, '#c07838');
  grad.addColorStop(1, '#5a2c16');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, g.planetR, 0, Math.PI * 2);
  ctx.fill();

  // subtle soft wave texture on top -- gentle marbled turbulence without
  // hard band edges. phase drifts slowly over time to suggest the planet
  // rotating, since the waves themselves must stay horizontal (a full
  // rotate() would tilt them, which isn't how gas giant bands behave)
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, g.planetR, 0, Math.PI * 2);
  ctx.clip();
  const phase = frame * 0.006 + g.rotSeed;
  const xSpan = g.planetR * 1.15;
  const waveCount = 5;
  for (let i = 0; i < waveCount; i++) {
    const yBase = -g.planetR + (i + 0.5) * ((g.planetR * 2) / waveCount);
    ctx.beginPath();
    const segments = 18;
    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      const x = -xSpan + t * xSpan * 2;
      const wobble = Math.sin(t * Math.PI * 2.5 + phase + i * 1.1) * g.planetR * 0.06;
      const y = yBase + wobble;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,230,190,0.12)' : 'rgba(60,25,10,0.15)';
    ctx.lineWidth = g.planetR * 0.18;
    ctx.stroke();
  }
  // storm-spot features that visibly orbit around the vertical axis --
  // this is what actually sells the "spinning" illusion, since a subtle
  // texture drift alone barely reads as rotation. each spot's screen x
  // position and squash factor are driven by its longitude angle, so it
  // slides across, foreshortens near the limb, and disappears around the
  // back exactly like a feature on a real rotating sphere would
  const spotDefs = [
    { latFrac: -0.35, speed: 1.3, size: 0.22, color: 'rgba(60,25,10,0.4)' },
    { latFrac: 0.15, speed: 1.3, size: 0.16, color: 'rgba(255,225,180,0.35)' },
    { latFrac: 0.55, speed: 1.3, size: 0.19, color: 'rgba(50,20,8,0.35)' }
  ];
  spotDefs.forEach((spot, i) => {
    const spotAngle = phase * spot.speed + i * (Math.PI * 2 / 3) + g.rotSeed;
    const cosA = Math.cos(spotAngle);
    if (cosA > -0.15) {
      const spotX = Math.sin(spotAngle) * g.planetR * 0.82;
      const spotY = spot.latFrac * g.planetR;
      const squash = Math.max(0.15, cosA);
      const fadeAlpha = Math.min(1, (cosA + 0.15) / 0.3);
      ctx.save();
      ctx.translate(spotX, spotY);
      ctx.scale(squash, 1);
      ctx.globalAlpha = fadeAlpha;
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, g.planetR * spot.size, g.planetR * spot.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
  ctx.globalAlpha = 1;

  // relight with the same falloff as the base sphere so the 3D illusion
  // stays consistent
  const relight = ctx.createRadialGradient(-g.planetR * 0.35, -g.planetR * 0.35, g.planetR * 0.1, 0, 0, g.planetR);
  relight.addColorStop(0, 'rgba(255,240,220,0.18)');
  relight.addColorStop(0.55, 'rgba(0,0,0,0)');
  relight.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = relight;
  ctx.beginPath();
  ctx.arc(0, 0, g.planetR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // fault-line cracks, glowing brighter and pulsing faster as detonation
  // approaches -- the destabilization telegraph
  const crackIntensity = warning ? (0.3 + 0.7 * warningT) : 0.15;
  const crackPulseSpeed = warning ? 0.4 : 0.05;
  const crackPulse = 0.5 + 0.5 * Math.sin(frame * crackPulseSpeed);
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, g.planetR, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = theme.accentB;
  ctx.globalAlpha = crackIntensity * crackPulse;
  ctx.lineWidth = 2 + (warning ? warningT * 2 : 0);
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = warning ? 10 * warningT : 3;
  const crackPaths = [
    [[-0.6, -0.5], [0, 0], [0.5, 0.3], [0.7, 0.8]],
    [[0.6, -0.6], [0.1, -0.1], [-0.3, 0.4], [-0.7, 0.7]],
    [[0, -0.9], [0, -0.2], [0.3, 0.2], [0.2, 0.8]]
  ];
  for (const path of crackPaths) {
    ctx.beginPath();
    path.forEach(([px, py], i) => {
      const x = px * g.planetR, y = py * g.planetR;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // atmospheric rim glow
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.4;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, g.planetR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawSupernovaFlash(g, theme) {
  const t = Math.min(1, (frame - g.detonationFrame) / 20);
  ctx.save();
  ctx.translate(g.x, g.y);
  const flashR = g.planetR * (1 + t * 2);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, flashR);
  grad.addColorStop(0, `rgba(255,255,255,${1 - t})`);
  grad.addColorStop(0.4, `rgba(255,220,150,${(1 - t) * 0.6})`);
  grad.addColorStop(1, 'rgba(255,180,100,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, flashR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSupernovaDebris(g, theme) {
  const pos = liveProjectilePos(g);
  ctx.save();
  ctx.shadowColor = '#ff8844';
  ctx.shadowBlur = 10;
  const grad = ctx.createRadialGradient(pos.x - g.r * 0.3, pos.y - g.r * 0.3, g.r * 0.1, pos.x, pos.y, g.r);
  grad.addColorStop(0, '#fff3c4');
  grad.addColorStop(0.5, '#e8703a');
  grad.addColorStop(1, '#3a1a10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, g.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLensingZone(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);

  // concentric rippling distortion rings, like heat-haze or water ripples
  const ringCount = 5;
  for (let i = 1; i <= ringCount; i++) {
    const baseR = (g.zoneRadius / ringCount) * i;
    const wobbleAmt = 6 + i * 1.5;
    const phase = frame * 0.02 + g.rotSeed + i * 0.8;
    ctx.beginPath();
    const segments = 40;
    for (let s = 0; s <= segments; s++) {
      const ang = (s / segments) * Math.PI * 2;
      const wobble = Math.sin(ang * 4 + phase) * wobbleAmt * (i / ringCount);
      const r = baseR + wobble;
      const px = Math.cos(ang) * r, py = Math.sin(ang) * r;
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = theme.accentA;
    ctx.globalAlpha = 0.12 * (1 - i / (ringCount + 2));
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // subtle rotating swirl streaks
  ctx.save();
  ctx.rotate(frame * 0.008 + g.rotSeed);
  for (let i = 0; i < 3; i++) {
    const swirlAngle = (i / 3) * Math.PI * 2;
    ctx.strokeStyle = theme.accentB;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let s = 0; s <= 20; s++) {
      const t = s / 20;
      const ang = swirlAngle + t * Math.PI * 1.5;
      const r = t * g.zoneRadius * 0.85;
      ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // small lethal core, partially camouflaged in the shimmer -- genuinely
  // findable (pulses toward full brightness periodically), just easy to
  // overlook amid the surrounding visual noise
  const corePulse = 0.5 + 0.5 * Math.sin(frame * 0.15 + g.rotSeed);
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 6 + 4 * corePulse;
  ctx.fillStyle = theme.accentA;
  ctx.globalAlpha = 0.55 + 0.25 * corePulse;
  ctx.beginPath();
  ctx.arc(0, 0, g.coreR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// telegraph: a growing preview line at the locked height, plus a
// building charge glow and converging sparks at the boss itself
function drawBossChargeBeamTelegraph(g, theme) {
  const elapsed = frame - g.spawnFrame;
  const progress = Math.min(1, elapsed / g.warningFrames);
  ctx.save();
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.3);
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 2 + progress * 3;
  ctx.globalAlpha = (0.15 + progress * 0.5) * pulse;
  ctx.shadowColor = '#ff6020';
  ctx.shadowBlur = 6 + progress * 10;
  ctx.beginPath();
  ctx.moveTo(boss ? boss.x : 0, g.lockedY);
  ctx.lineTo(0, g.lockedY);
  ctx.stroke();

  if (boss) {
    ctx.globalAlpha = progress * 0.7;
    ctx.fillStyle = '#fff5cc';
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 15 * progress;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, boss.maxR * 0.25 * progress, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const ang = i * 1.047 + frame * 0.04;
      const dist = boss.maxR * (1.5 - progress * 0.8);
      const sx = boss.x + Math.cos(ang) * dist, sy = boss.y + Math.sin(ang) * dist;
      ctx.globalAlpha = progress * 0.6;
      ctx.fillStyle = '#ffd23f';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// fired beam: layered glow, mid orange body, and a flickering
// white-hot core, spanning the full width at the locked height
function drawBossChargeBeam(g, theme) {
  const elapsed = frame - g.spawnFrame;
  const progress = elapsed / (g.fireDuration || BOSS_CHARGE_BEAM_FIRE_DURATION);
  const fadeOut = progress > 0.8 ? Math.max(0, 1 - (progress - 0.8) / 0.2) : 1;
  const beamThickness = g.thickness || BOSS_CHARGE_BEAM_THICKNESS;
  ctx.save();

  ctx.strokeStyle = '#ff2010';
  ctx.lineWidth = beamThickness;
  ctx.shadowColor = '#ff2010';
  ctx.shadowBlur = 25;
  ctx.globalAlpha = fadeOut * 0.5;
  ctx.beginPath();
  ctx.moveTo(boss ? boss.x : 0, g.lockedY);
  ctx.lineTo(0, g.lockedY);
  ctx.stroke();

  ctx.strokeStyle = '#ff8020';
  ctx.lineWidth = beamThickness * 0.55;
  ctx.shadowBlur = 0;
  ctx.globalAlpha = fadeOut * 0.8;
  ctx.beginPath();
  ctx.moveTo(boss ? boss.x : 0, g.lockedY);
  ctx.lineTo(0, g.lockedY);
  ctx.stroke();

  const flicker = 0.85 + 0.15 * Math.sin(frame * 0.8);
  ctx.strokeStyle = '#fff5cc';
  ctx.lineWidth = beamThickness * 0.2 * flicker;
  ctx.globalAlpha = fadeOut;
  ctx.beginPath();
  ctx.moveTo(boss ? boss.x : 0, g.lockedY);
  ctx.lineTo(0, g.lockedY);
  ctx.stroke();

  ctx.restore();
}

function drawBossAshCloud(g, theme) {
  ctx.save();
  const puffs = [
    { dx: 0, dy: 0, r: g.r },
    { dx: -g.r * 0.5, dy: g.r * 0.2, r: g.r * 0.65 },
    { dx: g.r * 0.45, dy: -g.r * 0.15, r: g.r * 0.6 },
    { dx: g.r * 0.1, dy: g.r * 0.35, r: g.r * 0.5 }
  ];
  for (const p of puffs) {
    const cx = g.x + p.dx, cy = g.y + p.dy;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.r);
    grad.addColorStop(0, 'rgba(50,48,50,0.55)');
    grad.addColorStop(1, 'rgba(50,48,50,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBossEmber(g, theme) {
  ctx.save();
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.3 + g.rotSeed);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ff5020';
  ctx.shadowColor = '#ff5020';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff5cc';
  ctx.globalAlpha = pulse * 0.8;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBossVolleyTelegraph(g, theme) {
  if (!boss) return;
  const elapsed = frame - g.spawnFrame;
  const progress = Math.min(1, elapsed / g.warningFrames);

  ctx.save();
  ctx.strokeStyle = '#ff3050';
  ctx.lineWidth = 2 + 3 * progress;
  ctx.globalAlpha = 0.3 + 0.5 * progress;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(boss.x, boss.y);
  ctx.lineTo(ship.x, ship.y);
  ctx.stroke();
  ctx.setLineDash([]);

  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.4);
  ctx.fillStyle = '#ff3050';
  ctx.globalAlpha = progress;
  ctx.beginPath();
  ctx.arc(boss.x, boss.y, 8 + 4 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBossRagePulse(g, theme) {
  const liveR = liveRagePulseRadius(g);
  if (liveR <= 0) return;
  ctx.save();
  const alpha = Math.max(0, 1 - (liveR / BOSS_RAGE_PULSE_MAX_R) * 0.8);

  const vRadius = BOSS_RAGE_PULSE_THICKNESS / 2;
  const ringColors = ['#fff5cc', '#ffd23f', '#ffb020', theme.phase3AccentA, '#a01000'];

  // one continuous ring, centered on wherever the boss was at the
  // exact moment it originated, growing outward as a whole (like the
  // reference image's ring bursting outward) -- starts tight around
  // that origin point and expands horizontally in both directions,
  // without tracking any further boss movement afterward. the
  // outermost band is the brightest, reading clearly as the true
  // collision edge without needing a separate straight-line marker
  // that broke the ring's silhouette
  for (let i = 0; i < ringColors.length; i++) {
    const hRadius = Math.max(0, liveR - i * 9);
    const vR = vRadius * (1 - i * 0.12);
    ctx.strokeStyle = ringColors[i];
    ctx.lineWidth = i === 0 ? 5 : 3 + (ringColors.length - i);
    ctx.globalAlpha = alpha * (i === 0 ? 0.95 : 0.7 - i * 0.09);
    ctx.shadowColor = ringColors[i];
    ctx.shadowBlur = i === 0 ? 18 : 10;
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, hRadius, vR, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBossDiagonalRings(g, theme) {
  const liveR = liveDiagonalRingRadius(g);
  if (liveR <= 0) return;
  ctx.save();
  const alpha = Math.max(0, 1 - (liveR / BOSS_DIAGONAL_RING_MAX_R) * 0.8);
  const vRadius = BOSS_DIAGONAL_RING_THICKNESS / 2;
  const ringColors = ['#e0faff', '#4fd3ff', '#1a9fe0', '#0a5fb0', '#052a60'];
  const angle = Math.atan(BOSS_DIAGONAL_RING_SLOPE);

  // two rings, tilted at opposite angles, crossing in an X -- same
  // nested-ellipse technique as the phase 3 ring, distinct cool
  // blue palette to read as a different attack
  for (const rotSign of [1, -1]) {
    for (let i = 0; i < ringColors.length; i++) {
      const hRadius = Math.max(0, liveR - i * 9);
      const vR = vRadius * (1 - i * 0.12);
      ctx.strokeStyle = ringColors[i];
      ctx.lineWidth = i === 0 ? 5 : 3 + (ringColors.length - i);
      ctx.globalAlpha = alpha * (i === 0 ? 0.95 : 0.7 - i * 0.09);
      ctx.shadowColor = ringColors[i];
      ctx.shadowBlur = i === 0 ? 18 : 10;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, hRadius, vR, rotSign * angle, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawBossAttack(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(0, 0, g.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawBoomerang(g, theme) {
  const pos = liveBoomerangPos(g);
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(frame * 0.3);

  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 10;
  ctx.fillStyle = theme.accentB;
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;

  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, g.r * 1.6, g.r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawPulsingOrb(g, theme) {
  const liveR = livePulsingOrbRadius(g);
  ctx.save();
  ctx.translate(g.x, g.y);

  const grad = ctx.createRadialGradient(-liveR * 0.3, -liveR * 0.3, liveR * 0.1, 0, 0, liveR);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, theme.accentA);
  grad.addColorStop(1, theme.accentB);
  ctx.fillStyle = grad;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, liveR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(0, 0, liveR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawEchoTrail(g, theme) {
  ctx.save();

  const zoneLeft = g.x - g.zoneWidth / 2;
  const zoneRight = g.x + g.zoneWidth / 2;

  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 8;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(zoneLeft, PLAY_TOP);
  ctx.lineTo(zoneLeft, PLAY_BOTTOM);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(zoneRight, PLAY_TOP);
  ctx.lineTo(zoneRight, PLAY_BOTTOM);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  if (Math.abs(ship.x - g.x) < g.zoneWidth / 2) {
    const histIdx = shipYHistory.length - 1 - g.delayFrames;
    if (histIdx >= 0) {
      const historicalY = shipYHistory[histIdx];
      const dist = Math.abs(ship.y - historicalY);
      const danger = dist < g.dangerThreshold * 2;

      ctx.save();
      ctx.translate(ship.x, historicalY);
      ctx.globalAlpha = danger ? 0.7 : 0.35;
      ctx.fillStyle = danger ? '#ff3050' : theme.accentB;
      ctx.shadowColor = danger ? '#ff3050' : theme.accentB;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-10, -9);
      ctx.lineTo(-10, 9);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  const labelPulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + g.rotSeed);
  ctx.fillStyle = theme.accentA;
  ctx.globalAlpha = labelPulse;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ECHO', g.x, PLAY_TOP + 20);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawEmp(g, theme) {
  ctx.save();
  const elapsed = empPhaseElapsed(g);
  const discharging = empIsDischarging(g);
  const chargeProgress = Math.min(1, elapsed / g.chargeFrames);

  const anchorY = g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM;
  const regionTop = g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM - g.reachDepth;
  const regionBottom = g.anchor === 'top' ? PLAY_TOP + g.reachDepth : PLAY_BOTTOM;

  if (discharging) {
    const dischargeElapsed = elapsed - g.chargeFrames;
    const dischargeProgress = dischargeElapsed / g.dischargeFrames;
    const flashAlpha = Math.sin(dischargeProgress * Math.PI) * 0.6;
    ctx.fillStyle = theme.accentA;
    ctx.globalAlpha = flashAlpha;
    ctx.fillRect(g.x - 30, regionTop, 60, regionBottom - regionTop);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 5; i++) {
      const jag = (i - 2) * 12;
      ctx.beginPath();
      ctx.moveTo(g.x + jag, regionTop);
      ctx.lineTo(g.x + jag + Math.sin(frame * 0.5 + i) * 8, regionBottom);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (elapsed < g.chargeFrames) {
    const intensity = chargeProgress;
    const sparkCount = Math.floor(3 + intensity * 5);
    for (let i = 0; i < sparkCount; i++) {
      const sparkPhase = frame * 0.3 + i * 1.7;
      if (Math.sin(sparkPhase) > (1 - intensity * 0.6)) {
        const sx = g.x + Math.sin(i * 2.3) * 25;
        const sy = anchorY + (g.anchor === 'top' ? 1 : -1) * (10 + Math.abs(Math.sin(sparkPhase * 2)) * 40 * intensity);
        ctx.strokeStyle = theme.accentB;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(g.x, anchorY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    const pulse = 0.4 + 0.3 * intensity * (0.5 + 0.5 * Math.sin(frame * 0.2));
    ctx.shadowColor = theme.accentB;
    ctx.shadowBlur = 6 + 10 * intensity;
    ctx.fillStyle = theme.accentB;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(g.x, anchorY, 8 + 4 * intensity, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawSignalCorruption(g, theme) {
  ctx.save();

  const zoneLeft = g.x - g.zoneWidth / 2;
  const zoneRight = g.x + g.zoneWidth / 2;

  // clear glowing boundary lines marking exactly where the effect
  // starts and stops -- fairness requires this to be unambiguous
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 8;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(zoneLeft, PLAY_TOP);
  ctx.lineTo(zoneLeft, PLAY_BOTTOM);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(zoneRight, PLAY_TOP);
  ctx.lineTo(zoneRight, PLAY_BOTTOM);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // full-height glitch texture filling the whole zone
  ctx.save();
  ctx.beginPath();
  ctx.rect(zoneLeft, PLAY_TOP, g.zoneWidth, PLAY_BOTTOM - PLAY_TOP);
  ctx.clip();

  const bandCount = 12;
  for (let i = 0; i < bandCount; i++) {
    const bandY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / bandCount * i + 10;
    const jitter = Math.sin(frame * 0.3 + g.rotSeed + i * 1.7) * 15;
    ctx.strokeStyle = i % 2 === 0 ? theme.accentA : theme.accentB;
    ctx.globalAlpha = 0.12 + 0.08 * Math.abs(Math.sin(frame * 0.15 + i));
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zoneLeft + jitter, bandY);
    ctx.lineTo(zoneRight + jitter, bandY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const blockCount = 8;
  for (let i = 0; i < blockCount; i++) {
    const flickerPhase = (frame * 0.05 + g.rotSeed + i * 1.3) % (Math.PI * 2);
    if (Math.sin(flickerPhase * 2.5) > 0.2) {
      const bx = zoneLeft + (g.zoneWidth / blockCount) * i + (g.zoneWidth / blockCount) * 0.5;
      const by = PLAY_TOP + ((i * 137) % (PLAY_BOTTOM - PLAY_TOP));
      const bw = 20 + (i % 3) * 10, bh = 5 + (i % 2) * 4;
      ctx.fillStyle = i % 2 === 0 ? theme.accentA : theme.accentB;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // explicit label so the control inversion is never ambiguous
  const labelPulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + g.rotSeed);
  ctx.fillStyle = theme.accentB;
  ctx.globalAlpha = labelPulse;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('\u21C5 INVERTED', g.x, PLAY_TOP + 20);
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawLaserGrid(g, theme) {
  ctx.save();
  const pulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + g.rotSeed);
  for (const seg of g.segments) {
    let x1, y1, x2, y2;
    if (seg.type === 'h') {
      x1 = g.x + seg.xRel1; y1 = seg.y; x2 = g.x + seg.xRel2; y2 = seg.y;
    } else {
      x1 = g.x + seg.xRel; y1 = seg.y1; x2 = g.x + seg.xRel; y2 = seg.y2;
    }
    ctx.strokeStyle = theme.accentA;
    ctx.shadowColor = theme.accentA;
    ctx.shadowBlur = 8 * pulse;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// "sharp shard" concept -- a jagged, irregular polygon (not a clean
// geometric shape) reading as a broken-off piece of the boss's own
// signal, with a glitching cyan-offset outline, flickering scanlines
// clipped to the silhouette, and a pulsing red core -- all animated
// per-frame using g.rotSeed so different drone instances desync
function drawBossDroneShard(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);

  const pts = [
    [-0.39, -0.58], [0.34, -0.97], [0.92, -0.32], [0.71, 0.61],
    [0, 1.0], [-0.71, 0.61], [-0.87, -0.18]
  ].map(([x, y]) => [x * g.r, y * g.r]);

  function tracePath() {
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
  }

  // glitching cyan-offset outline, jittering each frame
  const glitchX = Math.sin(frame * 0.3 + g.rotSeed) * g.r * 0.12;
  const glitchY = Math.cos(frame * 0.22 + g.rotSeed) * g.r * 0.12;
  ctx.save();
  ctx.translate(glitchX, glitchY);
  ctx.strokeStyle = '#00e0ff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  tracePath();
  ctx.stroke();
  ctx.restore();

  // main jagged body
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#1a0000';
  ctx.strokeStyle = '#ff2010';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#ff2010';
  ctx.shadowBlur = 6;
  tracePath();
  ctx.fill();
  ctx.stroke();

  // flickering scanlines, clipped to the shard's silhouette
  ctx.save();
  tracePath();
  ctx.clip();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffb020';
  ctx.lineWidth = 0.5;
  for (let i = -1; i <= 1; i++) {
    const ly = i * g.r * 0.35 + Math.sin(frame * 0.1 + g.rotSeed + i) * g.r * 0.15;
    ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(frame * 0.15 + i * 2 + g.rotSeed));
    ctx.beginPath();
    ctx.moveTo(-g.r, ly);
    ctx.lineTo(g.r, ly);
    ctx.stroke();
  }
  ctx.restore();

  // pulsing glowing core
  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.25 + g.rotSeed);
  ctx.globalAlpha = 1;
  ctx.shadowColor = '#ff4020';
  ctx.shadowBlur = 8 * pulse;
  ctx.fillStyle = '#ff4020';
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff5cc';
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // drifting sparks
  ctx.fillStyle = '#ff6030';
  for (let i = 0; i < 2; i++) {
    const sAng = frame * 0.02 + g.rotSeed + i * Math.PI;
    const sDist = g.r * (1.3 + 0.2 * Math.sin(frame * 0.08 + i));
    ctx.beginPath();
    ctx.arc(Math.cos(sAng) * sDist, Math.sin(sAng) * sDist, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// "tracker orb" concept for the homing fragment -- deliberately
// smooth and round, contrasting with the jagged shard silhouette, so
// it's instantly readable as a different kind of threat. nested rings
// with a rotating scan arc sell the "actively tracking" behavior
// "cracked core sphere" concept for the homing fragment -- a solid
// round body (still contrasting with the shard's jagged silhouette)
// with glowing crack lines running through it and a visible pulsing
// core, reading as a dense, deliberate projectile rather than a
// sensor. cracks pulse in brightness to feel like they're charging
function drawBossHomingOrb(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);

  // solid body
  ctx.shadowColor = '#ff2010';
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#3a0000';
  ctx.strokeStyle = '#ff2010';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, g.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // glowing cracks, clipped to the sphere, pulsing brightness
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, g.r, 0, Math.PI * 2);
  ctx.clip();
  const crackPulse = 0.6 + 0.4 * Math.sin(frame * 0.2 + g.rotSeed);
  ctx.strokeStyle = '#00e0ff';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = crackPulse;
  ctx.shadowColor = '#00e0ff';
  ctx.shadowBlur = 4;
  const cracks = [
    [[-0.583, -0.417], [-0.083, 0.167], [-0.667, 0.333]],
    [[0.417, -0.667], [0.167, -0.083], [0.75, 0.25]],
    [[-0.25, 0.583], [0.333, 0.417], [0.583, 0.833]]
  ];
  for (const crack of cracks) {
    ctx.beginPath();
    crack.forEach(([x, y], i) => {
      const px = x * g.r, py = y * g.r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.stroke();
  }
  ctx.restore();

  // pulsing core, visible through the cracks
  const corePulse = 0.7 + 0.3 * Math.sin(frame * 0.25 + g.rotSeed + 1.5);
  ctx.globalAlpha = 1;
  ctx.shadowColor = '#ff4020';
  ctx.shadowBlur = 8 * corePulse;
  ctx.fillStyle = '#ff4020';
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fff5cc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.33, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fff5cc';
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSecurityDrone(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);

  const blink = Math.sin(frame * 0.2 + g.rotSeed) > 0.3;

  // propeller arms
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 4; i++) {
    const ang = Math.PI / 4 + i * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ang) * g.r * 1.4, Math.sin(ang) * g.r * 1.4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // angular hex body
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#1a1428';
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = i * Math.PI / 3;
    const px = Math.cos(ang) * g.r * 0.7, py = Math.sin(ang) * g.r * 0.7;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // blinking core light
  ctx.shadowBlur = blink ? 10 : 3;
  ctx.fillStyle = blink ? '#ff2ec4' : '#802060';
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBillboard(g, theme) {
  const panelLeft = g.x - g.panelWidth / 2;
  const panelTop = g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM - g.panelHeight;

  ctx.save();

  // holographic panel base -- semi-transparent glowing fill
  const grad = ctx.createLinearGradient(0, panelTop, 0, panelTop + g.panelHeight);
  grad.addColorStop(0, theme.accentA + '30');
  grad.addColorStop(1, theme.accentB + '15');
  ctx.fillStyle = grad;
  ctx.fillRect(panelLeft, panelTop, g.panelWidth, g.panelHeight);

  // glowing frame border
  ctx.strokeStyle = theme.accentA;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 3;
  ctx.strokeRect(panelLeft, panelTop, g.panelWidth, g.panelHeight);
  ctx.shadowBlur = 0;

  // scrolling abstract ad-content glyphs, clipped to the panel
  ctx.save();
  ctx.beginPath();
  ctx.rect(panelLeft, panelTop, g.panelWidth, g.panelHeight);
  ctx.clip();
  const scrollOffset = (frame * 1.5 + g.rotSeed * 50) % 40;
  for (let row = 0; row < Math.ceil(g.panelHeight / 40) + 1; row++) {
    const y = panelTop - 40 + row * 40 + 15 - scrollOffset;
    ctx.fillStyle = row % 2 === 0 ? theme.accentB : theme.accentA;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(panelLeft + 15, y, g.panelWidth - 30, 12);
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawTurret(g, theme) {
  ctx.save();
  const mountTop = g.anchor === 'top' ? PLAY_TOP : g.y;
  const mountHeight = g.anchor === 'top' ? (g.y - PLAY_TOP) : (PLAY_BOTTOM - g.y);
  ctx.fillStyle = '#1a1428';
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 6;
  ctx.fillRect(g.x - 18, mountTop, 36, mountHeight);
  ctx.strokeRect(g.x - 18, mountTop, 36, mountHeight);
  ctx.shadowBlur = 0;

  // muzzle light pulses brighter as the next shot approaches
  const elapsed = frame - g.spawnFrame;
  const cyclePos = (elapsed % g.fireInterval) / g.fireInterval;
  ctx.fillStyle = theme.accentB;
  ctx.globalAlpha = 0.4 + 0.6 * cyclePos;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawTurretShot(g, theme) {
  ctx.save();
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 10;
  ctx.fillStyle = theme.accentB;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSearchlight(g, theme) {
  const ep = liveSearchlightEndpoint(g);
  ctx.save();

  // soft outer glow cone
  ctx.strokeStyle = theme.accentA;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = g.beamWidth * 2.2;
  ctx.beginPath();
  ctx.moveTo(g.x, PLAY_TOP);
  ctx.lineTo(ep.x, ep.y);
  ctx.stroke();

  // bright core line
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = g.beamWidth * 0.5;
  ctx.beginPath();
  ctx.moveTo(g.x, PLAY_TOP);
  ctx.lineTo(ep.x, ep.y);
  ctx.stroke();

  ctx.globalAlpha = 1;

  // pivot lamp housing
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#1a1428';
  ctx.beginPath();
  ctx.arc(g.x, PLAY_TOP, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawZone2Storm(g, theme) {
  const y = liveStormY(g);
  ctx.save();
  ctx.translate(g.x, y);

  // three layers rotate and pulse at different, unsynced rates so the
  // whole poof feels alive without needing a totally different motion
  // system -- no vertical funnel, just a dense scalloped cloud mass
  const phase1 = frame * 0.008 + g.rotSeed;
  const phase2 = frame * -0.013 + g.rotSeed * 1.7;
  const phase3 = frame * 0.021 + g.rotSeed * 2.3;
  const pulse1 = 1 + Math.sin(frame * 0.02 + g.rotSeed) * 0.04;
  const pulse2 = 1 + Math.sin(frame * 0.031 + g.rotSeed * 1.5) * 0.05;
  const pulse3 = 1 + Math.sin(frame * 0.024 + g.rotSeed * 0.8) * 0.06;

  // a scalloped (bumpy-edged) circular outline, built from rounded bumps
  // connected by quadratic curves through pulled-in valley points --
  // this is what gives the cartoon "poof" silhouette instead of a plain
  // smooth circle
  function scallopedPath(baseR, bumpCount, bumpAmount, rotationPhase) {
    const pts = [];
    for (let i = 0; i < bumpCount; i++) {
      const ang = (i / bumpCount) * Math.PI * 2 + rotationPhase;
      const r = baseR + bumpAmount;
      pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
    }
    ctx.beginPath();
    for (let i = 0; i < bumpCount; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % bumpCount];
      const midAng = ((i + 0.5) / bumpCount) * Math.PI * 2 + rotationPhase;
      const valleyR = baseR - bumpAmount * 0.5;
      const vx = Math.cos(midAng) * valleyR, vy = Math.sin(midAng) * valleyR;
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(vx, vy, x2, y2);
    }
    ctx.closePath();
  }

  // outer layer -- darkest, largest, sets the overall silhouette
  scallopedPath(g.r * 0.8 * pulse1, 9, g.r * 0.2, phase1);
  ctx.fillStyle = '#1a2858';
  ctx.fill();

  // mid layer -- cyan well mass
  scallopedPath(g.r * 0.62 * pulse2, 8, g.r * 0.16, phase2);
  ctx.fillStyle = theme.accentB || '#6ec8ff';
  ctx.globalAlpha = 0.92;
  ctx.fill();
  ctx.globalAlpha = 1;

  // inner layer -- magenta/white core
  scallopedPath(g.r * 0.38 * pulse3, 7, g.r * 0.1, phase3);
  ctx.fillStyle = theme.wellAccent || '#e85cff';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, g.r * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = theme.accentA || '#3dffc8';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 5; i++) {
    const ang = phase1 + i * (Math.PI * 2 / 5);
    ctx.beginPath();
    ctx.arc(0, 0, g.r * (0.45 + (i % 2) * 0.12), ang, ang + 1.1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawArcPlanet(g, theme) {
  const y = liveArcPlanetY(g);
  ctx.save();

  ctx.shadowColor = g.color;
  ctx.shadowBlur = 10;
  const grad = ctx.createRadialGradient(g.x - g.r * 0.35, y - g.r * 0.35, g.r * 0.1, g.x, y, g.r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, g.color);
  grad.addColorStop(1, '#1a1220');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(g.x, y, g.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWindVortex(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);

  const fieldGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.reachR);
  fieldGrad.addColorStop(0, theme.accentB + '00');
  fieldGrad.addColorStop(0.7, theme.accentB + '18');
  fieldGrad.addColorStop(1, theme.accentB + '00');
  ctx.fillStyle = fieldGrad;
  ctx.beginPath();
  ctx.arc(0, 0, g.reachR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(frame * 0.03 + g.rotSeed);
  const armCount = 3;
  for (let a = 0; a < armCount; a++) {
    ctx.save();
    ctx.rotate((a / armCount) * Math.PI * 2);
    ctx.strokeStyle = theme.accentA;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const turns = 1.4;
    const steps = 24;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const ang = t * turns * Math.PI * 2;
      const r = t * g.reachR * 0.85;
      const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  ctx.restore();
}

function drawBlackHole(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);

  // scale visibility details with actual size (baseline ~100px core) so a
  // bigger hole reads as more visible from a distance, not less -- fixed
  // pixel details would otherwise become proportionally thinner and blend
  // into the equally-dark void background as holes get larger
  const sizeScale = Math.max(1, g.coreR / 100);

  // reach field: a soft glow fading from the core out to the boundary,
  // plus a visible ring marking exactly where the pull begins
  const fieldGrad = ctx.createRadialGradient(0, 0, g.coreR, 0, 0, g.reachR);
  const fieldAlpha = 0.18 * Math.min(1.6, sizeScale);
  const fieldAlphaHex = Math.round(fieldAlpha * 255).toString(16).padStart(2, '0');
  fieldGrad.addColorStop(0, theme.accentA + fieldAlphaHex);
  fieldGrad.addColorStop(1, theme.accentA + '00');
  ctx.fillStyle = fieldGrad;
  ctx.beginPath();
  ctx.arc(0, 0, g.reachR, 0, Math.PI * 2);
  ctx.fill();

  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.03 + g.rotSeed);
  ctx.strokeStyle = theme.accentA;
  ctx.globalAlpha = 0.22 + 0.15 * pulse;
  ctx.lineWidth = 2.5 * sizeScale;
  ctx.beginPath();
  ctx.arc(0, 0, g.reachR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // rotating accretion disk bands
  ctx.save();
  ctx.rotate(frame * 0.02 + g.rotSeed);
  const diskR = g.coreR * 2.2;
  for (let i = 0; i < 3; i++) {
    const bandR = g.coreR * 1.3 + (i * (diskR - g.coreR * 1.3)) / 3;
    ctx.strokeStyle = theme.accentB;
    ctx.globalAlpha = 0.5 - i * 0.12;
    ctx.lineWidth = 5 * sizeScale;
    ctx.beginPath();
    ctx.ellipse(0, 0, bandR, bandR * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // lethal core: near-black with a violet rim glow
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 24 * sizeScale;
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.coreR);
  coreGrad.addColorStop(0, '#000000');
  coreGrad.addColorStop(0.85, '#050208');
  coreGrad.addColorStop(1, theme.accentA);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, g.coreR, 0, Math.PI * 2);
  ctx.fill();

  // extra rim stroke so the core's silhouette reads clearly against the
  // dark background even at a distance, scaling with size
  ctx.strokeStyle = theme.accentA;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2 * sizeScale;
  ctx.beginPath();
  ctx.arc(0, 0, g.coreR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawWreckage(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.rotSeed + frame * g.spin);

  // irregular angular chunk (5-point jagged polygon), reads clearly as
  // spinning debris rather than a round rock
  const grad = ctx.createLinearGradient(-g.r, -g.r, g.r, g.r);
  grad.addColorStop(0, '#7a8590');
  grad.addColorStop(0.5, '#454e57');
  grad.addColorStop(1, '#20262c');
  ctx.fillStyle = grad;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 8;

  const pts = [
    [0.9, -0.3], [0.3, -0.95], [-0.6, -0.7], [-0.95, 0.15],
    [-0.35, 0.9], [0.5, 0.75], [0.85, 0.2]
  ];
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const x = px * g.r, y = py * g.r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // panel seam lines for a broken-hull-plating look
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-g.r * 0.5, -g.r * 0.4);
  ctx.lineTo(g.r * 0.4, g.r * 0.1);
  ctx.moveTo(-g.r * 0.1, -g.r * 0.6);
  ctx.lineTo(-g.r * 0.1, g.r * 0.5);
  ctx.stroke();

  ctx.restore();
}

function drawIceChunk(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.rotSeed + frame * g.spin);
  const grad = ctx.createRadialGradient(-g.r * 0.25, -g.r * 0.3, g.r * 0.1, 0, 0, g.r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.55, '#d7f3ff');
  grad.addColorStop(1, '#5aa7c8');
  ctx.fillStyle = grad;
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  const sides = 6;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const rr = g.r * (i % 2 === 0 ? 1 : 0.82);
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawAsteroid(g, theme) {
  if (theme && theme.iceChunks) {
    drawIceChunk(g, theme);
    return;
  }
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.rotSeed + frame * g.spin);

  const grad = ctx.createRadialGradient(-g.r * 0.3, -g.r * 0.3, g.r * 0.15, 0, 0, g.r);
  grad.addColorStop(0, '#8a7358');
  grad.addColorStop(1, '#2e2418');
  ctx.fillStyle = grad;
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, g.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.arc(g.r * 0.3, g.r * 0.1, g.r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-g.r * 0.25, -g.r * 0.35, g.r * 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = theme.accentB;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, g.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawSplitRock(g, theme) {
  drawAsteroid(g, theme);
  if (!g.cracking) return;
  const t = Math.min(1, (frame - g.crackFrame) / Math.max(1, g.telegraphFrames));
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.28);
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.strokeStyle = theme.accentA;
  ctx.globalAlpha = 0.18 + t * 0.35 * pulse;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(0, 0, g.r + 6 + t * 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.rotate(g.rotSeed + frame * g.spin);
  ctx.strokeStyle = '#fff4c8';
  ctx.globalAlpha = 0.55 + t * 0.45;
  ctx.lineWidth = 2.2 + t * 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-g.r * 0.88, -g.r * 0.12);
  ctx.lineTo(g.r * 0.84, g.r * 0.18);
  ctx.stroke();
  ctx.globalAlpha = 0.35 + t * 0.5;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-g.r * 0.22, -g.r * 0.78);
  ctx.lineTo(g.r * 0.18, g.r * 0.72);
  ctx.stroke();
  ctx.restore();
}

function drawFireball(g, theme) {
  const y = liveFireballY(g);
  const r = g.r;
  const s = r / 20; // F3 was designed at this base scale

  ctx.save();
  ctx.translate(g.x, y);
  // jagged licks lead (left, direction of travel), white-hot core trails
  // behind at the tail (right)

  // continuously-flowing motion trail -- streaks spawn near the flame and
  // drift backward (trailing edge), fading out as they go, looping
  ctx.strokeStyle = '#4fd6ff';
  ctx.lineWidth = Math.max(2, r * 0.15);
  const cycleLen = r * 4.5;
  for (let i = 0; i < 2; i++) {
    const phase = (frame * 1.6 + i * (cycleLen / 2)) % cycleLen;
    const off = 42 * s + phase;
    const fade = 1 - phase / cycleLen;
    ctx.globalAlpha = 0.38 * fade;
    const yOff = Math.sin(i * 2.3 + frame * 0.06) * r * 0.28;
    const segLen = r * (0.7 + fade * 0.6);
    ctx.beginPath();
    ctx.moveTo(off, yOff);
    ctx.lineTo(off + segLen, yOff);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 0;

  // outer jagged flame silhouette -- fixed shape, no pulsing (only the
  // ship-relative position moves, so the slide reads clearly)
  ctx.fillStyle = '#0d3a5c';
  ctx.beginPath();
  ctx.moveTo(46 * s, 0);
  ctx.lineTo(15 * s, -20 * s);
  ctx.lineTo(-5 * s, -10 * s);
  ctx.lineTo(-35 * s, -18 * s);
  ctx.lineTo(-55 * s, 0);
  ctx.lineTo(-35 * s, 18 * s);
  ctx.lineTo(-5 * s, 10 * s);
  ctx.lineTo(15 * s, 20 * s);
  ctx.closePath();
  ctx.fill();

  // inner bright layer
  ctx.fillStyle = '#4fd6ff';
  ctx.beginPath();
  ctx.moveTo(34 * s, 0);
  ctx.lineTo(8 * s, -13 * s);
  ctx.lineTo(-12 * s, 0);
  ctx.lineTo(8 * s, 13 * s);
  ctx.closePath();
  ctx.fill();

  // white-hot core at the tail (trailing edge)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(28 * s, 0, 15 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGravityWellBackdrop(theme) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const cx = W * 0.72;
  const cy = PLAY_TOP + playHeight * 0.48;
  const magenta = theme.wellAccent || '#e85cff';
  ctx.save();
  const well = ctx.createRadialGradient(cx, cy, 8, cx, cy, playHeight * 0.95);
  well.addColorStop(0, 'rgba(232, 92, 255, 0.18)');
  well.addColorStop(0.28, 'rgba(110, 200, 255, 0.10)');
  well.addColorStop(0.62, 'rgba(61, 255, 200, 0.05)');
  well.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = well;
  ctx.fillRect(0, PLAY_TOP, W, playHeight);

  ctx.strokeStyle = magenta;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const wobble = 1 + Math.sin(frame * 0.012 + i * 0.7) * 0.04;
    const rx = (70 + i * 42) * wobble;
    const ry = (38 + i * 22) * wobble;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.16 - i * 0.018;
  }

  ctx.globalAlpha = 0.55;
  const core = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 22);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.35, magenta);
  core.addColorStop(1, 'rgba(12, 24, 40, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHBar(g, theme) {
  const y = liveGateCenter(g);
  const left = g.x - g.width / 2;
  const top = y - g.thickness / 2;
  const magenta = theme.wellAccent || '#e85cff';
  const palettes = [
    { rim: theme.accentA, body: '#102a28', gem: '#d4ff8a' },
    { rim: theme.accentB, body: '#0c2438', gem: '#9ee7ff' },
    { rim: magenta, body: '#24102e', gem: '#ffb3e8' }
  ];
  const pal = palettes[Math.abs(Math.floor((g.phase || 0) * 8)) % palettes.length];

  ctx.save();
  ctx.shadowColor = pal.rim;
  ctx.shadowBlur = 14;
  const r = Math.min(6, g.thickness / 2);
  ctx.beginPath();
  ctx.moveTo(left + r, top);
  ctx.lineTo(left + g.width - r, top);
  ctx.quadraticCurveTo(left + g.width, top, left + g.width, top + r);
  ctx.lineTo(left + g.width, top + g.thickness - r);
  ctx.quadraticCurveTo(left + g.width, top + g.thickness, left + g.width - r, top + g.thickness);
  ctx.lineTo(left + r, top + g.thickness);
  ctx.quadraticCurveTo(left, top + g.thickness, left, top + g.thickness - r);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.closePath();
  const body = ctx.createLinearGradient(left, top, left, top + g.thickness);
  body.addColorStop(0, pal.rim);
  body.addColorStop(0.35, pal.body);
  body.addColorStop(0.65, pal.body);
  body.addColorStop(1, pal.rim);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = pal.rim;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.85;
  ctx.stroke();

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = pal.gem;
  const gemH = Math.max(3, g.thickness * 0.28);
  ctx.fillRect(left + 10, y - gemH / 2, g.width - 20, gemH);
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(g.x, y, Math.min(4.5, g.thickness * 0.28), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBarrier(g, theme) {
  const active = barrierIsActive(g);
  const framesToToggle = barrierFramesToToggle(g);
  const warning = !active && framesToToggle < 25; // pre-activation flicker warning

  const gTop = g.gapCenter - g.gapHeight / 2;
  const gBottom = g.gapCenter + g.gapHeight / 2;
  const left = g.x - g.width / 2;
  const right = g.x + g.width / 2;
  const cx = g.x;

  // build a jagged vertical path (zigzagging left-right) for a mass spanning yStart..yEnd
  function jaggedMassPath(yStart, yEnd) {
    const n = g.jitter.length;
    const points = [];
    for (let i = 0; i <= n + 1; i++) {
      const t = i / (n + 1);
      const y = yStart + (yEnd - yStart) * t;
      const jx = (i > 0 && i <= n) ? g.jitter[i - 1] * g.width * 0.7 : 0;
      points.push([cx + jx, y]);
    }
    return points;
  }

  function fillJaggedMass(yStart, yEnd) {
    if (yEnd <= yStart) return;
    const path = jaggedMassPath(yStart, yEnd);
    ctx.beginPath();
    ctx.moveTo(left, yStart);
    path.forEach(([px, py]) => ctx.lineTo(px + g.width / 2, py));
    ctx.lineTo(right, yEnd);
    // close back along the left side
    ctx.lineTo(right, yEnd);
    for (let i = path.length - 1; i >= 0; i--) ctx.lineTo(path[i][0] - g.width / 2, path[i][1]);
    ctx.closePath();
    ctx.fill();

    // bright jagged energy line down the middle -- the "shaped like a lightning bolt" part
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    path.forEach(([px, py], i) => { if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();

  if (active || warning) {
    const flicker = warning
      ? 0.4 + 0.5 * Math.abs(Math.sin(frame * 0.9))
      : 0.85 + 0.15 * Math.sin(frame * 1.7);
    ctx.globalAlpha = flicker;
    ctx.shadowColor = theme.accentA;
    ctx.shadowBlur = 18;
    ctx.fillStyle = theme.accentA;

    fillJaggedMass(PLAY_TOP, gTop);
    fillJaggedMass(gBottom, PLAY_BOTTOM);
  } else {
    // inactive: faint dashed outline only, no danger
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = theme.accentB;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(left, PLAY_TOP, g.width, gTop - PLAY_TOP);
    ctx.strokeRect(left, gBottom, g.width, PLAY_BOTTOM - gBottom);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawLightningBolt(g, theme) {
  const left = g.x - g.span / 2;
  const right = g.x + g.span / 2;

  // brief fade-in flash when it first appears
  const age = frame - g.spawnFrame;
  const fadeIn = Math.min(1, age / 20);

  // build the jagged path using the bolt's fixed jitter values
  const points = [];
  const segs = g.jitter.length + 1;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const px = left + (right - left) * t;
    const py = g.y1 + (g.y2 - g.y1) * t + (i > 0 && i < segs ? g.jitter[i - 1] * g.thickness : 0);
    points.push([px, py]);
  }

  ctx.save();
  ctx.globalAlpha = fadeIn * (0.8 + 0.2 * Math.sin(frame * 1.5));

  // outer glow
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = g.thickness;
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = fadeIn * 0.35;
  ctx.beginPath();
  points.forEach(([px, py], i) => { if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
  ctx.stroke();

  // bright jagged core
  ctx.globalAlpha = fadeIn;
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 3;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  points.forEach(([px, py], i) => { if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
  ctx.stroke();

  ctx.restore();
}

function drawCloud(cx, cy, theme, lit) {
  ctx.save();
  const puffs = [[0, 0, 20], [-17, 5, 15], [17, 5, 15], [-7, -8, 13], [8, -9, 13], [0, 8, 14]];
  // soft glow behind the whole cloud so it reads clearly against the sky
  ctx.globalAlpha = lit ? 0.35 : 0.2;
  ctx.fillStyle = theme.accentA;
  ctx.beginPath();
  puffs.forEach(([dx, dy, r]) => {
    ctx.moveTo(cx + dx + r * 1.4, cy + dy);
    ctx.arc(cx + dx, cy + dy, r * 1.4, 0, Math.PI * 2);
  });
  ctx.fill();
  // shadowed base
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#3a3f5c';
  ctx.beginPath();
  puffs.forEach(([dx, dy, r]) => {
    ctx.moveTo(cx + dx + r, cy + dy + 2);
    ctx.arc(cx + dx, cy + dy + 2, r, 0, Math.PI * 2);
  });
  ctx.fill();
  // lit top -- brighter when the arc is actively discharging
  ctx.globalAlpha = lit ? 0.85 : 0.6;
  ctx.fillStyle = lit ? theme.accentA : '#8992b8';
  ctx.beginPath();
  puffs.forEach(([dx, dy, r]) => {
    ctx.moveTo(cx + dx + r * 0.9, cy + dy - 2);
    ctx.arc(cx + dx, cy + dy - 2, r * 0.9, 0, Math.PI * 2);
  });
  ctx.fill();
  ctx.restore();
}

function drawCloudArc(g, theme) {
  const active = barrierIsActive(g);
  const framesToToggle = barrierFramesToToggle(g);
  const warning = !active && framesToToggle < 25;

  drawCloud(g.x, g.y, theme, active);
  drawCloud(g.x2, g.y2, theme, active);

  const dx = g.x2 - g.x, dy = g.y2 - g.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len, py = dx / len; // unit perpendicular, for jitter offset
  const n = g.jitter.length;
  const amplitude = 14;
  const points = [];
  for (let i = 0; i <= n + 1; i++) {
    const t = i / (n + 1);
    const baseX = g.x + dx * t, baseY = g.y + dy * t;
    const j = (i > 0 && i <= n) ? g.jitter[i - 1] * amplitude : 0;
    points.push([baseX + px * j, baseY + py * j]);
  }
  // find the main-line point closest to the fixed branchT to fork from
  const branchIdx = Math.round(g.branchT * (points.length - 1));
  const [bx, by] = points[branchIdx];
  const mainAngle = Math.atan2(dy, dx);
  const branchAngle = mainAngle + g.branchSide * (0.6 + g.branchAngleJitter);
  const bx2 = bx + Math.cos(branchAngle) * g.branchLen;
  const by2 = by + Math.sin(branchAngle) * g.branchLen;

  ctx.save();
  if (active || warning) {
    const flicker = warning
      ? 0.4 + 0.5 * Math.abs(Math.sin(frame * 0.9))
      : 0.85 + 0.15 * Math.sin(frame * 1.7);
    ctx.globalAlpha = flicker;
    ctx.shadowColor = theme.accentA;
    ctx.shadowBlur = 22;

    // wide outer glow pass
    ctx.strokeStyle = theme.accentA;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    points.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();

    // secondary branch fork, thinner and dimmer than the main bolt
    if (active) {
      ctx.globalAlpha = flicker * 0.7;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx2, by2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }

    // bright white-hot core on the main line
    ctx.globalAlpha = flicker;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
  }
  ctx.restore();
}

function drawStormChargeBolt(g, theme, firing) {
  const { pts, forks } = getStormChargeBoltGeometry(g);
  const elapsed = frame - g.spawnFrame;
  const strokePts = (list, count) => {
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      if (i === 0) ctx.moveTo(list[i][0], list[i][1]);
      else ctx.lineTo(list[i][0], list[i][1]);
    }
    ctx.stroke();
  };
  const strokeForks = (width, alpha) => {
    if (!forks) return;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    for (let f = 0; f < forks.length; f++) strokePts(forks[f], forks[f].length);
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'miter';
  if (!firing) {
    const progress = Math.min(1, elapsed / (g.warningFrames || 84));
    const count = stormBoltRevealCount(pts.length, progress);
    const pulse = 0.55 + 0.45 * Math.sin(frame * 0.42);
    ctx.strokeStyle = theme.accentA;
    ctx.globalAlpha = 0.28 + progress * 0.45 * pulse;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 6]);
    ctx.shadowColor = theme.accentA;
    ctx.shadowBlur = 8;
    strokePts(pts, count);
    ctx.setLineDash([]);
    const tip = pts[count - 1];
    ctx.globalAlpha = 0.45 + progress * 0.5;
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(tip[0], tip[1], 2.2 + progress * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const dur = g.fireDuration || 42;
  const progress = Math.min(1, elapsed / dur);
  const reveal = Math.min(1, elapsed / 5);
  const count = stormBoltRevealCount(pts.length, reveal);
  const flicker = 0.72 + 0.28 * Math.abs(Math.sin(elapsed * 1.7));
  const hot = elapsed < 10 || (elapsed % 7 < 4);
  const fadeOut = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;
  const a = fadeOut * flicker;
  if (elapsed < 6) {
    ctx.globalAlpha = (1 - elapsed / 6) * 0.28;
    ctx.fillStyle = '#e8eeff';
    ctx.fillRect(0, PLAY_TOP, W, PLAY_BOTTOM - PLAY_TOP);
  }
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = hot ? 28 : 14;
  ctx.strokeStyle = theme.accentA;
  ctx.globalAlpha = a * 0.55;
  ctx.lineWidth = 9;
  strokePts(pts, count);
  strokeForks(4.5, a * 0.4);
  ctx.strokeStyle = '#c5d4ff';
  ctx.globalAlpha = a * 0.9;
  ctx.lineWidth = hot ? 4.2 : 2.8;
  strokePts(pts, count);
  strokeForks(2.2, a * 0.75);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#fff59d';
  ctx.globalAlpha = a;
  ctx.lineWidth = hot ? 2.2 : 1.4;
  strokePts(pts, count);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = hot ? 1.35 : 0.9;
  strokePts(pts, count);
  strokeForks(0.8, a * 0.95);
  const tip = pts[count - 1];
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = a;
  ctx.beginPath();
  ctx.arc(tip[0], tip[1], hot ? 3.2 : 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFloatingBolt(g, theme) {
  const active = barrierIsActive(g);
  const framesToToggle = barrierFramesToToggle(g);
  const warning = !active && framesToToggle < 25;

  const topY = g.y - g.height / 2;
  const px = g.shape.map(([nx, ny]) => [g.x + nx * g.swingWidth / 2, topY + ny * g.height]);

  ctx.save();

  if (active || warning) {
    const flicker = warning
      ? 0.4 + 0.5 * Math.abs(Math.sin(frame * 0.9))
      : 0.85 + 0.15 * Math.sin(frame * 1.7);
    ctx.globalAlpha = flicker;
    ctx.shadowColor = theme.accentA;
    ctx.shadowBlur = 16;

    const grad = ctx.createLinearGradient(g.x, topY, g.x, topY + g.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, theme.accentA);
    grad.addColorStop(1, theme.accentB);
    ctx.fillStyle = grad;

    ctx.beginPath();
    px.forEach(([rx, ry], i) => { if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry); });
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = flicker * 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

function drawPendulum(g, theme) {
  const bobY = livePendulumBobY(g);

  ctx.save();

  // bob
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 14;
  const grad = ctx.createRadialGradient(g.x - g.r * 0.3, bobY - g.r * 0.3, g.r * 0.15, g.x, bobY, g.r);
  grad.addColorStop(0, '#fff3c4');
  grad.addColorStop(0.55, theme.accentA);
  grad.addColorStop(1, '#8a6a1a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(g.x, bobY, g.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;
  ctx.stroke();

  ctx.restore();
}

function drawAcidDripVisual(x, y, r, accentA, accentB) {
  ctx.save();
  ctx.shadowColor = accentA;
  ctx.shadowBlur = 10;
  const grad = ctx.createRadialGradient(x, y + r * 0.15, r * 0.1, x, y + r * 0.15, r);
  grad.addColorStop(0, '#e8ffb0');
  grad.addColorStop(0.5, accentA);
  grad.addColorStop(1, accentB);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.3);
  ctx.quadraticCurveTo(x + r * 0.95, y - r * 0.2, x + r * 0.75, y + r * 0.35);
  ctx.arc(x, y + r * 0.15, r * 0.78, Math.PI * 0.25, Math.PI * 0.75);
  ctx.quadraticCurveTo(x - r * 0.95, y - r * 0.2, x, y - r * 1.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = accentA;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.restore();
}

function drawAcidDrip(g, theme) {
  drawAcidDripVisual(g.x, liveAcidDripY(g), g.r, theme.accentA, theme.accentB);
}

function drawShootingStar(g, theme) {
  const y = liveShootingStarY(g);
  const effScroll = SCROLL_SPEED * (currentTheme().scrollMult || 1);

  // direction of travel via recent velocity, so the tail orients correctly
  // for any diagonal slope
  const dt = 6;
  const prevFrame = Math.max(g.spawnFrame, frame - dt);
  const framesBack = frame - prevFrame;
  const prevT = Math.min(1, (prevFrame - g.spawnFrame) / g.life);
  const prevY = g.startY + (g.endY - g.startY) * prevT;
  const dx = g.oncoming ? framesBack * (g.vx || 0) : -framesBack * effScroll;
  const dy = y - prevY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const dirX = dx / len, dirY = dy / len;

  // tail extends OPPOSITE the direction of travel (behind, where it came
  // from) -- the bright head at (g.x, y) leads, the fading tail trails
  const pulse = 1 + Math.sin(frame * 0.35 + g.spawnFrame) * 0.15;
  const tailLen = g.r * 9 * pulse;
  const tailX = g.x - dirX * tailLen;
  const tailY = y - dirY * tailLen;

  ctx.save();
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 10;

  const grad = ctx.createLinearGradient(tailX, tailY, g.x, y);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.6, theme.accentA);
  grad.addColorStop(1, '#fff3d6');
  ctx.strokeStyle = grad;
  ctx.lineWidth = g.r * 0.9 * pulse;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(g.x, y);
  ctx.stroke();

  // twinkling sparkles along the tail's length, each with its own phase
  ctx.fillStyle = '#fff3d6';
  const sparkleCount = 4;
  for (let i = 1; i <= sparkleCount; i++) {
    const along = i / (sparkleCount + 1);
    const sx = g.x - dirX * tailLen * along;
    const sy = y - dirY * tailLen * along;
    const twinkle = 0.4 + 0.6 * Math.max(0, Math.sin(frame * 0.25 + i * 1.9 + g.spawnFrame * 0.1));
    ctx.globalAlpha = twinkle * (1 - along * 0.6);
    ctx.beginPath();
    ctx.arc(sx, sy, g.r * 0.18 * (1 - along * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 6;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(g.x, y, g.r * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMovingDoor(g, theme) {
  const ranges = liveDoorGapRanges(g).slice().sort((a, b) => a.top - b.top);

  ctx.save();
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(g.x - g.width / 2, PLAY_TOP);
  ctx.lineTo(g.x - g.width / 2, PLAY_BOTTOM);
  ctx.moveTo(g.x + g.width / 2, PLAY_TOP);
  ctx.lineTo(g.x + g.width / 2, PLAY_BOTTOM);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // solid slab everywhere except the gaps
  ctx.fillStyle = '#2a323b';
  let cursor = PLAY_TOP;
  for (const r of ranges) {
    if (r.top > cursor) {
      ctx.fillRect(g.x - g.width / 2, cursor, g.width, r.top - cursor);
    }
    cursor = Math.max(cursor, r.bottom);
  }
  if (cursor < PLAY_BOTTOM) {
    ctx.fillRect(g.x - g.width / 2, cursor, g.width, PLAY_BOTTOM - cursor);
  }

  // warning stripe accents at the solid segment edges
  ctx.fillStyle = theme.accentB;
  ctx.globalAlpha = 0.5;
  for (const r of ranges) {
    ctx.fillRect(g.x - g.width / 2, r.top - 4, g.width, 4);
    ctx.fillRect(g.x - g.width / 2, r.bottom, g.width, 4);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawAccessKey(g, theme) {
  ctx.save();
  ctx.translate(g.x, g.y + Math.sin(frame * 0.06) * 4);
  const spin = Math.sin(frame * 0.04);
  ctx.scale(spin * 0.6 + 0.7, 1);

  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(0, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(7, 8);
  ctx.moveTo(0, 14);
  ctx.lineTo(5, 14);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(0, -10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSparkHub(g, theme) {
  const charging = sparkHubIsCharging(g);
  const chargeT = charging ? sparkHubPhase(g) / g.chargeFrames : 0;

  ctx.save();

  // T1 tower: a straight industrial strut connecting the hub to the
  // ceiling or floor it's mounted on
  const boundaryY = g.mountSide === 'ceiling' ? PLAY_TOP : PLAY_BOTTOM;
  ctx.fillStyle = '#2a323b';
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 1.5;
  const towerTop = Math.min(boundaryY, g.y);
  const towerBottom = Math.max(boundaryY, g.y);
  ctx.fillRect(g.x - 6, towerTop, 12, towerBottom - towerTop);
  ctx.strokeRect(g.x - 6, towerTop, 12, towerBottom - towerTop);
  // mounting bracket at the boundary
  ctx.fillStyle = '#3a4450';
  ctx.fillRect(g.x - 10, boundaryY - (g.mountSide === 'ceiling' ? 0 : 8), 20, 8);

  ctx.translate(g.x, g.y);

  // pointy satellite spikes, one per firing direction -- doubles as a
  // visual hint for where the burst will launch
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const innerR = 7, outerR = 17;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * innerR, Math.sin(ang) * innerR);
    ctx.lineTo(Math.cos(ang) * outerR, Math.sin(ang) * outerR);
    ctx.stroke();
    ctx.fillStyle = theme.accentB;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * outerR, Math.sin(ang) * outerR, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // small satellite dish panel
  ctx.fillStyle = '#2a323b';
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, g.mountSide === 'ceiling' ? -20 : 20, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // angular central core body
  ctx.fillStyle = '#1a2a3a';
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -9); ctx.lineTo(9, 0); ctx.lineTo(0, 9); ctx.lineTo(-9, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // charge-up glow building toward the moment it fires
  if (charging && chargeT > 0.3) {
    const pulse = (chargeT - 0.3) / 0.7;
    ctx.fillStyle = theme.accentA;
    ctx.shadowColor = theme.accentA;
    ctx.shadowBlur = 20 * pulse;
    ctx.globalAlpha = pulse * (0.5 + 0.5 * Math.sin(frame * 0.6));
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawSparkProjectile(g, theme) {
  const pos = liveProjectilePos(g);
  ctx.save();

  // crackling electric tendrils radiating from the ball -- evenly spaced
  // with a shared slow rotation so the overall shape stays symmetric,
  // with only small independent jitter/length variation per tendril for
  // liveliness without throwing off the balance
  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 1.2;
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 6;
  const tendrilCount = 6;
  const sharedRotation = frame * 0.03 + g.spawnFrame * 0.7;
  for (let i = 0; i < tendrilCount; i++) {
    const seed = g.spawnFrame * 3.7 + i * 5.3;
    const baseAngle = (i / tendrilCount) * Math.PI * 2 + sharedRotation;
    const jitterAngle = baseAngle + Math.sin(frame * 0.8 + seed) * 0.15;
    const len = g.r * (1.2 + 0.4 * Math.abs(Math.sin(frame * 0.5 + seed)));
    const midLen = len * 0.5;
    const midAngle = baseAngle + Math.sin(frame * 0.9 + seed) * 0.12;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + Math.cos(midAngle) * midLen, pos.y + Math.sin(midAngle) * midLen);
    ctx.lineTo(pos.x + Math.cos(jitterAngle) * len, pos.y + Math.sin(jitterAngle) * len);
    ctx.stroke();
  }

  // bright core ball
  ctx.shadowBlur = 12;
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, g.r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.45, theme.accentA);
  grad.addColorStop(1, 'rgba(94,200,232,0.15)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, g.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSpecialDoor(g, theme) {
  const unlocked = specialDoorUnlocked[g.eventIndex];
  ctx.save();

  ctx.fillStyle = unlocked ? 'rgba(26,17,8,0.3)' : '#1a1108';
  ctx.globalAlpha = unlocked ? 0.35 : 1;
  ctx.fillRect(g.x - g.width / 2, PLAY_TOP, g.width, PLAY_BOTTOM - PLAY_TOP);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 3;
  ctx.globalAlpha = unlocked ? 0.4 : 0.9;
  ctx.strokeRect(g.x - g.width / 2, PLAY_TOP, g.width, PLAY_BOTTOM - PLAY_TOP);
  ctx.globalAlpha = 1;

  // card reader panel and status light
  const panelY = (PLAY_TOP + PLAY_BOTTOM) / 2;
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(g.x - 12, panelY - 20, 24, 40);
  ctx.strokeStyle = theme.accentB;
  ctx.globalAlpha = unlocked ? 0.3 : 0.8;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(g.x - 12, panelY - 20, 24, 40);
  ctx.globalAlpha = 1;

  const pulse = unlocked ? 1 : 0.6 + 0.4 * Math.sin(frame * 0.15);
  ctx.fillStyle = unlocked ? '#5ec870' : '#d84545';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10 * pulse;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(g.x, panelY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawGeyser(g, theme) {
  const h = liveGeyserHeight(g);
  const warning = geyserIsWarning(g);
  const dir = g.pivotSide === 'floor' ? -1 : 1;
  const baseY = g.pivotSide === 'floor' ? PLAY_BOTTOM : PLAY_TOP;
  const tipY = baseY + dir * h;

  ctx.save();

  // warning pulse at the base, telegraphing an incoming eruption
  if (warning) {
    const pulse = 0.3 + 0.3 * Math.sin(frame * 0.4);
    ctx.fillStyle = theme.accentA;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.ellipse(g.x, baseY - dir * 2, g.width * 0.7, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // tapering spike body from base to current tip height
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 12;
  const grad = ctx.createLinearGradient(g.x, baseY, g.x, tipY);
  grad.addColorStop(0, theme.accentB);
  grad.addColorStop(1, '#e8ffb0');
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(g.x - g.width / 2, baseY);
  ctx.lineTo(g.x - g.width * 0.15, tipY);
  ctx.lineTo(g.x + g.width * 0.15, tipY);
  ctx.lineTo(g.x + g.width / 2, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawToxicPool(g, theme) {
  const r = liveToxicPoolRadius(g);

  ctx.save();
  ctx.shadowColor = theme.accentA;
  ctx.shadowBlur = 16;

  const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r);
  grad.addColorStop(0, '#e8ffb0');
  grad.addColorStop(0.5, theme.accentA);
  grad.addColorStop(1, theme.accentB);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
  ctx.fill();

  // small bubbling dots inside for a toxic-ooze texture
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = theme.accentB;
  for (let i = 0; i < 3; i++) {
    const a = frame * 0.04 + i * 2.1;
    const dist = r * 0.5;
    const bx = g.x + Math.cos(a) * dist;
    const by = g.y + Math.sin(a) * dist;
    ctx.beginPath();
    ctx.arc(bx, by, Math.max(1.5, r * 0.15), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = theme.accentA;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(g.x, g.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawGates(theme) {
  for (let g of gates) {
    if (g.type === 'asteroid') {
      drawAsteroid(g, theme);
      continue;
    }
    if (g.type === 'splitrock') {
      drawSplitRock(g, theme);
      continue;
    }
    if (g.type === 'wreckage') {
      drawWreckage(g, theme);
      continue;
    }
    if (g.type === 'blackhole') {
      drawBlackHole(g, theme);
      continue;
    }
    if (g.type === 'windvortex') {
      drawWindVortex(g, theme);
      continue;
    }
    if (g.type === 'orbiter') {
      drawOrbiter(g, theme);
      continue;
    }
    if (g.type === 'arcplanet') {
      drawArcPlanet(g, theme);
      continue;
    }
    if (g.type === 'zone2storm') {
      drawZone2Storm(g, theme);
      continue;
    }
    if (g.type === 'searchlight') {
      drawSearchlight(g, theme);
      continue;
    }
    if (g.type === 'turret') {
      drawTurret(g, theme);
      continue;
    }
    if (g.type === 'turretshot') {
      drawTurretShot(g, theme);
      continue;
    }
    if (g.type === 'billboard') {
      drawBillboard(g, theme);
      continue;
    }
    if (g.type === 'emp') {
      drawEmp(g, theme);
      continue;
    }
    if (g.type === 'echotrail') {
      drawEchoTrail(g, theme);
      continue;
    }
    if (g.type === 'pulsingorb') {
      drawPulsingOrb(g, theme);
      continue;
    }
    if (g.type === 'boomerang') {
      drawBoomerang(g, theme);
      continue;
    }
    if (g.type === 'bossattack') {
      drawBossAttack(g, theme);
      continue;
    }
    if (g.type === 'bossragepulse') {
      drawBossRagePulse(g, theme);
      continue;
    }
    if (g.type === 'bossdiagonalring') {
      drawBossDiagonalRings(g, theme);
      continue;
    }
    if (g.type === 'bossdrone') {
      if (g.homing) drawBossHomingOrb(g, theme); else drawBossDroneShard(g, theme);
      continue;
    }
    if (g.type === 'bossvolleytelegraph') {
      drawBossVolleyTelegraph(g, theme);
      continue;
    }
    if (g.type === 'bossember') {
      drawBossEmber(g, theme);
      continue;
    }
    if (g.type === 'bossashcloud') {
      drawBossAshCloud(g, theme);
      continue;
    }
    if (g.type === 'bosschargebeamtelegraph') {
      drawBossChargeBeamTelegraph(g, theme);
      continue;
    }
    if (g.type === 'bosschargebeam') {
      drawBossChargeBeam(g, theme);
      continue;
    }
    if (g.type === 'securitydrone') {
      drawSecurityDrone(g, theme);
      continue;
    }
    if (g.type === 'lasergrid') {
      drawLaserGrid(g, theme);
      continue;
    }
    if (g.type === 'lensingzone') {
      drawLensingZone(g, theme);
      continue;
    }
    if (g.type === 'signalcorruption') {
      drawSignalCorruption(g, theme);
      continue;
    }
    if (g.type === 'supernova') {
      drawSupernovaPlanet(g, theme);
      continue;
    }
    if (g.type === 'supernovadebris') {
      drawSupernovaDebris(g, theme);
      continue;
    }
    if (g.type === 'movingdoor') {
      drawMovingDoor(g, theme);
      continue;
    }
    if (g.type === 'accesskey') {
      drawAccessKey(g, theme);
      continue;
    }
    if (g.type === 'specialdoor') {
      drawSpecialDoor(g, theme);
      continue;
    }
    if (g.type === 'sparkhub') {
      drawSparkHub(g, theme);
      continue;
    }
    if (g.type === 'sparkprojectile') {
      drawSparkProjectile(g, theme);
      continue;
    }
    if (g.type === 'shootingstar') {
      drawShootingStar(g, theme);
      continue;
    }
    if (g.type === 'toxicpool') {
      drawToxicPool(g, theme);
      continue;
    }
    if (g.type === 'aciddrip') {
      drawAcidDrip(g, theme);
      continue;
    }
    if (g.type === 'geyser') {
      drawGeyser(g, theme);
      continue;
    }
    if (g.type === 'fireball') {
      drawFireball(g, theme);
      continue;
    }
    if (g.type === 'pendulum') {
      drawPendulum(g, theme);
      continue;
    }
    if (g.type === 'hbar') {
      drawHBar(g, theme);
      continue;
    }
    if (g.type === 'lbolt') {
      drawFloatingBolt(g, theme);
      continue;
    }
    if (g.type === 'cloudarc') {
      drawCloudArc(g, theme);
      continue;
    }
    if (g.type === 'stormchargebolttelegraph') {
      drawStormChargeBolt(g, theme, false);
      continue;
    }
    if (g.type === 'stormchargebolt') {
      drawStormChargeBolt(g, theme, true);
      continue;
    }
    if (g.type === 'barrier') {
      drawBarrier(g, theme);
      continue;
    }
    if (g.type === 'lightning') {
      drawLightningBolt(g, theme);
      continue;
    }
    if (theme.obstacleShape === 'diamond') {
      drawDiamondGate(g, theme);
      continue;
    }
    const center = liveGateCenter(g);
    const gap = liveGateGap(g);
    const topH = center - gap / 2 - PLAY_TOP;
    const botY = center + gap / 2;
    const botH = PLAY_BOTTOM - botY;

    ctx.save();
    const gateX = MOBILE_PERFORMANCE_MODE ? Math.round(g.x) : g.x;
    ctx.shadowColor = theme.accentB;
    ctx.shadowBlur = MOBILE_PERFORMANCE_MODE ? 6 : 14;
    const grad = ctx.createLinearGradient(gateX, 0, gateX + GATE_WIDTH, 0);
    grad.addColorStop(0, theme.accentA);
    grad.addColorStop(1, theme.accentB);
    ctx.fillStyle = grad;

    ctx.fillRect(gateX, PLAY_TOP, GATE_WIDTH, topH);
    ctx.fillRect(gateX, botY, GATE_WIDTH, botH);
    if (MOBILE_PERFORMANCE_MODE) {
      // Keep the obstacle silhouette readable after the mobile canvas is
      // downscaled over the bright synthwave grid.
      ctx.shadowBlur = 0;
      ctx.strokeStyle = theme.accentB;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 2;
      ctx.strokeRect(gateX + 1, PLAY_TOP + 1, GATE_WIDTH - 2, Math.max(0, topH - 2));
      ctx.strokeRect(gateX + 1, botY + 1, GATE_WIDTH - 2, Math.max(0, botH - 2));
    }
    ctx.restore();
  }
}

const PORTAL_VANISH_RANGE = 260; // px -- how far before the portal the ship starts vanishing

function getShipVanishProgress() {
  if (warpActive) return 1; // stay hidden through the entire warp tunnel sequence
  if (!portalObject) return 0;
  const dist = portalObject.x - ship.x;
  if (dist > PORTAL_VANISH_RANGE) return 0;
  if (dist < 0) return 1;
  return Math.max(0, Math.min(1, (PORTAL_VANISH_RANGE - dist) / PORTAL_VANISH_RANGE));
}

const INVINCIBILITY_BLINK_INTERVAL_MS = 66; // ~15 toggles/sec -- classic NES-style flicker rate

function unlockedShipTrails() {
  return SHIP_TRAILS.filter((t) => t.unlocked());
}

function currentShipTrail() {
  const spec = SHIP_TRAILS.find((t) => t.id === shipTrailStyle);
  if (spec && spec.unlocked()) return spec;
  shipTrailStyle = 'classic';
  savePlayerProfile();
  return SHIP_TRAILS.find((t) => t.id === 'classic') || SHIP_TRAILS[0];
}

function cycleShipTrail(dir) {
  const unlocked = unlockedShipTrails();
  if (!unlocked.length) return;
  let i = unlocked.findIndex((t) => t.id === currentShipTrail().id);
  if (i < 0) i = 0;
  shipTrailStyle = unlocked[(i + dir + unlocked.length) % unlocked.length].id;
  savePlayerProfile();
  lastRenderedOverlayState = null;
  updateOverlay();
}

function unlockedShipSkins() {
  return SHIP_SKINS.filter((s) => s.unlocked());
}

function currentShipSkin() {
  if (shipSkinStyle === 'gravity') shipSkinStyle = 'neon';
  const spec = SHIP_SKINS.find((s) => s.id === shipSkinStyle);
  if (spec && spec.unlocked()) return spec;
  shipSkinStyle = 'classic';
  savePlayerProfile();
  return SHIP_SKINS[0];
}

function cycleShipSkin(dir) {
  const unlocked = unlockedShipSkins();
  if (!unlocked.length) return;
  let i = unlocked.findIndex((s) => s.id === currentShipSkin().id);
  if (i < 0) i = 0;
  shipSkinStyle = unlocked[(i + dir + unlocked.length) % unlocked.length].id;
  savePlayerProfile();
  lastRenderedOverlayState = null;
  updateOverlay();
}

function updateShipTrailParticles() {
  const trail = currentShipTrail().id;
  if (trail !== 'sparks' && trail !== 'overdrive') {
    if (shipTrailParticles.length) shipTrailParticles = [];
    return;
  }
  if (trail === 'overdrive') {
    const spawn = holding ? 4 : 2;
    for (let i = 0; i < spawn; i++) {
      const flash = Math.random() < 0.2;
      shipTrailParticles.push({
        kind: flash ? 'flash' : 'ember',
        x: ship.x - SHIP_W * 0.5 - Math.random() * 10,
        y: ship.y + (Math.random() - 0.5) * (holding ? 18 : 10),
        vx: -2.4 - Math.random() * (holding ? 3.6 : 1.8),
        vy: (Math.random() - 0.5) * 1.25,
        life: 0,
        maxLife: flash ? 6 + Math.floor(Math.random() * 5) : 16 + Math.floor(Math.random() * 14),
        r: flash ? 2.2 + Math.random() * 1.6 : 1.3 + Math.random() * 2.2,
        len: 10 + Math.random() * 16
      });
    }
  } else {
    const spawn = holding ? 2 : 1;
    for (let i = 0; i < spawn; i++) {
      shipTrailParticles.push({
        kind: 'spark',
        x: ship.x - SHIP_W * 0.45,
        y: ship.y + (Math.random() - 0.5) * 7,
        vx: -1.2 - Math.random() * (holding ? 2.4 : 1.1),
        vy: (Math.random() - 0.5) * 0.7,
        life: 0,
        maxLife: 10 + Math.floor(Math.random() * 10),
        r: 1.2 + Math.random() * 1.2
      });
    }
  }
  for (let i = shipTrailParticles.length - 1; i >= 0; i--) {
    const p = shipTrailParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    if (p.life >= p.maxLife) shipTrailParticles.splice(i, 1);
  }
  const cap = trail === 'overdrive' ? 120 : 80;
  if (shipTrailParticles.length > cap) shipTrailParticles.splice(0, shipTrailParticles.length - cap);
}

function updateShipToxicDrips() {
  if (currentShipSkin().id !== 'toxic') {
    if (shipToxicDrips.length) shipToxicDrips = [];
    shipToxicDripCooldown = 0;
    return;
  }
  const th = currentTheme();
  const effScroll = SCROLL_SPEED * (th.scrollMult || 1);
  shipToxicDripCooldown--;
  const interval = holding ? 48 : 84;
  if (shipToxicDripCooldown <= 0) {
    shipToxicDripCooldown = interval;
    shipToxicDrips.push({
      x: ship.x - SHIP_W * 0.28 + (Math.random() - 0.5) * 6,
      startY: ship.y + SHIP_H * 0.28,
      spawnFrame: frame,
      fallSpeed: 2.2 + Math.random() * 1.4,
      r: 5.5 + Math.random() * 2.8,
      vx: -effScroll * (0.35 + Math.random() * 0.2)
    });
  }
  for (let i = shipToxicDrips.length - 1; i >= 0; i--) {
    const d = shipToxicDrips[i];
    d.x += d.vx;
    const y = d.startY + d.fallSpeed * (frame - d.spawnFrame);
    if (y > PLAY_BOTTOM + d.r * 2 || d.x < -40) shipToxicDrips.splice(i, 1);
  }
  if (shipToxicDrips.length > 24) shipToxicDrips.splice(0, shipToxicDrips.length - 24);
}

function traceShipDart() {
  ctx.beginPath();
  ctx.moveTo(SHIP_W / 2, 0);
  ctx.lineTo(-SHIP_W / 2, -SHIP_H / 2);
  ctx.lineTo(-SHIP_W / 2 + 8, 0);
  ctx.lineTo(-SHIP_W / 2, SHIP_H / 2);
  ctx.closePath();
}

function classicShipPalette(theme) {
  if (theme && theme.bgStyle === 'toxic' && currentShipSkin().id === 'classic') {
    return { accentA: '#0ff0fc', accentB: '#7af6ff', hull: '#1a2a44', hullMid: '#3d5a78', nose: '#e8fbff' };
  }
  return { accentA: theme.accentA, accentB: theme.accentB };
}

function drawShipSkinClassic(theme) {
  const pal = classicShipPalette(theme);
  const toxicReadability = theme && theme.bgStyle === 'toxic';
  ctx.shadowColor = toxicReadability ? pal.accentA : pal.accentB;
  ctx.shadowBlur = toxicReadability ? 14 : 12;
  const bodyGrad = ctx.createLinearGradient(-SHIP_W / 2, 0, SHIP_W / 2, 0);
  bodyGrad.addColorStop(0, toxicReadability ? pal.hull : pal.accentB);
  if (toxicReadability) bodyGrad.addColorStop(0.55, pal.hullMid);
  bodyGrad.addColorStop(1, toxicReadability ? pal.nose : '#ffffff');
  ctx.fillStyle = bodyGrad;
  traceShipDart();
  ctx.fill();
  ctx.strokeStyle = pal.accentA;
  ctx.lineWidth = toxicReadability ? 2 : 1.5;
  ctx.stroke();
}

function drawShipSkinSignal() {
  const r = SHIP_H * 0.85;
  ctx.save();
  ctx.shadowColor = '#ff6aa8';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4d8d';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();
  const grad = ctx.createLinearGradient(0, -r, 0, r);
  grad.addColorStop(0, '#ffe066');
  grad.addColorStop(0.22, '#ff9a4a');
  grad.addColorStop(0.42, '#ff5a9a');
  grad.addColorStop(0.55, '#ff2ec4');
  grad.addColorStop(0.72, '#7a7ae8');
  grad.addColorStop(1, '#3ad6d0');
  ctx.fillStyle = grad;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.fillStyle = '#1a0b3a';
  const barStart = r * 0.06;
  const barGap = r * 0.155;
  const barH = r * 0.055;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-r, barStart + i * barGap, r * 2, barH);
  }
  const shade = ctx.createRadialGradient(-r * 0.32, -r * 0.38, r * 0.04, 0, 0, r);
  shade.addColorStop(0, 'rgba(255,255,255,0.55)');
  shade.addColorStop(0.28, 'rgba(255,255,255,0.08)');
  shade.addColorStop(0.72, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = shade;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
}

function drawShipSkinEclipse() {
  const t = nowMs() * 0.004;
  const pulse = 0.55 + 0.45 * Math.sin(t);
  const glowR = SHIP_W * 0.92;
  const corona = ctx.createRadialGradient(0, 0, 2, 0, 0, glowR);
  corona.addColorStop(0, `rgba(255, 90, 36, ${0.42 * pulse})`);
  corona.addColorStop(0.4, `rgba(255, 32, 90, ${0.2 * pulse})`);
  corona.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 0.35;
    const len = SHIP_W * (0.32 + 0.14 * Math.sin(t * 2.2 + i * 1.7));
    ctx.strokeStyle = i % 2 ? `rgba(255,80,40,${0.45 * pulse})` : `rgba(255,210,80,${0.35 * pulse})`;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 4);
    ctx.lineTo(Math.cos(a) * (6 + len), Math.sin(a) * (5 + len * 0.7));
    ctx.stroke();
  }
  ctx.restore();
  ctx.shadowColor = '#ff4020';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#080006';
  traceShipDart();
  ctx.fill();
  ctx.strokeStyle = '#ff5a3a';
  ctx.lineWidth = 1.7;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(255, 226, 180, ${0.5 + 0.4 * pulse})`;
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(0, -3.2);
  ctx.lineTo(-5, 0);
  ctx.lineTo(0, 3.2);
  ctx.closePath();
  ctx.fill();
}

function drawShipSkinGold() {
  const shine = 0.5 + 0.5 * Math.sin(nowMs() * 0.006);
  ctx.shadowColor = '#ffd23f';
  ctx.shadowBlur = 16 + shine * 10;
  const bodyGrad = ctx.createLinearGradient(-SHIP_W / 2, -SHIP_H / 2, SHIP_W / 2, SHIP_H / 2);
  bodyGrad.addColorStop(0, '#8a5a08');
  bodyGrad.addColorStop(0.28, '#c99010');
  bodyGrad.addColorStop(0.52 + shine * 0.08, '#fff4c8');
  bodyGrad.addColorStop(0.78, '#ffd23f');
  bodyGrad.addColorStop(1, '#fffdf0');
  ctx.fillStyle = bodyGrad;
  traceShipDart();
  ctx.fill();
  ctx.strokeStyle = '#ffe9a0';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.save();
  traceShipDart();
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha *= 0.32 + 0.28 * shine;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-SHIP_W / 2 + 3, -SHIP_H / 2 + 1);
  ctx.lineTo(SHIP_W / 2 - 5, SHIP_H / 2 - 3);
  ctx.stroke();
  ctx.restore();
}

function drawShipSkinRainbow() {
  const t = nowMs();
  const hue = (t * 0.22) % 360;
  const flicker = Math.sin(t * 0.041) > 0.7 || ((Math.floor(t / 38) * 17) % 11) === 0;
  const h = flicker ? (hue + 130 + (t % 90)) % 360 : hue;
  const sat = flicker ? 100 : 92;
  const lit = flicker ? 70 : 56;
  ctx.shadowColor = `hsl(${h}, 100%, 58%)`;
  ctx.shadowBlur = flicker ? 22 : 14;
  const bodyGrad = ctx.createLinearGradient(-SHIP_W / 2, 0, SHIP_W / 2, 0);
  bodyGrad.addColorStop(0, `hsl(${(h + 50) % 360}, ${sat}%, ${lit - 6}%)`);
  bodyGrad.addColorStop(0.5, `hsl(${h}, 100%, ${lit + 12}%)`);
  bodyGrad.addColorStop(1, flicker ? '#ffffff' : `hsl(${(h + 90) % 360}, ${sat}%, 78%)`);
  ctx.fillStyle = bodyGrad;
  traceShipDart();
  ctx.fill();
  ctx.strokeStyle = `hsl(${(h + 180) % 360}, 90%, 68%)`;
  ctx.lineWidth = flicker ? 2.1 : 1.5;
  ctx.stroke();
}

function drawShipSkinCore() {
  const t = frame;
  ctx.strokeStyle = '#5ec8e8';
  ctx.lineWidth = 1.2;
  ctx.shadowColor = '#5ec8e8';
  ctx.shadowBlur = 6;
  const tendrilCount = 6;
  const sharedRotation = t * 0.03;
  const sparkR = Math.max(SHIP_H * 0.95, SHIP_W * 0.38);
  for (let i = 0; i < tendrilCount; i++) {
    const seed = i * 5.3;
    const baseAngle = (i / tendrilCount) * Math.PI * 2 + sharedRotation;
    const jitterAngle = baseAngle + Math.sin(t * 0.8 + seed) * 0.15;
    const len = sparkR * (1.2 + 0.4 * Math.abs(Math.sin(t * 0.5 + seed)));
    const midLen = len * 0.5;
    const midAngle = baseAngle + Math.sin(t * 0.9 + seed) * 0.12;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(midAngle) * midLen, Math.sin(midAngle) * midLen);
    ctx.lineTo(Math.cos(jitterAngle) * len, Math.sin(jitterAngle) * len);
    ctx.stroke();
  }
  ctx.shadowBlur = 14;
  const bodyGrad = ctx.createRadialGradient(2, 0, 0, 0, 0, SHIP_W * 0.55);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.45, '#5ec8e8');
  bodyGrad.addColorStop(1, 'rgba(94,200,232,0.18)');
  ctx.fillStyle = bodyGrad;
  traceShipDart();
  ctx.fill();
  ctx.save();
  traceShipDart();
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(220,245,255,0.8)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const yOff = (i - 1) * 4.2;
    ctx.beginPath();
    ctx.moveTo(-SHIP_W / 2 + 3, yOff);
    ctx.lineTo(-2 + Math.sin(t * 0.7 + i) * 3.2, yOff + Math.sin(t * 1.1 + i * 2) * 2);
    ctx.lineTo(SHIP_W / 2 - 5, yOff * 0.25);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShipSkinMolten() {
  drawMoltenCoreBody(0, 0, SHIP_H * 0.78);
}

function drawShipSkinNeon() {
  ctx.save();
  ctx.shadowColor = '#ff2ec4';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#1a1428';
  traceShipDart();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save();
  traceShipDart();
  ctx.clip();
  const scrollOffset = (frame * 1.5) % 10;
  for (let row = 0; row < 6; row++) {
    const y = -SHIP_H + row * 8 + 4 - scrollOffset;
    ctx.fillStyle = row % 2 === 0 ? 'rgba(46,232,255,0.35)' : 'rgba(255,46,196,0.32)';
    ctx.fillRect(-SHIP_W, y, SHIP_W * 2, 3.5);
  }
  ctx.restore();
  ctx.strokeStyle = '#ff2ec4';
  ctx.shadowColor = '#ff2ec4';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2.2;
  traceShipDart();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 0.9;
  traceShipDart();
  ctx.stroke();
  ctx.globalAlpha = 1;
  const blink = Math.sin(frame * 0.2) > 0.3;
  ctx.shadowColor = '#ff2ec4';
  ctx.shadowBlur = blink ? 10 : 3;
  ctx.fillStyle = blink ? '#ff2ec4' : '#802060';
  ctx.beginPath();
  ctx.arc(3, 0, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

