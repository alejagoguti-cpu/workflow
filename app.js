/**
 * Magnific Spaces | Node Graph Architecture Engine
 * Pure White Canvas with Dynamic Bezier Connecting Cables
 * Based on Upstairs ("I Finally Found an AI Workflow That Actually Fits Archviz")
 */

document.addEventListener('DOMContentLoaded', () => {
  initSliderStyles();
  initSpacesCanvas();
});

// Modern Web Guidance Range Slider Sync
function initSliderStyles() {
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const sync = () => {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value) || 0;
      const progress = ((val - min) / (max - min)) * 100;
      slider.style.setProperty('--control-value', val);
      slider.style.setProperty('--slider-progress', `${progress}%`);
    };
    sync();
    slider.addEventListener('input', sync);
  });
}

function initSpacesCanvas() {
  const viewport = document.getElementById('canvas-viewport');
  const world = document.getElementById('canvas-world');
  const svgLayer = document.getElementById('connections-layer');

  // Canvas Pan & Zoom State
  let panX = 40;
  let panY = 40;
  let scale = 1.0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  // Nodes Dragging State
  let activeDragNode = null;
  let nodeOffsetX = 0;
  let nodeOffsetY = 0;

  // Pipeline execution state
  let tokens = 2480;
  const tokenValEl = document.getElementById('token-val');

  // Node Parameters State
  const graphState = {
    scene: 'courtyard',
    lighting: 'midday',
    shadowIntensity: 0.75,
    charStyle: 'architect',
    peopleBlend: 0.85,
    engine: 'precision',
    creativity: 2,
    resemblance: 8,
    fractality: 3,
    splitPercent: 50
  };

  // Pre-defined Connections (fromPortId -> toPortId)
  const connections = [
    { from: 'node-1-out', to: 'node-2-in' },
    { from: 'node-1-out', to: 'node-3-in' },
    { from: 'node-2-out', to: 'node-4-in' },
    { from: 'node-4-out', to: 'node-5-in' }
  ];

  // 1. Pan and Zoom Handling
  function updateWorldTransform() {
    world.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    document.getElementById('zoom-level').textContent = `${Math.round(scale * 100)}%`;
  }

  viewport.addEventListener('mousedown', (e) => {
    // Only pan if clicking on empty canvas background (not on a node or button)
    if (e.target === viewport || e.target === world || e.target === svgLayer) {
      isPanning = true;
      viewport.classList.add('panning');
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isPanning) {
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      updateWorldTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    viewport.classList.remove('panning');
  });

  // Wheel Zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      scale = Math.min(2.0, scale * zoomFactor);
    } else {
      scale = Math.max(0.4, scale / zoomFactor);
    }
    updateWorldTransform();
  }, { passive: false });

  // Zoom Buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    scale = Math.min(2.0, scale * 1.15);
    updateWorldTransform();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    scale = Math.max(0.4, scale / 1.15);
    updateWorldTransform();
  });
  document.getElementById('btn-reset-view').addEventListener('click', () => {
    panX = 40;
    panY = 40;
    scale = 1.0;
    updateWorldTransform();
  });

  // 2. Node Dragging Logic
  const nodes = document.querySelectorAll('.space-node');
  nodes.forEach(node => {
    const header = node.querySelector('.node-header');
    header.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      activeDragNode = node;
      node.classList.add('dragging');

      const rect = node.getBoundingClientRect();
      nodeOffsetX = (e.clientX - rect.left) / scale;
      nodeOffsetY = (e.clientY - rect.top) / scale;
    });
  });

  window.addEventListener('mousemove', (e) => {
    if (!activeDragNode) return;
    const viewportRect = viewport.getBoundingClientRect();
    const worldMouseX = (e.clientX - viewportRect.left - panX) / scale;
    const worldMouseY = (e.clientY - viewportRect.top - panY) / scale;

    const newX = worldMouseX - nodeOffsetX;
    const newY = worldMouseY - nodeOffsetY;

    activeDragNode.style.left = `${newX}px`;
    activeDragNode.style.top = `${newY}px`;

    // Redraw SVG cables dynamically as nodes move
    drawConnections();
  });

  window.addEventListener('mouseup', () => {
    if (activeDragNode) {
      activeDragNode.classList.remove('dragging');
      activeDragNode = null;
      drawConnections();
    }
  });

  // 3. Draw Bezier Cables between Ports
  function drawConnections() {
    // Clear old cables
    svgLayer.querySelectorAll('.wire-cable').forEach(c => c.remove());

    const worldRect = world.getBoundingClientRect();

    connections.forEach(conn => {
      const fromEl = document.querySelector(`[data-port-id="${conn.from}"] .port-dot`);
      const toEl = document.querySelector(`[data-port-id="${conn.to}"] .port-dot`);

      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Compute coordinates relative to world canvas
      const x1 = (fromRect.left + fromRect.width / 2 - worldRect.left) / scale;
      const y1 = (fromRect.top + fromRect.height / 2 - worldRect.top) / scale;
      const x2 = (toRect.left + toRect.width / 2 - worldRect.left) / scale;
      const y2 = (toRect.top + toRect.height / 2 - worldRect.top) / scale;

      // Cubic Bezier curve control points
      const dx = Math.abs(x2 - x1) * 0.55;
      const cx1 = x1 + dx;
      const cy1 = y1;
      const cx2 = x2 - dx;
      const cy2 = y2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`);
      path.setAttribute('class', 'wire-cable');
      svgLayer.appendChild(path);
    });
  }

  // 4. Auto-Arrange Nodes in a Clean Left-to-Right Pipeline
  document.getElementById('btn-auto-arrange').addEventListener('click', () => {
    const layout = [
      { id: 'node-1', x: 80, y: 180 },
      { id: 'node-2', x: 480, y: 80 },
      { id: 'node-3', x: 480, y: 390 },
      { id: 'node-4', x: 920, y: 160 },
      { id: 'node-5', x: 1380, y: 120 }
    ];

    layout.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.style.left = `${item.x}px`;
        el.style.top = `${item.y}px`;
      }
    });

    panX = 30;
    panY = 30;
    scale = 0.95;
    updateWorldTransform();
    drawConnections();
  });

  // 5. Node 1 Thumb Rendering
  function renderNode1Thumb() {
    const c = document.getElementById('node-1-thumb');
    if (!c) return;
    const ctx = c.getContext('2d');
    drawArchitecturalScene(ctx, c.width, c.height, false);
  }

  // 6. Node 5 Interactive Split Viewer
  const splitBox = document.getElementById('node-5-split-box');
  const splitDivider = document.getElementById('node-5-divider');
  const canvasOrig = document.getElementById('node-5-canvas-orig');
  const canvasMag = document.getElementById('node-5-canvas-mag');

  let isDraggingSplit = false;

  function updateSplitPosition(pct) {
    pct = Math.max(0, Math.min(100, pct));
    graphState.splitPercent = pct;
    splitDivider.style.left = `${pct}%`;
    canvasMag.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
  }

  splitDivider.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isDraggingSplit = true;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingSplit) return;
    const rect = splitBox.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    updateSplitPosition(pct);
  });

  window.addEventListener('mouseup', () => { isDraggingSplit = false; });

  function renderNode5Viewers() {
    if (!canvasOrig || !canvasMag) return;
    const ctxO = canvasOrig.getContext('2d');
    const ctxM = canvasMag.getContext('2d');
    drawArchitecturalScene(ctxO, canvasOrig.width, canvasOrig.height, false);
    drawArchitecturalScene(ctxM, canvasMag.width, canvasMag.height, true);
  }

  // 7. Architectural Scene Procedural Renderer
  function drawArchitecturalScene(ctx, w, h, isEnhanced) {
    ctx.clearRect(0, 0, w, h);

    // Sky & Lighting Environment
    let skyTop = isEnhanced ? '#0284c7' : '#94a3b8';
    let skyBottom = isEnhanced ? '#e0f2fe' : '#cbd5e1';

    if (graphState.lighting === 'golden') {
      skyTop = '#4338ca';
      skyBottom = '#fb923c';
    } else if (graphState.lighting === 'bluehour') {
      skyTop = '#020617';
      skyBottom = '#1e1b4b';
    } else if (graphState.lighting === 'rainy') {
      skyTop = '#334155';
      skyBottom = '#64748b';
    }

    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(1, skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Pavement
    ctx.fillStyle = isEnhanced ? '#334155' : '#475569';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Expansion joints
    ctx.strokeStyle = isEnhanced ? '#1e293b' : '#334155';
    ctx.lineWidth = isEnhanced ? 1.5 : 1;
    for (let y = h * 0.58; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y - 10);
      ctx.stroke();
    }

    // Puddle on enhanced
    if (isEnhanced) {
      ctx.fillStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.beginPath();
      ctx.ellipse(w * 0.4, h * 0.8, w * 0.18, h * 0.05, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Building Wall
    ctx.fillStyle = isEnhanced ? '#94a3b8' : '#cbd5e1';
    ctx.fillRect(w * 0.15, h * 0.22, w * 0.72, h * 0.55);

    // Board-formed concrete seams (Enhanced only)
    if (isEnhanced) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      for (let y = h * 0.28; y < h * 0.75; y += 35) {
        ctx.beginPath();
        ctx.moveTo(w * 0.15, y);
        ctx.lineTo(w * 0.87, y);
        ctx.stroke();

        for (let x = w * 0.22; x < w * 0.85; x += 55) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(x, y - 6, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Curtain Glazing
    ctx.fillStyle = isEnhanced ? 'rgba(3, 105, 161, 0.85)' : '#93c5fd';
    ctx.fillRect(w * 0.22, h * 0.32, w * 0.58, h * 0.4);

    // Mullions
    ctx.fillStyle = '#0f172a';
    for (let x = w * 0.22; x <= w * 0.8; x += w * 0.14) {
      ctx.fillRect(x, h * 0.32, 4, h * 0.4);
    }

    // Cantilever Roof
    ctx.fillStyle = isEnhanced ? '#f8fafc' : '#e2e8f0';
    ctx.fillRect(w * 0.1, h * 0.18, w * 0.82, 18);

    // Entourage Person
    drawScalePerson(ctx, w * 0.62, h * 0.72, isEnhanced);
  }

  function drawScalePerson(g, x, y, isEnhanced) {
    g.save();
    g.translate(x, y);

    // Shadow
    g.fillStyle = isEnhanced ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.25)';
    g.beginPath();
    g.ellipse(10, 32, 18, 5, -0.2, 0, Math.PI * 2);
    g.fill();

    // Body
    g.fillStyle = isEnhanced ? '#1e293b' : '#475569';
    g.fillRect(-4, 10, 3.5, 22);
    g.fillRect(1, 10, 3.5, 22);
    g.fillRect(-8, -12, 16, 22);

    // Head
    g.fillStyle = '#fed7aa';
    g.beginPath();
    g.arc(0, -18, 5, 0, Math.PI * 2);
    g.fill();

    g.restore();
  }

  // 8. Bind Node Controls
  // Node 1 Scene
  document.getElementById('node-1-scene-select').addEventListener('change', (e) => {
    graphState.scene = e.target.value;
    renderNode1Thumb();
    renderNode5Viewers();
  });

  // Node 2 Lighting Chips
  document.querySelectorAll('[data-light]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      graphState.lighting = chip.getAttribute('data-light');
      renderNode5Viewers();
    });
  });

  document.getElementById('node-2-shadow').addEventListener('input', (e) => {
    graphState.shadowIntensity = parseInt(e.target.value, 10) / 100;
    document.getElementById('node-2-shadow-val').textContent = `${e.target.value}%`;
    renderNode5Viewers();
  });

  // Node 3 People Chips
  document.querySelectorAll('[data-char]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-char]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      graphState.charStyle = chip.getAttribute('data-char');
      renderNode5Viewers();
    });
  });

  document.getElementById('node-3-blend').addEventListener('input', (e) => {
    graphState.peopleBlend = parseInt(e.target.value, 10) / 100;
    document.getElementById('node-3-blend-val').textContent = `${e.target.value}%`;
    renderNode5Viewers();
  });

  // Node 4 Upscaler Controls
  const creatSlider = document.getElementById('node-4-creat');
  const creatVal = document.getElementById('node-4-creat-val');
  creatSlider.addEventListener('input', (e) => {
    graphState.creativity = parseInt(e.target.value, 10);
    if (graphState.creativity <= 3) {
      creatVal.textContent = `Nivel ${graphState.creativity} (Seguro)`;
      creatVal.className = 'badge-safe';
    } else {
      creatVal.textContent = `Nivel ${graphState.creativity} (Alucinación)`;
      creatVal.className = 'badge-safe';
      creatVal.style.background = '#fef2f2';
      creatVal.style.color = '#dc2626';
      creatVal.style.borderColor = '#fca5a5';
    }
  });

  document.getElementById('node-4-resem').addEventListener('input', (e) => {
    graphState.resemblance = parseInt(e.target.value, 10);
    document.getElementById('node-4-resem-val').textContent = graphState.resemblance;
  });

  document.getElementById('node-4-frac').addEventListener('input', (e) => {
    graphState.fractality = parseInt(e.target.value, 10);
    document.getElementById('node-4-frac-val').textContent = graphState.fractality;
  });

  // 9. Execute Pipeline Button ("⚡ Ejecutar Nodos")
  const btnRun = document.getElementById('btn-run-pipeline');
  btnRun.addEventListener('click', () => {
    if (tokens < 5) {
      alert('Sin tokens suficientes.');
      return;
    }

    tokens -= 5;
    tokenValEl.textContent = tokens.toLocaleString();

    // Animate cables with pulse wave
    const cables = svgLayer.querySelectorAll('.wire-cable');
    cables.forEach(c => c.classList.add('pulse-anim'));

    btnRun.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
      <span>Calculando Nodos...</span>
    `;

    setTimeout(() => {
      cables.forEach(c => c.classList.remove('pulse-anim'));
      btnRun.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Ejecutar Nodos (⚡ 5)</span>
      `;
      renderNode5Viewers();
      updateSplitPosition(40);
      alert('Pipeline de nodos ejecutado con éxito. El resultado 8K se ha sintetizado en el nodo de salida.');
    }, 1200);
  });

  // 10. Node Palette Dialog
  const palette = document.getElementById('node-palette');
  document.getElementById('btn-add-node').addEventListener('click', () => {
    palette.style.display = palette.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-close-palette').addEventListener('click', () => {
    palette.style.display = 'none';
  });

  // Fullscreen Modal Viewer
  const modal = document.getElementById('fullscreen-dialog');
  const btnFullscreen = document.getElementById('btn-open-fullscreen');
  const btnCloseModal = document.getElementById('btn-close-modal');

  btnFullscreen.addEventListener('click', () => {
    modal.showModal();
    const mCanvasOrig = document.getElementById('modal-canvas-orig');
    const mCanvasMag = document.getElementById('modal-canvas-mag');
    const ctxO = mCanvasOrig.getContext('2d');
    const ctxM = mCanvasMag.getContext('2d');
    drawArchitecturalScene(ctxO, mCanvasOrig.width, mCanvasOrig.height, false);
    drawArchitecturalScene(ctxM, mCanvasMag.width, mCanvasMag.height, true);

    const mDivider = document.getElementById('modal-divider');
    let mDragging = false;
    mDivider.addEventListener('mousedown', () => { mDragging = true; });
    window.addEventListener('mousemove', (e) => {
      if (!mDragging) return;
      const mBox = document.getElementById('modal-split-box');
      const rect = mBox.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      mDivider.style.left = `${pct}%`;
      mCanvasMag.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
    });
    window.addEventListener('mouseup', () => { mDragging = false; });
  });

  btnCloseModal.addEventListener('click', () => modal.close());

  // Export Full Image
  document.getElementById('btn-export-full').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `magnific-spaces-8k-${Date.now()}.png`;
    link.href = canvasMag.toDataURL('image/png');
    link.click();
  });

  // Initial Initialization
  renderNode1Thumb();
  renderNode5Viewers();
  updateWorldTransform();
  setTimeout(drawConnections, 100);
  window.addEventListener('resize', drawConnections);
}
