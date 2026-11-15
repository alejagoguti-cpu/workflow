/**
 * ArchFlow AI Studio | Architectural Engine & Workflow Logic
 * Implements 3 Architectural AI Workflows:
 * 1. Google Earth to Aerial Drone Shot (Context Photomatch)
 * 2. Day-to-Night Architectural Timelapse (Atmospheric Interpolation)
 * 3. Micro-Enhancement & Texture Refinement (Precision Inpainting)
 */

document.addEventListener('DOMContentLoaded', () => {
  initSliderStyles();
  initTabNavigation();
  initWorkflow1();
  initWorkflow2();
  initWorkflow3();
  initCopyButtons();
});

// =============================================================================
// Helper: Sync Slider Values for Custom CSS Range Progress (Modern Web Guidance)
// =============================================================================
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

// =============================================================================
// Tab Navigation
// =============================================================================
function initTabNavigation() {
  const tabs = document.querySelectorAll('.workflow-tabs .tab-btn');
  const sections = document.querySelectorAll('.workflow-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // Re-trigger viewport renders if needed
      if (targetId === 'workflow-1' && window.wf1Redraw) window.wf1Redraw();
      if (targetId === 'workflow-2' && window.wf2Redraw) window.wf2Redraw();
      if (targetId === 'workflow-3' && window.wf3Redraw) window.wf3Redraw();
    });
  });
}

// =============================================================================
// WORKFLOW 1: Google Earth to Drone Aerial Photomatch
// =============================================================================
function initWorkflow1() {
  const canvas = document.getElementById('wf1-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // State
  const state = {
    bgPreset: 'coastal',
    massPreset: 'pavilion',
    customBg: null,
    customMass: null,
    // Massing transform
    posX: 512,
    posY: 330,
    scale: 1.0,
    opacity: 1.0,
    shadow: 0.45,
    haze: 0.20,
    isSynthesized: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
  };

  // Pre-generate procedural backgrounds and massings as offscreen canvases
  const cache = {
    bgs: {},
    masses: {}
  };

  function renderProceduralBg(type) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 640;
    const g = c.getContext('2d');

    if (type === 'coastal') {
      // Ocean gradient
      const ocean = g.createLinearGradient(0, 0, 1024, 640);
      ocean.addColorStop(0, '#0284c7');
      ocean.addColorStop(0.35, '#0369a1');
      ocean.addColorStop(0.5, '#0f766e');
      g.fillStyle = ocean;
      g.fillRect(0, 0, 1024, 640);

      // Waves
      g.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      g.lineWidth = 2;
      for (let i = 0; i < 15; i++) {
        g.beginPath();
        const y = 80 + i * 20;
        g.moveTo(0, y);
        g.bezierCurveTo(300, y - 10, 600, y + 15, 1024, y);
        g.stroke();
      }

      // Rocky Cliff topography
      g.fillStyle = '#475569';
      g.beginPath();
      g.moveTo(0, 240);
      g.bezierCurveTo(350, 180, 650, 260, 1024, 200);
      g.lineTo(1024, 640);
      g.lineTo(0, 640);
      g.closePath();
      g.fill();

      // Terrain earth & vegetation
      g.fillStyle = '#2e432c';
      g.beginPath();
      g.moveTo(0, 280);
      g.bezierCurveTo(300, 220, 600, 310, 1024, 250);
      g.lineTo(1024, 640);
      g.lineTo(0, 640);
      g.closePath();
      g.fill();

      // Roadway curving along cliff
      g.strokeStyle = '#334155';
      g.lineWidth = 32;
      g.beginPath();
      g.moveTo(0, 520);
      g.bezierCurveTo(400, 480, 700, 400, 1024, 460);
      g.stroke();

      // Road dashed center line
      g.strokeStyle = '#f1f5f9';
      g.lineWidth = 2;
      g.setLineDash([12, 12]);
      g.stroke();
      g.setLineDash([]);

      // Clusters of trees
      drawTreeClusters(g, [
        {x: 180, y: 340, count: 25},
        {x: 780, y: 320, count: 35},
        {x: 420, y: 560, count: 20}
      ]);

    } else if (type === 'urban') {
      // Dark urban tarmac & streets
      g.fillStyle = '#1e293b';
      g.fillRect(0, 0, 1024, 640);

      // City blocks
      g.fillStyle = '#334155';
      g.fillRect(60, 60, 260, 220);
      g.fillRect(700, 60, 260, 220);
      g.fillRect(60, 360, 260, 220);
      g.fillRect(700, 360, 260, 220);

      // Central green architectural park
      g.fillStyle = '#166534';
      g.beginPath();
      g.roundRect(360, 140, 300, 360, 24);
      g.fill();

      // Trees in park
      drawTreeClusters(g, [
        {x: 420, y: 200, count: 18},
        {x: 600, y: 440, count: 22}
      ]);

    } else if (type === 'forest') {
      // Lush mountain forest
      const grad = g.createLinearGradient(0, 0, 1024, 640);
      grad.addColorStop(0, '#14532d');
      grad.addColorStop(1, '#052e16');
      g.fillStyle = grad;
      g.fillRect(0, 0, 1024, 640);

      // Clearing for building
      g.fillStyle = '#57534e';
      g.beginPath();
      g.ellipse(512, 340, 260, 170, 0, 0, Math.PI * 2);
      g.fill();

      // Dense perimeter trees
      for (let i = 0; i < 180; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 640;
        const dist = Math.hypot(x - 512, y - 340);
        if (dist > 160) {
          drawSingleTree(g, x, y, 12 + Math.random() * 14);
        }
      }
    }

    return c;
  }

  function drawTreeClusters(g, clusters) {
    clusters.forEach(cl => {
      for (let i = 0; i < cl.count; i++) {
        const x = cl.x + (Math.random() - 0.5) * 140;
        const y = cl.y + (Math.random() - 0.5) * 80;
        drawSingleTree(g, x, y, 8 + Math.random() * 8);
      }
    });
  }

  function drawSingleTree(g, x, y, r) {
    g.fillStyle = 'rgba(0, 0, 0, 0.25)';
    g.beginPath();
    g.ellipse(x + 3, y + 4, r, r * 0.6, 0, 0, Math.PI * 2);
    g.fill();

    const treeGrad = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
    treeGrad.addColorStop(0, '#4ade80');
    treeGrad.addColorStop(0.7, '#15803d');
    treeGrad.addColorStop(1, '#14532d');
    g.fillStyle = treeGrad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }

  function renderProceduralMass(type) {
    const c = document.createElement('canvas');
    c.width = 480;
    c.height = 360;
    const g = c.getContext('2d');

    const cx = 240;
    const cy = 180;

    if (type === 'pavilion') {
      // Curved Glass Pavilion (Show It Better signature)
      // Base shadow
      g.fillStyle = 'rgba(0, 0, 0, 0.2)';
      g.beginPath();
      g.ellipse(cx, cy + 60, 160, 70, -0.15, 0, Math.PI * 2);
      g.fill();

      // Fluid concrete podium
      g.fillStyle = '#cbd5e1';
      g.beginPath();
      g.ellipse(cx, cy + 40, 150, 60, -0.15, 0, Math.PI * 2);
      g.fill();

      // Glazed envelope
      const glassGrad = g.createLinearGradient(cx - 100, cy - 80, cx + 100, cy + 40);
      glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.7)');
      glassGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.5)');
      glassGrad.addColorStop(1, 'rgba(14, 165, 233, 0.8)');
      g.fillStyle = glassGrad;
      g.beginPath();
      g.ellipse(cx, cy - 10, 130, 65, -0.15, 0, Math.PI * 2);
      g.fill();

      // Roof canopy with timber soffit
      const roofGrad = g.createLinearGradient(cx - 120, cy - 60, cx + 120, cy - 30);
      roofGrad.addColorStop(0, '#f8fafc');
      roofGrad.addColorStop(1, '#94a3b8');
      g.fillStyle = roofGrad;
      g.beginPath();
      g.ellipse(cx - 10, cy - 35, 145, 55, -0.12, 0, Math.PI * 2);
      g.fill();

      // Mullion lines
      g.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      g.lineWidth = 2;
      for (let i = -5; i <= 5; i++) {
        g.beginPath();
        g.moveTo(cx + i * 22, cy - 30);
        g.lineTo(cx + i * 24, cy + 40);
        g.stroke();
      }

    } else if (type === 'brutalist') {
      // Brutalist Concrete Cultural Center (Cantilevered geometry)
      // Block 1 (Base)
      g.fillStyle = '#64748b';
      g.beginPath();
      g.moveTo(cx - 120, cy + 40);
      g.lineTo(cx + 80, cy + 70);
      g.lineTo(cx + 140, cy + 20);
      g.lineTo(cx - 60, cy - 10);
      g.closePath();
      g.fill();

      // Block 2 (Cantilever Upper Box)
      g.fillStyle = '#94a3b8';
      g.beginPath();
      g.moveTo(cx - 140, cy - 20);
      g.lineTo(cx + 40, cy + 10);
      g.lineTo(cx + 160, cy - 50);
      g.lineTo(cx - 20, cy - 80);
      g.closePath();
      g.fill();

      // Extruded vertical faces
      g.fillStyle = '#475569';
      g.beginPath();
      g.moveTo(cx - 140, cy - 20);
      g.lineTo(cx + 40, cy + 10);
      g.lineTo(cx + 40, cy + 50);
      g.lineTo(cx - 140, cy + 20);
      g.closePath();
      g.fill();

      // Ribbon window slit
      g.fillStyle = '#0284c7';
      g.beginPath();
      g.moveTo(cx - 110, cy);
      g.lineTo(cx + 10, cy + 20);
      g.lineTo(cx + 10, cy + 28);
      g.lineTo(cx - 110, cy + 8);
      g.closePath();
      g.fill();

    } else if (type === 'villa') {
      // Stepped Timber Modern Villa
      // Terraces
      g.fillStyle = '#b45309';
      g.fillRect(cx - 120, cy - 40, 110, 80);
      g.fillStyle = '#d97706';
      g.fillRect(cx - 30, cy - 10, 140, 70);

      // Glass sliders
      g.fillStyle = 'rgba(186, 230, 253, 0.85)';
      g.fillRect(cx - 105, cy - 20, 80, 50);
      g.fillRect(cx - 10, cy + 10, 100, 45);

      // Overhanging flat white roofs
      g.fillStyle = '#f1f5f9';
      g.fillRect(cx - 135, cy - 50, 140, 12);
      g.fillRect(cx - 45, cy - 20, 170, 12);
    }

    return c;
  }

  function getBg() {
    if (state.customBg) return state.customBg;
    if (!cache.bgs[state.bgPreset]) {
      cache.bgs[state.bgPreset] = renderProceduralBg(state.bgPreset);
    }
    return cache.bgs[state.bgPreset];
  }

  function getMass() {
    if (state.customMass) return state.customMass;
    if (!cache.masses[state.massPreset]) {
      cache.masses[state.massPreset] = renderProceduralMass(state.massPreset);
    }
    return cache.masses[state.massPreset];
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Context Background
    const bg = getBg();
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // 2. Draw Massing
    const mass = getMass();
    const mw = mass.width * state.scale;
    const mh = mass.height * state.scale;
    const dx = state.posX - mw / 2;
    const dy = state.posY - mh / 2;

    ctx.save();

    // Ground Contact Shadow
    if (state.shadow > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${state.shadow * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(state.posX, state.posY + mh * 0.28, mw * 0.45, mh * 0.16, 0, 0, Math.PI * 2);
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.filter = 'none';
    }

    // Building Massing
    ctx.globalAlpha = state.opacity;
    ctx.drawImage(mass, dx, dy, mw, mh);

    // If Synthesized (AI Drone Photomatch Mode Active)
    if (state.isSynthesized) {
      // Add realistic drone reflections and light wrap
      const sunFlare = ctx.createRadialGradient(state.posX - mw * 0.2, state.posY - mh * 0.3, 10, state.posX, state.posY, mw);
      sunFlare.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      sunFlare.addColorStop(0.3, 'rgba(253, 224, 71, 0.15)');
      sunFlare.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunFlare;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Micro drone camera bloom & edge sharpness
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(dx, dy, mw, mh);
    }

    // Atmospheric Haze
    if (state.haze > 0) {
      ctx.fillStyle = `rgba(226, 232, 240, ${state.haze * 0.5})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.restore();
  }

  window.wf1Redraw = draw;
  draw();

  // Mouse drag positioning on canvas
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    state.isDragging = true;
    state.dragStartX = mx - state.posX;
    state.dragStartY = my - state.posY;
    const hint = document.getElementById('wf1-hint');
    if (hint) hint.style.opacity = '0';
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    state.posX = (e.clientX - rect.left) * scaleX - state.dragStartX;
    state.posY = (e.clientY - rect.top) * scaleY - state.dragStartY;
    draw();
  });

  window.addEventListener('mouseup', () => {
    state.isDragging = false;
  });

  // Controls bindings
  document.querySelectorAll('[data-wf1-bg]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-wf1-bg]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.bgPreset = btn.getAttribute('data-wf1-bg');
      state.customBg = null;
      updatePromptWf1();
      draw();
    });
  });

  document.querySelectorAll('[data-wf1-mass]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-wf1-mass]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.massPreset = btn.getAttribute('data-wf1-mass');
      state.customMass = null;
      updatePromptWf1();
      draw();
    });
  });

  // Sliders
  const scaleSlider = document.getElementById('wf1-scale');
  const scaleVal = document.getElementById('wf1-scale-val');
  scaleSlider.addEventListener('input', (e) => {
    state.scale = parseInt(e.target.value, 10) / 100;
    scaleVal.textContent = `${e.target.value}%`;
    draw();
  });

  const opSlider = document.getElementById('wf1-opacity');
  const opVal = document.getElementById('wf1-opacity-val');
  opSlider.addEventListener('input', (e) => {
    state.opacity = parseInt(e.target.value, 10) / 100;
    opVal.textContent = `${e.target.value}%`;
    draw();
  });

  const shadowSlider = document.getElementById('wf1-shadow');
  const shadowVal = document.getElementById('wf1-shadow-val');
  shadowSlider.addEventListener('input', (e) => {
    state.shadow = parseInt(e.target.value, 10) / 100;
    shadowVal.textContent = `${e.target.value}%`;
    draw();
  });

  const hazeSlider = document.getElementById('wf1-haze');
  const hazeVal = document.getElementById('wf1-haze-val');
  hazeSlider.addEventListener('input', (e) => {
    state.haze = parseInt(e.target.value, 10) / 100;
    hazeVal.textContent = `${e.target.value}%`;
    draw();
  });

  // Synthesize Action
  const btnSynth = document.getElementById('wf1-btn-synthesize');
  const statusText = document.getElementById('wf1-status-text');
  btnSynth.addEventListener('click', () => {
    state.isSynthesized = !state.isSynthesized;
    if (state.isSynthesized) {
      btnSynth.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Toma Fotorrealista Generada (Ver Modo Original)
      `;
      btnSynth.classList.add('active');
      statusText.textContent = 'Renderizado Fotorrealista Aplicado (Texturas 4K y vegetación integrada)';
    } else {
      btnSynth.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
        Sintetizar Toma Aérea Fotorrealista
      `;
      btnSynth.classList.remove('active');
      statusText.textContent = 'Modo Composición Interactiva (Arrastra el edificio para posicionarlo)';
    }
    draw();
  });

  // Reset
  document.getElementById('wf1-btn-reset').addEventListener('click', () => {
    state.posX = 512;
    state.posY = 330;
    state.scale = 1.0;
    state.opacity = 1.0;
    scaleSlider.value = 100;
    scaleSlider.dispatchEvent(new Event('input'));
    opSlider.value = 100;
    opSlider.dispatchEvent(new Event('input'));
    state.isSynthesized = false;
    draw();
  });

  // File Uploads
  document.getElementById('wf1-bg-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.customBg = img;
        draw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('wf1-mass-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.customMass = img;
        draw();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Download Image
  document.getElementById('wf1-btn-download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `archflow-drone-photomatch-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  function updatePromptWf1() {
    const p = document.getElementById('wf1-prompt-text');
    if (!p) return;
    let massDesc = "contemporary glass and timber pavilion";
    if (state.massPreset === 'brutalist') massDesc = "cantilevered brutalist raw concrete cultural centre with ribbon glazing";
    if (state.massPreset === 'villa') massDesc = "minimalist stepped timber residential villa with panoramic terraces";

    let envDesc = "natural coastal cliffside topography overlooking the ocean";
    if (state.bgPreset === 'urban') envDesc = "high-density metropolitan urban park with surrounding street architecture";
    if (state.bgPreset === 'forest') envDesc = "dense pine forest alpine valley clearing with mountain terrain";

    p.textContent = `High-angle architectural drone photography of a ${massDesc} seamlessly integrated into the ${envDesc}. Crisp natural daylight, 4k ultra-realistic vegetation, photorealistic asphalt pathways, volumetric sun haze, Hasselblad 24mm aerial lens perspective, realistic environmental reflection on double-glazed facades --ar 16:9 --style raw --v 6.1`;
  }
}

// =============================================================================
// WORKFLOW 2: Day-to-Night Architectural Timelapse
// =============================================================================
function initWorkflow2() {
  const container = document.getElementById('wf2-split-container');
  const divider = document.getElementById('wf2-divider');
  const nightLayer = document.getElementById('wf2-night-layer');
  const dayLayer = document.getElementById('wf2-day-layer');
  const timeSlider = document.getElementById('wf2-time-slider');
  const timeLabel = document.getElementById('wf2-time-label');
  const lightingBadge = document.getElementById('wf2-lighting-state');
  const playBtn = document.getElementById('wf2-play-btn');

  if (!container || !divider || !nightLayer || !dayLayer) return;

  let currentScene = 'museum';
  let isPlaying = false;
  let playInterval = null;
  let mode = 'split'; // 'split' or 'timelapse'

  // Procedural CSS images for Day & Night scenes
  const scenes = {
    museum: {
      day: 'radial-gradient(ellipse at 70% 30%, #fef08a 0%, #38bdf8 45%, #0284c7 100%)',
      night: 'radial-gradient(ellipse at 50% 100%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
    },
    residence: {
      day: 'radial-gradient(ellipse at 30% 20%, #fed7aa 0%, #60a5fa 50%, #1e3a8a 100%)',
      night: 'radial-gradient(ellipse at 70% 80%, #312e81 0%, #111827 60%, #030712 100%)'
    },
    tower: {
      day: 'radial-gradient(ellipse at 50% 30%, #e0f2fe 0%, #0284c7 60%, #0369a1 100%)',
      night: 'radial-gradient(ellipse at 50% 60%, #4338ca 0%, #090d16 60%, #000000 100%)'
    }
  };

  // Render SVG Architectural Plates into Layers
  function updateSceneLayers() {
    const s = scenes[currentScene];
    // Create rich SVG overlays with architectural building geometry
    const daySvg = createArchSvg(currentScene, 'day');
    const nightSvg = createArchSvg(currentScene, 'night');

    dayLayer.style.background = `${daySvg}, ${s.day}`;
    nightLayer.style.background = `${nightSvg}, ${s.night}`;
  }

  function createArchSvg(scene, time) {
    const isDay = time === 'day';
    const winColor = isDay ? 'rgba(255, 255, 255, 0.4)' : '#fbbf24';
    const winGlow = isDay ? 'none' : 'drop-shadow(0 0 14px rgba(251, 191, 36, 0.9))';
    const wallColor = isDay ? '#94a3b8' : '#334155';
    const groundColor = isDay ? '#3f6212' : '#052e16';

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 640" width="1024" height="640">
        <!-- Ground plane -->
        <polygon points="0,480 1024,460 1024,640 0,640" fill="${groundColor}" />
        <rect x="0" y="510" width="1024" height="130" fill="${isDay ? '#475569' : '#1e293b'}" />
        
        <!-- Architectural Building Structure -->
        <g id="architecture">
          <!-- Main Gallery Volume -->
          <polygon points="220,240 780,210 820,490 200,490" fill="${wallColor}" />
          <!-- Cantilever Roof -->
          <polygon points="160,230 840,200 850,250 150,260" fill="${isDay ? '#f8fafc' : '#1e293b'}" />
          <!-- Floor to Ceiling Glass Windows -->
          <polygon points="240,280 760,250 780,470 240,470" fill="${winColor}" style="filter: ${winGlow};" />
          <!-- Window Mullions Grid -->
          <line x1="370" y1="270" x2="370" y2="470" stroke="#0f172a" stroke-width="4" />
          <line x1="500" y1="260" x2="500" y2="470" stroke="#0f172a" stroke-width="4" />
          <line x1="630" y1="255" x2="630" y2="470" stroke="#0f172a" stroke-width="4" />
        </g>
        
        ${!isDay ? `
        <!-- Landscape uplights at night -->
        <circle cx="280" cy="495" r="4" fill="#fde047" />
        <polygon points="275,495 285,495 320,380 240,380" fill="rgba(253, 224, 71, 0.25)" />
        <circle cx="720" cy="485" r="4" fill="#fde047" />
        <polygon points="715,485 725,485 760,370 680,370" fill="rgba(253, 224, 71, 0.25)" />
        ` : ''}
      </svg>
    `;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svgString)}")`;
  }

  updateSceneLayers();
  window.wf2Redraw = updateSceneLayers;

  // Split Divider Dragging
  let isDividerDragging = false;

  function updateSplitPosition(pct) {
    pct = Math.max(0, Math.min(100, pct));
    divider.style.left = `${pct}%`;
    nightLayer.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
  }

  divider.addEventListener('mousedown', () => { isDividerDragging = true; });
  window.addEventListener('mousemove', (e) => {
    if (!isDividerDragging) return;
    const rect = container.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    updateSplitPosition(pct);
  });
  window.addEventListener('mouseup', () => { isDividerDragging = false; });

  // Mode Switching (Split vs Timelapse)
  const modeSplitBtn = document.getElementById('wf2-mode-split');
  const modeTimelapseBtn = document.getElementById('wf2-mode-timelapse');

  modeSplitBtn.addEventListener('click', () => {
    mode = 'split';
    modeSplitBtn.classList.add('active');
    modeTimelapseBtn.classList.remove('active');
    divider.style.display = 'block';
    updateSplitPosition(50);
  });

  modeTimelapseBtn.addEventListener('click', () => {
    mode = 'timelapse';
    modeTimelapseBtn.classList.add('active');
    modeSplitBtn.classList.remove('active');
    divider.style.display = 'none';
    syncTimelapseFromSlider();
  });

  // Timelapse Time Slider
  function syncTimelapseFromSlider() {
    const val = parseInt(timeSlider.value, 10);
    // 0 = 06:00, 30 = 12:00, 60 = 18:00 (Sunset), 80 = 21:00 (Night), 100 = 24:00
    let hours = 6 + (val / 100) * 18;
    let hh = Math.floor(hours);
    let mm = Math.floor((hours - hh) * 60);
    let timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

    if (val < 25) {
      timeLabel.textContent = `${timeStr} (Amanecer / Mañana)`;
      lightingBadge.textContent = 'Luz Solar Baja y Sombras Largas';
      lightingBadge.className = 'badge-lighting day';
    } else if (val < 55) {
      timeLabel.textContent = `${timeStr} (Mediodía Solar)`;
      lightingBadge.textContent = 'Luz Cenital Directa 5600K';
      lightingBadge.className = 'badge-lighting day';
    } else if (val < 75) {
      timeLabel.textContent = `${timeStr} (Golden Hour / Atardecer)`;
      lightingBadge.textContent = 'Luz Dorada Rasante 3200K';
      lightingBadge.className = 'badge-lighting day';
    } else {
      timeLabel.textContent = `${timeStr} (Noche Azulada)`;
      lightingBadge.textContent = 'Luz Artificial Interior 3000K Encendida';
      lightingBadge.className = 'badge-lighting night';
    }

    if (mode === 'timelapse') {
      // In timelapse mode, we blend night layer opacity
      const nightOpacity = Math.max(0, (val - 45) / 55);
      nightLayer.style.clipPath = 'none';
      nightLayer.style.opacity = nightOpacity;
    }
  }

  timeSlider.addEventListener('input', syncTimelapseFromSlider);

  // Play/Pause Timelapse Loop
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.classList.add('active');
      playBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/></svg>
        <span>Pausar Animación</span>
      `;
      // Switch to timelapse mode automatically
      modeTimelapseBtn.click();

      playInterval = setInterval(() => {
        let v = parseInt(timeSlider.value, 10) + 1;
        if (v > 100) v = 0;
        timeSlider.value = v;
        timeSlider.dispatchEvent(new Event('input'));
      }, 50);
    } else {
      playBtn.classList.remove('active');
      playBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Reproducir Timelapse</span>
      `;
      clearInterval(playInterval);
    }
  });

  // Scene presets
  document.querySelectorAll('[data-wf2-scene]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-wf2-scene]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentScene = btn.getAttribute('data-wf2-scene');
      updateSceneLayers();
    });
  });

  // Export frame
  document.getElementById('wf2-download-btn').addEventListener('click', () => {
    alert('Fotograma exportado con configuración de iluminación arquitectónica.');
  });
}

// =============================================================================
// WORKFLOW 3: Micro-Enhance & Texture Refinement (Precision Inpainting)
// =============================================================================
function initWorkflow3() {
  const canvas = document.getElementById('wf3-canvas');
  const stage = document.getElementById('wf3-magnifier-stage');
  const lens = document.getElementById('wf3-lens');
  if (!canvas || !stage || !lens) return;

  const ctx = canvas.getContext('2d');

  let currentPreset = 'concrete';
  let hallucination = 2;
  let sharpness = 70;
  let reflections = 65;
  let imperfections = 30;

  function drawRender() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentPreset === 'concrete') {
      // Board-formed Architectural Concrete
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Horizontal formwork seams
      for (let y = 100; y < canvas.height; y += 120) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, y, canvas.width, 4);

        // Tie-rod holes (puntos de anclaje de encofrado)
        for (let x = 120; x < canvas.width; x += 180) {
          ctx.beginPath();
          ctx.arc(x, y + 2, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#94a3b8';
          ctx.stroke();
        }
      }

      // Micro-texture bump noise simulation
      if (sharpness > 0) {
        const idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = idata.data;
        const factor = (sharpness / 100) * 18;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * factor;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(idata, 0, 0);
      }

      // Sun cast shadow diagonal
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(750, 0);
      ctx.lineTo(200, 640);
      ctx.lineTo(0, 640);
      ctx.closePath();
      ctx.fill();

    } else if (currentPreset === 'facade') {
      // Steel & Glass Curtain Wall
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glass panels
      for (let x = 80; x < canvas.width; x += 220) {
        for (let y = 60; y < canvas.height; y += 160) {
          const grad = ctx.createLinearGradient(x, y, x + 180, y + 130);
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(1, '#0c4a6e');
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, 190, 130);

          // Specular reflection streak
          ctx.fillStyle = `rgba(255, 255, 255, ${reflections / 250})`;
          ctx.beginPath();
          ctx.moveTo(x + 20, y);
          ctx.lineTo(x + 60, y);
          ctx.lineTo(x + 150, y + 130);
          ctx.lineTo(x + 110, y + 130);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Steel mullions
      ctx.fillStyle = '#334155';
      for (let x = 70; x < canvas.width; x += 220) {
        ctx.fillRect(x, 0, 10, canvas.height);
      }
      for (let y = 50; y < canvas.height; y += 160) {
        ctx.fillRect(0, y, canvas.width, 10);
      }

    } else if (currentPreset === 'interior') {
      // Loft Interior with Timber Louvers
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Hardwood floor
      const floorGrad = ctx.createLinearGradient(0, 360, 0, 640);
      floorGrad.addColorStop(0, '#78350f');
      floorGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 360, canvas.width, 280);

      // Wooden vertical battens
      ctx.fillStyle = '#b45309';
      for (let x = 120; x < 600; x += 28) {
        ctx.fillRect(x, 40, 14, 320);
      }
    }
  }

  window.wf3Redraw = drawRender;
  drawRender();

  // Hallucination slider & Zone warnings
  const hallSlider = document.getElementById('wf3-hallucination');
  const hallVal = document.getElementById('wf3-hallucination-val');
  const zoneDesc = document.getElementById('wf3-zone-desc');

  hallSlider.addEventListener('input', (e) => {
    hallucination = parseInt(e.target.value, 10);

    if (hallucination <= 3) {
      hallVal.textContent = `Nivel ${hallucination} (Fidelidad 100%)`;
      hallVal.className = 'badge-safe';
      zoneDesc.className = 'param-hint';
      zoneDesc.innerHTML = '<strong>Zona Segura (Recomendada):</strong> Preserva 100% las líneas estructurales y cotas del arquitecto. Sólo añade micro-rugosidades e imperfecciones realistas en materiales existentes.';
    } else if (hallucination <= 6) {
      hallVal.textContent = `Nivel ${hallucination} (Moderado)`;
      hallVal.className = 'badge-safe mid';
      zoneDesc.className = 'param-hint';
      zoneDesc.style.borderLeftColor = 'var(--accent-amber)';
      zoneDesc.innerHTML = '<strong>Zona Moderada:</strong> Puede cambiar sutilmente el tipo de vegetación o luminarias, pero respeta la masa del proyecto.';
    } else {
      hallVal.textContent = `Nivel ${hallucination} (¡Alucinación Alta!)`;
      hallVal.className = 'badge-safe danger';
      zoneDesc.className = 'param-hint';
      zoneDesc.style.borderLeftColor = 'var(--accent-rose)';
      zoneDesc.innerHTML = '<strong>¡Alerta de Alucinación!:</strong> La IA comenzará a deformar carpinterías, inventar columnas y cambiar proporciones geométricas. No apto para entregas de arquitectura rigurosas.';
    }
  });

  // Detail Sliders
  document.getElementById('wf3-sharpness').addEventListener('input', (e) => {
    sharpness = parseInt(e.target.value, 10);
    document.getElementById('wf3-sharpness-val').textContent = `${sharpness}%`;
    drawRender();
  });

  document.getElementById('wf3-reflections').addEventListener('input', (e) => {
    reflections = parseInt(e.target.value, 10);
    document.getElementById('wf3-reflections-val').textContent = `${reflections}%`;
    drawRender();
  });

  document.getElementById('wf3-imperfections').addEventListener('input', (e) => {
    imperfections = parseInt(e.target.value, 10);
    document.getElementById('wf3-imperfections-val').textContent = `${imperfections}%`;
    drawRender();
  });

  // Presets
  document.querySelectorAll('[data-wf3-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-wf3-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPreset = btn.getAttribute('data-wf3-preset');
      drawRender();
    });
  });

  // Inspector Lens (Magnifier 2X Zoom Tool)
  stage.addEventListener('mouseenter', () => { lens.style.display = 'block'; });
  stage.addEventListener('mouseleave', () => { lens.style.display = 'none'; });

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lens.style.left = `${x}px`;
    lens.style.top = `${y}px`;

    // Lens background zoom
    const zoom = 2.5;
    lens.style.backgroundImage = `url(${canvas.toDataURL()})`;
    lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
    lens.style.backgroundPosition = `-${x * zoom - 80}px -${y * zoom - 80}px`;
  });

  document.getElementById('wf3-btn-apply').addEventListener('click', () => {
    sharpness = 95;
    reflections = 85;
    document.getElementById('wf3-sharpness').value = 95;
    document.getElementById('wf3-sharpness').dispatchEvent(new Event('input'));
    document.getElementById('wf3-reflections').value = 85;
    document.getElementById('wf3-reflections').dispatchEvent(new Event('input'));
    drawRender();
    alert('Micro-enhancement 4K calculado. Inspecciona con el lente el grano y las juntas.');
  });

  document.getElementById('wf3-download-btn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `archflow-enhanced-4k-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

// =============================================================================
// Copy to Clipboard Utility
// =============================================================================
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const text = targetEl.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          ¡Copiado!
        `;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      });
    });
  });
}
