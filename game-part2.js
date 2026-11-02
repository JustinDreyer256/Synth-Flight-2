function pickCoreTeslaEmptySlot() {
  // bias the safe gap toward wherever the ship currently is, so it's always
  // reachable within the charge window regardless of starting position --
  // pick randomly among slots near the ship's current height. leaves TWO
  // adjacent slots empty (this and the next one) for a wider margin, since
  // the ship can still get pulled away from the gap by the eye beam or
  // orbit barrage during the charge window and need room to recover
  const usableCount = CORE_TESLA_SLOT_FRACS.length - 1; // must leave room for the second empty slot after it
  const slotDists = CORE_TESLA_SLOT_FRACS.slice(0, usableCount).map((frac, i) => {
    const y = PLAY_TOP + frac * (PLAY_BOTTOM - PLAY_TOP);
    return { i, dist: Math.abs(y - ship.y) };
  });
  slotDists.sort((a, b) => a.dist - b.dist);
  const candidateSlots = slotDists.slice(0, 3);
  return candidateSlots[Math.floor(Math.random() * candidateSlots.length)].i;
}

// death sequence: power-down instead of ashing-over -- panels go dark in
// patches, then a final reactor implosion, fading cold rather than to ash
const CORE_DEATH_DIM_DURATION = 40;
const CORE_DEATH_DARKEN_DURATION = 150;
const CORE_DEATH_COLLAPSE_DURATION = 90;
const CORE_DEATH_PATCH_COUNT = 7;
let coreDeathPatches = [];
let coreDeathDebris = []; // {x, y, vx, vy, rotation, rotSpeed, size, life, maxLife}
let coreBossDefeated = false;
let coreBossDefeatFrame = 0;
const CORE_BOSS_DEFEAT_PAUSE = 90;

// circuit overload death -- the final sphere form's own death sequence,
// distinct from the wall's power-down: instead of dimming and going dark,
// the sphere builds up energy until it catastrophically overloads and
// breaks apart, arcing with electricity as it comes undone
const CORE_OVERLOAD_BUILDUP_DURATION = 100;
const CORE_OVERLOAD_FLASH_DURATION = 15;
const CORE_OVERLOAD_BREAKDOWN_DURATION = 110;
let coreOverloadArcs = []; // {angle1, angle2, life, maxLife} -- brief electrical arcs across the surface during buildup

const BOSS_ENTRANCE_DURATION = 150; // ~2.5s -- three-stage dramatic entrance before the fight begins
const BOSS_ENTRANCE_CHARGE_END = 0.4;   // stage 1: charge-up glitch/static buildup, no orb visible
const BOSS_ENTRANCE_ASSEMBLE_END = 0.85; // stage 2: fragments converge toward the center
                                          // stage 3 (remaining 0.15): snap to full size + flash + shockwave + screen shake
const BOSS_FLOAT_AMPLITUDE = 22;
const BOSS_FLOAT_AMPLITUDE_PHASE3 = 160; // increased from 120 for more ring placement variety -- verified safe, 51px margin at the extreme
const BOSS_FLOAT_PERIOD = 210; // slow, gentle bob -- ~3.5s per full cycle
let bossTransitioning = false;
let bossTransitionStartFrame = 0;
let bossTransitionTargetPhase = 3;
let bossWaitingForClear = false; // true once a phase transition's time threshold is reached but hazards are still on screen -- spawning pauses and elapsed freezes until the battlefield clears
let bossWaitingForClearTargetPhase = 3;
let bossWaitingForClearStartFrame = -1;
const BOSS_HAZARD_TYPES = ['bossattack', 'bossragepulse', 'bossdrone', 'bossvolleytelegraph', 'bossdiagonalring'];
const BOSS_PHASE5_TRANSITION_DURATION = 300; // ~5s -- extended for a bigger, more dramatic multi-stage spectacle
const BOSS_PHASE_DURATION = 1500; // ~25s per phase, fixed duration -- easy to add more phases later
const BOSS_NUM_PHASES = 5; // TEMPORARY -- currently 5, expand alongside bossDuration when adding more
let bossTransitionEndFrame = -9999;
const BOSS_TRANSITION_COMPLETE_FX_DURATION = 25; // brief flash/shockwave when the new form locks in
let bossRagePulseTimer = 0;
const BOSS_RAGE_PULSE_INTERVAL = 170; // ~2.8s between pulses
const BOSS_RAGE_PULSE_SPEED = 5; // px/frame horizontal expansion rate
// redesigned from a full expanding ring (which had an unbounded rate of
// change right as its radius crossed the ship's horizontal distance --
// the safe gap could swing from one side to the other faster than any
// finite acceleration could track) to a horizontal-only expanding wall
// at a fixed vertical band. safety is now trivial and constant no
// matter how far the wall has traveled: the band's height never
// changes, so the safe space above/below it never shrinks or moves
const BOSS_RAGE_PULSE_THICKNESS = 80; // fixed vertical band height, leaves ~226px safe space each side
const BOSS_RAGE_PULSE_MAX_R = 950; // despawn once expanded well past the play area
// phase 4: two rings expanding horizontally like the phase-3 wall, but
// each band's vertical center shifts linearly as it expands, at
// opposite slopes -- creating a diagonal "X" look (like the reference
// image) without any tan()-style blowup, since the relationship is
// purely linear. verified safe before implementation: 326px minimum
// safe gap across the full float range, far above the 33px minimum
let bossDiagonalRingTimer = 0;
const BOSS_DIAGONAL_RING_INTERVAL = 200;
const BOSS_DIAGONAL_RING_SPEED = 5;
const BOSS_DIAGONAL_RING_SLOPE = 0.5; // ~27deg
const BOSS_DIAGONAL_RING_THICKNESS = 60;
const BOSS_DIAGONAL_RING_MAX_R = 950;
// phase 4: staggered double wall. reuses the bossragepulse type
// entirely (no new collision/render code) -- just spawns two walls at
// offset heights from a shared reference y, with the second staggered
// in time. offset chosen small enough that once both walls are active
// their bands merge into one continuous danger zone (no safe middle
// gap that would trivially defeat the "commit to a side" challenge),
// verified safe: even at the float range's extreme, whichever side
// shrinks the other always has 300px+ of margin -- always exactly one
// clearly-correct side, never both squeezed simultaneously
let bossDoubleWallTimer = 0;
const BOSS_DOUBLE_WALL_INTERVAL = 220;
const BOSS_DOUBLE_WALL_OFFSET = 40;
const BOSS_DOUBLE_WALL_STAGGER = 45; // ~0.75s between wall A and wall B
// phase 4: summoned drone formation. reuses zone 10's proven
// security-drone formation pattern and rendering wholesale (a new
// 'bossdrone' type, since boss-zone hazards move via explicit vx
// rather than the generic world-scroll multiplier zone 10 uses).
// verified safe before implementation: the formation's one deliberate
// gap is 114px wide after accounting for both drone and ship radii,
// far above the 33px minimum -- clustered drones on either side leave
// no ambiguity about where the real passage is
let bossDroneFormationTimer = 0;
const BOSS_DRONE_FORMATION_INTERVAL = 120; // more frequent, was 260
const BOSS_DRONE_SPEED = 6; // faster, was 3.5
const BOSS_DRONE_R = 13;
// phase 4 exclusive: homing signal fragment. gently steers toward the
// ship's y, but its drift is CLAMPED to within BOSS_HOMING_MAX_DRIFT of
// its own spawn height -- it can never leave that band no matter how
// long it homes. this makes the safety guarantee independent of
// whether the player successfully "outruns" it: verified a 120px
// guaranteed-safe zone always exists outside the band, regardless of
// homing behavior, far above the 33px minimum this session uses.
// (an earlier unbounded-homing version was rejected after simulation
// showed it could asymptotically converge to zero separation against
// a boundary-pinned ship given enough time)
let bossHomingFragmentTimer = 0;
const BOSS_HOMING_FRAGMENT_INTERVAL = 450;
const BOSS_HOMING_FRAGMENT_VX = -3;
const BOSS_HOMING_FRAGMENT_R = 15;
const BOSS_HOMING_MAX_DRIFT = 150; // widened from 100 -- verified still safe (71px guaranteed margin) across the ship's full possible range
const BOSS_HOMING_MAX_VY = 2.4; // reduced from 3.0 for gentler pursuit, still comfortably below the ship's own 5px/frame max
const BOSS_HOMING_TURN_RATE = 0.04; // reduced from 0.06 -- smoother, less sharp direction changes

// phase 5 exclusive: charge beam laser. locks onto the ship's position
// at telegraph start (not continuously tracking, matching the proven
// volley pattern), gives a long generous warning, then fires a
// full-width lethal beam that lingers. verified safe: with the
// locked position at dead-center (worst case), realistic
// acceleration-limited ship physics needs only 18 frames to clear the
// band -- the 120-frame telegraph gives a 102-frame buffer
let bossChargeBeamTimer = 0;
let bossChargeBeamNextGap = 150; // re-rolled randomly after each shot
let bossChargeBeamCount = 0; // tracks which beam shot within phase 5 (1st, 2nd, ...) -- shots 4+ are double thickness

// the climactic ending: after shot 8 completes, the boss resumes
// normal movement for a beat, then charges one final time -- but this
// charge never fires, it just keeps building until it detonates in a
// full-screen explosion cinematic, after which the ship is shown
// flying alone and victory triggers directly (bypassing the normal
// bossTimer countdown, which is frozen throughout this whole sequence)
let bossFinalChargeActive = false;
let bossFinalChargeStartFrame = -1;
let bossExplosionActive = false;
let bossExplosionStartFrame = -1;
let bossFullyDefeated = false; // once true, the boss is permanently gone -- no rendering at all, for the downtime/fly-off/victory screen
const BOSS_FINAL_CHARGE_DELAY = 380; // resumed-movement beat before the final charge begins
const BOSS_FINAL_CHARGE_DURATION = 420; // longer than even the super beam's telegraph -- the ultimate build-up
const BOSS_EXPLOSION_DURATION = 240; // full cinematic: burst, white-out, hold, fade to reveal the ship

// after the explosion, a quiet Mega Man-style beat before the ship
// flies off screen to the right, then the victory screen appears
let postBossDowntimeActive = false;
let postBossDowntimeStartFrame = -1;
let shipFlyOffActive = false;
let shipFlyOffStartFrame = -1;
const POST_BOSS_DOWNTIME_DURATION = 120; // ~2s quiet beat
const SHIP_FLYOFF_ACCEL = 0.15; // gentle ramp-up rather than an instant dash
let bossBeamHoldBlendStartFrame = -9999; // frame the beam sequence ended, used to smoothly blend boss.y back onto its normal float rather than snapping
const BOSS_BEAM_HOLD_BLEND_DURATION = 60;
const BOSS_CHARGE_BEAM_MIN_GAP = 90; // 1.5s
const BOSS_CHARGE_BEAM_MAX_GAP = 300; // 5s

// phase 5 secondary hazard: ember knockback. small particles drift
// from the boss and, on contact, give the ship a brief involuntary
// velocity nudge -- non-lethal, no tryEndGame() call at all. disabled
// entirely once the super beam (shot 8) is active, since that phase
// should be the beam alone
let bossEmberTimer = 0;
const BOSS_EMBER_INTERVAL = 110;
const BOSS_EMBER_SPEED = 2.8;
const BOSS_EMBER_R = 5;
const BOSS_EMBER_KNOCKBACK = 5; // strengthened -- now matches the ship's own max speed for a genuinely noticeable jolt

// phase 5 tertiary hazard: thick ash cloud. a large, slow-drifting
// zone that -- like the black hole's pull -- smoothly reduces lift
// and increases gravity based on proximity to its center while the
// ship is inside. non-lethal, no tryEndGame() call. gated off
// entirely once the super beam (shot 8) is active, same as embers
let bossAshCloudTimer = 0;
const BOSS_ASH_CLOUD_INTERVAL = 260;
const BOSS_ASH_CLOUD_SPEED = 1.6;
const BOSS_ASH_CLOUD_R = 100;
const BOSS_ASH_CLOUD_LIFT_REDUCTION = 0.55;
const BOSS_ASH_CLOUD_GRAVITY_INCREASE = 0.82;
const BOSS_CHARGE_BEAM_TELEGRAPH_DURATION = 120;
const BOSS_SUPER_BEAM_TELEGRAPH_DURATION = 320; // extended further -- a long, unmistakable charge-up for the climactic 7th shot
const BOSS_CHARGE_BEAM_FIRE_DURATION = 90;
const BOSS_SUPER_BEAM_FIRE_DURATION = 150; // 1 second longer than the standard beam's fire duration
const BOSS_CHARGE_BEAM_THICKNESS = 80;
const BOSS_DRONE_FORMATION_YFRACS = [0.1, 0.25, 0.4, 0.75, 0.9];
let bossDoubleWallPendingFrame = -1; // -1 = no second wall pending
const BOSS_TRANSITION_DURATION = 180; // ~3s -- boss visibly "strains" to transform, frozen and silent
let gates = [];
let lastSpawnX = 0;
let fireballSpawnCounter = 0;
let extraFireballCounter = 0;
let extraFireballPatternIndex = 0;
let iceChunkPatternIndex = 0;
let iceFloePatternIndex = 0;
let iceBergPatternIndex = 0;
let glacierSnowContinue = false;
let glacierSnowballX = 0;
let glacierSnowLane = 0;
let glacierSnowSpawned = [];
let iceChunkSpawnX = 0;
let extraToxicCounter = 0;
let extraToxicPatternIndex = 0;
let extraGeyserCounter = 0;
let extraGeyserPatternIndex = 0;
let extraMovingDoorCounter = 0;
let extraMovingDoorPatternIndex = 0;
let specialEventsSpawned = [false, false, false];
let blackHoleEventsSpawned = [false, false, false, false];
let windVortexEventsSpawned = [false, false, false];
let cloudArcEventsSpawned = [false, false, false];
let lightningStrikeEventsSpawned = [false, false, false];
let lasergridEventsSpawned = [false, false];
let droneSwarmEventsSpawned = [false, false, false, false];
let billboardEventsSpawned = [false, false];
let searchlightEventsSpawned = [false, false];
let turretEventsSpawned = [false, false];
let signalCorruptionEventsSpawned = [false, false];
let empEventsSpawned = [false, false];
let echoTrailEventsSpawned = [false, false];
let pulsingOrbEventsSpawned = [false, false];
let boomerangEventsSpawned = [false, false];
let oncomingCometEventsSpawned = [false, false];
let splitRockEventsSpawned = [false, false, false];
let extraStormCounter = 0;
let extraStormPatternIndex = 0;
let extraOrbiterCounter = 0;
let extraOrbiterPatternIndex = 0;
let extraArcPlanetCounter = 0;
let extraArcPlanetPatternIndex = 0;
let lensingZoneEventsSpawned = [false, false, false];
let supernovaEventsSpawned = [false, false];
let specialDoorUnlocked = [false, false, false];
let extraHubCounter = 0;
let extraHubPatternIndex = 0;
let extraStarCounter = 0;
let extraStarPatternIndex = 0;
let terrainSegments = [];
let terrainSegmentsSinceEntry = 0;
let patternIndex = 0;
let terrainWaypointTarget = null;
let terrainWaypointSegLeft = 0;
let terrainWaypointSegTotal = 1;
let terrainWaypointGapTarget = null;
let terrainWaypointIslandTarget = 0;
let terrainWaypointIslandFrom = 0;
let terrainWaypointNosePower = 1;
let terrainWaypointTaperShare = 0.32;
let terrainWaypointTaperCap = 5;
let terrainWaypointIslandShape = '';
let terrainWaypointIslandLabel = '';
let terrainWaypointIslandBias = 0;
let terrainMeanderIndex = 0;

let themeIndex = 0;
let themeLevelReached = 0;
let warpActive = false;
let warpTimer = 0;
let portalObject = null;
let ghostMode = false;
let bossGridFadeEnabled = true; // toggle: does the background grid fade out during the boss color transition?
let bossAshGrayVariant = true; // toggle: gray is now the default -- red kept available for comparison
let devGracePeriodEndFrame = -1; // freezes ship physics (no gravity/lift) after a dev-panel zone jump or phase skip, for a fixed window regardless of input -- prevents the ship falling into a boundary while the dev panel is being navigated, and naturally expires rather than freezing forever
const DEV_GRACE_PERIOD_DURATION = 600; // 10s at 60fps -- generous time to navigate the dev panel
const WARP_LANDING_GRACE_PERIOD = 60; // 1s -- brief safety window right as a new zone begins. Gravity/lift physics run continuously during the warp tunnel itself (a purely visual effect a player isn't expected to actively fly through), which can leave the ship sitting close to the boundary by the time the new zone is actually visible; this gives a beat to see and react rather than dying before the player's first real frame in the zone
let fireballSpeedMult = 1.6; // lowered from the initial 2.4 per feedback -- live-tunable via dev panel

function clampGhostShipToPlayfield() {
  const minY = PLAY_TOP + SHIP_H / 2 + 0.5;
  const maxY = PLAY_BOTTOM - SHIP_H / 2 - 0.5;
  if (ship.y < minY) { ship.y = minY; if (ship.vy < 0) ship.vy = 0; }
  if (ship.y > maxY) { ship.y = maxY; if (ship.vy > 0) ship.vy = 0; }
}

function tryEndGame(hazardType) {
  if (state !== 'playing') return;
  if (ghostMode) return;
  if (bossFinalChargeActive || bossExplosionActive || bossFullyDefeated) return; // victory is already secured -- nothing can kill the player during the boss's death sequence or the fly-off that follows
  const t = gameNowMs();
  if (t < invincibilityEndTime) return; // currently within an active protection window -- ignore this collision entirely
  sfxHazardImpact(hazardType);
  const maxFreeHits = DIFFICULTY_CONFIG[selectedDifficulty]?.freeHitsPerLife || 0;
  if (maxFreeHits > 0 && freeHitsUsedThisLife < maxFreeHits && t >= freeHitCooldownEndTime) {
    // forgiven hit grants a fresh protection window, then the free-pass
    // cooldown so it cannot be chained indefinitely. Normal only gets this
    // once per life; Easy / Overdrive can repeat after the cooldown.
    freeHitsUsedThisLife += 1;
    invincibilityEndTime = t + INVINCIBILITY_DURATION_MS;
    freeHitCooldownEndTime = t + FREE_HIT_COOLDOWN_MS;
    return;
  }
  const moltenSpecialHit = hazardType === 'charging' || hazardType === 'chargingClose'
    || hazardType === 'coreFlame' || hazardType === 'barrageActive';
  // cave / island contact is an out-of-bounds wall, not a hazard: losing
  // a life here must not carry the hit-cycle mercy window into the next life
  const wallLike = hazardType === 'terrain';
  endGame(!wallLike, moltenSpecialHit ? { playCollision: false } : undefined);
}
let nextThemeIndex = 0;
let bgParticles = [];

function currentTheme() {
  return THEMES[themeIndex];
}

function currentGapSize() {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const th = currentTheme();
  const startFrac = (th.gapFractionStart !== undefined) ? th.gapFractionStart : GAP_FRACTION_START;
  if (th.gapConstant) {
    return playHeight * startFrac;
  }
  const minFrac = (th.gapFractionMin !== undefined) ? th.gapFractionMin : GAP_FRACTION_MIN;
  const fraction = Math.max(minFrac, startFrac - distance * 0.0006);
  return playHeight * fraction;
}

function currentGateSpacing() {
  const th = currentTheme();
  if (th.obstacleShape === 'diamond') {
    const playHeight = PLAY_BOTTOM - PLAY_TOP;
    const startFrac = (th.gapFractionStart !== undefined) ? th.gapFractionStart : GAP_FRACTION_START;
    const maxDiameter = playHeight * startFrac * (1 + (th.pulseAmpFrac || 0));
    return Math.max(GATE_SPACING, maxDiameter * 1.4);
  }
  return th.gateSpacing || GATE_SPACING;
}

function spawnGate(x) {
  const th = currentTheme();
  if (th.obstacleShape === 'asteroid') {
    return spawnAsteroidCluster(x);
  }
  if (th.obstacleShape === 'hbar') {
    return spawnHBarCluster(x);
  }
  if (th.obstacleShape === 'kelp') {
    return spawnKelpCluster(x);
  }
  if (th.obstacleShape === 'copper') {
    return spawnCopperCluster(x);
  }
  if (th.obstacleShape === 'chrome') {
    return spawnNeonCluster(x);
  }
  if (th.obstacleShape === 'barrier') {
    return spawnBarrier(x);
  }
  if (th.obstacleShape === 'lbolt') {
    return spawnFloatingBoltCluster(x);
  }
  if (th.obstacleShape === 'pendulum') {
    return spawnPendulumCluster(x);
  }
  if (th.obstacleShape === 'aciddrip') {
    return spawnAcidDrip(x);
  }
  if (th.obstacleShape === 'wreckage') {
    return spawnWreckageCluster(x);
  }
  if (th.obstacleShape === 'lightning') {
    return spawnLightningBolt(x);
  }
  if (th.obstacleShape === 'fireball') {
    return 0; // fireballs spawn on their own timer, not by x-position
  }
  const gap = currentGapSize();
  const margin = 20;
  const minCenter = PLAY_TOP + gap / 2 + margin;
  const maxCenter = PLAY_BOTTOM - gap / 2 - margin;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const baseCenter = Math.max(minCenter, Math.min(maxCenter, PLAY_TOP + entry.centerFrac * playHeight));
  const maxAmp = Math.max(0, Math.min(baseCenter - minCenter, maxCenter - baseCenter));
  gates.push({
    type: 'gate',
    x: x,
    baseCenter: baseCenter,
    amplitude: entry.ampFrac * maxAmp,
    freq: entry.freq,
    phase: entry.phase,
    pulsePhase: entry.pulsePhase || 0,
    pulseFreq: entry.pulseFreq || 0,
    passed: false
  });
  return entry.spacing;
}

function spawnLightningBolt(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const entry = th.pattern[patternIndex % th.pattern.length];
  const seed = patternIndex; // fixed per-bolt seed, so the jagged shape is deterministic
  patternIndex++;

  // deterministic pseudo-jitter for a jagged look (no Math.random() -- same seed
  // always produces the same zigzag, keeping every playthrough identical)
  const jitter = [];
  for (let i = 0; i < 5; i++) {
    jitter.push(Math.sin(i * 12.9898 + seed * 78.233) * 0.5);
  }

  gates.push({
    type: 'lightning',
    x: x,
    span: entry.spanPx,
    thickness: entry.thicknessPx,
    y1: PLAY_TOP + entry.y1Frac * playHeight,
    y2: PLAY_TOP + entry.y2Frac * playHeight,
    jitter: jitter,
    spawnFrame: frame,
    passed: false
  });
  return entry.spacing;
}

function spawnBarrier(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const entry = th.pattern[patternIndex % th.pattern.length];
  const seed = patternIndex; // fixed per-barrier seed for the jagged bolt silhouette
  patternIndex++;

  // deterministic jitter (no Math.random()) so each barrier's jagged shape is
  // fixed and identical across every playthrough
  const jitter = [];
  for (let i = 0; i < 6; i++) {
    jitter.push(Math.sin(i * 12.9898 + seed * 78.233) * 0.5);
  }

  const cycleLength = entry.onFrames + entry.offFrames;
  gates.push({
    type: 'barrier',
    x: x,
    width: 20,
    gapCenter: PLAY_TOP + entry.gapCenterFrac * playHeight,
    gapHeight: entry.gapFrac * playHeight,
    onFrames: entry.onFrames,
    offFrames: entry.offFrames,
    cycleLength: cycleLength,
    phaseOffset: Math.round(entry.phaseFrac * cycleLength),
    jitter: jitter,
    passed: false
  });
  return entry.spacing;
}

function barrierIsActive(g) {
  const t = (frame - zoneStartFrame + g.phaseOffset) % g.cycleLength;
  return t < g.onFrames;
}

// how many frames remain until this barrier's next state change (for the
// pre-activation warning flicker in the renderer)
function barrierFramesToToggle(g) {
  const t = (frame - zoneStartFrame + g.phaseOffset) % g.cycleLength;
  return t < g.onFrames ? (g.onFrames - t) : (g.cycleLength - t);
}

function spawnHBarCluster(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  for (const b of entry.bars) {
    gates.push({
      type: 'hbar',
      x: x + (b.xOffsetPx || 0),
      baseCenter: PLAY_TOP + b.yFrac * playHeight,
      amplitude: b.ampFrac * playHeight,
      freq: b.freq,
      phase: b.phase,
      width: b.widthPx,
      thickness: b.thicknessPx,
      passed: false
    });
  }
  return entry.spacing;
}

function kelpPose(g) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const len = Math.max(80, g.lengthFrac * playHeight);
  const sway = Math.sin((frame - zoneStartFrame) * g.freq + g.phase) * g.sway;
  const fromTop = g.anchor !== 'bottom';
  const y0 = fromTop ? PLAY_TOP : PLAY_BOTTOM;
  const y1 = fromTop ? PLAY_TOP + len : PLAY_BOTTOM - len;
  const x0 = g.x;
  const x1 = g.x + sway;
  return {
    x0, y0, x1, y1,
    mx: (x0 + x1) / 2 + sway * 0.22,
    my: (y0 + y1) / 2,
    thick: g.thick || 24
  };
}

function distToSegment(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len2 = dx * dx + dy * dy;
  let t = len2 < 1 ? 0 : ((px - x0) * dx + (py - y0) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x0 + t * dx;
  const qy = y0 + t * dy;
  const ex = px - qx;
  const ey = py - qy;
  return Math.sqrt(ex * ex + ey * ey);
}

function jellyPose(g) {
  const t = (frame - zoneStartFrame) * g.freq + g.phase;
  const y = g.y + Math.sin(t) * g.bob;
  const wag = Math.sin(t * 1.6) * 16;
  return {
    x: g.x,
    y,
    bellR: g.bellR,
    tent: g.tent,
    rising: Math.cos(t) < 0,
    tx: g.x + wag,
    ty: y + g.bellR + g.tent,
    tx2: g.x - wag * 0.65,
    ty2: y + g.bellR + g.tent - 10
  };
}

function spongeTubes(g) {
  const n = g.heights.length;
  const step = 70;
  return g.heights.map((h, i) => ({
    x: g.x + (i - (n - 1) / 2) * step,
    h,
    w: Math.max(44, Math.min(58, 38 + h * 0.06)),
    lean: i % 2 === 0 ? -6 : 5
  }));
}

function spongeRight(g) {
  const tubes = spongeTubes(g);
  const last = tubes[tubes.length - 1];
  return last.x + last.w / 2 + 6;
}

function urchinReach(g) {
  const t = (frame - zoneStartFrame) * g.freq + g.phase;
  const s = Math.max(0, Math.sin(t));
  return g.coreR + g.spine * s * s * s * s;
}

function urchinCenter(g) {
  const t = (frame - zoneStartFrame) * g.bobFreq + g.phase;
  return g.y + Math.sin(t) * g.bob;
}

function bloomRadius(g) {
  const t = (frame - zoneStartFrame) * (g.freq || 0.02) + (g.phase || 0);
  const s = 0.5 - 0.5 * Math.cos(t);
  return g.minR + (g.maxR - g.minR) * s;
}

function coilFiring(g) {
  const ahead = g.x - ship.x;
  return ahead < 36 && ahead > -80;
}

function courierPods(g) {
  const top = PLAY_TOP + 36;
  const bottom = PLAY_BOTTOM - 48;
  const n = g.count || 8;
  const step = (bottom - top) / (n - 1);
  const pods = [];
  for (let i = 0; i < n; i++) {
    if (i === g.gap || i === g.gap + 1) continue;
    pods.push(top + i * step);
  }
  return pods;
}

function spawnCopperCluster(x) {
  const th = currentTheme();
  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;
  for (const m of entry.marquees || []) {
    gates.push({
      type: 'marquee',
      anchor: m.anchor === 'ceiling' ? 'ceiling' : 'floor',
      x,
      width: m.width,
      height: m.heightFrac ? (PLAY_BOTTOM - PLAY_TOP) * m.heightFrac : m.height,
      passed: false
    });
  }
  for (const c of entry.couriers || []) {
    gates.push({
      type: 'courier',
      x,
      gap: c.gap,
      count: 8,
      podR: 16,
      passed: false
    });
  }
  for (const b of entry.blooms || []) {
    gates.push({
      type: 'bloom',
      x,
      minR: b.minR,
      maxR: b.maxR,
      freq: b.freq,
      phase: b.phase,
      passed: false
    });
  }
  for (const c of entry.coils || []) {
    gates.push({
      type: 'coil',
      x,
      sparkH: c.sparkH,
      halfW: c.halfW,
      passed: false
    });
  }
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  for (const h of entry.headlamps || []) {
    const yFrac = Math.max(0.16, Math.min(0.84, h.yFrac));
    const y = PLAY_TOP + yFrac * playHeight;
    gates.push({
      type: 'headlamp',
      x: x + 320,
      y,
      baseY: y,
      driftY: 0,
      driftTarget: 0,
      jumpBucket: -1,
      lurchBucket: -1,
      r: 28,
      speedMult: 1.55,
      passed: false
    });
  }
  return entry.spacing;
}

function spawnNeonCluster(x) {
  const th = currentTheme();
  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  for (const b of entry.bars || []) {
    gates.push({
      type: 'neonbar',
      x,
      y: PLAY_TOP + b.yFrac * playHeight,
      width: b.width,
      thick: b.thick || 26,
      hot: !!b.hot,
      passed: false
    });
  }
  for (const w of entry.wedges || []) {
    gates.push({
      type: 'wedge',
      anchor: w.anchor === 'ceiling' ? 'ceiling' : 'floor',
      x: x + (w.xJitter || 0),
      width: w.width,
      height: w.height,
      lean: w.lean || 0,
      passed: false
    });
  }
  return entry.spacing;
}

function spawnKelpCluster(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;
  if (entry.kelp) {
    for (const k of entry.kelp) {
      gates.push({
        type: 'kelp',
        anchor: k.anchor === 'bottom' ? 'bottom' : 'top',
        x: x + (k.xJitter || 0),
        lengthFrac: k.lengthFrac,
        sway: k.sway,
        freq: k.freq,
        phase: k.phase,
        thick: k.thick || 24,
        passed: false
      });
    }
  }
  if (entry.sponge) {
    gates.push({ type: 'sponge', x, heights: entry.sponge.slice(), passed: false });
  }
  if (entry.jelly) {
    const j = entry.jelly;
    const bell = j.bell || 24;
    const tent = j.tent || 90;
    const bob = j.bob || 40;
    const raw = PLAY_TOP + j.yFrac * playHeight;
    const y = Math.max(PLAY_TOP + bell + bob + 36, Math.min(PLAY_BOTTOM - tent - bell - bob - 48, raw));
    gates.push({
      type: 'jelly', x, y, bob, tent, bellR: bell,
      freq: j.freq || 0.022, phase: j.phase || 0, passed: false
    });
  }
  if (entry.school) {
    const s = entry.school;
    const half = s.height / 2;
    const y = Math.max(PLAY_TOP + half + 28, Math.min(PLAY_BOTTOM - half - 28, PLAY_TOP + s.yFrac * playHeight));
    gates.push({
      type: 'school', x, y, width: s.width, height: s.height, swim: s.swim, passed: false
    });
  }
  if (entry.urchin) {
    const u = entry.urchin;
    const reach = u.core + u.spine;
    const bob = 58;
    const raw = PLAY_TOP + u.yFrac * playHeight;
    const y = Math.max(PLAY_TOP + reach + bob + 16, Math.min(PLAY_BOTTOM - reach - bob - 16, raw));
    gates.push({
      type: 'urchin', x, y, coreR: u.core, spine: u.spine,
      freq: u.freq, phase: u.phase, bob, bobFreq: 0.011, passed: false
    });
  }
  return entry.spacing;
}

// hand-picked bolt silhouettes (normalized: x as fraction of swingWidth/2,
// y as fraction of height from top), each a distinct filled icon shape
const BOLT_SHAPES = {
  E1: [[0.55, 0], [-0.45, 0.425], [0.2, 0.425], [-0.625, 1], [0.875, 0.45], [0.075, 0.45]],
  E3: [[0.8, 0], [-0.75, 0.45], [0.25, 0.45], [-0.875, 1], [1.125, 0.5], [0.2, 0.5]],
  E4: [[0.5, 0.15], [-0.45, 0.45], [0.15, 0.45], [-0.55, 0.85], [0.8, 0.525], [0.05, 0.525]],
  E5: [[0.3, 0], [-0.35, 0.55], [0.125, 0.55], [-0.4, 1], [0.55, 0.6], [0.05, 0.6]],
  E6: [[0.2, 0], [-0.2, 0.45], [0.075, 0.45], [-0.25, 1], [0.35, 0.475], [0.025, 0.475]]
};

// accurate polygon-vs-rectangle collision, used so hitboxes match the
// visible jagged bolt silhouette instead of its full bounding box (which
// is much wider than thin shapes like E5/E6 actually render)
function pointInPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function rectIntersectsPolygon(left, top, right, bottom, poly) {
  const corners = [[left, top], [right, top], [right, bottom], [left, bottom]];
  for (const [cx, cy] of corners) {
    if (pointInPolygon(cx, cy, poly)) return true;
  }
  for (const [vx, vy] of poly) {
    if (vx >= left && vx <= right && vy >= top && vy <= bottom) return true;
  }
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    for (let j = 0; j < 4; j++) {
      const [cx, cy] = corners[j];
      const [dx, dy] = corners[(j + 1) % 4];
      if (segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy)) return true;
    }
  }
  return false;
}

// Same outline drawIceSpire fills. The old hit was the full rectangle, which
// stays wide after the crystal has already narrowed to a point.
function iceSpirePolygon(g) {
  const fromTop = g.anchor === 'top';
  const half = g.width / 2;
  const left = g.x - half;
  const right = g.x + half;
  const innerTop = g.y - g.height / 2;
  const innerBot = g.y + g.height / 2;
  const root = fromTop ? innerTop - 20 : innerBot + 20;
  const tip = fromTop ? innerBot : innerTop;
  const yAt = (frac) => fromTop ? root + (tip - root) * frac : root - (root - tip) * frac;
  return [
    [left - 14, root],
    [left - 4, yAt(0.18)],
    [left + 6, yAt(0.55)],
    [left + half * 0.22, yAt(0.92)],
    [left + half * 0.38, yAt(0.97)],
    [left + half * 0.52, yAt(0.93)],
    [g.x + half * 0.08, tip],
    [g.x + half * 0.3, yAt(0.95)],
    [right - half * 0.2, yAt(0.98)],
    [right - 8, yAt(0.68)],
    [right + 4, yAt(0.2)],
    [right + 16, root]
  ];
}

function spawnPendulumCluster(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  entry.pendulums.forEach((p) => {
    const pivotY = p.pivotSide === 'top' ? PLAY_TOP : PLAY_BOTTOM;
    const chainLength = p.chainLengthFrac * playHeight;
    const amplitude = p.ampFrac * playHeight;
    gates.push({
      type: 'pendulum',
      x: x + p.xJitter,
      pivotY: pivotY,
      pivotSide: p.pivotSide,
      chainLength: chainLength,
      amplitude: amplitude,
      freq: p.freq,
      phase: p.phase,
      r: p.radiusPx,
      passed: false
    });
  });
  return entry.spacing;
}

function livePendulumBobY(g) {
  const dir = g.pivotSide === 'top' ? 1 : -1;
  return g.pivotY + dir * (g.chainLength + g.amplitude * Math.sin((frame - zoneStartFrame) * g.freq + g.phase));
}

function spawnFloatingBoltCluster(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 28;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  entry.bolts.forEach((b) => {
    const heightPx = b.heightFrac * playHeight;
    const cycleLength = b.onFrames + b.offFrames;
    gates.push({
      type: 'lbolt',
      x: x + b.xJitter,
      y: PLAY_TOP + margin + b.yFrac * Math.max(1, playHeight - margin * 2),
      height: heightPx,
      swingWidth: b.swingWidthPx,
      shape: BOLT_SHAPES[b.shape],
      onFrames: b.onFrames,
      offFrames: b.offFrames,
      cycleLength: cycleLength,
      phaseOffset: Math.round(b.phaseFrac * cycleLength),
      passed: false
    });
  });
  return entry.spacing;
}

function spawnBlackHoleEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 15;
  const entry = th.blackHoleEvents[eventIndex];

  const holeX = ship.x + EVENT_SPAWN_OFFSET + entry.reachR;
  const holeY = PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2);

  gates.push({
    type: 'blackhole',
    x: holeX,
    y: holeY,
    coreR: entry.coreR,
    reachR: entry.reachR,
    rotSeed: eventIndex * 7.3,
    passed: false
  });
}

function spawnWindVortexEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 15;
  const entry = th.windVortexEvents[eventIndex];

  const vx = ship.x + EVENT_SPAWN_OFFSET + entry.reachR;
  const vy = PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2);

  gates.push({
    type: 'windvortex',
    x: vx,
    y: vy,
    reachR: entry.reachR,
    rotSeed: eventIndex * 5.1,
    passed: false
  });
}

function spawnCloudArcEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 20;
  const entry = th.cloudArcEvents[eventIndex];

  const x1 = ship.x + EVENT_SPAWN_OFFSET + entry.spanPx;
  const x2 = x1 + entry.spanPx;
  const y1 = PLAY_TOP + margin + entry.y1Frac * Math.max(1, playHeight - margin * 2);
  const y2 = PLAY_TOP + margin + entry.y2Frac * Math.max(1, playHeight - margin * 2);
  const cycleLength = entry.onFrames + entry.offFrames;
  const jitter = [];
  for (let i = 0; i < 7; i++) jitter.push((Math.random() - 0.5) * 2);
  // a single secondary fork branching off the main line, like real lightning --
  // fixed at spawn so it's consistent frame to frame, not regenerated
  const branchT = 0.35 + Math.random() * 0.3; // where along the main line it forks off
  const branchSide = Math.random() < 0.5 ? -1 : 1;
  const branchLen = 40 + Math.random() * 30;
  const branchAngleJitter = (Math.random() - 0.5) * 0.6;

  gates.push({
    type: 'cloudarc',
    x: x1, y: y1, x2: x2, y2: y2,
    onFrames: entry.onFrames,
    offFrames: entry.offFrames,
    cycleLength: cycleLength,
    phaseOffset: Math.round(entry.phaseFrac * cycleLength),
    jitter: jitter,
    branchT, branchSide, branchLen, branchAngleJitter,
    passed: false
  });
}

function stormBoltRng(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function stormChargeBoltGeometry(lockedY, seed) {
  const rand = stormBoltRng((seed || 1) ^ (((lockedY * 97) | 0) + 0x51ed));
  const minY = PLAY_TOP + 10;
  const maxY = PLAY_BOTTOM - 10;
  const clampY = (y) => Math.max(minY, Math.min(maxY, y));
  let pts = [
    [0, clampY(lockedY + (rand() - 0.5) * 10)],
    [W, clampY(lockedY + (rand() - 0.5) * 22)]
  ];
  let disp = 58;
  for (let pass = 0; pass < 5; pass++) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = (a[0] + b[0]) * 0.5;
      const my = (a[1] + b[1]) * 0.5;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const offset = (rand() * 2 - 1) * disp;
      next.push([mx - (dy / len) * offset * 0.18, clampY(my + (dx / len) * offset)]);
      next.push(b);
    }
    pts = next;
    disp *= 0.46;
  }
  const forks = [];
  const forkCount = 4 + Math.floor(rand() * 3);
  for (let f = 0; f < forkCount; f++) {
    const idx = 4 + Math.floor(rand() * (pts.length - 10));
    const [sx, sy] = pts[idx];
    const [nx, ny] = pts[Math.min(pts.length - 1, idx + 1)];
    const ang = Math.atan2(ny - sy, nx - sx) + (rand() > 0.5 ? 1 : -1) * (0.5 + rand() * 0.85);
    const branch = [[sx, sy]];
    let bx = sx;
    let by = sy;
    let len = 22 + rand() * 44;
    const segs = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < segs; k++) {
      const jag = (rand() - 0.5) * 0.7;
      bx += Math.cos(ang + jag) * len;
      by = clampY(by + Math.sin(ang + jag) * len);
      branch.push([bx, by]);
      len *= 0.68;
    }
    forks.push(branch);
  }
  return { pts, forks };
}

function getStormChargeBoltGeometry(g) {
  if (g.boltGeom && g.boltGeom.pts && g.boltGeom.pts.length) return g.boltGeom;
  g.boltGeom = stormChargeBoltGeometry(g.lockedY, g.boltSeed || 1);
  return g.boltGeom;
}

function stormBoltRevealCount(len, t) {
  return Math.max(2, Math.min(len, Math.ceil(Math.max(0, t) * (len - 1)) + 1));
}

function spawnStormChargeBoltEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.lightningStrikeEvents[eventIndex];
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const lockedY = PLAY_TOP + playHeight * (entry.yFrac != null ? entry.yFrac : 0.38);
  const boltSeed = ((eventIndex + 1) * 9176) ^ (frame * 13) ^ 0xa5a5;
  gates.push({
    type: 'stormchargebolttelegraph',
    x: ship.x + EVENT_SPAWN_OFFSET,
    lockedY,
    boltSeed,
    boltGeom: stormChargeBoltGeometry(lockedY, boltSeed),
    spawnFrame: frame,
    warningFrames: entry.telegraphFrames || 84,
    fireDuration: entry.fireFrames || 42,
    thickness: entry.thickness || 12,
    resolved: false,
    passed: false
  });
  sfxHazardFire('stormchargebolttelegraph');
}

function fireStormChargeBolt(g) {
  gates.push({
    type: 'stormchargebolt',
    x: g.x,
    lockedY: g.lockedY,
    boltSeed: g.boltSeed,
    boltGeom: g.boltGeom || stormChargeBoltGeometry(g.lockedY, g.boltSeed || 1),
    spawnFrame: frame,
    fireDuration: g.fireDuration,
    thickness: g.thickness,
    passed: false
  });
  playStormThunderStrike();
}

function spawnDroneSwarmEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 20;
  const entry = th.droneSwarmEvents[eventIndex];
  const n = entry.formationYFracs.length;
  const portalX = predictedPortalX();
  const maxX = portalX != null ? portalX - 48 - entry.r : Infinity;

  entry.formationYFracs.forEach((yFrac, i) => {
    const y = PLAY_TOP + margin + yFrac * Math.max(1, playHeight - margin * 2);
    let spawnX = ship.x + EVENT_SPAWN_OFFSET + i * 35;
    if (spawnX > maxX) spawnX = maxX - (n - 1 - i) * 28;
    gates.push({
      type: 'securitydrone',
      x: spawnX,
      y: y,
      r: entry.r,
      speedMult: entry.speedMult,
      rotSeed: i * 2.7,
      passed: false
    });
  });
}

function spawnBillboardEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const entry = th.billboardEvents[eventIndex];
  const panelHeight = playHeight * entry.extendFrac;

  gates.push({
    type: 'billboard',
    x: ship.x + EVENT_SPAWN_OFFSET + entry.panelWidth,
    anchor: entry.anchor,
    panelWidth: entry.panelWidth,
    panelHeight: panelHeight,
    rotSeed: eventIndex * 3.3,
    passed: false
  });
}

function spawnTurretEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.turretEvents[eventIndex];
  const y = entry.anchor === 'top' ? PLAY_TOP + entry.mountOffset : PLAY_BOTTOM - entry.mountOffset;
  gates.push({
    type: 'turret',
    x: ship.x + EVENT_SPAWN_OFFSET,
    anchor: entry.anchor,
    y: y,
    numShots: entry.numShots,
    fireInterval: entry.fireInterval,
    fireAngleDeg: entry.fireAngleDeg || 0,
    projectileSpeed: entry.projectileSpeed,
    projectileR: entry.projectileR,
    spawnFrame: frame,
    shotsFired: 0,
    passed: false
  });
}

function spawnSearchlightEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.searchlightEvents[eventIndex];
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const angleMaxRad = entry.angleMaxDeg * Math.PI / 180;
  gates.push({
    type: 'searchlight',
    x: ship.x + EVENT_SPAWN_OFFSET,
    maxOffset: playHeight * Math.tan(angleMaxRad),
    sweepPeriod: entry.sweepPeriod,
    beamWidth: entry.beamWidth,
    spawnFrame: frame,
    passed: false
  });
}

function liveSearchlightEndpoint(g) {
  const elapsed = frame - g.spawnFrame;
  const offset = g.maxOffset * Math.sin(2 * Math.PI * elapsed / g.sweepPeriod);
  return { x: g.x + offset, y: PLAY_BOTTOM };
}

function pointToSegmentDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * dx, closestY = y1 + t * dy;
  return Math.hypot(px - closestX, py - closestY);
}

function spawnZone2Storm() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 40;

  const entry = th.extraStormPattern[extraStormPatternIndex % th.extraStormPattern.length];
  extraStormPatternIndex++;

  const baseY = PLAY_TOP + margin + entry.baseYFrac * Math.max(1, playHeight - margin * 2);
  gates.push({
    type: 'zone2storm',
    x: W + entry.r + 40,
    baseY: baseY,
    spawnFrame: frame,
    r: entry.r,
    rotSeed: extraStormPatternIndex * 2.3,
    passed: false
  });
  return entry.interval;
}

function liveStormY(g) {
  // pure horizontal sweep -- no vertical drift, matching the "sweeps
  // right to left only" design
  return g.baseY;
}

function zoneEndRemainingDistance() {
  if (miniBossEscapeRunActive) {
    return (miniBossEscapeRunStartDistance + MINI_BOSS_ESCAPE_RUN_DISTANCE) - distance;
  }
  const th = currentTheme();
  if (th.isBossZone || th.isMiniBossZone) return Infinity;
  if (themeLevelReached >= 999999) return Infinity;
  return THEME_DISTANCE - (distance - zoneStartDistance);
}

function predictedPortalX() {
  if (portalObject) return portalObject.x;
  const remaining = zoneEndRemainingDistance();
  if (!isFinite(remaining) || remaining <= 0) return null;
  return ship.x + remaining * 10;
}

function spawnWouldHitPortal(spawnX, forwardExtent) {
  const portalX = predictedPortalX();
  if (portalX == null) return false;
  return spawnX + forwardExtent >= portalX - 40;
}

function gateClearsPortal(g, portalSafeX) {
  if (g.type === 'shootingstar') {
    if (g.oncoming) return g.x + g.r < portalSafeX;
    return g.x + g.r * 9 * 1.2 < portalSafeX;
  }
  if (g.type === 'fireball') return g.x + g.r * 8.5 < portalSafeX;
  if (g.type === 'asteroid' || g.type === 'snowball') return g.x + g.r < portalSafeX;
  if (g.type === 'splitrock' || g.type === 'pendulum' || g.type === 'aciddrip' || g.type === 'wreckage') return g.x + g.r < portalSafeX;
  if (g.type === 'zone2storm') return g.x + g.r < portalSafeX;
  if (g.type === 'securitydrone') return g.x + g.r < portalSafeX;
  if (g.type === 'turretshot') return g.x + g.r < portalSafeX;
  if (g.type === 'turret') return g.x + 22 < portalSafeX;
  if (g.type === 'blackhole') return g.x + g.reachR < portalSafeX;
  if (g.type === 'windvortex') return g.x + g.reachR < portalSafeX;
  if (g.type === 'cloudarc') return g.x2 < portalSafeX;
  if (g.type === 'orbiter') return g.x + g.orbitRadius + g.r < portalSafeX;
  if (g.type === 'arcplanet') return g.x + g.r < portalSafeX;
  if (g.type === 'lensingzone') return g.x + g.zoneRadius < portalSafeX;
  if (g.type === 'signalcorruption') return g.x + g.zoneWidth / 2 < portalSafeX;
  if (g.type === 'supernova') return g.x + g.planetR < portalSafeX;
  if (g.type === 'toxicpool') return g.x + g.baseR + g.pulseAmp < portalSafeX;
  if (g.type === 'geyser' || g.type === 'movingdoor' || g.type === 'specialdoor') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'icefloe' || g.type === 'icespire' || g.type === 'icearch' || g.type === 'snowgust' || g.type === 'icecalve') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'sparkhub') return g.x < portalSafeX;
  if (g.type === 'sparkprojectile') return g.x < portalSafeX;
  if (g.type === 'supernovadebris') return g.x < portalSafeX;
  if (g.type === 'accesskey') return g.x + g.r < portalSafeX;
  if (g.type === 'hbar') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'marquee') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'courier') return g.x + (g.podR || 16) < portalSafeX;
  if (g.type === 'bloom') return g.x + g.maxR < portalSafeX;
  if (g.type === 'coil') return g.x + g.halfW < portalSafeX;
  if (g.type === 'headlamp') return g.x + g.r < portalSafeX;
  if (g.type === 'kelp') return g.x + Math.abs(g.sway || 0) + 30 < portalSafeX;
  if (g.type === 'jelly') return g.x + (g.bellR || 24) + 20 < portalSafeX;
  if (g.type === 'sponge') return spongeRight(g) < portalSafeX;
  if (g.type === 'school') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'urchin') return g.x + g.coreR + g.spine < portalSafeX;
  if (g.type === 'current') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'billboard') return g.x + g.panelWidth / 2 < portalSafeX;
  if (g.type === 'emp') return g.x + 30 < portalSafeX;
  if (g.type === 'echotrail') return g.x + g.zoneWidth / 2 < portalSafeX;
  if (g.type === 'pulsingorb') {
    const keep = g.x + g.maxR < portalSafeX;
    if (!keep) stopPulsingOrbSound(g);
    return keep;
  }
  if (g.type === 'boomerang') {
    const keep = !boomerangDone(g);
    if (!keep) stopBoomerangSound(g);
    return keep;
  }
  if (g.type === 'searchlight') return g.x + 880 < portalSafeX;
  if (g.type === 'lasergrid') return g.x + g.gridWidth < portalSafeX;
  if (g.type === 'lbolt') return g.x + g.swingWidth / 2 < portalSafeX;
  if (g.type === 'barrier') return g.x + g.width / 2 < portalSafeX;
  if (g.type === 'lightning') return g.x + g.span / 2 < portalSafeX;
  if (g.type === 'wedge') return g.x + g.width / 2 + Math.abs(g.lean || 0) < portalSafeX;
  return g.x + GATE_WIDTH < portalSafeX;
}

function spawnExtraOrbiter() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const entry = th.extraOrbiterPattern[extraOrbiterPatternIndex % th.extraOrbiterPattern.length];
  extraOrbiterPatternIndex++;

  const centerY = PLAY_TOP + entry.centerYFrac * playHeight;
  const spawnBuffer = entry.orbitRadius + entry.bodyR + 40;

  gates.push({
    type: 'orbiter',
    x: W + spawnBuffer,
    centerY: centerY,
    orbitRadius: entry.orbitRadius,
    angularSpeed: entry.angularSpeed,
    initialAngle: entry.initialAngle,
    r: entry.bodyR,
    color: entry.color,
    spawnFrame: frame,
    rotSeed: extraOrbiterPatternIndex * 3.7,
    passed: false
  });
  return entry.interval;
}

function spawnExtraArcPlanet() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 30;

  const entry = th.extraArcPlanetPattern[extraArcPlanetPatternIndex % th.extraArcPlanetPattern.length];
  extraArcPlanetPatternIndex++;

  const startY = PLAY_TOP + margin + entry.startYFrac * Math.max(1, playHeight - margin * 2);

  // guarantee the swoop continues (never freezes) until the planet has
  // actually scrolled off-screen -- same fix already proven for shooting
  // stars, computed dynamically rather than assuming one screen size
  const effScroll = SCROLL_SPEED * (th.scrollMult || 1);
  const spawnX = W + 60;
  const minLifeForOffscreen = (spawnX + 80 + entry.bodyR) / effScroll;
  const life = Math.max(entry.lifeFrames, minLifeForOffscreen);

  gates.push({
    type: 'arcplanet',
    x: spawnX,
    spawnFrame: frame,
    startY: startY,
    arcDrop: entry.arcDropFrac * playHeight,
    life: life,
    r: entry.bodyR,
    color: entry.color,
    passed: false
  });
  return entry.interval;
}

function liveArcPlanetY(g) {
  const t = Math.min(1, (frame - g.spawnFrame) / g.life);
  return g.startY + g.arcDrop * Math.sin(Math.PI * t);
}

function arcPlanetDone(g) {
  return (frame - g.spawnFrame) >= g.life;
}

function spawnSignalCorruptionEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.signalCorruptionEvents[eventIndex];
  gates.push({
    type: 'signalcorruption',
    x: ship.x + EVENT_SPAWN_OFFSET + entry.zoneWidth / 2,
    zoneWidth: entry.zoneWidth,
    rotSeed: eventIndex * 5.1,
    passed: false
  });
}

function spawnEmpEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.empEvents[eventIndex];
  gates.push({
    type: 'emp',
    x: ship.x + EVENT_SPAWN_OFFSET,
    anchor: entry.anchor,
    reachDepth: entry.reachDepth,
    chargeFrames: entry.chargeFrames,
    dischargeFrames: entry.dischargeFrames,
    spawnFrame: frame,
    passed: false
  });
}

function spawnPulsingOrbEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.pulsingOrbEvents[eventIndex];
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  gates.push({
    type: 'pulsingorb',
    x: ship.x + EVENT_SPAWN_OFFSET + entry.maxR,
    y: PLAY_TOP + playHeight / 2,
    minR: entry.minR,
    maxR: entry.maxR,
    period: entry.period,
    spawnFrame: frame,
    rotSeed: eventIndex * 3.7,
    passed: false
  });
}

function livePulsingOrbRadius(g) {
  const elapsed = frame - g.spawnFrame;
  const midR = (g.minR + g.maxR) / 2, ampR = (g.maxR - g.minR) / 2;
  return midR + ampR * Math.sin(2 * Math.PI * elapsed / g.period);
}

function stopPulsingOrbSound(g) {
  if (!g || !g.orbSfx) return;
  const nodes = g.orbSfx;
  g.orbSfx = null;
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  try {
    nodes.out.gain.cancelScheduledValues(now);
    nodes.out.gain.setValueAtTime(Math.max(0.0001, nodes.out.gain.value), now);
    nodes.out.gain.linearRampToValueAtTime(0.0001, now + 0.08);
  } catch (e) { /* already stopped */ }
  nodes.sources.forEach((node) => {
    try { node.stop(now + 0.1); } catch (e) { /* already stopped */ }
  });
}

function stopAllPulsingOrbSounds() {
  for (const g of gates) {
    if (g.type === 'pulsingorb') stopPulsingOrbSound(g);
  }
}

function playPulsingOrbBloom(prox = 1) {
  if (!audioUnlocked || !audioCtx || audioSettings.muted) return;
  if (!sfxHazardRateOk('orbBloom', 220)) return;
  const t0 = audioCtx.currentTime;
  const vol = 0.14 * Math.max(0.35, prox);
  playNoiseBurst({
    duration: 0.28, filterFreq: 280, filterEnd: 2100, filterType: 'lowpass', filterQ: 0.55,
    volume: vol, delaySend: 0.16, when: t0,
  });
  playSynth({
    type: 'sine', freq: 72, freqEnd: 168, duration: 0.26,
    attack: 0.02, decay: 0.08, sustain: 0.45, release: 0.1,
    volume: vol * 0.7, filterFreq: 700, delaySend: 0.12, when: t0,
  });
  playSynth({
    type: 'triangle', freq: 140, freqEnd: 280, duration: 0.22,
    attack: 0.03, decay: 0.07, sustain: 0.28, release: 0.1,
    volume: vol * 0.28, filterFreq: 1600, delaySend: 0.22, when: t0 + 0.04,
  });
}

function startPulsingOrbSound(g) {
  if (!g || g.orbSfx || !audioUnlocked || !audioCtx || audioSettings.muted) return;
  const now = audioCtx.currentTime;
  const out = audioCtx.createGain();
  out.gain.setValueAtTime(0.0001, now);
  out.connect(sfxGain);

  const drone = audioCtx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 70;
  const dGain = audioCtx.createGain();
  dGain.gain.value = 0.11;
  drone.connect(dGain);
  dGain.connect(out);

  const bloom = audioCtx.createOscillator();
  bloom.type = 'triangle';
  bloom.frequency.value = 130;
  const bFilt = audioCtx.createBiquadFilter();
  bFilt.type = 'lowpass';
  bFilt.frequency.value = 520;
  bFilt.Q.value = 0.8;
  const bGain = audioCtx.createGain();
  bGain.gain.value = 0.045;
  bloom.connect(bFilt);
  bFilt.connect(bGain);
  bGain.connect(out);

  const noise = createGlowDangerNoise();
  const nFilt = audioCtx.createBiquadFilter();
  nFilt.type = 'bandpass';
  nFilt.frequency.value = 360;
  nFilt.Q.value = 1.15;
  const nGain = audioCtx.createGain();
  nGain.gain.value = 0.05;
  noise.connect(nFilt);
  nFilt.connect(nGain);
  nGain.connect(out);

  drone.start(now);
  bloom.start(now);
  noise.start(now);
  g.orbSfx = { out, drone, bloom, bFilt, nFilt, nGain, sources: [drone, bloom, noise] };
  g.orbSfxWasExpanding = false;
}

function updatePulsingOrbSound(g) {
  if (!g.orbSfx || !audioCtx) return;
  const t = Math.max(0, Math.min(1, (livePulsingOrbRadius(g) - g.minR) / Math.max(1, g.maxR - g.minR)));
  const elapsed = frame - g.spawnFrame;
  const expanding = Math.cos(2 * Math.PI * elapsed / g.period) > 0.04;
  const now = audioCtx.currentTime;
  const distX = Math.abs(g.x - ship.x);
  const prox = Math.max(0.12, Math.min(1, 1 - distX / Math.max(220, W * 0.85)));
  const onScreen = g.x + g.maxR > -20 && g.x - g.maxR < W + 20;
  const swell = expanding ? 1 : 0.48;
  g.orbSfx.out.gain.setTargetAtTime((0.04 + t * 0.16) * prox * swell * (onScreen ? 1 : 0.28), now, 0.07);
  g.orbSfx.drone.frequency.setTargetAtTime(58 + t * 108, now, 0.06);
  g.orbSfx.bloom.frequency.setTargetAtTime(108 + t * 175, now, 0.06);
  g.orbSfx.bFilt.frequency.setTargetAtTime(360 + t * 1500, now, 0.08);
  g.orbSfx.nFilt.frequency.setTargetAtTime(260 + t * 980, now, 0.08);
  g.orbSfx.nGain.gain.setTargetAtTime(0.028 + t * 0.11, now, 0.08);
  if (expanding && !g.orbSfxWasExpanding && elapsed > 4 && onScreen && prox > 0.28) {
    playPulsingOrbBloom(prox);
  }
  g.orbSfxWasExpanding = expanding;
}

function syncPulsingOrbSounds() {
  if (typeof previewLoopId === 'string' && previewLoopId.startsWith('hzPulseOrb')) return;
  if (state !== 'playing' || ghostMode) {
    stopAllPulsingOrbSounds();
    return;
  }
  for (const g of gates) {
    if (g.type !== 'pulsingorb') continue;
    startPulsingOrbSound(g);
    updatePulsingOrbSound(g);
  }
}

function spawnBoomerangEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.boomerangEvents[eventIndex];
  const g = {
    type: 'boomerang',
    x: entry.xStart,
    xStart: entry.xStart,
    xMax: entry.xMax,
    yOutbound: entry.yOutbound,
    yReturn: entry.yReturn,
    arcAmplitude: entry.arcAmplitude,
    period: entry.period,
    r: entry.r,
    spawnFrame: frame,
    passed: false
  };
  gates.push(g);
  startBoomerangSound(g);
}

function liveBoomerangPos(g) {
  const elapsed = frame - g.spawnFrame;
  const t = Math.min(1, elapsed / g.period);
  const x = g.xStart + (g.xMax - g.xStart) * Math.sin(Math.PI * t);
  const smoothT = t * t * (3 - 2 * t);
  const y = g.yOutbound + (g.yReturn - g.yOutbound) * smoothT + g.arcAmplitude * Math.sin(Math.PI * t);
  return { x: x, y: y };
}

function boomerangDone(g) {
  return (frame - g.spawnFrame) >= g.period;
}

function stopBoomerangSound(g) {
  if (!g || !g.boomSfx) return;
  const nodes = g.boomSfx;
  g.boomSfx = null;
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  try {
    nodes.out.gain.cancelScheduledValues(now);
    nodes.out.gain.setValueAtTime(Math.max(0.0001, nodes.out.gain.value), now);
    nodes.out.gain.linearRampToValueAtTime(0.0001, now + 0.12);
  } catch (e) { /* already stopped */ }
  nodes.sources.forEach((node) => {
    try { node.stop(now + 0.14); } catch (e) { /* already stopped */ }
  });
}

function stopAllBoomerangSounds() {
  for (const g of gates) {
    if (g.type === 'boomerang') stopBoomerangSound(g);
  }
}

function startBoomerangSound(g) {
  if (!g || g.boomSfxStarted) return;
  if (!audioUnlocked || !audioCtx || audioSettings.muted) return;
  playBoomerangPass();
  g.boomSfxStarted = true;
}

function updateBoomerangSound(g) {
}

function syncBoomerangSounds() {
  if (typeof previewLoopId === 'string' && previewLoopId === 'hzBoomerang') return;
  if (state !== 'playing' || ghostMode) return;
  for (const g of gates) {
    if (g.type !== 'boomerang') continue;
    if (boomerangDone(g)) continue;
    startBoomerangSound(g);
    updateBoomerangSound(g);
  }
}

let boomerangPassStyle = 'chop';

function beginBoomerangPassBus() {
  if (!audioUnlocked || !audioCtx || audioSettings.muted) return null;
  const t0 = audioCtx.currentTime;
  const dur = 2.55;
  const halt = t0 + dur + 0.05;
  const out = audioCtx.createGain();
  out.gain.setValueAtTime(0.08, t0);
  out.gain.linearRampToValueAtTime(0.22, t0 + 0.45);
  out.gain.linearRampToValueAtTime(0.72, t0 + 1.05);
  out.gain.linearRampToValueAtTime(0.86, t0 + 1.22);
  out.gain.linearRampToValueAtTime(0.5, t0 + 1.55);
  out.gain.linearRampToValueAtTime(0.16, t0 + 2.15);
  out.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  if (typeof audioCtx.createStereoPanner === 'function') {
    const pan = audioCtx.createStereoPanner();
    pan.pan.setValueAtTime(-0.9, t0);
    pan.pan.linearRampToValueAtTime(0.15, t0 + 1.15);
    pan.pan.linearRampToValueAtTime(-0.85, t0 + dur);
    out.connect(pan);
    pan.connect(sfxGain);
  } else {
    out.connect(sfxGain);
  }
  return { t0, dur, halt, out };
}

function startStopBoomerangNodes(nodes, t0, halt) {
  nodes.forEach((node) => {
    node.start(t0);
    node.stop(halt);
  });
}

function playBoomerangPassBlade() {
  const bus = beginBoomerangPassBus();
  if (!bus) return;
  const { t0, dur, halt, out } = bus;
  const noise = createGlowDangerNoise();
  const nFilt = audioCtx.createBiquadFilter();
  nFilt.type = 'bandpass';
  nFilt.Q.value = 1.8;
  nFilt.frequency.setValueAtTime(480, t0);
  nFilt.frequency.linearRampToValueAtTime(2200, t0 + 1.18);
  nFilt.frequency.linearRampToValueAtTime(520, t0 + dur);
  const nGain = audioCtx.createGain();
  nGain.gain.value = 0.55;
  noise.connect(nFilt);
  nFilt.connect(nGain);
  nGain.connect(out);

  const blade = audioCtx.createOscillator();
  blade.type = 'sawtooth';
  blade.frequency.setValueAtTime(150, t0);
  blade.frequency.linearRampToValueAtTime(410, t0 + 1.18);
  blade.frequency.linearRampToValueAtTime(160, t0 + dur);
  const bladeFilt = audioCtx.createBiquadFilter();
  bladeFilt.type = 'bandpass';
  bladeFilt.Q.value = 4.2;
  bladeFilt.frequency.setValueAtTime(400, t0);
  bladeFilt.frequency.linearRampToValueAtTime(1200, t0 + 1.18);
  bladeFilt.frequency.linearRampToValueAtTime(420, t0 + dur);
  const bladeGain = audioCtx.createGain();
  bladeGain.gain.value = 0.3;
  blade.connect(bladeFilt);
  bladeFilt.connect(bladeGain);
  bladeGain.connect(out);

  const hum = audioCtx.createOscillator();
  hum.type = 'triangle';
  hum.frequency.setValueAtTime(80, t0);
  hum.frequency.linearRampToValueAtTime(155, t0 + 1.18);
  hum.frequency.linearRampToValueAtTime(82, t0 + dur);
  const humGain = audioCtx.createGain();
  humGain.gain.value = 0.18;
  hum.connect(humGain);
  humGain.connect(out);

  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(7, t0);
  lfo.frequency.linearRampToValueAtTime(22, t0 + 1.2);
  lfo.frequency.linearRampToValueAtTime(8, t0 + dur);
  const lfoDepth = audioCtx.createGain();
  lfoDepth.gain.value = 0.4;
  lfo.connect(lfoDepth);
  lfoDepth.connect(nGain.gain);
  startStopBoomerangNodes([noise, blade, hum, lfo], t0, halt);
}

function playBoomerangPassWood() {
  const bus = beginBoomerangPassBus();
  if (!bus) return;
  const { t0, dur, halt, out } = bus;
  const air = createGlowDangerNoise();
  const airFilt = audioCtx.createBiquadFilter();
  airFilt.type = 'bandpass';
  airFilt.Q.value = 0.9;
  airFilt.frequency.setValueAtTime(280, t0);
  airFilt.frequency.linearRampToValueAtTime(1400, t0 + 1.18);
  airFilt.frequency.linearRampToValueAtTime(300, t0 + dur);
  const airGain = audioCtx.createGain();
  airGain.gain.value = 0.72;
  air.connect(airFilt);
  airFilt.connect(airGain);
  airGain.connect(out);

  const wood = audioCtx.createOscillator();
  wood.type = 'triangle';
  wood.frequency.setValueAtTime(92, t0);
  wood.frequency.linearRampToValueAtTime(210, t0 + 1.18);
  wood.frequency.linearRampToValueAtTime(96, t0 + dur);
  const woodGain = audioCtx.createGain();
  woodGain.gain.value = 0.34;
  wood.connect(woodGain);
  woodGain.connect(out);

  const flutter = audioCtx.createOscillator();
  flutter.type = 'sine';
  flutter.frequency.setValueAtTime(5, t0);
  flutter.frequency.linearRampToValueAtTime(16, t0 + 1.15);
  flutter.frequency.linearRampToValueAtTime(6, t0 + dur);
  const flutterDepth = audioCtx.createGain();
  flutterDepth.gain.value = 0.5;
  flutter.connect(flutterDepth);
  flutterDepth.connect(airGain.gain);
  startStopBoomerangNodes([air, wood, flutter], t0, halt);
}

function playBoomerangPassNeon() {
  const bus = beginBoomerangPassBus();
  if (!bus) return;
  const { t0, dur, halt, out } = bus;
  const disc = audioCtx.createOscillator();
  disc.type = 'square';
  disc.frequency.setValueAtTime(220, t0);
  disc.frequency.linearRampToValueAtTime(640, t0 + 1.18);
  disc.frequency.linearRampToValueAtTime(240, t0 + dur);
  const discFilt = audioCtx.createBiquadFilter();
  discFilt.type = 'lowpass';
  discFilt.Q.value = 1.8;
  discFilt.frequency.setValueAtTime(900, t0);
  discFilt.frequency.linearRampToValueAtTime(2800, t0 + 1.18);
  discFilt.frequency.linearRampToValueAtTime(1000, t0 + dur);
  const discGain = audioCtx.createGain();
  discGain.gain.value = 0.16;
  disc.connect(discFilt);
  discFilt.connect(discGain);
  discGain.connect(out);

  const sheen = audioCtx.createOscillator();
  sheen.type = 'sine';
  sheen.frequency.setValueAtTime(880, t0);
  sheen.frequency.linearRampToValueAtTime(1760, t0 + 1.18);
  sheen.frequency.linearRampToValueAtTime(920, t0 + dur);
  const sheenGain = audioCtx.createGain();
  sheenGain.gain.value = 0.09;
  sheen.connect(sheenGain);
  sheenGain.connect(out);

  const hiss = createGlowDangerNoise();
  const hissFilt = audioCtx.createBiquadFilter();
  hissFilt.type = 'highpass';
  hissFilt.frequency.setValueAtTime(1800, t0);
  hissFilt.frequency.linearRampToValueAtTime(4200, t0 + 1.18);
  hissFilt.frequency.linearRampToValueAtTime(1900, t0 + dur);
  const hissGain = audioCtx.createGain();
  hissGain.gain.value = 0.12;
  hiss.connect(hissFilt);
  hissFilt.connect(hissGain);
  hissGain.connect(out);
  if (delayInput) {
    const send = audioCtx.createGain();
    send.gain.value = 0.22;
    discGain.connect(send);
    sheenGain.connect(send);
    send.connect(delayInput);
  }
  startStopBoomerangNodes([disc, sheen, hiss], t0, halt);
}

function playBoomerangPassChop() {
  const bus = beginBoomerangPassBus();
  if (!bus) return;
  const { t0, dur, halt, out } = bus;
  const blade = audioCtx.createOscillator();
  blade.type = 'sawtooth';
  blade.frequency.setValueAtTime(180, t0);
  blade.frequency.linearRampToValueAtTime(480, t0 + 1.18);
  blade.frequency.linearRampToValueAtTime(190, t0 + dur);
  const bladeFilt = audioCtx.createBiquadFilter();
  bladeFilt.type = 'bandpass';
  bladeFilt.Q.value = 3.2;
  bladeFilt.frequency.setValueAtTime(500, t0);
  bladeFilt.frequency.linearRampToValueAtTime(1600, t0 + 1.18);
  bladeFilt.frequency.linearRampToValueAtTime(520, t0 + dur);
  const chop = audioCtx.createGain();
  chop.gain.value = 0.28;
  blade.connect(bladeFilt);
  bladeFilt.connect(chop);
  chop.connect(out);

  const spin = audioCtx.createOscillator();
  spin.type = 'square';
  spin.frequency.setValueAtTime(9, t0);
  spin.frequency.linearRampToValueAtTime(28, t0 + 1.18);
  spin.frequency.linearRampToValueAtTime(10, t0 + dur);
  const spinDepth = audioCtx.createGain();
  spinDepth.gain.value = 0.22;
  spin.connect(spinDepth);
  spinDepth.connect(chop.gain);

  const air = createGlowDangerNoise();
  const airFilt = audioCtx.createBiquadFilter();
  airFilt.type = 'bandpass';
  airFilt.Q.value = 1.3;
  airFilt.frequency.setValueAtTime(400, t0);
  airFilt.frequency.linearRampToValueAtTime(2000, t0 + 1.18);
  airFilt.frequency.linearRampToValueAtTime(440, t0 + dur);
  const airGain = audioCtx.createGain();
  airGain.gain.value = 0.28;
  air.connect(airFilt);
  airFilt.connect(airGain);
  airGain.connect(out);
  startStopBoomerangNodes([blade, spin, air], t0, halt);
}

function playBoomerangPassDoppler() {
  const bus = beginBoomerangPassBus();
  if (!bus) return;
  const { t0, dur, halt, out } = bus;
  const a = audioCtx.createOscillator();
  a.type = 'sine';
  a.frequency.setValueAtTime(140, t0);
  a.frequency.linearRampToValueAtTime(420, t0 + 1.18);
  a.frequency.linearRampToValueAtTime(150, t0 + dur);
  const aGain = audioCtx.createGain();
  aGain.gain.value = 0.42;
  a.connect(aGain);
  aGain.connect(out);

  const b = audioCtx.createOscillator();
  b.type = 'sine';
  b.frequency.setValueAtTime(148, t0);
  b.frequency.linearRampToValueAtTime(445, t0 + 1.18);
  b.frequency.linearRampToValueAtTime(158, t0 + dur);
  const bGain = audioCtx.createGain();
  bGain.gain.value = 0.28;
  b.connect(bGain);
  bGain.connect(out);

  const sub = audioCtx.createOscillator();
  sub.type = 'triangle';
  sub.frequency.setValueAtTime(58, t0);
  sub.frequency.linearRampToValueAtTime(110, t0 + 1.18);
  sub.frequency.linearRampToValueAtTime(60, t0 + dur);
  const subGain = audioCtx.createGain();
  subGain.gain.value = 0.22;
  sub.connect(subGain);
  subGain.connect(out);

  const air = createGlowDangerNoise();
  const airFilt = audioCtx.createBiquadFilter();
  airFilt.type = 'lowpass';
  airFilt.frequency.setValueAtTime(500, t0);
  airFilt.frequency.linearRampToValueAtTime(1800, t0 + 1.18);
  airFilt.frequency.linearRampToValueAtTime(520, t0 + dur);
  const airGain = audioCtx.createGain();
  airGain.gain.value = 0.16;
  air.connect(airFilt);
  airFilt.connect(airGain);
  airGain.connect(out);
  startStopBoomerangNodes([a, b, sub, air], t0, halt);
}

function playBoomerangPassRing() {
  const bus = beginBoomerangPassBus();
  if (!bus) return;
  const { t0, dur, halt, out } = bus;
  const ring = audioCtx.createOscillator();
  ring.type = 'sine';
  ring.frequency.setValueAtTime(620, t0);
  ring.frequency.linearRampToValueAtTime(1680, t0 + 1.18);
  ring.frequency.linearRampToValueAtTime(680, t0 + dur);
  const ringFilt = audioCtx.createBiquadFilter();
  ringFilt.type = 'bandpass';
  ringFilt.Q.value = 8;
  ringFilt.frequency.setValueAtTime(700, t0);
  ringFilt.frequency.linearRampToValueAtTime(1900, t0 + 1.18);
  ringFilt.frequency.linearRampToValueAtTime(740, t0 + dur);
  const ringGain = audioCtx.createGain();
  ringGain.gain.value = 0.18;
  ring.connect(ringFilt);
  ringFilt.connect(ringGain);
  ringGain.connect(out);

  const blade = audioCtx.createOscillator();
  blade.type = 'triangle';
  blade.frequency.setValueAtTime(310, t0);
  blade.frequency.linearRampToValueAtTime(840, t0 + 1.18);
  blade.frequency.linearRampToValueAtTime(330, t0 + dur);
  const bladeGain = audioCtx.createGain();
  bladeGain.gain.value = 0.14;
  blade.connect(bladeGain);
  bladeGain.connect(out);

  const air = createGlowDangerNoise();
  const airFilt = audioCtx.createBiquadFilter();
  airFilt.type = 'bandpass';
  airFilt.Q.value = 2.4;
  airFilt.frequency.setValueAtTime(900, t0);
  airFilt.frequency.linearRampToValueAtTime(2600, t0 + 1.18);
  airFilt.frequency.linearRampToValueAtTime(960, t0 + dur);
  const airGain = audioCtx.createGain();
  airGain.gain.value = 0.2;
  air.connect(airFilt);
  airFilt.connect(airGain);
  airGain.connect(out);
  if (delayInput) {
    const send = audioCtx.createGain();
    send.gain.value = 0.28;
    ringGain.connect(send);
    send.connect(delayInput);
  }
  startStopBoomerangNodes([ring, blade, air], t0, halt);
}

function playBoomerangPass() {
  if (boomerangPassStyle === 'wood') return playBoomerangPassWood();
  if (boomerangPassStyle === 'neon') return playBoomerangPassNeon();
  if (boomerangPassStyle === 'chop') return playBoomerangPassChop();
  if (boomerangPassStyle === 'doppler') return playBoomerangPassDoppler();
  if (boomerangPassStyle === 'ring') return playBoomerangPassRing();
  return playBoomerangPassBlade();
}

function playBoomerangPassPreview() {
  playBoomerangPass();
}

// Stage 1 validation attack: a fan-spread burst of projectiles, aimed
// generally toward the ship's side of the screen. Reuses the exact
// vx/vy directional movement pattern already proven with turretshot --
// deliberately not inventing new physics for the very first boss attack.
function spawnBossBurst() {
  if (!boss) return;
  const numProjectiles = 6;
  const spreadDeg = 100; // widened from 70 -- more room between projectiles per request
  const baseAngleDeg = 180; // straight left, toward the ship's fixed x
  const speed = 3.2805; // 3.645 * 0.9 -- another 10% slower per request (was 4.5, then 4.05, then 3.645, now 3.2805)
  for (let i = 0; i < numProjectiles; i++) {
    const angleOffsetDeg = (i / (numProjectiles - 1) - 0.5) * spreadDeg;
    const angleRad = (baseAngleDeg + angleOffsetDeg) * Math.PI / 180;
    gates.push({
      type: 'bossattack',
      x: boss.x,
      y: boss.y,
      r: 10,
      vx: speed * Math.cos(angleRad),
      vy: speed * Math.sin(angleRad),
      passed: false
    });
  }
  sfxHazardFire('bossattack');
}

// Phase 2 attack: a lock-on telegraph (the boss aims at the ship)
// then a small, fast volley at that locked-in position. Non-homing
// once fired -- moving during the telegraph is the counterplay.
function spawnBossVolleyTelegraph() {
  if (!boss) return;
  gates.push({
    type: 'bossvolleytelegraph',
    spawnFrame: frame,
    warningFrames: 90,
    passed: false
  });
  sfxHazardFire('bossvolleytelegraph');
}

function fireBossVolley(lockedY) {
  if (!boss) return;
  const numProjectiles = 3;
  const speed = 5.85; // 10% slower than 6.5
  const dx = ship.x - boss.x, dy = lockedY - boss.y; // straight-line toward the locked target
  const dist = Math.hypot(dx, dy) || 1;
  for (let i = 0; i < numProjectiles; i++) {
    const spreadOffset = (i - 1) * 18; // small parallel spread, not angular fan
    gates.push({
      type: 'bossattack',
      x: boss.x,
      y: boss.y + spreadOffset,
      r: 9,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      passed: false
    });
  }
  sfxHazardFire('bossvolley');
}

function spawnBossAshCloud() {
  if (!boss) return;
  const yFrac = 0.15 + Math.random() * 0.7;
  const y = PLAY_TOP + yFrac * (PLAY_BOTTOM - PLAY_TOP);
  gates.push({
    type: 'bossashcloud',
    x: W + BOSS_ASH_CLOUD_R,
    y: y,
    r: BOSS_ASH_CLOUD_R,
    vx: -BOSS_ASH_CLOUD_SPEED,
    rotSeed: Math.random() * 100,
    passed: false
  });
  sfxHazardFire('bossashcloud');
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function spawnBossEmber() {
  if (!boss) return;
  const vyDrift = (Math.random() - 0.5) * 1.6;
  gates.push({
    type: 'bossember',
    x: boss.x,
    y: boss.y + (Math.random() - 0.5) * boss.maxR * 0.6,
    r: BOSS_EMBER_R,
    vx: -BOSS_EMBER_SPEED,
    vy: vyDrift,
    rotSeed: Math.random() * 100,
    passed: false
  });
  sfxHazardFire('bossember');
}

function spawnBossChargeBeamTelegraph() {
  if (!boss) return;
  bossChargeBeamCount++;
  const isSuperBeam = bossChargeBeamCount === 8;
  let effThickness;
  if (isSuperBeam) {
    // 40.3% of the playable height.
    effThickness = (PLAY_BOTTOM - PLAY_TOP) * 0.403;
  } else if (bossChargeBeamCount >= 6) {
    effThickness = BOSS_CHARGE_BEAM_THICKNESS * 4; // shots 6 and 7 -- same, quadruple size
  } else if (bossChargeBeamCount >= 4) {
    effThickness = BOSS_CHARGE_BEAM_THICKNESS * 2;
  } else {
    effThickness = BOSS_CHARGE_BEAM_THICKNESS;
  }
  const targetY = isSuperBeam ? (PLAY_TOP + PLAY_BOTTOM) / 2 : ship.y;
  const warningFrames = isSuperBeam ? BOSS_SUPER_BEAM_TELEGRAPH_DURATION : BOSS_CHARGE_BEAM_TELEGRAPH_DURATION;
  gates.push({
    type: 'bosschargebeamtelegraph',
    lockedY: targetY,
    spawnFrame: frame,
    warningFrames: warningFrames,
    resolved: false,
    thickness: effThickness,
    isSuperBeam: isSuperBeam,
    passed: false
  });
  lastBossChargeBeamSfx = {
    duration: framesToSeconds(warningFrames),
    size: effThickness / BOSS_CHARGE_BEAM_THICKNESS,
    isSuperBeam,
  };
  sfxHazardFire('bosschargebeamtelegraph');
}

function fireBossChargeBeam(lockedY, thickness, isSuperBeam) {
  if (!boss) return;
  stopMegaManCharge(0.03);
  gates.push({
    type: 'bosschargebeam',
    lockedY: lockedY,
    thickness: thickness,
    isSuperBeam: !!isSuperBeam,
    fireDuration: isSuperBeam ? BOSS_SUPER_BEAM_FIRE_DURATION : BOSS_CHARGE_BEAM_FIRE_DURATION,
    spawnFrame: frame,
    passed: false
  });
  lastBossChargeBeamSfx = {
    duration: framesToSeconds(isSuperBeam ? BOSS_SUPER_BEAM_FIRE_DURATION : BOSS_CHARGE_BEAM_FIRE_DURATION),
    size: (thickness || BOSS_CHARGE_BEAM_THICKNESS) / BOSS_CHARGE_BEAM_THICKNESS,
    isSuperBeam: !!isSuperBeam,
  };
  sfxHazardFire('bosschargebeam');
}

// Phase 3 rage pulse: a thin ring of energy expands outward from the
// boss's position at the moment it fires. Center is fixed at spawn
// time rather than tracking the boss's ongoing float -- a shockwave
// detaches from its source. Verified safe with direct math before
// implementation: even at the worst-case radius (where the ring's two
// intersection points with the ship's vertical line merge into one
// band), the remaining safe gap is at least 123px, far above the 33px
// minimum, and the tightest window is preceded by ~1.7s of visible
// telegraph as the ring visibly grows from nothing
function spawnBossRagePulse() {
  if (!boss) return;
  gates.push({
    type: 'bossragepulse', // horizontal-only expanding wall, not a full ring
    x: boss.x,
    y: boss.y, // fixed at the exact moment it originates from the boss -- does not track further boss movement
    spawnFrame: frame,
    passed: false
  });
  sfxHazardFire('bossragepulse');
}

// the wall visually and functionally originates from wherever the
// boss currently is, tracking its live float position rather than
// freezing at spawn time -- otherwise, since the boss floats a large
// ±160px range, a wall could visually drift far from the boss by the
// time it's fully expanded, looking disconnected. the float rate is
// slow and bounded (~4.8px/frame max), so this doesn't reintroduce
// any of the unbounded-rate safety issues from earlier ring designs
function liveRagePulseRadius(g) {
  return (frame - g.spawnFrame) * BOSS_RAGE_PULSE_SPEED;
}

function spawnBossDiagonalRings() {
  if (!boss) return;
  gates.push({
    type: 'bossdiagonalring',
    x: boss.x,
    y: boss.y,
    spawnFrame: frame,
    passed: false
  });
  sfxHazardFire('bossdiagonalring');
}

function liveDiagonalRingRadius(g) {
  return (frame - g.spawnFrame) * BOSS_DIAGONAL_RING_SPEED;
}

function spawnBossDoubleWall() {
  if (!boss) return;
  gates.push({ type: 'bossragepulse', x: boss.x, y: boss.y - BOSS_DOUBLE_WALL_OFFSET, spawnFrame: frame, passed: false });
  bossDoubleWallPendingFrame = frame + BOSS_DOUBLE_WALL_STAGGER;
  sfxHazardFire('bossragepulse');
}

let bossDroneCycleIndex = 0;
function spawnBossDrone() {
  if (!boss) return;
  const yFrac = BOSS_DRONE_FORMATION_YFRACS[bossDroneCycleIndex % BOSS_DRONE_FORMATION_YFRACS.length];
  bossDroneCycleIndex++;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 20;
  const y = PLAY_TOP + margin + yFrac * Math.max(1, playHeight - margin * 2);
  gates.push({ type: 'bossdrone', x: W + 60, y: y, r: BOSS_DRONE_R, vx: -BOSS_DRONE_SPEED, rotSeed: bossDroneCycleIndex * 2.7, passed: false });
  sfxHazardFire('bossdrone');
}

function spawnBossHomingFragment() {
  if (!boss) return;
  const spawnY = ship.y; // anchored to the ship, not the boss -- otherwise the clamp range could be centered far from wherever the player actually is, making the fragment appear to not track at all
  gates.push({
    type: 'bossdrone',
    x: W + 60,
    y: spawnY,
    spawnY: spawnY,
    r: BOSS_HOMING_FRAGMENT_R,
    vx: BOSS_HOMING_FRAGMENT_VX,
    vy: 0,
    homing: true,
    rotSeed: frame * 0.7,
    passed: false
  });
  sfxHazardFire('bossdrone');
}

function spawnEchoTrailEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.echoTrailEvents[eventIndex];
  gates.push({
    type: 'echotrail',
    x: ship.x + EVENT_SPAWN_OFFSET + entry.zoneWidth / 2,
    zoneWidth: entry.zoneWidth,
    delayFrames: entry.delayFrames,
    dangerThreshold: entry.dangerThreshold,
    rotSeed: eventIndex * 4.4,
    passed: false
  });
}

function empPhaseElapsed(g) {
  return frame - g.spawnFrame;
}

function empIsDischarging(g) {
  const t = empPhaseElapsed(g);
  return t >= g.chargeFrames && t < g.chargeFrames + g.dischargeFrames;
}

function spawnLensingZoneEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 30;
  const entry = th.lensingZoneEvents[eventIndex];

  const y = PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2);
  gates.push({
    type: 'lensingzone',
    x: ship.x + EVENT_SPAWN_OFFSET + entry.zoneRadius,
    y: y,
    zoneRadius: entry.zoneRadius,
    coreR: entry.coreR,
    rotSeed: eventIndex * 5.1,
    passed: false
  });
}

function spawnSupernovaEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 30;
  const entry = th.supernovaEvents[eventIndex];

  const y = PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2);
  gates.push({
    type: 'supernova',
    x: ship.x + EVENT_SPAWN_OFFSET + entry.planetR,
    y: y,
    planetR: entry.planetR,
    variant: entry.variant || 'timer',
    dormantFrames: entry.dormantFrames,
    warningFrames: entry.warningFrames,
    spawnFrame: frame,
    onscreenFrame: null,
    detonated: false,
    detonationFrame: null,
    rotSeed: eventIndex * 4.3,
    passed: false
  });
}

function supernovaEffectiveDormant(g) {
  // onscreen variant has no time-based dormant period -- the moment it
  // crosses onto screen IS the trigger, warning starts immediately
  return g.variant === 'onscreen' ? 0 : g.dormantFrames;
}

function supernovaPhaseElapsed(g) {
  if (g.variant === 'onscreen') {
    // hasn't crossed onto screen yet -- treat as not-yet-triggered
    if (g.onscreenFrame === null || g.onscreenFrame === undefined) return -1;
    return frame - g.onscreenFrame;
  }
  return frame - g.spawnFrame;
}

function supernovaIsWarning(g) {
  const t = supernovaPhaseElapsed(g);
  if (t < 0) return false;
  const dormant = supernovaEffectiveDormant(g);
  return t >= dormant && t < dormant + g.warningFrames;
}

function spawnSupernovaDebris(planet) {
  // varied (not perfectly even) angles and speeds for a chaotic explosion
  // feel rather than a clean geometric burst, but still fully authored --
  // no Math.random() in obstacle generation
  const angles = [0.2, 0.9, 1.7, 2.6, 3.4, 4.3, 5.5];
  const speeds = [3.2, 3.4, 3.8, 3.3, 3.5, 3.6, 3.1];
  const sizes = [14, 11, 16, 12, 15, 10, 13];
  for (let i = 0; i < angles.length; i++) {
    gates.push({
      type: 'supernovadebris',
      x: planet.x,
      baseY: planet.y,
      spawnFrame: frame,
      angle: angles[i],
      speed: speeds[i],
      r: sizes[i],
      passed: false
    });
  }
  sfxHazardFire('supernova');
}


function spawnWreckageCluster(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const minR = 16, maxR = 30;
  const margin = 28;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  for (const w of entry.wreckage) {
    const wx = x + w.xJitter;
    // skip this piece if a door or key already exists nearby -- wreckage
    // spawns continuously and independently, so it needs to check for
    // existing doors/keys itself rather than relying only on the
    // door/key side to check for wreckage
    if (th.movingDoorPattern && gates.some(g => (g.type === 'movingdoor' || g.type === 'specialdoor' || g.type === 'accesskey') && Math.abs(g.x - wx) < 65)) {
      continue;
    }
    gates.push({
      type: 'wreckage',
      x: wx,
      y: PLAY_TOP + margin + w.yFrac * Math.max(1, playHeight - margin * 2),
      r: minR + w.rFrac * (maxR - minR),
      rotSeed: w.xJitter,
      spin: w.rotSpeed,
      passed: false
    });
  }
  return entry.spacing;
}

function spawnLaserGridEvent(eventIndex) {
  const th = currentTheme();
  const entry = th.lasergridEvents[eventIndex];

  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const dividerXRels = entry.dividerXRels;
  const gapYFracs = entry.gapYFracs;
  const gapHeight = entry.gapHeight;
  const gridWidth = dividerXRels[dividerXRels.length - 1] + 40;

  const segments = [];
  const gapInfo = [];
  for (let i = 0; i < dividerXRels.length; i++) {
    const xRel = dividerXRels[i];
    const gapCenterY = PLAY_TOP + gapYFracs[i] * playHeight;
    const gapTop = gapCenterY - gapHeight / 2;
    const gapBottom = gapCenterY + gapHeight / 2;
    if (gapTop > PLAY_TOP) segments.push({ type: 'v', xRel: xRel, y1: PLAY_TOP, y2: gapTop });
    if (gapBottom < PLAY_BOTTOM) segments.push({ type: 'v', xRel: xRel, y1: gapBottom, y2: PLAY_BOTTOM });
    gapInfo.push({ xRel: xRel, gapTop: gapTop, gapBottom: gapBottom });
  }
  // decorative top/bottom caps, framing the structure as a "grid" --
  // explicitly non-collidable (not just carefully positioned) so they
  // can never cause a false wall the way the old horizontal dividers did
  segments.push({ type: 'h', xRel1: 0, xRel2: gridWidth, y: PLAY_TOP + 2, decorative: true });
  segments.push({ type: 'h', xRel1: 0, xRel2: gridWidth, y: PLAY_BOTTOM - 2, decorative: true });

  gates.push({
    type: 'lasergrid',
    x: ship.x + EVENT_SPAWN_OFFSET + gridWidth,
    gridWidth: gridWidth,
    segments: segments,
    gapInfo: gapInfo,
    rotSeed: eventIndex * 5.1,
    passed: false
  });
}

function spawnAsteroidCluster(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const minR = 15, maxR = 32;
  const margin = 28;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  for (const a of entry.asteroids) {
    gates.push({
      type: 'asteroid',
      x: x + a.xJitter,
      y: PLAY_TOP + margin + a.yFrac * Math.max(1, playHeight - margin * 2),
      r: minR + a.rFrac * (maxR - minR),
      rotSeed: a.xJitter,
      spin: 0.015,
      passed: false
    });
  }
  return entry.spacing;
}

function spawnIceChunkCluster(x) {
  const th = currentTheme();
  const entry = th.iceChunkPattern[iceChunkPatternIndex % th.iceChunkPattern.length];
  iceChunkPatternIndex++;
  const minR = 13, maxR = 22;
  for (const a of entry.chunks) {
    const cx = x + (a.xJitter || 0);
    const bounds = terrainBoundsAt(cx) || terrainBoundsAt(x);
    const top = bounds ? bounds.top : PLAY_TOP;
    const bottom = bounds ? bounds.bottom : PLAY_BOTTOM;
    const r = minR + a.rFrac * (maxR - minR);
    const pad = r + 16;
    const span = Math.max(1, (bottom - pad) - (top + pad));
    gates.push({
      type: 'asteroid',
      x: cx,
      y: top + pad + a.yFrac * span,
      r: r,
      rotSeed: a.xJitter || 0,
      spin: 0.012,
      passed: false
    });
  }
}

function spawnIceFloeCluster(x) {
  const th = currentTheme();
  const entry = th.iceFloePattern[iceFloePatternIndex % th.iceFloePattern.length];
  iceFloePatternIndex++;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  if (entry.spires) {
    for (const s of entry.spires) {
      const fromTop = s.anchor === 'top';
      const height = Math.min(Math.max(220, s.heightFrac * playHeight), playHeight - 200);
      const root = fromTop ? PLAY_TOP : PLAY_BOTTOM;
      const tip = fromTop ? root + height : root - height;
      gates.push({
        type: 'icespire',
        anchor: fromTop ? 'top' : 'bottom',
        x: x + (s.xJitter || 0),
        y: (root + tip) / 2,
        width: s.width,
        height,
        passed: false
      });
    }
    return entry.spacing;
  }
  for (const f of entry.floes) {
    const y = PLAY_TOP + f.yFrac * playHeight;
    gates.push({
      type: 'icefloe',
      x: x + (f.xJitter || 0),
      y: Math.max(PLAY_TOP + f.thickness / 2 + 36, Math.min(PLAY_BOTTOM - f.thickness / 2 - 36, y)),
      width: f.width,
      thickness: f.thickness,
      passed: false
    });
  }
  return entry.spacing;
}

function pushScatteredSnowball(x, lane, vy, drift, r) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const laneSpan = Math.max(80, playHeight - r * 2 - 140);
  const laneY = PLAY_TOP + r + 70 + lane * laneSpan;
  gates.push({
    type: 'snowball',
    x,
    y: -r - 16,
    laneY,
    r,
    vy,
    drift,
    falling: false,
    passed: false
  });
}

// One row per snowball. dist is the zone distance when it crosses the ship.
// lane 0 is high, 1 is low. Angle comes from vy and drift.
const GLACIER_SNOW_DEFAULTS = [
  { dist: 730, lane: 0.80, vy: 3.9, drift: 0.28, r: 42 },
  { dist: 762, lane: 0.16, vy: 1.6, drift: 0.28, r: 38 },
  { dist: 808, lane: 0.72, vy: 3.25, drift: 0.40, r: 46 },
  { dist: 868, lane: 0.80, vy: 2.7, drift: 0.55, r: 40 },
  { dist: 908, lane: 0.18, vy: 1.65, drift: 1.15, r: 36 },
  { dist: 934, lane: 0.76, vy: 3.1, drift: 0.45, r: 44 },
  { dist: 958, lane: 0.82, vy: 3.7, drift: 0.22, r: 38 },
  { dist: 984, lane: 0.74, vy: 4.1, drift: 0.10, r: 40 }
];
const GLACIER_SNOW_STORAGE = 'glacierSnowSchedule';

function cloneSnowSchedule(list) {
  return list.map(s => ({
    dist: s.dist,
    lane: s.lane,
    vy: s.vy,
    drift: s.drift,
    r: s.r
  }));
}

let glacierSnowSchedule = cloneSnowSchedule(GLACIER_SNOW_DEFAULTS);

function snowAngleDeg(vy, drift) {
  return Math.round(Math.atan2(vy, 2.8 + (drift || 0)) * 180 / Math.PI);
}

function snowDriftFor(vy, deg) {
  const rad = Math.max(14, Math.min(70, deg)) * Math.PI / 180;
  const h = vy / Math.tan(rad);
  return Math.round((h - 2.8) * 100) / 100;
}

function loadGlacierSnowSchedule() {
  try {
    const raw = localStorage.getItem(GAME_STORAGE_PREFIX + GLACIER_SNOW_STORAGE);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return;
    const clean = [];
    for (const s of parsed) {
      if (!s || !isFinite(+s.dist) || !isFinite(+s.lane) || !isFinite(+s.vy)) continue;
      clean.push({
        dist: Math.max(620, Math.min(1000, +s.dist)),
        lane: Math.max(0, Math.min(1, +s.lane)),
        vy: Math.max(1.2, Math.min(4.8, +s.vy)),
        drift: isFinite(+s.drift) ? +s.drift : 0.4,
        r: Math.max(28, Math.min(56, +s.r || 40))
      });
    }
    if (clean.length) glacierSnowSchedule = clean;
  } catch (e) { /* keep the shipped list */ }
}

function saveGlacierSnowSchedule() {
  try {
    localStorage.setItem(GAME_STORAGE_PREFIX + GLACIER_SNOW_STORAGE, JSON.stringify(glacierSnowSchedule));
  } catch (e) { /* private mode */ }
}

function resetGlacierSnowSpawned() {
  glacierSnowSpawned = glacierSnowSchedule.map(() => false);
}

loadGlacierSnowSchedule();
resetGlacierSnowSpawned();

function spawnScheduledSnowballs() {
  if (glacierSnowSpawned.length !== glacierSnowSchedule.length) resetGlacierSnowSpawned();
  const zone = distance - zoneStartDistance;
  const portalX = predictedPortalX();
  glacierSnowSchedule.forEach((s, i) => {
    if (glacierSnowSpawned[i]) return;
    const hSpeed = 2.8 + (s.drift || 0);
    if (hSpeed < 0.6) return;
    const x = ship.x + (s.dist - zone) * hSpeed / 0.28;
    const r = s.r || 40;
    const portalLimit = portalX == null ? Infinity : portalX - 80;
    if (x > portalLimit) return;
    if (x > W + 640) return;
    if (x < W + r + 12) {
      glacierSnowSpawned[i] = true;
      return;
    }
    glacierSnowSpawned[i] = true;
    pushScatteredSnowball(x, s.lane, s.vy, s.drift, r);
  });
}

function spawnIceBergCluster(x) {
  const th = currentTheme();
  const entry = th.iceBergPattern[iceBergPatternIndex % th.iceBergPattern.length];
  iceBergPatternIndex++;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  if (entry.snowballs) {
    for (const s of entry.snowballs) {
      const r = s.r;
      const laneY = PLAY_TOP + r + 70 + s.lane * (playHeight - r * 2 - 140);
      gates.push({
        type: 'snowball',
        x: x + (s.xJitter || 0),
        y: -r - 16,
        laneY,
        r,
        vy: s.vy,
        drift: s.drift != null ? s.drift : 0.9,
        falling: false,
        passed: false
      });
    }
    return entry.spacing;
  }
  if (entry.gusts) {
    for (const s of entry.gusts) {
      const halfH = s.height / 2;
      const y = PLAY_TOP + s.yFrac * playHeight;
      gates.push({
        type: 'snowgust',
        x: x + s.width / 2 + 30 + (s.xJitter || 0),
        y: Math.max(PLAY_TOP + halfH + 24, Math.min(PLAY_BOTTOM - halfH - 24, y)),
        width: s.width,
        height: s.height,
        push: s.push >= 0 ? 0.55 : -0.55,
        passed: false
      });
    }
    return entry.spacing;
  }
  if (entry.arches) {
    for (const a of entry.arches) {
      const fromTop = a.anchor === 'top';
      const height = Math.min(Math.max(280, a.heightFrac * playHeight), playHeight - 170);
      const root = fromTop ? PLAY_TOP : PLAY_BOTTOM;
      const tip = fromTop ? root + height : root - height;
      const holeH = Math.min(a.holeH || 140, height * 0.4);
      const holeW = Math.min(a.holeW || 150, a.width * 0.56);
      const crown = 70;
      const holeY = fromTop ? tip - crown - holeH / 2 : tip + crown + holeH / 2;
      gates.push({
        type: 'icearch',
        anchor: fromTop ? 'top' : 'bottom',
        x: x + (a.xJitter || 0),
        y: (root + tip) / 2,
        width: a.width,
        height,
        holeY,
        holeW,
        holeH,
        passed: false
      });
    }
    return entry.spacing;
  }
  if (entry.calving) {
    const minR = 34, maxR = 48;
    for (const a of entry.calving) {
      const r = minR + a.rFrac * (maxR - minR);
      const y = PLAY_TOP + a.yFrac * playHeight;
      gates.push({
        type: 'asteroid',
        x: x + (a.xJitter || 0),
        y: Math.max(PLAY_TOP + r + 36, Math.min(PLAY_BOTTOM - r - 180, y)),
        r,
        rotSeed: 0,
        spin: 0,
        vy: 0,
        berg: true,
        calving: true,
        calved: false,
        passed: false
      });
    }
    return entry.spacing;
  }
  if (!entry.bergs) return entry.spacing;
  const minR = 26, maxR = 44;
  for (const a of entry.bergs) {
    const r = minR + a.rFrac * (maxR - minR);
    const y = PLAY_TOP + a.yFrac * playHeight;
    gates.push({
      type: 'asteroid',
      x: x + (a.xJitter || 0),
      y: Math.max(PLAY_TOP + r + 28, Math.min(PLAY_BOTTOM - r - 28, y)),
      r: r,
      rotSeed: a.xJitter || a.yFrac,
      spin: 0.006,
      vy: a.vy || 0,
      berg: true,
      passed: false
    });
  }
  return entry.spacing;
}

function spawnFireball() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 24;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  const baseY = PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2);
  gates.push({
    type: 'fireball',
    x: W + 50,
    baseY: baseY,
    r: 10 + entry.rFrac * 12,
    passed: false
  });
  return entry.interval;
}

function spawnExtraFireball() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 24;

  const entry = th.extraFireballPattern[extraFireballPatternIndex % th.extraFireballPattern.length];
  extraFireballPatternIndex++;

  const baseY = PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2);
  gates.push({
    type: 'fireball',
    x: W + 50,
    baseY: baseY,
    r: 10 + entry.rFrac * 12,
    passed: false
  });
  return entry.interval;
}

function liveFireballY(g) {
  // straight horizontal line, fixed height -- matches Bowser's fire breath
  // (not the bouncing floor-fire enemy, which is a different thing)
  return g.baseY;
}

function spawnExtraToxicPool() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 28;

  const entry = th.extraToxicPoolPattern[extraToxicPatternIndex % th.extraToxicPoolPattern.length];
  extraToxicPatternIndex++;

  gates.push({
    type: 'toxicpool',
    x: W + 50,
    y: PLAY_TOP + margin + entry.yFrac * Math.max(1, playHeight - margin * 2),
    baseR: entry.baseRadiusPx,
    pulseAmp: entry.pulseAmpPx,
    pulseFreq: entry.pulseFreq,
    pulsePhase: entry.pulsePhase,
    passed: false
  });
  return entry.interval;
}

function liveToxicPoolRadius(g) {
  return Math.max(4, g.baseR + g.pulseAmp * Math.sin((frame - zoneStartFrame) * g.pulseFreq + g.pulsePhase));
}

function spawnExtraGeyser() {
  const th = currentTheme();

  const entry = th.extraGeyserPattern[extraGeyserPatternIndex % th.extraGeyserPattern.length];
  extraGeyserPatternIndex++;

  let spawnX = W + 50;
  const zoneDist = distance - zoneStartDistance;
  const nudges = th.extraGeyserNudges || [];
  for (let i = 0; i < nudges.length; i++) {
    const n = nudges[i];
    if (n.pivotSide && n.pivotSide !== entry.pivotSide) continue;
    if (zoneDist < (n.minDistance || 0) || zoneDist > (n.maxDistance == null ? 1e9 : n.maxDistance)) continue;
    spawnX += n.xOffsetPx || 0;
  }

  gates.push({
    type: 'geyser',
    x: spawnX,
    spawnFrame: frame,
    pivotSide: entry.pivotSide,
    lowHeight: entry.lowHeightPx,
    highHeight: entry.highHeightPx,
    width: entry.widthPx,
    warningFrames: entry.warningFrames,
    riseFrames: entry.riseFrames,
    holdFrames: entry.holdFrames,
    fallFrames: entry.fallFrames,
    restFrames: entry.restFrames,
    phaseOffset: entry.phaseOffset,
    passed: false
  });
  return entry.interval;
}

function geyserCycleLength(g) {
  return g.warningFrames + g.riseFrames + g.holdFrames + g.fallFrames + g.restFrames;
}

function geyserPhase(g) {
  const cycle = geyserCycleLength(g);
  return ((frame - g.spawnFrame + g.phaseOffset) % cycle + cycle) % cycle;
}

function liveGeyserHeight(g) {
  const phase = geyserPhase(g);
  let t = phase;
  if (t < g.warningFrames) return g.lowHeight;
  t -= g.warningFrames;
  if (t < g.riseFrames) return g.lowHeight + (g.highHeight - g.lowHeight) * (t / g.riseFrames);
  t -= g.riseFrames;
  if (t < g.holdFrames) return g.highHeight;
  t -= g.holdFrames;
  if (t < g.fallFrames) return g.highHeight - (g.highHeight - g.lowHeight) * (t / g.fallFrames);
  return g.lowHeight;
}

function geyserIsWarning(g) {
  return geyserPhase(g) < g.warningFrames;
}

function spawnExtraMovingDoor() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 20;

  const entry = th.movingDoorPattern[extraMovingDoorPatternIndex % th.movingDoorPattern.length];
  extraMovingDoorPatternIndex++;

  const doorX = W + 60;

  // clear any wreckage that already spawned too close to where the door
  // is about to appear -- purely cosmetic (keeps floating rocks from
  // ending up visually on top of the door), done here instead of as a
  // spawn-delaying check so the door's own timing stays deterministic
  gates = gates.filter(g => g.type !== 'wreckage' || Math.abs(g.x - doorX) >= g.r + 45);

  gates.push({
    type: 'movingdoor',
    x: doorX,
    spawnFrame: frame,
    gaps: entry.gaps,
    amplitude: entry.amplitudeFrac * playHeight,
    freq: entry.freq,
    phase: entry.phase,
    width: entry.widthPx,
    margin: margin,
    passed: false
  });
  return entry.interval;
}

function liveDoorOffset(g) {
  return g.amplitude * Math.sin((frame - g.spawnFrame) * g.freq + g.phase);
}

function liveDoorGapRanges(g) {
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const offset = liveDoorOffset(g);
  return g.gaps.map(gap => {
    const centerY = PLAY_TOP + gap.centerFrac * playHeight + offset;
    const halfH = (gap.heightFrac * playHeight) / 2;
    return { top: centerY - halfH, bottom: centerY + halfH };
  });
}

function spawnExtraSparkHub() {
  const th = currentTheme();

  const entry = th.extraSparkHubPattern[extraHubPatternIndex % th.extraSparkHubPattern.length];
  extraHubPatternIndex++;

  const y = entry.mountSide === 'ceiling'
    ? PLAY_TOP + entry.towerLength
    : PLAY_BOTTOM - entry.towerLength;

  let hubX = W + 60;
  const nearbyDoor = gates
    .filter(g => g.type === 'movingdoor' && Math.abs(g.x - hubX) < 120)
    .sort((a, b) => Math.abs(a.x - hubX) - Math.abs(b.x - hubX))[0];
  if (nearbyDoor) {
    // Keep the tower clearly to the left of a nearby moving door. The hub's
    // outer spikes reach about 17px from center; this leaves another 24px of
    // visible air beyond the door's edge.
    hubX = nearbyDoor.x - nearbyDoor.width / 2 - 17 - 24;
  }

  gates.push({
    type: 'sparkhub',
    x: hubX,
    y: y,
    mountSide: entry.mountSide,
    towerLength: entry.towerLength,
    spawnFrame: frame,
    chargeFrames: entry.chargeFrames,
    restFrames: entry.restFrames,
    projectileSpeed: entry.projectileSpeed,
    projectileR: entry.projectileR,
    hasFiredThisCycle: false,
    passed: false
  });
  return entry.interval;
}

function sparkHubCycleLength(g) {
  return g.chargeFrames + g.restFrames;
}

function sparkHubPhase(g) {
  const cycle = sparkHubCycleLength(g);
  return ((frame - g.spawnFrame) % cycle + cycle) % cycle;
}

function sparkHubIsCharging(g) {
  return sparkHubPhase(g) < g.chargeFrames;
}

function fireSparkBurst(hub) {
  const numSpikes = 8;
  for (let i = 0; i < numSpikes; i++) {
    const angle = (i * Math.PI) / 4;
    gates.push({
      type: 'sparkprojectile',
      x: hub.x,
      baseY: hub.y,
      spawnFrame: frame,
      angle: angle,
      speed: hub.projectileSpeed,
      r: hub.projectileR,
      passed: false
    });
  }
  sfxHazardFire('sparkprojectile');
}

function liveProjectilePos(g) {
  const elapsed = frame - g.spawnFrame;
  const radialDist = g.speed * elapsed;
  return {
    x: g.x + Math.cos(g.angle) * radialDist,
    y: g.baseY + Math.sin(g.angle) * radialDist
  };
}

function liveOrbiterPos(g) {
  const elapsed = frame - g.spawnFrame;
  const angle = g.initialAngle + g.angularSpeed * elapsed;
  return {
    x: g.x + Math.cos(angle) * g.orbitRadius,
    y: g.centerY + Math.sin(angle) * g.orbitRadius
  };
}

function spawnKeyAndDoor(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const entry = th.specialDoorEvents[eventIndex];
  const margin = 30;

  const keyX = ship.x + EVENT_SPAWN_OFFSET;
  const keyY = PLAY_TOP + margin + entry.keyYFrac * Math.max(1, playHeight - margin * 2);
  const keyR = 16;
  const doorGapPx = entry.doorGapPx != null ? entry.doorGapPx : 500;
  const doorX = ship.x + EVENT_SPAWN_OFFSET + doorGapPx;

  // remove any wreckage that already spawned too close to where the key or
  // door is about to appear -- wreckage generates proactively ahead of the
  // ship, independent of when this event's distance trigger fires, so it
  // can end up sitting on this exact spot before the key ever exists to
  // check against
  gates = gates.filter(g => {
    if (g.type === 'movingdoor' && (Math.abs(g.x - keyX) < 90 || Math.abs(g.x - doorX) < 90)) return false;
    if (g.type !== 'wreckage') return true;
    const distToKey = Math.hypot(g.x - keyX, g.y - keyY);
    if (distToKey < g.r + keyR + 20) return false;
    if (Math.abs(g.x - doorX) < g.r + 40) return false;
    return true;
  });

  gates.push({
    type: 'accesskey',
    x: keyX,
    y: keyY,
    r: keyR,
    eventIndex: eventIndex,
    passed: false
  });

  gates.push({
    type: 'specialdoor',
    x: doorX,
    width: 34,
    eventIndex: eventIndex,
    passed: false
  });
}

function spawnExtraShootingStar() {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 30;

  const entry = th.extraShootingStarPattern[extraStarPatternIndex % th.extraShootingStarPattern.length];
  extraStarPatternIndex++;

  const startY = PLAY_TOP + margin + entry.startYFrac * Math.max(1, playHeight - margin * 2);
  const endY = PLAY_TOP + margin + entry.endYFrac * Math.max(1, playHeight - margin * 2);

  // guarantee the diagonal motion continues until the star has actually
  // scrolled off-screen (never pops out mid-flight), regardless of the
  // current viewport width -- computed dynamically rather than relying on
  // pattern data being tuned for one assumed screen size
  const effScroll = SCROLL_SPEED * (th.scrollMult || 1);
  const spawnX = W + 60;
  const minLifeForOffscreen = (spawnX + 80 + entry.radiusPx) / effScroll;
  const life = Math.max(entry.lifeFrames, minLifeForOffscreen);

  gates.push({
    type: 'shootingstar',
    x: spawnX,
    spawnFrame: frame,
    startY: startY,
    endY: endY,
    life: life,
    r: entry.radiusPx,
    passed: false
  });
  return entry.interval;
}

function liveShootingStarY(g) {
  const t = Math.min(1, (frame - g.spawnFrame) / g.life);
  // pure straight-line diagonal, no arc/curve
  return g.startY + (g.endY - g.startY) * t;
}

function shootingStarDone(g) {
  return (frame - g.spawnFrame) >= g.life;
}

function spawnOncomingCometEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const margin = 30;
  const entry = th.oncomingCometEvents[eventIndex];
  const startY = PLAY_TOP + margin + entry.startYFrac * Math.max(1, playHeight - margin * 2);
  const endY = PLAY_TOP + margin + entry.endYFrac * Math.max(1, playHeight - margin * 2);
  const spawnX = -80 - entry.radiusPx * 9;
  const life = Math.max(220, (W + 140 - spawnX) / entry.vx);
  gates.push({
    type: 'shootingstar',
    oncoming: true,
    x: spawnX,
    vx: entry.vx,
    spawnFrame: frame,
    startY: startY,
    endY: endY,
    life: life,
    r: entry.radiusPx,
    passed: false
  });
}

function spawnSplitRockEvent(eventIndex) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const entry = th.splitRockEvents[eventIndex];
  let spawnX = ship.x + EVENT_SPAWN_OFFSET;
  const portalX = predictedPortalX();
  if (portalX != null) spawnX = Math.min(spawnX, portalX - 48 - entry.r);
  const y = Math.max(PLAY_TOP + entry.r + 16, Math.min(PLAY_BOTTOM - entry.r - 16, PLAY_TOP + entry.yFrac * playHeight));
  gates.push({
    type: 'splitrock',
    x: spawnX,
    y: y,
    r: entry.r,
    splitAtPx: entry.splitAtPx,
    telegraphFrames: entry.telegraphFrames,
    cracking: false,
    crackFrame: -1,
    rotSeed: eventIndex * 3.1,
    spin: 0.018,
    passed: false
  });
}

function splitRockIntoShards(g) {
  const r = Math.max(12, g.r * 0.52);
  gates.push({
    type: 'asteroid',
    x: g.x - 8,
    y: g.y - 6,
    r: r,
    rotSeed: g.rotSeed,
    spin: 0.03,
    vy: -1.6,
    passed: false
  });
  gates.push({
    type: 'asteroid',
    x: g.x + 10,
    y: g.y + 6,
    r: r,
    rotSeed: g.rotSeed + 2.2,
    spin: -0.032,
    vy: 1.6,
    passed: false
  });
  if (!ghostMode) playAsteroidCrunch();
}

function spawnAcidDrip(x) {
  const th = currentTheme();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;

  const entry = th.pattern[patternIndex % th.pattern.length];
  patternIndex++;

  let fallFrac = entry.targetFallFrac;
  const zoneDist = distance - zoneStartDistance;
  const atShipDist = zoneDist + Math.max(0, x - ship.x) * 0.1;
  const dripNudges = th.acidDripNudges || [];
  for (let i = 0; i < dripNudges.length; i++) {
    const n = dripNudges[i];
    const d0 = n.minAtShipDistance != null ? n.minAtShipDistance : (n.minDistance || 0);
    const d1 = n.maxAtShipDistance != null ? n.maxAtShipDistance : (n.maxDistance == null ? 1e9 : n.maxDistance);
    const dist = (n.minAtShipDistance != null || n.maxAtShipDistance != null) ? atShipDist : zoneDist;
    if (dist < d0 || dist > d1) continue;
    if (n.targetFallFrac != null) fallFrac = n.targetFallFrac;
  }

  const effScroll = SCROLL_SPEED * (th.scrollMult || 1);
  const distanceToShip = Math.max(100, x - ship.x);
  const framesToReachShip = distanceToShip / effScroll;
  const fallSpeed = (playHeight * fallFrac) / framesToReachShip;

  gates.push({
    type: 'aciddrip',
    x: x,
    startY: PLAY_TOP,
    spawnFrame: frame,
    fallSpeed: fallSpeed,
    r: entry.radiusPx,
    passed: false
  });
  return entry.spacing;
}

function liveAcidDripY(g) {
  return g.startY + g.fallSpeed * (frame - g.spawnFrame);
}

const EDITOR_LEVEL_LENGTH = 3200;
const EDITOR_SAMPLE_SPACING = 20;
const EDITOR_MIN_GAP_FRAC = 0.12;

let customTerrainZone2 = null;
let useCustomTerrain = false;
let terrainLevelX = 0;

function defaultCustomTerrain() {
  const n = Math.floor(EDITOR_LEVEL_LENGTH / EDITOR_SAMPLE_SPACING) + 1;
  const arr = [];
  for (let i = 0; i < n; i++) arr.push({ topFrac: 0.2, bottomFrac: 0.8 });
  return arr;
}

async function loadCustomTerrain() {
  try {
    const result = await window.storage.get('zone4-terrain-custom');
    if (result && result.value) {
      customTerrainZone2 = JSON.parse(result.value);
      useCustomTerrain = true;
    } else {
      customTerrainZone2 = defaultCustomTerrain();
      useCustomTerrain = false;
    }
  } catch (e) {
    customTerrainZone2 = defaultCustomTerrain();
    useCustomTerrain = false;
  }
}

async function saveCustomTerrain() {
  try {
    await window.storage.set('zone4-terrain-custom', JSON.stringify(customTerrainZone2));
    useCustomTerrain = true;
    return true;
  } catch (e) {
    return false;
  }
}

function sampleCustomTerrain(levelX) {
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

function initTerrain() {
  const th = currentTheme();
  const spacing = th.terrainSpacing || 34;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  // start fully open no matter where the ship enters vertically -- the existing
  // entry ramp (see addTerrainSegment) then funnels this down to the real cave width
  const wideGap = playHeight * 0.9;
  const minCenter = PLAY_TOP + wideGap / 2;
  const maxCenter = PLAY_BOTTOM - wideGap / 2;
  const startCenter = Math.max(minCenter, Math.min(maxCenter, ship.y));
  const startTop = startCenter - wideGap / 2;
  const startBottom = startCenter + wideGap / 2;

  terrainSegments = [];
  terrainSegmentsSinceEntry = 0;
  patternIndex = 0;
  terrainLevelX = 0;
  terrainWaypointTarget = null;
  terrainWaypointSegLeft = 0;
  terrainWaypointSegTotal = 1;
  terrainWaypointGapTarget = null;
  terrainWaypointIslandTarget = 0;
  terrainWaypointIslandFrom = 0;
  terrainWaypointNosePower = 1;
  terrainWaypointTaperShare = 0.32;
  terrainWaypointTaperCap = 5;
  terrainWaypointIslandShape = '';
  terrainWaypointIslandLabel = '';
  terrainWaypointIslandBias = 0;
  terrainMeanderIndex = 0;
  if (th.iceChunks) {
    // Distance 0 is open sky. Walls sit off screen, and nothing is placed
    // where it would reach the ship before distance 50.
    const openGap = playHeight + 160;
    const center = PLAY_TOP + playHeight * 0.5;
    const top = center - openGap / 2;
    const bottom = center + openGap / 2;
    terrainSegmentsSinceEntry = 16;
    terrainSegments.push({
      x: -spacing, topY: top, bottomY: bottom, baseTop: top, baseBottom: bottom,
      islandTop: center, islandBottom: center, islandShape: '', islandLabel: '', field: 'floe'
    });
    let guard = 0;
    // Keep a stretch of course off the right edge so objects can be born there.
    while (terrainSegments[terrainSegments.length - 1].x < W + 760 && guard++ < 400) {
      addTerrainSegment();
    }
    // Nothing reaches the ship before distance 50, and nothing is placed
    // on the visible screen. Centers start past the right edge and scroll in.
    const clearX = ship.x + Math.max(0, 50 - (distance - zoneStartDistance)) * 10 + 170;
    let fx = Math.max(clearX, W + 180);
    let spawned = 0;
    while (fx < W + 760 && spawned++ < 12) {
      let field = '';
      for (let i = terrainSegments.length - 1; i >= 0; i--) {
        if (terrainSegments[i].x <= fx) { field = terrainSegments[i].field || ''; break; }
      }
      if (field !== 'floe') break;
      fx += spawnIceFloeCluster(fx);
    }
    iceChunkSpawnX = fx;
    return;
  }
  for (let x = -spacing; x <= W + spacing; x += spacing) {
    terrainSegments.push({ x, topY: startTop, bottomY: startBottom, islandTop: startCenter, islandBottom: startCenter });
    terrainSegmentsSinceEntry++;
  }
}

let glacierCeilingFacets = null;
let glacierFloorFacets = null;
function glacierFacetRun(pairs) {
  const out = [];
  for (let i = 0; i < pairs.length; i += 2) {
    for (let n = 0; n < pairs[i + 1]; n++) out.push(pairs[i]);
  }
  return out;
}
function glacierBeatAt(segmentX) {
  // HUD distance when this segment reaches the ship. 1 distance = 10px of scroll.
  const arrival = (distance - zoneStartDistance) + (segmentX - ship.x) * 0.1;
  if (!glacierCeilingFacets) {
    glacierCeilingFacets = glacierFacetRun([
      0.50, 3, 0.40, 2, 0.32, 2,
      0.28, 5, 0.36, 2, 0.29, 4, 0.40, 2,
      0.28, 6, 0.34, 3, 0.30, 4, 0.43, 2,
      0.28, 5, 0.37, 3, 0.31, 4, 0.28, 3,
      0.39, 2, 0.30, 5, 0.35, 2, 0.28, 4,
      0.36, 2, 0.46, 2
    ]);
    glacierFloorFacets = glacierFacetRun([
      0.62, 2, 0.73, 3,
      0.70, 6, 0.62, 2, 0.73, 4, 0.66, 3,
      0.72, 5, 0.64, 2, 0.73, 4, 0.68, 3, 0.71, 2,
      0.68, 2, 0.73, 2, 0.64, 2, 0.71, 3,
      0.66, 2, 0.73, 2, 0.60, 2, 0.69, 3,
      0.73, 2, 0.65, 2, 0.72, 4, 0.67, 2
    ]);
  }
  const pick = (list, start) => {
    const i = Math.max(0, Math.floor((arrival - start) * 10 / 42));
    return list[Math.min(list.length - 1, i)];
  };
  // Open until 350, cave through 650, then open sky to the portal.
  // 650 is when the ship is still inside. The walls open after that.
  // The cave rides the ceiling first and the floor second.
  if (arrival < 260) return { open: true, field: 'floe', centerFrac: 0.5, top: 0, bottom: 0 };
  if (arrival < 290) return { open: true, field: '', centerFrac: 0.5, top: 0, bottom: 0 };
  if (arrival < 500) return { open: false, field: '', centerFrac: pick(glacierCeilingFacets, 290), top: 0, bottom: 0 };
  if (arrival < 650) return { open: false, field: '', centerFrac: pick(glacierFloorFacets, 500), top: 0, bottom: 0 };
  // Hold the first snowballs until the mouth is opening, then keep them
  // falling for the rest of the open stretch.
  if (arrival < 730) return { open: true, field: '', centerFrac: 0.5, top: 0, bottom: 0, mound: 0 };
  // Rounded snow dunes. Each point is a crest or a dip; the blend
  // between them is smooth, and the heights and widths don't repeat.
  const peaks = [
    [0, 0],
    [42, 70],
    [88, 170],
    [124, 95],
    [168, 28],
    [214, 150],
    [252, 210],
    [310, 40]
  ];
  const x = arrival - 748;
  let mound = 0;
  if (x > 0) {
    let i = 0;
    while (i < peaks.length - 1 && x > peaks[i + 1][0]) i++;
    const a = peaks[i];
    const b = peaks[Math.min(peaks.length - 1, i + 1)];
    const span = Math.max(1, b[0] - a[0]);
    const t = Math.max(0, Math.min(1, (x - a[0]) / span));
    const s = 0.5 - 0.5 * Math.cos(Math.PI * t);
    mound = a[1] + (b[1] - a[1]) * s;
  }
  return { open: true, field: 'berg', centerFrac: 0.5, top: 0, bottom: 0, mound };
}

function addTerrainSegment() {
  const th = currentTheme();
  const spacing = th.terrainSpacing || 34;
  const last = terrainSegments[terrainSegments.length - 1];
  // Glacier teeth are local. Steering from the notched wall makes the next
  // segment treat a spike as the new cave and stacks the following tooth on it.
  const steerTop = last.baseTop != null ? last.baseTop : last.topY;
  const steerBottom = last.baseBottom != null ? last.baseBottom : last.bottomY;
  let segmentField = '';
  const margin = 20;
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  terrainSegmentsSinceEntry++;
  terrainLevelX += spacing;

  // flat, fully-open runway for the first few segments after entering the zone,
  // then ramp toward the target shape over the following segments
  const rampFactor = Math.max(0, Math.min(1, (terrainSegmentsSinceEntry - 4) / 11));

  let targetTop, targetBottom, targetIslandTop, targetIslandBottom;
  if (useCustomTerrain && th.obstacleShape === 'terrain' && customTerrainZone2) {
    const loopX = terrainLevelX % EDITOR_LEVEL_LENGTH;
    const sample = sampleCustomTerrain(loopX);
    targetTop = PLAY_TOP + sample.topFrac * playHeight;
    targetBottom = PLAY_TOP + sample.bottomFrac * playHeight;
    targetIslandTop = (targetTop + targetBottom) / 2;
    targetIslandBottom = targetIslandTop; // custom hand-drawn levels don't support forks yet
  } else {
    const baseGap = currentGapSize();

    // pathing analysis: figure out how fast the ship can actually climb/dive
    // (in px per segment, at this theme's physics and scroll speed), then spread
    // each waypoint transition across enough segments to stay within that limit
    const effScroll = SCROLL_SPEED * (th.scrollMult || 1);
    const framesPerSegment = spacing / effScroll;
    const maxClimbSpeed = Math.abs(MAX_RISE_SPEED * th.liftMult);
    const maxDiveSpeed = MAX_FALL_SPEED * th.gravityMult;
    const safetyFactor = 0.55; // leave headroom for reaction time, not just raw capability
    const maxDeltaPerSegment = Math.min(maxClimbSpeed, maxDiveSpeed) * framesPerSegment * safetyFactor;
    const lastCenterNow = (steerTop + steerBottom) / 2;
    const lastGapNow = steerBottom - steerTop;

    if (portalObject) {
      // funnel wide open for a clean run into the portal, instead of
      // continuing to generate normal (possibly tight) cave shape.
      // Glacier's open sky is already wider than that funnel; don't pull
      // the walls back in over the berg field.
      const wideGap = playHeight * 0.9;
      if (th.iceChunks && (lastGapNow > wideGap || last.field === 'berg')) {
        targetTop = steerTop;
        targetBottom = steerBottom;
        targetIslandTop = lastCenterNow;
        targetIslandBottom = lastCenterNow;
        segmentField = last.field || '';
      } else {
        const minCenter = PLAY_TOP + wideGap / 2;
        const maxCenter = PLAY_BOTTOM - wideGap / 2;
        const target = Math.max(minCenter, Math.min(maxCenter, lastCenterNow));
        const nextCenter = lastCenterNow + (target - lastCenterNow) * 0.35;
        targetTop = nextCenter - wideGap / 2;
        targetBottom = nextCenter + wideGap / 2;
        targetIslandTop = nextCenter;
        targetIslandBottom = nextCenter;
      }
    } else if (th.iceChunks) {
      const course = glacierBeatAt(last.x + spacing);
      segmentField = course.open ? (course.field || '') : '';
      const openGap = playHeight + 160;
      const wantGap = course.open ? openGap : baseGap;
      const clampGap = course.open ? playHeight : baseGap;
      const minCenter = PLAY_TOP + clampGap / 2 + (course.open ? 0 : margin);
      const maxCenter = PLAY_BOTTOM - clampGap / 2 - (course.open ? 0 : margin);
      const rawTarget = PLAY_TOP + course.centerFrac * playHeight;
      const targetCenter = Math.max(minCenter, Math.min(maxCenter, rawTarget));
      let nextTop = targetCenter - wantGap / 2;
      let nextBottom = targetCenter + wantGap / 2;
      if (course.open && course.mound > 0) nextBottom = PLAY_BOTTOM - course.mound;
      const dTop = nextTop - steerTop;
      const dBot = nextBottom - steerBottom;
      const scale = Math.max(1, Math.abs(dTop) / maxDeltaPerSegment, Math.abs(dBot) / maxDeltaPerSegment);
      targetTop = steerTop + dTop / scale;
      targetBottom = steerBottom + dBot / scale;
      const nextCenter = (targetTop + targetBottom) / 2;
      targetIslandTop = nextCenter;
      targetIslandBottom = nextCenter;
      terrainWaypointSegLeft = 0;
    } else {

    if (terrainWaypointSegLeft <= 0) {
      const pattern = terrainPattern(th);
      const upcoming = pattern[patternIndex % pattern.length];
      const genDistance = (terrainLevelX + W) / 10;
      let entry = upcoming;
      let consumePattern = true;
      if (upcoming.startDistance != null && genDistance < upcoming.startDistance) {
        const meander = upcoming.meander || [
          { centerFrac: 0.82 }, { centerFrac: 0.73 },
          { centerFrac: 0.75 }, { centerFrac: 0.78 }, { centerFrac: 0.62 },
          { centerFrac: 0.72 }, { centerFrac: 0.63 }, { centerFrac: 0.48 },
          { centerFrac: 0.63 }
        ];
        entry = meander[terrainMeanderIndex % meander.length];
        terrainMeanderIndex++;
        consumePattern = false;
      }
      if (consumePattern) {
        patternIndex++;
        terrainMeanderIndex = 0;
      }

      const gapMult = entry.gapMult !== undefined ? entry.gapMult : 1;
      const entryGap = baseGap * gapMult;
      const minCenter = PLAY_TOP + entryGap / 2 + margin;
      const maxCenter = PLAY_BOTTOM - entryGap / 2 - margin;
      const rawTarget = PLAY_TOP + entry.centerFrac * playHeight;
      terrainWaypointTarget = Math.max(minCenter, Math.min(maxCenter, rawTarget));
      const outerPadPx = (entry.fork && entry.fork.outerPadPx) ? entry.fork.outerPadPx : 0;
      terrainWaypointGapTarget = entryGap + outerPadPx * 2;

      if (entry.fork) {
        const islandFracRaw = entry.fork.islandFrac;
        const islandFrac = Math.min(0.45, islandFracRaw == null ? 0.3 : islandFracRaw);
        terrainWaypointIslandTarget = islandFrac > 0 ? Math.max(0, entryGap * islandFrac - SHIP_H * 2) : 0;
      } else {
        terrainWaypointIslandTarget = 0;
      }

      const holdLastCenter = (steerTop + steerBottom) / 2;
      const fullDelta = Math.abs(terrainWaypointTarget - holdLastCenter);
      terrainWaypointSegLeft = Math.max(1, Math.ceil(fullDelta / Math.max(1, maxDeltaPerSegment)));
      if (entry.fork) terrainWaypointSegLeft = Math.max(terrainWaypointSegLeft, 10);
      terrainWaypointSegTotal = terrainWaypointSegLeft;
      terrainWaypointIslandFrom = Math.max(0, last.islandBottom - last.islandTop);
      terrainWaypointNosePower = (entry.fork && entry.fork.nosePower) ? entry.fork.nosePower : 1;
      terrainWaypointTaperShare = (entry.fork && entry.fork.noseTaper) ? entry.fork.noseTaper : 0.32;
      terrainWaypointTaperCap = (entry.fork && entry.fork.noseTaperSegs) ? entry.fork.noseTaperSegs : 5;
      terrainWaypointIslandShape = (entry.fork && entry.fork.shape) ? entry.fork.shape : '';
      terrainWaypointIslandLabel = (entry.fork && entry.fork.label) ? entry.fork.label : '';
      terrainWaypointIslandBias = (entry.fork && entry.fork.islandBias) ? entry.fork.islandBias : 0;
    }

    const lastCenter = (steerTop + steerBottom) / 2;
    const lastGap = steerBottom - steerTop;

    const centerStep = (terrainWaypointTarget - lastCenter) / terrainWaypointSegLeft;
    const gapStep = (terrainWaypointGapTarget - lastGap) / terrainWaypointSegLeft;
    const islandT = 1 - (terrainWaypointSegLeft - 1) / Math.max(1, terrainWaypointSegTotal);
    const islandFrom = terrainWaypointIslandFrom;
    const islandTo = terrainWaypointIslandTarget;
    const clampedT = Math.max(0, Math.min(1, islandT));
    const taperSegs = Math.min(terrainWaypointTaperCap, terrainWaypointSegTotal, Math.max(3, Math.ceil(terrainWaypointSegTotal * terrainWaypointTaperShare)));
    const taperFrac = taperSegs / Math.max(1, terrainWaypointSegTotal);
    let islandU;
    if (islandTo > islandFrom + 0.5) {
      const u = clampedT >= taperFrac ? 1 : clampedT / taperFrac;
      islandU = Math.pow(u, terrainWaypointNosePower);
    } else if (islandTo < islandFrom - 0.5) {
      const tailStart = 1 - taperFrac;
      islandU = clampedT <= tailStart ? 0 : (clampedT - tailStart) / taperFrac;
    } else {
      islandU = clampedT;
    }
    const nextCenter = lastCenter + centerStep;
    const nextGap = lastGap + gapStep;
    const nextIsland = Math.min(
      Math.max(0, nextGap * 0.30),
      Math.max(0, islandFrom + (islandTo - islandFrom) * islandU)
    );
    terrainWaypointSegLeft--;

    targetTop = nextCenter - nextGap / 2;
    targetBottom = nextCenter + nextGap / 2;
    let islandTop = nextCenter - nextIsland / 2;
    let islandBottom = nextCenter + nextIsland / 2;
    const shape = terrainWaypointIslandShape;
    if (shape === 'hull' && islandTo > islandFrom + 0.5 && nextIsland > 1) {
      const cut = (1 - islandU) * nextIsland * 0.42;
      islandTop += cut;
    } else if (shape === 'hex' && islandTo > islandFrom + 0.5 && nextIsland > 1) {
      const u = Math.min(1, clampedT / Math.max(0.001, taperFrac));
      const cut = (1 - u) * nextIsland * 0.18;
      islandTop += cut;
      islandBottom -= cut;
    }
    if (terrainWaypointIslandBias && nextIsland > 1) {
      const room = Math.max(0, nextGap - nextIsland);
      const shift = terrainWaypointIslandBias * room * 0.45;
      islandTop += shift;
      islandBottom += shift;
    }
    targetIslandTop = islandTop;
    targetIslandBottom = islandBottom;
    }
  }

  // safety clamp: keep a minimum gap and stay within the play area
  const minGapPx = EDITOR_MIN_GAP_FRAC * playHeight;
  if (targetBottom - targetTop < minGapPx) {
    const mid = (targetTop + targetBottom) / 2;
    targetTop = mid - minGapPx / 2;
    targetBottom = mid + minGapPx / 2;
  }
  const openSky = th.iceChunks && (targetBottom - targetTop) > playHeight * 0.65;
  if (!openSky) {
    targetTop = Math.max(PLAY_TOP + margin, targetTop);
    targetBottom = Math.min(PLAY_BOTTOM - margin, targetBottom);
  }

  // safety clamp: if a fork's island would leave either path too narrow to fly, shrink the island
  const minPathPx = minGapPx * 1.1;
  if (targetIslandBottom > targetIslandTop) {
    const upperPath = targetIslandTop - targetTop;
    const lowerPath = targetBottom - targetIslandBottom;
    if (upperPath < minPathPx || lowerPath < minPathPx) {
      const islandCenter = (targetIslandTop + targetIslandBottom) / 2;
      const maxIslandHeight = Math.max(0, (targetBottom - targetTop) - minPathPx * 2);
      const halfIsland = maxIslandHeight / 2;
      targetIslandTop = islandCenter - halfIsland;
      targetIslandBottom = islandCenter + halfIsland;
    }
  }

  let nextTop = steerTop + (targetTop - steerTop) * rampFactor;
  let nextBottom = steerBottom + (targetBottom - steerBottom) * rampFactor;
  const baseTopY = nextTop;
  const baseBottomY = nextBottom;
  if (th.iceChunks && !portalObject && rampFactor >= 1 && !openSky) {
    const course = glacierBeatAt(last.x + spacing);
    let topN = course.top;
    let botN = course.bottom;
    const room = (nextBottom - nextTop) - minGapPx;
    const pinch = topN + botN;
    if (pinch > room && pinch > 0) {
      const scale = Math.max(0, room) / pinch;
      topN *= scale;
      botN *= scale;
    }
    nextTop += topN;
    nextBottom -= botN;
    nextTop = Math.max(PLAY_TOP + margin, nextTop);
    nextBottom = Math.min(PLAY_BOTTOM - margin, nextBottom);
    if (nextBottom - nextTop < minGapPx) {
      const mid = (nextTop + nextBottom) / 2;
      nextTop = mid - minGapPx / 2;
      nextBottom = mid + minGapPx / 2;
    }
  }
  const lastIslandCenter = (last.islandTop + last.islandBottom) / 2;
  const nextIslandTop = lastIslandCenter + (targetIslandTop - lastIslandCenter) * rampFactor;
  const nextIslandBottom = lastIslandCenter + (targetIslandBottom - lastIslandCenter) * rampFactor;
  terrainSegments.push({
    x: last.x + spacing,
    topY: nextTop,
    bottomY: nextBottom,
    baseTop: baseTopY,
    baseBottom: baseBottomY,
    islandTop: nextIslandTop,
    islandBottom: nextIslandBottom,
    islandShape: terrainWaypointIslandShape,
    islandLabel: terrainWaypointIslandLabel,
    field: segmentField
  });
}

