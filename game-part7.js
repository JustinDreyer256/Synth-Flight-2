function drawBossArenaBulkheadWall(theme, bossEntity) {
  if (!bossEntity) return;
  const wallX = bossEntity.restX + bossEntity.maxR + 150;
  if (wallX >= W) return;
  ctx.save();

  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.06);
  const wallThickness = 46;

  ctx.fillStyle = 'rgba(2,3,5,0.97)';
  ctx.fillRect(wallX, 0, W - wallX, H);

  const glowGrad = ctx.createLinearGradient(wallX - 35, 0, wallX + 10, 0);
  glowGrad.addColorStop(0, 'rgba(94,200,232,0)');
  glowGrad.addColorStop(1, `rgba(94,200,232,${0.3 * pulse})`);
  ctx.fillStyle = glowGrad;
  ctx.fillRect(wallX - 35, 0, 45, H);

  // the bulkhead band itself -- dark reinforced metal plating
  const plateGrad = ctx.createLinearGradient(wallX, 0, wallX + wallThickness, 0);
  plateGrad.addColorStop(0, '#1c2833');
  plateGrad.addColorStop(0.5, '#101820');
  plateGrad.addColorStop(1, '#0a0e14');
  ctx.fillStyle = plateGrad;
  ctx.fillRect(wallX, 0, wallThickness, H);

  // panel seams with rivets, seeded once so they hold still
  if (coreWallPanels.length === 0) {
    const panelCount = Math.max(4, Math.ceil(H / 90));
    for (let i = 0; i < panelCount; i++) {
      const seamY = (i / panelCount) * H + Math.random() * 20;
      coreWallPanels.push({ seamY, phase: Math.random() * Math.PI * 2, hasLight: Math.random() < 0.6 });
    }
  }
  for (const panel of coreWallPanels) {
    ctx.strokeStyle = 'rgba(94,200,232,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wallX + 4, panel.seamY);
    ctx.lineTo(wallX + wallThickness - 4, panel.seamY);
    ctx.stroke();
    // rivets at each end of the seam
    ctx.fillStyle = 'rgba(150,170,185,0.4)';
    ctx.beginPath();
    ctx.arc(wallX + 8, panel.seamY, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wallX + wallThickness - 8, panel.seamY, 1.8, 0, Math.PI * 2);
    ctx.fill();
    if (panel.hasLight) {
      const lightPulse = 0.5 + 0.5 * Math.sin(frame * 0.05 + panel.phase);
      ctx.fillStyle = `rgba(94,200,232,${0.8 * lightPulse})`;
      ctx.shadowColor = '#5ec8e8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(wallX + wallThickness / 2, panel.seamY + 22, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // near-edge highlight
  ctx.fillStyle = `rgba(94,200,232,${0.5 * pulse})`;
  ctx.fillRect(wallX, 0, 2, H);

  ctx.restore();
}

function drawSnowChargeWake() {
  if (!miniBoss) return;
  const state = miniBossAttackState;
  const goingRight = state === 'arcRight' || state === 'exiting';
  const charging = state === 'arcLeft' || goingRight;
  if (!charging) return;
  const intensity = state === 'exiting' ? 0.45 : 1;
  const behind = goingRight ? -1 : 1;
  const x = miniBoss.x;
  const y = miniBoss.y;
  const r = Math.max(24, miniBoss.r);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, PLAY_TOP, W, PLAY_BOTTOM - PLAY_TOP);
  ctx.clip();

  for (let i = 3; i >= 1; i--) {
    ctx.globalAlpha = (0.22 - i * 0.05) * intensity;
    ctx.fillStyle = '#f4fbff';
    ctx.beginPath();
    ctx.ellipse(
      x + behind * r * (0.45 + i * 0.62),
      y,
      r * (1.05 - i * 0.08),
      r * (0.62 - i * 0.06),
      0, 0, Math.PI * 2
    );
    ctx.fill();
  }

  const len = r * (2.2 + 1.6 * intensity);
  const plume = ctx.createLinearGradient(x, y, x + behind * len, y);
  plume.addColorStop(0, `rgba(255,255,255,${0.5 * intensity})`);
  plume.addColorStop(0.4, `rgba(214,236,246,${0.22 * intensity})`);
  plume.addColorStop(1, 'rgba(214,236,246,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = plume;
  ctx.beginPath();
  ctx.ellipse(x + behind * len * 0.4, y, len * 0.5, r * (0.7 + 0.15 * intensity), 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 10; i++) {
    const seed = i * 1.4 + frame * 0.5;
    const along = r * (1.15 + (i % 5) * 0.42);
    const oy = Math.sin(seed) * r * (0.12 + (i % 4) * 0.1);
    ctx.globalAlpha = (0.28 + 0.45 * (1 - (i % 5) / 5)) * intensity;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + behind * along, y + oy, 1.8 + (i % 3) * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 4; i++) {
    const spin = frame * 0.22 + i * 1.4;
    ctx.save();
    ctx.translate(x + behind * r * (1.2 + i * 0.34), y + Math.sin(spin) * r * 0.28);
    ctx.rotate(spin);
    ctx.globalAlpha = 0.7 * intensity;
    ctx.fillStyle = '#f7fbff';
    ctx.fillRect(-3.2, -3.2, 6.4, 6.4);
    ctx.restore();
  }
  ctx.restore();
}

function drawSnowBossBody(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const squash = snowBossSquash || 0;
  const charging = miniBossAttackState === 'arcLeft' || miniBossAttackState === 'arcRight' || miniBossAttackState === 'exiting';
  const punch = charging && squash < 0.2 ? (miniBossAttackState === 'exiting' ? 0.4 : 1) : 0;
  ctx.scale((1 + squash * 0.45) * (1 + punch * 0.32), (1 - squash * 0.4) * (1 - punch * 0.22));
  const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.35);
  glow.addColorStop(0, 'rgba(255,255,255,0.55)');
  glow.addColorStop(0.6, 'rgba(186, 220, 236, 0.18)');
  glow.addColorStop(1, 'rgba(186, 220, 236, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
  ctx.fill();
  const body = ctx.createRadialGradient(-r * 0.28, -r * 0.32, r * 0.1, 0, 0, r);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.45, '#e7f4fb');
  body.addColorStop(1, '#8eb8d0');
  ctx.fillStyle = body;
  ctx.shadowColor = '#d7f3ff';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 7; i++) {
    const a = frame * 0.01 + i * 1.3;
    const d = r * (0.25 + (i % 3) * 0.18);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a * 1.3) * d * 0.8, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSnowBossHazards() {
  ctx.save();
  for (const ic of snowIcicles) {
    const grad = ctx.createLinearGradient(ic.x, ic.base, ic.x, ic.tip);
    grad.addColorStop(0, 'rgba(186, 214, 228, 0.55)');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.strokeStyle = ic.loose ? '#ffffff' : '#9fd4ea';
    ctx.lineWidth = 2;
    const halfW = ic.slim ? 8 : 16;
    ctx.beginPath();
    ctx.moveTo(ic.x, ic.tip);
    ctx.lineTo(ic.x + halfW, ic.base);
    ctx.lineTo(ic.x - halfW, ic.base);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (miniBossAttackState === 'gust') {
    const play = PLAY_BOTTOM - PLAY_TOP;
    ctx.save();
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 36; i++) {
      const y = PLAY_TOP + play * (0.18 + (i % 9) * 0.08);
      const x = ((i * 83 - frame * 5) % (W + 140)) - 70;
      ctx.strokeStyle = '#f7fbff';
      ctx.globalAlpha = 0.45 + (i % 3) * 0.15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 64, y + 18);
      ctx.stroke();
    }
    ctx.restore();
  }
  for (const ball of snowRollers) {
    const dir = ball.vx < 0 ? -1 : 1;
    const behind = -dir;
    const r = ball.r;
    ctx.save();
    const streakLen = r * 3.6;
    const wake = ctx.createLinearGradient(ball.x, ball.y, ball.x + behind * streakLen, ball.y);
    wake.addColorStop(0, 'rgba(255,255,255,0.62)');
    wake.addColorStop(0.22, 'rgba(214,236,246,0.32)');
    wake.addColorStop(1, 'rgba(214,236,246,0)');
    ctx.fillStyle = wake;
    ctx.beginPath();
    ctx.ellipse(ball.x + behind * streakLen * 0.42, ball.y, streakLen * 0.55, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f7fbff';
    for (let i = 0; i < 5; i++) {
      const seed = i * 1.7 + frame * 0.22 + ball.y * 0.01;
      const oy = (i - 2) * r * 0.26 + Math.sin(seed) * r * 0.06;
      const len = r * (1.2 + (i % 3) * 0.38);
      const start = ball.x + behind * r * 0.75;
      ctx.globalAlpha = 0.4 + 0.45 * Math.abs(Math.sin(seed));
      ctx.lineWidth = i === 2 ? 3.5 : 2;
      ctx.beginPath();
      ctx.moveTo(start, ball.y + oy);
      ctx.lineTo(start + behind * len, ball.y + oy * 0.8);
      ctx.stroke();
    }

    for (let i = 3; i >= 1; i--) {
      const t = i / 3;
      ctx.globalAlpha = 0.18 * (1 - t * 0.3);
      ctx.fillStyle = '#e7f3fa';
      ctx.beginPath();
      ctx.ellipse(
        ball.x + behind * r * (0.5 + i * 0.58),
        ball.y + Math.sin(frame * 0.35 + i + ball.x * 0.02) * 2,
        r * (1.05 + t * 0.22),
        r * (0.58 - t * 0.08),
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }

    for (let i = 0; i < 6; i++) {
      const t = (i + (frame * 0.5) % 1) / 6;
      const px = ball.x + behind * r * (1.0 + t * 2.5);
      const py = ball.y + Math.sin(frame * 0.55 + i * 1.8) * r * 0.36;
      ctx.globalAlpha = 0.62 - t * 0.42;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + (1 - t) * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.translate(ball.x, ball.y);
    ctx.scale(1.24, 0.86);
    const grad = ctx.createRadialGradient(-r * 0.28, -r * 0.32, 2, 0, 0, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.72, '#d5ebf6');
    grad.addColorStop(1, '#6ea4be');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#f7fbff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(-ball.x * 0.08);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(-r * 0.16, -r * 0.32, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(110, 164, 190, 0.6)';
    ctx.beginPath();
    ctx.arc(r * 0.28, r * 0.08, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (miniBoss && miniBossAttackState === 'snowDying') {
    const burstAge = frame - miniBossAttackStateStartFrame - SNOW_BOSS_DEATH_BURST;
    if (burstAge >= 0 && burstAge < 28) {
      const u = burstAge / 28;
      ctx.globalAlpha = (1 - u) * 0.72;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(miniBoss.x, miniBoss.y, miniBoss.maxR * (0.5 + u * 5.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  for (const p of miniBossDeathAshParticles) {
    ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
    ctx.fillStyle = '#f7fbff';
    if (p.size > 4) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }
  ctx.restore();
}

function drawSnowArenaWall(theme, bossEntity) {
  if (!bossEntity) return;
  let wallX = bossEntity.restX + bossEntity.maxR + 150;
  if (miniBossWallRecedeStartFrame !== -1) {
    const recedeElapsed = frame - miniBossWallRecedeStartFrame;
    const recedeProgress = Math.min(1, recedeElapsed / MINI_BOSS_WALL_RECEDE_DURATION);
    const eased = recedeProgress * recedeProgress * recedeProgress;
    wallX = wallX + ((W + 200) - wallX) * eased;
  }
  if (wallX >= W) return;
  ctx.save();

  const pulse = 0.72 + 0.28 * Math.sin(frame * 0.05);
  const face = 84;

  if (snowWallDetail.length === 0) {
    const plates = [];
    let y = 0;
    while (y < H) {
      const h = 52 + Math.random() * 36;
      plates.push({ y, h, inset: 8 + Math.random() * 14, shade: Math.random() });
      y += h;
    }
    const veins = [];
    const veinCount = Math.max(6, Math.ceil(H / 70));
    for (let i = 0; i < veinCount; i++) {
      const points = [];
      let cx = face * (0.28 + Math.random() * 0.45);
      let cy = (i / veinCount) * H + Math.random() * 16;
      const segments = 5 + Math.floor(Math.random() * 3);
      for (let s = 0; s <= segments; s++) {
        points.push({ x: cx, y: cy });
        cx = Math.max(10, Math.min(face - 10, cx + (Math.random() - 0.5) * 20));
        cy += (H / veinCount) / segments * 0.85 + Math.random() * 8;
      }
      veins.push({ points, phase: Math.random() * Math.PI * 2 });
    }
    const crystals = [];
    for (let i = 0; i < 8; i++) {
      crystals.push({
        y: 28 + (i / 8) * (H - 70) + Math.random() * 18,
        len: 12 + Math.random() * 16,
        w: 5 + Math.random() * 4
      });
    }
    const deepCracks = [];
    for (let i = 0; i < 4; i++) {
      deepCracks.push({
        x: 30 + Math.random() * 160,
        y: Math.random() * H * 0.2,
        len: 180 + Math.random() * 220,
        lean: (Math.random() - 0.5) * 40
      });
    }
    snowWallDetail.push({ plates, veins, crystals, deepCracks });
  }
  const detail = snowWallDetail[0];

  const beyond = ctx.createLinearGradient(wallX + face, 0, Math.min(W, wallX + face + 260), 0);
  beyond.addColorStop(0, '#d5e8f2');
  beyond.addColorStop(0.4, '#9ec3d4');
  beyond.addColorStop(1, '#6f9aaf');
  ctx.fillStyle = beyond;
  ctx.fillRect(wallX + face, 0, W - wallX - face, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  for (let y = 14; y < H; y += 28) {
    ctx.beginPath();
    ctx.moveTo(wallX + face, y);
    ctx.lineTo(W, y + 8);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.4;
  for (const crack of detail.deepCracks) {
    ctx.beginPath();
    ctx.moveTo(wallX + face + crack.x, crack.y);
    ctx.lineTo(wallX + face + crack.x + crack.lean, crack.y + crack.len);
    ctx.stroke();
  }

  const glow = ctx.createLinearGradient(wallX - 46, 0, wallX + 10, 0);
  glow.addColorStop(0, 'rgba(186,220,236,0)');
  glow.addColorStop(1, `rgba(232,246,255,${0.42 * pulse})`);
  ctx.fillStyle = glow;
  ctx.fillRect(wallX - 46, 0, 56, H);

  const ice = ctx.createLinearGradient(wallX, 0, wallX + face, 0);
  ice.addColorStop(0, '#f7fbff');
  ice.addColorStop(0.28, '#e4f2f8');
  ice.addColorStop(0.7, '#b7d4e4');
  ice.addColorStop(1, '#7eabc2');
  ctx.fillStyle = ice;
  ctx.fillRect(wallX, 0, face, H);

  for (const plate of detail.plates) {
    ctx.fillStyle = plate.shade > 0.55 ? 'rgba(255,255,255,0.34)' : 'rgba(70,120,146,0.2)';
    ctx.fillRect(wallX + plate.inset, plate.y + 4, face - plate.inset - 12, Math.max(8, plate.h - 10));
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wallX + 3, plate.y);
    ctx.lineTo(wallX + face - 4, plate.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(90,130,150,0.55)';
    ctx.beginPath();
    ctx.arc(wallX + 14, plate.y + plate.h * 0.45, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(wallX + face - 16, plate.y + plate.h * 0.45, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineCap = 'round';
  for (const vein of detail.veins) {
    const veinPulse = 0.45 + 0.55 * Math.sin(frame * 0.05 + vein.phase);
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + 0.5 * veinPulse})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(wallX + vein.points[0].x, vein.points[0].y);
    for (let i = 1; i < vein.points.length; i++) ctx.lineTo(wallX + vein.points[i].x, vein.points[i].y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(121,214,255,${0.25 * veinPulse})`;
    ctx.lineWidth = 3.2;
    ctx.stroke();
  }

  for (const crystal of detail.crystals) {
    const grad = ctx.createLinearGradient(wallX - crystal.len, 0, wallX, 0);
    grad.addColorStop(0, 'rgba(247,251,255,0.15)');
    grad.addColorStop(1, 'rgba(247,251,255,0.95)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(wallX + 2, crystal.y);
    ctx.lineTo(wallX - crystal.len, crystal.y + crystal.w);
    ctx.lineTo(wallX + 2, crystal.y + crystal.w * 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.fillStyle = `rgba(255,255,255,${0.85 * pulse})`;
  ctx.fillRect(wallX, 0, 3, H);
  ctx.fillStyle = `rgba(121,214,255,${0.45 * pulse})`;
  ctx.fillRect(wallX + 8, 0, 2, H);

  ctx.restore();
}

function drawBossArenaObsidianWall(theme, bossEntity) {
  if (!bossEntity) return;
  // anchored to the boss's stable resting x, not its live (charge-swept)
  // position -- keeps the wall visually steady throughout the whole fight,
  // including charges where the boss itself sweeps across the screen
  let wallX = bossEntity.restX + bossEntity.maxR + 150;
  if (miniBossWallRecedeStartFrame !== -1) {
    // fight's over -- the wall breaks away and recedes off the right edge,
    // progressively revealing the escape run terrain that's already been
    // set up and is scrolling underneath it, rather than the scene cutting
    const recedeElapsed = frame - miniBossWallRecedeStartFrame;
    const recedeProgress = Math.min(1, recedeElapsed / MINI_BOSS_WALL_RECEDE_DURATION);
    const eased = recedeProgress * recedeProgress * recedeProgress; // ease-in cubic
    wallX = wallX + ((W + 200) - wallX) * eased;
  }
  if (wallX >= W) return;
  ctx.save();

  const pulse = 0.7 + 0.3 * Math.sin(frame * 0.06);
  const wallThickness = 46;

  // dark backdrop beyond the wall -- "outside the arena"
  ctx.fillStyle = 'rgba(4,2,3,0.97)';
  ctx.fillRect(wallX, 0, W - wallX, H);

  // soft glow bleeding out from the wall's near edge
  const glowGrad = ctx.createLinearGradient(wallX - 35, 0, wallX + 10, 0);
  glowGrad.addColorStop(0, 'rgba(255,90,20,0)');
  glowGrad.addColorStop(1, `rgba(255,90,20,${0.3 * pulse})`);
  ctx.fillStyle = glowGrad;
  ctx.fillRect(wallX - 35, 0, 45, H);

  // the obsidian rock band itself -- dark volcanic glass
  const rockGrad = ctx.createLinearGradient(wallX, 0, wallX + wallThickness, 0);
  rockGrad.addColorStop(0, '#231b1d');
  rockGrad.addColorStop(0.5, '#150f11');
  rockGrad.addColorStop(1, '#0c0709');
  ctx.fillStyle = rockGrad;
  ctx.fillRect(wallX, 0, wallThickness, H);

  // glowing fissure cracks running through the rock, seeded once so they
  // hold still rather than jittering
  if (miniBossWallCracks.length === 0) {
    const crackCount = Math.max(4, Math.ceil(H / 90));
    for (let i = 0; i < crackCount; i++) {
      const points = [];
      let cx = wallThickness * (0.3 + Math.random() * 0.4);
      let cy = (i / crackCount) * H + Math.random() * 40;
      const segments = 5 + Math.floor(Math.random() * 3);
      for (let s = 0; s <= segments; s++) {
        points.push({ x: cx, y: cy });
        cx = Math.max(4, Math.min(wallThickness - 4, cx + (Math.random() - 0.5) * 22));
        cy += (H / crackCount) / segments * 0.9 + Math.random() * 10;
      }
      miniBossWallCracks.push({ points, phase: Math.random() * Math.PI * 2 });
    }
  }
  ctx.lineCap = 'round';
  for (const crack of miniBossWallCracks) {
    const crackPulse = 0.6 + 0.4 * Math.sin(frame * 0.05 + crack.phase);
    ctx.strokeStyle = `rgba(255,110,30,${0.75 * crackPulse})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(wallX + crack.points[0].x, crack.points[0].y);
    for (let i = 1; i < crack.points.length; i++) {
      ctx.lineTo(wallX + crack.points[i].x, crack.points[i].y);
    }
    ctx.stroke();
  }

  // near-edge highlight so the boundary still reads clearly at a glance
  ctx.fillStyle = `rgba(255,140,50,${0.5 * pulse})`;
  ctx.fillRect(wallX, 0, 2, H);

  ctx.restore();
}

function drawBoss(theme) {
  if (!theme || !theme.isBossZone) return;
  if (!boss) return;
  if (bossFullyDefeated) return; // gone for good -- downtime, fly-off, and victory screen all render nothing here

  const entranceElapsed = frame - bossSpawnFrame;
  const entranceProgress = Math.min(1, entranceElapsed / BOSS_ENTRANCE_DURATION);

  if (entranceProgress < BOSS_ENTRANCE_CHARGE_END) {
    drawBossCharge(theme, entranceProgress / BOSS_ENTRANCE_CHARGE_END);
    return; // orb itself not visible yet
  }
  if (entranceProgress < BOSS_ENTRANCE_ASSEMBLE_END) {
    drawBossFragments(theme, (entranceProgress - BOSS_ENTRANCE_CHARGE_END) / (BOSS_ENTRANCE_ASSEMBLE_END - BOSS_ENTRANCE_CHARGE_END));
    return; // orb itself not visible yet
  }

  if (bossTransitioning && bossTransitionTargetPhase === 5) {
    const stageProgress = Math.min(1, (frame - bossTransitionStartFrame) / BOSS_PHASE5_TRANSITION_DURATION);
    drawBossPhase5Transformation(theme, stageProgress);
    return;
  }

  if (bossExplosionActive) {
    const stageProgress = Math.min(1, (frame - bossExplosionStartFrame) / BOSS_EXPLOSION_DURATION);
    drawBossExplosion(theme, stageProgress);
    return;
  }

  if (bossFinalChargeActive) {
    const stageProgress = Math.min(1, (frame - bossFinalChargeStartFrame) / BOSS_FINAL_CHARGE_DURATION);
    drawBossFinalCharge(theme, stageProgress);
    return;
  }

  const r = boss.r * (bossDefeated ? Math.max(0, 1 - (frame - bossDefeatFrame) / 90) : 1);
  if (r <= 0) return;

  if (bossPhase === 5) {
    drawBossEclipseForm(boss.x, boss.y, r, theme);
    return;
  }

  const colorProgress = getBossColorProgress();
  const effAccentA = lerpHexColor(theme.accentA, theme.phase3AccentA, colorProgress);
  const effAccentB = lerpHexColor(theme.accentB, theme.phase3AccentB, colorProgress);
  const effSkyTop = lerpHexColor(theme.skyTop, theme.phase3SkyTop, colorProgress);

  // while straining to transform, a fast jitter conveys effort --
  // intensity builds through most of the transition then eases right
  // as the new form locks in, with crackling energy particles and a
  // building glow layered on top for a more dramatic strain
  let jitterX = 0, jitterY = 0, strainGlow = 0;
  if (bossTransitioning) {
    const strainElapsed = frame - bossTransitionStartFrame;
    const strainProgress = Math.min(1, strainElapsed / BOSS_TRANSITION_DURATION);
    const jitterMag = 7 * Math.sin(strainProgress * Math.PI);
    jitterX = Math.sin(frame * 2.3) * jitterMag;
    jitterY = Math.cos(frame * 2.9) * jitterMag;
    strainGlow = strainProgress;
  }
  const bx = boss.x + jitterX, by = boss.y + jitterY;

  if (bossTransitioning) {
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const flicker = Math.sin(frame * 0.6 + i * 2.8);
      if (flicker > 0.15) {
        const ang = i * 2.1 + frame * 0.02;
        const dist = boss.maxR * (0.9 + 0.35 * Math.sin(i * 1.7 + frame * 0.05));
        const px = bx + Math.cos(ang) * dist;
        const py = by + Math.sin(ang) * dist;
        ctx.fillStyle = i % 2 === 0 ? theme.accentA : theme.phase3AccentA;
        ctx.globalAlpha = 0.5 * strainGlow;
        ctx.shadowColor = theme.phase3AccentB;
        ctx.shadowBlur = 8;
        ctx.fillRect(px - 3, py - 3, 6, 6);
      }
    }
    ctx.restore();
  }

  drawBossStandardSphere(bx, by, r, effAccentA, effAccentB, effSkyTop);

  if (bossPhase === 4) {
    const elapsed = theme.bossDuration - bossTimer;
    const framesSincePhase4 = elapsed - 3 * BOSS_PHASE_DURATION;
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.clip();
    drawBossCracks(bx, by, r, framesSincePhase4);
    ctx.restore();
  }

  if (entranceProgress < 1) {
    drawBossSnapEffect(theme, (entranceProgress - BOSS_ENTRANCE_ASSEMBLE_END) / (1 - BOSS_ENTRANCE_ASSEMBLE_END));
  }

  const sinceTransitionEnd = frame - bossTransitionEndFrame;
  if (sinceTransitionEnd >= 0 && sinceTransitionEnd < BOSS_TRANSITION_COMPLETE_FX_DURATION) {
    drawBossTransitionCompleteEffect(theme, sinceTransitionEnd / BOSS_TRANSITION_COMPLETE_FX_DURATION);
  }
}

// "corrupted synthwave" background elements for phase 3+, fading in
// alongside the existing sky/grid color transition (same colorProgress
// value). purely decorative atmosphere -- does not touch the boss
// sprite or any gameplay object
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
    const zoneDist = distance - zoneStartDistance;
    const storm = zoneDist > 680 ? Math.min(1, (zoneDist - 680) / 30) : 0;
    if (storm > 0.04) {
      const playHeight = PLAY_BOTTOM - PLAY_TOP;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, PLAY_TOP, W, playHeight);
      ctx.clip();
      ctx.fillStyle = 'rgba(214, 232, 242, ' + (0.07 * storm) + ')';
      ctx.fillRect(0, PLAY_TOP, W, playHeight);
      ctx.strokeStyle = '#f7fbff';
      ctx.lineWidth = 1.6;
      const count = Math.floor(96 * storm);
      const span = playHeight + 70;
      for (let i = 0; i < count; i++) {
        const col = i % 16;
        const row = Math.floor(i / 16);
        const speed = 4.2 + (i % 5) * 0.85;
        const drift = 2.4 + (i % 4) * 0.55;
        const len = 12 + (i % 6) * 3;
        const y = PLAY_TOP - 36 + ((row * 54 + col * 19 + frame * speed) % span);
        const x = ((col + 0.5) * (W / 16) + row * 41 - frame * drift) % (W + 48);
        const wrapped = x < 0 ? x + W + 48 : x;
        ctx.globalAlpha = (0.28 + (i % 5) * 0.08) * storm;
        ctx.beginPath();
        ctx.moveTo(wrapped, y);
        ctx.lineTo(wrapped - len * 0.65, y + len);
        ctx.stroke();
      }
      ctx.restore();
    }
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
  } else if (theme.bgStyle === 'chrome') {
    const playHeight = PLAY_BOTTOM - PLAY_TOP;
    const floorGlow = ctx.createLinearGradient(0, PLAY_BOTTOM - playHeight * 0.28, 0, PLAY_BOTTOM);
    floorGlow.addColorStop(0, 'rgba(255, 225, 160, 0)');
    floorGlow.addColorStop(0.55, 'rgba(255, 236, 190, 0.16)');
    floorGlow.addColorStop(1, 'rgba(255, 254, 248, 0.28)');
    ctx.fillStyle = floorGlow;
    ctx.fillRect(0, PLAY_BOTTOM - playHeight * 0.28, W, playHeight * 0.28);
    const roofGlow = ctx.createLinearGradient(0, PLAY_TOP, 0, PLAY_TOP + playHeight * 0.16);
    roofGlow.addColorStop(0, 'rgba(255, 254, 248, 0.22)');
    roofGlow.addColorStop(1, 'rgba(255, 209, 90, 0)');
    ctx.fillStyle = roofGlow;
    ctx.fillRect(0, PLAY_TOP, W, playHeight * 0.16);
    for (let i = 0; i < bgParticles.length; i++) {
      const p = bgParticles[i];
      const spark = p.kind === 'spark';
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = spark || i % 3 !== 0 ? '#fffef8' : '#ffd15a';
      ctx.lineWidth = spark ? 1.4 : (p.thick || 1.2);
      ctx.beginPath();
      ctx.moveTo(p.x + (p.len || 12), p.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'copper') {
    const playHeight = PLAY_BOTTOM - PLAY_TOP;
    const zoneT = Math.max(0, Math.min(1, (distance - zoneStartDistance) / THEME_DISTANCE));
    const sunR = 78;
    // One slow pass for the whole zone: right edge at the start, left edge at the portal.
    const sunX = (W - sunR * 0.35) - zoneT * (W - sunR * 0.7);
    const sunY = PLAY_TOP + playHeight * 0.22;
    ctx.save();
    const halo = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.4);
    halo.addColorStop(0, 'rgba(255, 186, 90, 0.55)');
    halo.addColorStop(0.45, 'rgba(255, 110, 40, 0.18)');
    halo.addColorStop(1, 'rgba(255, 80, 20, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 2.4, 0, Math.PI * 2);
    ctx.fill();
    const sun = ctx.createRadialGradient(sunX, sunY - 8, 4, sunX, sunY, sunR);
    sun.addColorStop(0, '#fff3d2');
    sun.addColorStop(0.55, '#ff8a32');
    sun.addColorStop(1, '#e25a18');
    ctx.fillStyle = sun;
    ctx.shadowColor = '#ff9a3c';
    ctx.shadowBlur = 28;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    const wash = ctx.createLinearGradient(0, PLAY_BOTTOM - playHeight * 0.42, 0, PLAY_BOTTOM);
    wash.addColorStop(0, 'rgba(255, 120, 40, 0)');
    wash.addColorStop(0.55, 'rgba(255, 110, 40, 0.16)');
    wash.addColorStop(1, 'rgba(255, 150, 60, 0.28)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, PLAY_BOTTOM - playHeight * 0.42, W, playHeight * 0.42);
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const y = PLAY_TOP + 30 + ((i * 47 + frame * (1.6 + (i % 3) * 0.45)) % (playHeight * 0.62));
      const x = ((i * 180 - frame * (3.2 + (i % 4))) % (W + 260)) - 80;
      ctx.globalAlpha = 0.18 + (i % 3) * 0.08;
      ctx.strokeStyle = i % 2 === 0 ? '#ffb15a' : '#fff1d0';
      ctx.lineWidth = i % 3 === 0 ? 2.4 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 70 + (i % 4) * 28, y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(0, PLAY_BOTTOM);
    for (let x = 0; x <= W; x += 10) {
      const y = PLAY_BOTTOM - 54 - Math.sin(x * 0.006 + frame * 0.01) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, PLAY_BOTTOM);
    ctx.closePath();
    const chrome = ctx.createLinearGradient(0, PLAY_BOTTOM - 80, 0, PLAY_BOTTOM);
    chrome.addColorStop(0, 'rgba(255, 196, 130, 0.55)');
    chrome.addColorStop(0.18, '#6a5038');
    chrome.addColorStop(1, '#100c0a');
    ctx.fillStyle = chrome;
    ctx.fill();
    ctx.strokeStyle = '#ffd7a4';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff9a3c';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (theme.bgStyle === 'outrun') {
    drawSynthwaveBackdropSun(theme);
    const horizonY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.58;
    const vanishX = W * 0.5;
    const groundHeight = PLAY_BOTTOM - horizonY;
    ctx.save();
    ctx.strokeStyle = theme.accentA;
    ctx.lineWidth = 1.15;
    const scrollPhase = (frame * 0.04) % 1;
    for (let i = 1; i <= 16; i++) {
      const depth = i + scrollPhase;
      const y = horizonY + groundHeight / depth;
      if (y > PLAY_BOTTOM || y < horizonY) continue;
      const fadeIn = Math.min(1, (y - horizonY) / (groundHeight * 0.12));
      ctx.globalAlpha = 0.55 * fadeIn;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.5;
    const spread = W * 2.4;
    for (let i = -16; i <= 16; i++) {
      const bottomX = vanishX + (i / 16) * spread;
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bottomX, PLAY_BOTTOM);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'solar') {
    const playHeight = PLAY_BOTTOM - PLAY_TOP;
    const bandH = playHeight * 0.2;
    const bandTop = PLAY_BOTTOM - bandH;
    const sunX = W * 0.62;
    const sunY = bandTop + 6;
    const sunR = 42;
    const sun = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, sunR);
    sun.addColorStop(0, '#fffef6');
    sun.addColorStop(0.7, '#ffe08a');
    sun.addColorStop(1, 'rgba(255, 196, 90, 0)');
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();
    const chrome = ctx.createLinearGradient(0, bandTop - 20, 0, PLAY_BOTTOM);
    chrome.addColorStop(0, 'rgba(255, 236, 196, 0)');
    chrome.addColorStop(0.22, 'rgba(255, 214, 150, 0.42)');
    chrome.addColorStop(0.55, 'rgba(255, 168, 90, 0.62)');
    chrome.addColorStop(1, 'rgba(255, 126, 70, 0.78)');
    ctx.fillStyle = chrome;
    ctx.fillRect(0, bandTop - 20, W, bandH + 20);
    ctx.strokeStyle = 'rgba(255, 250, 232, 0.92)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, bandTop + 4);
    ctx.lineTo(W, bandTop + 4);
    ctx.stroke();
    const mirror = ctx.createRadialGradient(sunX, bandTop + 28, 2, sunX, bandTop + 36, 70);
    mirror.addColorStop(0, 'rgba(255, 248, 220, 0.55)');
    mirror.addColorStop(1, 'rgba(255, 196, 110, 0)');
    ctx.fillStyle = mirror;
    ctx.beginPath();
    ctx.ellipse(sunX, bandTop + 34, 54, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineCap = 'round';
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.strokeStyle = '#fff6df';
      ctx.lineWidth = p.thick;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.len, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (theme.bgStyle === 'kelp') {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const x = ((i * 290 - frame * 0.22) % (W + 240)) - 120;
      const shaft = ctx.createLinearGradient(x, PLAY_TOP, x + 30, PLAY_BOTTOM);
      shaft.addColorStop(0, 'rgba(190, 255, 226, 0.10)');
      shaft.addColorStop(0.45, 'rgba(120, 210, 180, 0.03)');
      shaft.addColorStop(1, 'rgba(80, 160, 140, 0)');
      ctx.fillStyle = shaft;
      ctx.beginPath();
      ctx.moveTo(x, PLAY_TOP);
      ctx.lineTo(x + 64, PLAY_TOP);
      ctx.lineTo(x + 150, PLAY_BOTTOM);
      ctx.lineTo(x + 36, PLAY_BOTTOM);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    for (let p of bgParticles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#d8fff2';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = p.alpha * 0.45;
      ctx.strokeStyle = '#9dffe0';
      ctx.lineWidth = 1;
      ctx.stroke();
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
  const sides = g.berg ? 8 : 6;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const rr = g.r * (i % 2 === 0 ? 1 : (g.berg ? 0.7 : 0.82));
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
  if (g.calving && !g.calved) {
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-g.r * 0.42, g.r * 0.05);
    ctx.lineTo(-g.r * 0.08, g.r * 0.34);
    ctx.lineTo(g.r * 0.16, g.r * 0.58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-g.r * 0.55, g.r * 0.28);
    ctx.lineTo(g.r * 0.05, g.r * 0.16);
    ctx.lineTo(g.r * 0.42, g.r * 0.62);
    ctx.lineTo(g.r * 0.02, g.r * 0.98);
    ctx.lineTo(-g.r * 0.48, g.r * 0.72);
    ctx.closePath();
    ctx.fillStyle = '#f7fcff';
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawIceFloe(g, theme) {
  const left = g.x - g.width / 2;
  const top = g.y - g.thickness / 2;
  const r = Math.min(8, g.thickness / 2);
  ctx.save();
  ctx.shadowColor = theme.accentB;
  ctx.shadowBlur = 12;
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
  body.addColorStop(0, '#f7fcff');
  body.addColorStop(0.42, '#b7e4f4');
  body.addColorStop(1, '#3f86a6');
  ctx.fillStyle = body;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(left + g.width * 0.28, top + 5);
  ctx.lineTo(g.x, g.y + 1);
  ctx.lineTo(left + g.width * 0.66, top + g.thickness - 5);
  ctx.stroke();
  ctx.restore();
}

function drawIceSpire(g, theme) {
  const fromTop = g.anchor === 'top';
  const half = g.width / 2;
  const left = g.x - half;
  const innerTop = g.y - g.height / 2;
  const innerBot = g.y + g.height / 2;
  const root = fromTop ? innerTop - 20 : innerBot + 20;
  const tip = fromTop ? innerBot : innerTop;
  const yAt = (frac) => fromTop ? root + (tip - root) * frac : root - (root - tip) * frac;
  const poly = iceSpirePolygon(g);
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
  const body = ctx.createLinearGradient(g.x, fromTop ? root : tip, g.x, fromTop ? tip : root);
  body.addColorStop(0, theme.accentA);
  body.addColorStop(1, theme.accentB);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(g.x + half * 0.08, tip);
  ctx.lineTo(g.x - half * 0.12, root);
  ctx.moveTo(left + half * 0.38, yAt(0.97));
  ctx.lineTo(left + half * 0.12, yAt(0.4));
  ctx.stroke();
  ctx.restore();
}

function drawSnowGust(g, theme) {
  const left = g.x - g.width / 2;
  const top = g.y - g.height / 2;
  const down = g.push >= 0;
  const specks = [
    [0.18, 0.22, 13],
    [0.42, 0.58, 9],
    [0.67, 0.3, 16],
    [0.84, 0.72, 8],
    [0.3, 0.84, 11],
    [0.55, 0.12, 7]
  ];
  ctx.save();
  ctx.beginPath();
  ctx.rect(left - 4, top - 4, g.width + 8, g.height + 8);
  ctx.clip();
  const shift = (frame * 1.6) % g.height;
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < specks.length; i++) {
    const s = specks[i];
    const x = left + s[0] * g.width;
    let y = top + s[1] * g.height + (down ? shift : -shift);
    y = top + ((y - top) % g.height + g.height) % g.height;
    const r = s[2];
    const grad = ctx.createRadialGradient(x - 2, y - 3, 1, x, y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, theme.accentB);
    ctx.fillStyle = grad;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 - Math.PI / 2 + i;
      const rr = r * (k % 2 === 0 ? 1 : 0.66);
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawIceArch(g, theme) {
  const fromTop = g.anchor === 'top';
  const half = g.width / 2;
  const left = g.x - half;
  const right = g.x + half;
  const innerTop = g.y - g.height / 2;
  const innerBot = g.y + g.height / 2;
  const root = fromTop ? innerTop - 20 : innerBot + 20;
  const tip = fromTop ? innerBot : innerTop;
  const yAt = (frac) => fromTop ? root + (tip - root) * frac : root - (root - tip) * frac;
  const holeLeft = g.x - g.holeW / 2;
  const holeRight = g.x + g.holeW / 2;
  const capY = fromTop ? g.holeY + g.holeH / 2 : g.holeY - g.holeH / 2;
  ctx.save();
  ctx.shadowBlur = 0;
  const body = ctx.createLinearGradient(g.x, fromTop ? root : tip, g.x, fromTop ? tip : root);
  body.addColorStop(0, theme.accentA);
  body.addColorStop(1, theme.accentB);
  ctx.fillStyle = body;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(left - 14, root);
  ctx.lineTo(left + 8, yAt(0.38));
  ctx.lineTo(left + half * 0.28, yAt(0.62));
  ctx.lineTo(g.x - half * 0.08, yAt(0.84));
  ctx.lineTo(g.x - 4, tip);
  ctx.lineTo(g.x + half * 0.12, yAt(0.9));
  ctx.lineTo(holeLeft, capY);
  ctx.lineTo(holeLeft, root);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(right + 14, root);
  ctx.lineTo(right - 6, yAt(0.34));
  ctx.lineTo(right - half * 0.22, yAt(0.6));
  ctx.lineTo(g.x + half * 0.16, yAt(0.82));
  ctx.lineTo(g.x + 8, tip);
  ctx.lineTo(g.x - half * 0.02, yAt(0.92));
  ctx.lineTo(holeRight, capY);
  ctx.lineTo(holeRight, root);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(left + 10, yAt(0.55));
  ctx.lineTo(holeLeft - 4, root);
  ctx.moveTo(right - 8, yAt(0.5));
  ctx.lineTo(holeRight + 2, root);
  ctx.stroke();
  ctx.restore();
}

function drawSnowball(g) {
  const r = g.r;
  ctx.save();
  ctx.translate(g.x, g.y);
  const body = ctx.createRadialGradient(-r * 0.28, -r * 0.32, r * 0.1, 0, 0, r);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.55, '#f4fbff');
  body.addColorStop(1, '#9fd4ea');
  ctx.fillStyle = body;
  ctx.shadowColor = 'rgba(180, 220, 235, 0.45)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.28, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawIceCalve(g, theme) {
  drawIceChunk({
    x: g.x,
    y: g.y,
    r: Math.max(g.width, g.thickness) * 0.46,
    berg: true,
    rotSeed: 0.6,
    spin: 0
  }, theme);
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

function drawJelly(g) {
  const pose = jellyPose(g);
  ctx.save();
  ctx.lineCap = 'round';
  const glow = ctx.createRadialGradient(pose.x, pose.y - 4, 4, pose.x, pose.y, pose.bellR + 18);
  glow.addColorStop(0, 'rgba(244, 232, 255, 0.85)');
  glow.addColorStop(0.45, 'rgba(186, 156, 230, 0.35)');
  glow.addColorStop(1, 'rgba(186, 156, 230, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pose.x, pose.y, pose.bellR + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(214, 196, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pose.x, pose.y, pose.bellR, Math.PI, 0);
  ctx.quadraticCurveTo(pose.x + pose.bellR * 0.2, pose.y + pose.bellR * 0.85, pose.x, pose.y + pose.bellR * 0.35);
  ctx.quadraticCurveTo(pose.x - pose.bellR * 0.2, pose.y + pose.bellR * 0.85, pose.x - pose.bellR, pose.y);
  ctx.fillStyle = 'rgba(228, 214, 255, 0.72)';
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(176, 150, 214, 0.9)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(pose.x - 6, pose.y + pose.bellR * 0.2);
  ctx.quadraticCurveTo(pose.x + (pose.tx - pose.x) * 0.5, pose.y + pose.tent * 0.55, pose.tx, pose.ty);
  ctx.moveTo(pose.x + 7, pose.y + pose.bellR * 0.15);
  ctx.quadraticCurveTo(pose.x - (pose.tx - pose.x) * 0.35, pose.y + pose.tent * 0.6, pose.tx2, pose.ty2);
  ctx.stroke();
  ctx.restore();
}

function drawSponges(g) {
  const tubes = spongeTubes(g).slice().sort((a, b) => a.h - b.h);
  ctx.save();
  for (const tube of tubes) {
    const topX = tube.x + tube.lean;
    const topY = PLAY_BOTTOM - tube.h;
    const hw = tube.w / 2;
    ctx.beginPath();
    ctx.moveTo(tube.x - hw - 3, PLAY_BOTTOM);
    ctx.lineTo(topX - hw, topY + hw * 0.42);
    ctx.quadraticCurveTo(topX - hw * 0.15, topY + 2, topX, topY + hw * 0.3);
    ctx.quadraticCurveTo(topX + hw * 0.15, topY + 2, topX + hw, topY + hw * 0.42);
    ctx.lineTo(tube.x + hw + 3, PLAY_BOTTOM);
    ctx.closePath();
    const body = ctx.createLinearGradient(topX - hw, topY, topX + hw, topY);
    body.addColorStop(0, '#f6e2b4');
    body.addColorStop(0.42, '#e0b15c');
    body.addColorStop(1, '#a56b2e');
    ctx.fillStyle = body;
    ctx.fill();
    ctx.fillStyle = '#f8e7c4';
    ctx.beginPath();
    ctx.ellipse(topX, topY + hw * 0.3, hw * 0.92, hw * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a2c12';
    ctx.beginPath();
    ctx.ellipse(topX, topY + hw * 0.34, hw * 0.52, hw * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSchool(g) {
  const left = g.x - g.width / 2;
  const top = g.y - g.height / 2;
  const count = Math.max(18, Math.round(g.width * g.height / 2600));
  ctx.save();
  for (let i = 0; i < count; i++) {
    const col = (i * 0.41 + 0.07) % 1;
    const row = ((i * 5) % 7) / 7;
    const fx = left + 18 + col * (g.width - 40);
    const fy = top + 10 + row * (g.height - 20) + Math.sin(frame * 0.09 + i) * 2;
    const len = 13 + (i % 3) * 3;
    ctx.fillStyle = i % 2 ? '#e7fff8' : '#7dcec0';
    ctx.beginPath();
    ctx.ellipse(fx, fy, len * 0.48, 3.4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx + len * 0.28, fy);
    ctx.lineTo(fx + len * 0.62, fy - 3.4);
    ctx.lineTo(fx + len * 0.62, fy + 3.4);
    ctx.fill();
  }
  ctx.restore();
}

function drawUrchin(g) {
  const reach = urchinReach(g);
  const show = Math.max(reach, g.coreR + g.spine * 0.45);
  const y = urchinCenter(g);
  ctx.save();
  ctx.strokeStyle = '#d7fff2';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.85;
  const spines = g.coreR > 22 ? 18 : 14;
  for (let i = 0; i < spines; i++) {
    const a = (i / spines) * Math.PI * 2 + g.phase;
    ctx.beginPath();
    ctx.moveTo(g.x + Math.cos(a) * (g.coreR * 0.45), y + Math.sin(a) * (g.coreR * 0.45));
    ctx.lineTo(g.x + Math.cos(a) * show, y + Math.sin(a) * show);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const body = ctx.createRadialGradient(g.x - 3, y - 3, 2, g.x, y, g.coreR);
  body.addColorStop(0, '#35524e');
  body.addColorStop(1, '#101816');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(g.x, y, g.coreR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNeonBar(g, theme) {
  const left = g.x - g.width / 2;
  const top = g.y - g.thick / 2;
  const color = g.hot ? theme.accentB : theme.accentA;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.fillRect(left, top, g.width, g.thick);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff7ff';
  ctx.fillRect(left, g.y - 1.5, g.width, 3);
  ctx.restore();
}

