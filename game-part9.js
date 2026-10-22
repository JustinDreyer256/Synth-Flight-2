function getPreviewLayout() {
  const h = previewCanvas.height;
  const pTop = 30, pBot = h - 30;
  return { pTop, pBot, pHeight: pBot - pTop, scale: previewScale };
}
// scrolls the preview so a given world-x position is centered in view --
// used after "Add" buttons, since a new hazard's trigger distance can be
// far from wherever the editor is currently scrolled, making it look like
// the click did nothing when it actually added something out of sight
function scrollPreviewTo(worldX) {
  const wrap = document.getElementById('preview-canvas-wrap');
  wrap.scrollLeft = Math.max(0, worldX * previewScale - wrap.clientWidth / 2);
}
// sets the preview status message while preserving scroll position --
// changing this text can reflow the toolbar (longer messages especially),
// which as a side effect can shift the scrollable preview wrapper's own
// scroll position, silently moving the user's view without any object
// actually moving. Used everywhere previewStatus.textContent would
// otherwise be set directly.
function setPreviewStatus(text) {
  const wrap = document.getElementById('preview-canvas-wrap');
  const savedScroll = wrap ? wrap.scrollLeft : null;
  previewStatus.textContent = text;
  if (wrap && savedScroll !== null) {
    wrap.scrollLeft = savedScroll;
    // the reflow this text change triggers can shift scroll asynchronously,
    // after this function already returns -- catch it again post-paint
    requestAnimationFrame(() => { wrap.scrollLeft = savedScroll; });
  }
}
// picks a trigger distance for a newly-added event that's genuinely free,
// rather than max(existing)+increment -- which, once the increment pushed
// past the zone-length cap, would clamp every subsequent add to the exact
// same distance as whatever was already there. Repeated clicks then
// silently stacked new events on top of old ones at an identical position:
// data was added correctly each time, but nothing looked different and
// the view never moved, since the position genuinely hadn't changed.
// Finds the widest gap between existing trigger distances (including the
// zone's start and end as boundaries) and places the new one in the
// middle of it, guaranteeing a distinct position as long as any gap wider
// than the minimum spacing remains.
function findFreeTriggerDistance(existingDistances, zoneMin, zoneMax, minSpacing) {
  const sorted = [zoneMin, ...existingDistances.slice().sort((a, b) => a - b), zoneMax];
  let bestGapStart = zoneMin, bestGapEnd = zoneMax, bestGapSize = -1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapSize = sorted[i + 1] - sorted[i];
    if (gapSize > bestGapSize) { bestGapSize = gapSize; bestGapStart = sorted[i]; bestGapEnd = sorted[i + 1]; }
  }
  const candidate = Math.round((bestGapStart + bestGapEnd) / 2);
  // last-resort fallback if the zone is genuinely saturated -- still
  // distinct from anything currently there, even if uncomfortably close
  if (bestGapSize < minSpacing && existingDistances.length) {
    return Math.min(zoneMax, Math.max(...existingDistances) + minSpacing);
  }
  return candidate;
}
function yToScreenPreview(y, layout) {
  return layout.pTop + ((y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
}
function boltScreenBox(g, layout) {
  const sx = g.x * layout.scale;
  const top = g.y - g.height / 2;
  const bottom = g.y + g.height / 2;
  const left = sx - Math.max(2, g.swingWidth * layout.scale / 2);
  const width = Math.max(4, g.swingWidth * layout.scale);
  const sTop = yToScreenPreview(top, layout);
  const sBottom = yToScreenPreview(bottom, layout);
  return { left, top: sTop, width, height: sBottom - sTop, right: left + width, bottom: sBottom };
}

function updateBoltPanel() {
  const shapeBtn = document.getElementById('preview-bolt-shape');
  const delBtn = document.getElementById('preview-bolt-delete');
  const addBtn = document.getElementById('preview-bolt-add');
  const th = THEMES[currentPreviewZone];
  addBtn.style.display = (th.obstacleShape === 'lbolt' && previewEditMode) ? '' : 'none';
  if (previewSelectedBolt && previewEditMode) {
    const srcBolt = th.pattern[previewSelectedBolt._entryIdx].bolts[previewSelectedBolt._boltIdx];
    shapeBtn.style.display = '';
    delBtn.style.display = '';
    shapeBtn.textContent = 'Shape: ' + srcBolt.shape;
  } else {
    shapeBtn.style.display = 'none';
    delBtn.style.display = 'none';
  }
}

function updateBlackHolePanel() {
  const delBtn = document.getElementById('preview-bh-delete');
  const addBtn = document.getElementById('preview-bh-add');
  const sizeControls = document.getElementById('preview-bh-size-controls');
  const coreInput = document.getElementById('preview-bh-core-input');
  const reachInput = document.getElementById('preview-bh-reach-input');
  const th = THEMES[currentPreviewZone];
  const isBlackHoleZone = !!th.blackHoleEvents;
  addBtn.style.display = (isBlackHoleZone && previewEditMode) ? '' : 'none';
  const hasSelection = isBlackHoleZone && previewEditMode && previewSelectedBlackHole;
  delBtn.style.display = hasSelection ? '' : 'none';
  sizeControls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.blackHoleEvents[previewSelectedBlackHole._eventIdx];
    // only overwrite if not currently focused, so typing isn't interrupted
    if (document.activeElement !== coreInput) coreInput.value = srcEvent.coreR;
    if (document.activeElement !== reachInput) reachInput.value = srcEvent.reachR;
  }
}

function updateWindVortexPanel() {
  const delBtn = document.getElementById('preview-vortex-delete');
  const addBtn = document.getElementById('preview-vortex-add');
  const sizeControls = document.getElementById('preview-vortex-size-controls');
  const reachInput = document.getElementById('preview-vortex-reach-input');
  const th = THEMES[currentPreviewZone];
  const isVortexZone = !!th.windVortexEvents;
  addBtn.style.display = (isVortexZone && previewEditMode) ? '' : 'none';
  const hasSelection = isVortexZone && previewEditMode && previewSelectedWindVortex;
  delBtn.style.display = hasSelection ? '' : 'none';
  sizeControls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.windVortexEvents[previewSelectedWindVortex._vortexIdx];
    if (document.activeElement !== reachInput) reachInput.value = srcEvent.reachR;
  }
}

function updateCloudArcPanel() {
  const delBtn = document.getElementById('preview-arc-delete');
  const addBtn = document.getElementById('preview-arc-add');
  const th = THEMES[currentPreviewZone];
  const isArcZone = !!th.cloudArcEvents;
  addBtn.style.display = (isArcZone && previewEditMode) ? '' : 'none';
  const hasSelection = isArcZone && previewEditMode && previewSelectedCloudArc;
  delBtn.style.display = hasSelection ? '' : 'none';
}

function updateLensingZonePanel() {
  const delBtn = document.getElementById('preview-lens-delete');
  const addBtn = document.getElementById('preview-lens-add');
  const sizeControls = document.getElementById('preview-lens-size-controls');
  const coreInput = document.getElementById('preview-lens-core-input');
  const zoneInput = document.getElementById('preview-lens-zone-input');
  const th = THEMES[currentPreviewZone];
  const isLensingZone = !!th.lensingZoneEvents;
  addBtn.style.display = (isLensingZone && previewEditMode) ? '' : 'none';
  const hasSelection = isLensingZone && previewEditMode && previewSelectedLensingZone;
  delBtn.style.display = hasSelection ? '' : 'none';
  sizeControls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.lensingZoneEvents[previewSelectedLensingZone._lensIdx];
    if (document.activeElement !== coreInput) coreInput.value = srcEvent.coreR;
    if (document.activeElement !== zoneInput) zoneInput.value = srcEvent.zoneRadius;
  }
}

function updateSupernovaPanel() {
  const delBtn = document.getElementById('preview-nova-delete');
  const addBtn = document.getElementById('preview-nova-add');
  const sizeControls = document.getElementById('preview-nova-size-controls');
  const planetInput = document.getElementById('preview-nova-planet-input');
  const dormantInput = document.getElementById('preview-nova-dormant-input');
  const dormantWrap = document.getElementById('preview-nova-dormant-wrap');
  const warningInput = document.getElementById('preview-nova-warning-input');
  const variantBtn = document.getElementById('preview-nova-variant');
  const th = THEMES[currentPreviewZone];
  const isSupernovaZone = !!th.supernovaEvents;
  addBtn.style.display = (isSupernovaZone && previewEditMode) ? '' : 'none';
  const hasSelection = isSupernovaZone && previewEditMode && previewSelectedSupernova;
  delBtn.style.display = hasSelection ? '' : 'none';
  sizeControls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.supernovaEvents[previewSelectedSupernova._novaIdx];
    const variant = srcEvent.variant || 'timer';
    if (document.activeElement !== planetInput) planetInput.value = srcEvent.planetR;
    if (document.activeElement !== dormantInput) dormantInput.value = srcEvent.dormantFrames;
    if (document.activeElement !== warningInput) warningInput.value = srcEvent.warningFrames;
    variantBtn.textContent = 'Variant: ' + (variant === 'onscreen' ? 'On-Screen' : 'Timer');
    // dormant time has no effect on the onscreen variant -- hide it so
    // it doesn't look like a control that should do something
    dormantWrap.style.display = variant === 'onscreen' ? 'none' : 'inline-flex';
  }
}

function updateTurretPanel() {
  const delBtn = document.getElementById('preview-turret-delete');
  const addBtn = document.getElementById('preview-turret-add');
  const controls = document.getElementById('preview-turret-controls');
  const anchorBtn = document.getElementById('preview-turret-anchor');
  const angleInput = document.getElementById('preview-turret-angle-input');
  const shotsInput = document.getElementById('preview-turret-shots-input');
  const intervalInput = document.getElementById('preview-turret-interval-input');
  const th = THEMES[currentPreviewZone];
  const isTurretZone = !!th.turretEvents;
  addBtn.style.display = (isTurretZone && previewEditMode) ? '' : 'none';
  const hasSelection = isTurretZone && previewEditMode && previewSelectedTurret;
  delBtn.style.display = hasSelection ? '' : 'none';
  controls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.turretEvents[previewSelectedTurret._turretIdx];
    anchorBtn.textContent = 'Anchor: ' + (srcEvent.anchor === 'top' ? 'Top' : 'Bottom');
    if (document.activeElement !== angleInput) angleInput.value = srcEvent.fireAngleDeg || 0;
    if (document.activeElement !== shotsInput) shotsInput.value = srcEvent.numShots;
    if (document.activeElement !== intervalInput) intervalInput.value = srcEvent.fireInterval;
  }
}

function updateEmpPanel() {
  const delBtn = document.getElementById('preview-emp-delete');
  const addBtn = document.getElementById('preview-emp-add');
  const controls = document.getElementById('preview-emp-controls');
  const anchorBtn = document.getElementById('preview-emp-anchor');
  const reachInput = document.getElementById('preview-emp-reach-input');
  const chargeInput = document.getElementById('preview-emp-charge-input');
  const dischargeInput = document.getElementById('preview-emp-discharge-input');
  const th = THEMES[currentPreviewZone];
  const isEmpZone = !!th.empEvents;
  addBtn.style.display = (isEmpZone && previewEditMode) ? '' : 'none';
  const hasSelection = isEmpZone && previewEditMode && previewSelectedEmp;
  delBtn.style.display = hasSelection ? '' : 'none';
  controls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.empEvents[previewSelectedEmp._empIdx];
    anchorBtn.textContent = 'Anchor: ' + (srcEvent.anchor === 'top' ? 'Top' : 'Bottom');
    if (document.activeElement !== reachInput) reachInput.value = srcEvent.reachDepth;
    if (document.activeElement !== chargeInput) chargeInput.value = srcEvent.chargeFrames;
    if (document.activeElement !== dischargeInput) dischargeInput.value = srcEvent.dischargeFrames;
  }
}

function updateOrbPanel() {
  const delBtn = document.getElementById('preview-orb-delete');
  const addBtn = document.getElementById('preview-orb-add');
  const controls = document.getElementById('preview-orb-controls');
  const minrInput = document.getElementById('preview-orb-minr-input');
  const maxrInput = document.getElementById('preview-orb-maxr-input');
  const periodInput = document.getElementById('preview-orb-period-input');
  const th = THEMES[currentPreviewZone];
  const isOrbZone = !!th.pulsingOrbEvents;
  addBtn.style.display = (isOrbZone && previewEditMode) ? '' : 'none';
  const hasSelection = isOrbZone && previewEditMode && previewSelectedOrb;
  delBtn.style.display = hasSelection ? '' : 'none';
  controls.style.display = hasSelection ? 'flex' : 'none';
  if (hasSelection) {
    const srcEvent = th.pulsingOrbEvents[previewSelectedOrb._orbIdx];
    if (document.activeElement !== minrInput) minrInput.value = srcEvent.minR;
    if (document.activeElement !== maxrInput) maxrInput.value = srcEvent.maxR;
    if (document.activeElement !== periodInput) periodInput.value = srcEvent.period;
  }
}

document.getElementById('preview-toggle').addEventListener('click', () => {
  previewOverlay.classList.add('active');
  runPreview(currentPreviewZone);
});
document.getElementById('preview-close').addEventListener('click', () => {
  previewOverlay.classList.remove('active');
});
document.querySelectorAll('.preview-zone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.preview-zone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPreviewZone = parseInt(btn.dataset.zone, 10);
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateLensingZonePanel();
    updateSupernovaPanel();
    updateTurretPanel();
    updateEmpPanel();
    updateOrbPanel();
    runPreview(currentPreviewZone);
  });
});

document.getElementById('preview-edit-toggle').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (th.obstacleShape !== 'lbolt' && !th.blackHoleEvents && !th.lensingZoneEvents && !th.supernovaEvents && !th.turretEvents && !th.empEvents && !th.pulsingOrbEvents) {
    setPreviewStatus('Editing only supports floating-bolt, black hole, lensing zone, supernova, turret, EMP, and orb hazards right now.');
    return;
  }
  previewEditMode = !previewEditMode;
  document.getElementById('preview-edit-toggle').textContent = 'Edit Mode: ' + (previewEditMode ? 'On' : 'Off');
  document.getElementById('preview-edit-toggle').style.background = previewEditMode ? 'rgba(157,123,255,0.4)' : '';
  if (!previewEditMode) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
  }
  updateBoltPanel();
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  if (previewLastData) drawZonePreview(previewLastData);
});

document.getElementById('preview-bolt-shape').addEventListener('click', () => {
  if (!previewSelectedBolt) return;
  const th = THEMES[currentPreviewZone];
  const srcBolt = th.pattern[previewSelectedBolt._entryIdx].bolts[previewSelectedBolt._boltIdx];
  const keys = Object.keys(BOLT_SHAPES);
  const idx = keys.indexOf(srcBolt.shape);
  srcBolt.shape = keys[(idx + 1) % keys.length];
  const savedSel = { entryIdx: previewSelectedBolt._entryIdx, boltIdx: previewSelectedBolt._boltIdx };
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedBolt = previewLastData.obstacles.find(g => g._entryIdx === savedSel.entryIdx && g._boltIdx === savedSel.boltIdx) || null;
  updateBoltPanel();
  drawZonePreview(previewLastData);
});

document.getElementById('preview-bolt-delete').addEventListener('click', () => {
  if (!previewSelectedBolt) return;
  const th = THEMES[currentPreviewZone];
  const idx = previewSelectedBolt._entryIdx;
  const entry = th.pattern[idx];
  entry.bolts.splice(previewSelectedBolt._boltIdx, 1);
  if (entry.bolts.length === 0) {
    // this entry's spacing is the gap leading to the NEXT entry -- removing
    // it outright would erase that gap from the cumulative total, shifting
    // every subsequent bolt left to fill the space. fold it into the
    // preceding entry's spacing instead so nothing else moves.
    if (idx === 0) {
      // the very first entry is spawned at a fixed starting position, not
      // reached via any spacing value -- folding its spacing into the last
      // entry only fixes the loop-around point, not this first spawn. leave
      // it in place as an empty placeholder instead: it spawns nothing, but
      // its spacing still correctly carries through to the next entry.
    } else if (th.pattern.length > 1) {
      th.pattern[idx - 1].spacing += entry.spacing;
      th.pattern.splice(idx, 1);
    } else {
      th.pattern.splice(idx, 1);
    }
  }
  previewSelectedBolt = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateBoltPanel();
  drawZonePreview(previewLastData);
});

document.getElementById('preview-bolt-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (th.obstacleShape !== 'lbolt') return;

  let targetEntryIdx, targetBoltIdx;
  const newBoltDefaults = { heightFrac: 0.3, swingWidthPx: 36, shape: 'E1', onFrames: 70, offFrames: 90, phaseFrac: 0.3 };

  if (previewSelectedBolt) {
    // a bolt is selected -- add a sibling to its same pattern entry, so it
    // repeats alongside the existing one at every cycle of that entry
    const entryIdx = previewSelectedBolt._entryIdx;
    const entry = th.pattern[entryIdx];
    const srcBolt = entry.bolts[previewSelectedBolt._boltIdx];
    entry.bolts.push({ ...newBoltDefaults, xJitter: srcBolt.xJitter, yFrac: (srcBolt.yFrac + 0.3) % 1 });
    targetEntryIdx = entryIdx;
    targetBoltIdx = entry.bolts.length - 1;
  } else {
    // nothing selected -- insert a whole new pattern entry (a new "beat" in
    // the cycle) by splitting whichever existing entry has the largest
    // spacing, similar in spirit to how other Add buttons find free room
    let bestIdx = 0, bestSpacing = -1;
    th.pattern.forEach((entry, i) => {
      if (entry.spacing > bestSpacing) { bestSpacing = entry.spacing; bestIdx = i; }
    });
    const splitEntry = th.pattern[bestIdx];
    const half = Math.round(splitEntry.spacing / 2);
    splitEntry.spacing = half;
    th.pattern.splice(bestIdx + 1, 0, { spacing: bestSpacing - half, bolts: [{ ...newBoltDefaults, xJitter: 0, yFrac: 0.5 }] });
    targetEntryIdx = bestIdx + 1;
    targetBoltIdx = 0;
  }

  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  // the pattern repeats several times across the zone -- find() naturally
  // lands on the first, earliest occurrence of the new bolt
  previewSelectedBolt = previewLastData.obstacles.find(g => g.type === 'lbolt' && g._entryIdx === targetEntryIdx && g._boltIdx === targetBoltIdx) || null;
  if (previewSelectedBolt) scrollPreviewTo(previewSelectedBolt.x);
  updateBoltPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Bolt added.');
});

document.getElementById('preview-bh-delete').addEventListener('click', () => {
  if (!previewSelectedBlackHole) return;
  const th = THEMES[currentPreviewZone];
  th.blackHoleEvents.splice(previewSelectedBlackHole._eventIdx, 1);
  previewSelectedBlackHole = null;
  previewSelectedWindVortex = null;
  previewSelectedCloudArc = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Black hole deleted.');
});

document.getElementById('preview-bh-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.blackHoleEvents) return;
  const usedDistances = th.blackHoleEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 950, 100);
  th.blackHoleEvents.push({ triggerDistance: newDistance, yFrac: 0.5, coreR: 80, reachR: 220 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.blackHoleEvents.length - 1;
  previewSelectedBlackHole = previewLastData.obstacles.find(g => g._eventIdx === newIdx) || null;
  if (previewSelectedBlackHole) scrollPreviewTo(previewSelectedBlackHole.x);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Black hole added.');
});

document.getElementById('preview-vortex-delete').addEventListener('click', () => {
  if (!previewSelectedWindVortex) return;
  const th = THEMES[currentPreviewZone];
  th.windVortexEvents.splice(previewSelectedWindVortex._vortexIdx, 1);
  previewSelectedWindVortex = null;
  previewSelectedCloudArc = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Wind vortex deleted.');
});

document.getElementById('preview-vortex-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.windVortexEvents) return;
  const usedDistances = th.windVortexEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 950, 100);
  th.windVortexEvents.push({ triggerDistance: newDistance, yFrac: 0.5, reachR: 220 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.windVortexEvents.length - 1;
  previewSelectedWindVortex = previewLastData.obstacles.find(g => g.type === 'windvortex' && g._vortexIdx === newIdx) || null;
  if (previewSelectedWindVortex) scrollPreviewTo(previewSelectedWindVortex.x);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Wind vortex added.');
});

document.getElementById('preview-arc-delete').addEventListener('click', () => {
  if (!previewSelectedCloudArc) return;
  const th = THEMES[currentPreviewZone];
  th.cloudArcEvents.splice(previewSelectedCloudArc._arcIdx, 1);
  previewSelectedCloudArc = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Cloud arc deleted.');
});

document.getElementById('preview-arc-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.cloudArcEvents) return;
  const usedDistances = th.cloudArcEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 900, 100);
  th.cloudArcEvents.push({ triggerDistance: newDistance, y1Frac: 0.3, y2Frac: 0.7, spanPx: 550, onFrames: 70, offFrames: 90, phaseFrac: 0.2 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.cloudArcEvents.length - 1;
  previewSelectedCloudArc = previewLastData.obstacles.find(g => g.type === 'cloudarc' && g._arcIdx === newIdx) || null;
  if (previewSelectedCloudArc) scrollPreviewTo(previewSelectedCloudArc.x);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Cloud arc added.');
});

document.getElementById('preview-lens-delete').addEventListener('click', () => {
  if (!previewSelectedLensingZone) return;
  const th = THEMES[currentPreviewZone];
  th.lensingZoneEvents.splice(previewSelectedLensingZone._lensIdx, 1);
  previewSelectedLensingZone = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Lensing zone deleted.');
});

document.getElementById('preview-lens-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.lensingZoneEvents) return;
  const usedDistances = th.lensingZoneEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 950, 100);
  th.lensingZoneEvents.push({ triggerDistance: newDistance, yFrac: 0.5, coreR: 12, zoneRadius: 120 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.lensingZoneEvents.length - 1;
  previewSelectedLensingZone = previewLastData.obstacles.find(g => g._lensIdx === newIdx) || null;
  if (previewSelectedLensingZone) scrollPreviewTo(previewSelectedLensingZone.x);
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Lensing zone added.');
});

document.getElementById('preview-nova-delete').addEventListener('click', () => {
  if (!previewSelectedSupernova) return;
  const th = THEMES[currentPreviewZone];
  th.supernovaEvents.splice(previewSelectedSupernova._novaIdx, 1);
  previewSelectedSupernova = null;
  previewSelectedTurret = null;
  previewSelectedEmp = null;
  previewSelectedOrb = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Supernova deleted.');
});

document.getElementById('preview-nova-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.supernovaEvents) return;
  const usedDistances = th.supernovaEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 900, 150);
  th.supernovaEvents.push({ triggerDistance: newDistance, yFrac: 0.5, planetR: 140, variant: 'timer', dormantFrames: 200, warningFrames: 100 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.supernovaEvents.length - 1;
  previewSelectedSupernova = previewLastData.obstacles.find(g => g._novaIdx === newIdx) || null;
  if (previewSelectedSupernova) scrollPreviewTo(previewSelectedSupernova.x);
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Supernova added.');
});

document.getElementById('preview-nova-variant').addEventListener('click', () => {
  if (!previewSelectedSupernova) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.supernovaEvents[previewSelectedSupernova._novaIdx];
  srcEvent.variant = (srcEvent.variant || 'timer') === 'timer' ? 'onscreen' : 'timer';
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  setPreviewStatus('Variant set to ' + (srcEvent.variant === 'onscreen' ? 'On-Screen' : 'Timer') + '.');
});

document.getElementById('preview-turret-delete').addEventListener('click', () => {
  if (!previewSelectedTurret) return;
  const th = THEMES[currentPreviewZone];
  th.turretEvents.splice(previewSelectedTurret._turretIdx, 1);
  previewSelectedTurret = null;
  previewSelectedEmp = null;
  previewSelectedOrb = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Turret deleted.');
});

document.getElementById('preview-turret-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.turretEvents) return;
  const usedDistances = th.turretEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 900, 150);
  th.turretEvents.push({ triggerDistance: newDistance, anchor: 'top', mountOffset: 70, numShots: 3, fireInterval: 80, fireAngleDeg: 0, projectileSpeed: 6.5, projectileR: 10 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.turretEvents.length - 1;
  previewSelectedTurret = previewLastData.obstacles.find(g => g._turretIdx === newIdx) || null;
  if (previewSelectedTurret) scrollPreviewTo(previewSelectedTurret.x);
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Turret added.');
});

document.getElementById('preview-turret-anchor').addEventListener('click', () => {
  if (!previewSelectedTurret) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.turretEvents[previewSelectedTurret._turretIdx];
  srcEvent.anchor = srcEvent.anchor === 'top' ? 'bottom' : 'top';
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedTurret = previewLastData.obstacles.find(g => g._turretIdx === previewSelectedTurret._turretIdx) || null;
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Anchor set to ' + (srcEvent.anchor === 'top' ? 'Top' : 'Bottom') + '.');
});

document.getElementById('preview-turret-angle-input').addEventListener('input', (e) => {
  if (!previewSelectedTurret) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.turretEvents[previewSelectedTurret._turretIdx];
  const val = parseFloat(e.target.value);
  if (!isNaN(val)) {
    srcEvent.fireAngleDeg = Math.max(-80, Math.min(80, val));
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedTurret = previewLastData.obstacles.find(g => g._turretIdx === previewSelectedTurret._turretIdx) || null;
    drawZonePreview(previewLastData);
  }
});

document.getElementById('preview-turret-shots-input').addEventListener('input', (e) => {
  if (!previewSelectedTurret) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.turretEvents[previewSelectedTurret._turretIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) srcEvent.numShots = Math.max(1, Math.min(10, val));
});

document.getElementById('preview-turret-interval-input').addEventListener('input', (e) => {
  if (!previewSelectedTurret) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.turretEvents[previewSelectedTurret._turretIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) srcEvent.fireInterval = Math.max(20, Math.min(300, val));
});

document.getElementById('preview-emp-delete').addEventListener('click', () => {
  if (!previewSelectedEmp) return;
  const th = THEMES[currentPreviewZone];
  th.empEvents.splice(previewSelectedEmp._empIdx, 1);
  previewSelectedTurret = null;
  previewSelectedEmp = null;
  previewSelectedOrb = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('EMP deleted.');
});

document.getElementById('preview-emp-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.empEvents) return;
  const usedDistances = th.empEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 900, 150);
  th.empEvents.push({ triggerDistance: newDistance, anchor: 'top', reachDepth: 300, chargeFrames: 250, dischargeFrames: 45 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.empEvents.length - 1;
  previewSelectedEmp = previewLastData.obstacles.find(g => g._empIdx === newIdx) || null;
  if (previewSelectedEmp) scrollPreviewTo(previewSelectedEmp.x);
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('EMP added.');
});

document.getElementById('preview-emp-anchor').addEventListener('click', () => {
  if (!previewSelectedEmp) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.empEvents[previewSelectedEmp._empIdx];
  srcEvent.anchor = srcEvent.anchor === 'top' ? 'bottom' : 'top';
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedEmp = previewLastData.obstacles.find(g => g._empIdx === previewSelectedEmp._empIdx) || null;
  updateEmpPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Anchor set to ' + (srcEvent.anchor === 'top' ? 'Top' : 'Bottom') + '.');
});

document.getElementById('preview-emp-reach-input').addEventListener('input', (e) => {
  if (!previewSelectedEmp) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.empEvents[previewSelectedEmp._empIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) srcEvent.reachDepth = Math.max(100, Math.min(450, val));
});

document.getElementById('preview-emp-charge-input').addEventListener('input', (e) => {
  if (!previewSelectedEmp) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.empEvents[previewSelectedEmp._empIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) srcEvent.chargeFrames = Math.max(60, Math.min(400, val));
});

document.getElementById('preview-emp-discharge-input').addEventListener('input', (e) => {
  if (!previewSelectedEmp) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.empEvents[previewSelectedEmp._empIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) srcEvent.dischargeFrames = Math.max(15, Math.min(120, val));
});

document.getElementById('preview-orb-delete').addEventListener('click', () => {
  if (!previewSelectedOrb) return;
  const th = THEMES[currentPreviewZone];
  th.pulsingOrbEvents.splice(previewSelectedOrb._orbIdx, 1);
  previewSelectedTurret = null;
  previewSelectedEmp = null;
  previewSelectedOrb = null;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Orb deleted.');
});

document.getElementById('preview-orb-add').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  if (!th.pulsingOrbEvents) return;
  const usedDistances = th.pulsingOrbEvents.map(e => e.triggerDistance);
  const newDistance = findFreeTriggerDistance(usedDistances, 20, 900, 150);
  th.pulsingOrbEvents.push({ triggerDistance: newDistance, minR: 40, maxR: 200, period: 350 });
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  const newIdx = th.pulsingOrbEvents.length - 1;
  previewSelectedOrb = previewLastData.obstacles.find(g => g._orbIdx === newIdx) || null;
  if (previewSelectedOrb) scrollPreviewTo(previewSelectedOrb.x);
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Orb added.');
});

document.getElementById('preview-orb-minr-input').addEventListener('input', (e) => {
  if (!previewSelectedOrb) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.pulsingOrbEvents[previewSelectedOrb._orbIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) {
    srcEvent.minR = Math.max(15, Math.min(150, val));
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedOrb = previewLastData.obstacles.find(g => g._orbIdx === previewSelectedOrb._orbIdx) || null;
    drawZonePreview(previewLastData);
  }
});

document.getElementById('preview-orb-maxr-input').addEventListener('input', (e) => {
  if (!previewSelectedOrb) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.pulsingOrbEvents[previewSelectedOrb._orbIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) {
    srcEvent.maxR = Math.max(60, Math.min(250, val));
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedOrb = previewLastData.obstacles.find(g => g._orbIdx === previewSelectedOrb._orbIdx) || null;
    drawZonePreview(previewLastData);
  }
});

document.getElementById('preview-orb-period-input').addEventListener('input', (e) => {
  if (!previewSelectedOrb) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.pulsingOrbEvents[previewSelectedOrb._orbIdx];
  const val = parseInt(e.target.value, 10);
  if (!isNaN(val)) srcEvent.period = Math.max(100, Math.min(600, val));
});

document.getElementById('preview-bh-core-input').addEventListener('input', (e) => {
  if (!previewSelectedBlackHole) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.blackHoleEvents[previewSelectedBlackHole._eventIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < 20) return;
  srcEvent.coreR = val;
  // keep reach comfortably larger than core so the graduated pull field
  // always means something
  if (srcEvent.reachR < val * 1.15) {
    srcEvent.reachR = Math.round(val * 1.2);
    document.getElementById('preview-bh-reach-input').value = srcEvent.reachR;
  }
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedBlackHole = previewLastData.obstacles.find(g => g._eventIdx === previewSelectedBlackHole._eventIdx) || null;
  drawZonePreview(previewLastData);
});

document.getElementById('preview-bh-reach-input').addEventListener('input', (e) => {
  if (!previewSelectedBlackHole) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.blackHoleEvents[previewSelectedBlackHole._eventIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < srcEvent.coreR * 1.15) return;
  srcEvent.reachR = val;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedBlackHole = previewLastData.obstacles.find(g => g._eventIdx === previewSelectedBlackHole._eventIdx) || null;
  drawZonePreview(previewLastData);
});

document.getElementById('preview-vortex-reach-input').addEventListener('input', (e) => {
  if (!previewSelectedWindVortex) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.windVortexEvents[previewSelectedWindVortex._vortexIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < 60) return;
  srcEvent.reachR = val;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedWindVortex = previewLastData.obstacles.find(g => g.type === 'windvortex' && g._vortexIdx === previewSelectedWindVortex._vortexIdx) || null;
  drawZonePreview(previewLastData);
});

document.getElementById('preview-lens-core-input').addEventListener('input', (e) => {
  if (!previewSelectedLensingZone) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.lensingZoneEvents[previewSelectedLensingZone._lensIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < 4) return;
  srcEvent.coreR = val;
  // keep the zone comfortably larger than the core so there's a real
  // distortion field surrounding it, not just a bare point
  if (srcEvent.zoneRadius < val * 2) {
    srcEvent.zoneRadius = Math.round(val * 3);
    document.getElementById('preview-lens-zone-input').value = srcEvent.zoneRadius;
  }
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedLensingZone = previewLastData.obstacles.find(g => g._lensIdx === previewSelectedLensingZone._lensIdx) || null;
  drawZonePreview(previewLastData);
});

document.getElementById('preview-lens-zone-input').addEventListener('input', (e) => {
  if (!previewSelectedLensingZone) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.lensingZoneEvents[previewSelectedLensingZone._lensIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < srcEvent.coreR * 2) return;
  srcEvent.zoneRadius = val;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedLensingZone = previewLastData.obstacles.find(g => g._lensIdx === previewSelectedLensingZone._lensIdx) || null;
  drawZonePreview(previewLastData);
});

document.getElementById('preview-nova-planet-input').addEventListener('input', (e) => {
  if (!previewSelectedSupernova) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.supernovaEvents[previewSelectedSupernova._novaIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < 40) return;
  srcEvent.planetR = val;
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  previewSelectedSupernova = previewLastData.obstacles.find(g => g._novaIdx === previewSelectedSupernova._novaIdx) || null;
  drawZonePreview(previewLastData);
});

document.getElementById('preview-nova-dormant-input').addEventListener('input', (e) => {
  if (!previewSelectedSupernova) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.supernovaEvents[previewSelectedSupernova._novaIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < 30) return;
  srcEvent.dormantFrames = val;
});

document.getElementById('preview-nova-warning-input').addEventListener('input', (e) => {
  if (!previewSelectedSupernova) return;
  const th = THEMES[currentPreviewZone];
  const srcEvent = th.supernovaEvents[previewSelectedSupernova._novaIdx];
  const val = parseFloat(e.target.value);
  if (!isFinite(val) || val < 20) return;
  srcEvent.warningFrames = val;
});

document.getElementById('preview-save').addEventListener('click', async () => {
  setPreviewStatus('Saving...');
  // warn about black holes or lensing zones that don't have enough
  // runway left in the zone to fully scroll off-screen before the
  // zone-end transition wipes everything -- otherwise they visibly
  // vanish mid-exit
  const runwayWarnings = [];
  const autoFixedBolts = [];
  // fix any bolt whose effective zone-progress position falls before 0 --
  // it still spawns and is dangerous in real gameplay (it's part of the
  // zone's initial spawn), but the editor canvas can't show or scroll to
  // negative coordinates, so once in this state there's no way to click
  // and drag it back into view manually -- pull it back to just inside
  // the visible range automatically, the same correction the live drag
  // handler applies, rather than leaving an unfixable warning
  THEMES.forEach((t, zi) => {
    if (t.obstacleShape === 'lbolt' && t.pattern) {
      let changed = true;
      let guard = 0;
      while (changed && guard < 20) {
        changed = false;
        guard++;
        const captured = captureFullZoneRun(zi, 1000);
        const bad = captured.obstacles.find(o => o.type === 'lbolt' && o.x < 0);
        if (bad) {
          const srcBolt = t.pattern[bad._entryIdx].bolts[bad._boltIdx];
          srcBolt.xJitter += Math.round(-bad.x + 10);
          autoFixedBolts.push(`Zone ${zi + 1} bolt (entry ${bad._entryIdx + 1}, shape slot ${bad._boltIdx + 1})`);
          changed = true;
        }
      }
    }
  });
  THEMES.forEach((t, zi) => {
    if (t.blackHoleEvents) {
      t.blackHoleEvents.forEach((ev, ei) => {
        const spawnX = 1000 + ev.reachR + 40; // approx W + reachR + 40, matching spawnBlackHoleEvent
        const neededDistanceUnits = (spawnX - (-80 - ev.reachR)) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} hole #${ei + 1} (trigger ${ev.triggerDistance}, reach ${ev.reachR}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
    if (t.windVortexEvents) {
      t.windVortexEvents.forEach((ev, ei) => {
        const spawnX = 1000 + ev.reachR + 40; // matching spawnWindVortexEvent
        const neededDistanceUnits = (spawnX - (-80 - ev.reachR)) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} vortex #${ei + 1} (trigger ${ev.triggerDistance}, reach ${ev.reachR}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
    if (t.lensingZoneEvents) {
      t.lensingZoneEvents.forEach((ev, ei) => {
        const spawnX = 1000 + ev.zoneRadius + 40;
        const neededDistanceUnits = (spawnX - (-80 - ev.zoneRadius)) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} lens #${ei + 1} (trigger ${ev.triggerDistance}, zone ${ev.zoneRadius}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
    if (t.supernovaEvents) {
      t.supernovaEvents.forEach((ev, ei) => {
        const spawnX = 1000 + ev.planetR + 40;
        // also account for the dormant+warning buildup time before the
        // planet even starts its exit journey, plus debris needing to
        // travel roughly as far as the planet would have
        const buildupPx = (ev.dormantFrames + ev.warningFrames) * 2.8;
        const neededDistanceUnits = (spawnX - (-80 - ev.planetR) - buildupPx) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} nova #${ei + 1} (trigger ${ev.triggerDistance}, planet ${ev.planetR}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
    if (t.turretEvents) {
      t.turretEvents.forEach((ev, ei) => {
        const spawnX = 1000 + 40 + 22;
        // also account for all shots needing to be fired before the
        // mount itself is done being relevant
        const buildupPx = ev.numShots * ev.fireInterval * 2.8;
        const neededDistanceUnits = (spawnX - (-80 - 22) - buildupPx) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} turret #${ei + 1} (trigger ${ev.triggerDistance}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
    if (t.empEvents) {
      t.empEvents.forEach((ev, ei) => {
        const spawnX = 1000 + 40;
        const buildupPx = (ev.chargeFrames + ev.dischargeFrames) * 2.8;
        const neededDistanceUnits = (spawnX - (-80 - 30) - buildupPx) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} EMP #${ei + 1} (trigger ${ev.triggerDistance}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
    if (t.pulsingOrbEvents) {
      t.pulsingOrbEvents.forEach((ev, ei) => {
        const spawnX = 1000 + ev.maxR + 40;
        const neededDistanceUnits = (spawnX - (-80 - ev.maxR)) / 10;
        const availableDistanceUnits = 1000 - ev.triggerDistance;
        if (availableDistanceUnits < neededDistanceUnits) {
          runwayWarnings.push(`Zone ${zi + 1} orb #${ei + 1} (trigger ${ev.triggerDistance}, maxR ${ev.maxR}) needs ~${Math.ceil(neededDistanceUnits)} distance to exit but only has ${availableDistanceUnits} left`);
        }
      });
    }
  });
  try {
    const boltSerializable = THEMES.map(t => t.obstacleShape === 'lbolt' ? t.pattern : null);
    await window.storage.set('bolt-patterns-custom', JSON.stringify(boltSerializable));
    const bhSerializable = THEMES.map(t => t.blackHoleEvents || null);
    await window.storage.set('blackhole-events-custom', JSON.stringify(bhSerializable));
    const vortexSerializable = THEMES.map(t => t.windVortexEvents || null);
    await window.storage.set('windvortex-events-custom', JSON.stringify(vortexSerializable));
    const cloudArcSerializable = THEMES.map(t => t.cloudArcEvents || null);
    await window.storage.set('cloudarc-events-custom', JSON.stringify(cloudArcSerializable));
    const lensSerializable = THEMES.map(t => t.lensingZoneEvents || null);
    await window.storage.set('lensingzone-events-custom', JSON.stringify(lensSerializable));
    const novaSerializable = THEMES.map(t => t.supernovaEvents || null);
    await window.storage.set('supernova-events-custom', JSON.stringify(novaSerializable));
    const turretSerializable = THEMES.map(t => t.turretEvents || null);
    await window.storage.set('turret-events-custom', JSON.stringify(turretSerializable));
    const empSerializable = THEMES.map(t => t.empEvents || null);
    await window.storage.set('emp-events-custom', JSON.stringify(empSerializable));
    const orbSerializable = THEMES.map(t => t.pulsingOrbEvents || null);
    await window.storage.set('orb-events-custom', JSON.stringify(orbSerializable));
    const msgs = [];
    if (autoFixedBolts.length) {
      msgs.push(autoFixedBolts.length + ' bolt(s) were sitting before the zone start (invisible/unreachable in the editor) and were automatically pulled back into view');
      console.warn(autoFixedBolts.join('\n'));
    }
    if (runwayWarnings.length) {
      msgs.push(runwayWarnings.length + ' hazard(s) may vanish before fully exiting -- move them earlier or shrink size');
      console.warn(runwayWarnings.join('\n'));
    }
    setPreviewStatus(msgs.length ? 'Saved, but ' + msgs.join('; ') + '.' : 'Saved!');
    if (autoFixedBolts.length && previewOverlay.classList.contains('active')) {
      previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
      drawZonePreview(previewLastData);
    }
  } catch (e) {
    setPreviewStatus('Save failed (kept in memory only).');
  }
});

document.getElementById('preview-reset').addEventListener('click', () => {
  const th = THEMES[currentPreviewZone];
  let resetSomething = false;
  if (th.obstacleShape === 'lbolt') {
    th.pattern = JSON.parse(JSON.stringify(DEFAULT_LBOLT_PATTERNS[currentPreviewZone]));
    previewSelectedBolt = null;
    resetSomething = true;
  }
  if (th.blackHoleEvents) {
    th.blackHoleEvents = JSON.parse(JSON.stringify(DEFAULT_BLACKHOLE_EVENTS[currentPreviewZone]));
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    resetSomething = true;
  }
  if (th.windVortexEvents) {
    th.windVortexEvents = JSON.parse(JSON.stringify(DEFAULT_WINDVORTEX_EVENTS[currentPreviewZone]));
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    resetSomething = true;
  }
  if (th.lensingZoneEvents) {
    th.lensingZoneEvents = JSON.parse(JSON.stringify(DEFAULT_LENSINGZONE_EVENTS[currentPreviewZone]));
    previewSelectedLensingZone = null;
    resetSomething = true;
  }
  if (th.supernovaEvents) {
    th.supernovaEvents = JSON.parse(JSON.stringify(DEFAULT_SUPERNOVA_EVENTS[currentPreviewZone]));
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    resetSomething = true;
  }
  if (th.turretEvents) {
    th.turretEvents = JSON.parse(JSON.stringify(DEFAULT_TURRET_EVENTS[currentPreviewZone]));
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    resetSomething = true;
  }
  if (th.empEvents) {
    th.empEvents = JSON.parse(JSON.stringify(DEFAULT_EMP_EVENTS[currentPreviewZone]));
    previewSelectedEmp = null;
    resetSomething = true;
  }
  if (th.pulsingOrbEvents) {
    th.pulsingOrbEvents = JSON.parse(JSON.stringify(DEFAULT_PULSING_ORB_EVENTS[currentPreviewZone]));
    previewSelectedOrb = null;
    resetSomething = true;
  }
  if (!resetSomething) {
    setPreviewStatus('Nothing to reset for this zone.');
    return;
  }
  previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
  updateBoltPanel();
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
  setPreviewStatus('Reset to default.');
});

previewCanvas.addEventListener('mousedown', (e) => {
  if (!previewEditMode || !previewLastData) return;
  const rect = previewCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const layout = getPreviewLayout();

  let hitBolt = null, hitBlackHole = null, hitWindVortex = null, hitCloudArc = null, hitCloudArcTarget = null, hitLensingZone = null, hitSupernova = null, hitTurret = null, hitEmp = null, hitOrb = null;
  for (const g of previewLastData.obstacles) {
    if (g.type === 'lbolt') {
      const box = boltScreenBox(g, layout);
      if (mx >= box.left && mx <= box.right && my >= box.top && my <= box.bottom) { hitBolt = g; break; }
    } else if (g.type === 'blackhole') {
      const sx = g.x * layout.scale;
      const cy = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rReach = g.reachR * vScale;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= rReach * rReach) { hitBlackHole = g; break; }
    } else if (g.type === 'windvortex') {
      const sx = g.x * layout.scale;
      const cy = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rReach = g.reachR * vScale;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= rReach * rReach) { hitWindVortex = g; break; }
    } else if (g.type === 'cloudarc') {
      const sx1 = g.x * layout.scale;
      const cy1 = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const sx2 = g.x2 * layout.scale;
      const cy2 = layout.pTop + ((g.y2 - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const d1sq = (mx - sx1) ** 2 + (my - cy1) ** 2;
      const d2sq = (mx - sx2) ** 2 + (my - cy2) ** 2;
      if (d1sq <= 144) { hitCloudArc = g; hitCloudArcTarget = 'left'; break; }
      if (d2sq <= 144) { hitCloudArc = g; hitCloudArcTarget = 'right'; break; }
      // distance from click to the line segment, for grabbing the arc as a whole
      const lineLenSq = (sx2 - sx1) ** 2 + (cy2 - cy1) ** 2 || 1;
      const t = Math.max(0, Math.min(1, ((mx - sx1) * (sx2 - sx1) + (my - cy1) * (cy2 - cy1)) / lineLenSq));
      const projX = sx1 + (sx2 - sx1) * t, projY = cy1 + (cy2 - cy1) * t;
      const distSq = (mx - projX) ** 2 + (my - projY) ** 2;
      if (distSq <= 64) { hitCloudArc = g; hitCloudArcTarget = 'line'; break; }
    } else if (g.type === 'lensingzone') {
      const sx = g.x * layout.scale;
      const cy = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rZone = g.zoneRadius * vScale;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= rZone * rZone) { hitLensingZone = g; break; }
    } else if (g.type === 'supernova') {
      const sx = g.x * layout.scale;
      const cy = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const rPlanet = g.planetR * vScale;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= rPlanet * rPlanet) { hitSupernova = g; break; }
    } else if (g.type === 'turret') {
      const sx = g.x * layout.scale;
      const cy = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= 14 * 14) { hitTurret = g; break; }
    } else if (g.type === 'emp') {
      const sx = g.x * layout.scale;
      const anchorY = g.anchor === 'top' ? PLAY_TOP : PLAY_BOTTOM;
      const cy = layout.pTop + ((anchorY - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= 14 * 14) { hitEmp = g; break; }
    } else if (g.type === 'pulsingorb') {
      const sx = g.x * layout.scale;
      const cy = layout.pTop + ((g.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
      const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
      const midR = (g.minR + g.maxR) / 2 * vScale;
      const dx = mx - sx, dy = my - cy;
      if (dx * dx + dy * dy <= midR * midR) { hitOrb = g; break; }
    }
  }

  if (hitBolt) {
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    previewSelectedBolt = hitBolt;
    const box = boltScreenBox(hitBolt, layout);
    const nearHandle = Math.abs(mx - box.right) < 10 && Math.abs(my - box.bottom) < 10;
    previewDragMode = nearHandle ? 'resize' : 'move';

    const th = THEMES[currentPreviewZone];
    const srcBolt = th.pattern[hitBolt._entryIdx].bolts[hitBolt._boltIdx];
    previewDragStart = {
      mx, my, entryIdx: hitBolt._entryIdx, boltIdx: hitBolt._boltIdx,
      origYFrac: srcBolt.yFrac, origXJitter: srcBolt.xJitter,
      origHeightFrac: srcBolt.heightFrac, origSwingWidthPx: srcBolt.swingWidthPx
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitBlackHole) {
    previewSelectedBolt = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    previewSelectedBlackHole = hitBlackHole;
    const sx = hitBlackHole.x * layout.scale;
    const cy = layout.pTop + ((hitBlackHole.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
    const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
    const rCore = hitBlackHole.coreR * vScale;
    const rReach = hitBlackHole.reachR * vScale;
    const nearCoreHandle = Math.abs(mx - (sx + rCore)) < 10 && Math.abs(my - cy) < 10;
    const nearReachHandle = Math.abs(mx - (sx + rReach)) < 10 && Math.abs(my - cy) < 10;
    previewDragMode = nearCoreHandle ? 'resizeCore' : (nearReachHandle ? 'resizeReach' : 'move');

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.blackHoleEvents[hitBlackHole._eventIdx];
    previewDragStart = {
      mx, my, eventIdx: hitBlackHole._eventIdx,
      origYFrac: srcEvent.yFrac, origTriggerDistance: srcEvent.triggerDistance,
      origCoreR: srcEvent.coreR, origReachR: srcEvent.reachR
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitWindVortex) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    previewSelectedWindVortex = hitWindVortex;
    const sx = hitWindVortex.x * layout.scale;
    const cy = layout.pTop + ((hitWindVortex.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
    const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
    const rReach = hitWindVortex.reachR * vScale;
    const nearReachHandle = Math.abs(mx - (sx + rReach)) < 10 && Math.abs(my - cy) < 10;
    previewDragMode = nearReachHandle ? 'resizeReach' : 'move';

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.windVortexEvents[hitWindVortex._vortexIdx];
    previewDragStart = {
      mx, my, vortexIdx: hitWindVortex._vortexIdx,
      origYFrac: srcEvent.yFrac, origTriggerDistance: srcEvent.triggerDistance,
      origReachR: srcEvent.reachR
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitCloudArc) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    previewSelectedCloudArc = hitCloudArc;
    previewDragMode = hitCloudArcTarget === 'left' ? 'moveLeft' : hitCloudArcTarget === 'right' ? 'moveRight' : 'moveBoth';

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.cloudArcEvents[hitCloudArc._arcIdx];
    previewDragStart = {
      mx, my, arcIdx: hitCloudArc._arcIdx,
      origY1Frac: srcEvent.y1Frac, origY2Frac: srcEvent.y2Frac,
      origTriggerDistance: srcEvent.triggerDistance, origSpanPx: srcEvent.spanPx
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitLensingZone) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = null;
    previewSelectedLensingZone = hitLensingZone;
    const sx = hitLensingZone.x * layout.scale;
    const cy = layout.pTop + ((hitLensingZone.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
    const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
    const rCore = hitLensingZone.coreR * vScale;
    const rZone = hitLensingZone.zoneRadius * vScale;
    const nearCoreHandle = Math.abs(mx - (sx + rCore)) < 10 && Math.abs(my - cy) < 10;
    const nearZoneHandle = Math.abs(mx - (sx + rZone)) < 10 && Math.abs(my - cy) < 10;
    previewDragMode = nearCoreHandle ? 'resizeLensCore' : (nearZoneHandle ? 'resizeLensZone' : 'moveLens');

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.lensingZoneEvents[hitLensingZone._lensIdx];
    previewDragStart = {
      mx, my, lensIdx: hitLensingZone._lensIdx,
      origYFrac: srcEvent.yFrac, origTriggerDistance: srcEvent.triggerDistance,
      origCoreR: srcEvent.coreR, origZoneRadius: srcEvent.zoneRadius
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateLensingZonePanel();
    updateSupernovaPanel();
    updateTurretPanel();
    updateEmpPanel();
    updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitSupernova) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = hitSupernova;
    const sx = hitSupernova.x * layout.scale;
    const cy = layout.pTop + ((hitSupernova.y - PLAY_TOP) / (PLAY_BOTTOM - PLAY_TOP)) * layout.pHeight;
    const vScale = layout.pHeight / (PLAY_BOTTOM - PLAY_TOP);
    const rPlanet = hitSupernova.planetR * vScale;
    const nearPlanetHandle = Math.abs(mx - (sx + rPlanet)) < 10 && Math.abs(my - cy) < 10;
    previewDragMode = nearPlanetHandle ? 'resizeNovaPlanet' : 'moveNova';

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.supernovaEvents[hitSupernova._novaIdx];
    previewDragStart = {
      mx, my, novaIdx: hitSupernova._novaIdx,
      origYFrac: srcEvent.yFrac, origTriggerDistance: srcEvent.triggerDistance,
      origPlanetR: srcEvent.planetR
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateLensingZonePanel();
    updateSupernovaPanel();
    updateTurretPanel();
    updateEmpPanel();
    updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitTurret) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = hitTurret;
    previewDragMode = 'moveTurret';

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.turretEvents[hitTurret._turretIdx];
    previewDragStart = {
      mx, my, turretIdx: hitTurret._turretIdx,
      origTriggerDistance: srcEvent.triggerDistance
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateLensingZonePanel();
    updateSupernovaPanel();
    updateTurretPanel();
    updateEmpPanel();
    updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitEmp) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = hitEmp;
    previewSelectedOrb = null;
    previewDragMode = 'moveEmp';

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.empEvents[hitEmp._empIdx];
    previewDragStart = {
      mx, my, empIdx: hitEmp._empIdx,
      origTriggerDistance: srcEvent.triggerDistance
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateLensingZonePanel();
    updateSupernovaPanel();
    updateTurretPanel();
    updateEmpPanel();
    updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  if (hitOrb) {
    previewSelectedBolt = null;
    previewSelectedBlackHole = null;
    previewSelectedWindVortex = null;
    previewSelectedCloudArc = null;
    previewSelectedLensingZone = null;
    previewSelectedSupernova = null;
    previewSelectedTurret = null;
    previewSelectedEmp = null;
    previewSelectedOrb = hitOrb;
    previewDragMode = 'moveOrb';

    const th = THEMES[currentPreviewZone];
    const srcEvent = th.pulsingOrbEvents[hitOrb._orbIdx];
    previewDragStart = {
      mx, my, orbIdx: hitOrb._orbIdx,
      origTriggerDistance: srcEvent.triggerDistance
    };
    updateBoltPanel();
    updateBlackHolePanel();
    updateWindVortexPanel();
    updateCloudArcPanel();
    updateLensingZonePanel();
    updateSupernovaPanel();
    updateTurretPanel();
    updateEmpPanel();
    updateOrbPanel();
    drawZonePreview(previewLastData);
    return;
  }

  previewSelectedBolt = null;
  previewSelectedBlackHole = null;
  previewSelectedWindVortex = null;
  previewSelectedCloudArc = null;
  previewSelectedLensingZone = null;
  previewSelectedSupernova = null;
  previewSelectedTurret = null;
  previewSelectedEmp = null;
  previewSelectedOrb = null;
  updateBoltPanel();
  updateBlackHolePanel();
  updateWindVortexPanel();
  updateCloudArcPanel();
  updateLensingZonePanel();
  updateSupernovaPanel();
  updateTurretPanel();
  updateEmpPanel();
  updateOrbPanel();
  drawZonePreview(previewLastData);
});

window.addEventListener('mousemove', (e) => {
  if (!previewEditMode || !previewDragStart) return;
  const rect = previewCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const layout = getPreviewLayout();
  const playHeight = PLAY_BOTTOM - PLAY_TOP;
  const th = THEMES[currentPreviewZone];
  // captureFullZoneRun re-runs the real game engine end-to-end (needed for
  // accuracy) which costs tens of milliseconds -- throttle how often that
  // full refresh fires during continuous mousemove drag events so dragging
  // stays responsive; the underlying data itself still updates every event,
  // and mouseup always forces one final untouched refresh
  const now = performance.now();
  const throttled = (now - previewMoveThrottleTs) < PREVIEW_MOVE_THROTTLE_MS;
  if (!throttled) previewMoveThrottleTs = now;

  if (previewSelectedBolt) {
    const srcBolt = th.pattern[previewDragStart.entryIdx].bolts[previewDragStart.boltIdx];
    if (previewDragMode === 'move') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      srcBolt.xJitter = Math.round(previewDragStart.origXJitter + dxWorld);
      srcBolt.yFrac = Math.max(0.02, Math.min(0.98, previewDragStart.origYFrac + dyFrac));
    } else if (previewDragMode === 'resize') {
      const dxScreen = mx - previewDragStart.mx;
      const dyScreen = my - previewDragStart.my;
      const newSwing = Math.max(16, previewDragStart.origSwingWidthPx + (dxScreen / layout.scale) * 2);
      const newHeightPx = Math.max(20, previewDragStart.origHeightFrac * playHeight + (dyScreen / layout.pHeight) * playHeight);
      srcBolt.swingWidthPx = Math.round(newSwing);
      srcBolt.heightFrac = Math.max(0.05, Math.min(0.85, newHeightPx / playHeight));
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    let draggedBolt = previewLastData.obstacles.find(g => g._entryIdx === previewDragStart.entryIdx && g._boltIdx === previewDragStart.boltIdx) || null;
    // a bolt dragged far enough left can end up with an effective
    // zone-progress before 0 -- it would still exist and be dangerous in
    // real gameplay (it's part of the zone's initial spawn), but the editor
    // canvas can't render or scroll to negative coordinates at all, making
    // it permanently invisible/unreachable in the editor from that point on.
    // pull it back to zone-progress 0 instead of allowing that dead end.
    if (draggedBolt && draggedBolt.x < 0 && previewDragMode === 'move') {
      srcBolt.xJitter += Math.round(-draggedBolt.x + 10); // shift right so it lands at zone-progress ~1, just inside the visible/reachable range
      previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
      draggedBolt = previewLastData.obstacles.find(g => g._entryIdx === previewDragStart.entryIdx && g._boltIdx === previewDragStart.boltIdx) || null;
    }
    previewSelectedBolt = draggedBolt;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedBlackHole) {
    const srcEvent = th.blackHoleEvents[previewDragStart.eventIdx];
    if (previewDragMode === 'move') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale; // preview px -> distance*10 units
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
      srcEvent.yFrac = Math.max(0, Math.min(1, previewDragStart.origYFrac + dyFrac));
    } else if (previewDragMode === 'resizeCore') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight;
      const newCoreR = Math.max(20, previewDragStart.origCoreR + dxScreen * pxPerScreenPx);
      // keep reach comfortably larger than core so the graduated pull
      // field always means something
      srcEvent.coreR = Math.round(newCoreR);
      srcEvent.reachR = Math.max(srcEvent.reachR, Math.round(newCoreR * 1.2));
    } else if (previewDragMode === 'resizeReach') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight;
      const newReachR = Math.max(srcEvent.coreR * 1.15, previewDragStart.origReachR + dxScreen * pxPerScreenPx);
      srcEvent.reachR = Math.round(newReachR);
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedBlackHole = previewLastData.obstacles.find(g => g._eventIdx === previewDragStart.eventIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedWindVortex) {
    const srcEvent = th.windVortexEvents[previewDragStart.vortexIdx];
    if (previewDragMode === 'move') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
      srcEvent.yFrac = Math.max(0, Math.min(1, previewDragStart.origYFrac + dyFrac));
    } else if (previewDragMode === 'resizeReach') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight;
      const newReachR = Math.max(60, previewDragStart.origReachR + dxScreen * pxPerScreenPx);
      srcEvent.reachR = Math.round(newReachR);
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedWindVortex = previewLastData.obstacles.find(g => g.type === 'windvortex' && g._vortexIdx === previewDragStart.vortexIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedCloudArc) {
    const srcEvent = th.cloudArcEvents[previewDragStart.arcIdx];
    if (previewDragMode === 'moveLeft') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      const newTrigger = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
      // keep the right cloud's absolute position fixed while dragging the
      // left one -- span is defined relative to the left, so shifting
      // triggerDistance alone would otherwise also drag the right cloud
      srcEvent.spanPx = Math.max(60, previewDragStart.origSpanPx - (newTrigger - previewDragStart.origTriggerDistance) * 10);
      srcEvent.triggerDistance = newTrigger;
      srcEvent.y1Frac = Math.max(0, Math.min(1, previewDragStart.origY1Frac + dyFrac));
    } else if (previewDragMode === 'moveRight') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight; // reuse vertical px-per-screenpx as a stand-in scale reference
      const dxWorld = dxScreen / layout.scale;
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      srcEvent.spanPx = Math.max(60, previewDragStart.origSpanPx + dxWorld);
      srcEvent.y2Frac = Math.max(0, Math.min(1, previewDragStart.origY2Frac + dyFrac));
    } else if (previewDragMode === 'moveBoth') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedCloudArc = previewLastData.obstacles.find(g => g.type === 'cloudarc' && g._arcIdx === previewDragStart.arcIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedLensingZone) {
    const srcEvent = th.lensingZoneEvents[previewDragStart.lensIdx];
    if (previewDragMode === 'moveLens') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
      srcEvent.yFrac = Math.max(0, Math.min(1, previewDragStart.origYFrac + dyFrac));
    } else if (previewDragMode === 'resizeLensCore') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight;
      const newCoreR = Math.max(4, previewDragStart.origCoreR + dxScreen * pxPerScreenPx);
      srcEvent.coreR = Math.round(newCoreR);
      srcEvent.zoneRadius = Math.max(srcEvent.zoneRadius, Math.round(newCoreR * 3));
    } else if (previewDragMode === 'resizeLensZone') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight;
      const newZoneR = Math.max(srcEvent.coreR * 2, previewDragStart.origZoneRadius + dxScreen * pxPerScreenPx);
      srcEvent.zoneRadius = Math.round(newZoneR);
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedLensingZone = previewLastData.obstacles.find(g => g._lensIdx === previewDragStart.lensIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedSupernova) {
    const srcEvent = th.supernovaEvents[previewDragStart.novaIdx];
    if (previewDragMode === 'moveNova') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      const dyFrac = (my - previewDragStart.my) / layout.pHeight;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
      srcEvent.yFrac = Math.max(0, Math.min(1, previewDragStart.origYFrac + dyFrac));
    } else if (previewDragMode === 'resizeNovaPlanet') {
      const dxScreen = mx - previewDragStart.mx;
      const pxPerScreenPx = (PLAY_BOTTOM - PLAY_TOP) / layout.pHeight;
      const newPlanetR = Math.max(40, previewDragStart.origPlanetR + dxScreen * pxPerScreenPx);
      srcEvent.planetR = Math.round(newPlanetR);
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedSupernova = previewLastData.obstacles.find(g => g._novaIdx === previewDragStart.novaIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedTurret) {
    const srcEvent = th.turretEvents[previewDragStart.turretIdx];
    if (previewDragMode === 'moveTurret') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedTurret = previewLastData.obstacles.find(g => g._turretIdx === previewDragStart.turretIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedEmp) {
    const srcEvent = th.empEvents[previewDragStart.empIdx];
    if (previewDragMode === 'moveEmp') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedEmp = previewLastData.obstacles.find(g => g._empIdx === previewDragStart.empIdx) || null;
    drawZonePreview(previewLastData);
    }
  } else if (previewSelectedOrb) {
    const srcEvent = th.pulsingOrbEvents[previewDragStart.orbIdx];
    if (previewDragMode === 'moveOrb') {
      const dxWorld = (mx - previewDragStart.mx) / layout.scale;
      srcEvent.triggerDistance = Math.max(20, Math.min(980, previewDragStart.origTriggerDistance + dxWorld / 10));
    }
    if (!throttled) {
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    previewSelectedOrb = previewLastData.obstacles.find(g => g._orbIdx === previewDragStart.orbIdx) || null;
    drawZonePreview(previewLastData);
    }
  }
});

window.addEventListener('mouseup', () => {
  if (previewDragStart) {
    // the throttle may have skipped refreshing on the very last mousemove
    // before release -- force one final, accurate refresh now. the
    // underlying data itself was never throttled (only this visual
    // refresh was), and isSelected checks match by _idx fields rather
    // than object identity, so existing selection state stays correctly
    // linked to the freshly captured data
    previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
    // same negative-position clamp as the mousemove handler -- this is the
    // actual final, definitive state, so it needs its own check regardless
    // of whether the in-progress drag ever hit the throttled clamp above
    if (previewSelectedBolt && previewDragMode === 'move') {
      const th = THEMES[currentPreviewZone];
      const srcBolt = th.pattern[previewDragStart.entryIdx].bolts[previewDragStart.boltIdx];
      let draggedBolt = previewLastData.obstacles.find(g => g._entryIdx === previewDragStart.entryIdx && g._boltIdx === previewDragStart.boltIdx) || null;
      if (draggedBolt && draggedBolt.x < 0) {
        srcBolt.xJitter += Math.round(-draggedBolt.x + 10);
        previewLastData = captureFullZoneRun(currentPreviewZone, 1000);
      }
    }
    drawZonePreview(previewLastData);
  }
  previewDragMode = null;
  previewDragStart = null;
});

function runPreview(themeIdx) {
  setPreviewStatus('Simulating...');
  document.querySelectorAll('.preview-zone-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.zone, 10) === themeIdx);
  });
  requestAnimationFrame(() => {
    previewLastData = captureFullZoneRun(themeIdx, 1000);
    drawZonePreview(previewLastData);
    setPreviewStatus(THEMES[themeIdx].name + ' -- 0 to 1000 distance');
  });
}

// custom saved data (bolt patterns, vortex/black-hole/etc events) loads
// asynchronously from storage. if the user opens the level editor before
// that load finishes, the preview renders from the not-yet-updated default
// data while gameplay -- played moments later, after the load completes --
// correctly reflects their saved edits, making the two appear out of sync
// even though nothing is actually wrong. re-render the preview once loading
// finishes so it always reflects whatever data is actually current.
function refreshPreviewIfOpen() {
  if (previewOverlay.classList.contains('active')) runPreview(currentPreviewZone);
}

const CUSTOM_LEVEL_APPLIERS = {
  'bolt-patterns-custom': (t, data) => { if (t.obstacleShape === 'lbolt') t.pattern = data; },
  'blackhole-events-custom': (t, data) => { if (t.blackHoleEvents) t.blackHoleEvents = data; },
  'windvortex-events-custom': (t, data) => { if (t.windVortexEvents) t.windVortexEvents = data; },
  'cloudarc-events-custom': (t, data) => { if (t.cloudArcEvents) t.cloudArcEvents = data; },
  'lensingzone-events-custom': (t, data) => { if (t.lensingZoneEvents) t.lensingZoneEvents = data; },
  'supernova-events-custom': (t, data) => { if (t.supernovaEvents) t.supernovaEvents = data; },
  'turret-events-custom': (t, data) => { if (t.turretEvents) t.turretEvents = data; },
  'emp-events-custom': (t, data) => { if (t.empEvents) t.empEvents = data; },
  'orb-events-custom': (t, data) => { if (t.pulsingOrbEvents) t.pulsingOrbEvents = data; }
};

function applyCustomLevelArray(apply, data) {
  if (!apply || !data) return;
  THEMES.forEach((t, i) => {
    if (data[i]) apply(t, data[i]);
  });
}

function snapshotDefaultCustomLayouts() {
  THEMES.forEach((t, i) => {
    if (t.obstacleShape === 'lbolt') DEFAULT_LBOLT_PATTERNS[i] = JSON.parse(JSON.stringify(t.pattern));
    if (t.blackHoleEvents) DEFAULT_BLACKHOLE_EVENTS[i] = JSON.parse(JSON.stringify(t.blackHoleEvents));
    if (t.windVortexEvents) DEFAULT_WINDVORTEX_EVENTS[i] = JSON.parse(JSON.stringify(t.windVortexEvents));
    if (t.lensingZoneEvents) DEFAULT_LENSINGZONE_EVENTS[i] = JSON.parse(JSON.stringify(t.lensingZoneEvents));
    if (t.supernovaEvents) DEFAULT_SUPERNOVA_EVENTS[i] = JSON.parse(JSON.stringify(t.supernovaEvents));
    if (t.turretEvents) DEFAULT_TURRET_EVENTS[i] = JSON.parse(JSON.stringify(t.turretEvents));
    if (t.empEvents) DEFAULT_EMP_EVENTS[i] = JSON.parse(JSON.stringify(t.empEvents));
    if (t.pulsingOrbEvents) DEFAULT_PULSING_ORB_EVENTS[i] = JSON.parse(JSON.stringify(t.pulsingOrbEvents));
  });
}

async function applyAllCustomLevelData() {
  const shipped = window.SHIPPED_CUSTOM_LEVELS;
  const shippedVersion = shipped && shipped._version;
  let storedVersion = null;
  try {
    const result = await window.storage.get('custom-levels-version');
    storedVersion = result && result.value;
  } catch (e) { /* missing host storage */ }
  const storageIsCurrent = !!(shippedVersion && storedVersion === shippedVersion);

  if (shipped) {
    for (const [key, apply] of Object.entries(CUSTOM_LEVEL_APPLIERS)) {
      applyCustomLevelArray(apply, shipped[key]);
    }
  }
  if (storageIsCurrent) {
    for (const [key, apply] of Object.entries(CUSTOM_LEVEL_APPLIERS)) {
      const { data, fromStorage } = await readCustomLevelKey(key);
      if (!data || !fromStorage) continue;
      applyCustomLevelArray(apply, data);
    }
  } else if (shipped) {
    for (const key of Object.keys(CUSTOM_LEVEL_APPLIERS)) {
      if (!shipped[key]) continue;
      try { await window.storage.set(key, JSON.stringify(shipped[key])); } catch (e) { /* read-only */ }
    }
    if (shippedVersion) {
      try { await window.storage.set('custom-levels-version', shippedVersion); } catch (e) { /* read-only */ }
    }
  } else {
    for (const [key, apply] of Object.entries(CUSTOM_LEVEL_APPLIERS)) {
      const { data, fromStorage } = await readCustomLevelKey(key);
      if (!data) continue;
      if (!fromStorage) {
        try { await window.storage.set(key, JSON.stringify(data)); } catch (e) { /* read-only */ }
      }
      applyCustomLevelArray(apply, data);
    }
  }
  snapshotDefaultCustomLayouts();
  refreshPreviewIfOpen();
}
applyAllCustomLevelData();

window.addEventListener('resize', () => {
  if (previewOverlay.classList.contains('active')) runPreview(currentPreviewZone);
});

loadCustomTerrain();

const SIM_HZ = GAMEPLAY_HZ;
const SIM_STEP_MS = 1000 / SIM_HZ;
const MAX_SIM_STEPS = 8;
let simLastNow = 0;
let simAccumulatorMs = 0;
let simPrevShipY = NaN;
let simPrevShipRotation = NaN;

function loop() {
  const now = performance.now();
  if (!isPortraitBlocked) {
    try {
      let elapsed = simLastNow ? now - simLastNow : SIM_STEP_MS;
      simLastNow = now;
      if (!isFinite(elapsed) || elapsed < 0) elapsed = SIM_STEP_MS;
      if (elapsed > 100) elapsed = 100;

      if (state === 'playing' || state === 'victory') {
        // Gameplay was authored at 144 Hz. Accumulate real time and run the
        // same 144 simulation ticks per second on every display: a 60 Hz
        // panel performs 2-3 updates per paint, while faster panels may draw
        // between ticks. Rendering smoothness varies; gameplay speed does not.
        simAccumulatorMs += elapsed;
        let steps = 0;
        while (simAccumulatorMs >= SIM_STEP_MS && steps < MAX_SIM_STEPS) {
          simPrevShipY = ship.y;
          simPrevShipRotation = ship.rotation;
          update();
          simAccumulatorMs -= SIM_STEP_MS;
          steps++;
        }
        // Drop excess backlog after a major stall instead of allowing a long
        // catch-up burst that would feel like the game suddenly fast-forwarded.
        if (steps === MAX_SIM_STEPS && simAccumulatorMs >= SIM_STEP_MS) {
          simAccumulatorMs %= SIM_STEP_MS;
        }
      } else {
        simAccumulatorMs = 0;
        simPrevShipY = ship.y;
        simPrevShipRotation = ship.rotation;
        update();
      }
      draw();
    } catch (err) {
      console.error('Synth Flight frame error', err);
      try { updateOverlay(); } catch (overlayErr) { /* keep rAF alive */ }
    }
  } else {
    simLastNow = now;
    simAccumulatorMs = 0;
  }
  requestAnimationFrame(loop);
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

(function bindPlayerSaveImport() {
  const input = document.getElementById('player-save-import');
  if (!input) return;
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importPlayerSaveObject(JSON.parse(String(reader.result || '')));
      } catch (err) {
        window.alert('Could not import that file. Use a Synth Flight export JSON.');
      }
    };
    reader.readAsText(file);
  });
})();

try {
  checkOrientation();
  resetGame();
  if (FORK_GALLERY_ACTIVE) startForkGallery();
  else if (INFERNO_PLAYTEST) startInfernoPlaytest();
  else state = 'home';
  updateOverlay();
  window.SYNTH_FLIGHT_BOOTED = true;
  hydrateDurableSave();
  loop();
} catch (e) {
  window.SYNTH_FLIGHT_BOOTED = true;
  overlay.innerHTML = '<div id="subtitle" style="max-width:640px; font-size:14px; color:#ff2079; pointer-events:auto;">Startup error: ' + String(e && e.stack ? e.stack : e) + '</div>';
}

