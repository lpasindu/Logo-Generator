import JSZip from 'jszip';
import { COUNTRIES } from '../data/countries';

export async function generatePortablePcZip(): Promise<Blob> {
  const zip = new JSZip();

  // Create instructions file
  const readmeContent = `========================================================================
WORLD FLAG SEAL & BADGE STUDIO - PORTABLE PC EDITION
========================================================================

Thank you for downloading the Portable PC version!

HOW TO USE ON YOUR PC (NO INSTALLATION & 100% OFFLINE):
1. Extract all files from this .zip archive into any folder on your PC, 
   desktop, or USB flash drive.
2. Windows users: Double-click "Launch_Badge_Studio_Windows.bat"
   Mac users: Double-click "Launch_Badge_Studio_Mac.command"
   Or simply double-click "index.html" in Google Chrome, Microsoft Edge,
   Mozilla Firefox, Brave, or Safari.
3. Everything runs locally inside your browser!
   - No internet connection required.
   - No server, node.js, or complex software installation needed.
   - High-resolution transparent PNG badge exports.
   - Individual country flag position isolation.
   - Custom template upload & curved typography engine.

FEATURES INCLUDED:
- 250+ Sovereign Nations & Territory flags with offline vector fallbacks
- Authentic Gold Medallion, Silver Seal, Bronze Vintage, and Royal Navy badges
- 3D Convex Dome Depth and Specular Glass Reflection
- Curved top & bottom arc text generator with independent font sizing
- Direct PNG download and batch country packaging
- Full offline capability

========================================================================
`;

  // Windows 1-click launcher
  const batLauncher = `@echo off
title World Flag Seal & Badge Studio - Portable PC
echo ========================================================================
echo   Launching World Flag Seal & Badge Studio (Portable PC Edition)...
echo ========================================================================
start "" "index.html"
exit
`;

  // macOS / Linux 1-click launcher
  const macLauncher = `#!/bin/bash
cd "$(dirname "$0")"
echo "Launching World Flag Seal & Badge Studio..."
open "index.html" || xdg-open "index.html"
`;

  // Generate self-contained standalone offline HTML application
  const offlineHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>World Flag Seal &amp; Badge Studio - Portable PC Edition</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #020617;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f59e0b, #b45309);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }
    .tag {
      font-size: 10px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 600;
      margin-left: 8px;
    }
    .main-layout {
      display: grid;
      grid-template-columns: 280px 1fr 340px;
      flex: 1;
      height: calc(100vh - 61px);
      overflow: hidden;
    }
    @media (max-width: 1024px) {
      .main-layout { grid-template-columns: 1fr; height: auto; overflow: auto; }
    }
    .sidebar-left {
      background: #090e1a;
      border-right: 1px solid #1e293b;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .preview-center {
      background: #020617;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
    }
    .sidebar-right {
      background: #090e1a;
      border-left: 1px solid #1e293b;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .canvas-container {
      width: 100%;
      max-width: 520px;
      aspect-ratio: 1/1;
      border-radius: 20px;
      background: radial-gradient(circle, rgba(30, 41, 59, 0.5) 0%, rgba(2, 6, 23, 0.8) 100%);
      border: 1px solid #1e293b;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    canvas {
      width: 90%;
      height: 90%;
      object-fit: contain;
      filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6));
    }
    .search-box {
      width: 100%;
      padding: 8px 12px;
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 8px;
      color: #fff;
      font-size: 12px;
      outline: none;
    }
    .search-box:focus { border-color: #f59e0b; }
    .country-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
      flex: 1;
    }
    .country-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid transparent;
      border-radius: 8px;
      color: #cbd5e1;
      font-size: 12px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .country-btn:hover {
      background: #1e293b;
      color: #fff;
    }
    .country-btn.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      color: #fde68a;
      font-weight: 600;
    }
    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #020617;
      font-weight: 700;
      padding: 10px 16px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
      transition: all 0.15s ease;
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }
    .btn-secondary {
      background: #1e293b;
      color: #e2e8f0;
      font-weight: 600;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #334155;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.15s ease;
    }
    .btn-secondary:hover { background: #334155; color: #fff; }
    .control-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .control-title {
      font-size: 12px;
      font-weight: 700;
      color: #fbbf24;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .range-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .range-group label {
      font-size: 11px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    input[type="range"] {
      accent-color: #f59e0b;
      cursor: pointer;
    }
    .input-text {
      background: #020617;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 6px 10px;
      color: #fff;
      font-size: 12px;
      outline: none;
    }
    .input-text:focus { border-color: #f59e0b; }
    .isolated-badge {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 11px;
      color: #fde68a;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">★</div>
      <div>
        <span class="brand-title">World Flag Seal &amp; Badge Studio</span>
        <span class="tag">Portable PC Edition</span>
      </div>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <button class="btn-primary" onclick="downloadBadgePNG()">
        <span>Download Transparent PNG</span>
      </button>
    </div>
  </header>

  <div class="main-layout">
    <!-- Left: Country Selection -->
    <div class="sidebar-left">
      <div style="font-size: 12px; font-weight: 700; color: #fff;">1. Choose Country Flag</div>
      <input type="text" id="countrySearch" class="search-box" placeholder="Search countries..." oninput="filterCountries()">
      <div class="country-list" id="countryList"></div>
    </div>

    <!-- Center: Interactive Badge Canvas -->
    <div class="preview-center">
      <div class="canvas-container">
        <canvas id="badgeCanvas" width="1024" height="1024"></canvas>
      </div>
      <div style="margin-top: 14px; font-size: 11px; color: #64748b;">
        Drag directly on canvas to reposition the center flag | Clean Transparent PNG Export
      </div>
    </div>

    <!-- Right: Isolated Flag Controls & Typography -->
    <div class="sidebar-right">
      <div class="isolated-badge">
        <strong>Isolated Flag Positioning:</strong><br />
        Adjustments made to position, scale, and rotation are isolated to the active country flag and will not leak to other logos.
      </div>

      <!-- Flag Positioning Card -->
      <div class="control-card">
        <div class="control-title">
          <span>Flag Position (<span id="activeCountryName">USA</span>)</span>
          <button class="btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="resetCurrentPosition()">Reset</button>
        </div>
        
        <div class="range-group">
          <label><span>Horizontal Offset (X):</span><span id="xVal">0px</span></label>
          <input type="range" id="flagX" min="-150" max="150" value="0" oninput="updateFlagSetting('x', this.value)">
        </div>

        <div class="range-group">
          <label><span>Vertical Offset (Y):</span><span id="yVal">0px</span></label>
          <input type="range" id="flagY" min="-150" max="150" value="0" oninput="updateFlagSetting('y', this.value)">
        </div>

        <div class="range-group">
          <label><span>Flag Zoom Scale:</span><span id="scaleVal">100%</span></label>
          <input type="range" id="flagScale" min="0.5" max="2.2" step="0.05" value="1.0" oninput="updateFlagSetting('scale', this.value)">
        </div>

        <div class="range-group">
          <label><span>3D Glass Dome Depth:</span><span id="domeVal">45%</span></label>
          <input type="range" id="flagDome" min="0" max="1" step="0.05" value="0.45" oninput="updateDome(this.value)">
        </div>
      </div>

      <!-- Curved Typography Card -->
      <div class="control-card">
        <div class="control-title">
          <span>Curved Typography</span>
        </div>

        <div class="range-group">
          <label>Top Arc Template:</label>
          <input type="text" id="topText" class="input-text" value="MADE IN {COUNTRY}" oninput="renderBadge()">
        </div>

        <div class="range-group">
          <label>Bottom Arc Template:</label>
          <input type="text" id="bottomText" class="input-text" value="MADE IN {COUNTRY}" oninput="renderBadge()">
        </div>

        <div class="range-group">
          <label><span>Top Font Size:</span><span id="topFontVal">58px</span></label>
          <input type="range" id="topFontSize" min="28" max="96" value="58" oninput="updateFontSize('top', this.value)">
        </div>

        <div class="range-group">
          <label><span>Bottom Font Size:</span><span id="bottomFontVal">58px</span></label>
          <input type="range" id="bottomFontSize" min="28" max="96" value="58" oninput="updateFontSize('bottom', this.value)">
        </div>
      </div>

      <!-- Badge Style Card -->
      <div class="control-card">
        <div class="control-title">
          <span>Badge Metallic Rim</span>
        </div>
        <select id="badgeStyle" class="input-text" onchange="renderBadge()">
          <option value="gold">Gold Medallion</option>
          <option value="silver">Silver Seal</option>
          <option value="bronze">Bronze Vintage</option>
          <option value="navy">Royal Navy</option>
        </select>
      </div>
    </div>
  </div>

  <script>
    // Embedded Country Catalog
    const COUNTRIES = ${JSON.stringify(COUNTRIES.map(c => ({
      code: c.code,
      name: c.name,
      shortName: c.shortName,
      region: c.region
    })))};

    let selectedCountry = COUNTRIES[0]; // USA
    
    // Per-country isolated settings store
    const countryCustomizations = {};

    function getCountrySettings(code) {
      if (!countryCustomizations[code]) {
        countryCustomizations[code] = {
          flagOffsetX: 0,
          flagOffsetY: 0,
          flagScale: 1.0,
          flagRotation: 0,
          topFontSize: 58,
          bottomFontSize: 58
        };
      }
      return countryCustomizations[code];
    }

    const canvas = document.getElementById('badgeCanvas');
    const ctx = canvas.getContext('2d');

    // Filter country list in sidebar
    function filterCountries() {
      const q = document.getElementById('countrySearch').value.toLowerCase().trim();
      const listEl = document.getElementById('countryList');
      listEl.innerHTML = '';
      
      const filtered = COUNTRIES.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.shortName.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q)
      );

      filtered.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'country-btn' + (c.code === selectedCountry.code ? ' active' : '');
        btn.onclick = () => selectCountry(c);
        btn.innerHTML = \`
          <img src="https://flagcdn.com/w80/\${c.code.toLowerCase()}.png" width="20" height="15" style="border-radius: 3px; object-fit: cover;" onerror="this.style.display='none'">
          <span>\${c.name}</span>
        \`;
        listEl.appendChild(btn);
      });
    }

    function selectCountry(c) {
      selectedCountry = c;
      document.getElementById('activeCountryName').innerText = c.shortName;
      
      // Load this country's isolated position
      const cfg = getCountrySettings(c.code);
      document.getElementById('flagX').value = cfg.flagOffsetX;
      document.getElementById('flagY').value = cfg.flagOffsetY;
      document.getElementById('flagScale').value = cfg.flagScale;
      document.getElementById('xVal').innerText = (cfg.flagOffsetX > 0 ? '+' : '') + cfg.flagOffsetX + 'px';
      document.getElementById('yVal').innerText = (cfg.flagOffsetY > 0 ? '+' : '') + cfg.flagOffsetY + 'px';
      document.getElementById('scaleVal').innerText = Math.round(cfg.flagScale * 100) + '%';
      
      filterCountries();
      renderBadge();
    }

    function updateFlagSetting(prop, val) {
      const cfg = getCountrySettings(selectedCountry.code);
      if (prop === 'x') {
        cfg.flagOffsetX = parseInt(val, 10);
        document.getElementById('xVal').innerText = (cfg.flagOffsetX > 0 ? '+' : '') + cfg.flagOffsetX + 'px';
      } else if (prop === 'y') {
        cfg.flagOffsetY = parseInt(val, 10);
        document.getElementById('yVal').innerText = (cfg.flagOffsetY > 0 ? '+' : '') + cfg.flagOffsetY + 'px';
      } else if (prop === 'scale') {
        cfg.flagScale = parseFloat(val);
        document.getElementById('scaleVal').innerText = Math.round(cfg.flagScale * 100) + '%';
      }
      renderBadge();
    }

    function resetCurrentPosition() {
      const cfg = getCountrySettings(selectedCountry.code);
      cfg.flagOffsetX = 0;
      cfg.flagOffsetY = 0;
      cfg.flagScale = 1.0;
      document.getElementById('flagX').value = 0;
      document.getElementById('flagY').value = 0;
      document.getElementById('flagScale').value = 1.0;
      document.getElementById('xVal').innerText = '0px';
      document.getElementById('yVal').innerText = '0px';
      document.getElementById('scaleVal').innerText = '100%';
      renderBadge();
    }

    function updateFontSize(pos, val) {
      const cfg = getCountrySettings(selectedCountry.code);
      if (pos === 'top') {
        cfg.topFontSize = parseInt(val, 10);
        document.getElementById('topFontVal').innerText = val + 'px';
      } else {
        cfg.bottomFontSize = parseInt(val, 10);
        document.getElementById('bottomFontVal').innerText = val + 'px';
      }
      renderBadge();
    }

    let flagDomeIntensity = 0.45;
    function updateDome(val) {
      flagDomeIntensity = parseFloat(val);
      document.getElementById('domeVal').innerText = Math.round(flagDomeIntensity * 100) + '%';
      renderBadge();
    }

    const flagImageCache = {};

    function getFlagImage(country, callback) {
      if (flagImageCache[country.code]) {
        callback(flagImageCache[country.code]);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        flagImageCache[country.code] = img;
        callback(img);
      };
      img.onerror = () => {
        // Fallback: draw vector flag if offline or network blocked
        callback(null);
      };
      img.src = 'https://flagcdn.com/w640/' + country.code.toLowerCase() + '.png';
    }

    function drawCurvedText(ctx, text, cx, cy, radius, startAngle, maxSpan, isReversed, fontSize) {
      ctx.save();
      ctx.font = 'bold ' + fontSize + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#020617';

      const chars = text.split('');
      const charWidths = chars.map(ch => ctx.measureText(ch).width + 2);
      const totalWidth = charWidths.reduce((a, b) => a + b, 0);
      const totalAngle = Math.min(maxSpan, totalWidth / radius);

      let curAngle = startAngle - totalAngle / 2;
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const chAngle = charWidths[i] / radius;
        const midAngle = curAngle + chAngle / 2;

        ctx.save();
        const x = cx + radius * Math.cos(midAngle);
        const y = cy + radius * Math.sin(midAngle);
        ctx.translate(x, y);
        ctx.rotate(midAngle + (isReversed ? -Math.PI / 2 : Math.PI / 2));
        ctx.fillText(ch, 0, 0);
        ctx.restore();

        curAngle += chAngle;
      }
      ctx.restore();
    }

    function renderBadge() {
      ctx.clearRect(0, 0, 1024, 1024);
      const cx = 512;
      const cy = 512;
      const style = document.getElementById('badgeStyle').value;

      // 1. Outer rim
      const outerR = 480;
      const rimGrad = ctx.createRadialGradient(cx - 100, cy - 100, 50, cx, cy, outerR);
      if (style === 'gold') {
        rimGrad.addColorStop(0, '#fef08a');
        rimGrad.addColorStop(0.4, '#f59e0b');
        rimGrad.addColorStop(0.8, '#b45309');
        rimGrad.addColorStop(1.0, '#78350f');
      } else if (style === 'silver') {
        rimGrad.addColorStop(0, '#ffffff');
        rimGrad.addColorStop(0.4, '#e2e8f0');
        rimGrad.addColorStop(0.8, '#94a3b8');
        rimGrad.addColorStop(1.0, '#475569');
      } else if (style === 'bronze') {
        rimGrad.addColorStop(0, '#fed7aa');
        rimGrad.addColorStop(0.4, '#d97706');
        rimGrad.addColorStop(0.8, '#92400e');
        rimGrad.addColorStop(1.0, '#451a03');
      } else {
        rimGrad.addColorStop(0, '#93c5fd');
        rimGrad.addColorStop(0.4, '#2563eb');
        rimGrad.addColorStop(0.8, '#1e3a8a');
        rimGrad.addColorStop(1.0, '#0f172a');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Cog teeth
      ctx.save();
      ctx.strokeStyle = style === 'gold' ? '#fde047' : '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, outerR - 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 2. Inner cream/gold text band
      const bandR = outerR - 30;
      ctx.beginPath();
      ctx.arc(cx, cy, bandR, 0, Math.PI * 2);
      ctx.fillStyle = style === 'navy' ? '#1e293b' : '#fefce8';
      ctx.fill();

      // 3. Inner metal bevel
      const innerBevelR = 300;
      ctx.beginPath();
      ctx.arc(cx, cy, innerBevelR, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // 4. Center flag circular aperture
      const flagR = 270;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, flagR, 0, Math.PI * 2);
      ctx.clip();

      // Draw Flag with isolated position
      const cfg = getCountrySettings(selectedCountry.code);
      const fx = cx + cfg.flagOffsetX;
      const fy = cy + cfg.flagOffsetY;
      const fScale = cfg.flagScale;

      getFlagImage(selectedCountry, (img) => {
        if (img) {
          const w = flagR * 2.3 * fScale;
          const h = (w * img.naturalHeight) / img.naturalWidth;
          ctx.drawImage(img, fx - w / 2, fy - h / 2, w, h);
        } else {
          // Sovereign fallback vector
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(cx - flagR, cy - flagR, flagR * 2, flagR * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(selectedCountry.name, cx, cy);
        }

        // 3D Glass Dome Lighting & Specular Reflection
        if (flagDomeIntensity > 0) {
          const dome = ctx.createRadialGradient(cx - flagR * 0.3, cy - flagR * 0.3, 10, cx, cy, flagR);
          dome.addColorStop(0, 'rgba(255, 255, 255, ' + (flagDomeIntensity * 0.7) + ')');
          dome.addColorStop(0.5, 'rgba(255, 255, 255, ' + (flagDomeIntensity * 0.15) + ')');
          dome.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
          dome.addColorStop(1.0, 'rgba(0, 0, 0, ' + (flagDomeIntensity * 0.6) + ')');
          ctx.fillStyle = dome;
          ctx.fill();
        }

        ctx.restore(); // End flag clip

        // 5. Curved Text Arcs
        const topTemplate = document.getElementById('topText').value;
        const bottomTemplate = document.getElementById('bottomText').value;
        const topParsed = topTemplate.replace(/{COUNTRY}/gi, selectedCountry.shortName);
        const bottomParsed = bottomTemplate.replace(/{COUNTRY}/gi, selectedCountry.shortName);

        drawCurvedText(ctx, topParsed, cx, cy, 380, -Math.PI / 2, Math.PI * 0.75, false, cfg.topFontSize || 58);
        drawCurvedText(ctx, bottomParsed, cx, cy, 380, Math.PI / 2, Math.PI * 0.75, true, cfg.bottomFontSize || 58);
      });
    }

    function downloadBadgePNG() {
      const link = document.createElement('a');
      link.download = 'made_in_' + selectedCountry.code.toLowerCase() + '_badge.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    // Initialize
    filterCountries();
    renderBadge();
  </script>
</body>
</html>
`;

  zip.file('README_PORTABLE_PC.txt', readmeContent);
  zip.file('Launch_Badge_Studio_Windows.bat', batLauncher);
  zip.file('Launch_Badge_Studio_Mac.command', macLauncher);
  zip.file('index.html', offlineHtml);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}
