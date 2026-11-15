/**
 * Magnific AI Studio | Core Engine & Interactive UI/UX Logic
 * Faithful to Magnific.ai & Upstairs Architectural Visuals
 */

document.addEventListener('DOMContentLoaded', () => {
  initSliderStyles();
  initMagnificApp();
});

// Sync Range Sliders for CSS Variables (Modern Web Guidance)
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

function initMagnificApp() {
  // Elements
  const canvasOrig = document.getElementById('canvas-original');
  const canvasMag = document.getElementById('canvas-magnified');
  const stage = document.getElementById('viewport-stage');
  const wrapper = document.getElementById('split-canvas-wrapper');
  const divider = document.getElementById('split-divider');
  const lens = document.getElementById('magnific-lens');
  const loader = document.getElementById('magnific-loader');
  const historyList = document.getElementById('history-list');
  const tokenCountEl = document.getElementById('token-count');

  if (!canvasOrig || !canvasMag || !wrapper || !divider || !lens) return;

  const ctxOrig = canvasOrig.getContext('2d');
  const ctxMag = canvasMag.getContext('2d');

  // Application State
  const state = {
    mode: 'upscale', // 'upscale' | 'relight' | 'spaces' | 'video'
    viewMode: 'split', // 'split' | 'lens' | 'sidebyside'
    presetScene: 'courtyard',
    customImage: null,
    // Scale factor
    scaleFactor: '4x',
    // Sliders
    creativity: 2,
    resemblance: 8,
    fractality: 3,
    engine: 'precision',
    prompt: '',
    // Relight / People state
    charX: 620,
    charY: 530,
    charStyle: 'architect',
    peopleBlend: 0.85,
    isDraggingChar: false,
    dragStartX: 0,
    dragStartY: 0,
    // Spaces state
    spaceLight: 'midday',
    // Video state
    vidMode: 'timelapse',
    // UI Split Divider state
    splitPercent: 50,
    isDraggingDivider: false,
    tokens: 2480,
    // History
    history: []
  };

  // 1. Initial Prompt for Architecture
  const promptInput = document.getElementById('prompt-input');
  promptInput.value = 'Architectural courtyard plaza, board-formed concrete porosity, micro air pockets, sharp cast-shadows, candid European architects in contemporary linen coats, photorealistic 8K render.';
  state.prompt = promptInput.value;

  // 2. Mode Navigation Switcher
  const modeTabs = document.querySelectorAll('.mode-tab');
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.mode = tab.getAttribute('data-mode');

      // Update mode-specific UI card
      updateModeSpecificCard();
      renderAll();
    });
  });

  function updateModeSpecificCard() {
    const cardTitle = document.getElementById('mode-specific-title');
    const peopleGroup = document.getElementById('people-options-group');
    const spacesGroup = document.getElementById('spaces-options-group');
    const videoGroup = document.getElementById('video-options-group');

    peopleGroup.style.display = 'none';
    spacesGroup.style.display = 'none';
    videoGroup.style.display = 'none';

    if (state.mode === 'relight') {
      cardTitle.textContent = 'Relight & Scale Figures (Entourage)';
      peopleGroup.style.display = 'block';
    } else if (state.mode === 'spaces') {
      cardTitle.textContent = 'Spaces: Lighting Scenarios & Reframe';
      spacesGroup.style.display = 'block';
    } else if (state.mode === 'video') {
      cardTitle.textContent = 'Video & Atmospheric Clips';
      videoGroup.style.display = 'block';
    } else {
      cardTitle.textContent = 'Precision Material & Edge Controls';
      peopleGroup.style.display = 'block';
    }
  }

  // 3. Scale Factor Buttons
  const scaleBtns = document.querySelectorAll('.scale-btn');
  const resBadge = document.getElementById('resolution-badge');
  const metaScale = document.getElementById('meta-scale');
  const resMap = {
    '2x': '2560 × 1600 (2K)',
    '4x': '3840 × 2400 (4K)',
    '8x': '7680 × 4800 (8K)',
    '16x': '15360 × 9600 (Cinema 16K)'
  };

  scaleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scaleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.scaleFactor = btn.getAttribute('data-scale');
      resBadge.textContent = resMap[state.scaleFactor] || state.scaleFactor;
      metaScale.textContent = `${state.scaleFactor} (${resMap[state.scaleFactor]})`;
    });
  });

  // 4. Sliders (Creativity, Resemblance, Fractality)
  const creatSlider = document.getElementById('slider-creativity');
  const creatVal = document.getElementById('creativity-val');
  const metaCreat = document.getElementById('meta-creativity');
  creatSlider.addEventListener('input', (e) => {
    state.creativity = parseInt(e.target.value, 10);
    creatVal.textContent = state.creativity;
    if (state.creativity <= 3) {
      metaCreat.textContent = `${state.creativity} (Fidelidad 100%)`;
      metaCreat.style.color = 'var(--accent-emerald)';
    } else if (state.creativity <= 5) {
      metaCreat.textContent = `${state.creativity} (Moderado)`;
      metaCreat.style.color = 'var(--accent-amber)';
    } else {
      metaCreat.textContent = `${state.creativity} (Alucinación Alta)`;
      metaCreat.style.color = 'var(--accent-rose)';
    }
  });

  const resemSlider = document.getElementById('slider-resemblance');
  const resemVal = document.getElementById('resemblance-val');
  const metaResem = document.getElementById('meta-resemblance');
  resemSlider.addEventListener('input', (e) => {
    state.resemblance = parseInt(e.target.value, 10);
    resemVal.textContent = state.resemblance;
    metaResem.textContent = state.resemblance;
  });

  const fracSlider = document.getElementById('slider-fractality');
  const fracVal = document.getElementById('fractality-val');
  fracSlider.addEventListener('input', (e) => {
    state.fractality = parseInt(e.target.value, 10);
    fracVal.textContent = state.fractality;
  });

  // Engine Select
  const engineSelect = document.getElementById('engine-select');
  const metaEngine = document.getElementById('meta-engine');
  engineSelect.addEventListener('change', (e) => {
    state.engine = e.target.value;
    const names = {
      precision: 'Precision Archviz',
      sharpy: 'Sharpy',
      sparkle: 'Sparkle',
      illusio: 'Illusio'
    };
    metaEngine.textContent = names[state.engine] || state.engine;
  });

  // Enhance Prompt Button
  document.getElementById('btn-enhance-prompt').addEventListener('click', () => {
    const archEnhancements = [
      'sharp cast-shadows on board-formed concrete seams',
      'low-iron double-glazed facade reflections',
      'candid European architects conversing in plaza',
      'natural textile linen drape and soft floor contact occlusion',
      'micro-roughness 8k Hasselblad 35mm lens perspective'
    ];
    promptInput.value = `${promptInput.value.trim()}, ${archEnhancements[Math.floor(Math.random() * archEnhancements.length)]}`;
    state.prompt = promptInput.value;
  });

  // Presets
  document.querySelectorAll('[data-preset-scene]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-preset-scene]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.presetScene = btn.getAttribute('data-preset-scene');
      state.customImage = null;
      document.getElementById('loaded-thumb').style.display = 'none';
      document.getElementById('dropzone-empty').style.display = 'block';
      renderAll();
    });
  });

  // File Upload
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('image-upload');
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.customImage = img;
        const thumb = document.getElementById('loaded-thumb');
        thumb.src = event.target.result;
        thumb.style.display = 'block';
        document.getElementById('dropzone-empty').style.display = 'none';
        renderAll();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 5. Vertical Split Divider Dragging (The Iconic Magnific Interaction)
  function updateSplitPosition(pct) {
    pct = Math.max(0, Math.min(100, pct));
    state.splitPercent = pct;
    divider.style.left = `${pct}%`;
    canvasMag.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
  }

  divider.addEventListener('mousedown', () => { state.isDraggingDivider = true; });
  window.addEventListener('mousemove', (e) => {
    if (state.isDraggingDivider && state.viewMode === 'split') {
      const rect = wrapper.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      updateSplitPosition(pct);
    }
  });
  window.addEventListener('mouseup', () => { state.isDraggingDivider = false; });

  // 6. View Mode Switching (Split, Lente 4X, Side-by-side)
  const btnSplit = document.getElementById('btn-view-split');
  const btnLens = document.getElementById('btn-view-lens');
  const btnSide = document.getElementById('btn-view-sidebyside');

  btnSplit.addEventListener('click', () => {
    state.viewMode = 'split';
    btnSplit.classList.add('active');
    btnLens.classList.remove('active');
    btnSide.classList.remove('active');
    divider.style.display = 'block';
    lens.style.display = 'none';
    updateSplitPosition(50);
  });

  btnLens.addEventListener('click', () => {
    state.viewMode = 'lens';
    btnLens.classList.add('active');
    btnSplit.classList.remove('active');
    btnSide.classList.remove('active');
    divider.style.display = 'none';
    canvasMag.style.clipPath = 'none';
  });

  btnSide.addEventListener('click', () => {
    state.viewMode = 'sidebyside';
    btnSide.classList.add('active');
    btnSplit.classList.remove('active');
    btnLens.classList.remove('active');
    divider.style.display = 'none';
    canvasMag.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
  });

  // Lente 4X Magnifier Movement
  wrapper.addEventListener('mouseenter', () => {
    if (state.viewMode === 'lens') lens.style.display = 'block';
  });
  wrapper.addEventListener('mouseleave', () => {
    if (state.viewMode === 'lens') lens.style.display = 'none';
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (state.viewMode !== 'lens') return;
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;

    const zoom = 2.6;
    lens.style.backgroundImage = `url(${canvasMag.toDataURL()})`;
    lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    lens.style.backgroundPosition = `-${x * zoom - 85}px -${y * zoom - 85}px`;
  });

  // Character Dragging on Viewport
  wrapper.addEventListener('mousedown', (e) => {
    if (state.viewMode !== 'split' && state.viewMode !== 'lens') return;
    const rect = wrapper.getBoundingClientRect();
    const sx = canvasOrig.width / rect.width;
    const sy = canvasOrig.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;

    const dist = Math.hypot(mx - state.charX, my - state.charY);
    if (dist < 100) {
      state.isDraggingChar = true;
      state.dragStartX = mx - state.charX;
      state.dragStartY = my - state.charY;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isDraggingChar) return;
    const rect = wrapper.getBoundingClientRect();
    const sx = canvasOrig.width / rect.width;
    const sy = canvasOrig.height / rect.height;
    state.charX = (e.clientX - rect.left) * sx - state.dragStartX;
    state.charY = (e.clientY - rect.top) * sy - state.dragStartY;
    renderAll();
  });

  window.addEventListener('mouseup', () => { state.isDraggingChar = false; });

  // 7. Core Architectural Drawing Engine
  function renderAll() {
    renderCanvas(ctxOrig, false); // Original Clay / Base Render
    renderCanvas(ctxMag, true);   // Magnified 8K Enhanced Render
  }

  function renderCanvas(ctx, isEnhanced) {
    ctx.clearRect(0, 0, 1280, 800);

    // If Custom Image was uploaded
    if (state.customImage) {
      ctx.drawImage(state.customImage, 0, 0, 1280, 800);
      if (isEnhanced) {
        // Apply smart sharpness and specular overlay
        ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
        ctx.fillRect(0, 0, 1280, 800);
      }
      return;
    }

    // Procedural Architectural Render
    // 1. Sky & Sun
    let skyTop = isEnhanced ? '#0284c7' : '#64748b';
    let skyBottom = isEnhanced ? '#e0f2fe' : '#94a3b8';
    if (state.spaceLight === 'golden') {
      skyTop = '#4338ca';
      skyBottom = '#fb923c';
    } else if (state.spaceLight === 'bluehour') {
      skyTop = '#020617';
      skyBottom = '#1e1b4b';
    }

    const sky = ctx.createLinearGradient(0, 0, 0, 460);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(1, skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1280, 460);

    // Clouds (Crisper on enhanced)
    ctx.fillStyle = isEnhanced ? 'rgba(255, 255, 255, 0.7)' : 'rgba(203, 213, 225, 0.4)';
    ctx.beginPath();
    ctx.ellipse(320, 140, 200, 45, 0, 0, Math.PI * 2);
    ctx.ellipse(920, 110, 240, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Ground Paving (Stone / Slate Plaza)
    ctx.fillStyle = isEnhanced ? '#334155' : '#475569';
    ctx.beginPath();
    ctx.moveTo(0, 440);
    ctx.lineTo(1280, 420);
    ctx.lineTo(1280, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fill();

    // Pavement Joints
    ctx.strokeStyle = isEnhanced ? '#1e293b' : '#334155';
    ctx.lineWidth = isEnhanced ? 2 : 1;
    for (let y = 460; y < 800; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y - 20);
      ctx.stroke();
    }

    // Enhanced Puddle Reflections on wet stone
    if (isEnhanced) {
      ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.beginPath();
      ctx.ellipse(420, 640, 180, 40, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(410, 635, 90, 15, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Architectural Massing (Gallery Pavilion)
    ctx.fillStyle = isEnhanced ? '#94a3b8' : '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(180, 180);
    ctx.lineTo(1100, 140);
    ctx.lineTo(1100, 600);
    ctx.lineTo(180, 620);
    ctx.closePath();
    ctx.fill();

    // Board-formed Concrete Lines & Tie-Holes (Visible on Enhanced)
    if (isEnhanced) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      for (let y = 220; y < 600; y += 70) {
        ctx.beginPath();
        ctx.moveTo(180, y);
        ctx.lineTo(1100, y - 30);
        ctx.stroke();

        for (let x = 240; x < 1060; x += 130) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(x, y - 12, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Floor-to-Ceiling Curtain Glass
    const glassGrad = ctx.createLinearGradient(280, 240, 1020, 560);
    if (isEnhanced) {
      glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.85)');
      glassGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
      glassGrad.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
    } else {
      glassGrad.addColorStop(0, '#93c5fd');
      glassGrad.addColorStop(1, '#60a5fa');
    }
    ctx.fillStyle = glassGrad;
    ctx.fillRect(280, 260, 740, 310);

    // Structural Mullions
    ctx.fillStyle = '#0f172a';
    for (let x = 280; x <= 1020; x += 148) {
      ctx.fillRect(x, 260, 10, 310);
    }

    // Overhanging Roof Canopy
    ctx.fillStyle = isEnhanced ? '#f8fafc' : '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(120, 170);
    ctx.lineTo(1160, 125);
    ctx.lineTo(1170, 190);
    ctx.lineTo(110, 235);
    ctx.closePath();
    ctx.fill();

    // 4. Human Scale Figures (Entourage)
    drawArchitecturalPerson(ctx, state.charX, state.charY, isEnhanced);
  }

  function drawArchitecturalPerson(g, x, y, isEnhanced) {
    g.save();
    g.translate(x, y);

    // Directional Ground Shadow
    g.fillStyle = isEnhanced ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.25)';
    g.beginPath();
    g.ellipse(20, 75, 42, 12, -0.2, 0, Math.PI * 2);
    if (isEnhanced) g.filter = 'blur(6px)';
    g.fill();
    g.filter = 'none';

    // Person Silhouette with realistic drape on enhanced
    // Trousers
    g.fillStyle = isEnhanced ? '#1e293b' : '#334155';
    g.fillRect(-10, 25, 8, 50);
    g.fillRect(3, 25, 8, 50);

    // Trench coat / Jacket
    g.fillStyle = isEnhanced ? '#475569' : '#64748b';
    g.beginPath();
    g.moveTo(-18, -25);
    g.lineTo(18, -25);
    g.lineTo(24, 32);
    g.lineTo(-24, 32);
    g.closePath();
    g.fill();

    if (isEnhanced) {
      // Fabric folds highlight
      g.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(0, -22);
      g.lineTo(4, 30);
      g.stroke();
    }

    // Head
    g.fillStyle = '#fed7aa';
    g.beginPath();
    g.arc(0, -38, 10, 0, Math.PI * 2);
    g.fill();

    g.restore();
  }

  // 8. Magnify Button Action (Token deduction & Generation)
  const btnMagnify = document.getElementById('btn-magnify');
  btnMagnify.addEventListener('click', () => {
    if (state.tokens < 5) {
      alert('Sin tokens suficientes.');
      return;
    }

    // Deduct tokens
    state.tokens -= 5;
    tokenCountEl.textContent = state.tokens.toLocaleString();

    // Show Loader
    loader.style.display = 'flex';

    setTimeout(() => {
      loader.style.display = 'none';
      renderAll();

      // Add to History
      const histItem = {
        id: Date.now(),
        mode: state.mode.toUpperCase(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scale: state.scaleFactor,
        creativity: state.creativity,
        prompt: promptInput.value,
        thumbUrl: canvasMag.toDataURL()
      };
      state.history.unshift(histItem);
      renderHistory();
      updateSplitPosition(40);
    }, 1200);
  });

  function renderHistory() {
    historyList.innerHTML = '';
    document.getElementById('history-count').textContent = `${state.history.length} items`;

    state.history.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `history-card ${index === 0 ? 'active' : ''}`;
      card.innerHTML = `
        <img class="history-thumb" src="${item.thumbUrl}" alt="Generation">
        <div class="history-info">
          <div class="history-row">
            <span class="history-mode">${item.mode} (${item.scale})</span>
            <span class="history-time">${item.time}</span>
          </div>
          <div class="history-prompt">${item.prompt}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        document.querySelectorAll('.history-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        promptInput.value = item.prompt;
      });
      historyList.appendChild(card);
    });
  }

  // Initial Pre-loaded History Items
  state.history.push({
    id: 1,
    mode: 'UPSCALE',
    time: '10:42 AM',
    scale: '8x',
    creativity: 2,
    prompt: 'Plaza & candid architects in linen coats, board-formed concrete porosity',
    thumbUrl: ''
  });

  // Toggle History Drawer
  const toggleHistoryBtn = document.getElementById('toggle-history-btn');
  const workspace = document.querySelector('.magnific-workspace');
  toggleHistoryBtn.addEventListener('click', () => {
    workspace.classList.toggle('history-collapsed');
    toggleHistoryBtn.classList.toggle('active');
  });

  // Copy Prompt
  document.getElementById('btn-copy-prompt').addEventListener('click', () => {
    navigator.clipboard.writeText(promptInput.value).then(() => {
      alert('Prompt copiado al portapapeles.');
    });
  });

  // Download
  document.getElementById('btn-download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `magnific-archviz-${state.scaleFactor}-${Date.now()}.png`;
    link.href = canvasMag.toDataURL('image/png');
    link.click();
  });

  // Initial render
  renderAll();
  state.history[0].thumbUrl = canvasMag.toDataURL();
  renderHistory();
}
