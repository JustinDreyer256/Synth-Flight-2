function terrainBoundsAt(x) {
  for (let i = 0; i < terrainSegments.length - 1; i++) {
    const a = terrainSegments[i], b = terrainSegments[i + 1];
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x);
      return {
        top: a.topY + (b.topY - a.topY) * t,
        bottom: a.bottomY + (b.bottomY - a.bottomY) * t,
        islandTop: a.islandTop + (b.islandTop - a.islandTop) * t,
        islandBottom: a.islandBottom + (b.islandBottom - a.islandBottom) * t
      };
    }
  }
  return null;
}

function liveGateGap(gate) {
  const theme = currentTheme();
  const baseGap = currentGapSize();
  if (!theme.pulseGap) return baseGap;
  const amp = baseGap * theme.pulseAmpFrac;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const minGap = Math.max(50, baseGap * (1 - theme.pulseAmpFrac));
  const maxGap = Math.min(playHeight - 40, baseGap * (1 + theme.pulseAmpFrac));
  let g = baseGap + amp * Math.sin((frame - zoneStartFrame) * gate.pulseFreq + gate.pulsePhase);
  return Math.max(minGap, Math.min(maxGap, g));
}

function diamondGeometry(gate) {
  const radius = liveGateGap(gate) / 2;
  const centerX = gate.x + GATE_WIDTH / 2;
  const centerY = liveGateCenter(gate);
  return { radius, centerX, centerY };
}

function liveGateCenter(gate) {
  const margin = 20;
  let minCenter;
  let maxCenter;
  if (gate.type === 'hbar') {
    const half = (gate.thickness || 18) / 2;
    minCenter = PLAY_TOP + half + margin;
    maxCenter = PLAY_BOTTOM - half - margin;
  } else {
    const gap = liveGateGap(gate);
    minCenter = PLAY_TOP + gap / 2 + margin;
    maxCenter = PLAY_BOTTOM - gap / 2 - margin;
  }
  let c = gate.baseCenter + gate.amplitude * Math.sin((frame - zoneStartFrame) * gate.freq + gate.phase);
  return Math.max(minCenter, Math.min(maxCenter, c));
}

function initBackgroundParticles(theme) {
  bgParticles = [];
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  if (theme.bgStyle === 'matrix') {
    for (let i = 0; i < 64; i++) {
      const tint = i % 3;
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        speed: 1.2 + Math.random() * 3.2,
        len: 16 + Math.random() * 46,
        alpha: 0.22 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.35,
        tint
      });
    }
  } else if (theme.bgStyle === 'stars') {
    for (let i = 0; i < 90; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 0.6 + Math.random() * 1.8,
        alpha: 0.3 + Math.random() * 0.7,
        speed: 0.3 + Math.random() * 1.4
      });
    }
  } else if (theme.bgStyle === 'frozen') {
    for (let i = 0; i < 56; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 1 + Math.random() * 2.4,
        alpha: 0.35 + Math.random() * 0.55,
        speed: 0.6 + Math.random() * 1.6,
        drift: 0.4 + Math.random() * 1.1
      });
    }
    } else if (theme.bgStyle === 'embers') {
    for (let i = 0; i < 16; i++) {
      bgParticles.push({
        kind: 'rush',
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        speed: 7 + Math.random() * 10,
        len: 28 + Math.random() * 70,
        alpha: 0.08 + Math.random() * 0.16,
        thick: 1 + Math.random() * 1.4
      });
    }
    for (let i = 0; i < 18; i++) {
      bgParticles.push({
        kind: 'spark',
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        speed: 3.2 + Math.random() * 5.5,
        lift: 0.15 + Math.random() * 0.55,
        len: 10 + Math.random() * 22,
        r: 0.7 + Math.random() * 1.6,
        alpha: 0.28 + Math.random() * 0.45
      });
    }
  } else if (theme.bgStyle === 'chrome') {
    for (let i = 0; i < 16; i++) {
      bgParticles.push({
        kind: 'rush',
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        speed: 7 + Math.random() * 10,
        len: 28 + Math.random() * 70,
        alpha: 0.32 + Math.random() * 0.38,
        thick: 1 + Math.random() * 1.4
      });
    }
    for (let i = 0; i < 18; i++) {
      bgParticles.push({
        kind: 'spark',
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        speed: 3.2 + Math.random() * 5.5,
        lift: 0.15 + Math.random() * 0.55,
        len: 10 + Math.random() * 22,
        r: 0.7 + Math.random() * 1.6,
        alpha: 0.45 + Math.random() * 0.4
      });
    }
  } else if (theme.bgStyle === 'ruins') {
    for (let i = 0; i < 45; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 0.8 + Math.random() * 1.8,
        alpha: 0.2 + Math.random() * 0.4,
        speed: 0.15 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.3
      });
    }
  } else if (theme.bgStyle === 'toxic') {
    for (let i = 0; i < 36; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 1.2 + Math.random() * 2.4,
        alpha: 0.12 + Math.random() * 0.18,
        speed: 0.12 + Math.random() * 0.28,
        drift: (Math.random() - 0.5) * 0.25,
        wobble: Math.random() * Math.PI * 2,
        stretch: 1.2 + Math.random() * 0.8
      });
    }
  } else if (theme.bgStyle === 'station') {
    for (let i = 0; i < 40; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 0.6 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.3,
        speed: 0.1 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.5
      });
    }
  } else if (theme.bgStyle === 'void') {
    for (let i = 0; i < 22; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 0.4 + Math.random() * 1.0,
        alpha: 0.08 + Math.random() * 0.18,
        speed: 0.05 + Math.random() * 0.15,
        drift: 0
      });
    }
  } else if (theme.bgStyle === 'solar') {
    for (let i = 0; i < 28; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight * 0.72,
        speed: 3.2 + Math.random() * 6,
        len: 48 + Math.random() * 110,
        alpha: 0.16 + Math.random() * 0.34,
        thick: 1 + Math.random() * 1.6
      });
    }
  } else if (theme.bgStyle === 'kelp') {
    for (let i = 0; i < 48; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        r: 1.2 + Math.random() * 2.6,
        alpha: 0.15 + Math.random() * 0.28,
        speed: 0.35 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.4,
        wobble: Math.random() * Math.PI * 2
      });
    }
  } else if (theme.bgStyle === 'storm') {
    for (let i = 0; i < 70; i++) {
      bgParticles.push({
        x: Math.random() * W,
        y: PLAY_TOP + Math.random() * playHeight,
        speed: 5 + Math.random() * 6,
        len: 15 + Math.random() * 20,
        alpha: 0.2 + Math.random() * 0.4
      });
    }
  }
}

function reseedZoneObstacles(startX) {
  gates = [];
  shipYHistory = [];
  patternIndex = 0;
  fireballSpawnCounter = 0;
  extraFireballCounter = 0;
  extraFireballPatternIndex = 0;
  extraToxicCounter = 0;
  extraToxicPatternIndex = 0;
  extraGeyserCounter = 0;
  extraGeyserPatternIndex = 0;
  extraStarCounter = 0;
  extraStarPatternIndex = 0;
  extraMovingDoorCounter = 0;
  extraMovingDoorPatternIndex = 0;
  specialEventsSpawned = [false, false, false];
  specialDoorUnlocked = [false, false, false];
  blackHoleEventsSpawned = currentTheme().blackHoleEvents ? currentTheme().blackHoleEvents.map(() => false) : [];
  windVortexEventsSpawned = currentTheme().windVortexEvents ? currentTheme().windVortexEvents.map(() => false) : [];
  cloudArcEventsSpawned = currentTheme().cloudArcEvents ? currentTheme().cloudArcEvents.map(() => false) : [];
  lightningStrikeEventsSpawned = currentTheme().lightningStrikeEvents ? currentTheme().lightningStrikeEvents.map(() => false) : [];
  lasergridEventsSpawned = currentTheme().lasergridEvents ? currentTheme().lasergridEvents.map(() => false) : [];
  droneSwarmEventsSpawned = currentTheme().droneSwarmEvents ? currentTheme().droneSwarmEvents.map(() => false) : [];
  billboardEventsSpawned = currentTheme().billboardEvents ? currentTheme().billboardEvents.map(() => false) : [];
  searchlightEventsSpawned = currentTheme().searchlightEvents ? currentTheme().searchlightEvents.map(() => false) : [];
  turretEventsSpawned = currentTheme().turretEvents ? currentTheme().turretEvents.map(() => false) : [];
  signalCorruptionEventsSpawned = currentTheme().signalCorruptionEvents ? currentTheme().signalCorruptionEvents.map(() => false) : [];
  empEventsSpawned = currentTheme().empEvents ? currentTheme().empEvents.map(() => false) : [];
  echoTrailEventsSpawned = currentTheme().echoTrailEvents ? currentTheme().echoTrailEvents.map(() => false) : [];
  pulsingOrbEventsSpawned = currentTheme().pulsingOrbEvents ? currentTheme().pulsingOrbEvents.map(() => false) : [];
  boomerangEventsSpawned = currentTheme().boomerangEvents ? currentTheme().boomerangEvents.map(() => false) : [];
  oncomingCometEventsSpawned = currentTheme().oncomingCometEvents ? currentTheme().oncomingCometEvents.map(() => false) : [];
  splitRockEventsSpawned = currentTheme().splitRockEvents ? currentTheme().splitRockEvents.map(() => false) : [];
  extraStormCounter = 0;
  extraStormPatternIndex = 0;
  extraOrbiterCounter = 0;
  extraOrbiterPatternIndex = 0;
  extraArcPlanetCounter = 0;
  extraArcPlanetPatternIndex = 0;
  lensingZoneEventsSpawned = currentTheme().lensingZoneEvents ? currentTheme().lensingZoneEvents.map(() => false) : [];
  supernovaEventsSpawned = currentTheme().supernovaEvents ? currentTheme().supernovaEvents.map(() => false) : [];
  extraHubCounter = 0;
  extraHubPatternIndex = 0;
  iceChunkPatternIndex = 0;
  iceFloePatternIndex = 0;
  iceBergPatternIndex = 0;
  glacierSnowContinue = false;
  glacierSnowballX = 0;
  glacierSnowLane = 0;
  resetGlacierSnowSpawned();
  iceChunkSpawnX = W + 700;
  if (currentTheme().obstacleShape === 'terrain') {
    initTerrain();
  } else if (currentTheme().obstacleShape === 'kelp' || currentTheme().obstacleShape === 'copper' || currentTheme().obstacleShape === 'chrome') {
    let x = Math.max(startX, W + 220);
    for (let i = 0; i < 6; i++) {
      if (i > 0) {
        const th0 = currentTheme();
        x += th0.pattern[patternIndex % th0.pattern.length].spacing || GATE_SPACING;
      }
      spawnGate(x);
      lastSpawnX = x;
    }
  } else if (currentTheme().obstacleShape !== 'none') {
    let x = startX;
    for (let i = 0; i < 6; i++) {
      if (i > 0) {
        const th0 = currentTheme();
        x += th0.pattern[patternIndex % th0.pattern.length].spacing || GATE_SPACING;
      }
      spawnGate(x);
      lastSpawnX = x;
    }
  }
  if (currentTheme().isBossZone) {
    miniBoss = null;
    const bossBaseY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.5;
    const bossMaxR = (PLAY_BOTTOM - PLAY_TOP) * 0.22;
    // fixed distance from the ship, calibrated to match Claude's preview
    // width -- not a proportion of W, which would grow the gap on wider
    // screens. clamped so narrower windows can't push the boss's sphere
    // off the right edge of the screen
    const bossFinalX = Math.min(ship.x + 415, W - bossMaxR - 40);
    const fragmentCount = 8;
    const fragments = [];
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (i / fragmentCount) * Math.PI * 2;
      const dist = 280 + 60 * Math.sin(i * 2.7); // deterministic variation, not random
      fragments.push({
        startX: bossFinalX + Math.cos(angle) * dist,
        startY: bossBaseY + Math.sin(angle) * dist,
        size: 8 + 4 * Math.sin(i * 1.9)
      });
    }
    boss = {
      x: bossFinalX,
      y: bossBaseY,
      baseY: bossBaseY,
      maxR: bossMaxR,
      r: 0,
      fragments: fragments
    };
    bossSpawnFrame = frame;
    bossTimer = currentTheme().bossDuration;
    bossPhase = 1;
    bossDefeated = false;
    bossDefeatFrame = 0;
    bossAttackTimer = 0;
    bossVolleyTimer = 0;
    bossTransitioning = false;
    bossTransitionStartFrame = 0;
    bossTransitionEndFrame = -9999;
    bossWaitingForClear = false;
    bossWaitingForClearStartFrame = -1;
    bossRagePulseTimer = 0;
    bossDiagonalRingTimer = 0;
    bossDoubleWallTimer = 0;
    bossDoubleWallPendingFrame = -1;
    bossDroneFormationTimer = 0;
    bossHomingFragmentTimer = 0;
    bossChargeBeamTimer = 0;
    bossChargeBeamNextGap = BOSS_CHARGE_BEAM_MIN_GAP + Math.floor(Math.random() * (BOSS_CHARGE_BEAM_MAX_GAP - BOSS_CHARGE_BEAM_MIN_GAP + 1));
    bossChargeBeamCount = 0;
    bossEmberTimer = 0;
    bossAshCloudTimer = 0;
    bossBeamHoldBlendStartFrame = -9999;
    bossFinalChargeActive = false;
    bossFinalChargeStartFrame = -1;
    bossExplosionActive = false;
    bossExplosionStartFrame = -1;
    postBossDowntimeActive = false;
    postBossDowntimeStartFrame = -1;
    shipFlyOffActive = false;
    shipFlyOffStartFrame = -1;
    bossFullyDefeated = false;
  } else if (currentTheme().isMiniBossZone) {
    boss = null;
    // undo any escape-run mutations left over from a previous playthrough
    // in this session (theme objects persist across resetGame calls)
    const th = currentTheme();
    th.obstacleShape = 'none';
    th.pattern = [{ spacing: 100000 }];
    delete th.scrollMult;
    delete th.ampMult;
    delete th.freqMult;
    delete th.pulseGap;
    delete th.gapFractionStart;
    delete th.gapConstant;
    delete th.terrainSpacing;
    delete th.terrainMaxDelta;
    const miniBaseY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.5;
    const miniBossMaxR = (PLAY_BOTTOM - PLAY_TOP) * 0.16 * 0.85; // 15% smaller
    // fixed distance from the ship, calibrated to match Claude's preview
    // width -- not a proportion of W, which would grow the gap on wider
    // screens (same issue as the main boss). clamped so narrow windows
    // can't push it off the right edge
    const miniRestX = th.miniBossVariant === 'core'
      ? Math.min(ship.x + 588, W - 84) // wall boss sits at the arena edge, not mid-arena
      : Math.min(ship.x + 366, W - miniBossMaxR - 40);
    miniBoss = {
      x: W + 120, // starts off-screen, flies in during the entrance
      restX: miniRestX,
      y: miniBaseY,
      baseY: miniBaseY,
      maxR: miniBossMaxR,
      r: 0
    };
    miniBossSpawnFrame = frame;
    miniBossDefeated = false;
    miniBossDefeatFrame = 0;
    miniBossWallRecedeStartFrame = -1;
    miniBossAttackState = th.miniBossVariant === 'core' ? 'coreFloating' : 'floating';
    miniBossAttackStateStartFrame = 0;
    miniBossChargeHeights = [0.2, 0.5, 0.8];
    miniBossChargeIndex = 0;
    miniBossChargeRound = 1;
    miniBossHadFirstFloat = false;
    miniBossNextAttackSet = 1;
    miniBossCyclesCompleted = 0;
    miniBossBarrageEmbers = [];
    miniBossBarrageWavesLaunched = 0;
    miniBossDeathPatches = [];
    miniBossDeathAshParticles = [];
    miniBossWallCracks = [];
    snowWallDetail = [];
    coreWallPanels = [];
    coreWallSensors = [];
    miniBossEscapeRunActive = false;
    snowIcicles = [];
    snowRollers = [];
    snowAttackStep = 0;
    snowIcicleSpawned = 0;
    snowRollerSpawned = 0;
    snowFeintStage = 'high';
    snowBossSquash = 0;
    snowDeathBurst = false;
    coreBossPhase = 1;
    coreBossHadFirstFloat = false;
    coreBossDefeated = false;
    coreBossDefeatFrame = 0;
    coreSparks = [];
    coreEmpPulses = [];
    coreCrossfireRound = 0;
    coreCrossfireBeamYs = [];
    lastCoreCrossfireVolleyFrame = -999;
    coreOrbitSpawned = 0;
    coreOrbitProjectiles = [];
    coreOrbitEmitAngle = 0;
    coreEyeBeamState = 'track';
    coreEyeBeamStateStartFrame = 0;
    coreTeslaState = 'charging';
    coreTeslaStateStartFrame = 0;
    coreTeslaProjectiles = [];
    coreGateOpenAmount = 0;
    coreDeathPatches = [];
    coreDeathDebris = [];
  } else {
    boss = null;
    miniBoss = null;
  }
}

// maps a death count to its rank tier letter -- shared by the
// achievement-granting logic below and the victory screen's own display
function rankTierForDeaths(deaths) {
  if (deaths <= 3) return 'S';
  if (deaths <= 9) return 'A';
  if (deaths <= 14) return 'B+';
  if (deaths <= 18) return 'B';
  return 'C';
}
const RANK_TIER_ORDER = ['S', 'A', 'B+', 'B', 'C']; // best to worst
const RANK_TIER_HINTS = {
  S: '0-3 deaths',
  A: '4-9 deaths',
  'B+': '10-14 deaths',
  B: '15-18 deaths',
  C: '19+ deaths'
};

function tryAwardDeathless() {
  // Hard only, no lives lost this zone visit, and not a DEV session.
  // Zone Select practice is allowed so a true deathless clear can be earned
  // one zone at a time.
  if (devSessionActive) return false;
  if (selectedDifficulty !== 'hard') return false;
  if (diedInCurrentZone) return false;
  if (deathlessZones.has(themeIndex)) return false;
  deathlessZones.add(themeIndex);
  return true;
}

function triggerVictory() {
  if (isPracticeRun) {
    if (tryAwardDeathless()) savePlayerProfile();
    endPracticeRun();
    return;
  }
  stopLiftSound();
  stopGlowDangerSound();
  stopFireballBreathSound();
  stopToxicHazardSounds();
  stopDustStormSound();
  stopMeteorStreakSound();
  stopStormSkiesHazardSounds();
  stopMovingDoorSound();
  stopBlackHoleSound();
  sfxVictory();
  state = 'victory';
  clearTimeMs = nowMs() - runStartTimeMs;
  if (devSessionActive) return; // dev preview only -- screen still displays, nothing gets recorded
  let profileChanged = false;
  if (!completedZones.has(themeIndex)) {
    completedZones.add(themeIndex);
    profileChanged = true;
  }
  zoneCompletionCounts[themeIndex] = (zoneCompletionCounts[themeIndex] || 0) + 1;
  profileChanged = true;
  if (tryAwardDeathless()) profileChanged = true;
  if (!beatenDifficulties.has(selectedDifficulty)) {
    beatenDifficulties.add(selectedDifficulty);
    profileChanged = true;
  }
  // earning a given rank tier also grants every tier below it (e.g. B
  // Rank also unlocks the C Rank achievement), since a better rank always
  // satisfies a worse tier's requirement too
  const earnedTierIdx = RANK_TIER_ORDER.indexOf(rankTierForDeaths(totalDeaths));
  for (let i = earnedTierIdx; i < RANK_TIER_ORDER.length; i++) {
    const tier = RANK_TIER_ORDER[i];
    if (!achievedRanks.has(tier)) {
      achievedRanks.add(tier);
      profileChanged = true;
    }
  }
  if ((selectedDifficulty === 'normal' || selectedDifficulty === 'hard') && !extraDifficultyUnlocked) {
    extraDifficultyUnlocked = true;
    justUnlockedExtraDifficulty = true;
    profileChanged = true;
  }
  if (profileChanged) savePlayerProfile();
  if (justUnlockedExtraDifficulty) sfxOverdriveUnlock();
}

function resetGame() {
  ship = { x: W * 0.28, y: H / 2, vy: 0, rotation: 0 };
  distance = 0;
  frame = 0;
  holding = false;
  pointerHolding = false;
  keyHolding = false;
  stopLiftSound();
  stopGlowDangerSound();
  stopFireballBreathSound();
  stopToxicHazardSounds();
  stopDustStormSound();
  stopMeteorStreakSound();
  stopStormSkiesHazardSounds();
  stopMovingDoorSound();
  stopBlackHoleSound();
  stopMoltenCoreIdleSound();
  stopMoltenFlameWallSound();
  stopMoltenSqueezeSound();
  stopMoltenDeathAshSound();
  stopCoreBulkheadHoldSound();
  stopAllPulsingOrbSounds();
  stopAllBoomerangSounds();
  stopMegaManCharge(0.02);
  stopSignalFinalCharge(0.02);
  stopCoreOverload(0.02);
  stopSignalPhase(0.04);
  state = 'ready';
  themeIndex = 0;
  themeLevelReached = 0;
  warpActive = false;
  warpTimer = 0;
  const diffConfig = DIFFICULTY_CONFIG[selectedDifficulty] || DIFFICULTY_CONFIG.normal;
  MAX_LIVES = diffConfig.lives;
  continuesRemaining = diffConfig.continues;
  invincibilityEndTime = -1;
  freeHitCooldownEndTime = -1;
  resetHitCyclePauseClock();
  freeHitsUsedThisLife = 0;
  pendingRespawnMercyEligible = false;
  diedInCurrentZone = false;
  awaitingFirstFlyHold = false;
  showFlyControlsHint = false;
  lives = MAX_LIVES;
  maxDistanceReached = 0;
  lastDeathDistance = 0;
  zoneStartDistance = 0;
  zoneStartFrame = 0;
  portalObject = null;
  totalDeaths = 0;
  deathsByZone = {};
  runStartTimeMs = nowMs();
  clearTimeMs = 0;
  justUnlockedExtraDifficulty = false;
  isPracticeRun = false;
  devSessionActive = false;
  bossFinalChargeActive = false;
  bossFinalChargeStartFrame = -1;
  bossExplosionActive = false;
  bossExplosionStartFrame = -1;
  postBossDowntimeActive = false;
  postBossDowntimeStartFrame = -1;
  shipFlyOffActive = false;
  shipFlyOffStartFrame = -1;
  bossFullyDefeated = false;
  bossDefeated = false;
  miniBossEscapeRunActive = false;
  shipTrailParticles = [];
  shipToxicDrips = [];
  shipToxicDripCooldown = 0;

  initBackgroundParticles(currentTheme());
  reseedZoneObstacles(ship.x + 420);
}

function respawnInZone(opts) {
  ship = { x: W * 0.28, y: H / 2, vy: 0, rotation: 0 };
  distance = zoneStartDistance;
  holding = false;
  stopLiftSound();
  stopGlowDangerSound();
  stopFireballBreathSound();
  stopToxicHazardSounds();
  stopDustStormSound();
  stopMeteorStreakSound();
  stopStormSkiesHazardSounds();
  stopMovingDoorSound();
  stopBlackHoleSound();
  if (!opts || opts.playLifeLost !== false) sfxLifeLost();
  state = 'respawn';
  portalObject = null;
  invincibilityEndTime = -1;
  freeHitCooldownEndTime = -1;
  freeHitsUsedThisLife = 0;
  pendingRespawnMercyEligible = false;
  resetHitCyclePauseClock();
  initBackgroundParticles(currentTheme());
  reseedZoneObstacles(ship.x + 420);
}

function armFlyControlsHint() {
  if (flyControlsHintSeen) return;
  flyControlsHintSeen = true;
  awaitingFirstFlyHold = true;
  showFlyControlsHint = true;
  lastRenderedOverlayState = null;
}

function flyControlsHintHtml() {
  const sub = MOBILE_PERFORMANCE_MODE
    ? 'TAP AND HOLD  ·  RELEASE TO FALL'
    : 'LEFT CLICK OR SPACE  ·  RELEASE TO FALL';
  return `
      <div class="fly-controls-hint" aria-live="polite">
        <div class="fly-controls-hint-title">HOLD TO FLY</div>
        <div class="fly-controls-hint-sub">${sub}</div>
      </div>
    `;
}

function noteFlyHold() {
  if (!awaitingFirstFlyHold && !showFlyControlsHint) return;
  awaitingFirstFlyHold = false;
  if (showFlyControlsHint) {
    showFlyControlsHint = false;
    lastRenderedOverlayState = null;
  }
}

function beginRunFromOptions() {
  resetGame(); // locks in MAX_LIVES/continuesRemaining for the chosen difficulty
  armFlyControlsHint();
  sfxStart();
  holding = false;
  beginWarp(0);
  state = 'playing';
  // Start file-backed music while the click/key gesture is still active.
  // Embedded hosts such as itch.io can reject HTMLAudio.play() when it is
  // deferred until the next animation frame, even though Web Audio SFX work.
  updateBgmForState();
  lastRenderedOverlayState = null;
  updateOverlay();
}

function startPress() {
  if (state === 'home') {
    state = 'options';
    updateOverlay();
  } else if (state === 'options') {
    beginRunFromOptions();
  } else if (state === 'ready') {
    state = 'playing';
  } else if (state === 'respawn') {
    sfxRespawn();
    state = 'playing';
    if (pendingRespawnMercyEligible && DIFFICULTY_CONFIG[selectedDifficulty]?.invincibilityFrames) {
      invincibilityEndTime = gameNowMs() + INVINCIBILITY_DURATION_MS;
    }
    pendingRespawnMercyEligible = false;
  } else if (state === 'gameover' || state === 'victory') {
    resetGame();
    flyControlsHintSeen = false;
    state = 'home';
    return;
  }
  holding = true;
}

function endPress() {
  holding = pointerHolding || keyHolding;
}

// cycles the selected difficulty in either direction, skipping over the
// 4th tier while it's still locked so it can never be landed on by cycling
function cycleDifficulty(direction) {
  const order = ['easy', 'normal', 'hard', 'extra'];
  let idx = order.indexOf(selectedDifficulty);
  do {
    idx = (idx + direction + order.length) % order.length;
  } while (order[idx] === 'extra' && !extraDifficultyUnlocked);
  selectedDifficulty = order[idx];
  updateOverlay();
}

// pause/resume: deliberately kept off the normal hold-to-fly input (mouse
// click, space, touch) so a misclick or accidental tap during play can
// never trigger it -- only the dedicated pause button or the Escape key
function pauseGame() {
  if (state !== 'playing') return;
  state = 'paused';
  beginHitCyclePauseClock();
  pointerHolding = false;
  holding = keyHolding;
  stopLiftSound();
  stopGlowDangerSound();
  sfxPause();
}

function resumeGame() {
  if (state !== 'paused') return;
  endHitCyclePauseClock();
  state = 'playing';
}

function quitToHome() {
  if (isPracticeRun) {
    endPracticeRun();
    return;
  }
  resetGame();
  flyControlsHintSeen = false;
  state = 'home';
  savePlayerProfile();
}

function endPracticeRun() {
  const returnZone = practiceZoneIndex;
  isPracticeRun = false;
  resetGame();
  zoneSelectPreviewIdx = unlockedZones.has(returnZone) ? returnZone : 0;
  state = 'zone-select';
  lastRenderedOverlayState = null;
  updateOverlay();
}

function startPracticeZone(zoneIndex) {
  if (!unlockedZones.has(zoneIndex)) return; // shouldn't be reachable via the UI anyway, since locked zones aren't clickable
  resetGame(); // sets isPracticeRun=false, lives/continues based on selectedDifficulty
  isPracticeRun = true;
  practiceZoneIndex = zoneIndex;
  distance = 0;
  themeLevelReached = 0;
  sfxStart();
  prefetchThemeBgm(zoneIndex);
  armFlyControlsHint();
  beginWarp(zoneIndex);
  state = 'playing';
  updateBgmForState();
}

function startInfernoPlaytest() {
  const zoneIndex = THEMES.findIndex((t) => t.name === 'INFERNO');
  if (zoneIndex < 0) return;
  resetGame();
  isPracticeRun = true;
  practiceZoneIndex = zoneIndex;
  distance = 0;
  themeLevelReached = 0;
  state = 'playing';
  beginWarp(zoneIndex);
  while (warpActive) finishWarp();
}

function startForkGallery() {
  startInfernoPlaytest();
}

// continue-prompt: consumes a continue, resets lives, and respawns in
// place -- distance/zone/theme progress is deliberately preserved, since
// that's what distinguishes a continue from starting a fresh run
function useContinue() {
  if (state !== 'continue-prompt' || continuesRemaining <= 0) return;
  continuesRemaining--;
  lives = MAX_LIVES;
  sfxContinueUsed();
  respawnInZone({ playLifeLost: false }); // sets state to 'respawn' for the usual "click to continue" beat
}

// options screen: difficulty cycling and navigating to/from the Settings
// and Achievements sub-screens. Event delegation since this content is
// re-created via innerHTML each time updateOverlay() renders.
// Uses pointerup rather than click -- pointer events unify mouse, touch,
// and pen handling and don't depend on the browser synthesizing a 'click'
// event afterward, which has had reliability quirks on some mobile
// browsers/webviews, especially combined with CSS transitions on the target.
function focusGameKeyboardInput() {
  try { window.focus(); } catch (e) { /* embedded host may deny window focus */ }
  try {
    canvas.focus({ preventScroll: true });
  } catch (e) {
    try { canvas.focus(); } catch (err) { /* keyboard still has window fallback */ }
  }
}

function handleOverlayActivate(e) {
  if (e && e.type === 'click' && performance.now() < overlayNavLockUntil) return;
  if (e && e.type !== 'click' && e.pointerType === 'mouse' && e.button !== 0) return;
  if (e && e.type === 'pointerup' && overlayPointerStart && e.pointerId === overlayPointerStart.id) {
    const moved = Math.hypot(e.clientX - overlayPointerStart.x, e.clientY - overlayPointerStart.y);
    overlayPointerStart = null;
    if (moved > 10) return;
  }
  const targetTag = e && e.target && e.target.tagName;
  if (targetTag !== 'INPUT' && targetTag !== 'SELECT' && targetTag !== 'TEXTAREA') {
    focusGameKeyboardInput();
  }
  if (state === 'home') {
    unlockAudio();
    try { sfxUiClick(); } catch (err) { /* audio must never block the menu */ }
    overlayNavLockUntil = performance.now() + 400;
    state = 'options';
    updateOverlay();
    return;
  }
  if (state === 'respawn' || state === 'ready' || state === 'gameover' || state === 'victory') {
    startPress();
    updateOverlay();
    return;
  }
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  unlockAudio();
  try { sfxUiClick(); } catch (err) { /* audio must never block the menu */ }
  const action = actionEl.dataset.action;
  overlayNavLockUntil = performance.now() + 400;
  if (state === 'options') {
    if (action === 'diff-prev') cycleDifficulty(-1);
    else if (action === 'diff-next') cycleDifficulty(1);
    else if (action === 'open-settings') { settingsReturnState = 'options'; state = 'settings'; }
    else if (action === 'open-achievements') state = 'achievements';
    else if (action === 'open-statistics') state = 'statistics';
    else if (action === 'open-zone-select') { zoneSelectPreviewIdx = 0; state = 'zone-select'; prefetchThemeBgm(0); }
    else if (action === 'start-game') beginRunFromOptions();
  } else if (state === 'settings') {
    if (action === 'back-to-options') state = settingsReturnState;
    else if (action === 'toggle-sfx') toggleSfxEnabled();
    else if (action === 'toggle-bgm') toggleBgmEnabled();
    else if (action === 'reset-audio-defaults') resetAudioVolumesToDefault();
    else if (action === 'trail-prev') cycleShipTrail(-1);
    else if (action === 'trail-next') cycleShipTrail(1);
    else if (action === 'skin-prev') cycleShipSkin(-1);
    else if (action === 'skin-next') cycleShipSkin(1);
    else if (action === 'copy-save-id') copySaveIdToClipboard();
    else if (action === 'export-save') exportPlayerSaveFile();
    else if (action === 'import-save') {
      const input = document.getElementById('player-save-import');
      if (input) input.click();
    } else if (action === 'restore-save-id') promptRestoreSaveId();
  } else if ((state === 'achievements' || state === 'zone-select' || state === 'statistics') && action === 'back-to-options') {
    state = 'options';
  } else if (state === 'statistics' && action === 'confirm-reset-stats') {
    state = 'confirm-reset-stats';
  } else if (state === 'confirm-reset-stats') {
    if (action === 'cancel-reset-stats') {
      state = 'statistics';
    } else if (action === 'reset-stats-confirmed') {
      resetPlayerProfile();
      state = 'statistics';
    }
  } else if (state === 'zone-select') {
    if (action === 'preview-zone') {
      const idx = parseInt(actionEl.dataset.zoneIdx, 10);
      if (!isNaN(idx) && unlockedZones.has(idx)) {
        zoneSelectPreviewIdx = idx;
        prefetchThemeBgm(idx);
        updateOverlay();
      }
    } else if (action === 'warp-to-zone' && unlockedZones.has(zoneSelectPreviewIdx)) {
      startPracticeZone(zoneSelectPreviewIdx);
    }
  } else if (state === 'paused') {
    if (action === 'resume-game') resumeGame();
    else if (action === 'quit-to-home') quitToHome();
    else if (action === 'open-pause-options') { settingsReturnState = 'paused'; state = 'settings'; }
  } else if (state === 'continue-prompt') {
    if (action === 'use-continue') useContinue();
    else if (action === 'quit-to-home') quitToHome();
  }
  updateOverlay();
}
let overlayNavLockUntil = 0;
let overlayPointerStart = null;
overlay.addEventListener('pointerdown', (e) => {
  overlayPointerStart = { id: e.pointerId, x: e.clientX, y: e.clientY };
});
overlay.addEventListener('pointerup', handleOverlayActivate);
overlay.addEventListener('pointercancel', () => { overlayPointerStart = null; });
overlay.addEventListener('click', handleOverlayActivate);

// Input
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    unlockAudio();
    if (!e.repeat) {
      keyHolding = true;
      startPress();
    }
  } else if (e.code === 'Escape' && !e.repeat) {
    if (state === 'playing') pauseGame();
    else if (state === 'paused') resumeGame();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    keyHolding = false;
    endPress();
  }
});
// Pointer capture keeps Chrome from dropping the hold when the cursor
// crosses the pause button, HUD, or window chrome (mouseleave used to
// call endPress and the ship would just fall).
function canvasStartPress() {
  unlockAudio();
  if (state === 'home') return;
  startPress();
}
function onCanvasPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  if (state === 'home') return;
  e.preventDefault();
  focusGameKeyboardInput();
  pointerHolding = true;
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* older engines */ }
  canvasStartPress();
}
function onCanvasPointerRelease(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  pointerHolding = false;
  endPress();
}
canvas.addEventListener('pointerdown', onCanvasPointerDown, { passive: false });
canvas.addEventListener('pointerup', onCanvasPointerRelease);
canvas.addEventListener('pointercancel', onCanvasPointerRelease);
window.addEventListener('blur', () => {
  pointerHolding = false;
  if (!keyHolding) endPress();
});

const pauseToggleBtn = document.getElementById('pause-toggle');
pauseToggleBtn.addEventListener('pointerup', () => {
  focusGameKeyboardInput();
  if (state === 'playing') pauseGame();
  else if (state === 'paused') resumeGame();
});

function updateBackgroundParticles(theme) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  if (theme.bgStyle === 'matrix') {
    for (let p of bgParticles) {
      p.y += p.speed;
      p.x += p.drift || 0;
      if (p.x < -8) p.x = W + 8;
      if (p.x > W + 8) p.x = -8;
      if (p.y - p.len > PLAY_BOTTOM) {
        p.y = PLAY_TOP - p.len;
        p.x = Math.random() * W;
      }
    }
  } else if (theme.bgStyle === 'stars') {
    for (let p of bgParticles) {
      p.x -= p.speed;
      if (p.x < 0) {
        p.x = W;
        p.y = PLAY_TOP + Math.random() * playHeight;
      }
    }
  } else if (theme.bgStyle === 'frozen') {
    const zoneDist = distance - zoneStartDistance;
    // Full snowfall from the cave mouth through the portal.
    const storm = zoneDist > 680 ? Math.min(1, (zoneDist - 680) / 30) : 0;
    const fall = 1 + storm * 3.2;
    const push = 1 + storm * 2.4;
    for (let p of bgParticles) {
      p.y += p.speed * fall;
      p.x -= p.drift * push;
      if (p.y > PLAY_BOTTOM || p.x < -4) {
        p.y = PLAY_TOP - 4;
        p.x = Math.random() * W;
      }
    }
  } else if (theme.bgStyle === 'embers' || theme.bgStyle === 'chrome') {
    const rushBoost = 0.85 + 0.45 * (theme.scrollMult || 1);
    for (let p of bgParticles) {
      p.x -= p.speed * rushBoost;
      if (p.kind === 'spark') p.y -= p.lift || 0;
      if (p.x < -p.len) {
        p.x = W + 20 + Math.random() * 40;
        p.y = PLAY_TOP + Math.random() * playHeight;
      }
      if (p.kind === 'spark' && p.y < PLAY_TOP) p.y = PLAY_BOTTOM;
    }
  } else if (theme.bgStyle === 'ruins') {
    for (let p of bgParticles) {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < PLAY_TOP) {
        p.y = PLAY_BOTTOM;
        p.x = Math.random() * W;
      }
    }
  } else if (theme.bgStyle === 'toxic') {
    for (let p of bgParticles) {
      p.wobble = (p.wobble || 0) + 0.02;
      p.y -= p.speed;
      p.x += p.drift + Math.sin(p.wobble) * 0.12;
      if (p.y < PLAY_TOP) {
        p.y = PLAY_BOTTOM;
        p.x = Math.random() * W;
      }
    }
  } else if (theme.bgStyle === 'station') {
    for (let p of bgParticles) {
      p.x -= p.speed;
      p.y += Math.sin(frame * 0.01 + p.x * 0.02) * 0.15;
      if (p.x < 0) {
        p.x = W;
        p.y = PLAY_TOP + Math.random() * playHeight;
      }
    }
  } else if (theme.bgStyle === 'void') {
    for (let p of bgParticles) {
      p.x -= p.speed;
      if (p.x < 0) {
        p.x = W;
        p.y = PLAY_TOP + Math.random() * playHeight;
      }
    }
  } else if (theme.bgStyle === 'solar') {
    for (let p of bgParticles) {
      p.x -= p.speed;
      if (p.x + p.len < 0) {
        p.x = W + 20;
        p.y = PLAY_TOP + Math.random() * playHeight * 0.72;
      }
    }
  } else if (theme.bgStyle === 'kelp') {
    for (let p of bgParticles) {
      p.y -= p.speed;
      p.x += Math.sin(frame * 0.02 + p.wobble) * 0.35;
      if (p.y + p.r < PLAY_TOP) {
        p.y = PLAY_BOTTOM + p.r;
        p.x = Math.random() * W;
      }
    }
  } else if (theme.bgStyle === 'storm') {
    for (let p of bgParticles) {
      p.y += p.speed;
      p.x -= p.speed * 0.35; // rain falls at an angle
      if (p.y - p.len > PLAY_BOTTOM || p.x < -20) {
        p.y = PLAY_TOP - p.len;
        p.x = Math.random() * W;
      }
    }
  }
}

function beginWarp(targetIndex) {
  if (isPracticeRun && typeof targetIndex !== 'number') {
    // practice runs only ever play the one selected zone -- any attempt to
    // sequentially advance to "the next zone" ends the run instead
    if (tryAwardDeathless()) savePlayerProfile();
    endPracticeRun();
    return;
  }
  if (typeof targetIndex !== 'number' && !devSessionActive) {
    // normal, sequential advance (not a dev jump, a dev-session zone that's
    // still being auto-scrolled through, or the initial jump into a
    // practice zone -- all of which either pass an explicit targetIndex or
    // set devSessionActive) means the zone being left has just been
    // successfully flown all the way through, for real
    let profileChanged = false;
    if (!completedZones.has(themeIndex)) {
      completedZones.add(themeIndex);
      profileChanged = true;
    }
    zoneCompletionCounts[themeIndex] = (zoneCompletionCounts[themeIndex] || 0) + 1;
    profileChanged = true;
    if (tryAwardDeathless()) profileChanged = true;
    if (profileChanged) savePlayerProfile();
  }
  warpActive = true;
  sfxWarp();
  warpTimer = WARP_DURATION;
  nextThemeIndex = (typeof targetIndex === 'number') ? targetIndex : (themeIndex + 1) % THEMES.length;
  prefetchThemeBgm(nextThemeIndex);
  stopAllBoomerangSounds();
  gates = [];
  portalObject = null;
  // distance keeps accumulating even through long boss/mini-boss zones,
  // where the normal distance-based zone-advance check is intentionally
  // paused -- without this sync, the resulting gap between distance and
  // themeLevelReached would immediately fire that check again on the very
  // first frame of the new zone, skipping straight past it
  themeLevelReached = Math.max(themeLevelReached, Math.floor(distance / THEME_DISTANCE));
}

function finishWarp() {
  warpActive = false;
  themeIndex = nextThemeIndex;
  zoneStartDistance = distance;
  zoneStartFrame = frame;
  ship.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) / 2;
  ship.vy = 0;
  devGracePeriodEndFrame = Math.max(devGracePeriodEndFrame, frame + WARP_LANDING_GRACE_PERIOD);
  diedInCurrentZone = false;
  initBackgroundParticles(currentTheme());
  reseedZoneObstacles(ship.x + 420);
  if (!unlockedZones.has(themeIndex)) {
    unlockedZones.add(themeIndex);
    savePlayerProfile();
  }
}

function spawnMiniBossDeathAshParticle() {
  if (!miniBoss) return;
  const a = Math.random() * Math.PI * 2;
  const dist = miniBoss.maxR * (0.3 + Math.random() * 0.7);
  miniBossDeathAshParticles.push({
    x: miniBoss.x + Math.cos(a) * dist,
    y: miniBoss.y + Math.sin(a) * dist,
    vx: -(0.5 + Math.random() * 1.5), // drifts left, matching the game's own scroll direction
    vy: (Math.random() - 0.5) * 0.6,
    flutterPhase: Math.random() * Math.PI * 2,
    flutterSpeed: 0.05 + Math.random() * 0.05,
    size: 2 + Math.random() * 3,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1,
    life: 0,
    maxLife: 60 + Math.random() * 60
  });
}

function spawnCoreDeathDebris() {
  if (!miniBoss) return;
  const a = Math.random() * Math.PI * 2;
  const dist = miniBoss.maxR * (0.3 + Math.random() * 0.7);
  coreDeathDebris.push({
    x: miniBoss.x + Math.cos(a) * dist,
    y: miniBoss.y + Math.sin(a) * dist,
    vx: -(0.5 + Math.random() * 1.5), // drifts left, matching the game's scroll direction
    vy: (Math.random() - 0.5) * 0.8,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
    size: 3 + Math.random() * 4,
    life: 0,
    maxLife: 60 + Math.random() * 60
  });
}

// ==================== REACTOR CORE boss state machine ====================
// entirely separate from the fire boss above -- own states (all prefixed
// 'core'), own variables, own collision checks done inline rather than
// through the shared gates array. Stays at its resting position the whole
// fight (never charges), cycling through 5 attacks then a power-down death.
function computeCrossfireBeamYs(safeSlot) {
  return CORE_CROSSFIRE_SLOT_FRACS.map((frac, i) => i).filter(i => i !== safeSlot).map(i => {
    const jitter = (Math.random() * 2 - 1) * CORE_CROSSFIRE_SLOT_JITTER;
    return PLAY_TOP + (CORE_CROSSFIRE_SLOT_FRACS[i] + jitter) * (PLAY_BOTTOM - PLAY_TOP);
  });
}

function updateCoreSparks(phaseStartFrame, targetCount, shipTop, shipBottom, shipR) {
  const elapsed = frame - phaseStartFrame;
  if (coreSparkSpawned < targetCount && elapsed >= coreSparkSpawned * CORE_SPARK_SPAWN_INTERVAL) {
    const baseFrac = CORE_SPARK_BASE_FRACS[coreSparkSpawned % CORE_SPARK_BASE_FRACS.length];
    const baseY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * baseFrac;
    coreSparks.push({
      x: miniBoss.x,
      spawnX: miniBoss.x,
      baseY: baseY,
      y: baseY,
      phase: (coreSparkSpawned % 2) * Math.PI // alternate starting phase for variety
    });
    coreSparkSpawned++;
    sfxHazardFire('corespark');
  }
  for (let i = coreSparks.length - 1; i >= 0; i--) {
    const s = coreSparks[i];
    s.x -= CORE_SPARK_SPEED_X;
    const travelled = s.spawnX - s.x;
    s.y = s.baseY + CORE_SPARK_AMPLITUDE * Math.sin(CORE_SPARK_FREQUENCY * travelled + s.phase);
    s.y = Math.max(PLAY_TOP + CORE_SPARK_R, Math.min(PLAY_BOTTOM - CORE_SPARK_R, s.y));
    const dx = ship.x - s.x, dy = ship.y - s.y;
    if (Math.sqrt(dx * dx + dy * dy) < shipR + CORE_SPARK_R) {
      tryEndGame('corespark');
      break;
    }
    if (s.x < -50) coreSparks.splice(i, 1);
  }
}

function beginCoreBulkhead(moving) {
  miniBossAttackState = 'coreBulkheadTelegraph';
  coreBulkheadIsMoving = !!moving;
  coreBulkheadX = ship.x + 150;
  if (!moving) coreBulkheadGapCenter = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.5;
  miniBossAttackStateStartFrame = frame;
  sfxCoreBulkheadTelegraph();
}

function updateReactorCoreBoss() {
  if (coreBossDefeated) {
    if (!shipFlyOffActive && frame - coreBossDefeatFrame >= CORE_BOSS_DEFEAT_PAUSE) {
      shipFlyOffActive = true;
      ship.vx = 0;
    }
    if (shipFlyOffActive && ship.x > W + 60) {
      shipFlyOffActive = false;
      miniBoss = null;
      ship.x = W * 0.28;
      ship.vx = 0;
      beginWarp(); // no escape run for this boss
    }
    return;
  }

  const stateElapsed = frame - miniBossAttackStateStartFrame;
  const shipTop = ship.y - SHIP_H / 2, shipBottom = ship.y + SHIP_H / 2;
  const shipR = SHIP_W * 0.4;

  let sparkTarget = coreSparkSpawned;
  if (miniBossAttackState === 'coreSparkDeploy') sparkTarget = CORE_SPARK_COUNT;
  else if (coreBossPhase === 6 && (miniBossAttackState === 'coreCrossfireTelegraph' ||
      miniBossAttackState === 'coreCrossfireActive' || miniBossAttackState === 'coreCrossfireGap')) {
    sparkTarget = CORE_P6_SPARK_COUNT;
  }
  if (sparkTarget > 0 || coreSparks.length > 0) {
    updateCoreSparks(coreSparkPhaseStartFrame, sparkTarget, shipTop, shipBottom, shipR);
  }

  if (miniBossAttackState === 'coreFloating') {
    miniBoss.x = miniBoss.restX;
    miniBoss.y = miniBoss.baseY; // static wall -- no floating bob

    if (coreBossPhase >= 9) {
      miniBossAttackState = 'coreDying';
      miniBossAttackStateStartFrame = frame;
      sfxCoreDying();
      coreDeathPatches = [];
      for (let i = 0; i < CORE_DEATH_PATCH_COUNT; i++) {
        coreDeathPatches.push({
          angle: Math.random() * Math.PI * 2,
          distFrac: 0.15 + Math.random() * 0.55,
          sizeFrac: 0.35 + Math.random() * 0.35,
          startFrac: (i / CORE_DEATH_PATCH_COUNT) * 0.5 + Math.random() * 0.15
        });
      }
      coreDeathDebris = [];
      return;
    }

    if (coreBossPhase === 7) {
      if (coreSparks.length === 0) beginCoreBulkhead(true);
      return;
    }

    const floatDuration = !coreBossHadFirstFloat ? CORE_BOSS_INITIAL_FLOAT : (coreBossPhase === 3 ? 35 : CORE_BOSS_PRE_ATTACK_FLOAT);
    if (stateElapsed >= floatDuration) {
      coreBossHadFirstFloat = true;
      if (coreBossPhase === 1) {
        miniBossAttackState = 'coreLaserTelegraph';
        coreLaserIndex = 0;
        coreLaserHeights = shuffleArray(CORE_LASER_HEIGHT_FRACS);
        coreLaserY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * coreLaserHeights[0];
        sfxHazardFire('coreLaserTelegraph');
      } else if (coreBossPhase === 2) {
        miniBossAttackState = 'coreBulkheadTelegraph';
        coreBulkheadIsMoving = false;
        coreBulkheadX = ship.x + 150; // well clear of the boss (which sits around ship.x+366), so the wall reads as a distinct obstacle between ship and boss, not overlapping it
        coreBulkheadGapCenter = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * 0.5;
      } else if (coreBossPhase === 3) {
        miniBossAttackState = 'coreSparkDeploy';
        coreSparkSpawned = 0;
        coreSparks = [];
        coreSparkPhaseStartFrame = frame;
        coreP3BeamVolleysFired = 0;
        coreP3BeamState = 'none';
        coreP3BeamYs = [];
      } else if (coreBossPhase === 4) {
        miniBossAttackState = 'coreBulkheadTelegraph';
        coreBulkheadIsMoving = true;
        coreBulkheadX = ship.x + 150; // well clear of the boss (which sits around ship.x+366), so the wall reads as a distinct obstacle between ship and boss, not overlapping it
      } else if (coreBossPhase === 5) {
        miniBossAttackState = 'coreEmpTelegraph';
        coreEmpPulses = [];
        coreEmpWavesLaunched = 0;
        miniBoss.y = miniBoss.baseY; // pin to center -- otherwise it's frozen wherever the floating bob happened to be, misaligning EMP lanes against the (always-centered) squeeze walls
      } else if (coreBossPhase === 6) {
        miniBossAttackState = 'coreCrossfireTelegraph';
        coreCrossfireRound = 0;
        const safeSlot = Math.floor(Math.random() * CORE_CROSSFIRE_SLOT_FRACS.length);
        coreCrossfireBeamYs = computeCrossfireBeamYs(safeSlot);
        coreSparkSpawned = 0;
        coreSparks = [];
        coreSparkPhaseStartFrame = frame;
      } else if (coreBossPhase === 7) {
        miniBossAttackState = 'coreBulkheadTelegraph';
        coreBulkheadIsMoving = true;
        coreBulkheadX = ship.x + 150; // well clear of the boss (which sits around ship.x+366), so the wall reads as a distinct obstacle between ship and boss, not overlapping it
      } else if (coreBossPhase === 8) {
        miniBossAttackState = 'coreGateOpen';
        coreGateOpenAmount = 0;
        coreOrbitSpawned = 0;
        coreOrbitProjectiles = [];
        coreOrbitEmitAngle = 0;
        sfxCoreGateOpen();
      }
      miniBossAttackStateStartFrame = frame;
      if (miniBossAttackState === 'coreBulkheadTelegraph') sfxCoreBulkheadTelegraph();
      if (miniBossAttackState === 'coreEmpTelegraph') sfxCoreEmpTelegraph();
    }
  } else if (miniBossAttackState === 'coreLaserTelegraph') {
    if (stateElapsed >= CORE_LASER_TELEGRAPH) {
      miniBossAttackState = 'coreLaserActive';
      miniBossAttackStateStartFrame = frame;
      sfxHazardFire('coreLaserActive');
    }
  } else if (miniBossAttackState === 'coreLaserActive') {
    if (shipTop < coreLaserY + CORE_LASER_THICKNESS / 2 && shipBottom > coreLaserY - CORE_LASER_THICKNESS / 2) {
      tryEndGame('coreLaserActive');
    }
    if (stateElapsed >= CORE_LASER_ACTIVE) {
      coreLaserIndex++;
      if (coreLaserIndex >= CORE_LASER_COUNT) {
        coreBossPhase = 2;
        miniBossAttackState = 'coreFloating';
        miniBossAttackStateStartFrame = frame;
      } else {
        miniBossAttackState = 'coreLaserGap';
        miniBossAttackStateStartFrame = frame;
      }
    }
  } else if (miniBossAttackState === 'coreLaserGap') {
    if (stateElapsed >= CORE_LASER_GAP) {
      coreLaserY = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * coreLaserHeights[coreLaserIndex];
      miniBossAttackState = 'coreLaserTelegraph';
      miniBossAttackStateStartFrame = frame;
      sfxHazardFire('coreLaserTelegraph');
    }
  } else if (miniBossAttackState === 'coreBulkheadTelegraph') {
    if (stateElapsed >= CORE_BULKHEAD_TELEGRAPH) {
      miniBossAttackState = 'coreBulkheadActive';
      miniBossAttackStateStartFrame = frame;
      sfxCoreBulkheadLock();
      startCoreBulkheadHoldSound();
    }
  } else if (miniBossAttackState === 'coreBulkheadActive') {
    let gapCenter = coreBulkheadGapCenter;
    if (coreBulkheadIsMoving) {
      gapCenter = (PLAY_TOP + PLAY_BOTTOM) / 2 + CORE_BULKHEAD_DRIFT_AMPLITUDE * Math.sin(stateElapsed * (2 * Math.PI / CORE_BULKHEAD_DRIFT_PERIOD));
    }
    const gapTop = gapCenter - CORE_BULKHEAD_GAP_HEIGHT / 2;
    const gapBottom = gapCenter + CORE_BULKHEAD_GAP_HEIGHT / 2;
    if (shipTop < gapTop || shipBottom > gapBottom) {
      tryEndGame('coreBulkheadActive');
    }
    if (stateElapsed >= CORE_BULKHEAD_ACTIVE) {
      coreBossPhase = coreBossPhase + 1;
      miniBossAttackState = 'coreFloating';
      miniBossAttackStateStartFrame = frame;
    }
  } else if (miniBossAttackState === 'coreSparkDeploy') {
    // beam volleys, firing simultaneously alongside the weaving sparks
    if (coreP3BeamState === 'none' && coreP3BeamVolleysFired < CORE_P3_BEAM_TRIGGER_TIMES.length &&
        stateElapsed >= CORE_P3_BEAM_TRIGGER_TIMES[coreP3BeamVolleysFired]) {
      coreP3BeamState = 'telegraph';
      coreP3BeamStateStartFrame = frame;
      const safeSlot = Math.floor(Math.random() * CORE_P3_BEAM_SLOT_FRACS.length);
      coreP3BeamYs = CORE_P3_BEAM_SLOT_FRACS.map((f, i) => i).filter(i => i !== safeSlot)
        .map(i => PLAY_TOP + CORE_P3_BEAM_SLOT_FRACS[i] * (PLAY_BOTTOM - PLAY_TOP));
    } else if (coreP3BeamState === 'telegraph' && frame - coreP3BeamStateStartFrame >= CORE_P3_BEAM_TELEGRAPH) {
      coreP3BeamState = 'active';
      coreP3BeamStateStartFrame = frame;
      sfxCoreCrossfireVolley();
    } else if (coreP3BeamState === 'active') {
      for (const by of coreP3BeamYs) {
        if (shipTop < by + CORE_P3_BEAM_THICKNESS / 2 && shipBottom > by - CORE_P3_BEAM_THICKNESS / 2) {
          tryEndGame('coreLaserActive');
          break;
        }
      }
      if (frame - coreP3BeamStateStartFrame >= CORE_P3_BEAM_ACTIVE) {
        coreP3BeamState = 'none';
        coreP3BeamYs = [];
        coreP3BeamVolleysFired++;
      }
    }
    if (coreSparkSpawned >= CORE_SPARK_COUNT && coreSparks.length === 0 &&
        coreP3BeamVolleysFired >= CORE_P3_BEAM_TRIGGER_TIMES.length && coreP3BeamState === 'none') {
      coreBossPhase = 4;
      beginCoreBulkhead(true);
    }
  } else if (miniBossAttackState === 'coreEmpTelegraph') {
    if (stateElapsed >= CORE_EMP_TELEGRAPH) {
      miniBossAttackState = 'coreEmpActive';
      miniBossAttackStateStartFrame = frame;
      coreEmpPhaseStartFrame = frame;
    }
  } else if (miniBossAttackState === 'coreEmpActive') {
    const squeezeCenter = (PLAY_TOP + PLAY_BOTTOM) / 2;
    const cyclePos = ((frame - coreEmpPhaseStartFrame) % CORE_SQUEEZE_PERIOD) / CORE_SQUEEZE_PERIOD;
    const squeezeFrac = (1 - Math.cos(cyclePos * 2 * Math.PI)) / 2;
    const squeezeGap = CORE_SQUEEZE_MAX_GAP - (CORE_SQUEEZE_MAX_GAP - CORE_SQUEEZE_MIN_GAP) * squeezeFrac;
    coreSqueezeTopY = squeezeCenter - squeezeGap / 2;
    coreSqueezeBottomY = squeezeCenter + squeezeGap / 2;
    if (shipTop <= coreSqueezeTopY || shipBottom >= coreSqueezeBottomY) {
      tryEndGame('coreEmpActive');
    }

    const waveElapsed = frame - coreEmpPhaseStartFrame;
    if (coreEmpWavesLaunched < CORE_EMP_WAVE_COUNT && waveElapsed >= coreEmpWavesLaunched * CORE_EMP_WAVE_INTERVAL) {
      const safeLane = Math.floor(Math.random() * 3);
      for (let lane = 0; lane < 3; lane++) {
        if (lane === safeLane) continue;
        coreEmpPulses.push({
          x: miniBoss.x,
          y: miniBoss.y + (lane - 1) * CORE_EMP_LANE_SPACING,
          vx: -CORE_EMP_SPEED
        });
      }
      coreEmpWavesLaunched++;
      sfxHazardFire('coreEmpPulse');
    }
    for (let i = coreEmpPulses.length - 1; i >= 0; i--) {
      const e = coreEmpPulses[i];
      e.x += e.vx;
      const dx = ship.x - e.x, dy = ship.y - e.y;
      if (Math.sqrt(dx * dx + dy * dy) < shipR + CORE_EMP_R) {
        tryEndGame('coreEmpPulse');
        break;
      }
      if (e.x < -100) coreEmpPulses.splice(i, 1);
    }

    if (stateElapsed >= CORE_EMP_ACTIVE) {
      coreBossPhase = 6;
      miniBossAttackState = 'coreFloating';
      miniBossAttackStateStartFrame = frame;
    }
  } else if (miniBossAttackState === 'coreCrossfireTelegraph') {
    if (stateElapsed >= CORE_CROSSFIRE_TELEGRAPH) {
      miniBossAttackState = 'coreCrossfireActive';
      miniBossAttackStateStartFrame = frame;
      sfxCoreCrossfireVolley();
    }
  } else if (miniBossAttackState === 'coreCrossfireActive') {
    for (const by of coreCrossfireBeamYs) {
      if (shipTop < by + CORE_CROSSFIRE_THICKNESS / 2 && shipBottom > by - CORE_CROSSFIRE_THICKNESS / 2) {
        tryEndGame('coreCrossfireActive');
        break;
      }
    }
    if (stateElapsed >= CORE_CROSSFIRE_ACTIVE) {
      coreCrossfireRound++;
      if (coreCrossfireRound >= CORE_CROSSFIRE_ROUNDS) {
        coreBossPhase = 7;
        if (coreSparks.length === 0) {
          beginCoreBulkhead(true);
        } else {
          miniBossAttackState = 'coreFloating';
          miniBossAttackStateStartFrame = frame;
        }
      } else {
        miniBossAttackState = 'coreCrossfireGap';
        miniBossAttackStateStartFrame = frame;
      }
    }
  } else if (miniBossAttackState === 'coreCrossfireGap') {
    if (stateElapsed >= CORE_CROSSFIRE_GAP) {
      const safeSlot = Math.floor(Math.random() * CORE_CROSSFIRE_SLOT_FRACS.length);
      coreCrossfireBeamYs = computeCrossfireBeamYs(safeSlot);
      miniBossAttackState = 'coreCrossfireTelegraph';
      miniBossAttackStateStartFrame = frame;
    }
  } else if (miniBossAttackState === 'coreGateOpen') {
    coreGateOpenAmount = Math.min(1, stateElapsed / CORE_GATE_OPEN_DURATION);
    if (stateElapsed >= CORE_GATE_OPEN_DURATION) {
      miniBossAttackState = 'coreSphereEmerge';
      miniBossAttackStateStartFrame = frame;
      miniBoss.x = miniBoss.restX;
      miniBoss.y = miniBoss.baseY;
      miniBoss.r = miniBoss.maxR;
      sfxCoreEmerge();
    }
  } else if (miniBossAttackState === 'coreSphereEmerge') {
    const emergeT = Math.min(1, stateElapsed / CORE_SPHERE_EMERGE_DURATION);
    const startX = miniBoss.restX, targetX = Math.min(ship.x + CORE_SPHERE_X_OFFSET, miniBoss.restX);
    miniBoss.x = startX + (targetX - startX) * emergeT;
    miniBoss.y = miniBoss.baseY;
    if (stateElapsed >= CORE_SPHERE_EMERGE_DURATION) {
      miniBossAttackState = 'coreOrbitBarrageActive';
      miniBossAttackStateStartFrame = frame;
      coreEyeBeamState = 'track';
      coreEyeBeamStateStartFrame = frame;
      coreEyeBeamY = ship.y;
      sfxCoreEyeBeamTrack();
      coreTeslaState = 'charging';
      coreTeslaStateStartFrame = frame;
      coreTeslaProjectiles = [];
      coreTeslaEmptySlot = pickCoreTeslaEmptySlot();
    }
  } else if (miniBossAttackState === 'coreOrbitBarrageActive') {
    miniBoss.x = Math.min(ship.x + CORE_SPHERE_X_OFFSET, miniBoss.restX);
    miniBoss.y = miniBoss.baseY;
    coreOrbitEmitAngle += CORE_ORBIT_EMIT_ROTATION_SPEED;

    if (coreOrbitSpawned < CORE_ORBIT_COUNT && stateElapsed >= coreOrbitSpawned * CORE_ORBIT_SPAWN_INTERVAL) {
      coreOrbitProjectiles.push({ angle: coreOrbitEmitAngle, dist: CORE_ORBIT_START_DIST, x: 0, y: 0 });
      coreOrbitSpawned++;
      sfxHazardFire('coreOrbit');
    }
    for (let i = coreOrbitProjectiles.length - 1; i >= 0; i--) {
      const p = coreOrbitProjectiles[i];
      p.angle += CORE_ORBIT_TANGENTIAL_SPEED / p.dist;
      p.dist += CORE_ORBIT_OUTWARD_SPEED;
      p.x = miniBoss.x + Math.cos(p.angle) * p.dist;
      p.y = miniBoss.y + Math.sin(p.angle) * p.dist;
      const dx = ship.x - p.x, dy = ship.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < shipR + CORE_ORBIT_R) {
        tryEndGame('coreOrbit');
        break;
      }
      if (p.dist > CORE_ORBIT_MAX_DIST) coreOrbitProjectiles.splice(i, 1);
    }

    // eye beam sub-cycle, running simultaneously with the orbit barrage
    if (coreEyeBeamState === 'track') {
      coreEyeBeamY = ship.y;
      if (frame - coreEyeBeamStateStartFrame >= CORE_EYEBEAM_TRACK_DURATION) {
        coreEyeBeamState = 'lock';
        coreEyeBeamStateStartFrame = frame;
        sfxCoreEyeBeamLock();
      }
    } else if (coreEyeBeamState === 'lock') {
      if (frame - coreEyeBeamStateStartFrame >= CORE_EYEBEAM_LOCK_DURATION) {
        coreEyeBeamState = 'active';
        coreEyeBeamStateStartFrame = frame;
        sfxCoreEyeBeamFire();
      }
    } else if (coreEyeBeamState === 'active') {
      if (shipTop < coreEyeBeamY + CORE_EYEBEAM_THICKNESS / 2 && shipBottom > coreEyeBeamY - CORE_EYEBEAM_THICKNESS / 2) {
        tryEndGame('coreEyeBeam');
      }
      if (frame - coreEyeBeamStateStartFrame >= CORE_EYEBEAM_ACTIVE_DURATION) {
        coreEyeBeamState = 'cooldown';
        coreEyeBeamStateStartFrame = frame;
      }
    } else if (coreEyeBeamState === 'cooldown') {
      if (frame - coreEyeBeamStateStartFrame >= CORE_EYEBEAM_COOLDOWN) {
        coreEyeBeamState = 'track';
        coreEyeBeamStateStartFrame = frame;
        sfxCoreEyeBeamTrack();
      }
    }

    // tesla discharge burst sub-cycle, running simultaneously with the orbit barrage and eye beam
    if (coreTeslaState === 'charging') {
      const teslaElapsed = frame - coreTeslaStateStartFrame;
      const teslaLockWindow = 20; // final frames before firing -- gap position freezes here for a stable telegraph
      if (teslaElapsed < CORE_TESLA_CHARGE_DURATION - teslaLockWindow) {
        coreTeslaEmptySlot = pickCoreTeslaEmptySlot(); // keep tracking the ship's position
      }
      if (teslaElapsed >= CORE_TESLA_CHARGE_DURATION) {
        for (let i = 0; i < CORE_TESLA_SLOT_FRACS.length; i++) {
          if (i === coreTeslaEmptySlot || i === coreTeslaEmptySlot + 1) continue;
          const targetY = PLAY_TOP + CORE_TESLA_SLOT_FRACS[i] * (PLAY_BOTTOM - PLAY_TOP);
          const dx = ship.x - miniBoss.x, dy = targetY - miniBoss.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          coreTeslaProjectiles.push({
            x: miniBoss.x, y: miniBoss.y,
            vx: (dx / dist) * CORE_TESLA_PROJECTILE_SPEED,
            vy: (dy / dist) * CORE_TESLA_PROJECTILE_SPEED
          });
        }
        coreTeslaState = 'cooldown';
        coreTeslaStateStartFrame = frame;
        sfxHazardFire('coreTesla');
      }
    } else if (coreTeslaState === 'cooldown') {
      if (frame - coreTeslaStateStartFrame >= CORE_TESLA_COOLDOWN) {
        coreTeslaState = 'charging';
        coreTeslaStateStartFrame = frame;
        coreTeslaEmptySlot = pickCoreTeslaEmptySlot();
      }
    }
    for (let i = coreTeslaProjectiles.length - 1; i >= 0; i--) {
      const p = coreTeslaProjectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      const dx = ship.x - p.x, dy = ship.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < shipR + CORE_TESLA_PROJECTILE_R) {
        tryEndGame('coreTesla');
        break;
      }
      if (p.x < -50 || p.y < PLAY_TOP - 100 || p.y > PLAY_BOTTOM + 100) {
        coreTeslaProjectiles.splice(i, 1);
      }
    }

    if (stateElapsed >= CORE_ORBIT_BARRAGE_DURATION && coreOrbitSpawned >= CORE_ORBIT_COUNT && coreOrbitProjectiles.length === 0) {
      miniBossAttackState = 'coreOverloadDying';
      miniBossAttackStateStartFrame = frame;
      coreOverloadArcs = [];
      coreDeathDebris = [];
      sfxCoreOverload();
    }
  } else if (miniBossAttackState === 'coreDying') {
    const dimEnd = CORE_DEATH_DIM_DURATION;
    const darkenEnd = dimEnd + CORE_DEATH_DARKEN_DURATION;
    const collapseEnd = darkenEnd + CORE_DEATH_COLLAPSE_DURATION;
    const darkenProgress = Math.max(0, Math.min(1, (stateElapsed - dimEnd) / CORE_DEATH_DARKEN_DURATION));

    if (stateElapsed >= dimEnd && stateElapsed < darkenEnd && stateElapsed % 9 === 0) {
      spawnCoreDeathDebris();
    } else if (stateElapsed >= darkenEnd && stateElapsed < collapseEnd) {
      spawnCoreDeathDebris();
      if (frame % 2 === 0) spawnCoreDeathDebris();
    }
    if (stateElapsed === dimEnd) {
      playElectricCrackles({ count: 8, spacing: 0.018, volume: 0.24 });
      playSynth({ type: 'square', freq: 2200, freqEnd: 240, duration: 0.08, attack: 0.001, decay: 0.02, sustain: 0.12, release: 0.03, volume: 0.08, filterType: 'highpass', filterFreq: 1000, delaySend: 0.05 });
    }
    if (stateElapsed === darkenEnd) sfxCoreDyingCollapse();

    for (let i = coreDeathDebris.length - 1; i >= 0; i--) {
      const p = coreDeathDebris[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life++;
      if (p.life >= p.maxLife) coreDeathDebris.splice(i, 1);
    }

    if (stateElapsed >= collapseEnd) {
      coreBossDefeated = true;
      coreBossDefeatFrame = frame;
    }
  } else if (miniBossAttackState === 'coreOverloadDying') {
    const buildupEnd = CORE_OVERLOAD_BUILDUP_DURATION;
    const flashEnd = buildupEnd + CORE_OVERLOAD_FLASH_DURATION;
    const breakdownEnd = flashEnd + CORE_OVERLOAD_BREAKDOWN_DURATION;

    if (stateElapsed < buildupEnd) {
      // increasing frequency of electrical arcs across the surface as the overload builds
      const buildupProgress = stateElapsed / buildupEnd;
      const arcChance = 0.1 + buildupProgress * 0.5;
      if (Math.random() < arcChance) {
        coreOverloadArcs.push({
          angle1: Math.random() * Math.PI * 2,
          angle2: Math.random() * Math.PI * 2,
          life: 0,
          maxLife: 8 + Math.random() * 8
        });
      }
    } else if (stateElapsed === buildupEnd) {
      sfxCoreOverloadFlash();
    } else if (stateElapsed === flashEnd) {
      sfxCoreOverloadBreakdown();
    } else if (stateElapsed >= flashEnd && stateElapsed < breakdownEnd) {
      spawnCoreDeathDebris();
      if (frame % 2 === 0) spawnCoreDeathDebris();
    }

    for (let i = coreOverloadArcs.length - 1; i >= 0; i--) {
      const a = coreOverloadArcs[i];
      a.life++;
      if (a.life >= a.maxLife) coreOverloadArcs.splice(i, 1);
    }

    for (let i = coreDeathDebris.length - 1; i >= 0; i--) {
      const p = coreDeathDebris[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life++;
      if (p.life >= p.maxLife) coreDeathDebris.splice(i, 1);
    }

    if (stateElapsed >= breakdownEnd) {
      coreBossDefeated = true;
      coreBossDefeatFrame = frame;
      coreDeathDebris = [];
      coreOverloadArcs = [];
    }
  }
}

function update() {
  syncGlowDangerSound();
  syncFireballBreathSound();
  syncToxicHazardSounds();
  syncDustStormSound();
  syncMeteorStreakSound();
  syncWindVortexSound();
  syncStormCloudSound();
  syncMovingDoorSound();
  syncBlackHoleSound();
  syncPulsingOrbSounds();
  syncBoomerangSounds();
  syncMoltenCoreIdleSound();
  syncMoltenFlameWallSound();
  syncMoltenSqueezeSound();
  syncMoltenDeathAshSound();
  syncCoreBulkheadHoldSound();
  if (state === 'playing' && holding) noteFlyHold();
  if (state === 'playing' && !(awaitingFirstFlyHold && !warpActive)) {
    frame++;
    shipYHistory.push(ship.y);
    if (shipYHistory.length > SHIP_Y_HISTORY_MAX) shipYHistory.shift();
    updateShipTrailParticles();
    updateShipToxicDrips();
    const th = currentTheme();
    const effScroll = SCROLL_SPEED * (th.scrollMult || 1);
    distance += effScroll * 0.1;
    maxDistanceReached = Math.max(maxDistanceReached, distance);
    if (!isPracticeRun) totalDistanceTraveled += effScroll * 0.1;

    // black hole pull: within a hole's reach, lift gets weaker and fall
    // gets faster, scaling smoothly with proximity to its center. outside
    // any hole's reach this has no effect at all
    let pullStrength = 0;
    if (!ghostMode) {
      for (const g of gates) {
        if (g.type === 'blackhole') {
          const dx = ship.x - g.x, dy = ship.y - g.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < g.reachR) {
            const s = 1 - dist / g.reachR;
            pullStrength = Math.max(pullStrength, s);
          }
        }
      }
    }
    const effLiftMult = th.liftMult * (1 - pullStrength * 0.45);
    const effGravityMult = th.gravityMult * (1 + pullStrength * 0.7);

    // thick ash cloud: smoothly reduces lift and increases gravity
    // while inside, same falloff pattern as the black hole above but
    // gentler -- a secondary, non-lethal drag rather than a hazard
    let ashCloudStrength = 0;
    for (const g of gates) {
      if (g.type === 'bossashcloud') {
        const dx = ship.x - g.x, dy = ship.y - g.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < g.r) {
          const s = 1 - dist / g.r;
          ashCloudStrength = Math.max(ashCloudStrength, s);
        }
      }
    }
    const effLiftMult2 = effLiftMult * (1 - ashCloudStrength * BOSS_ASH_CLOUD_LIFT_REDUCTION);
    const effGravityMult2 = effGravityMult * (1 + ashCloudStrength * BOSS_ASH_CLOUD_GRAVITY_INCREASE);

    // signal corruption zones invert hold/release for their entire
    // width -- a genuinely different function from anything else in
    // this game (every other hazard is spatial avoidance; this is
    // interference with the player's own input)
    let effectiveHolding = holding;
    for (const g of gates) {
      if (g.type === 'signalcorruption' && Math.abs(ship.x - g.x) < g.zoneWidth / 2) {
        effectiveHolding = !holding;
        break;
      }
    }

    if (frame < devGracePeriodEndFrame && effectiveHolding) {
      devGracePeriodEndFrame = frame; // player has started providing real input -- end the grace period early
    }
    const inGracePeriod = frame < devGracePeriodEndFrame;
    // once the final boss commits to its death sequence, the ship is held
    // steady rather than left under player control -- covers the final
    // charge build-up, the explosion white-out (player can't see to
    // navigate anyway), the quiet downtime beat after, and the fly-off
    // itself, so the ship holds its exact height and flies off purely
    // horizontally instead of gravity dragging it down mid-sequence
    const bossDeathSequenceHold = bossFinalChargeActive || bossExplosionActive || bossFullyDefeated;

    if (inGracePeriod || bossDeathSequenceHold || warpActive) {
      ship.vy = 0; // held perfectly still, immune to gravity
    } else if (effectiveHolding) {
      ship.vy += LIFT_ACCEL * effLiftMult2;
      if (ship.vy < MAX_RISE_SPEED * effLiftMult2) ship.vy = MAX_RISE_SPEED * effLiftMult2;
    } else {
      ship.vy += GRAVITY * effGravityMult2;
      if (ship.vy > MAX_FALL_SPEED * effGravityMult2) ship.vy = MAX_FALL_SPEED * effGravityMult2;
    }

    // thrust SFX is intentionally off during play -- holding to fly would
    // retrigger constantly and get noisy. The loop still exists in SOUND TEST.

    // wind vortex: oscillating force scaling with proximity to any active
    // vortex's center, alternating direction as the ship passes through --
    // capped at the same zone speed limits so it's always counterable
    if (!ghostMode && !inGracePeriod && !bossDeathSequenceHold) {
      let vortexForce = 0;
      for (const g of gates) {
        if (g.type === 'windvortex') {
          const dx = ship.x - g.x, dy = ship.y - g.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < g.reachR) {
            const proximity = 1 - dist / g.reachR;
            vortexForce += VORTEX_MAX_FORCE * proximity * Math.sin(frame * VORTEX_OSCILLATION_FREQ + g.rotSeed);
          }
        }
      }
      if (vortexForce !== 0) {
        ship.vy += vortexForce;
        const capFall = MAX_FALL_SPEED * th.gravityMult;
        const capRise = MAX_RISE_SPEED * th.liftMult;
        if (ship.vy > capFall) ship.vy = capFall;
        if (ship.vy < capRise) ship.vy = capRise;
      }
    }

    // Glacier snow gust: a pale band that shoves the ship. Stronger than
    // hold or release, still capped at normal rise and fall speed.
    if (th.iceChunks && !inGracePeriod && !bossDeathSequenceHold) {
      let gust = 0;
      const gustLeft = ship.x - SHIP_W / 2;
      const gustRight = ship.x + SHIP_W / 2;
      const gustTop = ship.y - SHIP_H / 2;
      const gustBottom = ship.y + SHIP_H / 2;
      for (const g of gates) {
        if (g.type !== 'snowgust') continue;
        const left = g.x - g.width / 2;
        const right = g.x + g.width / 2;
        const top = g.y - g.height / 2;
        const bottom = g.y + g.height / 2;
        if (gustRight > left && gustLeft < right && gustBottom > top && gustTop < bottom) gust += g.push;
      }
      if (gust !== 0) {
        ship.vy += gust;
        const capFall = MAX_FALL_SPEED * th.gravityMult;
        const capRise = MAX_RISE_SPEED * th.liftMult;
        if (ship.vy > capFall) ship.vy = capFall;
        if (ship.vy < capRise) ship.vy = capRise;
      }
    }

    ship.y += ship.vy;
    ship.rotation = Math.max(-15, Math.min(20, ship.vy * 3));

    if (shipFlyOffActive) {
      ship.vx = (ship.vx || 0) + SHIP_FLYOFF_ACCEL;
      ship.x += ship.vx;
      ship.rotation = Math.max(ship.rotation, 8); // nose tilts up triumphantly as it accelerates away
      const flyMargin = SHIP_H;
      if (ship.y < PLAY_TOP + flyMargin) { ship.y = PLAY_TOP + flyMargin; ship.vy = 0; }
      if (ship.y > PLAY_BOTTOM - flyMargin) { ship.y = PLAY_BOTTOM - flyMargin; ship.vy = 0; }
    }

    updateBackgroundParticles(currentTheme());

    const newLevel = Math.floor(distance / THEME_DISTANCE);
    const zoneElapsed = distance - zoneStartDistance;
    // Zone length is always THEME_DISTANCE from the moment this zone
    // started. A long mini-boss fight (Reactor Core) can push the global
    // `distance` clock near the next 1000-boundary; using that global grid
    // here would spawn the portal immediately on The Void (and any other
    // zone that follows a boss). Capture sim pins themeLevelReached high
    // so this check never ends the preview run.
    if (!warpActive && !th.isBossZone && !th.isMiniBossZone && themeLevelReached < 999999 && zoneElapsed >= THEME_DISTANCE) {
      themeLevelReached = Math.max(themeLevelReached + 1, newLevel);
      beginWarp();
    }
    if (miniBossEscapeRunActive && !warpActive && (distance - miniBossEscapeRunStartDistance) >= MINI_BOSS_ESCAPE_RUN_DISTANCE) {
      miniBossEscapeRunActive = false;
      beginWarp();
    }

    if (th.isBossZone && boss) {
      const entranceElapsed = frame - bossSpawnFrame;
      const entranceComplete = entranceElapsed >= BOSS_ENTRANCE_DURATION;

      if (!entranceComplete) {
        // stages 1-2 (charge-up, then fragments assembling): the solid
        // orb itself stays invisible -- drawBoss renders the glitch
        // buildup and converging fragments instead. stage 3: snap to
        // full size instantly rather than continuing to scale, for the
        // dramatic "materialize" beat
        const entranceProgress = Math.min(1, entranceElapsed / BOSS_ENTRANCE_DURATION);
        if (entranceElapsed === 1) sfxSignalEntranceGlitch();
        const prevEntrance = Math.min(1, (entranceElapsed - 1) / BOSS_ENTRANCE_DURATION);
        if (prevEntrance < BOSS_ENTRANCE_CHARGE_END && entranceProgress >= BOSS_ENTRANCE_CHARGE_END) sfxSignalEntranceAssemble();
        if (prevEntrance < BOSS_ENTRANCE_ASSEMBLE_END && entranceProgress >= BOSS_ENTRANCE_ASSEMBLE_END) sfxSignalEntranceSnap();
        boss.r = entranceProgress >= BOSS_ENTRANCE_ASSEMBLE_END ? boss.maxR : 0;
        boss.y = boss.baseY;
      } else if (!bossDefeated) {
        if (bossTransitioning) {
          // frozen mid-transform: no movement, no attacks, no timer
          // countdown -- visibly "straining" to change forms.
          // snapping to center is only appropriate for the 2->3
          // transition, where the float range is small (22px) so it's
          // barely noticeable. by phase 3-4 the float range is much
          // wider (160px), so snapping here for the 4->5 transition
          // would teleport the boss from wherever it was floating
          // straight to center -- instead, freeze it in place
          boss.r = boss.maxR;
          if (bossTransitionTargetPhase !== 5) {
            boss.y = boss.baseY;
          }
          const effTransitionDuration = bossTransitionTargetPhase === 5 ? BOSS_PHASE5_TRANSITION_DURATION : BOSS_TRANSITION_DURATION;
          if (frame - bossTransitionStartFrame >= effTransitionDuration) {
            bossTransitioning = false;
            bossTransitionEndFrame = frame;
            bossPhase = bossTransitionTargetPhase;
            if (bossTransitionTargetPhase === 5) {
              // the boss froze wherever it happened to be, not at
              // center -- ease into the resumed float from there
              // instead of snapping to baseY on the very next frame
              bossBeamHoldBlendStartFrame = frame;
            }
          }
        } else {
          boss.r = boss.maxR;
          const effFloatAmplitude = bossPhase >= 3 ? BOSS_FLOAT_AMPLITUDE_PHASE3 : BOSS_FLOAT_AMPLITUDE;
          // the float wave's phase origin resets the moment phase 3
          // begins (bossTransitionEndFrame), so the oscillation starts
          // fresh from sin(0)=0 -- i.e. exactly boss.baseY, which is
          // where the boss was already sitting through the frozen
          // transition. this avoids a discontinuous jump: instead of
          // the larger amplitude suddenly applying to whatever phase
          // angle the original (pre-transition) wave happened to be
          // at, the range of motion grows outward smoothly from rest
          const floatPhaseOrigin = bossPhase >= 3 ? bossTransitionEndFrame : (bossSpawnFrame + BOSS_ENTRANCE_DURATION);
          const normalFloatY = boss.baseY + effFloatAmplitude * Math.sin((frame - floatPhaseOrigin) * (2 * Math.PI / BOSS_FLOAT_PERIOD));

          const activeBeamGate = gates.find(g => (g.type === 'bosschargebeamtelegraph' && !g.resolved) || g.type === 'bosschargebeam');
          const holdTargetY = activeBeamGate ? activeBeamGate.lockedY : ((bossFinalChargeActive || bossExplosionActive) ? (PLAY_TOP + PLAY_BOTTOM) / 2 : null);
          if (holdTargetY !== null) {
            // "can't move and shoot at the same time" -- eases toward
            // the locked target height and holds there, so the beam
            // visually originates from the boss's own center
            boss.y += (holdTargetY - boss.y) * 0.06;
            bossBeamHoldBlendStartFrame = frame;
          } else if (frame - bossBeamHoldBlendStartFrame < BOSS_BEAM_HOLD_BLEND_DURATION) {
            // brief blend back onto the normal float after the beam
            // ends, rather than snapping straight to the sine wave
            const blendProgress = (frame - bossBeamHoldBlendStartFrame) / BOSS_BEAM_HOLD_BLEND_DURATION;
            boss.y += (normalFloatY - boss.y) * (0.04 + blendProgress * 0.3);
          } else {
            boss.y = normalFloatY;
          }

          if (!bossWaitingForClear && !bossFinalChargeActive && !bossExplosionActive) {
            bossTimer--;
          }
          const elapsed = th.bossDuration - bossTimer;
          const phaseByTime = Math.min(BOSS_NUM_PHASES, Math.floor(elapsed / BOSS_PHASE_DURATION) + 1);

          // telegraphs must resolve even while waiting for a phase change.
          // the clear-wait pauses spawning, and these used to live only in
          // the spawn branch -- an unfinished volley aim-line then stayed
          // in gates forever and the fight deadlocked in phase 2.
          for (const g of gates) {
            if (g.type === 'bossvolleytelegraph' && !g.resolved && (frame - g.spawnFrame) >= g.warningFrames) {
              fireBossVolley(ship.y);
              g.resolved = true;
            }
          }
          for (const g of gates) {
            if (g.type === 'bosschargebeamtelegraph' && !g.resolved && (frame - g.spawnFrame) >= g.warningFrames) {
              fireBossChargeBeam(g.lockedY, g.thickness, g.isSuperBeam);
              g.resolved = true;
            }
          }

          if (bossWaitingForClear) {
            // a phase transition's time threshold has been reached,
            // but wait for every boss hazard to clear the screen
            // before starting the dramatic transformation -- nothing
            // new spawns during this wait (we're in this branch, not
            // the attack-spawning one below), and elapsed is frozen
            // since bossTimer isn't decrementing above
            let hazardsRemaining = gates.some(g => BOSS_HAZARD_TYPES.includes(g.type));
            if (hazardsRemaining && bossWaitingForClearStartFrame >= 0 && (frame - bossWaitingForClearStartFrame) > 480) {
              gates = gates.filter(g => !BOSS_HAZARD_TYPES.includes(g.type));
              hazardsRemaining = false;
            }
            if (!hazardsRemaining) {
              bossWaitingForClear = false;
              bossWaitingForClearStartFrame = -1;
              bossTransitioning = true;
              bossTransitionStartFrame = frame;
              bossTransitionTargetPhase = bossWaitingForClearTargetPhase;
              sfxSignalPhase();
            }
          } else if (phaseByTime === 5 && bossPhase === 4) {
            bossWaitingForClear = true;
            bossWaitingForClearStartFrame = frame;
            bossWaitingForClearTargetPhase = 5;
          } else if (phaseByTime === 3 && bossPhase === 2) {
            bossWaitingForClear = true;
            bossWaitingForClearStartFrame = frame;
            bossWaitingForClearTargetPhase = 3;
          } else if (phaseByTime > bossPhase) {
            bossPhase = phaseByTime; // 1->2 and 3->4: instant, no transformation sequence
          } else {
            // TEMPORARY: burst and volley disabled in phase 3 for
            // step-by-step testing -- phase 3 currently has only the
            // rage pulse active. re-enable once phase 3's full attack
            // set is being assembled.
            if (bossPhase < 3) {
              const burstInterval = 100;
              const volleyInterval = 130;

              bossAttackTimer++;
              if (bossAttackTimer >= burstInterval) {
                spawnBossBurst();
                bossAttackTimer = 0;
              }
              if (bossPhase >= 2) {
                bossVolleyTimer++;
                if (bossVolleyTimer >= volleyInterval) {
                  spawnBossVolleyTelegraph();
                  bossVolleyTimer = 0;
                }
              }
            }
            if (bossPhase === 3 || bossPhase === 4) {
              bossRagePulseTimer++;
              if (bossRagePulseTimer >= BOSS_RAGE_PULSE_INTERVAL) {
                spawnBossRagePulse();
                bossRagePulseTimer = 0;
              }
            }
            // Diagonal ring and double-wall code are left intact
            // above in case either is worth revisiting later; phase 4
            // now uses individual drones, one at a time.
            if (bossPhase === 3 || bossPhase === 4) {
              bossDroneFormationTimer++;
              if (bossDroneFormationTimer >= BOSS_DRONE_FORMATION_INTERVAL) {
                spawnBossDrone();
                bossDroneFormationTimer = 0;
              }
            }
            // phase 4's own addition: an occasional homing fragment
            if (bossPhase === 4) {
              bossHomingFragmentTimer++;
              if (bossHomingFragmentTimer >= BOSS_HOMING_FRAGMENT_INTERVAL) {
                spawnBossHomingFragment();
                bossHomingFragmentTimer = 0;
              }
            }
            // phase 5: charge beam laser -- gap between shots is
            // randomized (1.5-4s) and only starts counting once the
            // previous beam has fully cleared, so shots can never
            // overlap regardless of how short the roll is
            if (bossPhase === 5 && bossChargeBeamCount < 8) {
              const hasActiveBeamGate = gates.some(g => g.type === 'bosschargebeamtelegraph' || g.type === 'bosschargebeam');
              if (!hasActiveBeamGate) {
                bossChargeBeamTimer++;
                if (bossChargeBeamTimer >= bossChargeBeamNextGap) {
                  spawnBossChargeBeamTelegraph();
                  bossChargeBeamTimer = 0;
                  bossChargeBeamNextGap = BOSS_CHARGE_BEAM_MIN_GAP + Math.floor(Math.random() * (BOSS_CHARGE_BEAM_MAX_GAP - BOSS_CHARGE_BEAM_MIN_GAP + 1));
                }
              }
              // ember knockback -- runs on its own independent timer,
              // not tied to whether a beam is currently active. shut
              // off entirely once shot 8 (the super beam) begins
              bossEmberTimer++;
              if (bossEmberTimer >= BOSS_EMBER_INTERVAL) {
                spawnBossEmber();
                bossEmberTimer = 0;
              }
              // thick ash cloud -- same independent-timer pattern
              bossAshCloudTimer++;
              if (bossAshCloudTimer >= BOSS_ASH_CLOUD_INTERVAL) {
                spawnBossAshCloud();
                bossAshCloudTimer = 0;
              }
            }
            // the climactic finale: once shot 8 has fully cleared,
            // resume normal movement for a beat, then begin the final
            // charge that builds to the explosion ending
            if (bossPhase === 5 && bossChargeBeamCount >= 8 && !bossFinalChargeActive && !bossExplosionActive && !bossFullyDefeated) {
              const hasActiveBeamGate = gates.some(g => g.type === 'bosschargebeamtelegraph' || g.type === 'bosschargebeam');
              if (!hasActiveBeamGate) {
                bossChargeBeamTimer++;
                if (bossChargeBeamTimer >= BOSS_FINAL_CHARGE_DELAY) {
                  bossFinalChargeActive = true;
                  bossFinalChargeStartFrame = frame;
                  gates = gates.filter(g => g.type !== 'bossember' && g.type !== 'bossashcloud'); // clean screen for the boss death sequence
                  sfxSignalFinalCharge();
                }
              }
            }
            // fire the staggered second wall once its scheduled frame arrives
            if (bossDoubleWallPendingFrame >= 0 && frame >= bossDoubleWallPendingFrame) {
              gates.push({ type: 'bossragepulse', x: boss.x, y: boss.y + BOSS_DOUBLE_WALL_OFFSET, spawnFrame: frame, passed: false });
              bossDoubleWallPendingFrame = -1;
            }
            // final charge builds for BOSS_FINAL_CHARGE_DURATION, then detonates
            if (bossFinalChargeActive && (frame - bossFinalChargeStartFrame) >= BOSS_FINAL_CHARGE_DURATION) {
              bossFinalChargeActive = false;
              bossExplosionActive = true;
              bossExplosionStartFrame = frame;
              sfxSignalExplosion();
            }
          }

          if (bossTimer <= 0) {
            bossDefeated = true;
            bossDefeatFrame = frame;
          }
          if (bossExplosionActive && (frame - bossExplosionStartFrame) >= BOSS_EXPLOSION_DURATION) {
            bossExplosionActive = false;
            bossFullyDefeated = true;
            postBossDowntimeActive = true;
            postBossDowntimeStartFrame = frame;
            sfxSignalSilenced();
          }
          if (postBossDowntimeActive && (frame - postBossDowntimeStartFrame) >= POST_BOSS_DOWNTIME_DURATION) {
            postBossDowntimeActive = false;
            shipFlyOffActive = true;
            shipFlyOffStartFrame = frame;
            ship.vx = 0;
          }
          if (shipFlyOffActive && ship.x > W + 60) {
            shipFlyOffActive = false;
            triggerVictory();
          }
        }
      } else if (frame - bossDefeatFrame >= 90) {
        triggerVictory();
      }
    } else if (th.isMiniBossZone && miniBoss) {
      const entranceElapsed = frame - miniBossSpawnFrame;
      const entranceComplete = entranceElapsed >= MINI_BOSS_ENTRANCE_DURATION;
      if (!entranceComplete) {
        const entranceProgress = Math.min(1, entranceElapsed / MINI_BOSS_ENTRANCE_DURATION);
        const eased = 1 - Math.pow(1 - entranceProgress, 3); // ease-out cubic -- fast start, smooth settle
        miniBoss.r = miniBoss.maxR;
        miniBoss.x = (W + MINI_BOSS_OFFSCREEN_MARGIN) + (miniBoss.restX - (W + MINI_BOSS_OFFSCREEN_MARGIN)) * eased;
        miniBoss.y = miniBoss.baseY;
        if (entranceElapsed + 1 >= MINI_BOSS_ENTRANCE_DURATION) {
          miniBossFloatBlendStartX = miniBoss.x;
          miniBossFloatBlendStartY = miniBoss.y;
          miniBossFloatBlendStartFrame = frame;
          miniBossAttackState = th.miniBossVariant === 'core' ? 'coreFloating' : 'floating';
          miniBossAttackStateStartFrame = frame;
        }
      } else {
        if (!(th.miniBossVariant === 'snow' && (miniBossDefeated || miniBossAttackState === 'crumbling' || miniBossAttackState === 'snowDying'))) {
          miniBoss.r = miniBoss.maxR;
        }
        if (th.miniBossVariant === 'core') {
          updateReactorCoreBoss();
        } else if (th.miniBossVariant === 'snow' && !miniBossDefeated) {
          updateSnowBoss();
        } else if (!miniBossDefeated) {
          const stateElapsed = frame - miniBossAttackStateStartFrame;
          if (miniBossCyclesCompleted >= 1 && miniBossAttackState === 'floating') {
            miniBossDefeated = true;
            miniBossDefeatFrame = frame;
          } else {
            if (miniBossAttackState === 'floating') {
              const blendDuration = 30;
              const blendElapsed = frame - miniBossFloatBlendStartFrame;
              const targetX = miniBoss.restX;
              const targetY = miniBoss.baseY + MINI_BOSS_FLOAT_AMPLITUDE * Math.sin((frame - miniBossSpawnFrame) * (2 * Math.PI / MINI_BOSS_FLOAT_PERIOD));
              if (blendElapsed >= 0 && blendElapsed < blendDuration) {
                // ease smoothly from wherever the boss actually was (e.g. right
                // after the flame wall's close-charge position) instead of
                // snapping instantly to its resting spot
                const t = blendElapsed / blendDuration;
                const eased = 1 - Math.pow(1 - t, 3);
                miniBoss.x = miniBossFloatBlendStartX + (targetX - miniBossFloatBlendStartX) * eased;
                miniBoss.y = miniBossFloatBlendStartY + (targetY - miniBossFloatBlendStartY) * eased;
              } else {
                miniBoss.x = targetX;
                miniBoss.y = targetY;
              }
              // long float duration for the very first entrance AND
              // specifically before attack set 2 (matches the same pause
              // length as the opening beat); short duration otherwise
              const floatDuration = (miniBossNextAttackSet === 2 || !miniBossHadFirstFloat) ? MINI_BOSS_INITIAL_FLOAT : MINI_BOSS_PRE_ATTACK_FLOAT;
              if (stateElapsed >= floatDuration) {
                if (miniBossNextAttackSet === 2 || miniBossNextAttackSet === 4) {
                  miniBossAttackState = 'chargingClose';
                  sfxFireBossChargeDash({ close: true });
                  if (miniBossNextAttackSet === 4) {
                    miniBossFlameWallDriftDir = Math.random() < 0.5 ? 1 : -1;
                  }
                } else if (miniBossNextAttackSet === 5) {
                  miniBossAttackState = 'barrageTelegraph';
                  miniBossBarrageEmbers = [];
                  miniBossBarrageWavesLaunched = 0;
                  miniBossBarragePhaseStartFrame = frame;
                  sfxFireBossBarrageTelegraph();
                } else {
                  miniBossAttackState = 'exiting';
                  miniBossChargeRound = miniBossNextAttackSet === 3 ? 2 : 1;
                  sfxFireBossExit();
                }
                miniBossAttackStateStartFrame = frame;
                miniBossHadFirstFloat = true;
              }
            } else if (miniBossAttackState === 'exiting') {
              miniBoss.x += MINI_BOSS_CHARGE_SPEED;
              miniBoss.y = miniBoss.baseY;
              if (miniBoss.x > W + MINI_BOSS_OFFSCREEN_MARGIN) {
                miniBossAttackState = 'waitingOffscreen';
                miniBossAttackStateStartFrame = frame;
                miniBossChargeHeights = shuffleArray(MINI_BOSS_CHARGE_HEIGHT_FRACS);
                miniBossChargeIndex = 0;
              }
            } else if (miniBossAttackState === 'waitingOffscreen') {
              if (stateElapsed >= MINI_BOSS_OFFSCREEN_WAIT) {
                miniBossAttackState = 'charging';
                miniBossAttackStateStartFrame = frame;
                const enterFromRight = miniBossChargeIndex % 2 === 0;
                // left-entering spawn is matched to the SAME travel distance as a
                // right-entering charge (not just a mirrored margin) -- since the
                // ship sits close to the left edge, mirroring the margin would give
                // barely half the reaction time. this keeps reaction time equal
                // regardless of direction.
                const rightwardTravelDistance = (W + MINI_BOSS_OFFSCREEN_MARGIN) - ship.x;
                miniBoss.x = enterFromRight ? (W + MINI_BOSS_OFFSCREEN_MARGIN) : (ship.x - rightwardTravelDistance);
                miniBoss.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * miniBossChargeHeights[miniBossChargeIndex];
                sfxFireBossChargeDash();
              }
            } else if (miniBossAttackState === 'waitingBetweenCharges') {
              if (stateElapsed >= MINI_BOSS_OFFSCREEN_WAIT) {
                miniBossAttackState = 'charging';
                miniBossAttackStateStartFrame = frame;
                const enterFromRight = miniBossChargeIndex % 2 === 0;
                // left-entering spawn is matched to the SAME travel distance as a
                // right-entering charge (not just a mirrored margin) -- since the
                // ship sits close to the left edge, mirroring the margin would give
                // barely half the reaction time. this keeps reaction time equal
                // regardless of direction.
                const rightwardTravelDistance = (W + MINI_BOSS_OFFSCREEN_MARGIN) - ship.x;
                miniBoss.x = enterFromRight ? (W + MINI_BOSS_OFFSCREEN_MARGIN) : (ship.x - rightwardTravelDistance);
                miniBoss.y = PLAY_TOP + (PLAY_BOTTOM - PLAY_TOP) * miniBossChargeHeights[miniBossChargeIndex];
                sfxFireBossChargeDash();
              }
            } else if (miniBossAttackState === 'charging') {
              // alternates direction each charge: index 0 and 2 move right-to-left
              // (entering from the right), index 1 moves left-to-right (entering
              // from the left) -- so the sequence is R->L, L->R, R->L
              const movingLeft = miniBossChargeIndex % 2 === 0;
              const chargeSpeed = miniBossChargeRound === 2 ? MINI_BOSS_CHARGE_SPEED_ROUND2 : MINI_BOSS_CHARGE_SPEED;
              miniBoss.x += movingLeft ? -chargeSpeed : chargeSpeed;
              const dx = ship.x - miniBoss.x, dy = ship.y - miniBoss.y;
              if (Math.sqrt(dx * dx + dy * dy) < SHIP_W * 0.4 + miniBoss.r) {
                tryEndGame('charging');
              }
              const exitedOffscreen = movingLeft ? (miniBoss.x < -MINI_BOSS_OFFSCREEN_MARGIN) : (miniBoss.x > W + MINI_BOSS_OFFSCREEN_MARGIN);
              if (exitedOffscreen) {
                miniBossChargeIndex++;
                if (miniBossChargeIndex < 3) {
                  miniBossAttackState = 'waitingBetweenCharges';
                  miniBossAttackStateStartFrame = frame;
                } else {
                  // this charge round is complete -- the 3rd charge (index 2)
                  // always exits to the left under this alternation, so flying
                  // back in from the right is still correct here regardless
                  // of which round just finished
                  miniBossAttackState = 'returning';
                  miniBossAttackStateStartFrame = frame;
                  miniBoss.x = W + MINI_BOSS_OFFSCREEN_MARGIN;
                  sfxMiniBossReturn();
                  if (miniBossChargeRound === 1) {
                    miniBossNextAttackSet = 2; // leads into the flame wall
                  } else {
                    miniBossNextAttackSet = 4; // leads into phase 4 -- the moving flame wall variant
                  }
                }
              }
            } else if (miniBossAttackState === 'returning') {
              const progress = Math.min(1, stateElapsed / MINI_BOSS_ENTRANCE_DURATION);
              const eased = 1 - Math.pow(1 - progress, 3);
              miniBoss.x = (W + MINI_BOSS_OFFSCREEN_MARGIN) + (miniBoss.restX - (W + MINI_BOSS_OFFSCREEN_MARGIN)) * eased;
              miniBoss.y = miniBoss.baseY;
              if (stateElapsed + 1 >= MINI_BOSS_ENTRANCE_DURATION) {
                miniBossFloatBlendStartX = miniBoss.x;
                miniBossFloatBlendStartY = miniBoss.y;
                miniBossFloatBlendStartFrame = frame;
                miniBossAttackState = 'floating';
                miniBossAttackStateStartFrame = frame;
              }
            } else if (miniBossAttackState === 'chargingClose') {
              miniBoss.y = miniBoss.baseY;
              const stopX = ship.x + MINI_BOSS_CLOSE_CHARGE_STOP_OFFSET;
              miniBoss.x = Math.max(stopX, miniBoss.x - MINI_BOSS_CHARGE_SPEED);
              if (miniBoss.x <= stopX) {
                miniBossAttackState = 'flameWallTelegraph';
                miniBossAttackStateStartFrame = frame;
                sfxFireBossFlameWallTelegraph();
              }
            } else if (miniBossAttackState === 'flameWallTelegraph') {
              miniBoss.y = miniBoss.baseY;
              if (stateElapsed >= MINI_BOSS_FLAME_WALL_TELEGRAPH) {
                miniBossAttackState = 'flameWallActive';
                miniBossAttackStateStartFrame = frame;
                startMoltenFlameWallSound();
              }
            } else if (miniBossAttackState === 'flameWallActive') {
              // phase 4 variant: the boss (and therefore the safe window,
              // which already derives from miniBoss.y below) slowly drifts
              // vertically instead of staying fixed -- clamped so it never
              // drifts the window off-screen
              const isMovingVariant = miniBossNextAttackSet === 4;
              if (isMovingVariant) {
                const minY = miniBoss.baseY - MINI_BOSS_FLAME_WALL_DRIFT_RANGE;
                const maxY = miniBoss.baseY + MINI_BOSS_FLAME_WALL_DRIFT_RANGE;
                miniBoss.y = Math.max(minY, Math.min(maxY, miniBoss.y + miniBossFlameWallDriftDir * MINI_BOSS_FLAME_WALL_DRIFT_SPEED));
              } else {
                miniBoss.y = miniBoss.baseY;
              }
              // lethal from one boss-diameter left of the boss all the way
              // to the right edge of the screen -- but since the ship's x
              // never changes in this game, that alone can never actually
              // threaten it. the real hazard is vertical: the ship must
              // also stay within the safe window's height, matching the
              // visual exactly (same shared constant used by both)
              const safeBoundary = miniBoss.x - miniBoss.r * 2;
              const windowH = MINI_BOSS_FLAME_WALL_WINDOW_H;
              const windowTop = Math.max(PLAY_TOP, Math.min(PLAY_BOTTOM - windowH, miniBoss.y - windowH / 2));
              const windowBottom = windowTop + windowH;
              const outsideSafeWindow = ship.y < windowTop || ship.y > windowBottom;
              if (ship.x >= safeBoundary || outsideSafeWindow) {
                tryEndGame('flameWallActive');
              }
              if (stateElapsed >= MINI_BOSS_FLAME_WALL_ACTIVE) {
                miniBossFloatBlendStartX = miniBoss.x;
                miniBossFloatBlendStartY = miniBoss.y;
                miniBossFloatBlendStartFrame = frame;
                miniBossAttackState = 'floating';
                miniBossAttackStateStartFrame = frame;
                if (isMovingVariant) {
                  miniBossNextAttackSet = 5; // leads into phase 5 -- the ember barrage
                } else {
                  miniBossNextAttackSet = 3; // leads into the second (faster) round of charges
                }
              }
            } else if (miniBossAttackState === 'barrageTelegraph') {
              miniBoss.x = miniBoss.restX;
              miniBoss.y = miniBoss.baseY + MINI_BOSS_BARRAGE_SWAY_RANGE * Math.sin((frame - miniBossBarragePhaseStartFrame) * (2 * Math.PI / MINI_BOSS_BARRAGE_SWAY_PERIOD));
              if (stateElapsed >= MINI_BOSS_BARRAGE_TELEGRAPH) {
                miniBossAttackState = 'barrageActive';
                miniBossAttackStateStartFrame = frame;
                startMoltenSqueezeSound();
              }
            } else if (miniBossAttackState === 'barrageActive') {
              // boss stays at its resting x for this entire attack -- only
              // the flame wall phases approach the ship -- but sways
              // vertically, so the player must track its current height to
              // know where each new wave's safe lane will be
              miniBoss.x = miniBoss.restX;
              miniBoss.y = miniBoss.baseY + MINI_BOSS_BARRAGE_SWAY_RANGE * Math.sin((frame - miniBossBarragePhaseStartFrame) * (2 * Math.PI / MINI_BOSS_BARRAGE_SWAY_PERIOD));

              // squeeze walls: an independent top/bottom pressure that
              // breathes in and out on its own schedule, unrelated to the
              // ember lanes -- surviving means finding a height clear of
              // both threats at once
              const squeezeGap = MINI_BOSS_SQUEEZE_MIN_GAP + (MINI_BOSS_SQUEEZE_MAX_GAP - MINI_BOSS_SQUEEZE_MIN_GAP) * (0.5 + 0.5 * Math.cos(stateElapsed * (2 * Math.PI / MINI_BOSS_SQUEEZE_PERIOD)));
              const squeezeCenter = (PLAY_TOP + PLAY_BOTTOM) / 2;
              miniBossSqueezeTopY = squeezeCenter - squeezeGap / 2;
              miniBossSqueezeBottomY = squeezeCenter + squeezeGap / 2;
              if (ship.y - SHIP_H / 2 <= miniBossSqueezeTopY || ship.y + SHIP_H / 2 >= miniBossSqueezeBottomY) {
                tryEndGame('barrageActive');
              }

              // launch a new wave when its scheduled time arrives -- 2 of 3
              // lanes (centered on the boss's CURRENT y) get an ember, the
              // third is always left clear
              const nextWaveDue = miniBossBarrageWavesLaunched * MINI_BOSS_BARRAGE_WAVE_INTERVAL;
              if (miniBossBarrageWavesLaunched < MINI_BOSS_BARRAGE_WAVE_COUNT && stateElapsed >= nextWaveDue) {
                const laneOffsets = [-MINI_BOSS_BARRAGE_LANE_SPACING, 0, MINI_BOSS_BARRAGE_LANE_SPACING];
                const safeLane = Math.floor(Math.random() * 3);
                for (let lane = 0; lane < 3; lane++) {
                  if (lane === safeLane) continue;
                  miniBossBarrageEmbers.push({
                    x: miniBoss.x,
                    y: miniBoss.y + laneOffsets[lane],
                    vx: -MINI_BOSS_BARRAGE_EMBER_SPEED
                  });
                }
                miniBossBarrageWavesLaunched++;
                sfxFireBossEmberLaunch();
              }

              // advance embers, check collision, and drop any that have
              // travelled well past the ship. Captures a local reference
              // since tryEndGame() can reentrantly trigger a respawn that
              // reassigns the global embers array (reseedZoneObstacles()
              // runs on every death) -- without this, the loop would end
              // up indexing into a brand new array mid-iteration
              const activeEmbers = miniBossBarrageEmbers;
              for (let i = activeEmbers.length - 1; i >= 0; i--) {
                const e = activeEmbers[i];
                e.x += e.vx;
                const dx = ship.x - e.x, dy = ship.y - e.y;
                if (Math.sqrt(dx * dx + dy * dy) < SHIP_W * 0.4 + MINI_BOSS_BARRAGE_EMBER_R) {
                  tryEndGame('coreFlame');
                  break; // ship has died (or ghost mode absorbed it) -- stop, a reentrant respawn may have already reset boss state
                }
                if (e.x < -100) {
                  activeEmbers.splice(i, 1);
                }
              }

              if (stateElapsed >= MINI_BOSS_BARRAGE_ACTIVE) {
                miniBossBarrageEmbers = [];
                miniBossAttackState = 'dying';
                miniBossAttackStateStartFrame = frame;
                miniBossDeathAshParticles = [];
                miniBossDeathPatches = [];
                sfxFireBossDeath();
                for (let i = 0; i < MINI_BOSS_DEATH_PATCH_COUNT; i++) {
                  miniBossDeathPatches.push({
                    angle: Math.random() * Math.PI * 2,
                    distFrac: 0.15 + Math.random() * 0.55,
                    sizeFrac: 0.35 + Math.random() * 0.35,
                    startFrac: (i / MINI_BOSS_DEATH_PATCH_COUNT) * 0.5 + Math.random() * 0.15
                  });
                }
              }
            } else if (miniBossAttackState === 'dying') {
              const dimEnd = MINI_BOSS_DEATH_DIM_DURATION;
              const ashEnd = dimEnd + MINI_BOSS_DEATH_ASH_DURATION;
              const disperseEnd = ashEnd + MINI_BOSS_DEATH_DISPERSE_DURATION;
              const ashProgress = Math.max(0, Math.min(1, (stateElapsed - dimEnd) / MINI_BOSS_DEATH_ASH_DURATION));
              const disperseProgress = Math.max(0, Math.min(1, (stateElapsed - ashEnd) / MINI_BOSS_DEATH_DISPERSE_DURATION));

              // slow trickle of ash flakes during the ashing-over stage,
              // ramping up into a heavier scatter during dispersal
              if (stateElapsed >= dimEnd && stateElapsed < ashEnd && stateElapsed % 8 === 0) {
                spawnMiniBossDeathAshParticle();
              } else if (stateElapsed >= ashEnd && stateElapsed < disperseEnd) {
                spawnMiniBossDeathAshParticle();
                if (frame % 2 === 0) spawnMiniBossDeathAshParticle();
              }
              if (stateElapsed === dimEnd) sfxFireBossAsh();
              if (stateElapsed === ashEnd) {
                stopMoltenDeathAshSound();
                sfxFireBossDisperse();
              }

              // advance existing particles regardless of sub-stage, so
              // ones spawned late in dispersal keep drifting/fading
              // through the defeat pause that follows
              for (let i = miniBossDeathAshParticles.length - 1; i >= 0; i--) {
                const p = miniBossDeathAshParticles[i];
                p.x += p.vx;
                p.y += p.vy + Math.sin(p.flutterPhase + frame * p.flutterSpeed) * 0.3;
                p.rotation += p.rotSpeed;
                p.life++;
                if (p.life >= p.maxLife) miniBossDeathAshParticles.splice(i, 1);
              }

              if (stateElapsed >= disperseEnd) {
                miniBossDefeated = true;
                miniBossDefeatFrame = frame;
              }
            }
          }
        } else if (th.miniBossVariant === 'snow') {
          // death scene is over -- the ship drives off. The ice wall
          // slides away with it. No terrain run, no escape distance.
          snowBossStepAsh();
          if (!shipFlyOffActive && frame - miniBossDefeatFrame >= 28) {
            shipFlyOffActive = true;
            ship.vx = 0;
            if (miniBossWallRecedeStartFrame === -1) miniBossWallRecedeStartFrame = frame;
          }
          if (shipFlyOffActive && ship.x > W + 60) {
            shipFlyOffActive = false;
            miniBoss = null;
            ship.x = W * 0.28;
            ship.vx = 0;
            beginWarp();
          }
        } else if (miniBossWallRecedeStartFrame === -1 && frame - miniBossDefeatFrame >= MINI_BOSS_DEFEAT_PAUSE) {
          // the fight is over -- turn the zone into a real terrain run for
          // a short stretch, matching INFERNO's feel (same speed, wave
          // shape, and pattern DNA) but with the fork/branch sections
          // stripped out, before the normal zone-end goal. Set up right
          // away rather than waiting -- miniBoss stays alive so the arena
          // wall keeps drawing normally, and its own dark backdrop (drawn
          // after the terrain) hides the new terrain until the wall recedes
          th.obstacleShape = 'terrain';
          th.scrollMult = 1.5;
          th.ampMult = 1.2;
          th.freqMult = 1.3;
          th.pulseGap = false;
          th.gapFractionStart = 0.38;
          th.gapConstant = true;
          th.terrainSpacing = 34;
          th.terrainMaxDelta = 55;
          th.pattern = MINI_BOSS_ESCAPE_RUN_PATTERN;
          initTerrain();
          miniBossEscapeRunActive = true;
          miniBossEscapeRunStartDistance = distance;
          miniBossWallRecedeStartFrame = frame;
        } else if (miniBossWallRecedeStartFrame !== -1) {
          if (frame - miniBossWallRecedeStartFrame >= MINI_BOSS_WALL_RECEDE_DURATION) {
            miniBoss = null;
            miniBossWallRecedeStartFrame = -1;
          }
        }
      }
    }

    // portal ring: a visual marker that appears as the player approaches the
    // zone-end threshold, positioned so it lines up exactly with the moment
    // the warp triggers (both track the same effScroll each frame, so they
    // stay in sync without needing separate collision logic)
    if (!warpActive && (miniBossEscapeRunActive || (!th.isBossZone && !th.isMiniBossZone))) {
      const remaining = zoneEndRemainingDistance();
      const remainingPx = remaining * 10;
      const appearPx = Math.max(PORTAL_LEAD_DISTANCE * 10, (W - ship.x) + 80);
      if (!portalObject && remaining > 0 && remainingPx <= appearPx) {
        portalObject = { x: ship.x + remainingPx, forLevel: themeLevelReached };
        // nothing should exist beyond the portal -- clear out anything that
        // was already pre-spawned further out than where the portal now sits.
        // the portal ring itself is rendered with a halfWidth (oscillating
        // ~30-38px) extending backward from its center, so the safe boundary
        // is that far before portalObject.x, not the center point itself --
        // otherwise an object can pass this check while still visually
        // poking into the rendered ring. every type's own forward extent
        // (radius/half-width) must clear that boundary, not just its
        // center point -- otherwise a wide object centered just before it
        // can still have its edge poking past it. types with a rendered
        // tail get extra margin on top of that, since they scroll at the
        // same rate as the portal and any overlap at this exact moment
        // would persist for as long as both exist
        const portalSafeX = portalObject.x - 40;
        gates = gates.filter(g => gateClearsPortal(g, portalSafeX));
        if (terrainSegments.length) {
          terrainSegments = terrainSegments.filter(s => s.x < portalObject.x);
          if (terrainSegments.length < 2) {
            // keep at least the trailing edge so interpolation has something to work with
            terrainSegments.push({ x: portalObject.x, topY: terrainSegments[0] ? terrainSegments[0].topY : PLAY_TOP + 20, bottomY: terrainSegments[0] ? terrainSegments[0].bottomY : PLAY_BOTTOM - 20, islandTop: 0, islandBottom: 0 });
          }
        }
      }
      if (portalObject) {
        portalObject.x -= effScroll;
      }
    }

    if (warpActive) {
      warpTimer--;
      if (warpTimer <= 0) {
        finishWarp();
      }
    } else if (th.obstacleShape === 'terrain') {
      for (let s of terrainSegments) s.x -= effScroll;
      const spacing = th.terrainSpacing || 34;
      while (terrainSegments[terrainSegments.length - 1].x < (th.iceChunks ? W + 760 : W + spacing)) {
        addTerrainSegment();
      }
      terrainSegments = terrainSegments.filter(s => s.x > -spacing * 2);

      const shipTop = ship.y - SHIP_H / 2;
      const shipBottom = ship.y + SHIP_H / 2;

      if (shipTop <= PLAY_TOP || shipBottom >= PLAY_BOTTOM) {
        if (ghostMode) clampGhostShipToPlayfield();
        else endGame();
      }

      if (state === 'playing') {
      const bounds = terrainBoundsAt(ship.x);
      if (bounds) {
        if (shipTop <= bounds.top || shipBottom >= bounds.bottom) {
          tryEndGame('terrain');
        }
        // fork/island: a solid obstruction in the middle splitting the path in two
        if (bounds.islandBottom > bounds.islandTop) {
          if (shipBottom > bounds.islandTop && shipTop < bounds.islandBottom) {
            tryEndGame('terrain');
          }
        }
      }
      if (th.iceChunks) {
        const shipR = SHIP_W * 0.4;
        const shipLeft = ship.x - SHIP_W / 2;
        const shipRight = ship.x + SHIP_W / 2;
        for (const g of gates) {
          if (g.type === 'asteroid' || g.type === 'snowball') {
            const dx = ship.x - g.x;
            const dy = ship.y - g.y;
            if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) tryEndGame(g.type === 'snowball' ? 'snowball' : 'asteroid');
          } else if (g.type === 'icespire') {
            if (rectIntersectsPolygon(shipLeft, shipTop, shipRight, shipBottom, iceSpirePolygon(g))) tryEndGame(g.type);
          } else if (g.type === 'icefloe' || g.type === 'icecalve') {
            const left = g.x - g.width / 2;
            const right = g.x + g.width / 2;
            const halfH = g.thickness / 2;
            const top = g.y - halfH;
            const bottom = g.y + halfH;
            if (shipRight > left && shipLeft < right && shipBottom > top && shipTop < bottom) tryEndGame(g.type);
          } else if (g.type === 'icearch') {
            const left = g.x - g.width / 2;
            const right = g.x + g.width / 2;
            const top = g.y - g.height / 2;
            const bottom = g.y + g.height / 2;
            const holeLeft = g.x - g.holeW / 2;
            const holeRight = g.x + g.holeW / 2;
            const capY = g.anchor === 'top' ? g.holeY + g.holeH / 2 : g.holeY - g.holeH / 2;
            const hit = (l, r, t, b) => shipRight > l && shipLeft < r && shipBottom > t && shipTop < b;
            const legs = hit(left - 16, holeLeft, top, bottom) || hit(holeRight, right + 16, top, bottom);
            const crown = g.anchor === 'top'
              ? hit(holeLeft, holeRight, capY, bottom)
              : hit(holeLeft, holeRight, top, capY);
            if (legs || crown) tryEndGame('icearch');
          }
        }
      }
      }
      if (th.iceChunks) {
        const freshCalves = [];
        for (const g of gates) {
          if (g.type === 'asteroid' || g.type === 'icefloe' || g.type === 'icespire' || g.type === 'snowgust' || g.type === 'icearch' || g.type === 'icecalve' || g.type === 'snowball') g.x -= effScroll;
          if (g.type === 'asteroid' && g.vy) {
            g.y += g.vy;
            g.y = Math.max(PLAY_TOP + g.r + 4, Math.min(PLAY_BOTTOM - g.r - 4, g.y));
          }
          if (g.type === 'snowball') {
            g.x -= g.drift || 0;
            if (!g.falling) {
              const hSpeed = effScroll + (g.drift || 0);
              const dist = g.x - ship.x;
              const drop = Math.max(0, g.laneY - g.y);
              const lead = g.vy > 0 ? drop * hSpeed / g.vy : 0;
              if (dist <= lead) g.falling = true;
            }
            if (g.falling) g.y += g.vy;
          }
          if (g.type === 'icecalve') {
            g.vy = Math.min(6.2, (g.vy || 0) + 0.16);
            g.y += g.vy;
          }
          if (g.type === 'asteroid' && g.calving && !g.calved && g.x < ship.x + 460 && g.x > ship.x - 20) {
            g.calved = true;
            freshCalves.push({
              type: 'icecalve',
              x: g.x,
              y: g.y + g.r + 18,
              width: 74,
              thickness: 32,
              vy: 0.6,
              passed: false
            });
          }
        }
        for (const c of freshCalves) gates.push(c);
        if (portalObject) {
          const portalSafeX = portalObject.x - 40;
          gates = gates.filter(g => {
            if (g.type === 'asteroid' || g.type === 'snowball') return g.x + g.r < portalSafeX;
            if (g.type === 'icefloe' || g.type === 'icespire' || g.type === 'icearch' || g.type === 'snowgust' || g.type === 'icecalve') return g.x + g.width / 2 < portalSafeX;
            return true;
          });
        }
        gates = gates.filter(g => {
          if (g.type === 'asteroid') return g.x + g.r > -80;
          if (g.type === 'snowball') return g.x + g.r > -80 && g.y - g.r < PLAY_BOTTOM + 30;
          if (g.type === 'icefloe' || g.type === 'icespire' || g.type === 'icearch' || g.type === 'snowgust') return g.x + g.width / 2 > -80;
          if (g.type === 'icecalve') return g.x + g.width / 2 > -80 && g.y < PLAY_BOTTOM + 48;
          return true;
        });
        iceChunkSpawnX -= effScroll;
        if (th.iceChunks) spawnScheduledSnowballs();
        // Stay past the right edge, and past the distance-50 line on a narrow window.
        const glacierClearX = ship.x + Math.max(0, 50 - (distance - zoneStartDistance)) * 10 + 170;
        const glacierMinX = Math.max(glacierClearX, W + 180);
        if (iceChunkSpawnX < glacierMinX) iceChunkSpawnX = glacierMinX;
        const horizon = terrainSegments[terrainSegments.length - 1].x - 8;
        if (!portalObject && iceChunkSpawnX <= horizon) {
          const bounds = terrainBoundsAt(iceChunkSpawnX) || terrainBoundsAt(horizon);
          const gap = bounds ? bounds.bottom - bounds.top : 0;
          const playHeight = PLAY_BOTTOM - PLAY_TOP;
          let field = '';
          for (let i = terrainSegments.length - 1; i >= 0; i--) {
            if (terrainSegments[i].x <= iceChunkSpawnX + 8) {
              field = terrainSegments[i].field || '';
              break;
            }
          }
          let spacingAdd = 220;
          const blocked = spawnWouldHitPortal(iceChunkSpawnX, 80);
          if (field === 'floe' && gap > playHeight * 0.9) {
            spacingAdd = blocked ? th.iceFloePattern[iceFloePatternIndex % th.iceFloePattern.length].spacing : spawnIceFloeCluster(iceChunkSpawnX);
          } else if (field === 'berg' && bounds && bounds.top < PLAY_TOP + 40) {
            // One pass. A repeat puts the first snowball on top of the last gust.
            if (iceBergPatternIndex >= th.iceBergPattern.length) spacingAdd = 480;
            else spacingAdd = blocked ? th.iceBergPattern[iceBergPatternIndex].spacing : spawnIceBergCluster(iceChunkSpawnX);
          } else if (!field && gap > 0 && gap < playHeight * 0.55) {
            const entry = th.iceChunkPattern[iceChunkPatternIndex % th.iceChunkPattern.length];
            if (!blocked) spawnIceChunkCluster(iceChunkSpawnX);
            spacingAdd = entry.spacing;
          }
          iceChunkSpawnX += spacingAdd;
        }
      }
    } else {
      for (let g of gates) {
        if (g.type === 'shootingstar' && g.oncoming) continue;
        if (g.type === 'turretshot') continue; // moved separately below via vx/vy
        if (g.type === 'boomerang') continue; // position is computed live from elapsed time, not scrolled
        if (g.type === 'bossattack') continue; // moved separately below via vx/vy
        if (g.type === 'bossragepulse') continue; // stationary at its spawn position, only its radius grows
        if (g.type === 'bossdiagonalring') continue; // stationary at its spawn position, only its radius grows
        if (g.type === 'bossdrone') continue; // moved separately below via vx
        if (g.type === 'bossember') continue; // moved separately below via vx/vy
        if (g.type === 'bossashcloud') continue; // moved separately below via vx
        g.x -= (g.type === 'fireball' ? effScroll * fireballSpeedMult : (g.type === 'zone2storm' ? effScroll * 1.4 : (g.type === 'securitydrone' || g.type === 'headlamp' ? effScroll * g.speedMult : effScroll)));
        if (g.type === 'cloudarc') g.x2 -= effScroll; // second endpoint isn't covered by the g.x update above
        // A school scrolls with the trench until it enters, then dashes across.
        if (g.type === 'school' && g.x < W + 40) g.x -= g.swim;
        if (g.type === 'headlamp') updateHeadlamp(g);
      }
      for (const g of gates) {
        if (g.type === 'turretshot') { g.x += g.vx; g.y += g.vy; }
        if (g.type === 'shootingstar' && g.oncoming) { g.x += g.vx; }
        if (g.type === 'bossattack') { g.x += g.vx; g.y += g.vy; }
        if (g.type === 'bossember') { g.x += g.vx; g.y += g.vy; }
        if (g.type === 'bossashcloud') { g.x += g.vx; }
        if (g.type === 'bossdrone') {
          g.x += g.vx;
          if (g.homing) {
            const clampedTargetY = Math.max(g.spawnY - BOSS_HOMING_MAX_DRIFT, Math.min(g.spawnY + BOSS_HOMING_MAX_DRIFT, ship.y));
            const dy = clampedTargetY - g.y;
            g.vy = Math.max(-BOSS_HOMING_MAX_VY, Math.min(BOSS_HOMING_MAX_VY, dy * BOSS_HOMING_TURN_RATE));
            g.y += g.vy;
          }
        }
        if (g.type === 'asteroid' && g.vy) {
          g.y += g.vy;
          g.y = Math.max(PLAY_TOP + g.r + 4, Math.min(PLAY_BOTTOM - g.r - 4, g.y));
        }
        if (g.type === 'splitrock' && !g.cracking && (g.x - ship.x) <= g.splitAtPx) {
          g.cracking = true;
          g.crackFrame = frame;
        }
      }
      const splitParents = [];
      for (const g of gates) {
        if (g.type === 'splitrock' && g.cracking && (frame - g.crackFrame) >= g.telegraphFrames) splitParents.push(g);
      }
      if (splitParents.length) {
        for (const g of splitParents) splitRockIntoShards(g);
        gates = gates.filter(g => !splitParents.includes(g));
      }
      // faster hazards (Gravity Well tornados at 1.4x scroll) can catch the
      // portal from the right after it appears -- keep culling so nothing
      // pops into the ring and then gets deleted a beat later
      if (portalObject) {
        const portalSafeX = portalObject.x - 40;
        gates = gates.filter(g => gateClearsPortal(g, portalSafeX));
      }

      if (th.obstacleShape === 'fireball') {
        if (!portalObject) {
          fireballSpawnCounter++;
          const nextInterval = th.pattern[patternIndex % th.pattern.length].interval;
          if (fireballSpawnCounter >= nextInterval) {
            spawnFireball();
            fireballSpawnCounter = 0;
          }
        }
      } else if (th.obstacleShape !== 'none') {
        lastSpawnX -= effScroll;
        const courseDone = (th.obstacleShape === 'kelp' || th.obstacleShape === 'copper' || th.obstacleShape === 'chrome') && patternIndex >= th.pattern.length;
        if (!portalObject && !courseDone && (gates.length === 0 || lastSpawnX < W + 150)) {
          const nextSpacing = th.pattern[patternIndex % th.pattern.length].spacing;
          const nextX = (gates.length ? lastSpawnX : W + 150) + nextSpacing;
          if (!spawnWouldHitPortal(nextX, 180)) {
            spawnGate(nextX);
            lastSpawnX = nextX;
          }
        }
      }

      // secondary obstacle layer (e.g. Zone 6's incoming flame projectiles) --
      // an independent timer running alongside the primary obstacle system,
      // not replacing it
      if (th.extraFireballPattern && !portalObject) {
        extraFireballCounter++;
        const nextInterval = th.extraFireballPattern[extraFireballPatternIndex % th.extraFireballPattern.length].interval;
        if (extraFireballCounter >= nextInterval) {
          spawnExtraFireball();
          extraFireballCounter = 0;
        }
      }
      if (th.extraToxicPoolPattern && !portalObject) {
        extraToxicCounter++;
        const nextInterval = th.extraToxicPoolPattern[extraToxicPatternIndex % th.extraToxicPoolPattern.length].interval;
        if (extraToxicCounter >= nextInterval) {
          spawnExtraToxicPool();
          extraToxicCounter = 0;
        }
      }
      if (th.extraGeyserPattern && !portalObject) {
        extraGeyserCounter++;
        const nextInterval = th.extraGeyserPattern[extraGeyserPatternIndex % th.extraGeyserPattern.length].interval;
        if (extraGeyserCounter >= nextInterval) {
          spawnExtraGeyser();
          extraGeyserCounter = 0;
        }
      }
      if (th.extraShootingStarPattern && !portalObject) {
        extraStarCounter++;
        const nextInterval = th.extraShootingStarPattern[extraStarPatternIndex % th.extraShootingStarPattern.length].interval;
        if (extraStarCounter >= nextInterval) {
          spawnExtraShootingStar();
          extraStarCounter = 0;
        }
      }
      if (th.movingDoorPattern && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        const nearSpecialDoor = !!(th.specialDoorEvents || []).some((event) => (
          zoneProgress >= event.triggerDistance - event.keyLeadDistance - 50 &&
          zoneProgress <= event.triggerDistance + 70
        ));
        const movingDoorSpawnX = W + 60;
        const keyOrGateBlocksMovingDoor = gates.some((g) => {
          if (g.type === 'accesskey' && !g.collected && Math.abs(g.x - movingDoorSpawnX) < 340) return true;
          if (g.type === 'specialdoor' && Math.abs(g.x - movingDoorSpawnX) < 300) return true;
          return false;
        });
        if (!nearSpecialDoor && !keyOrGateBlocksMovingDoor) {
          extraMovingDoorCounter++;
          const nextInterval = th.movingDoorPattern[extraMovingDoorPatternIndex % th.movingDoorPattern.length].interval;
          if (extraMovingDoorCounter >= nextInterval) {
            spawnExtraMovingDoor();
            extraMovingDoorCounter = 0;
          }
        }
      }
      if (th.blackHoleEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.blackHoleEvents.forEach((event, i) => {
          if (!blackHoleEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnBlackHoleEvent(i);
            blackHoleEventsSpawned[i] = true;
          }
        });
      }
      if (th.windVortexEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.windVortexEvents.forEach((event, i) => {
          if (!windVortexEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnWindVortexEvent(i);
            windVortexEventsSpawned[i] = true;
          }
        });
      }
      if (th.cloudArcEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.cloudArcEvents.forEach((event, i) => {
          if (!cloudArcEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnCloudArcEvent(i);
            cloudArcEventsSpawned[i] = true;
          }
        });
      }
      if (th.lightningStrikeEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.lightningStrikeEvents.forEach((event, i) => {
          if (!lightningStrikeEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnStormChargeBoltEvent(i);
            lightningStrikeEventsSpawned[i] = true;
          }
        });
      }
      for (const g of gates) {
        if (g.type === 'stormchargebolttelegraph' && !g.resolved && (frame - g.spawnFrame) >= g.warningFrames) {
          fireStormChargeBolt(g);
          g.resolved = true;
        }
      }
      if (th.lasergridEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.lasergridEvents.forEach((event, i) => {
          if (!lasergridEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnLaserGridEvent(i);
            lasergridEventsSpawned[i] = true;
          }
        });
      }
      if (th.droneSwarmEvents) {
        const zoneProgress = distance - zoneStartDistance;
        th.droneSwarmEvents.forEach((event, i) => {
          if (!droneSwarmEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnDroneSwarmEvent(i);
            droneSwarmEventsSpawned[i] = true;
          }
        });
      }
      if (th.billboardEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.billboardEvents.forEach((event, i) => {
          if (!billboardEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnBillboardEvent(i);
            billboardEventsSpawned[i] = true;
          }
        });
      }
      if (th.searchlightEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.searchlightEvents.forEach((event, i) => {
          if (!searchlightEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnSearchlightEvent(i);
            searchlightEventsSpawned[i] = true;
          }
        });
      }
      if (th.turretEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.turretEvents.forEach((event, i) => {
          if (!turretEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnTurretEvent(i);
            turretEventsSpawned[i] = true;
          }
        });
      }
      if (th.signalCorruptionEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.signalCorruptionEvents.forEach((event, i) => {
          if (!signalCorruptionEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnSignalCorruptionEvent(i);
            signalCorruptionEventsSpawned[i] = true;
          }
        });
      }
      if (th.empEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.empEvents.forEach((event, i) => {
          if (!empEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnEmpEvent(i);
            empEventsSpawned[i] = true;
          }
        });
      }
      if (th.pulsingOrbEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.pulsingOrbEvents.forEach((event, i) => {
          if (!pulsingOrbEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnPulsingOrbEvent(i);
            pulsingOrbEventsSpawned[i] = true;
          }
        });
      }
      if (th.boomerangEvents) {
        const zoneProgress = distance - zoneStartDistance;
        th.boomerangEvents.forEach((event, i) => {
          if (!boomerangEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnBoomerangEvent(i);
            boomerangEventsSpawned[i] = true;
          }
        });
      }
      if (th.oncomingCometEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.oncomingCometEvents.forEach((event, i) => {
          if (!oncomingCometEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnOncomingCometEvent(i);
            oncomingCometEventsSpawned[i] = true;
          }
        });
      }
      if (th.splitRockEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.splitRockEvents.forEach((event, i) => {
          if (!splitRockEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnSplitRockEvent(i);
            splitRockEventsSpawned[i] = true;
          }
        });
      }
      if (th.echoTrailEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.echoTrailEvents.forEach((event, i) => {
          if (!echoTrailEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnEchoTrailEvent(i);
            echoTrailEventsSpawned[i] = true;
          }
        });
      }
      if (th.extraStormPattern && !portalObject) {
        extraStormCounter++;
        const nextStorm = th.extraStormPattern[extraStormPatternIndex % th.extraStormPattern.length];
        const nextInterval = nextStorm.interval;
        if (extraStormCounter >= nextInterval) {
          if (spawnWouldHitPortal(W + nextStorm.r + 40, nextStorm.r)) {
            extraStormCounter = nextInterval;
          } else {
            spawnZone2Storm();
            extraStormCounter = 0;
          }
        }
      }
      if (th.extraOrbiterPattern && !portalObject) {
        extraOrbiterCounter++;
        const nextInterval = th.extraOrbiterPattern[extraOrbiterPatternIndex % th.extraOrbiterPattern.length].interval;
        if (extraOrbiterCounter >= nextInterval) {
          spawnExtraOrbiter();
          extraOrbiterCounter = 0;
        }
      }
      if (th.extraArcPlanetPattern && !portalObject) {
        extraArcPlanetCounter++;
        const nextInterval = th.extraArcPlanetPattern[extraArcPlanetPatternIndex % th.extraArcPlanetPattern.length].interval;
        if (extraArcPlanetCounter >= nextInterval) {
          spawnExtraArcPlanet();
          extraArcPlanetCounter = 0;
        }
      }
      if (th.lensingZoneEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.lensingZoneEvents.forEach((event, i) => {
          if (!lensingZoneEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnLensingZoneEvent(i);
            lensingZoneEventsSpawned[i] = true;
          }
        });
      }
      if (th.supernovaEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.supernovaEvents.forEach((event, i) => {
          if (!supernovaEventsSpawned[i] && zoneProgress >= event.triggerDistance) {
            spawnSupernovaEvent(i);
            supernovaEventsSpawned[i] = true;
          }
        });
      }
      // check existing supernova planets for the moment their warning
      // period completes -- detonates once, scattering into debris
      for (const g of gates) {
        if (g.type === 'supernova' && !g.detonated) {
          if (g.variant === 'onscreen' && g.onscreenFrame === null && g.x <= W) {
            g.onscreenFrame = frame;
          }
          const t = supernovaPhaseElapsed(g);
          if (t >= 0 && t >= supernovaEffectiveDormant(g) + g.warningFrames) {
            g.detonated = true;
            g.detonationFrame = frame;
            spawnSupernovaDebris(g);
          }
        }
      }
      // check existing turrets for the moment each successive shot is
      // due, firing a fast projectile from the turret's current position
      for (const g of gates) {
        if (g.type === 'turret' && g.shotsFired < g.numShots) {
          const elapsed = frame - g.spawnFrame;
          const nextShotTime = g.shotsFired * g.fireInterval;
          if (elapsed >= nextShotTime) {
            const angleRad = g.fireAngleDeg * Math.PI / 180;
            gates.push({
              type: 'turretshot',
              x: g.x,
              y: g.y,
              r: g.projectileR,
              vx: -g.projectileSpeed * Math.cos(angleRad),
              vy: g.projectileSpeed * Math.sin(angleRad),
              passed: false
            });
            g.shotsFired++;
            sfxHazardFire('turretshot');
          }
        }
      }
      if (th.specialDoorEvents && !portalObject) {
        const zoneProgress = distance - zoneStartDistance;
        th.specialDoorEvents.forEach((event, i) => {
          if (!specialEventsSpawned[i] && zoneProgress >= event.triggerDistance - event.keyLeadDistance) {
            spawnKeyAndDoor(i);
            specialEventsSpawned[i] = true;
          }
        });
      }
      if (th.extraSparkHubPattern && !portalObject) {
        extraHubCounter++;
        const nextInterval = th.extraSparkHubPattern[extraHubPatternIndex % th.extraSparkHubPattern.length].interval;
        if (extraHubCounter >= nextInterval) {
          spawnExtraSparkHub();
          extraHubCounter = 0;
        }
      }
      // check existing hubs for the moment charging completes -- fires a
      // one-time burst of 8 projectiles, then waits for the next cycle
      for (const g of gates) {
        if (g.type === 'sparkhub') {
          if (sparkHubIsCharging(g)) {
            g.hasFiredThisCycle = false;
          } else if (!g.hasFiredThisCycle) {
            fireSparkBurst(g);
            g.hasFiredThisCycle = true;
          }
        }
      }

      gates = gates.filter(g => {
        if (g.type === 'splitrock' || g.type === 'asteroid' || g.type === 'fireball' || g.type === 'pendulum' || g.type === 'wreckage') return g.x + g.r > -80;
        if (g.type === 'zone2storm') return g.x + g.r > -80;
        if (g.type === 'securitydrone') return g.x + g.r > -80;
        if (g.type === 'turretshot') return g.x + g.r > -80;
        if (g.type === 'bossattack') return g.x + g.r > -80 && g.y + g.r > -80 && g.y - g.r < H + 80;
        if (g.type === 'bossember') return !g.hit && g.x + g.r > -80 && g.y + g.r > -80 && g.y - g.r < H + 80;
        if (g.type === 'bossashcloud') return g.x + g.r > -80;
        if (g.type === 'bossragepulse') return liveRagePulseRadius(g) < BOSS_RAGE_PULSE_MAX_R;
        if (g.type === 'bossdiagonalring') return liveDiagonalRingRadius(g) < BOSS_DIAGONAL_RING_MAX_R;
        if (g.type === 'bossdrone') return g.x + g.r > -80;
        if (g.type === 'bossvolleytelegraph') return !g.resolved;
        if (g.type === 'bosschargebeamtelegraph') return !g.resolved;
        if (g.type === 'bosschargebeam') return (frame - g.spawnFrame) < (g.fireDuration || BOSS_CHARGE_BEAM_FIRE_DURATION);
        if (g.type === 'turret') return g.x + 22 > -80;
        if (g.type === 'blackhole') return g.x + g.reachR > -80;
        if (g.type === 'windvortex') return g.x + g.reachR > -80;
        if (g.type === 'cloudarc') return g.x2 > -80;
        if (g.type === 'stormchargebolttelegraph') return !g.resolved;
        if (g.type === 'stormchargebolt') return (frame - g.spawnFrame) < (g.fireDuration || 42);
        if (g.type === 'orbiter') return g.x + g.orbitRadius + g.r > -80;
        if (g.type === 'arcplanet') return g.x + g.r > -80;
        if (g.type === 'lensingzone') return g.x + g.zoneRadius > -80;
        if (g.type === 'signalcorruption') return g.x + g.zoneWidth / 2 > -80;
        if (g.type === 'supernova') {
          if (g.detonated) return (frame - g.detonationFrame) < 20;
          return g.x + g.planetR > -80;
        }
        if (g.type === 'toxicpool') return g.x + g.baseR + g.pulseAmp > -80;
        if (g.type === 'aciddrip') return liveAcidDripY(g) < PLAY_BOTTOM + g.r && g.x + g.r > -80;
        if (g.type === 'geyser') return g.x + g.width / 2 > -80;
        if (g.type === 'shootingstar') {
          if (g.oncoming) return !shootingStarDone(g) && g.x - g.r * 9 < W + 80;
          return !shootingStarDone(g) && g.x + g.r > -80;
        }
        if (g.type === 'movingdoor' || g.type === 'specialdoor') return g.x + g.width / 2 > -80;
        if (g.type === 'accesskey') return !g.collected && g.x + g.r > -80;
        if (g.type === 'sparkhub') return g.x > -120;
        if (g.type === 'sparkprojectile' || g.type === 'supernovadebris') {
          const pos = liveProjectilePos(g);
          const onScreen = pos.x > -80 && pos.x < W + 150 && pos.y > PLAY_TOP - 100 && pos.y < PLAY_BOTTOM + 100;
          // safety net: most directions clear the screen within ~450
          // frames naturally, but a couple of fixed angles can end up with
          // near-zero net horizontal velocity once combined with the
          // scroll, which would otherwise take an enormous number of
          // frames to exit and accumulate across bursts
          const withinSafetyNet = (frame - g.spawnFrame) < 500;
          return onScreen && withinSafetyNet;
        }
        if (g.type === 'hbar') return g.x + g.width / 2 > -80;
        if (g.type === 'marquee') return g.x + g.width / 2 > -80;
        if (g.type === 'courier') return g.x + (g.podR || 16) > -80;
        if (g.type === 'bloom') return g.x + g.maxR > -80;
        if (g.type === 'coil') return g.x + g.halfW > -80;
        if (g.type === 'headlamp') return g.x + g.r > -80;
        if (g.type === 'kelp') return g.x + Math.abs(g.sway || 0) + 30 > -80;
        if (g.type === 'jelly') return g.x + (g.bellR || 24) + 20 > -80;
        if (g.type === 'sponge') return spongeRight(g) > -80;
        if (g.type === 'school') return g.x + g.width / 2 > -80;
        if (g.type === 'urchin') return g.x + g.coreR + g.spine > -80;
        if (g.type === 'current') return g.x + g.width / 2 > -80;
        if (g.type === 'billboard') return g.x + g.panelWidth / 2 > -80;
        if (g.type === 'emp') return g.x + 30 > -80;
        if (g.type === 'echotrail') return g.x + g.zoneWidth / 2 > -80;
        if (g.type === 'pulsingorb') {
          const keep = g.x + g.maxR > -80;
          if (!keep) stopPulsingOrbSound(g);
          return keep;
        }
        if (g.type === 'boomerang') {
          const keep = !boomerangDone(g);
          if (!keep) stopBoomerangSound(g);
          return keep;
        }
        if (g.type === 'searchlight') return g.x > -880;
        if (g.type === 'lasergrid') return g.x + g.gridWidth > -80;
        if (g.type === 'lbolt') return g.x + g.swingWidth / 2 > -80;
        if (g.type === 'barrier') return g.x + g.width / 2 > -50;
        if (g.type === 'lightning') return g.x + g.span / 2 > -50;
        if (g.type === 'wedge') return g.x + g.width / 2 + Math.abs(g.lean || 0) > -50;
        return g.x + GATE_WIDTH > -50;
      });

      for (let g of gates) {
        if (!g.passed && g.x < ship.x) {
          g.passed = true;
        }
      }

      const shipLeft = ship.x - SHIP_W / 2;
      const shipRight = ship.x + SHIP_W / 2;
      const shipTop = ship.y - SHIP_H / 2;
      const shipBottom = ship.y + SHIP_H / 2;
      const shipR = SHIP_W * 0.4;

      for (const g of gates) {
        if (g.type === 'pendulum') {
          const bobY = livePendulumBobY(g);
          const prev = g._prevBobY;
          g._prevBobY = bobY;
          const onScreen = g.x > -40 && g.x < W + 40;
          const nearMissX = Math.abs(g.x - ship.x) < SHIP_W / 2 + g.r + 28;
          if (prev != null && onScreen && nearMissX && (prev - ship.y) * (bobY - ship.y) <= 0 && Math.abs(bobY - prev) > 1.2) {
            if (sfxHazardRateOk('pendulumwhoosh', 200)) playPendulumSwoosh();
          }
        } else if (g.type === 'emp') {
          const discharging = empIsDischarging(g);
          const was = g._wasDischarging;
          g._wasDischarging = discharging;
          if (was === false && discharging && g.x > -60 && g.x < W + 80) {
            if (sfxHazardRateOk('empdischarge', 140)) playEmpDischarge();
          }
        }
      }

      if (shipTop <= PLAY_TOP || shipBottom >= PLAY_BOTTOM) {
        if (ghostMode) clampGhostShipToPlayfield();
        else endGame();
      }

      for (let g of gates) {
        if (g.type === 'splitrock' || g.type === 'asteroid' || g.type === 'fireball' || g.type === 'pendulum' || g.type === 'aciddrip' || g.type === 'shootingstar' || g.type === 'wreckage' || g.type === 'zone2storm' || g.type === 'securitydrone' || g.type === 'turretshot' || g.type === 'bossdrone') {
          const gy = g.type === 'fireball' ? liveFireballY(g) : (g.type === 'pendulum' ? livePendulumBobY(g) : (g.type === 'aciddrip' ? liveAcidDripY(g) : (g.type === 'shootingstar' ? liveShootingStarY(g) : (g.type === 'zone2storm' ? liveStormY(g) : g.y))));
          const dx = ship.x - g.x;
          const dy = ship.y - gy;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'blackhole') {
          // only the small lethal core kills on contact -- the much
          // larger reach radius has no collision of its own, it only
          // affects gravity/lift (handled earlier in the physics step)
          const dx = ship.x - g.x;
          const dy = ship.y - g.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.coreR) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'lensingzone') {
          // same split as a black hole: only the small core is lethal,
          // the surrounding distortion field is purely visual -- the
          // challenge is that the visual noise makes the core harder to
          // spot, not that the hitbox differs from what's shown
          const dx = ship.x - g.x;
          const dy = ship.y - g.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.coreR) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'supernova') {
          // solid and lethal for its whole dormant + warning lifetime;
          // once detonated it has no collision of its own (debris takes
          // over as separate objects)
          if (!g.detonated) {
            const dx = ship.x - g.x;
            const dy = ship.y - g.y;
            if (Math.sqrt(dx * dx + dy * dy) < shipR + g.planetR) {
              tryEndGame(g.type);
            }
          }
        } else if (g.type === 'supernovadebris') {
          const pos = liveProjectilePos(g);
          const dx = ship.x - pos.x, dy = ship.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'toxicpool') {
          const liveR = liveToxicPoolRadius(g);
          const dx = ship.x - g.x;
          const dy = ship.y - g.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + liveR) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'geyser') {
          const h = liveGeyserHeight(g);
          const left = g.x - g.width / 2;
          const right = g.x + g.width / 2;
          const spikeTop = g.pivotSide === 'floor' ? PLAY_BOTTOM - h : PLAY_TOP;
          const spikeBottom = g.pivotSide === 'floor' ? PLAY_BOTTOM : PLAY_TOP + h;
          if (shipRight > left && shipLeft < right && shipBottom > spikeTop && shipTop < spikeBottom) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'hbar') {
          const barY = liveGateCenter(g);
          const barLeft = g.x - g.width / 2;
          const barRight = g.x + g.width / 2;
          const barTop = barY - g.thickness / 2;
          const barBottom = barY + g.thickness / 2;
          if (shipRight > barLeft && shipLeft < barRight && shipBottom > barTop && shipTop < barBottom) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'marquee') {
          const left = g.x - g.width / 2;
          const right = g.x + g.width / 2;
          const top = g.anchor === 'ceiling' ? PLAY_TOP : PLAY_BOTTOM - g.height;
          const bottom = g.anchor === 'ceiling' ? PLAY_TOP + g.height : PLAY_BOTTOM;
          if (shipRight > left && shipLeft < right && shipBottom > top && shipTop < bottom) tryEndGame('marquee');
        } else if (g.type === 'courier') {
          for (const y of courierPods(g)) {
            if (Math.hypot(ship.x - g.x, ship.y - y) < shipR + g.podR) {
              tryEndGame('courier');
              break;
            }
          }
        } else if (g.type === 'bloom') {
          if (Math.hypot(ship.x - g.x, ship.y - PLAY_BOTTOM) < bloomRadius(g) + shipR) tryEndGame('bloom');
        } else if (g.type === 'coil') {
          const sparkTop = PLAY_BOTTOM - g.sparkH;
          if (coilFiring(g) && Math.abs(ship.x - g.x) < g.halfW + shipR && shipBottom > sparkTop) tryEndGame('coil');
        } else if (g.type === 'headlamp') {
          if (Math.hypot(ship.x - g.x, ship.y - g.y) < shipR + g.r) tryEndGame('headlamp');
        } else if (g.type === 'neonbar') {
          const left = g.x - g.width / 2;
          const right = g.x + g.width / 2;
          const top = g.y - g.thick / 2;
          const bottom = g.y + g.thick / 2;
          if (shipRight > left && shipLeft < right && shipBottom > top && shipTop < bottom) tryEndGame('neonbar');
        } else if (g.type === 'wedge') {
          if (rectIntersectsPolygon(shipLeft, shipTop, shipRight, shipBottom, wedgePolygon(g))) tryEndGame('wedge');
        } else if (g.type === 'kelp') {
          const pose = kelpPose(g);
          const hit = distToSegment(ship.x, ship.y, pose.x0, pose.y0, pose.x1, pose.y1);
          const midHit = distToSegment(ship.x, ship.y, pose.x0, pose.y0, pose.mx, pose.my);
          const tipHit = distToSegment(ship.x, ship.y, pose.mx, pose.my, pose.x1, pose.y1);
          if (Math.min(hit, midHit, tipHit) < shipR + pose.thick * 0.5) tryEndGame('kelp');
        } else if (g.type === 'jelly') {
          const pose = jellyPose(g);
          const dx = ship.x - pose.x;
          const dy = ship.y - pose.y;
          const bellHit = Math.hypot(dx, dy) < shipR + pose.bellR;
          const tentHit = distToSegment(ship.x, ship.y, pose.x, pose.y + pose.bellR * 0.35, pose.tx, pose.ty) < shipR + 5;
          const tentHit2 = distToSegment(ship.x, ship.y, pose.x - 8, pose.y + pose.bellR * 0.2, pose.tx2, pose.ty2) < shipR + 5;
          if (bellHit || tentHit || tentHit2) tryEndGame('jelly');
        } else if (g.type === 'sponge') {
          for (const tube of spongeTubes(g)) {
            const cx = tube.x + tube.lean * 0.5;
            const left = cx - tube.w / 2;
            const right = cx + tube.w / 2;
            const top = PLAY_BOTTOM - tube.h;
            if (shipRight > left && shipLeft < right && shipBottom > top) {
              tryEndGame('sponge');
              break;
            }
          }
        } else if (g.type === 'school') {
          const halfW = g.width / 2;
          const halfH = g.height / 2;
          if (shipRight > g.x - halfW && shipLeft < g.x + halfW && shipBottom > g.y - halfH && shipTop < g.y + halfH) {
            tryEndGame('school');
          }
        } else if (g.type === 'urchin') {
          const uy = urchinCenter(g);
          if (Math.hypot(ship.x - g.x, ship.y - uy) < shipR + urchinReach(g)) tryEndGame('urchin');
        } else if (g.type === 'billboard') {
          const panelLeft = g.x - g.panelWidth / 2;
          const panelRight = g.x + g.panelWidth / 2;
          const panelTop = g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM - g.panelHeight;
          const panelBottom = g.anchor === 'top' ? PLAY_TOP + g.panelHeight : PLAY_BOTTOM;
          if (shipRight > panelLeft && shipLeft < panelRight && shipBottom > panelTop && shipTop < panelBottom) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'emp') {
          if (empIsDischarging(g)) {
            const empLeft = g.x - 30, empRight = g.x + 30;
            const empTop = g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM - g.reachDepth;
            const empBottom = g.anchor === 'top' ? PLAY_TOP + g.reachDepth : PLAY_BOTTOM;
            if (shipRight > empLeft && shipLeft < empRight && shipBottom > empTop && shipTop < empBottom) {
              tryEndGame(g.type);
            }
          }
        } else if (g.type === 'echotrail') {
          if (Math.abs(ship.x - g.x) < g.zoneWidth / 2) {
            const histIdx = shipYHistory.length - 1 - g.delayFrames;
            if (histIdx >= 0) {
              const historicalY = shipYHistory[histIdx];
              if (Math.abs(ship.y - historicalY) < g.dangerThreshold) {
                tryEndGame(g.type);
              }
            }
          }
        } else if (g.type === 'pulsingorb') {
          const liveR = livePulsingOrbRadius(g);
          const dx = ship.x - g.x, dy = ship.y - g.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + liveR) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'boomerang') {
          const pos = liveBoomerangPos(g);
          const dx = ship.x - pos.x, dy = ship.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'bossattack') {
          const dx = ship.x - g.x, dy = ship.y - g.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'bossember') {
          const dx = ship.x - g.x, dy = ship.y - g.y;
          if (!g.hit && Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            // non-lethal -- a brief involuntary nudge, not a life loss
            const direction = Math.random() < 0.5 ? -1 : 1;
            ship.vy += direction * BOSS_EMBER_KNOCKBACK;
            ship.vy = Math.max(MAX_RISE_SPEED, Math.min(MAX_FALL_SPEED, ship.vy));
            g.hit = true;
          }
        } else if (g.type === 'bossragepulse') {
          const liveR = liveRagePulseRadius(g);
          const wallX = g.x - liveR; // expanding leftward, toward the ship
          const withinVerticalBand = Math.abs(ship.y - g.y) < BOSS_RAGE_PULSE_THICKNESS / 2 + shipR;
          const withinSweptRegion = ship.x <= g.x + shipR && ship.x >= wallX - shipR; // entire visual is lethal, not just the leading edge
          if (withinVerticalBand && withinSweptRegion) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'bosschargebeam') {
          const withinBeamBand = Math.abs(ship.y - g.lockedY) < (g.thickness || BOSS_CHARGE_BEAM_THICKNESS) / 2 + shipR;
          if (withinBeamBand) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'bossdiagonalring') {
          const liveR = liveDiagonalRingRadius(g);
          const wallX = g.x - liveR;
          const withinWallWidth = Math.abs(ship.x - wallX) < 15 + shipR;
          if (withinWallWidth) {
            const center1 = g.y + BOSS_DIAGONAL_RING_SLOPE * liveR;
            const center2 = g.y - BOSS_DIAGONAL_RING_SLOPE * liveR;
            const inBand1 = Math.abs(ship.y - center1) < BOSS_DIAGONAL_RING_THICKNESS / 2 + shipR;
            const inBand2 = Math.abs(ship.y - center2) < BOSS_DIAGONAL_RING_THICKNESS / 2 + shipR;
            if (inBand1 || inBand2) {
              tryEndGame(g.type);
            }
          }
        } else if (g.type === 'turret') {
          const mountLeft = g.x - 22, mountRight = g.x + 22;
          const mountTop = g.anchor === 'top' ? PLAY_TOP : g.y - 4;
          const mountBottom = g.anchor === 'top' ? g.y + 4 : PLAY_BOTTOM;
          if (shipRight > mountLeft && shipLeft < mountRight && shipBottom > mountTop && shipTop < mountBottom) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'searchlight') {
          const ep = liveSearchlightEndpoint(g);
          const dist = pointToSegmentDist(ship.x, ship.y, g.x, PLAY_TOP, ep.x, ep.y);
          if (dist < shipR + g.beamWidth / 2) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'lasergrid') {
          const halfThick = 4;
          for (const seg of g.segments) {
            if (seg.decorative) continue;
            let segLeft, segRight, segTop, segBottom;
            if (seg.type === 'h') {
              segLeft = g.x + seg.xRel1; segRight = g.x + seg.xRel2;
              segTop = seg.y - halfThick; segBottom = seg.y + halfThick;
            } else {
              segLeft = g.x + seg.xRel - halfThick; segRight = g.x + seg.xRel + halfThick;
              segTop = seg.y1; segBottom = seg.y2;
            }
            if (shipRight > segLeft && shipLeft < segRight && shipBottom > segTop && shipTop < segBottom) {
              tryEndGame(g.type);
              break;
            }
          }
        } else if (g.type === 'lbolt') {
          if (barrierIsActive(g)) {
            // quick bounding-box reject before the more expensive polygon
            // test, then check the actual rendered silhouette so the
            // hitbox matches what the player sees (thin shapes like E5/E6
            // are much narrower than their full bounding box)
            const bLeft = g.x - g.swingWidth / 2;
            const bRight = g.x + g.swingWidth / 2;
            const bTop = g.y - g.height / 2;
            const bBottom = g.y + g.height / 2;
            if (shipRight > bLeft && shipLeft < bRight && shipBottom > bTop && shipTop < bBottom) {
              const topY = g.y - g.height / 2;
              const poly = g.shape.map(([nx, ny]) => [g.x + nx * g.swingWidth / 2, topY + ny * g.height]);
              if (rectIntersectsPolygon(shipLeft, shipTop, shipRight, shipBottom, poly)) {
                tryEndGame(g.type);
              }
            }
          }
        } else if (g.type === 'stormchargebolt') {
          const { pts, forks } = getStormChargeBoltGeometry(g);
          const reveal = Math.min(1, (frame - g.spawnFrame) / 7);
          const count = stormBoltRevealCount(pts.length, reveal);
          const hitR = (g.thickness || 12) / 2 + shipR;
          let hit = false;
          for (let i = 1; i < count; i++) {
            if (pointToSegmentDist(ship.x, ship.y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) < hitR) {
              hit = true;
              break;
            }
          }
          if (!hit && reveal > 0.35 && forks) {
            for (let f = 0; f < forks.length && !hit; f++) {
              const fork = forks[f];
              for (let i = 1; i < fork.length; i++) {
                if (pointToSegmentDist(ship.x, ship.y, fork[i - 1][0], fork[i - 1][1], fork[i][0], fork[i][1]) < hitR * 0.62) {
                  hit = true;
                  break;
                }
              }
            }
          }
          if (hit) tryEndGame(g.type);
        } else if (g.type === 'cloudarc') {
          if (barrierIsActive(g) && shipRight > g.x && shipLeft < g.x2) {
            const shipCenterX = (shipLeft + shipRight) / 2;
            const t = Math.max(0, Math.min(1, (shipCenterX - g.x) / (g.x2 - g.x)));
            const arcY = g.y + (g.y2 - g.y) * t;
            const halfThick = 9;
            if (shipBottom > arcY - halfThick && shipTop < arcY + halfThick) {
              tryEndGame(g.type);
            }
          }
        } else if (g.type === 'barrier') {
          if (barrierIsActive(g) && shipRight > g.x - g.width / 2 && shipLeft < g.x + g.width / 2) {
            const gTop = g.gapCenter - g.gapHeight / 2;
            const gBottom = g.gapCenter + g.gapHeight / 2;
            if (shipTop <= gTop || shipBottom >= gBottom) {
              tryEndGame(g.type);
            }
          }
        } else if (g.type === 'movingdoor') {
          if (shipRight > g.x - g.width / 2 && shipLeft < g.x + g.width / 2) {
            const ranges = liveDoorGapRanges(g);
            const safe = ranges.some(r => shipTop > r.top && shipBottom < r.bottom);
            if (!safe) {
              tryEndGame(g.type);
            }
          }
        } else if (g.type === 'accesskey') {
          const dx = ship.x - g.x;
          const dy = ship.y - g.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            specialDoorUnlocked[g.eventIndex] = true;
            g.collected = true;
            sfxHazardFire('accesskey');
          }
        } else if (g.type === 'specialdoor') {
          if (!specialDoorUnlocked[g.eventIndex] && shipRight > g.x - g.width / 2 && shipLeft < g.x + g.width / 2) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'sparkprojectile') {
          const pos = liveProjectilePos(g);
          const dx = ship.x - pos.x, dy = ship.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'orbiter') {
          const pos = liveOrbiterPos(g);
          const dx = ship.x - pos.x, dy = ship.y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'arcplanet') {
          const gy = liveArcPlanetY(g);
          const dx = ship.x - g.x, dy = ship.y - gy;
          if (Math.sqrt(dx * dx + dy * dy) < shipR + g.r) {
            tryEndGame(g.type);
          }
        } else if (g.type === 'lightning') {
          const left = g.x - g.span / 2;
          const right = g.x + g.span / 2;
          if (shipRight > left && shipLeft < right) {
            const t = Math.max(0, Math.min(1, (ship.x - left) / g.span));
            const boltY = g.y1 + (g.y2 - g.y1) * t;
            const dTop = boltY - g.thickness / 2;
            const dBottom = boltY + g.thickness / 2;
            if (shipBottom > dTop && shipTop < dBottom) {
              tryEndGame(g.type);
            }
          }
        } else if (shipRight > g.x && shipLeft < g.x + GATE_WIDTH) {
          const center = liveGateCenter(g);
          const gap = liveGateGap(g);
          const gTop = center - gap / 2;
          const gBottom = center + gap / 2;
          if (shipTop <= gTop || shipBottom >= gBottom) {
            tryEndGame(g.type);
          }
        }
      }
    }

    // keep ship well clear of the boundaries during warp too (soft clamp,
    // no death) -- gravity/lift keep running through the entire tunnel
    // effect even though there's nothing to see or react to, so this needs
    // a real margin, not just enough to avoid dying mid-tunnel
    if (warpActive) {
      const warpMargin = 130;
      const minY = PLAY_TOP + warpMargin;
      const maxY = PLAY_BOTTOM - warpMargin;
      if (ship.y < minY) { ship.y = minY; ship.vy = 0; }
      if (ship.y > maxY) { ship.y = maxY; ship.vy = 0; }
    }
  } else if (state === 'victory') {
    // keep the background alive behind the scoreboard rather than
    // freezing on whatever frame the ship flew off at
    frame++;
    updateBackgroundParticles(currentTheme());
  }
}

