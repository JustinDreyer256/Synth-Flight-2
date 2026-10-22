function drawShipSkinStorm() {
  const accentA = '#fff59d';
  const accentB = '#5c6bc0';
  const lit = holding;
  ctx.save();
  ctx.shadowColor = accentB;
  ctx.shadowBlur = 12;
  const bodyGrad = ctx.createLinearGradient(-SHIP_W / 2, 0, SHIP_W / 2, 0);
  bodyGrad.addColorStop(0, accentB);
  bodyGrad.addColorStop(1, '#dce3ff');
  ctx.fillStyle = bodyGrad;
  traceShipDart();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = accentA;
  ctx.lineWidth = 1.5;
  traceShipDart();
  ctx.stroke();
  const boltOn = lit || ((frame % 22) < 4);
  if (boltOn) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const flash = lit ? 1 : 0.75;
    const drawBolt = (pts, width, color, blur, alpha) => {
      ctx.globalAlpha = flash * alpha;
      ctx.strokeStyle = color;
      ctx.shadowColor = accentA;
      ctx.shadowBlur = blur;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();
    };
    const main = [[-SHIP_W / 2 + 4, -2], [-6, 3], [2, -3], [SHIP_W / 2 - 5, 1]];
    const branch = [[-6, 3], [-2, 7], [4, 5]];
    drawBolt(main, 3.2, accentB, 8, 0.45);
    drawBolt(main, 1.5, accentA, 12, 1);
    drawBolt(branch, 2.2, accentB, 6, 0.35);
    drawBolt(branch, 1.1, accentA, 8, 0.9);
    ctx.restore();
  }
  ctx.restore();
}

function drawShipSkinToxic() {
  ctx.save();
  ctx.shadowColor = '#8aff4d';
  ctx.shadowBlur = 12;
  const bodyGrad = ctx.createRadialGradient(2, -2, 1, 0, 0, SHIP_W * 0.55);
  bodyGrad.addColorStop(0, '#e8ffb0');
  bodyGrad.addColorStop(0.45, '#8aff4d');
  bodyGrad.addColorStop(1, '#d4c84a');
  ctx.fillStyle = bodyGrad;
  traceShipDart();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save();
  traceShipDart();
  ctx.clip();
  ctx.fillStyle = 'rgba(212,200,74,0.55)';
  for (let i = 0; i < 3; i++) {
    const a = frame * 0.04 + i * 2.1;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 7, Math.sin(a) * 3.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#8aff4d';
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1.4;
  traceShipDart();
  ctx.stroke();
  ctx.restore();
}

function drawShipSkinVoid() {
  const r = SHIP_H * 0.8;
  ctx.save();
  const field = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.1);
  field.addColorStop(0, 'rgba(138,92,245,0.28)');
  field.addColorStop(1, 'rgba(138,92,245,0)');
  ctx.fillStyle = field;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.rotate(frame * 0.02);
  for (let i = 0; i < 3; i++) {
    const bandR = r * (1.15 + i * 0.28);
    ctx.strokeStyle = '#c9a0ff';
    ctx.globalAlpha = 0.48 - i * 0.1;
    ctx.lineWidth = 2.2 - i * 0.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, bandR, bandR * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.shadowColor = '#8a5cf5';
  ctx.shadowBlur = 14;
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  core.addColorStop(0, '#000000');
  core.addColorStop(0.82, '#050208');
  core.addColorStop(1, '#8a5cf5');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#8a5cf5';
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawShipSkinSRankOutline(alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.shadowColor = '#fff8e0';
  ctx.shadowBlur = 16;
  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 1.8;
  traceShipDart();
  ctx.stroke();
  ctx.shadowBlur = 0;
  const fill = ctx.createLinearGradient(-SHIP_W / 2, 0, SHIP_W / 2, 0);
  fill.addColorStop(0, 'rgba(255,248,224,0.15)');
  fill.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  fill.addColorStop(1, 'rgba(255,224,138,0.35)');
  ctx.fillStyle = fill;
  traceShipDart();
  ctx.fill();
  ctx.restore();
}

function drawShipSkinSRank() {
  const flare = holding ? 1 : 0.55 + 0.2 * Math.sin(nowMs() * 0.006);
  ctx.save();
  ctx.globalAlpha *= 0.35 + flare * 0.65;
  drawShipSkinSRankOutline(1);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(255,255,255,${0.45 + flare * 0.4})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-SHIP_W / 2 + 6, 0);
  ctx.lineTo(SHIP_W / 2 - 4, 0);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const a = nowMs() * 0.003 + i * (Math.PI * 2 / 3);
    const ox = Math.cos(a) * (SHIP_W * 0.42);
    const oy = Math.sin(a) * (SHIP_H * 0.7);
    ctx.fillStyle = '#fff8e0';
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(ox, oy - 3.2);
    ctx.lineTo(ox + 2.1, oy);
    ctx.lineTo(ox, oy + 3.2);
    ctx.lineTo(ox - 2.1, oy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawShipBody(theme, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const skin = currentShipSkin().id;
  if (skin === 'signal') drawShipSkinSignal();
  else if (skin === 'eclipse') drawShipSkinEclipse();
  else if (skin === 'gold') drawShipSkinGold();
  else if (skin === 'prism') drawShipSkinRainbow();
  else if (skin === 'molten') drawShipSkinMolten();
  else if (skin === 'core') drawShipSkinCore();
  else if (skin === 'neon') drawShipSkinNeon();
  else if (skin === 'storm') drawShipSkinStorm();
  else if (skin === 'toxic') drawShipSkinToxic();
  else if (skin === 'void') drawShipSkinVoid();
  else if (skin === 'srank') drawShipSkinSRank();
  else drawShipSkinClassic(theme);
  ctx.restore();
}

function drawClassicFlame(theme, extraLen, colorA, colorB) {
  const flameLen = 14 + extraLen + (holding ? 10 : 4) + Math.sin(frame * 0.5) * 3;
  const trailGrad = ctx.createLinearGradient(-SHIP_W / 2 - flameLen, 0, -SHIP_W / 2, 0);
  trailGrad.addColorStop(0, 'rgba(255,255,255,0)');
  trailGrad.addColorStop(1, holding ? colorB : colorA);
  ctx.fillStyle = trailGrad;
  ctx.beginPath();
  ctx.moveTo(-SHIP_W / 2, -6);
  ctx.lineTo(-SHIP_W / 2 - flameLen, 0);
  ctx.lineTo(-SHIP_W / 2, 6);
  ctx.closePath();
  ctx.fill();
}

function drawShipTrailWorld(theme) {
  const id = currentShipTrail().id;
  if (id === 'ribbon' && shipYHistory.length > 4) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = theme.accentB;
    ctx.shadowBlur = 10;
    const n = Math.min(48, shipYHistory.length);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = ship.x - i * 3.4;
      const py = shipYHistory[shipYHistory.length - 1 - i];
      const wobble = Math.sin(frame * 0.18 + i * 0.35) * (holding ? 2.2 : 1.1);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py + wobble);
    }
    ctx.strokeStyle = theme.accentB;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = holding ? 5 : 3.2;
    ctx.stroke();
    ctx.strokeStyle = theme.accentA;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = holding ? 2.2 : 1.4;
    ctx.stroke();
    ctx.restore();
  }
  if (id === 'echo' && currentShipSkin().id !== 'molten' && shipYHistory.length > 6) {
    const steps = [6, 12, 18, 24];
    ctx.save();
    for (let s = steps.length - 1; s >= 0; s--) {
      const i = steps[s];
      if (i >= shipYHistory.length) continue;
      const px = ship.x - i * 2.6;
      const py = shipYHistory[shipYHistory.length - 1 - i];
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ship.rotation * Math.PI / 180);
      ctx.globalAlpha = 0.12 + (1 - s / steps.length) * 0.16;
      drawShipBody(theme, 1);
      ctx.restore();
    }
    ctx.restore();
  }
  if (currentShipSkin().id === 'molten' && shipYHistory.length > 6) {
    const r = SHIP_H * 0.78;
    const intensity = holding ? 1 : 0.72;
    const steps = [5, 10, 16, 22];
    for (let s = steps.length - 1; s >= 0; s--) {
      const i = steps[s];
      if (i >= shipYHistory.length) continue;
      const t = (s + 1) / steps.length;
      const px = ship.x - i * (2.8 + intensity * 1.4);
      const py = shipYHistory[shipYHistory.length - 1 - i] + Math.sin(frame * 0.4 + s) * 1.4 * intensity;
      drawMoltenCoreBody(px, py, r * (1 + 0.05 * (4 - s)), {
        stretchX: 1.2 + t * 0.45 * intensity,
        stretchY: 0.8 - t * 0.06 * intensity,
        alpha: (0.5 - t * 0.16) * intensity,
        sparks: false
      });
    }
  }
  if (shipToxicDrips.length) {
    for (const d of shipToxicDrips) {
      const y = d.startY + d.fallSpeed * Math.max(0, frame - d.spawnFrame);
      drawAcidDripVisual(d.x, y, d.r, '#8aff4d', '#d4c84a');
    }
  }
  if (id === 'sparks') {
    ctx.save();
    for (const p of shipTrailParticles) {
      const t = 1 - p.life / p.maxLife;
      ctx.globalAlpha = 0.25 + t * 0.7;
      ctx.fillStyle = t > 0.5 ? '#ffffff' : theme.accentB;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.4, p.r * t), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  if (id === 'overdrive') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const age = (frame * 2.15 + i * 12) % 38;
      const px = ship.x - 16 - age * 2.5;
      const py = ship.y + Math.sin(frame * 0.12 + i) * 1.4;
      const s = 6 + age * 0.38;
      ctx.globalAlpha = Math.max(0, 0.62 - age / 38);
      ctx.strokeStyle = i % 2 === 0 ? '#ffe28a' : '#ff3a18';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(px + s, py);
      ctx.lineTo(px, py - s * 0.42);
      ctx.lineTo(px - s * 0.75, py);
      ctx.lineTo(px, py + s * 0.42);
      ctx.closePath();
      ctx.stroke();
    }
    for (const p of shipTrailParticles) {
      const t = 1 - p.life / p.maxLife;
      ctx.globalAlpha = 0.22 + t * 0.8;
      if (p.kind === 'flash') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r * t), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = t > 0.62 ? '#fff6c8' : (t > 0.32 ? '#ffb020' : '#ff2848');
        ctx.lineWidth = Math.max(0.7, p.r * t);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.len * t, p.y - p.vy * 3);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  if (id === 'glitch') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const n = Math.min(18, shipYHistory.length);
    for (let i = 2; i < n; i += 2) {
      const drop = ((frame * 13 + i * 17) % 7) === 0;
      if (drop) continue;
      const px = ship.x - i * 4.2 + (((frame + i * 9) % 11) - 5);
      const py = shipYHistory[shipYHistory.length - 1 - i] + (((frame * 3 + i * 5) % 9) - 4);
      const w = 6 + ((frame + i) % 8);
      const h = 2 + ((i + frame) % 3);
      ctx.globalAlpha = 0.22 + (1 - i / n) * 0.45;
      ctx.fillStyle = (i + frame) % 2 === 0 ? theme.accentB : theme.accentA;
      ctx.fillRect(px - w, py - h / 2, w, h);
    }
    ctx.restore();
  }
  if (id === 'helix' && shipYHistory.length > 4) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'lighter';
    const n = Math.min(42, shipYHistory.length);
    const amp = holding ? 11 : 7.5;
    for (let strand = 0; strand < 2; strand++) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const px = ship.x - i * 3.1;
        const py = shipYHistory[shipYHistory.length - 1 - i]
          + Math.sin(frame * 0.22 + i * 0.42 + strand * Math.PI) * amp;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = strand === 0 ? theme.accentB : theme.accentA;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = holding ? 2.6 : 1.8;
      ctx.stroke();
    }
    ctx.restore();
  }
  if (id === 'rings') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = theme.accentB;
    for (let i = 0; i < 4; i++) {
      const age = (frame * 1.8 + i * 14) % 42;
      const px = ship.x - 10 - age * 1.8;
      const py = ship.y;
      ctx.globalAlpha = Math.max(0, 0.7 - age / 42);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py, 8 + age * 0.55, 5 + age * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawShipTrailLocal(theme) {
  const skin = currentShipSkin().id;
  if (skin === 'molten' || skin === 'void' || skin === 'toxic' || skin === 'signal') return;
  const pal = classicShipPalette(theme);
  const id = currentShipTrail().id;
  if (id === 'classic' || id === 'echo' || id === 'ribbon') {
    drawClassicFlame(theme, 0, pal.accentA, pal.accentB);
    return;
  }
  if (id === 'pulse') {
    for (let i = 0; i < 3; i++) {
      const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.28 + i * 0.9));
      const len = (10 + i * 7 + (holding ? 8 : 0)) * pulse;
      ctx.globalAlpha = 0.35 + pulse * 0.4;
      ctx.strokeStyle = i % 2 === 0 ? pal.accentB : pal.accentA;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-SHIP_W / 2 - 2, -5 + i);
      ctx.lineTo(-SHIP_W / 2 - len, 0);
      ctx.lineTo(-SHIP_W / 2 - 2, 5 - i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }
  if (id === 'sparks') {
    drawClassicFlame(theme, -4, pal.accentB, '#ffffff');
    return;
  }
  if (id === 'glitch') {
    const baseLen = 16 + (holding ? 14 : 5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const stutter = ((frame * 3 + i * 11) % 5) === 0;
      if (stutter) continue;
      const y = -8 + i * 4;
      const len = baseLen + ((frame * 2 + i * 7) % 16) - (i * 2);
      const xOff = ((frame + i * 13) % 9) - 4;
      ctx.globalAlpha = 0.55 + (i % 2) * 0.25;
      ctx.fillStyle = i % 2 === 0 ? pal.accentB : pal.accentA;
      ctx.fillRect(-SHIP_W / 2 - len + xOff, y, len, 2.2);
    }
    if ((frame % 6) < 2) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-SHIP_W / 2 - baseLen - 10, -2, 18, 3);
    }
    ctx.restore();
    return;
  }
  if (id === 'overdrive') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const boost = holding ? 1 : 0.64;
    const flicker = 0.86 + 0.14 * Math.sin(frame * 0.85);
    const plume = (28 + (holding ? 24 : 9) + Math.sin(frame * 0.42) * 6) * boost;

    const outer = ctx.createLinearGradient(-SHIP_W / 2 - plume, 0, -SHIP_W / 2, 0);
    outer.addColorStop(0, 'rgba(255, 16, 40, 0)');
    outer.addColorStop(0.4, 'rgba(255, 48, 18, 0.5)');
    outer.addColorStop(1, 'rgba(255, 220, 110, 0.95)');
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.moveTo(-SHIP_W / 2 + 2, -10);
    ctx.quadraticCurveTo(-SHIP_W / 2 - plume * 0.42, -18 * boost * flicker, -SHIP_W / 2 - plume, 0);
    ctx.quadraticCurveTo(-SHIP_W / 2 - plume * 0.42, 18 * boost * flicker, -SHIP_W / 2 + 2, 10);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.9 * flicker;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-SHIP_W / 2, -3.2);
    ctx.lineTo(-SHIP_W / 2 - plume * 0.72, 0);
    ctx.lineTo(-SHIP_W / 2, 3.2);
    ctx.closePath();
    ctx.fill();

    const curl = 11 + Math.sin(frame * 0.2) * 7;
    ctx.globalAlpha = 0.5 + 0.35 * Math.abs(Math.sin(frame * 0.31));
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-SHIP_W / 2 - 3, -6);
    ctx.quadraticCurveTo(-SHIP_W / 2 - plume * 0.38, -curl - 10, -SHIP_W / 2 - plume * 0.78, -5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-SHIP_W / 2 - 3, 6);
    ctx.quadraticCurveTo(-SHIP_W / 2 - plume * 0.38, curl + 10, -SHIP_W / 2 - plume * 0.78, 5);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (id === 'twin') {
    ctx.save();
    ctx.translate(0, -8);
    drawClassicFlame(theme, -2, pal.accentB, '#ffffff');
    ctx.restore();
    ctx.save();
    ctx.translate(0, 8);
    drawClassicFlame(theme, -2, pal.accentA, '#ffffff');
    ctx.restore();
    return;
  }
  if (id === 'helix') {
    drawClassicFlame(theme, -8, pal.accentB, pal.accentA);
    return;
  }
  if (id === 'rings') {
    drawClassicFlame(theme, -10, pal.accentB, '#ffffff');
    ctx.save();
    ctx.strokeStyle = pal.accentA;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const age = (frame * 2.4 + i * 11) % 28;
      ctx.globalAlpha = Math.max(0, 0.8 - age / 28);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(-SHIP_W / 2 - age * 0.4, 0, 5 + age * 0.7, 4 + age * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function mobileRenderAlpha() {
  if (!MOBILE_PERFORMANCE_MODE || state !== 'playing' || !Number.isFinite(simAccumulatorMs)) return 1;
  return Math.max(0, Math.min(1, simAccumulatorMs / SIM_STEP_MS));
}

function mobileRenderFrame() {
  if (!MOBILE_PERFORMANCE_MODE || state !== 'playing') return frame;
  return frame - (1 - mobileRenderAlpha());
}

function mobileWorldRenderOffsetX(theme) {
  if (!MOBILE_PERFORMANCE_MODE || state !== 'playing') return 0;
  const effScroll = SCROLL_SPEED * ((theme && theme.scrollMult) || 1);
  return effScroll * (1 - mobileRenderAlpha());
}

function drawShip(theme) {
  const vanish = getShipVanishProgress();
  if (vanish >= 0.995) return; // fully consumed by the portal

  // classic NES-style blinking sprite while invincible -- hard on/off
  // toggle rather than a smooth fade, matching the authentic retro look
  // real hardware produced (no alpha blending, just skipping the draw
  // entirely every other interval). Tied to the game clock so pause
  // freezes the blink instead of burning through the protection window.
  const isInvincible = ghostMode || gameNowMs() < invincibilityEndTime;
  if (isInvincible && Math.floor(gameNowMs() / INVINCIBILITY_BLINK_INTERVAL_MS) % 2 === 0) return;

  drawShipTrailWorld(theme);

  let renderShipY = ship.y;
  let renderShipRotation = ship.rotation;
  if (MOBILE_PERFORMANCE_MODE && state === 'playing'
      && Number.isFinite(simPrevShipY) && Number.isFinite(simPrevShipRotation)
      && Math.abs(ship.y - simPrevShipY) < 40) {
    const alpha = mobileRenderAlpha();
    renderShipY = simPrevShipY + (ship.y - simPrevShipY) * alpha;
    renderShipRotation = simPrevShipRotation + (ship.rotation - simPrevShipRotation) * alpha;
  }

  ctx.save();
  ctx.translate(ship.x, renderShipY);
  ctx.rotate(renderShipRotation * Math.PI / 180 + vanish * 8);
  const shrink = 1 - vanish * 0.85;
  ctx.scale(shrink, shrink);
  ctx.globalAlpha = 1 - vanish;

  // dim warning glow during the "death window" -- the protection window
  // has worn off but the next free pass isn't available yet, so a hazard
  // here costs a real life. A slow, calm pulse signals "not safe anymore"
  // without the urgency of the blink, since there's no immediate threat,
  // just a used-up grace period.
  const nowForGlow = gameNowMs();
  if (!isInvincible && nowForGlow < freeHitCooldownEndTime) {
    const pulse = 0.4 + 0.3 * Math.sin(nowForGlow * 0.004);
    const glowR = SHIP_W * 1.1;
    const warnGrad = ctx.createRadialGradient(0, 0, SHIP_W * 0.2, 0, 0, glowR);
    warnGrad.addColorStop(0, `rgba(255,170,0,${pulse})`);
    warnGrad.addColorStop(1, 'rgba(255,170,0,0)');
    ctx.fillStyle = warnGrad;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  drawShipTrailLocal(theme);

  if (currentShipTrail().id === 'glitch') {
    const jx = 5 + Math.sin(frame * 1.1) * 3.5;
    const jy = Math.cos(frame * 0.9) * 2.2;
    const drawGhost = (dx, dy, color, alpha) => {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha *= alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(SHIP_W / 2, 0);
      ctx.lineTo(-SHIP_W / 2, -SHIP_H / 2);
      ctx.lineTo(-SHIP_W / 2 + 8, 0);
      ctx.lineTo(-SHIP_W / 2, SHIP_H / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawGhost(jx, jy * 0.4, theme.accentB, 0.85);
    drawGhost(-jx, -jy * 0.4, theme.accentA, 0.8);
    // horizontal scan tears -- bands of the hull jump left/right
    const bandH = SHIP_H / 4;
    for (let b = 0; b < 4; b++) {
      const tear = (((frame * 2 + b * 19) % 8) - 4) * 2.4;
      ctx.save();
      ctx.beginPath();
      ctx.rect(-SHIP_W, -SHIP_H / 2 + b * bandH, SHIP_W * 2, bandH);
      ctx.clip();
      ctx.translate(tear, 0);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha *= 0.55;
      ctx.fillStyle = b % 2 === 0 ? theme.accentB : theme.accentA;
      ctx.beginPath();
      ctx.moveTo(SHIP_W / 2, 0);
      ctx.lineTo(-SHIP_W / 2, -SHIP_H / 2);
      ctx.lineTo(-SHIP_W / 2 + 8, 0);
      ctx.lineTo(-SHIP_W / 2, SHIP_H / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawShipBody(theme, 1);

  ctx.restore();
}

function drawToxicBarOoze(theme) {
  ctx.save();

  // top bar: flat toxic pool layer along the inner edge
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = theme.accentA;
  ctx.fillRect(0, BAR_HEIGHT - 18, W, 18);

  // bottom bar: mirrored flat pool layer
  ctx.fillRect(0, H - BAR_HEIGHT, W, 18);

  // rising bubbles, staggered and looping, deterministic per index
  ctx.fillStyle = theme.accentB;
  const bubbleCount = 6;
  const riseSpan = 22;
  for (let i = 0; i < bubbleCount; i++) {
    const cycle = 90 + (i % 3) * 15;
    const t = (frame + i * 37) % cycle;
    const progress = t / cycle;
    const bx = ((i + 0.5) / bubbleCount) * W;
    const bubbleR = 2 + (i % 3);
    ctx.globalAlpha = 0.6 * (1 - progress);

    // top bar bubbles drift downward, dripping out of the ceiling layer
    // into the play area (mirrors the bottom bar's upward flow)
    const topBy = (BAR_HEIGHT - 4) + progress * riseSpan;
    ctx.beginPath();
    ctx.arc(bx, topBy, bubbleR, 0, Math.PI * 2);
    ctx.fill();

    // bottom bar bubbles drift upward too (rising out of the floor layer)
    const botBy = (H - BAR_HEIGHT + 4) - progress * riseSpan;
    ctx.beginPath();
    ctx.arc(bx, botBy, bubbleR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBars(theme) {
  const barGrad = ctx.createLinearGradient(0, 0, 0, BAR_HEIGHT);
  barGrad.addColorStop(0, theme.barTop);
  barGrad.addColorStop(1, theme.barBottom);

  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, BAR_HEIGHT);
  ctx.fillRect(0, H - BAR_HEIGHT, W, BAR_HEIGHT);

  if (theme.bgStyle === 'toxic') {
    drawToxicBarOoze(theme);
  }

  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, BAR_HEIGHT);
  ctx.lineTo(W, BAR_HEIGHT);
  ctx.moveTo(0, H - BAR_HEIGHT);
  ctx.lineTo(W, H - BAR_HEIGHT);
  ctx.stroke();

  ctx.fillStyle = theme.accentB;
  ctx.font = 'bold 20px Courier New';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 8;
  ctx.fillText('SYNTH FLIGHT 2', 14, BAR_HEIGHT / 2 + 2);
  ctx.shadowBlur = 0;
  ctx.font = '9px Courier New';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  if (DEV_TOOLS_ENABLED) ctx.fillText('build 2026-08-28-vortex-overlap-check', 14, BAR_HEIGHT + 10);
  ctx.textAlign = 'right';
  ctx.font = 'bold 13px Courier New';
  ctx.fillStyle = theme.accentA;
  ctx.fillText(FORK_GALLERY_ACTIVE && theme.name === 'INFERNO' ? 'INFERNO  STYLE GALLERY' : theme.name, W - 14, BAR_HEIGHT / 2 + 2);

  // lives indicator -- small triangles left of the theme name
  const liveSize = 7;
  let lx = W - 14 - ctx.measureText(theme.name).width - 16;
  for (let i = 0; i < MAX_LIVES; i++) {
    ctx.save();
    ctx.translate(lx, BAR_HEIGHT / 2);
    ctx.fillStyle = i < lives ? theme.accentB : 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(liveSize, 0);
    ctx.lineTo(-liveSize * 0.7, -liveSize * 0.7);
    ctx.lineTo(-liveSize * 0.7, liveSize * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    lx -= liveSize * 2.2;
  }

  ctx.font = 'bold 15px Courier New';
  ctx.fillStyle = theme.accentA;
  ctx.textAlign = 'left';
  const zoneDist = Math.floor(distance - zoneStartDistance);
  const distLabel = (theme.isBossZone || theme.isMiniBossZone)
    ? ('DISTANCE: ' + zoneDist)
    : ('DISTANCE: ' + zoneDist + ' / ' + THEME_DISTANCE);
  ctx.fillText(distLabel, 14, H - BAR_HEIGHT / 2 + 1);
  if (!theme.isBossZone && !theme.isMiniBossZone) {
    ctx.textAlign = 'right';
    ctx.fillText('BEST: ' + best, W - 14, H - BAR_HEIGHT / 2 + 1);
  }
}

function drawWarpEffect() {
  const progress = 1 - (warpTimer / WARP_DURATION); // 0 -> 1
  const oldTheme = currentTheme();
  const newTheme = THEMES[nextThemeIndex];

  const cx = W / 2;
  const cy = (PLAY_TOP + PLAY_BOTTOM) / 2;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const streakCount = 46;
  const maxLen = Math.max(W, H);
  for (let i = 0; i < streakCount; i++) {
    const angle = (i / streakCount) * Math.PI * 2 + progress * 2;
    const len = maxLen * Math.min(1, progress * 1.6) * (0.5 + 0.5 * Math.sin(i * 12.9898));
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len * 0.6;
    ctx.strokeStyle = lerpColor(oldTheme.accentB, newTheme.accentA, progress);
    ctx.globalAlpha = 0.5 * (1 - Math.abs(progress - 0.5) * 1.4);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // flash at midpoint
  const flashStrength = Math.max(0, 1 - Math.abs(progress - 0.5) * 4);
  if (flashStrength > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flashStrength * 0.5})`;
    ctx.fillRect(0, PLAY_TOP, W, PLAY_BOTTOM - PLAY_TOP);
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 28px Courier New';
  ctx.fillStyle = newTheme.accentB;
  ctx.shadowColor = newTheme.accentB;
  ctx.shadowBlur = 16;
  ctx.globalAlpha = Math.min(1, progress * 2, (1 - progress) * 3 + 0.3);
  ctx.fillText((themeIndex === nextThemeIndex ? 'LAUNCHING ' : 'ENTERING ') + newTheme.name, cx, cy);
  ctx.restore();
}

function drawTerrain(theme) {
  if (terrainSegments.length < 2) return;

  ctx.save();
  // shadowBlur on these giant cave fills is what tanks Inferno in Chrome
  ctx.shadowBlur = 0;

  // top land mass
  const topGrad = ctx.createLinearGradient(0, PLAY_TOP, 0, PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.55);
  topGrad.addColorStop(0, theme.accentA);
  topGrad.addColorStop(1, theme.accentB);
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(terrainSegments[0].x, PLAY_TOP - 4);
  for (const s of terrainSegments) {
    ctx.lineTo(s.x, s.topY);
  }
  ctx.lineTo(terrainSegments[terrainSegments.length - 1].x, PLAY_TOP - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = theme.accentB;
  ctx.lineWidth = 2;
  ctx.beginPath();
  terrainSegments.forEach((s, i) => {
    if (i === 0) ctx.moveTo(s.x, s.topY); else ctx.lineTo(s.x, s.topY);
  });
  ctx.stroke();

  // bottom land mass
  const botGrad = ctx.createLinearGradient(0, PLAY_BOTTOM - (PLAY_BOTTOM - PLAY_TOP) * 0.55, 0, PLAY_BOTTOM);
  botGrad.addColorStop(0, theme.accentB);
  botGrad.addColorStop(1, theme.accentA);
  ctx.fillStyle = botGrad;
  ctx.beginPath();
  ctx.moveTo(terrainSegments[0].x, PLAY_BOTTOM + 4);
  for (const s of terrainSegments) {
    ctx.lineTo(s.x, s.bottomY);
  }
  ctx.lineTo(terrainSegments[terrainSegments.length - 1].x, PLAY_BOTTOM + 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  terrainSegments.forEach((s, i) => {
    if (i === 0) ctx.moveTo(s.x, s.bottomY); else ctx.lineTo(s.x, s.bottomY);
  });
  ctx.stroke();

  if (theme.iceChunks) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    terrainSegments.forEach((s, i) => {
      if (i === 0) ctx.moveTo(s.x, s.topY + 3); else ctx.lineTo(s.x, s.topY + 3);
    });
    ctx.stroke();
    ctx.beginPath();
    terrainSegments.forEach((s, i) => {
      if (i === 0) ctx.moveTo(s.x, s.bottomY - 3); else ctx.lineTo(s.x, s.bottomY - 3);
    });
    ctx.stroke();
  }

  // fork island: a solid mass splitting the passage -- draw only the contiguous
  // runs of segments that actually have thickness, so the outline never traces
  // through the zero-height collapsed points before/after a fork
  const ISLAND_EPS = 1.5;
  let run = [];
  const flushRun = () => {
    if (run.length < 2) { run = []; return; }
    const islGrad = ctx.createLinearGradient(0, PLAY_TOP, 0, PLAY_BOTTOM);
    islGrad.addColorStop(0, theme.accentB);
    islGrad.addColorStop(0.5, theme.accentA);
    islGrad.addColorStop(1, theme.accentB);
    ctx.fillStyle = islGrad;
    ctx.beginPath();
    const leftH = run[0].islandBottom - run[0].islandTop;
    let bodyH = 0;
    for (let i = 0; i < run.length; i++) {
      const h = run[i].islandBottom - run[i].islandTop;
      if (h > bodyH) bodyH = h;
    }
    const shape = run[0].islandShape || '';
    const allowTip = !shape || shape === 'arrow' || shape === 'teardrop' || shape === 'hull';
    const tapered = allowTip && leftH < bodyH * 0.5 && run.length > 1;
    if (tapered) {
      const a = run[0];
      const b = run[1];
      const cy0 = (a.islandTop + a.islandBottom) / 2;
      const cy1 = (b.islandTop + b.islandBottom) / 2;
      const vx = a.x - b.x;
      const vy = cy0 - cy1;
      const inv = 1 / (Math.hypot(vx, vy) || 1);
      const tipLen = Math.max(16, leftH * 1.1);
      ctx.moveTo(a.x + vx * inv * tipLen, cy0 + vy * inv * tipLen);
    } else {
      ctx.moveTo(run[0].x, run[0].islandTop);
    }
    for (let i = tapered ? 0 : 1; i < run.length; i++) {
      ctx.lineTo(run[i].x, run[i].islandTop);
    }
    for (let i = run.length - 1; i >= 0; i--) ctx.lineTo(run[i].x, run[i].islandBottom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = theme.accentA;
    ctx.lineWidth = 2;
    ctx.stroke();
    const label = run[0].islandLabel;
    if (label) {
      let minTop = run[0].islandTop;
      let midX = 0;
      for (let i = 0; i < run.length; i++) {
        if (run[i].islandTop < minTop) minTop = run[i].islandTop;
        midX += run[i].x;
      }
      midX /= run.length;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.font = 'bold 16px Courier New';
      ctx.fillStyle = '#fff8e8';
      ctx.strokeStyle = '#1a0000';
      ctx.lineWidth = 4;
      ctx.strokeText(label, midX, minTop - 10);
      ctx.fillText(label, midX, minTop - 10);
      ctx.restore();
    }
    run = [];
  };
  for (const s of terrainSegments) {
    if (s.islandBottom - s.islandTop > ISLAND_EPS) {
      run.push(s);
    } else {
      flushRun();
    }
  }
  flushRun();

  ctx.restore();
}

function drawPortalRing() {
  if (!portalObject) return;
  const theme = currentTheme();
  const nextTheme = THEMES[(themeIndex + 1) % THEMES.length];
  const cx = portalObject.x;
  const halfWidth = 34 + Math.sin(frame * 0.05) * 4;

  ctx.save();

  // swirling interior fill, spanning the full play height, blended toward
  // the next zone's colors
  const grad = ctx.createLinearGradient(cx - halfWidth, 0, cx + halfWidth, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.3, nextTheme.accentB);
  grad.addColorStop(0.5, theme.accentA);
  grad.addColorStop(0.7, nextTheme.accentB);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = grad;
  ctx.fillRect(cx - halfWidth, PLAY_TOP, halfWidth * 2, PLAY_BOTTOM - PLAY_TOP);

  // horizontal swirl bands drifting up/down for a portal-energy feel
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = nextTheme.accentA;
  ctx.lineWidth = 2;
  const bandSpacing = 26;
  const bandOffset = (frame * 1.6) % bandSpacing;
  for (let y = PLAY_TOP - bandSpacing + bandOffset; y < PLAY_BOTTOM + bandSpacing; y += bandSpacing) {
    const wobble = Math.sin(frame * 0.08 + y * 0.05) * halfWidth * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - halfWidth * 0.8 + wobble, y);
    ctx.quadraticCurveTo(cx, y - 6, cx + halfWidth * 0.8 + wobble, y);
    ctx.stroke();
  }

  // glowing left/right edges spanning the full window, top to bottom --
  // deliberately NOT theme.accentB here, since that's the same color the
  // standard gate obstacle uses for its own glow/gradient, which made the
  // portal's own edge look identical to a real obstacle overlapping it
  ctx.globalAlpha = 0.95;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 22;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth, PLAY_TOP);
  ctx.lineTo(cx - halfWidth, PLAY_BOTTOM);
  ctx.moveTo(cx + halfWidth, PLAY_TOP);
  ctx.lineTo(cx + halfWidth, PLAY_BOTTOM);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - halfWidth, PLAY_TOP);
  ctx.lineTo(cx - halfWidth, PLAY_BOTTOM);
  ctx.moveTo(cx + halfWidth, PLAY_TOP);
  ctx.lineTo(cx + halfWidth, PLAY_BOTTOM);
  ctx.stroke();

  ctx.restore();
}

function getBossShakeOffset() {
  if (!boss || !currentTheme().isBossZone) return { x: 0, y: 0 };
  if (bossFullyDefeated) return { x: 0, y: 0 };

  const entranceElapsed = frame - bossSpawnFrame;
  const entranceProgress = Math.min(1, entranceElapsed / BOSS_ENTRANCE_DURATION);
  if (entranceProgress >= BOSS_ENTRANCE_ASSEMBLE_END && entranceProgress < 1) {
    const stageProgress = (entranceProgress - BOSS_ENTRANCE_ASSEMBLE_END) / (1 - BOSS_ENTRANCE_ASSEMBLE_END);
    const shakeDecay = Math.max(0, 1 - stageProgress * 3);
    const shakeMag = 8 * shakeDecay;
    return { x: Math.sin(frame * 1.9) * shakeMag, y: Math.cos(frame * 2.3) * shakeMag };
  }

  const sinceTransitionEnd = frame - bossTransitionEndFrame;
  if (sinceTransitionEnd >= 0 && sinceTransitionEnd < BOSS_TRANSITION_COMPLETE_FX_DURATION) {
    const stageProgress = sinceTransitionEnd / BOSS_TRANSITION_COMPLETE_FX_DURATION;
    const shakeDecay = Math.max(0, 1 - stageProgress * 2.5);
    const shakeMag = 10 * shakeDecay;
    return { x: Math.sin(frame * 1.9) * shakeMag, y: Math.cos(frame * 2.3) * shakeMag };
  }

  if (bossTransitioning && bossTransitionTargetPhase === 5) {
    const stageProgress = (frame - bossTransitionStartFrame) / BOSS_PHASE5_TRANSITION_DURATION;
    if (stageProgress >= 0.2 && stageProgress < 0.68) {
      // shake builds through the burst, peaking hardest right at the flash
      const localProgress = (stageProgress - 0.2) / 0.48;
      const shakeMag = 14 * Math.sin(localProgress * Math.PI);
      return { x: Math.sin(frame * 2.1) * shakeMag, y: Math.cos(frame * 2.6) * shakeMag };
    }
  }

  if (bossFinalChargeActive) {
    const stageProgress = (frame - bossFinalChargeStartFrame) / BOSS_FINAL_CHARGE_DURATION;
    const shakeMag = 4 + stageProgress * 12; // builds steadily toward detonation
    return { x: Math.sin(frame * 1.7) * shakeMag, y: Math.cos(frame * 2.2) * shakeMag };
  }

  if (bossExplosionActive) {
    const stageProgress = (frame - bossExplosionStartFrame) / BOSS_EXPLOSION_DURATION;
    if (stageProgress < 0.45) {
      const shakeMag = 20; // maximum violence during the burst and white-out
      return { x: Math.sin(frame * 3.3) * shakeMag, y: Math.cos(frame * 3.9) * shakeMag };
    } else if (stageProgress < 0.7) {
      const localProgress = (stageProgress - 0.45) / 0.25;
      const shakeMag = 20 * Math.max(0, 1 - localProgress);
      return { x: Math.sin(frame * 3.3) * shakeMag, y: Math.cos(frame * 3.9) * shakeMag };
    }
  }

  return { x: 0, y: 0 };
}

function updateBgmForState() {
  if (!audioUnlocked) return;
  if (!audioSettings.bgmEnabled) {
    stopBgm();
    return;
  }
  const tester = document.getElementById('sfx-tester');
  if (tester && tester.classList.contains('active') && previewLoopId) return;
  if (state === 'playing' || state === 'paused' || state === 'respawn' || state === 'continue-prompt') {
    const fileTrack = currentFileBgmTrack();
    if (fileTrack) {
      playFileBgm(fileTrack.id);
      if (fileTrack.id === 'bgm-05-molten-core-boss') prefetchBgmTrack('bgm-05-molten-core');
      if (fileTrack.id === 'bgm-10-reactor-core-p1') prefetchBgmTrack('bgm-10-reactor-core-p8');
      if (fileTrack.id === 'bgm-13-the-signal-p1') prefetchBgmTrack('bgm-13-the-signal-p3');
      if (fileTrack.id === 'bgm-13-the-signal-p3') prefetchBgmTrack('bgm-13-the-signal-p5');
      return;
    }
    const th = currentTheme();
    playBgm((th.isBossZone || th.isMiniBossZone) ? 'boss' : 'standard');
  } else if (state === 'victory') {
    playBgm('victory');
  } else if (state === 'gameover') {
    stopBgm();
  } else {
    playBgm('menu');
  }
}

function draw() {
  try {
  updateBgmForState();
  tickFileBgmLoop();
  applyCanvasRenderScale();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const shakeOffset = getBossShakeOffset();
  ctx.save();
  if (shakeOffset.x || shakeOffset.y) {
    ctx.translate(Math.round(shakeOffset.x), Math.round(shakeOffset.y));
  }

  const theme = currentTheme();
  if (state === 'home') {
    drawHomeBackground();
  } else if (state === 'options') {
    drawMenuBackground();
  } else {
    drawBackground(theme);
  }
  drawBoss(theme);
  drawMiniBoss(theme);
  drawMiniBossBarrage(theme);
  drawMiniBossFlameWall(theme);
  drawReactorCoreAttacks(theme);
  if (!warpActive && state !== 'home' && state !== 'options') {
    ctx.save();
    const worldRenderOffsetX = mobileWorldRenderOffsetX(theme);
    if (worldRenderOffsetX) ctx.translate(worldRenderOffsetX, 0);
    if (theme.obstacleShape === 'terrain') {
      drawTerrain(theme);
      if (theme.iceChunks) drawGates(theme);
    } else {
      drawGates(theme);
    }
    drawPortalRing();
    ctx.restore();
  }
  // drawn after gates/terrain so the wall/vignette actually occludes any
  // hazard or projectile positioned within its darkened zone, rather than
  // those rendering on top of it
  if (theme.isBossZone) drawBossArenaBarrierWall(theme, boss);
  if (theme.isMiniBossZone && miniBoss && theme.miniBossVariant !== 'core') {
    drawBossArenaObsidianWall(theme, miniBoss);
  }
  if (state !== 'home' && state !== 'options') {
    drawShip(theme);
  }
  if (warpActive) {
    drawWarpEffect();
  }
  if (state !== 'home') {
    drawBars(theme);
  }
  ctx.restore();
  } finally {
    maybeCaptureZoneScreenshot();
    updateOverlay();
  }
}

let lastRenderedOverlayState = null;
const STATIC_OVERLAY_STATES = new Set(['zone-select', 'settings', 'achievements', 'paused', 'statistics', 'confirm-reset-stats', 'victory']);
function updateOverlay() {
  const __renderKey = state === 'zone-select' ? `zone-select:${zoneSelectPreviewIdx}:${unlockedZones.has(zoneSelectPreviewIdx) && zoneScreenshots[zoneSelectPreviewIdx] ? '1' : '0'}` : state === 'settings' ? `settings:${audioSettings.sfxEnabled}:${audioSettings.bgmEnabled}:${shipTrailStyle}:${shipSkinStyle}` : state === 'options' ? `options:${selectedDifficulty}` : state === 'respawn' ? `respawn:${lastDeathDistance}` : state === 'playing' ? `playing:${showFlyControlsHint && !warpActive ? 'hint' : 'go'}` : state;
  if (__renderKey === lastRenderedOverlayState) return;
  overlay.classList.toggle('home-layout', state === 'home');
  pauseToggleBtn.style.display = (state === 'playing' || state === 'paused') ? 'block' : 'none';
  positionPauseButton();
  pauseToggleBtn.textContent = (state === 'paused') ? '\u25B6' : 'II';
  pauseToggleBtn.title = (state === 'paused') ? 'Resume (Esc)' : 'Pause (Esc)';
  overlay.style.pointerEvents = (state === 'playing' || state === 'ready' || state === 'respawn' || state === 'gameover' || state === 'victory') ? 'none' : 'auto';
  lastRenderedOverlayState = __renderKey;
  const __scrollList = (typeof overlay.querySelector === 'function') ? overlay.querySelector('.scrollable-overlay-list') : null;
  const __savedScrollTop = __scrollList ? __scrollList.scrollTop : null;
  if (state === 'home') {
    overlay.innerHTML = `
      <div class="game-logo-plate home-title-plate">
        <div class="game-logo home-title">SYNTH FLIGHT 2</div>
      </div>
      <div id="menu-start-prompt" class="clickable" data-action="go-to-options">CLICK TO START</div>
    `;
  } else if (state === 'options') {
    const difficultyLabels = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD', extra: 'OVERDRIVE' };
    const difficultyClasses = { easy: 'difficulty-easy', normal: 'difficulty-normal', hard: 'difficulty-hard', extra: 'difficulty-extra' };
    const isLockedExtra = selectedDifficulty === 'extra' && !extraDifficultyUnlocked;
    const displayLabel = isLockedExtra ? '???' : difficultyLabels[selectedDifficulty];
    const displayClass = isLockedExtra ? '' : difficultyClasses[selectedDifficulty];
    overlay.innerHTML = `
      <div class="game-logo home-title options-title">SYNTH FLIGHT 2</div>
      <div class="options-panel-v2">
        <div class="panel-header">OPTIONS</div>
        <div class="options-fly-hint">${MOBILE_PERFORMANCE_MODE ? 'HOLD TO FLY  ·  TAP AND HOLD, RELEASE TO FALL' : 'HOLD TO FLY  ·  LEFT CLICK OR SPACE, RELEASE TO FALL'}</div>
        <div class="menu-stack">
          <div class="options-diff-picker">
            <div class="settings-picker-label">DIFFICULTY</div>
            <div class="stepper-control">
              <button type="button" class="stepper-arrow" data-action="diff-prev">&#9664;</button>
              <span class="stepper-value ${displayClass}">${displayLabel}</span>
              <button type="button" class="stepper-arrow" data-action="diff-next">&#9654;</button>
            </div>
          </div>
          <button type="button" class="btn-continue-secondary" data-action="open-zone-select">ZONE SELECT</button>
          <button type="button" class="btn-continue-secondary" data-action="open-settings">SETTINGS</button>
          <button type="button" class="btn-continue-secondary" data-action="open-achievements">ACHIEVEMENTS</button>
          <button type="button" class="btn-continue-secondary" data-action="open-statistics">STATISTICS</button>
        </div>
        <div class="start-action-container">
          <button type="button" class="btn-start-game" data-action="start-game">CLICK TO START</button>
        </div>
      </div>
    `;
  } else if (state === 'settings') {
    const deathWindowSeconds = ((FREE_HIT_COOLDOWN_MS - INVINCIBILITY_DURATION_MS) / 1000).toFixed(1);
    const iframeSeconds = (INVINCIBILITY_DURATION_MS / 1000).toFixed(1);
    const overdriveLocked = !extraDifficultyUnlocked;
    overlay.innerHTML = `
      <div class="menu-panel">
        <div id="title" style="font-size:32px;">SETTINGS</div>
        <div class="settings-diff-list scrollable-overlay-list">
          <div class="achievement-section-header">AUDIO</div>
          <div class="settings-ship-grid">
            <div class="settings-picker${audioSettings.sfxEnabled ? '' : ' is-off'}">
              <div class="settings-toggle${audioSettings.sfxEnabled ? '' : ' is-off'}" data-action="toggle-sfx">
                <div class="settings-picker-label">SOUND EFFECTS</div>
                <div class="settings-toggle-value">${audioSettings.sfxEnabled ? 'ON' : 'OFF'}</div>
              </div>
              <div class="settings-volume-row">
                <input type="range" class="settings-volume-slider" min="0" max="100" step="1" value="${audioVolumePercent(audioSettings.sfxVolume)}" data-volume="sfx" aria-label="Sound effects volume">
                <span class="settings-volume-pct" data-volume-pct="sfx">${audioVolumePercent(audioSettings.sfxVolume)}%</span>
              </div>
            </div>
            <div class="settings-picker${audioSettings.bgmEnabled ? '' : ' is-off'}">
              <div class="settings-toggle${audioSettings.bgmEnabled ? '' : ' is-off'}" data-action="toggle-bgm">
                <div class="settings-picker-label">BACKGROUND MUSIC</div>
                <div class="settings-toggle-value">${audioSettings.bgmEnabled ? 'ON' : 'OFF'}</div>
              </div>
              <div class="settings-volume-row">
                <input type="range" class="settings-volume-slider" min="0" max="100" step="1" value="${audioVolumePercent(audioSettings.bgmVolume)}" data-volume="bgm" aria-label="Background music volume">
                <span class="settings-volume-pct" data-volume-pct="bgm">${audioVolumePercent(audioSettings.bgmVolume)}%</span>
              </div>
            </div>
          </div>
          <button type="button" class="settings-audio-default" data-action="reset-audio-defaults">DEFAULT VOLUMES</button>
          <div class="achievement-section-header" style="margin-top:14px;">SHIP</div>
          <div class="settings-ship-grid">
            <div class="settings-picker">
              <div class="settings-picker-label">TRAIL</div>
              <div class="stepper-control">
                <button type="button" class="stepper-arrow" data-action="trail-prev">&#9664;</button>
                <span class="stepper-value">${currentShipTrail().name}</span>
                <button type="button" class="stepper-arrow" data-action="trail-next">&#9654;</button>
              </div>
              <div class="settings-trail-hint">${currentShipTrail().hint} &middot; ${unlockedShipTrails().length} / ${SHIP_TRAILS.length} unlocked</div>
            </div>
            <div class="settings-picker">
              <div class="settings-picker-label">HULL</div>
              <div class="stepper-control">
                <button type="button" class="stepper-arrow" data-action="skin-prev">&#9664;</button>
                <span class="stepper-value">${currentShipSkin().name}</span>
                <button type="button" class="stepper-arrow" data-action="skin-next">&#9654;</button>
              </div>
              <div class="settings-trail-hint">${currentShipSkin().hint} &middot; ${unlockedShipSkins().length} / ${SHIP_SKINS.length} unlocked</div>
            </div>
          </div>
          <div class="achievement-section-header" style="margin-top:14px;">DIFFICULTY DETAILS</div>
          <div class="settings-diff-card">
            <div class="settings-diff-name difficulty-easy">EASY</div>
            <div class="settings-diff-stats">
              9 lives &middot; 3 continues<br>
              ${iframeSeconds}s invincible (blinking) after a hit<br>
              ${deathWindowSeconds}s vulnerable afterward before it can trigger again
            </div>
          </div>
          <div class="settings-diff-card">
            <div class="settings-diff-name difficulty-normal">NORMAL</div>
            <div class="settings-diff-stats">
              9 lives &middot; 3 continues<br>
              First hit: ${iframeSeconds}s invincible, then ${deathWindowSeconds}s vulnerable<br>
              Any hit after that is death
            </div>
          </div>
          <div class="settings-diff-card">
            <div class="settings-diff-name difficulty-hard">HARD</div>
            <div class="settings-diff-stats">
              9 lives &middot; 5 continues<br>
              No invincibility frames
            </div>
          </div>
          <div class="settings-diff-card difficulty-extra${overdriveLocked ? ' locked' : ''}">
            <div class="settings-diff-name">OVERDRIVE ${overdriveLocked ? '&#128274;' : ''}</div>
            <div class="settings-diff-stats">
              ${overdriveLocked
                ? 'Beat the game on Normal or Hard to unlock'
                : '3 lives &middot; no continues<br>' +
                  iframeSeconds + 's invincible (blinking) after a hit<br>' +
                  deathWindowSeconds + 's vulnerable afterward before it can trigger again'}
            </div>
          </div>
          <div class="achievement-section-header" style="margin-top:14px;">PROFILE SAVE</div>
          <div class="settings-picker settings-toggle" data-action="copy-save-id">
            <div class="settings-picker-label">SAVE ID</div>
            <div class="settings-toggle-value settings-save-id">${ensurePlayerSaveId()}</div>
            <div class="settings-trail-hint">Click to copy. Bookmark the page (#sf=${ensurePlayerSaveId()}) or export a file. Clearing cache does not erase a server save.</div>
          </div>
          <div class="settings-action-grid">
            <div class="settings-picker settings-toggle" data-action="export-save">
              <div class="settings-picker-label">EXPORT</div>
              <div class="settings-toggle-value">FILE</div>
            </div>
            <div class="settings-picker settings-toggle" data-action="import-save">
              <div class="settings-picker-label">IMPORT</div>
              <div class="settings-toggle-value">FILE</div>
            </div>
            <div class="settings-picker settings-toggle" data-action="restore-save-id">
              <div class="settings-picker-label">RESTORE ID</div>
              <div class="settings-toggle-value">LOAD</div>
            </div>
          </div>
        </div>
        <div id="sub-panel-back" data-action="back-to-options">&#9664; BACK</div>
      </div>
    `;
  } else if (state === 'achievements') {
    const difficultyLabels = { easy: 'EASY', normal: 'NORMAL', hard: 'HARD', extra: 'OVERDRIVE' };
    const completedZoneCount = THEMES.filter((th, idx) => completedZones.has(idx)).length;
    const beatenCount = beatenDifficulties.size;
    const deathlessCount = THEMES.filter((th, idx) => deathlessZones.has(idx)).length;
    const DISTANCE_MILESTONES = [10000, 25000, 50000, 100000, 200000];
    const distanceMilestonesReached = DISTANCE_MILESTONES.filter(m => totalDistanceTraveled >= m).length;
    const achievementTile = (num, name, done, doneClass) => `
        <div class="zone-tile achievement-tile${done ? ' achievement-unlocked ' + doneClass : ' locked'}">
          <span class="tile-num">${num}</span>
          <span class="tile-name">${name}</span>
          <span class="tile-status">${done ? '<span class="ach-seal"></span>' : '&#128274;'}</span>
        </div>
      `;
    const completedZoneTilesHtml = THEMES.map((th, idx) => achievementTile((idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1), th.name, completedZones.has(idx), 'achievement-done')).join('');
    const beatGameTilesHtml = ['easy', 'normal', 'hard', 'extra'].map(diff =>
      achievementTile('&#127942;', `BEAT GAME: ${difficultyLabels[diff]}`, beatenDifficulties.has(diff), 'achievement-done')
    ).join('');
    const deathlessTilesHtml = THEMES.map((th, idx) => achievementTile((idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1), th.name, deathlessZones.has(idx), 'achievement-deathless')).join('');
    const distanceTilesHtml = DISTANCE_MILESTONES.map(m =>
      achievementTile('&#128640;', `${(m / 1000)}K METERS`, totalDistanceTraveled >= m, 'achievement-distance')
    ).join('');
    const rankTilesHtml = RANK_TIER_ORDER.map(tier =>
      achievementTile('&#11088;', `RANK ${tier} &mdash; ${RANK_TIER_HINTS[tier]}`, achievedRanks.has(tier), 'achievement-rank')
    ).join('');
    const trailTilesHtml = SHIP_TRAILS.map((t, idx) => {
      const done = t.unlocked();
      const label = done ? t.name : `${t.name} &mdash; ${t.hint}`;
      return achievementTile((idx + 1) < 10 ? '0' + (idx + 1) : String(idx + 1), label, done, 'achievement-trail');
    }).join('');
    const shipTilesHtml = SHIP_SKINS.map((s, idx) => {
      const done = s.unlocked();
      const label = done ? s.name : `${s.name} &mdash; ${s.hint}`;
      return achievementTile((idx + 1) < 10 ? '0' + (idx + 1) : String(idx + 1), label, done, 'achievement-ship');
    }).join('');
    overlay.innerHTML = `
      <div class="menu-panel zone-select-panel scrollable-overlay-list">
        <div id="title" style="font-size:32px;">ACHIEVEMENTS</div>
        <div class="ach-tally" aria-label="Achievement progress">
          <div class="ach-tally-item"><span class="ach-tally-n">${completedZoneCount}/${THEMES.length}</span><span class="ach-tally-label">ZONES</span></div>
          <div class="ach-tally-item"><span class="ach-tally-n">${beatenCount}/4</span><span class="ach-tally-label">DIFFS</span></div>
          <div class="ach-tally-item"><span class="ach-tally-n">${deathlessCount}/${THEMES.length}</span><span class="ach-tally-label">DEATHLESS</span></div>
          <div class="ach-tally-item"><span class="ach-tally-n">${distanceMilestonesReached}/${DISTANCE_MILESTONES.length}</span><span class="ach-tally-label">DISTANCE</span></div>
          <div class="ach-tally-item"><span class="ach-tally-n">${achievedRanks.size}/${RANK_TIER_ORDER.length}</span><span class="ach-tally-label">RANKS</span></div>
          <div class="ach-tally-item"><span class="ach-tally-n">${unlockedShipTrails().length}/${SHIP_TRAILS.length}</span><span class="ach-tally-label">TRAILS</span></div>
          <div class="ach-tally-item"><span class="ach-tally-n">${unlockedShipSkins().length}/${SHIP_SKINS.length}</span><span class="ach-tally-label">SHIPS</span></div>
        </div>
        <div class="stats-cat stats-cat-done">COMPLETED</div>
        <div class="zone-grid">${completedZoneTilesHtml}${beatGameTilesHtml}</div>
        <div class="stats-cat stats-cat-deathless">DEATHLESS</div>
        <div class="achievement-section-note">Clear a zone without dying on Hard, in campaign or Zone Select.</div>
        <div class="zone-grid">${deathlessTilesHtml}</div>
        <div class="stats-cat stats-cat-distance">DISTANCE MILESTONES</div>
        <div class="achievement-section-note">Lifetime distance flown, across every run.</div>
        <div class="zone-grid">${distanceTilesHtml}</div>
        <div class="stats-cat stats-cat-ranks">RANKS</div>
        <div class="achievement-section-note">Awarded when you beat the full game, from deaths on that run. A better rank also unlocks every tier below it.</div>
        <div class="zone-grid">${rankTilesHtml}</div>
        <div class="stats-cat stats-cat-trails">SHIP TRAILS</div>
        <div class="achievement-section-note">Cosmetic exhaust animations. Equip unlocked trails in Settings.</div>
        <div class="zone-grid">${trailTilesHtml}</div>
        <div class="stats-cat stats-cat-ships">SHIPS</div>
        <div class="achievement-section-note">Cosmetic hull skins. Equip unlocked ships in Settings.</div>
        <div class="zone-grid">${shipTilesHtml}</div>
        <div id="sub-panel-back" data-action="back-to-options">&#9664; BACK</div>
      </div>
    `;
  } else if (state === 'statistics') {
    const totalLifetimeDeaths = lifetimeDeathsByZone.reduce((a, b) => a + (b || 0), 0);
    const totalCompletions = zoneCompletionCounts.reduce((a, b) => a + (b || 0), 0);
    const maxDeaths = Math.max(1, ...lifetimeDeathsByZone.map(n => n || 0));
    const maxClears = Math.max(1, ...zoneCompletionCounts.map(n => n || 0));
    const statZoneTile = (idx, name, count, kind, heatMax) => {
      const hasValue = count > 0;
      const heat = hasValue ? Math.max(0.28, count / heatMax) : 0;
      const num = (idx + 1) < 10 ? '0' + (idx + 1) : String(idx + 1);
      return `
        <div class="stat-zone-tile stat-zone-${kind} ${hasValue ? 'has-value' : 'is-empty'}" style="--stat-heat:${heat.toFixed(3)}">
          <span class="tile-num">${num}</span>
          <span class="tile-name">${name}</span>
          <span class="stat-zone-count">${count.toLocaleString()}</span>
        </div>
      `;
    };
    const deathTilesHtml = THEMES.map((th, idx) => statZoneTile(idx, th.name, lifetimeDeathsByZone[idx] || 0, 'deaths', maxDeaths)).join('');
    const completionTilesHtml = THEMES.map((th, idx) => statZoneTile(idx, th.name, zoneCompletionCounts[idx] || 0, 'clears', maxClears)).join('');
    overlay.innerHTML = `
      <div class="menu-panel zone-select-panel scrollable-overlay-list">
        <div id="title" style="font-size:32px;">STATISTICS</div>
        <div class="stats-hero">
          <div class="stats-hero-card stats-hero-distance">
            <div class="stats-hero-label">TOTAL DISTANCE</div>
            <div class="stats-hero-value">${Math.floor(totalDistanceTraveled).toLocaleString()}<span class="stats-hero-unit">m</span></div>
          </div>
          <div class="stats-hero-card stats-hero-deaths">
            <div class="stats-hero-label">TOTAL DEATHS</div>
            <div class="stats-hero-value">${totalLifetimeDeaths.toLocaleString()}</div>
          </div>
          <div class="stats-hero-card stats-hero-clears">
            <div class="stats-hero-label">ZONE CLEARS</div>
            <div class="stats-hero-value">${totalCompletions.toLocaleString()}</div>
          </div>
        </div>
        <div class="stats-cat stats-cat-deaths">DEATHS BY ZONE</div>
        <div class="zone-grid">${deathTilesHtml}</div>
        <div class="stats-cat stats-cat-clears">ZONE COMPLETIONS</div>
        <div class="zone-grid">${completionTilesHtml}</div>
        <div class="menu-btn-row danger-row" data-action="confirm-reset-stats" style="margin-top:20px; justify-content:center;">
          <span class="menu-btn-label">RESET STATS</span>
        </div>
        <div id="sub-panel-back" data-action="back-to-options">&#9664; BACK</div>
      </div>
    `;
  } else if (state === 'confirm-reset-stats') {
    overlay.innerHTML = `
      <div class="options-panel-v2 confirm-panel">
        <div class="panel-header confirm-danger-header">RESET STATS?</div>
        <div class="confirm-warning-text">
          This will permanently erase your best distance, unlocked zones, achievements, and all lifetime statistics.
          <br><br>
          <strong>This cannot be undone.</strong>
        </div>
        <div class="confirm-btn-row">
          <button type="button" class="btn-confirm-cancel" data-action="cancel-reset-stats">CANCEL</button>
          <button type="button" class="btn-confirm-danger" data-action="reset-stats-confirmed">YES, DELETE EVERYTHING</button>
        </div>
      </div>
    `;
  } else if (state === 'zone-select') {
    const zoneTypeLabel = (th) => th.isBossZone ? 'FINAL BOSS ZONE' : (th.isMiniBossZone ? 'MINI BOSS ZONE' : 'STANDARD ZONE');
    const tilesHtml = THEMES.map((th, idx) => {
      const unlocked = unlockedZones.has(idx);
      const active = idx === zoneSelectPreviewIdx;
      return `
        <div class="zone-tile${unlocked ? '' : ' locked'}${active ? ' active' : ''}"${unlocked ? ` data-action="preview-zone" data-zone-idx="${idx}"` : ''}>
          <span class="tile-num">${(idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1)}</span>
          <span class="tile-name">${th.name}</span>
          <span class="tile-status">${unlocked ? '&#9654;' : '&#128274;'}</span>
        </div>
      `;
    }).join('');
    const previewTheme = THEMES[zoneSelectPreviewIdx];
    const previewUnlocked = unlockedZones.has(zoneSelectPreviewIdx);
    for (let i = 0; i < THEMES.length; i++) {
      if (!unlockedZones.has(i) || zoneScreenshots[i]) continue;
      try { generateAndStoreZoneStill(i); } catch (e) { /* keep sky fallback */ }
    }
    const previewShot = previewUnlocked ? zoneScreenshots[zoneSelectPreviewIdx] : null;
    const previewViewportInner = previewShot
      ? `<img class="preview-shot" alt="${previewTheme.name}" src="${previewShot}">`
      : (previewUnlocked
        ? ''
        : '<div class="preview-locked-label">LOCKED</div>');
    overlay.innerHTML = `
      <div class="menu-panel zone-select-panel scrollable-overlay-list">
        <div id="title" style="font-size:26px;">ZONE SELECT</div>
        <div class="zone-select-subtitle">WARP TO ANY UNLOCKED ZONE -- PRACTICE MODE, DOESN'T AFFECT BEST DISTANCE OR DEATH STATS. DEATHLESS CAN BE EARNED ON HARD.</div>
        <div class="zone-select-wrapper">
          <div class="zone-grid">${tilesHtml}</div>
          <div class="zone-preview-panel">
            <div>
              <div class="preview-viewport${previewUnlocked ? '' : ' locked'}" style="background: linear-gradient(180deg, ${previewTheme.skyTop}, ${previewTheme.skyMid}, ${previewTheme.skyBottom});">${previewViewportInner}</div>
              <div class="preview-details">
                <div class="preview-title">${zoneSelectPreviewIdx + 1}. ${previewTheme.name}</div>
                <div class="preview-stats">
                  <span>TYPE: ${zoneTypeLabel(previewTheme)}</span>
                  <span>STATUS: ${previewUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn-warp" data-action="warp-to-zone"${previewUnlocked ? '' : ' disabled'}>WARP TO ZONE &#9654;</button>
          </div>
        </div>
        <div id="sub-panel-back" data-action="back-to-options">&#9664; BACK</div>
      </div>
    `;
  } else if (state === 'ready') {
    const diffLabel = selectedDifficulty.toUpperCase();
    overlay.innerHTML = `
      <div id="title">HOLD TO FLY</div>
      <div id="subtitle">Difficulty: ${diffLabel}<br>${MOBILE_PERFORMANCE_MODE ? 'Tap and hold to rise, release to fall' : 'Hold left click or space to rise, release to fall'}<br>Fly through the shifting gates<br>New world every 1000 distance<br>${MAX_LIVES} lives per run</div>
    `;
  } else if (state === 'paused') {
    overlay.innerHTML = `
      <div class="menu-panel continue-panel">
        <div class="panel-header">PAUSED</div>
        <div class="menu-stack">
          <button type="button" class="btn-start-game" data-action="resume-game"><span>RESUME</span><span class="cta-arrow">&#9654;</span></button>
          <button type="button" class="btn-continue-secondary" data-action="open-pause-options">OPTIONS</button>
          <button type="button" class="btn-continue-secondary" data-action="quit-to-home">${isPracticeRun ? 'ZONE SELECT' : 'MAIN MENU'}</button>
        </div>
      </div>
    `;
  } else if (state === 'respawn') {
    overlay.innerHTML = `
      <div id="title">LIFE LOST</div>
      <div id="subtitle">${lives} ${lives === 1 ? 'life' : 'lives'} remaining<br>Died at ${lastDeathDistance}${currentTheme().isBossZone || currentTheme().isMiniBossZone ? '' : ' / ' + THEME_DISTANCE}<br>Restarting at the beginning of this zone<br>Click to continue</div>
    `;
  } else if (state === 'continue-prompt') {
    overlay.innerHTML = `
      <div class="menu-panel continue-panel">
        <div class="panel-header">CONTINUE?</div>
        <div class="continue-credit">${continuesRemaining}</div>
        <div class="continue-credit-label">${continuesRemaining === 1 ? 'CREDIT REMAINING' : 'CREDITS REMAINING'}</div>
        <div class="menu-stack">
          <button type="button" class="btn-start-game" data-action="use-continue"><span>CONTINUE</span><span class="cta-arrow">&#9654;</span></button>
          <button type="button" class="btn-continue-secondary" data-action="quit-to-home">${isPracticeRun ? 'ZONE SELECT' : 'MAIN MENU'}</button>
        </div>
      </div>
    `;
  } else if (state === 'gameover') {
    overlay.innerHTML = `
      <div id="title">GAME OVER</div>
      <div id="subtitle">Distance: ${Math.floor(maxDistanceReached)} &nbsp;|&nbsp; Best: ${best}<br>Click to try again</div>
    `;
  } else if (state === 'victory') {
    // rank tier based on total deaths across the run -- 0 deaths within
    // the S-Rank band is specifically called out as a "perfect run"
    const rankTier = rankTierForDeaths(totalDeaths);
    const rankLabel = rankTier === 'S'
      ? (totalDeaths === 0 ? 'PERFECT RUN &mdash; S RANK' : 'S RANK')
      : `${rankTier} RANK`;

    const clearTimeSeconds = Math.floor(clearTimeMs / 1000);
    const clearTimeLabel = `${Math.floor(clearTimeSeconds / 60)}:${String(clearTimeSeconds % 60).padStart(2, '0')}`;

    // natural reading order -- the grid (2 columns) fills left-to-right,
    // top-to-bottom on its own, so 01 sits next to 02, 03 next to 04, etc.
    const zoneRowHtml = (th, idx) => {
      const num = (idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1);
      const deaths = deathsByZone[th.name] || 0;
      return `<div class="zone-stat-row"><span><span class="skull">&#128128;</span> ${num} ${th.name}</span><span class="deaths">${deaths}</span></div>`;
    };
    const zoneRowsHtml = THEMES.map((th, idx) => zoneRowHtml(th, idx)).join('');

    const unlockBanner = justUnlockedExtraDifficulty
      ? `<div id="subtitle" style="font-size:14px; color:#ff0000; text-shadow:0 0 10px rgba(255,0,0,0.8); margin-top:12px;">&#128274; OVERDRIVE DIFFICULTY UNLOCKED</div>`
      : '';
    overlay.innerHTML = `
      <div id="title" style="font-size:38px; text-shadow: 0 0 12px var(--neon-cyan), 0 0 25px var(--neon-pink);">THE SIGNAL IS SILENCED</div>
      <div id="subtitle" style="font-size:15px; margin-top:28px;">The Signal has been destroyed. Synth Flight is complete.</div>
      ${unlockBanner}
      <div class="reward-card">
        <div class="rank-badge">
          <span class="star">&#9733;</span>
          <span class="rank-text">${rankLabel}</span>
          <span class="star">&#9733;</span>
        </div>
        <div class="stats-matrix">
          <div class="stat-box">
            <div class="stat-label">TOTAL DEATHS</div>
            <div class="stat-value">${totalDeaths}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">CLEAR TIME</div>
            <div class="stat-value">${clearTimeLabel}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">ZONES CLEARED</div>
            <div class="stat-value">${THEMES.length} / ${THEMES.length}</div>
          </div>
        </div>
        <div class="zone-breakdown-grid">
          ${zoneRowsHtml}
        </div>
        <button type="button" class="btn-continue">CLICK TO CONTINUE &#9654;</button>
      </div>
    `;
  } else if (state === 'playing' && showFlyControlsHint && !warpActive) {
    overlay.innerHTML = flyControlsHintHtml();
  } else {
    overlay.innerHTML = '';
  }
  if (__savedScrollTop !== null) {
    const __newScrollList = overlay.querySelector('.scrollable-overlay-list');
    if (__newScrollList) __newScrollList.scrollTop = __savedScrollTop;
  }
}

// ---- Dev tools ----
const devToggle = document.getElementById('dev-toggle');
const devPanel = document.getElementById('dev-panel');

if (DEV_TOOLS_ENABLED && devToggle && devPanel) {
  devToggle.addEventListener('click', () => {
    devPanel.classList.toggle('active');
  });
}

function devStatus(msg) {
  const el = document.getElementById('dev-status');
  if (el) el.textContent = msg;
}

function devJumpToTheme(idx) {
  if (state === 'ready' || state === 'gameover' || state === 'respawn' || state === 'victory' || state === 'continue-prompt') {
    resetGame();
    state = 'playing';
  }
  devSessionActive = true;
  devGracePeriodEndFrame = frame + DEV_GRACE_PERIOD_DURATION; // freeze the ship for a fixed window, so it survives however long the dev panel takes to navigate
  // reset distance tracking so the jumped-to zone behaves exactly like a
  // fresh zone entry (requires exactly 1000 distance), regardless of
  // whatever distance was accumulated before the jump
  distance = 0;
  themeLevelReached = 0;
  beginWarp(idx);
  devStatus('Warping to zone ' + (idx + 1) + '...');
}

function devSkipWarp() {
  if (warpActive) {
    finishWarp();
    devStatus('Warp skipped -- now in zone ' + (themeIndex + 1) + '.');
  } else {
    devStatus('Nothing to skip -- not currently warping. Jump to a zone first.');
  }
}

function devSkipToCorePhase6() {
  if (state === 'ready' || state === 'gameover' || state === 'respawn' || state === 'victory' || state === 'continue-prompt') {
    resetGame();
    state = 'playing';
  }
  devSessionActive = true;
  if (themeIndex !== 9) {
    distance = 0;
    themeLevelReached = 0;
    beginWarp(9);
  }
  while (warpActive) finishWarp();
  if (!miniBoss) {
    devStatus('Reactor Core boss not yet spawned -- click again in a moment.');
    return;
  }
  coreBossPhase = 6;
  coreSparkSpawned = 0;
  coreSparks = [];
  coreSparkPhaseStartFrame = frame;
  coreCrossfireRound = 0;
  const safeSlot = Math.floor(Math.random() * CORE_CROSSFIRE_SLOT_FRACS.length);
  coreCrossfireBeamYs = computeCrossfireBeamYs(safeSlot);
  miniBossAttackState = 'coreCrossfireTelegraph';
  miniBossAttackStateStartFrame = frame;
  ship.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / 2;
  ship.vy = 0;
  devGracePeriodEndFrame = frame + DEV_GRACE_PERIOD_DURATION;
  devStatus('Jumped to Reactor Core phase 6 (crossfire + sparks).');
}

function devSkipToCorePhase8() {
  if (state === 'ready' || state === 'gameover' || state === 'respawn' || state === 'victory' || state === 'continue-prompt') {
    resetGame();
    state = 'playing';
  }
  devSessionActive = true;
  if (themeIndex !== 9) {
    distance = 0;
    themeLevelReached = 0;
    beginWarp(9);
  }
  while (warpActive) finishWarp();
  if (!miniBoss) {
    devStatus('Reactor Core boss not yet spawned -- click again in a moment.');
    return;
  }
  miniBossSpawnFrame = frame - MINI_BOSS_ENTRANCE_DURATION - 1; // entrance animation is separate from the zone warp and runs on its own timer -- without this it fires independently a moment later and overwrites the state set below
  coreBossPhase = 8;
  miniBoss.x = Math.min(ship.x + CORE_SPHERE_X_OFFSET, miniBoss.restX);
  miniBoss.y = miniBoss.baseY;
  miniBoss.r = miniBoss.maxR;
  coreOrbitSpawned = 0;
  coreOrbitProjectiles = [];
  coreOrbitEmitAngle = 0;
  coreGateOpenAmount = 1;
  miniBossAttackState = 'coreOrbitBarrageActive';
  miniBossAttackStateStartFrame = frame;
  ship.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / 2;
  ship.vy = 0;
  coreEyeBeamState = 'track';
  coreEyeBeamStateStartFrame = frame;
  coreEyeBeamY = ship.y;
  coreTeslaState = 'charging';
  coreTeslaStateStartFrame = frame;
  coreTeslaProjectiles = [];
  coreTeslaEmptySlot = pickCoreTeslaEmptySlot();
  devGracePeriodEndFrame = frame + DEV_GRACE_PERIOD_DURATION;
  devStatus('Jumped to Reactor Core phase 8 (orbiting barrage).');
}

function devAddDistance() {
  if (state === 'ready' || state === 'respawn') state = 'playing';
  distance += 500;
  devStatus('Distance +500 (now ' + Math.floor(distance) + ').');
}

function devSetDistanceInZone(value) {
  if (state === 'ready' || state === 'respawn') state = 'playing';
  distance = zoneStartDistance + value;
  portalObject = null; // recompute cleanly from the new position
  devStatus('Jumped to ' + value + ' / ' + THEME_DISTANCE + ' in the current zone.');
}

function devUnlockEverything() {
  extraDifficultyUnlocked = true;
  unlockedZones = new Set(THEMES.map((_, i) => i));
  completedZones = new Set(THEMES.map((_, i) => i));
  deathlessZones = new Set(THEMES.map((_, i) => i));
  beatenDifficulties = new Set(['easy', 'normal', 'hard', 'extra']);
  achievedRanks = new Set(RANK_TIER_ORDER);
  if (totalDistanceTraveled < 200000) totalDistanceTraveled = 200000;
  if (!Array.isArray(zoneCompletionCounts) || zoneCompletionCounts.length < THEMES.length) {
    zoneCompletionCounts = new Array(THEMES.length).fill(0);
  }
  for (let i = 0; i < THEMES.length; i++) {
    zoneCompletionCounts[i] = Math.max(zoneCompletionCounts[i] || 0, 1);
  }
  savePlayerProfile();
  lastRenderedOverlayState = null;
  try { updateOverlay(); } catch (e) { /* overlay may not be ready */ }
  devStatus('Unlocked all zones, Overdrive, achievements, ranks, and distance milestones.');
}

const unlockAllBtn = document.createElement('button');
unlockAllBtn.textContent = 'Unlock everything';
unlockAllBtn.style.borderColor = '#ffd23f';
unlockAllBtn.style.color = '#ffd23f';
unlockAllBtn.addEventListener('click', devUnlockEverything);
devPanel.appendChild(unlockAllBtn);

THEMES.forEach((t, i) => {
  const btn = document.createElement('button');
  btn.textContent = (i + 1) + '. ' + t.name;
  btn.addEventListener('click', () => devJumpToTheme(i));
  devPanel.appendChild(btn);
});

const skipWarpBtn = document.createElement('button');
skipWarpBtn.textContent = 'Skip warp animation';
skipWarpBtn.addEventListener('click', devSkipWarp);
devPanel.appendChild(skipWarpBtn);

const skipCorePhase6Btn = document.createElement('button');
skipCorePhase6Btn.textContent = 'Jump to Reactor Core phase 6';
skipCorePhase6Btn.addEventListener('click', devSkipToCorePhase6);
devPanel.appendChild(skipCorePhase6Btn);

const skipCorePhase8Btn = document.createElement('button');
skipCorePhase8Btn.textContent = 'Jump to Reactor Core phase 8 (orbit barrage)';
skipCorePhase8Btn.addEventListener('click', devSkipToCorePhase8);
devPanel.appendChild(skipCorePhase8Btn);

const addDistBtn = document.createElement('button');
addDistBtn.textContent = '+500 distance (difficulty)';
addDistBtn.addEventListener('click', devAddDistance);
devPanel.appendChild(addDistBtn);

function devSkipToBossPhase3() {
  if (!currentTheme().isBossZone || !boss) {
    devStatus('Not in the boss zone.');
    return;
  }
  if (bossPhase >= 3 || bossTransitioning) {
    devStatus('Already at phase ' + bossPhase + (bossTransitioning ? ' (mid-transition)' : '') + ' -- ignoring, this would yank the boss backward.');
    return;
  }
  // the ship has likely been falling under gravity the whole time
  // spent navigating the dev panel to reach this button -- recenter
  // it so the skip doesn't get immediately undone by a boundary crash
  ship.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / 2;
  ship.vy = 0;
  devGracePeriodEndFrame = frame + DEV_GRACE_PERIOD_DURATION;
  bossSpawnFrame = frame - BOSS_ENTRANCE_DURATION; // ensure entrance is already complete
  const elapsedTarget = BOSS_PHASE_DURATION * 2 + 10; // just past the phase 2/3 boundary
  bossTimer = Math.round(currentTheme().bossDuration - elapsedTarget);
  bossPhase = 2; // so the transition trigger fires naturally on the next update
  bossTransitioning = false;
  gates = gates.filter(g => !BOSS_HAZARD_TYPES.includes(g.type)); // battlefield already clear
  bossWaitingForClear = true; // will immediately proceed to the transformation since gates has no hazards
  bossWaitingForClearStartFrame = frame;
  bossWaitingForClearTargetPhase = 3;
  devStatus('Skipped to the phase 2->3 transition (ship recentered, battlefield cleared) -- it will play out (~3s), then phase 3 begins.');
}

function devSkipToBossPhase4() {
  if (!currentTheme().isBossZone || !boss) {
    devStatus('Not in the boss zone.');
    return;
  }
  if (bossPhase >= 4 || bossTransitioning) {
    devStatus('Already at phase ' + bossPhase + (bossTransitioning ? ' (mid-transition)' : '') + ' -- ignoring, this would yank the boss backward.');
    return;
  }
  ship.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / 2;
  ship.vy = 0;
  devGracePeriodEndFrame = frame + DEV_GRACE_PERIOD_DURATION;
  bossSpawnFrame = frame - BOSS_ENTRANCE_DURATION;
  const elapsedTarget = BOSS_PHASE_DURATION * 3 + 10; // just past the phase 3/4 boundary
  bossTimer = Math.round(currentTheme().bossDuration - elapsedTarget);
  bossPhase = 3;
  bossTransitioning = false;
  devStatus('Skipped to phase 4 (ship recentered) -- instant, no transition sequence.');
}

function devSkipToBossPhase5() {
  if (!currentTheme().isBossZone || !boss) {
    devStatus('Not in the boss zone.');
    return;
  }
  if (bossPhase >= 5 || bossTransitioning) {
    devStatus('Already at phase ' + bossPhase + (bossTransitioning ? ' (mid-transition)' : '') + ' -- ignoring, this would yank the boss backward.');
    return;
  }
  ship.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / 2;
  ship.vy = 0;
  devGracePeriodEndFrame = frame + DEV_GRACE_PERIOD_DURATION;
  bossSpawnFrame = frame - BOSS_ENTRANCE_DURATION;
  const elapsedTarget = BOSS_PHASE_DURATION * 4 + 10; // just past the phase 4/5 boundary
  bossTimer = Math.round(currentTheme().bossDuration - elapsedTarget);
  bossPhase = 4;
  bossTransitioning = false;
  gates = gates.filter(g => !BOSS_HAZARD_TYPES.includes(g.type)); // battlefield already clear
  bossWaitingForClear = true; // will immediately proceed to the transformation since gates has no hazards
  bossWaitingForClearStartFrame = frame;
  bossWaitingForClearTargetPhase = 5;
  devStatus('Skipped to phase 5 -- battlefield cleared, shatter-and-reform transformation begins next frame.');
}

function devWarpToVictory() {
  if (state === 'ready' || state === 'gameover' || state === 'respawn' || state === 'continue-prompt') {
    resetGame();
    state = 'playing';
  }
  isPracticeRun = false;
  devSessionActive = true;
  themeIndex = 12; // The Signal, the final zone
  themeLevelReached = 12;
  triggerVictory();
  devStatus('Warped straight to the victory screen (dev preview -- not recorded to your save).');
}

const skipPhase3Btn = document.createElement('button');
skipPhase3Btn.textContent = 'Skip to boss phase 3';
skipPhase3Btn.addEventListener('click', devSkipToBossPhase3);
devPanel.appendChild(skipPhase3Btn);

const skipPhase4Btn = document.createElement('button');
skipPhase4Btn.textContent = 'Skip to boss phase 4';
skipPhase4Btn.addEventListener('click', devSkipToBossPhase4);
devPanel.appendChild(skipPhase4Btn);

const skipPhase5Btn = document.createElement('button');
skipPhase5Btn.textContent = 'Skip to boss phase 5';
skipPhase5Btn.addEventListener('click', devSkipToBossPhase5);
devPanel.appendChild(skipPhase5Btn);

const warpToVictoryBtn = document.createElement('button');
warpToVictoryBtn.textContent = 'Warp to victory screen';
warpToVictoryBtn.addEventListener('click', devWarpToVictory);
devPanel.appendChild(warpToVictoryBtn);

const triggerBeamBtn = document.createElement('button');
triggerBeamBtn.textContent = 'Trigger charge beam';
triggerBeamBtn.addEventListener('click', () => {
  if (bossPhase !== 5 || bossTransitioning) {
    devStatus('Not in phase 5 (or mid-transition) -- skip to phase 5 first.');
    return;
  }
  spawnBossChargeBeamTelegraph();
  devStatus('Charge beam telegraph spawned, locked to current ship position.');
});
devPanel.appendChild(triggerBeamBtn);

const jump750Btn = document.createElement('button');
jump750Btn.textContent = 'Start at 750 in zone';
jump750Btn.addEventListener('click', () => devSetDistanceInZone(750));
devPanel.appendChild(jump750Btn);

const ghostBtn = document.createElement('button');
ghostBtn.textContent = 'Ghost Mode: Off';
ghostBtn.addEventListener('click', () => {
  ghostMode = !ghostMode;
  ghostBtn.textContent = 'Ghost Mode: ' + (ghostMode ? 'On' : 'Off');
  devStatus(ghostMode
    ? 'Ghost mode on -- full noclip. Hazards, walls, and pull fields cannot kill you. Portal still works.'
    : 'Ghost mode off -- normal collision restored.');
});
devPanel.appendChild(ghostBtn);

const gridFadeBtn = document.createElement('button');
gridFadeBtn.textContent = 'Boss Grid Fade: On';
gridFadeBtn.addEventListener('click', () => {
  bossGridFadeEnabled = !bossGridFadeEnabled;
  gridFadeBtn.textContent = 'Boss Grid Fade: ' + (bossGridFadeEnabled ? 'On' : 'Off');
  devStatus(bossGridFadeEnabled
    ? 'Grid will fade out during the phase 3 color transition.'
    : 'Grid stays visible through the phase 3 color transition.');
});
devPanel.appendChild(gridFadeBtn);

const ashVariantBtn = document.createElement('button');
ashVariantBtn.textContent = 'Phase 5 Ash: Gray';
ashVariantBtn.addEventListener('click', () => {
  bossAshGrayVariant = !bossAshGrayVariant;
  ashVariantBtn.textContent = 'Phase 5 Ash: ' + (bossAshGrayVariant ? 'Gray' : 'Red');
  devStatus('Phase 5 ash background switched to ' + (bossAshGrayVariant ? 'gray' : 'red') + ' tint.');
});
devPanel.appendChild(ashVariantBtn);

const CUSTOM_LEVEL_STORAGE_KEYS = ['zone4-terrain-custom', 'bolt-patterns-custom', 'blackhole-events-custom', 'windvortex-events-custom', 'cloudarc-events-custom', 'lensingzone-events-custom', 'supernova-events-custom', 'turret-events-custom', 'emp-events-custom', 'orb-events-custom'];

function collectCustomLevelDataFromThemes() {
  return {
    _version: (window.SHIPPED_CUSTOM_LEVELS && window.SHIPPED_CUSTOM_LEVELS._version) || 'snes229',
    'bolt-patterns-custom': THEMES.map(t => t.obstacleShape === 'lbolt' ? t.pattern : null),
    'blackhole-events-custom': THEMES.map(t => t.blackHoleEvents || null),
    'windvortex-events-custom': THEMES.map(t => t.windVortexEvents || null),
    'cloudarc-events-custom': THEMES.map(t => t.cloudArcEvents || null),
    'lensingzone-events-custom': THEMES.map(t => t.lensingZoneEvents || null),
    'supernova-events-custom': THEMES.map(t => t.supernovaEvents || null),
    'turret-events-custom': THEMES.map(t => t.turretEvents || null),
    'emp-events-custom': THEMES.map(t => t.empEvents || null),
    'orb-events-custom': THEMES.map(t => t.pulsingOrbEvents || null)
  };
}

function downloadBakedCustomLevels() {
  const data = collectCustomLevelDataFromThemes();
  const text = 'window.SHIPPED_CUSTOM_LEVELS = ' + JSON.stringify(data, null, 2) + ';\n';
  const blob = new Blob([text], { type: 'text/javascript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'custom-levels.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const exportCustomBtn = document.createElement('button');
exportCustomBtn.textContent = 'Export Saved Custom Data';
const importCustomBtn = document.createElement('button');
importCustomBtn.textContent = 'Import Custom Data (from textarea)';
const bakeCustomBtn = document.createElement('button');
bakeCustomBtn.textContent = 'Download custom-levels.js (bake into project)';
const clearLocalCustomBtn = document.createElement('button');
clearLocalCustomBtn.textContent = 'Clear local custom overrides';
const exportTextarea = document.createElement('textarea');
exportTextarea.style.cssText = 'display:none; width:100%; height:200px; margin-top:8px; font-family:monospace; font-size:11px; background:#0d0221; color:#0ff0fc; border:1px solid #ff2079;';
exportCustomBtn.addEventListener('click', async () => {
  devStatus('Reading saved custom data from storage...');
  const out = {};
  for (const k of CUSTOM_LEVEL_STORAGE_KEYS) {
    try {
      const result = await window.storage.get(k);
      const parsed = parseStoredCustom(result && result.value);
      if (parsed) out[k] = parsed;
    } catch (e) { /* key not saved, skip */ }
  }
  const foundCount = Object.keys(out).length;
  if (foundCount === 0) {
    devStatus('No saved custom data found in storage. Paste JSON below and use Import.');
    exportTextarea.style.display = 'block';
  } else {
    devStatus('Found ' + foundCount + ' saved custom dataset(s). Copy the text below and send it back.');
    exportTextarea.style.display = 'block';
    exportTextarea.value = JSON.stringify(out, null, 2);
    exportTextarea.focus();
    exportTextarea.select();
  }
});
importCustomBtn.addEventListener('click', async () => {
  let data;
  try {
    data = JSON.parse(exportTextarea.value);
  } catch (e) {
    exportTextarea.style.display = 'block';
    devStatus('Import failed — paste the exported JSON into the box first.');
    return;
  }
  let imported = 0;
  for (const k of CUSTOM_LEVEL_STORAGE_KEYS) {
    if (data[k] == null) continue;
    try {
      await window.storage.set(k, JSON.stringify(data[k]));
      imported++;
    } catch (e) { /* skip */ }
  }
  if (imported === 0) {
    devStatus('Import found no recognized custom-level keys.');
    return;
  }
  await applyAllCustomLevelData();
  await loadCustomTerrain();
  devStatus('Imported ' + imported + ' custom dataset(s). Reloaded into themes.');
});
bakeCustomBtn.addEventListener('click', async () => {
  const data = collectCustomLevelDataFromThemes();
  for (const [k, v] of Object.entries(data)) {
    try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { /* skip */ }
  }
  downloadBakedCustomLevels();
  exportTextarea.style.display = 'block';
  exportTextarea.value = JSON.stringify(data, null, 2);
  devStatus('Downloaded custom-levels.js. Replace the file in the project folder, then hard-refresh. Editor Save first if you still have unsaved moves.');
});
clearLocalCustomBtn.addEventListener('click', async () => {
  for (const k of CUSTOM_LEVEL_STORAGE_KEYS) {
    try { await window.storage.set(k, ''); } catch (e) { /* skip */ }
    try { localStorage.removeItem(GAME_STORAGE_PREFIX + k); } catch (e) { /* skip */ }
  }
  await applyAllCustomLevelData();
  await loadCustomTerrain();
  devStatus('Cleared local overrides. Using shipped custom-levels.js layouts.');
});
devPanel.appendChild(exportCustomBtn);
devPanel.appendChild(importCustomBtn);
devPanel.appendChild(bakeCustomBtn);
devPanel.appendChild(clearLocalCustomBtn);
devPanel.appendChild(exportTextarea);

const fireballSpeedSlider = document.getElementById('fireball-speed-slider');
const fireballSpeedValue = document.getElementById('fireball-speed-value');
if (DEV_TOOLS_ENABLED && fireballSpeedSlider && fireballSpeedValue) {
  fireballSpeedSlider.addEventListener('input', () => {
    fireballSpeedMult = parseFloat(fireballSpeedSlider.value);
    fireballSpeedValue.textContent = fireballSpeedMult.toFixed(1);
    devStatus('Flame speed set to ' + fireballSpeedMult.toFixed(1) + 'x world scroll.');
  });
}

window.addEventListener('keydown', (e) => {
  if (!DEV_TOOLS_ENABLED) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= THEMES.length) {
    devJumpToTheme(num - 1);
  }
});

// ---- Zone 2 hand-drawn cave editor ----
const editorCanvas = document.getElementById('editorCanvas');
const editorCtx = editorCanvas.getContext('2d');
const editorOverlay = document.getElementById('editor-overlay');
const editorToggleBtn = document.getElementById('editor-toggle');
const editorStatus = document.getElementById('editor-status');
const editorToggleCustomBtn = document.getElementById('editor-toggle-custom');

let editorMode = false;
let editorTool = 'top';
let editorPanX = 0;
let editorDrawing = false;
let editorLastLevelX = null;

function resizeEditorCanvas() {
  editorCanvas.width = editorCanvas.clientWidth;
  editorCanvas.height = editorCanvas.clientHeight;
}

function editorPlayTopBottom() {
  // mirrors the real game's proportions, using the editor canvas's own height
  const margin = editorCanvas.height * 0.08;
  return { top: margin, bottom: editorCanvas.height - margin };
}

function openEditor() {
  editorMode = true;
  editorOverlay.classList.add('active');
  resizeEditorCanvas();
  updateEditorToggleCustomLabel();
  requestAnimationFrame(drawEditorLoop);
}

function closeEditor() {
  editorMode = false;
  editorOverlay.classList.remove('active');
}

function updateEditorToggleCustomLabel() {
  editorToggleCustomBtn.textContent = 'Using: ' + (useCustomTerrain ? 'Custom' : 'Procedural');
}

editorToggleBtn.addEventListener('click', openEditor);
document.getElementById('editor-close').addEventListener('click', closeEditor);

document.getElementById('tool-top').addEventListener('click', () => {
  editorTool = 'top';
  document.getElementById('tool-top').classList.add('tool-active');
  document.getElementById('tool-bottom').classList.remove('tool-active');
});
document.getElementById('tool-bottom').addEventListener('click', () => {
  editorTool = 'bottom';
  document.getElementById('tool-bottom').classList.add('tool-active');
  document.getElementById('tool-top').classList.remove('tool-active');
});

document.getElementById('editor-clear').addEventListener('click', () => {
  customTerrainZone2 = defaultCustomTerrain();
  editorStatus.textContent = 'Reset to flat.';
});

document.getElementById('editor-save').addEventListener('click', async () => {
  editorStatus.textContent = 'Saving...';
  const ok = await saveCustomTerrain();
  editorStatus.textContent = ok ? 'Saved!' : 'Save failed (kept in memory only).';
  updateEditorToggleCustomLabel();
});

document.getElementById('editor-toggle-custom').addEventListener('click', () => {
  useCustomTerrain = !useCustomTerrain;
  updateEditorToggleCustomLabel();
  editorStatus.textContent = useCustomTerrain ? 'Custom level active in-game.' : 'Procedural pattern active in-game.';
});

document.getElementById('editor-test').addEventListener('click', () => {
  closeEditor();
  devJumpToTheme(3);
});

function editorScreenToLevel(clientX, clientY) {
  const rect = editorCanvas.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;
  const levelX = ((px + editorPanX) % EDITOR_LEVEL_LENGTH + EDITOR_LEVEL_LENGTH) % EDITOR_LEVEL_LENGTH;
  const { top, bottom } = editorPlayTopBottom();
  const frac = Math.max(0, Math.min(1, (py - top) / (bottom - top)));
  return { levelX, frac };
}

function applyEditorPoint(levelX, frac, fromLevelX) {
  const n = customTerrainZone2.length;
  const idx = Math.round(levelX / EDITOR_SAMPLE_SPACING) % n;

  function setOne(i, f) {
    const point = customTerrainZone2[i];
    if (editorTool === 'top') {
      point.topFrac = Math.min(f, point.bottomFrac - EDITOR_MIN_GAP_FRAC);
      point.topFrac = Math.max(0, point.topFrac);
    } else {
      point.bottomFrac = Math.max(f, point.topFrac + EDITOR_MIN_GAP_FRAC);
      point.bottomFrac = Math.min(1, point.bottomFrac);
    }
  }

  if (fromLevelX === null || fromLevelX === undefined) {
    setOne(idx, frac);
    return;
  }
  // interpolate across fast drags so the stroke has no gaps
  let a = Math.round(fromLevelX / EDITOR_SAMPLE_SPACING);
  let b = idx;
  const steps = Math.min(40, Math.abs(b - a) + 1);
  for (let s = 0; s <= steps; s++) {
    const t = steps === 0 ? 0 : s / steps;
    const i = Math.round((a + (b - a) * t)) % n;
    setOne(((i % n) + n) % n, frac);
  }
}

function editorPointerDown(clientX, clientY) {
  editorDrawing = true;
  const { levelX, frac } = editorScreenToLevel(clientX, clientY);
  applyEditorPoint(levelX, frac, null);
  editorLastLevelX = levelX;
}
function editorPointerMove(clientX, clientY) {
  if (!editorDrawing) return;
  const { levelX, frac } = editorScreenToLevel(clientX, clientY);
  applyEditorPoint(levelX, frac, editorLastLevelX);
  editorLastLevelX = levelX;
}
function editorPointerUp() {
  editorDrawing = false;
  editorLastLevelX = null;
}

editorCanvas.addEventListener('mousedown', (e) => editorPointerDown(e.clientX, e.clientY));
editorCanvas.addEventListener('mousemove', (e) => editorPointerMove(e.clientX, e.clientY));
window.addEventListener('mouseup', editorPointerUp);
editorCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  editorPointerDown(t.clientX, t.clientY);
}, { passive: false });
editorCanvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  editorPointerMove(t.clientX, t.clientY);
}, { passive: false });
editorCanvas.addEventListener('touchend', editorPointerUp);

editorCanvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  editorPanX = Math.max(0, Math.min(EDITOR_LEVEL_LENGTH - editorCanvas.width, editorPanX + e.deltaY + e.deltaX));
}, { passive: false });

function drawEditor() {
  const w = editorCanvas.width, h = editorCanvas.height;
  editorCtx.clearRect(0, 0, w, h);
  editorCtx.fillStyle = '#000d05';
  editorCtx.fillRect(0, 0, w, h);

  const { top, bottom } = editorPlayTopBottom();

  // vertical rulers every 200 level-space px
  editorCtx.strokeStyle = 'rgba(255,204,51,0.15)';
  editorCtx.fillStyle = 'rgba(255,204,51,0.4)';
  editorCtx.font = '10px Courier New';
  editorCtx.lineWidth = 1;
  const firstMark = Math.floor(editorPanX / 200) * 200;
  for (let lx = firstMark; lx < editorPanX + w + 200; lx += 200) {
    const sx = lx - editorPanX;
    editorCtx.beginPath();
    editorCtx.moveTo(sx, 0);
    editorCtx.lineTo(sx, h);
    editorCtx.stroke();
    editorCtx.fillText(String(Math.round(((lx % EDITOR_LEVEL_LENGTH) + EDITOR_LEVEL_LENGTH) % EDITOR_LEVEL_LENGTH)), sx + 3, 12);
  }

  // loop point marker
  const loopSx = EDITOR_LEVEL_LENGTH - editorPanX;
  if (loopSx > -50 && loopSx < w + 50) {
    editorCtx.strokeStyle = '#ff2079';
    editorCtx.setLineDash([6, 6]);
    editorCtx.beginPath();
    editorCtx.moveTo(loopSx, 0);
    editorCtx.lineTo(loopSx, h);
    editorCtx.stroke();
    editorCtx.setLineDash([]);
    editorCtx.fillStyle = '#ff2079';
    editorCtx.fillText('LOOP END', loopSx + 4, h - 6);
  }

  // draw top/bottom shapes across visible window
  const n = customTerrainZone2.length;
  editorCtx.fillStyle = 'rgba(255,204,51,0.5)';
  editorCtx.beginPath();
  editorCtx.moveTo(0, top - 4);
  for (let sx = 0; sx <= w; sx += 4) {
    const levelX = ((sx + editorPanX) % EDITOR_LEVEL_LENGTH + EDITOR_LEVEL_LENGTH) % EDITOR_LEVEL_LENGTH;
    const s = sampleCustomTerrainAt(levelX);
    editorCtx.lineTo(sx, top + s.topFrac * (bottom - top));
  }
  editorCtx.lineTo(w, top - 4);
  editorCtx.closePath();
  editorCtx.fill();

  editorCtx.fillStyle = 'rgba(255,51,0,0.5)';
  editorCtx.beginPath();
  editorCtx.moveTo(0, bottom + 4);
  for (let sx = 0; sx <= w; sx += 4) {
    const levelX = ((sx + editorPanX) % EDITOR_LEVEL_LENGTH + EDITOR_LEVEL_LENGTH) % EDITOR_LEVEL_LENGTH;
    const s = sampleCustomTerrainAt(levelX);
    editorCtx.lineTo(sx, top + s.bottomFrac * (bottom - top));
  }
  editorCtx.lineTo(w, bottom + 4);
  editorCtx.closePath();
  editorCtx.fill();

  editorCtx.fillStyle = 'rgba(255,255,255,0.5)';
  editorCtx.font = '11px Courier New';
  editorCtx.fillText('TOP WALL', 8, top + 14);
  editorCtx.fillText('BOTTOM WALL', 8, bottom - 6);
}

function sampleCustomTerrainAt(levelX) {
  // like sampleCustomTerrain() but safe to call before a game is active
  const n = customTerrainZone2.length;
  const idxF = (levelX / EDITOR_SAMPLE_SPACING) % (n - 1);
  const i0 = Math.floor(idxF);
  const i1 = (i0 + 1) % n;
  const t = idxF - i0;
  const a = customTerrainZone2[i0], b = customTerrainZone2[i1];
  return {
    topFrac: a.topFrac + (b.topFrac - a.topFrac) * t,
    bottomFrac: a.bottomFrac + (b.bottomFrac - a.bottomFrac) * t
  };
}

function drawEditorLoop() {
  if (!editorMode) return;
  drawEditor();
  requestAnimationFrame(drawEditorLoop);
}

window.addEventListener('resize', () => {
  if (editorMode) resizeEditorCanvas();
});

// ---- Zone preview: simulate a full 1000-distance span for any zone,
// re-using the exact same generation functions as live gameplay, then
// render it all on one wide static map so problem spots can be spotted
// without playing through
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const previewOverlay = document.getElementById('preview-overlay');
const previewStatus = document.getElementById('preview-status');

function captureSimState() {
  return {
    gates, patternIndex, lastSpawnX, fireballSpawnCounter,
    terrainSegments, terrainSegmentsSinceEntry, terrainLevelX,
    terrainWaypointTarget, terrainWaypointSegLeft, terrainWaypointSegTotal, terrainWaypointGapTarget, terrainWaypointIslandTarget, terrainWaypointIslandFrom,
    terrainWaypointNosePower, terrainWaypointTaperShare, terrainWaypointTaperCap,
    terrainWaypointIslandShape, terrainWaypointIslandLabel, terrainWaypointIslandBias,
    themeIndex, distance, frame, ship: { x: ship.x, y: ship.y, vy: ship.vy, rotation: ship.rotation }
  };
}

function restoreSimState(s) {
  gates = s.gates; patternIndex = s.patternIndex; lastSpawnX = s.lastSpawnX;
  fireballSpawnCounter = s.fireballSpawnCounter;
  terrainSegments = s.terrainSegments; terrainSegmentsSinceEntry = s.terrainSegmentsSinceEntry;
  terrainLevelX = s.terrainLevelX;
  terrainWaypointTarget = s.terrainWaypointTarget; terrainWaypointSegLeft = s.terrainWaypointSegLeft;
  terrainWaypointSegTotal = s.terrainWaypointSegTotal || 1;
  terrainWaypointGapTarget = s.terrainWaypointGapTarget; terrainWaypointIslandTarget = s.terrainWaypointIslandTarget;
  terrainWaypointIslandFrom = s.terrainWaypointIslandFrom || 0;
  terrainWaypointNosePower = s.terrainWaypointNosePower || 1;
  terrainWaypointTaperShare = s.terrainWaypointTaperShare || 0.32;
  terrainWaypointTaperCap = s.terrainWaypointTaperCap || 5;
  terrainWaypointIslandShape = s.terrainWaypointIslandShape || '';
  terrainWaypointIslandLabel = s.terrainWaypointIslandLabel || '';
  terrainWaypointIslandBias = s.terrainWaypointIslandBias || 0;
  themeIndex = s.themeIndex; distance = s.distance; frame = s.frame;
  ship.x = s.ship.x; ship.y = s.ship.y; ship.vy = s.ship.vy; ship.rotation = s.ship.rotation;
}

function simulateZonePreview(themeIdx, targetDistance) {
  const saved = captureSimState();

  themeIndex = themeIdx;
  distance = 0;
  frame = 0;
  gates = [];
  patternIndex = 0;
  lastSpawnX = 0;
  fireballSpawnCounter = 0;
  terrainSegmentsSinceEntry = 0;
  terrainLevelX = 0;
  terrainWaypointTarget = null;
  terrainWaypointSegLeft = 0;
  terrainWaypointSegTotal = 1;
  terrainWaypointIslandFrom = 0;
  terrainWaypointNosePower = 1;
  terrainWaypointTaperShare = 0.32;
  terrainWaypointTaperCap = 5;
  terrainWaypointIslandShape = '';
  terrainWaypointIslandLabel = '';
  terrainWaypointIslandBias = 0;
  terrainMeanderIndex = 0;
  ship.x = 0;
  ship.y = (PLAY_TOP + PLAY_BOTTOM) / 2;

  const th = THEMES[themeIdx];
  const targetPx = targetDistance * 10;
  const result = { themeIndex: themeIdx, obstacles: [], terrainSegments: null };

  if (th.obstacleShape === 'terrain') {
    initTerrain();
    let guard = 0;
    while (terrainSegments[terrainSegments.length - 1].x < targetPx && guard < 5000) {
      addTerrainSegment();
      distance = terrainSegments[terrainSegments.length - 1].x / 10;
      guard++;
    }
    result.terrainSegments = terrainSegments.map(s => ({ ...s }));
  } else if (th.obstacleShape === 'fireball') {
    // timer-based spawner, not position-based -- step it like the real update loop
    let x = 0;
    let counter = 0;
    let guard = 0;
    while (x < targetPx && guard < 5000) {
      counter++;
      const interval = Math.max(50, (th.fireballIntervalBase || 100) - distance * 0.01);
      if (counter >= interval) {
        spawnFireball();
        const last = gates[gates.length - 1];
        last.previewX = x;
        counter = 0;
      }
      x += 4;
      distance = x / 10;
      guard++;
    }
    result.obstacles = gates.map(g => ({ ...g, x: g.previewX !== undefined ? g.previewX : g.x }));
  } else if (th.obstacleShape === 'none') {
    // event-based zone -- place each hand-placed event directly at its
    // trigger-distance position rather than stepping through a
    // spacing/timer loop
    const playHeight = PLAY_BOTTOM - PLAY_TOP;
    const margin = 15;
    if (th.blackHoleEvents) for (const [idx, event] of th.blackHoleEvents.entries()) {
      gates.push({
        type: 'blackhole',
        x: event.triggerDistance * 10,
        y: PLAY_TOP + margin + event.yFrac * Math.max(1, playHeight - margin * 2),
        coreR: event.coreR,
        reachR: event.reachR,
        rotSeed: 0,
        passed: false,
        previewX: event.triggerDistance * 10,
        _eventIdx: idx
      });
    }
    if (th.lensingZoneEvents) {
      for (const [idx, event] of th.lensingZoneEvents.entries()) {
        gates.push({
          type: 'lensingzone',
          x: event.triggerDistance * 10,
          y: PLAY_TOP + margin + event.yFrac * Math.max(1, playHeight - margin * 2),
          coreR: event.coreR,
          zoneRadius: event.zoneRadius,
          rotSeed: 0,
          passed: false,
          previewX: event.triggerDistance * 10,
          _lensIdx: idx
        });
      }
    }
    if (th.supernovaEvents) {
      for (const [idx, event] of th.supernovaEvents.entries()) {
        gates.push({
          type: 'supernova',
          x: event.triggerDistance * 10,
          y: PLAY_TOP + margin + event.yFrac * Math.max(1, playHeight - margin * 2),
          planetR: event.planetR,
          dormantFrames: event.dormantFrames,
          warningFrames: event.warningFrames,
          detonated: false,
          rotSeed: 0,
          passed: false,
          previewX: event.triggerDistance * 10,
          _novaIdx: idx
        });
      }
    }
    if (th.turretEvents) {
      for (const [idx, event] of th.turretEvents.entries()) {
        const y = event.anchor === 'top' ? PLAY_TOP + event.mountOffset : PLAY_BOTTOM - event.mountOffset;
        gates.push({
          type: 'turret',
          x: event.triggerDistance * 10,
          y: y,
          anchor: event.anchor,
          fireAngleDeg: event.fireAngleDeg || 0,
          numShots: event.numShots,
          fireInterval: event.fireInterval,
          rotSeed: 0,
          passed: false,
          previewX: event.triggerDistance * 10,
          _turretIdx: idx
        });
      }
    }
    if (th.empEvents) {
      for (const [idx, event] of th.empEvents.entries()) {
        gates.push({
          type: 'emp',
          x: event.triggerDistance * 10,
          anchor: event.anchor,
          reachDepth: event.reachDepth,
          chargeFrames: event.chargeFrames,
          dischargeFrames: event.dischargeFrames,
          spawnFrame: 0,
          rotSeed: 0,
          passed: false,
          previewX: event.triggerDistance * 10,
          _empIdx: idx
        });
      }
    }
    if (th.pulsingOrbEvents) {
      const playHeight2 = PLAY_BOTTOM - PLAY_TOP;
      for (const [idx, event] of th.pulsingOrbEvents.entries()) {
        gates.push({
          type: 'pulsingorb',
          x: event.triggerDistance * 10,
          y: PLAY_TOP + playHeight2 / 2,
          minR: event.minR,
          maxR: event.maxR,
          period: event.period,
          spawnFrame: 0,
          rotSeed: 0,
          passed: false,
          previewX: event.triggerDistance * 10,
          _orbIdx: idx
        });
      }
    }
    result.obstacles = gates.map(g => ({ ...g, x: g.previewX !== undefined ? g.previewX : g.x }));
  } else {
    // real gameplay's initial upfront spawn starts at ship.x + 420, not 0 --
    // matching that offset here (ship.x is 0 in this preview simulation) is
    // what makes bolt positions actually line up with event-based hazards
    // like wind vortex, which are placed directly at triggerDistance*10
    let x = 420;
    let guard = 0;
    while (x < targetPx && guard < 2000) {
      const gateCountBefore = gates.length;
      const gapAtSpawn = !th.obstacleShape ? currentGapSize() : null;
      const entryIdxUsed = patternIndex % th.pattern.length;
      const spacing = spawnGate(x);
      for (let i = gateCountBefore; i < gates.length; i++) {
        gates[i].previewGap = gapAtSpawn;
        gates[i]._entryIdx = entryIdxUsed;
        gates[i]._boltIdx = i - gateCountBefore;
      }
      x += spacing || 300;
      distance = x / 10;
      guard++;
    }
    result.obstacles = gates.map(g => ({ ...g }));
  }

  // secondary layer, independent of obstacleShape: wind vortex events run
  // alongside whatever primary hazard the zone uses (matches how the real
  // gameplay trigger check works -- it's never gated on obstacleShape)
  if (th.windVortexEvents) {
    const playHeightV = PLAY_BOTTOM - PLAY_TOP;
    const marginV = 15;
    th.windVortexEvents.forEach((event, idx) => {
      result.obstacles.push({
        type: 'windvortex',
        x: event.triggerDistance * 10,
        y: PLAY_TOP + marginV + event.yFrac * Math.max(1, playHeightV - marginV * 2),
        reachR: event.reachR,
        rotSeed: idx * 5.1,
        passed: false,
        previewX: event.triggerDistance * 10,
        _vortexIdx: idx
      });
    });
  }
  if (th.cloudArcEvents) {
    const playHeightA = PLAY_BOTTOM - PLAY_TOP;
    const marginA = 20;
    th.cloudArcEvents.forEach((event, idx) => {
      const x1 = event.triggerDistance * 10;
      const cycleLength = event.onFrames + event.offFrames;
      const jitter = [];
      for (let i = 0; i < 7; i++) jitter.push((i % 2 ? 0.7 : -0.7) * (0.4 + (i % 3) * 0.2));
      result.obstacles.push({
        type: 'cloudarc',
        x: x1,
        y: PLAY_TOP + marginA + event.y1Frac * Math.max(1, playHeightA - marginA * 2),
        x2: x1 + event.spanPx,
        y2: PLAY_TOP + marginA + event.y2Frac * Math.max(1, playHeightA - marginA * 2),
        onFrames: event.onFrames,
        offFrames: event.offFrames,
        cycleLength,
        phaseOffset: Math.round(event.phaseFrac * cycleLength),
        jitter,
        branchT: 0.42,
        branchSide: idx % 2 ? -1 : 1,
        branchLen: 52,
        branchAngleJitter: 0.12,
        passed: false,
        previewX: x1,
        _arcIdx: idx
      });
    });
  }

  restoreSimState(saved);
  return result;
}

// Runs the REAL game engine -- reseedZoneObstacles() then the actual
// per-frame update() loop -- to capture the exact obstacle set a real
// playthrough would produce, rather than a second, separate approximation
// of the spawn logic that can quietly drift out of sync with it. Ghost
// mode plus an extended grace period keep the ship completely safe
// throughout (frozen in place, no collisions, no forces) so nothing here
// can end the run early; nothing about this affects the real game, since
// all touched state is restored before returning.
function captureFullZoneRun(themeIdx, targetDistance) {
  const saved = captureSimState();
  const savedGhost = ghostMode;
  const savedGrace = devGracePeriodEndFrame;
  const savedState = state;
  const savedZoneStartDistance = zoneStartDistance;
  const savedZoneStartFrame = zoneStartFrame;
  const savedWarpActive = warpActive;
  const savedPortalObject = portalObject;
  const savedEventFlags = {
    specialEventsSpawned, blackHoleEventsSpawned, windVortexEventsSpawned, cloudArcEventsSpawned, lightningStrikeEventsSpawned, lasergridEventsSpawned,
    droneSwarmEventsSpawned, billboardEventsSpawned, searchlightEventsSpawned,
    turretEventsSpawned, signalCorruptionEventsSpawned, empEventsSpawned,
    echoTrailEventsSpawned, pulsingOrbEventsSpawned, boomerangEventsSpawned,
    oncomingCometEventsSpawned, splitRockEventsSpawned, lensingZoneEventsSpawned, supernovaEventsSpawned,
  };
  // the update() loop this capture drives processes mini boss fight logic
  // exactly like real gameplay -- without saving/restoring it, previewing
  // this zone in the editor could advance or even complete the fight
  // internally, leaking that progress into the player's actual game
  const savedMiniBossState = {
    miniBoss, miniBossCyclesCompleted, miniBossSpawnFrame, miniBossDefeated, miniBossDefeatFrame,
    miniBossAttackState, miniBossAttackStateStartFrame, miniBossChargeHeights, miniBossChargeIndex,
    miniBossChargeRound, miniBossFlameWallDriftDir, miniBossBarrageEmbers, miniBossBarrageWavesLaunched,
    miniBossSqueezeTopY, miniBossSqueezeBottomY, miniBossBarragePhaseStartFrame, miniBossDeathPatches,
    miniBossDeathAshParticles, miniBossEscapeRunActive, miniBossEscapeRunStartDistance, miniBossHadFirstFloat,
    miniBossNextAttackSet, miniBossFloatBlendStartX, miniBossFloatBlendStartY, miniBossFloatBlendStartFrame,
    miniBossWallRecedeStartFrame, miniBossWallCracks, coreWallPanels, coreWallSensors,
  };

  themeIndex = themeIdx;
  distance = 0; frame = 0; zoneStartDistance = 0; zoneStartFrame = 0;
  warpActive = false; portalObject = null; state = 'playing';
  ship.x = 0; ship.y = (PLAY_TOP + PLAY_BOTTOM) / 2; ship.vy = 0; ship.rotation = 0;
  ghostMode = true;
  const savedThemeLevelReached = themeLevelReached;
  // the real update loop auto-triggers a zone transition once distance
  // crosses a THEME_DISTANCE boundary relative to themeLevelReached -- since
  // this capture run's own distance climbs from 0 up toward targetDistance
  // (often exactly one THEME_DISTANCE), that real transition could fire
  // mid-capture and reset zoneStartDistance out from under the position math.
  // pinning themeLevelReached far ahead keeps the check from ever tripping
  themeLevelReached = 999999;

  const th = THEMES[themeIdx];
  const result = { themeIndex: themeIdx, obstacles: [], terrainSegments: null };

  // maps each single-spawn event array to its spawned-flag array, the gate
  // type it produces, and the tag field the editor's selection/drag code
  // expects on each captured gate
  const EVENT_TYPE_MAP = [
    { flagsGetter: () => blackHoleEventsSpawned, gateType: 'blackhole', tag: '_eventIdx' },
    { flagsGetter: () => windVortexEventsSpawned, gateType: 'windvortex', tag: '_vortexIdx' },
    { flagsGetter: () => cloudArcEventsSpawned, gateType: 'cloudarc', tag: '_arcIdx' },
    { flagsGetter: () => lightningStrikeEventsSpawned, gateType: 'stormchargebolttelegraph', tag: '_strikeIdx' },
    { flagsGetter: () => lensingZoneEventsSpawned, gateType: 'lensingzone', tag: '_lensIdx' },
    { flagsGetter: () => supernovaEventsSpawned, gateType: 'supernova', tag: '_novaIdx' },
    { flagsGetter: () => turretEventsSpawned, gateType: 'turret', tag: '_turretIdx' },
    { flagsGetter: () => empEventsSpawned, gateType: 'emp', tag: '_empIdx' },
    { flagsGetter: () => pulsingOrbEventsSpawned, gateType: 'pulsingorb', tag: '_orbIdx' },
  ];
  const snapshotEventFlags = () => EVENT_TYPE_MAP.map(m => (m.flagsGetter() || []).slice());

  if (th.obstacleShape === 'terrain') {
    // terrain uses its own terrainSegments data structure, not gates, and
    // isn't part of the position-mismatch issue this addresses -- keep the
    // existing lightweight step-through for it
    initTerrain();
    let guard = 0;
    while (terrainSegments[terrainSegments.length - 1].x < targetDistance * 10 && guard < 5000) {
      addTerrainSegment();
      distance = terrainSegments[terrainSegments.length - 1].x / 10;
      guard++;
    }
    result.terrainSegments = terrainSegments.map(s => ({ ...s }));
  } else {
    devGracePeriodEndFrame = 999999999; // keep the ship's vertical physics frozen for the entire capture run
    patternIndex = 0;
    reseedZoneObstacles(ship.x + 420); // the exact same entry point a real zone transition uses

    const capturedIds = new Set();
    const capturedGates = [];
    // computes each bolt's position directly from the pattern data and a
    // known base spawn x, rather than searching the live `gates` array for
    // it. A bolt with an extreme xJitter can scroll far enough off-screen
    // to trigger the game's own despawn check within the very same frame
    // it spawns in -- searching gates after the fact would silently miss
    // it, and every later cycle-repetition of that same bolt along with
    // it, making the preview quietly incomplete until something else
    // (like an unrelated edit) happened to correct that bolt's position
    // and "reveal" the previously-invisible instances.
    const captureBoltsForEntry = (entryIdx, baseX, zp) => {
      const entry = th.pattern[entryIdx];
      if (!entry || !entry.bolts) return;
      entry.bolts.forEach((b, bi) => {
        const gx = baseX + b.xJitter;
        const effectiveZoneProgress = zp + (gx - ship.x) / 10;
        const playHeight = PLAY_BOTTOM - PLAY_TOP;
        const margin = 28;
        const heightPx = b.heightFrac * playHeight;
        const cycleLength = b.onFrames + b.offFrames;
        capturedGates.push({
          type: 'lbolt',
          x: effectiveZoneProgress * 10,
          y: PLAY_TOP + margin + b.yFrac * Math.max(1, playHeight - margin * 2),
          height: heightPx,
          swingWidth: b.swingWidthPx,
          shape: BOLT_SHAPES[b.shape],
          onFrames: b.onFrames,
          offFrames: b.offFrames,
          cycleLength: cycleLength,
          phaseOffset: Math.round(b.phaseFrac * cycleLength),
          passed: false,
          _entryIdx: entryIdx, _boltIdx: bi
        });
      });
    };
    const captureInitialPatternGates = (startX, toEntryRaw, zp) => {
      let x = startX;
      for (let ei = 0; ei < toEntryRaw; ei++) {
        const entryIdx = ((ei % th.pattern.length) + th.pattern.length) % th.pattern.length;
        if (ei > 0) x += th.pattern[entryIdx].spacing || GATE_SPACING;
        captureBoltsForEntry(entryIdx, x, zp);
      }
    };
    // captures any newly-appeared non-lbolt gate, tagging single-spawn event
    // types using which specific flag index flipped true since flagsBefore
    const captureOtherNewGates = (zp, flagsBefore) => {
      const flagsAfter = snapshotEventFlags();
      for (const g of gates) {
        if (g.type === 'lbolt' || capturedIds.has(g)) continue;
        capturedIds.add(g);
        const effectiveZoneProgress = zp + (g.x - ship.x) / 10;
        const captured = { ...g, x: effectiveZoneProgress * 10 };
        if (g.x2 !== undefined) captured.x2 = g.x2 + (captured.x - g.x); // keep x2 consistent with the same shift applied to x
        EVENT_TYPE_MAP.forEach((m, mi) => {
          if (g.type !== m.gateType) return;
          const before = flagsBefore[mi] || [];
          const after = flagsAfter[mi] || [];
          for (let i = 0; i < after.length; i++) {
            if (after[i] && !before[i]) { captured[m.tag] = i; break; }
          }
        });
        capturedGates.push(captured);
      }
    };

    let prevPatternIndex = patternIndex; // after reseedZoneObstacles's initial 6-gate spawn
    if (th.obstacleShape === 'lbolt') captureInitialPatternGates(ship.x + 420, prevPatternIndex, distance - zoneStartDistance);
    captureOtherNewGates(distance - zoneStartDistance, EVENT_TYPE_MAP.map(() => []));

    let guard = 0;
    while ((distance - zoneStartDistance) < targetDistance && guard < 20000) {
      const flagsBefore = snapshotEventFlags();
      // belt-and-suspenders: pin the ship to a safe, centered position every
      // frame, not just at setup. ghost mode and the extended grace period
      // cover the normal death paths, but at least one Neon City mechanic
      // was found to end the run anyway -- forcing position each frame
      // guarantees nothing can push the ship into a boundary during capture
      ship.y = (PLAY_TOP + PLAY_BOTTOM) / 2;
      ship.vy = 0;
      update();
      if (state !== 'playing') state = 'playing'; // backstop in case something still ends the run
      const zp = distance - zoneStartDistance;
      if (th.obstacleShape === 'lbolt' && patternIndex > prevPatternIndex) {
        // only one new entry can spawn per frame in the ongoing loop, so
        // lastSpawnX (updated synchronously the instant it spawns) is
        // exactly that entry's base position, regardless of whether the
        // resulting gate object has already despawned by now
        const entryIdx = ((patternIndex - 1) % th.pattern.length + th.pattern.length) % th.pattern.length;
        captureBoltsForEntry(entryIdx, lastSpawnX, zp);
        prevPatternIndex = patternIndex;
      }
      captureOtherNewGates(zp, flagsBefore);
      guard++;
    }
    result.obstacles = capturedGates;
  }

  ghostMode = savedGhost;
  themeLevelReached = savedThemeLevelReached;
  devGracePeriodEndFrame = savedGrace;
  state = savedState;
  zoneStartDistance = savedZoneStartDistance;
  zoneStartFrame = savedZoneStartFrame;
  warpActive = savedWarpActive;
  portalObject = savedPortalObject;
  blackHoleEventsSpawned = savedEventFlags.blackHoleEventsSpawned;
  specialEventsSpawned = savedEventFlags.specialEventsSpawned;
  windVortexEventsSpawned = savedEventFlags.windVortexEventsSpawned;
  cloudArcEventsSpawned = savedEventFlags.cloudArcEventsSpawned;
  lightningStrikeEventsSpawned = savedEventFlags.lightningStrikeEventsSpawned;
  lasergridEventsSpawned = savedEventFlags.lasergridEventsSpawned;
  droneSwarmEventsSpawned = savedEventFlags.droneSwarmEventsSpawned;
  billboardEventsSpawned = savedEventFlags.billboardEventsSpawned;
  searchlightEventsSpawned = savedEventFlags.searchlightEventsSpawned;
  turretEventsSpawned = savedEventFlags.turretEventsSpawned;
  signalCorruptionEventsSpawned = savedEventFlags.signalCorruptionEventsSpawned;
  empEventsSpawned = savedEventFlags.empEventsSpawned;
  echoTrailEventsSpawned = savedEventFlags.echoTrailEventsSpawned;
  pulsingOrbEventsSpawned = savedEventFlags.pulsingOrbEventsSpawned;
  boomerangEventsSpawned = savedEventFlags.boomerangEventsSpawned;
  oncomingCometEventsSpawned = savedEventFlags.oncomingCometEventsSpawned;
  splitRockEventsSpawned = savedEventFlags.splitRockEventsSpawned;
  lensingZoneEventsSpawned = savedEventFlags.lensingZoneEventsSpawned;
  supernovaEventsSpawned = savedEventFlags.supernovaEventsSpawned;
  miniBoss = savedMiniBossState.miniBoss;
  miniBossCyclesCompleted = savedMiniBossState.miniBossCyclesCompleted;
  miniBossSpawnFrame = savedMiniBossState.miniBossSpawnFrame;
  miniBossDefeated = savedMiniBossState.miniBossDefeated;
  miniBossDefeatFrame = savedMiniBossState.miniBossDefeatFrame;
  miniBossAttackState = savedMiniBossState.miniBossAttackState;
  miniBossAttackStateStartFrame = savedMiniBossState.miniBossAttackStateStartFrame;
  miniBossChargeHeights = savedMiniBossState.miniBossChargeHeights;
  miniBossChargeIndex = savedMiniBossState.miniBossChargeIndex;
  miniBossChargeRound = savedMiniBossState.miniBossChargeRound;
  miniBossFlameWallDriftDir = savedMiniBossState.miniBossFlameWallDriftDir;
  miniBossBarrageEmbers = savedMiniBossState.miniBossBarrageEmbers;
  miniBossBarrageWavesLaunched = savedMiniBossState.miniBossBarrageWavesLaunched;
  miniBossSqueezeTopY = savedMiniBossState.miniBossSqueezeTopY;
  miniBossSqueezeBottomY = savedMiniBossState.miniBossSqueezeBottomY;
  miniBossBarragePhaseStartFrame = savedMiniBossState.miniBossBarragePhaseStartFrame;
  miniBossDeathPatches = savedMiniBossState.miniBossDeathPatches;
  miniBossDeathAshParticles = savedMiniBossState.miniBossDeathAshParticles;
  miniBossEscapeRunActive = savedMiniBossState.miniBossEscapeRunActive;
  miniBossEscapeRunStartDistance = savedMiniBossState.miniBossEscapeRunStartDistance;
  miniBossHadFirstFloat = savedMiniBossState.miniBossHadFirstFloat;
  miniBossNextAttackSet = savedMiniBossState.miniBossNextAttackSet;
  miniBossFloatBlendStartX = savedMiniBossState.miniBossFloatBlendStartX;
  miniBossFloatBlendStartY = savedMiniBossState.miniBossFloatBlendStartY;
  miniBossFloatBlendStartFrame = savedMiniBossState.miniBossFloatBlendStartFrame;
  miniBossWallRecedeStartFrame = savedMiniBossState.miniBossWallRecedeStartFrame;
  miniBossWallCracks = savedMiniBossState.miniBossWallCracks;
  coreWallPanels = savedMiniBossState.coreWallPanels;
  coreWallSensors = savedMiniBossState.coreWallSensors;
  restoreSimState(saved);

  return result;
}

function resizePreviewCanvas(worldWidthPx) {
  const wrap = document.getElementById('preview-canvas-wrap');
  const savedScroll = wrap ? wrap.scrollLeft : null;
  previewCanvas.width = Math.max(previewCanvas.parentElement.clientWidth, worldWidthPx * previewScale + 100);
  previewCanvas.height = previewCanvas.parentElement.clientHeight || 500;
  // setting canvas width/height can cause the browser to reset or clamp
  // the scrollable wrapper's scroll position, even when the resulting
  // canvas size is unchanged -- restore it so a re-render triggered from
  // somewhere the user didn't directly interact with (like an auto-fix
  // during save) never silently yanks their view away from what they were
  // actually looking at
  if (wrap && savedScroll !== null) wrap.scrollLeft = savedScroll;
  return previewScale;
}

function drawZonePreview(data) {
  const th = THEMES[data.themeIndex];
  const targetPx = 10000;
  const scale = resizePreviewCanvas(targetPx);
  const w = previewCanvas.width, h = previewCanvas.height;
  const topMargin = 30, botMargin = 30;
  const pTop = topMargin, pBot = h - botMargin;
  const pHeight = pBot - pTop;

  previewCtx.fillStyle = th.skyMid || '#111';
  previewCtx.fillRect(0, 0, w, h);
  previewCtx.strokeStyle = 'rgba(255,255,255,0.15)';
  previewCtx.lineWidth = 1;
  previewCtx.strokeRect(0, pTop, w, pHeight);

  previewCtx.fillStyle = 'rgba(255,255,255,0.4)';
  previewCtx.font = '10px Courier New';
  for (let d = 0; d <= 1000; d += 100) {
    const sx = d * 10 * scale;
    previewCtx.beginPath();
    previewCtx.moveTo(sx, pTop);
    previewCtx.lineTo(sx, pBot);
    previewCtx.strokeStyle = d % 500 === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)';
    previewCtx.stroke();
    previewCtx.fillText(String(d), sx + 3, pTop - 8);
  }

  const yToScreen = (y) => pTop + ((y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * pHeight;

  if (data.terrainSegments) {
    previewCtx.fillStyle = 'rgba(255,204,51,0.55)';
    previewCtx.beginPath();
    data.terrainSegments.forEach((s, i) => {
      const sx = s.x * scale;
      const sy = yToScreen(s.topY);
      if (i === 0) previewCtx.moveTo(sx, pTop); else previewCtx.lineTo(sx, sy);
    });
    for (let i = data.terrainSegments.length - 1; i >= 0; i--) {
      previewCtx.lineTo(data.terrainSegments[i].x * scale, pTop);
    }
    previewCtx.closePath();
    previewCtx.fill();

    previewCtx.beginPath();
    data.terrainSegments.forEach((s, i) => {
      const sx = s.x * scale;
      const sy = yToScreen(s.bottomY);
      if (i === 0) previewCtx.moveTo(sx, sy); else previewCtx.lineTo(sx, sy);
    });
    for (let i = data.terrainSegments.length - 1; i >= 0; i--) {
      previewCtx.lineTo(data.terrainSegments[i].x * scale, pBot);
    }
    previewCtx.closePath();
    previewCtx.fill();

    previewCtx.fillStyle = 'rgba(255,150,50,0.6)';
    data.terrainSegments.forEach((s) => {
      if (s.islandBottom - s.islandTop > 2) {
        const sx = s.x * scale;
        previewCtx.fillRect(sx, yToScreen(s.islandTop), 3, yToScreen(s.islandBottom) - yToScreen(s.islandTop));
      }
    });
  }

  // windvortex is a background force-field visual, not a foreground hazard --
  // draw it first (behind) regardless of where it falls in the underlying
  // obstacles array, so its semi-transparent overlay never washes out a
  // bolt or other hazard that happens to sit on top of it
  const sortedObstacles = [...data.obstacles].sort((a, b) => (a.type === 'windvortex' ? -1 : 0) - (b.type === 'windvortex' ? -1 : 0));
  for (const g of sortedObstacles) {
    const sx = g.x * scale;
    if (g.type === 'gate') {
      const gap = g.previewGap || 150;
      const topSafe = g.baseCenter - g.amplitude - gap / 2;
      const botSafe = g.baseCenter + g.amplitude + gap / 2;
      previewCtx.fillStyle = 'rgba(15,240,252,0.4)';
      previewCtx.fillRect(sx - 3, pTop, 6, yToScreen(topSafe) - pTop);
      previewCtx.fillRect(sx - 3, yToScreen(botSafe), 6, pBot - yToScreen(botSafe));
      previewCtx.fillStyle = 'rgba(15,240,252,0.15)';
      previewCtx.fillRect(sx - 3, yToScreen(topSafe), 6, yToScreen(botSafe) - yToScreen(topSafe));
    } else if (g.type === 'hbar') {
      const top = g.baseCenter - g.amplitude - g.thickness / 2;
      const bot = g.baseCenter + g.amplitude + g.thickness / 2;
      previewCtx.fillStyle = 'rgba(0,255,157,0.35)';
      previewCtx.fillRect(sx - g.width * scale / 2, yToScreen(top), Math.max(3, g.width * scale), yToScreen(bot) - yToScreen(top));
    } else if (g.type === 'asteroid') {
      previewCtx.fillStyle = 'rgba(200,150,100,0.6)';
      previewCtx.beginPath();
      previewCtx.arc(sx, yToScreen(g.y), Math.max(2, g.r * scale), 0, Math.PI * 2);
      previewCtx.fill();
    } else if (g.type === 'splitrock') {
      previewCtx.fillStyle = 'rgba(220,160,90,0.7)';
      previewCtx.beginPath();
      previewCtx.arc(sx, yToScreen(g.y), Math.max(3, g.r * scale), 0, Math.PI * 2);
      previewCtx.fill();
    } else if (g.type === 'fireball') {
      previewCtx.fillStyle = 'rgba(255,120,50,0.5)';
      previewCtx.beginPath();
      previewCtx.arc(sx, yToScreen(g.startY), Math.max(2, g.r * scale), 0, Math.PI * 2);
      previewCtx.fill();
    } else if (g.type === 'barrier') {
      const gTop = g.gapCenter - g.gapHeight / 2;
      const gBot = g.gapCenter + g.gapHeight / 2;
      previewCtx.fillStyle = 'rgba(255,245,157,0.4)';
      previewCtx.fillRect(sx - 3, pTop, 6, yToScreen(gTop) - pTop);
      previewCtx.fillRect(sx - 3, yToScreen(gBot), 6, pBot - yToScreen(gBot));
    } else if (g.type === 'lbolt') {
      // _entryIdx/_boltIdx identify which pattern entry this bolt came from,
      // but that entry repeats every pattern cycle across the full preview
      // length -- matching on those alone would highlight every repeated
      // occurrence at once. g.x is unique per instance, so include it to
      // select only the one actually clicked.
      const isSelected = previewSelectedBolt && g._entryIdx === previewSelectedBolt._entryIdx && g._boltIdx === previewSelectedBolt._boltIdx && g.x === previewSelectedBolt.x;
      const top = g.y - g.height / 2;
      const bx = sx - Math.max(2, g.swingWidth * scale / 2);
      const bw = Math.max(4, g.swingWidth * scale);
      const by = yToScreen(top);
      const bh = (g.height / (PLAY_BOTTOM - PLAY_TOP)) * pHeight;

      // real gameplay renders an active bolt with a 16px glow (shadowBlur)
      // around its silhouette -- without matching that here, a small bolt
      // reads as much smaller in the editor than it will actually look once
      // lit up and glowing in the real game
      previewCtx.save();
      previewCtx.shadowColor = th.accentA || '#fff59d';
      previewCtx.shadowBlur = 16 * scale;

      // g.shape is already the resolved polygon (array of [nx,ny] points) --
      // draw the real silhouette so shape edits are actually visible here.
      // use the same bright white-to-accent gradient as real gameplay's
      // active-bolt render (not a flat fill) so it stays clearly visible
      // even with other elements like a vortex's overlay nearby
      if (isSelected) {
        previewCtx.fillStyle = 'rgba(255,80,220,0.8)';
      } else {
        const boltGrad = previewCtx.createLinearGradient(sx, by, sx, by + bh);
        boltGrad.addColorStop(0, '#ffffff');
        boltGrad.addColorStop(0.5, th.accentA || '#fff59d');
        boltGrad.addColorStop(1, th.accentB || '#5c6bc0');
        previewCtx.fillStyle = boltGrad;
      }
      previewCtx.beginPath();
      g.shape.forEach(([nx, ny], i) => {
        const px = sx + nx * (g.swingWidth * scale) / 2;
        const py = yToScreen(top + ny * g.height);
        if (i === 0) previewCtx.moveTo(px, py); else previewCtx.lineTo(px, py);
      });
      previewCtx.closePath();
      previewCtx.fill();
      previewCtx.restore();

      if (isSelected) {
        previewCtx.strokeStyle = '#ff50dc';
        previewCtx.lineWidth = 2;
        previewCtx.strokeRect(bx, by, bw, bh);
        // resize handle
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(bx + bw - 6, by + bh - 6, 10, 10);
      }
    } else if (g.type === 'blackhole') {
      const isSelected = previewSelectedBlackHole && g._eventIdx === previewSelectedBlackHole._eventIdx;
      const cy = yToScreen(g.y);
      // use the vertical scale for both axes so these render as true
      // circles -- the horizontal distance-compression scale is far too
      // aggressive (flattens the whole 10000px zone into a small canvas)
      // and would make a huge black hole look like a thin vertical sliver
      const vScale = pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rReach = g.reachR * vScale;
      const rCore = g.coreR * vScale;

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.22)' : 'rgba(138,92,245,0.18)';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, rReach, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : 'rgba(138,92,245,0.5)';
      previewCtx.lineWidth = isSelected ? 2 : 1;
      previewCtx.stroke();

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.65)' : 'rgba(10,5,15,0.9)';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, rCore, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = '#8a5cf5';
      previewCtx.lineWidth = 1.5;
      previewCtx.stroke();

      if (isSelected) {
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(sx + rCore - 5, cy - 5, 10, 10);
        previewCtx.fillStyle = '#c9a0ff';
        previewCtx.fillRect(sx + rReach - 5, cy - 5, 10, 10);
      }
    } else if (g.type === 'windvortex') {
      const isSelected = previewSelectedWindVortex && g._vortexIdx === previewSelectedWindVortex._vortexIdx;
      const cy = yToScreen(g.y);
      const vScale = pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rReach = g.reachR * vScale;

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.22)' : 'rgba(92,107,192,0.18)';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, rReach, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : 'rgba(255,245,157,0.5)';
      previewCtx.lineWidth = isSelected ? 2 : 1;
      previewCtx.setLineDash(isSelected ? [] : [4, 4]);
      previewCtx.stroke();
      previewCtx.setLineDash([]);

      // small spiral hint at center so it reads as "swirling" rather than a plain circle
      previewCtx.strokeStyle = '#fff59d';
      previewCtx.lineWidth = 1.5;
      previewCtx.beginPath();
      for (let s = 0; s <= 16; s++) {
        const tt = s / 16;
        const ang = tt * Math.PI * 3;
        const r = tt * Math.min(rReach * 0.5, 14);
        const px = sx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
        if (s === 0) previewCtx.moveTo(px, py); else previewCtx.lineTo(px, py);
      }
      previewCtx.stroke();

      if (isSelected) {
        previewCtx.fillStyle = '#c9a0ff';
        previewCtx.fillRect(sx + rReach - 5, cy - 5, 10, 10);
      }
    } else if (g.type === 'cloudarc') {
      const isSelected = previewSelectedCloudArc && g._arcIdx === previewSelectedCloudArc._arcIdx;
      const cy1 = yToScreen(g.y);
      const cy2 = yToScreen(g.y2);
      const sx2 = g.x2 * scale;

      previewCtx.strokeStyle = isSelected ? '#ff50dc' : 'rgba(255,245,157,0.55)';
      previewCtx.lineWidth = isSelected ? 2.5 : 1.5;
      previewCtx.setLineDash(isSelected ? [] : [5, 5]);
      previewCtx.beginPath();
      previewCtx.moveTo(sx, cy1);
      previewCtx.lineTo(sx2, cy2);
      previewCtx.stroke();
      previewCtx.setLineDash([]);

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.5)' : 'rgba(146,161,209,0.5)';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy1, 8, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.beginPath();
      previewCtx.arc(sx2, cy2, 8, 0, Math.PI * 2);
      previewCtx.fill();

      if (isSelected) {
        previewCtx.fillStyle = '#c9a0ff';
        previewCtx.fillRect(sx2 - 5, cy2 - 5, 10, 10);
      }
    } else if (g.type === 'lensingzone') {
      const isSelected = previewSelectedLensingZone && g._lensIdx === previewSelectedLensingZone._lensIdx;
      const cy = yToScreen(g.y);
      const vScale = pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rZone = g.zoneRadius * vScale;
      const rCore = g.coreR * vScale;

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.22)' : 'rgba(94,200,232,0.16)';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, rZone, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : 'rgba(94,200,232,0.5)';
      previewCtx.lineWidth = isSelected ? 2 : 1;
      previewCtx.stroke();

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.7)' : '#5ec8e8';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, rCore, 0, Math.PI * 2);
      previewCtx.fill();

      if (isSelected) {
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(sx + rCore - 5, cy - 5, 10, 10);
        previewCtx.fillStyle = '#9de3f5';
        previewCtx.fillRect(sx + rZone - 5, cy - 5, 10, 10);
      }
    } else if (g.type === 'supernova') {
      const isSelected = previewSelectedSupernova && g._novaIdx === previewSelectedSupernova._novaIdx;
      const cy = yToScreen(g.y);
      const vScale = pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rPlanet = g.planetR * vScale;

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.7)' : '#c9683a';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, rPlanet, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : '#e8a84a';
      previewCtx.lineWidth = isSelected ? 2 : 1.5;
      previewCtx.stroke();

      if (isSelected) {
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(sx + rPlanet - 5, cy - 5, 10, 10);
      }
    } else if (g.type === 'turret') {
      const isSelected = previewSelectedTurret && g._turretIdx === previewSelectedTurret._turretIdx;
      const cy = yToScreen(g.y);

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.8)' : '#c98aff';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, 9, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : '#8a5cf5';
      previewCtx.lineWidth = isSelected ? 2 : 1.5;
      previewCtx.stroke();

      // barrel line showing the current firing angle
      const angleRad = g.fireAngleDeg * Math.PI / 180;
      const barrelLen = 26;
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : '#c98aff';
      previewCtx.lineWidth = 3;
      previewCtx.beginPath();
      previewCtx.moveTo(sx, cy);
      previewCtx.lineTo(sx - barrelLen * Math.cos(angleRad), cy + barrelLen * Math.sin(angleRad));
      previewCtx.stroke();

      if (isSelected) {
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(sx + 9 - 5, cy - 5, 10, 10);
      }
    } else if (g.type === 'emp') {
      const isSelected = previewSelectedEmp && g._empIdx === previewSelectedEmp._empIdx;
      const anchorCy = yToScreen(g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM);
      const reachVScale = pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const reachCy = yToScreen(g.anchor === 'top' ? PLAY_TOP + g.reachDepth : PLAY_BOTTOM - g.reachDepth);

      // reach indicator line
      previewCtx.strokeStyle = isSelected ? 'rgba(255,80,220,0.6)' : 'rgba(200,138,255,0.4)';
      previewCtx.lineWidth = 4;
      previewCtx.beginPath();
      previewCtx.moveTo(sx, anchorCy);
      previewCtx.lineTo(sx, reachCy);
      previewCtx.stroke();

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.8)' : '#c98aff';
      previewCtx.beginPath();
      previewCtx.arc(sx, anchorCy, 8, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : '#8a5cf5';
      previewCtx.lineWidth = isSelected ? 2 : 1.5;
      previewCtx.stroke();

      if (isSelected) {
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(sx + 8 - 5, anchorCy - 5, 10, 10);
      }
    } else if (g.type === 'pulsingorb') {
      const isSelected = previewSelectedOrb && g._orbIdx === previewSelectedOrb._orbIdx;
      const cy = yToScreen(g.y);
      const vScale = pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const midR = (g.minR + g.maxR) / 2 * vScale;
      const maxRPreview = g.maxR * vScale;

      // faint ring showing the maximum extent
      previewCtx.strokeStyle = 'rgba(200,138,255,0.25)';
      previewCtx.lineWidth = 1;
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, maxRPreview, 0, Math.PI * 2);
      previewCtx.stroke();

      previewCtx.fillStyle = isSelected ? 'rgba(255,80,220,0.5)' : 'rgba(200,138,255,0.5)';
      previewCtx.beginPath();
      previewCtx.arc(sx, cy, midR, 0, Math.PI * 2);
      previewCtx.fill();
      previewCtx.strokeStyle = isSelected ? '#ff50dc' : '#8a5cf5';
      previewCtx.lineWidth = isSelected ? 2 : 1.5;
      previewCtx.stroke();

      if (isSelected) {
        previewCtx.fillStyle = '#ff50dc';
        previewCtx.fillRect(sx + midR - 5, cy - 5, 10, 10);
      }
    }
  }
}

let currentPreviewZone = 0;
let previewMoveThrottleTs = 0;
const PREVIEW_MOVE_THROTTLE_MS = 120; // roughly matches captureFullZoneRun's worst-case cost, so throttled calls don't queue up faster than they can complete
let previewEditMode = false;
let previewLastData = null;
let previewScale = 0.75;
let previewSelectedBolt = null;
let previewSelectedBlackHole = null;
let previewSelectedWindVortex = null;
let previewSelectedCloudArc = null;
let previewSelectedLensingZone = null;
let previewSelectedSupernova = null;
let previewSelectedTurret = null;
let previewSelectedEmp = null;
let previewSelectedOrb = null;
let previewDragMode = null;
let previewDragStart = null;

// keep the original authored bolt patterns so "Reset to default" always works,
// even after saving edits
const DEFAULT_LBOLT_PATTERNS = {};
THEMES.forEach((t, i) => {
  if (t.obstacleShape === 'lbolt') DEFAULT_LBOLT_PATTERNS[i] = JSON.parse(JSON.stringify(t.pattern));
});
const DEFAULT_BLACKHOLE_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.blackHoleEvents) DEFAULT_BLACKHOLE_EVENTS[i] = JSON.parse(JSON.stringify(t.blackHoleEvents));
});
const DEFAULT_WINDVORTEX_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.windVortexEvents) DEFAULT_WINDVORTEX_EVENTS[i] = JSON.parse(JSON.stringify(t.windVortexEvents));
});
const DEFAULT_LENSINGZONE_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.lensingZoneEvents) DEFAULT_LENSINGZONE_EVENTS[i] = JSON.parse(JSON.stringify(t.lensingZoneEvents));
});
const DEFAULT_SUPERNOVA_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.supernovaEvents) DEFAULT_SUPERNOVA_EVENTS[i] = JSON.parse(JSON.stringify(t.supernovaEvents));
});
const DEFAULT_TURRET_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.turretEvents) DEFAULT_TURRET_EVENTS[i] = JSON.parse(JSON.stringify(t.turretEvents));
});
const DEFAULT_EMP_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.empEvents) DEFAULT_EMP_EVENTS[i] = JSON.parse(JSON.stringify(t.empEvents));
});
const DEFAULT_PULSING_ORB_EVENTS = {};
THEMES.forEach((t, i) => {
  if (t.pulsingOrbEvents) DEFAULT_PULSING_ORB_EVENTS[i] = JSON.parse(JSON.stringify(t.pulsingOrbEvents));
});

