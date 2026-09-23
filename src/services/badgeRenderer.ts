import { Country } from '../data/countries';
import { BadgeStyleConfig, BadgeTextConfig, CustomFormatConfig, FlagSourceType } from '../types/badge';

// Pre-configured badge styles
export const BADGE_STYLES: Record<string, BadgeStyleConfig> = {
  gold_medallion: {
    id: 'gold_medallion',
    name: 'Classic Gold Medallion',
    description: 'Authentic 3D beveled gold coin badge matching the Layer 14 seal style',
    rimOuterColor: '#d6a849',
    rimMidColor: '#fce899',
    rimInnerColor: '#966e1b',
    bandColor: '#ebd284',
    textStyleMode: 'black_stamped',
    starsColor: '#2b261d',
    innerBevelColor: '#dfb75c',
    innerBorderWidth: 16,
    flagLighting: 'subtle_dome',
  },
  silver_seal: {
    id: 'silver_seal',
    name: 'Silver Platinum Seal',
    description: 'Polished rhodium silver metal medallion with deep engraving',
    rimOuterColor: '#a1a8b3',
    rimMidColor: '#f1f4f8',
    rimInnerColor: '#5c6370',
    bandColor: '#dce1e8',
    textStyleMode: 'black_stamped',
    starsColor: '#282c34',
    innerBevelColor: '#cbd1db',
    innerBorderWidth: 16,
    flagLighting: 'subtle_dome',
  },
  bronze_vintage: {
    id: 'bronze_vintage',
    name: 'Antique Bronze',
    description: 'Warm copper-bronze medal with rustic burnished finish',
    rimOuterColor: '#b06f3b',
    rimMidColor: '#e8aa74',
    rimInnerColor: '#633917',
    bandColor: '#cfa076',
    textStyleMode: 'black_stamped',
    starsColor: '#361e0b',
    innerBevelColor: '#bf7e49',
    innerBorderWidth: 16,
    flagLighting: 'subtle_dome',
  },
  royal_navy: {
    id: 'royal_navy',
    name: 'Royal Navy & Gold',
    description: 'Luxurious deep navy enamel ring flanked by double gold borders',
    rimOuterColor: '#d4a338',
    rimMidColor: '#fae38e',
    rimInnerColor: '#8a6214',
    bandColor: '#10223d',
    textStyleMode: 'gold_sheen',
    starsColor: '#eac057',
    innerBevelColor: '#d4a338',
    innerBorderWidth: 14,
    flagLighting: 'subtle_dome',
  },
};

// Flag image cache (stores loaded HTMLImageElements by source key)
const flagImageCache = new Map<string, HTMLImageElement>();

/**
 * Loads a flag image safely with CORS.
 * Defaults to 100% authentic, official sovereign state flags from FlagCDN (Never AI generated).
 * Also supports circular vector icons or user custom APIs.
 */
export async function loadFlagImage(
  countryCode: string,
  customFlagUrl?: string,
  flagSource: FlagSourceType = 'original_official'
): Promise<HTMLImageElement> {
  const code = countryCode.toLowerCase();
  const cacheKey = `${flagSource}:${customFlagUrl || code}`;
  const cached = flagImageCache.get(cacheKey);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }

  // Determine URL based on source preference
  let primaryUrl = customFlagUrl;
  let fallbackUrl = `https://flagcdn.com/w1280/${code}.png`;

  if (!primaryUrl) {
    if (flagSource === 'circular_vector') {
      // Stylized circular vector flags
      primaryUrl = `https://hatscripts.github.io/circle-flags/flags/${code}.svg`;
      fallbackUrl = `https://flagcdn.com/w1280/${code}.png`;
    } else {
      // 100% Authentic, Official Sovereign National Flags (FlagCDN high-res standard)
      // Real national flags with official coats of arms, stars, stripes & authentic colors
      primaryUrl = `https://flagcdn.com/w1280/${code}.png`;
      fallbackUrl = `https://flagcdn.com/${code}.svg`;
    }
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      flagImageCache.set(cacheKey, img);
      resolve(img);
    };
    img.onerror = () => {
      // Try secondary fallback URL
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        flagImageCache.set(cacheKey, fallbackImg);
        resolve(fallbackImg);
      };
      fallbackImg.onerror = () => {
        // Last resort: High-res FlagCDN w640
        const thirdImg = new Image();
        thirdImg.crossOrigin = 'anonymous';
        thirdImg.onload = () => {
          flagImageCache.set(cacheKey, thirdImg);
          resolve(thirdImg);
        };
        thirdImg.onerror = () => {
          // Final fallback: Canvas monogram
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = 400;
          fallbackCanvas.height = 400;
          const ctx = fallbackCanvas.getContext('2d');
          if (ctx) {
            ctx.beginPath();
            ctx.arc(200, 200, 200, 0, Math.PI * 2);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 100px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(countryCode.toUpperCase(), 200, 200);
          }
          const generatedImg = new Image();
          generatedImg.src = fallbackCanvas.toDataURL();
          generatedImg.onload = () => {
            flagImageCache.set(cacheKey, generatedImg);
            resolve(generatedImg);
          };
        };
        thirdImg.src = `https://flagcdn.com/w640/${code}.png`;
      };
      fallbackImg.src = fallbackUrl;
    };
    img.src = primaryUrl;
  });
}

/**
 * Formats country name based on casing preference
 */
export function formatCountryText(country: Country, format: BadgeTextConfig['nameFormat']): string {
  switch (format) {
    case 'SHORT':
      return country.shortName;
    case 'UPPERCASE_FULL':
      return country.name.toUpperCase();
    case 'STANDARD':
      return country.name;
    case 'ISO_CODE':
      return country.code;
    default:
      return country.shortName;
  }
}

/**
 * Replaces placeholders in text templates like "MADE IN {COUNTRY}"
 */
export function resolveTemplateText(template: string, country: Country, format: BadgeTextConfig['nameFormat']): string {
  const countryName = formatCountryText(country, format);
  let resolved = template.replace(/\{country\}/gi, countryName);
  resolved = resolved.replace(/\{name\}/gi, country.name);
  resolved = resolved.replace(/\{code\}/gi, country.code);
  return resolved.trim();
}

/**
 * Draws curved text along a circular arc with optical circular layout precision,
 * custom letter spacing, and symmetrical centering.
 */
function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  centerAngle: number, // in radians
  maxArcAngle: number, // in radians
  isBottomArc: boolean,
  baseFontSize: number,
  letterSpacing: number,
  fontFamily: string,
  styleMode: BadgeStyleConfig['textStyleMode'],
  customColor?: string
) {
  if (!text || !text.trim()) return;

  ctx.save();

  // Clean and prepare font string
  let currentFontSize = baseFontSize;
  const effectiveFontFamily = fontFamily.includes(' ') && !fontFamily.startsWith('"')
    ? `"${fontFamily}"`
    : fontFamily;

  ctx.font = `bold ${currentFontSize}px ${effectiveFontFamily}, "Montserrat", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Measure characters with letter spacing
  const chars = Array.from(text);
  const extraPerChar = letterSpacing || 0;
  
  // Calculate total arc span
  let totalSpan = 0;
  for (let i = 0; i < chars.length; i++) {
    const w = ctx.measureText(chars[i]).width + (i < chars.length - 1 ? extraPerChar : 0);
    totalSpan += w;
  }
  let totalAngle = totalSpan / radius;

  // Symmetrically scale down font size if text exceeds maximum allotted angular span
  if (totalAngle > maxArcAngle) {
    const scaleFactor = maxArcAngle / totalAngle;
    currentFontSize = Math.max(20, Math.floor(baseFontSize * scaleFactor));
    ctx.font = `bold ${currentFontSize}px ${effectiveFontFamily}, "Montserrat", sans-serif`;
    
    totalSpan = 0;
    const scaledExtra = extraPerChar * scaleFactor;
    for (let i = 0; i < chars.length; i++) {
      const w = ctx.measureText(chars[i]).width + (i < chars.length - 1 ? scaledExtra : 0);
      totalSpan += w;
    }
    totalAngle = totalSpan / radius;
  }

  // Calculate precise character widths and angles
  const charWidths = chars.map((c) => ctx.measureText(c).width);
  const effectiveSpacing = extraPerChar * (currentFontSize / baseFontSize);

  // Optical start angle calculation
  const totalArcLength = totalAngle * radius;
  let startAngle: number;

  if (!isBottomArc) {
    // Top Arc: starts at left and flows clockwise over 12 o'clock
    startAngle = centerAngle - (totalArcLength / 2) / radius;
  } else {
    // Bottom Arc: starts at bottom-left and flows from left to right along bottom curve
    // In canvas coordinates, left-to-right along bottom semicircle means decreasing angle towards 6 o'clock and beyond
    startAngle = centerAngle + (totalArcLength / 2) / radius;
  }

  let traversedDistance = 0;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const charW = charWidths[i];
    const halfCharAngle = (charW / 2) / radius;

    let charAngle: number;
    let textRotation: number;

    if (!isBottomArc) {
      // Top Arc: reads clockwise from left to right
      charAngle = startAngle + (traversedDistance / radius) + halfCharAngle;
      textRotation = charAngle + Math.PI / 2;
    } else {
      // Bottom Arc: advances naturally from bottom-left to bottom-right (unmirrored and upright)
      charAngle = startAngle - (traversedDistance / radius) - halfCharAngle;
      textRotation = charAngle - Math.PI / 2;
    }

    const x = centerX + radius * Math.cos(charAngle);
    const y = centerY + radius * Math.sin(charAngle);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(textRotation);

    // Apply text styling
    if (styleMode === 'black_stamped') {
      // Authentic stamped black ink with subtle recessed bevel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(char, 0, 1.5); // bottom highlight
      ctx.fillStyle = '#1c170f';
      ctx.fillText(char, 0, 0);
    } else if (styleMode === 'embossed_metallic') {
      // 3D stamped metal
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(char, 0, 2); // shadow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(char, 0, -1); // top specular
      ctx.fillStyle = '#7a5513';
      ctx.fillText(char, 0, 0);
    } else if (styleMode === 'gold_sheen') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(char, 0, 2);
      ctx.fillStyle = '#fae38e';
      ctx.fillText(char, 0, 0);
    } else if (styleMode === 'white_bold') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(char, 0, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(char, 0, 0);
    } else if (customColor) {
      ctx.fillStyle = customColor;
      ctx.fillText(char, 0, 0);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillText(char, 0, 0);
    }

    ctx.restore();

    traversedDistance += charW + effectiveSpacing;
  }

  ctx.restore();
}

/**
 * Draws a 5-pointed star
 */
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, color: string) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  // Draw star bevel
  ctx.fillStyle = color;
  ctx.fill();

  // Subtle 3D highlight on star
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders realistic 3D convex dome curvature and specular glass reflection sheen over the flag
 */
export function drawFlagSurfaceDomeAndReflection(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  domeIntensity: number,
  reflectionIntensity: number,
  reflectionAngleDeg: number = -35
) {
  if (domeIntensity <= 0 && reflectionIntensity <= 0) return;

  ctx.save();
  // Ensure we only draw inside the circular flag aperture
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // 1. Convex 3D Spherical Dome Effect
  if (domeIntensity > 0) {
    const clampedDome = Math.min(1.0, Math.max(0.0, domeIntensity));

    // Spherical convex curvature: Light hotspot offset towards upper-left
    const lightOffsetX = -radius * 0.28;
    const lightOffsetY = -radius * 0.28;
    const domeGrad = ctx.createRadialGradient(
      cx + lightOffsetX,
      cy + lightOffsetY,
      radius * 0.04,
      cx,
      cy,
      radius * 1.02
    );
    domeGrad.addColorStop(0.0, `rgba(255, 255, 255, ${0.48 * clampedDome})`);
    domeGrad.addColorStop(0.35, `rgba(255, 255, 255, ${0.12 * clampedDome})`);
    domeGrad.addColorStop(0.68, `rgba(0, 0, 0, ${0.06 * clampedDome})`);
    domeGrad.addColorStop(1.0, `rgba(0, 0, 0, ${0.46 * clampedDome})`);

    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Spherical perimeter rim depth shadow
    const rimShadow = ctx.createRadialGradient(
      cx,
      cy,
      radius * 0.68,
      cx,
      cy,
      radius
    );
    rimShadow.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
    rimShadow.addColorStop(0.75, `rgba(0, 0, 0, ${0.15 * clampedDome})`);
    rimShadow.addColorStop(1.0, `rgba(0, 0, 0, ${0.55 * clampedDome})`);

    ctx.fillStyle = rimShadow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Specular Glass / Reflection Sheen
  if (reflectionIntensity > 0) {
    const clampedRef = Math.min(1.0, Math.max(0.0, reflectionIntensity));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((reflectionAngleDeg * Math.PI) / 180);

    // Diagonal upper glass arc reflection glare
    const glassGrad = ctx.createLinearGradient(0, -radius, 0, radius * 0.3);
    glassGrad.addColorStop(0.0, `rgba(255, 255, 255, ${0.60 * clampedRef})`);
    glassGrad.addColorStop(0.45, `rgba(255, 255, 255, ${0.12 * clampedRef})`);
    glassGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    // Elliptical top-half glass dome reflection
    ctx.ellipse(0, -radius * 0.35, radius * 0.85, radius * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle opposite rim bounce light (bottom-right edge)
    const bounceGrad = ctx.createRadialGradient(0, radius * 0.9, radius * 0.05, 0, radius, radius * 0.4);
    bounceGrad.addColorStop(0.0, `rgba(255, 255, 255, ${0.28 * clampedRef})`);
    bounceGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = bounceGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Main Badge Rendering function onto a canvas
 * ALWAYS outputs completely transparent background outside the circular medallion!
 */
export async function renderBadgeToCanvas(
  canvas: HTMLCanvasElement,
  country: Country,
  style: BadgeStyleConfig,
  textConfig: BadgeTextConfig,
  customConfig?: CustomFormatConfig,
  targetSize = 1024,
  customFlagUrl?: string
): Promise<void> {
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // 1. Ensure absolute 100% transparent background
  ctx.clearRect(0, 0, targetSize, targetSize);

  const cx = targetSize / 2;
  const cy = targetSize / 2;
  const scale = targetSize / 1024;

  // Effective custom flag URL (from function arg or customConfig)
  const effectiveFlagUrl = customFlagUrl || customConfig?.customFlagUrl;

  // Load country flag (defaults to authentic sovereign flag from FlagCDN, or circular vector, or custom URL)
  const flagImg = await loadFlagImage(
    country.code,
    effectiveFlagUrl,
    textConfig.flagSource || 'original_official'
  );

  // Check if we are using an uploaded custom badge format
  if (customConfig && customConfig.imageElement && customConfig.imageSrc) {
    await renderCustomUploadedBadge(ctx, targetSize, country, flagImg, style, textConfig, customConfig);
    return;
  }

  // -------------------------------------------------------------
  // PROCEDURAL HIGH-FIDELITY BADGE (Matching Layer 14 gold medal)
  // -------------------------------------------------------------
  const outerRadius = 490 * scale;
  const textBandOuterRadius = 460 * scale;
  const flagRadius = textConfig.flagRadius * targetSize;
  const textRadius = (textConfig.topRadius * targetSize);
  const bottomTextRadius = (textConfig.bottomRadius * targetSize);

  // Outer Circular Base Clipping - ensures everything outside outerRadius is 100% transparent PNG!
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.clip();

  // Outer gold rim multi-stop gradient
  const outerGrad = ctx.createLinearGradient(
    cx - outerRadius,
    cy - outerRadius,
    cx + outerRadius,
    cy + outerRadius
  );
  outerGrad.addColorStop(0.0, '#faea98');
  outerGrad.addColorStop(0.2, '#d4a747');
  outerGrad.addColorStop(0.4, '#faea98');
  outerGrad.addColorStop(0.65, '#9a701d');
  outerGrad.addColorStop(0.85, '#fae58e');
  outerGrad.addColorStop(1.0, '#865e13');

  ctx.fillStyle = outerGrad;
  ctx.fill();

  // Outer beveled ring ridge
  ctx.lineWidth = 14 * scale;
  ctx.strokeStyle = '#614309';
  ctx.stroke();

  // Secondary inner bevel ridge of the rim
  ctx.beginPath();
  ctx.arc(cx, cy, 478 * scale, 0, Math.PI * 2);
  ctx.lineWidth = 4 * scale;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.stroke();

  // Text Band (Annulus) Surface
  ctx.beginPath();
  ctx.arc(cx, cy, textBandOuterRadius, 0, Math.PI * 2);
  ctx.fillStyle = style.bandColor;
  ctx.fill();

  // Metallic radial sheen on text band
  const sheenGrad = ctx.createConicGradient(-Math.PI / 4, cx, cy);
  sheenGrad.addColorStop(0.0, 'rgba(255, 248, 220, 0.45)');
  sheenGrad.addColorStop(0.25, 'rgba(168, 126, 36, 0.25)');
  sheenGrad.addColorStop(0.5, 'rgba(255, 248, 220, 0.45)');
  sheenGrad.addColorStop(0.75, 'rgba(150, 110, 27, 0.25)');
  sheenGrad.addColorStop(1.0, 'rgba(255, 248, 220, 0.45)');

  ctx.beginPath();
  ctx.arc(cx, cy, textBandOuterRadius, 0, Math.PI * 2);
  ctx.fillStyle = sheenGrad;
  ctx.fill();

  // Concentric brushed circular lines
  for (let r = Math.floor(flagRadius + 20 * scale); r < textBandOuterRadius - 10 * scale; r += 16 * scale) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 1 * scale;
    ctx.strokeStyle = 'rgba(120, 85, 20, 0.08)';
    ctx.stroke();
  }

  // Draw Top Curved Text: e.g. "MADE IN USA" (only if showTopText is true or not explicitly disabled)
  if (textConfig.showTopText !== false && textConfig.topTemplate && textConfig.topTemplate.trim()) {
    const topText = resolveTemplateText(textConfig.topTemplate, country, textConfig.nameFormat);
    const topRotationRad = ((textConfig.topTextRotation || 0) * Math.PI) / 180;
    const topCenterAngle = -Math.PI / 2 + topRotationRad;
    const topCenterY = cy + (textConfig.topTextOffsetY || 0) * scale;
    const topFontSize = (textConfig.topFontSize ?? textConfig.fontSize) * scale;
    drawCurvedText(
      ctx,
      topText,
      cx,
      topCenterY,
      textRadius,
      topCenterAngle,
      Math.PI * 0.78, // max arc ~140 degrees
      false,
      topFontSize,
      textConfig.letterSpacing * scale,
      textConfig.fontFamily,
      style.textStyleMode,
      style.customTextColor
    );
  }

  // Draw Bottom Curved Text: e.g. "MADE IN USA" (only if showBottomText is true or not explicitly disabled)
  if (textConfig.showBottomText !== false && textConfig.bottomTemplate && textConfig.bottomTemplate.trim()) {
    const bottomText = resolveTemplateText(textConfig.bottomTemplate, country, textConfig.nameFormat);
    const bottomRotationRad = ((textConfig.bottomTextRotation || 0) * Math.PI) / 180;
    const bottomCenterAngle = Math.PI / 2 + bottomRotationRad;
    const bottomCenterY = cy + (textConfig.bottomTextOffsetY || 0) * scale;
    const bottomFontSize = (textConfig.bottomFontSize ?? textConfig.fontSize) * scale;
    drawCurvedText(
      ctx,
      bottomText,
      cx,
      bottomCenterY,
      bottomTextRadius,
      bottomCenterAngle,
      Math.PI * 0.78,
      true,
      bottomFontSize,
      textConfig.letterSpacing * scale,
      textConfig.fontFamily,
      style.textStyleMode,
      style.customTextColor
    );
  }

  // Draw Separator Stars / Emblems
  if (textConfig.starType !== 'none') {
    const starDist = (textRadius + bottomTextRadius) / 2;
    const starSize = textConfig.starSize * scale;

    if (textConfig.starType === 'single_star') {
      // Left Star at 9 o'clock
      drawStar(ctx, cx - starDist, cy, 5, starSize, starSize * 0.45, style.starsColor);
      // Right Star at 3 o'clock
      drawStar(ctx, cx + starDist, cy, 5, starSize, starSize * 0.45, style.starsColor);
    } else if (textConfig.starType === 'three_stars') {
      // Left 3 stars
      [-22, 0, 22].forEach((offsetDeg) => {
        const rad = Math.PI + (offsetDeg * Math.PI) / 180;
        const sx = cx + starDist * Math.cos(rad);
        const sy = cy + starDist * Math.sin(rad);
        const sz = offsetDeg === 0 ? starSize : starSize * 0.75;
        drawStar(ctx, sx, sy, 5, sz, sz * 0.45, style.starsColor);
      });
      // Right 3 stars
      [-22, 0, 22].forEach((offsetDeg) => {
        const rad = (offsetDeg * Math.PI) / 180;
        const sx = cx + starDist * Math.cos(rad);
        const sy = cy + starDist * Math.sin(rad);
        const sz = offsetDeg === 0 ? starSize : starSize * 0.75;
        drawStar(ctx, sx, sy, 5, sz, sz * 0.45, style.starsColor);
      });
    } else if (textConfig.starType === 'dots') {
      ctx.fillStyle = style.starsColor;
      ctx.beginPath();
      ctx.arc(cx - starDist, cy, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + starDist, cy, starSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Flag Inner Bezel / Golden Grooved Rim
  const bevelWidth = style.innerBorderWidth * scale;
  const bevelOuter = flagRadius + bevelWidth;

  // Bevel outer ring
  const bevelGrad = ctx.createLinearGradient(
    cx - bevelOuter,
    cy - bevelOuter,
    cx + bevelOuter,
    cy + bevelOuter
  );
  bevelGrad.addColorStop(0.0, '#ffffff');
  bevelGrad.addColorStop(0.3, '#d4a844');
  bevelGrad.addColorStop(0.7, '#664a13');
  bevelGrad.addColorStop(1.0, '#faea98');

  ctx.beginPath();
  ctx.arc(cx, cy, bevelOuter, 0, Math.PI * 2);
  ctx.fillStyle = bevelGrad;
  ctx.fill();
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = '#4a3307';
  ctx.stroke();

  // Flag Inner Window: Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, flagRadius, 0, Math.PI * 2);
  ctx.clip();

  // Clear inner circle for crisp flag
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Draw country flag centered with object-fit: cover, offset panning, and zoom scale
  if (flagImg && flagImg.width > 0) {
    const fw = flagImg.naturalWidth || flagImg.width;
    const fh = flagImg.naturalHeight || flagImg.height;

    // Fill circle while maintaining aspect ratio and user zoom scale
    const flagZoom = textConfig.flagScale || 1.0;
    const diameter = flagRadius * 2 * flagZoom;
    const aspect = fw / fh;
    let dw: number;
    let dh: number;

    if (aspect > 1) {
      dh = diameter;
      dw = diameter * aspect;
    } else {
      dw = diameter;
      dh = diameter / aspect;
    }

    // Slight scale up (5%) to prevent any subpixel gaps at round borders
    dw *= 1.05;
    dh *= 1.05;

    const flagX = cx + (textConfig.flagOffsetX || 0) * scale;
    const flagY = cy + (textConfig.flagOffsetY || 0) * scale;

    const dx = flagX - dw / 2;
    const dy = flagY - dh / 2;

    ctx.drawImage(flagImg, dx, dy, dw, dh);
  }

  // 3D Flag Dome & Reflection Lighting Effects
  const domeVal = style.flagSurfaceDome !== undefined
    ? style.flagSurfaceDome
    : (style.flagLighting === 'subtle_dome' ? 0.4 : style.flagLighting === 'glossy' ? 0.65 : 0.0);
  const refVal = style.flagSurfaceReflection !== undefined
    ? style.flagSurfaceReflection
    : (style.flagLighting === 'glossy' ? 0.65 : style.flagLighting === 'subtle_dome' ? 0.35 : 0.0);
  const refAngle = style.flagSurfaceReflectionAngle ?? -35;

  drawFlagSurfaceDomeAndReflection(ctx, cx, cy, flagRadius, domeVal, refVal, refAngle);

  ctx.restore(); // Restore flag clip

  // Inner gold lip stroke inside the flag border
  ctx.beginPath();
  ctx.arc(cx, cy, flagRadius, 0, Math.PI * 2);
  ctx.lineWidth = 3 * scale;
  ctx.strokeStyle = 'rgba(50, 35, 7, 0.6)';
  ctx.stroke();

  ctx.restore(); // Restore main outer clip
}

/**
 * Renders custom user-uploaded badge template format
 * Seamlessly replaces the center flag and customizes curved text
 */
async function renderCustomUploadedBadge(
  ctx: CanvasRenderingContext2D,
  targetSize: number,
  country: Country,
  flagImg: HTMLImageElement,
  style: BadgeStyleConfig,
  textConfig: BadgeTextConfig,
  customConfig: CustomFormatConfig
) {
  const scale = targetSize / 1024;
  const userImg = customConfig.imageElement;
  if (!userImg) return;

  const cx = targetSize * customConfig.centerX;
  const cy = targetSize * customConfig.centerY;
  const flagR = targetSize * customConfig.flagRadius;

  // 1. Draw user uploaded template
  ctx.save();

  if (customConfig.cropToCircle) {
    // Cut away outer square corners so output is 100% transparent PNG outside the seal
    const outerR = (targetSize * 0.49);
    ctx.beginPath();
    ctx.arc(targetSize / 2, targetSize / 2, outerR, 0, Math.PI * 2);
    ctx.clip();
  }

  ctx.drawImage(userImg, 0, 0, targetSize, targetSize);

  // If in 'full_replacement' mode, user has uploaded their complete custom badge graphics
  // directly replacing the medallion (standalone custom badge format)
  if (customConfig.templateMode === 'full_replacement') {
    ctx.restore();
    return;
  }

  // 2. Replace Center Flag Window (when overlaying country flag into custom format)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, flagR, 0, Math.PI * 2);
  ctx.clip();

  // Clear original flag area
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Draw new country flag
  if (flagImg && flagImg.width > 0) {
    const fw = flagImg.naturalWidth || flagImg.width;
    const fh = flagImg.naturalHeight || flagImg.height;
    // Fill circle while maintaining aspect ratio and zoom scale
    const flagZoom = textConfig.flagScale || 1.0;
    const diameter = flagR * 2 * flagZoom;
    const aspect = fw / fh;
    let dw: number;
    let dh: number;

    if (aspect > 1) {
      dh = diameter;
      dw = diameter * aspect;
    } else {
      dw = diameter;
      dh = diameter / aspect;
    }
    dw *= 1.05;
    dh *= 1.05;

    const flagX = cx + (textConfig.flagOffsetX || 0) * scale;
    const flagY = cy + (textConfig.flagOffsetY || 0) * scale;

    ctx.drawImage(flagImg, flagX - dw / 2, flagY - dh / 2, dw, dh);
  }

  // 3D Flag Dome & Reflection Lighting Effects on custom template
  if (customConfig.showDomeReflection !== false) {
    const customDome = customConfig.flagSurfaceDome !== undefined ? customConfig.flagSurfaceDome : 0.4;
    const customRef = customConfig.flagSurfaceReflection !== undefined ? customConfig.flagSurfaceReflection : 0.35;
    const customRefAngle = customConfig.flagSurfaceReflectionAngle ?? -35;

    drawFlagSurfaceDomeAndReflection(ctx, cx, cy, flagR, customDome, customRef, customRefAngle);
  }

  ctx.restore(); // end flag clip

  // Draw inner gold ring bevel over flag seam (optional, default true)
  if (customConfig.showInnerRing !== false) {
    ctx.beginPath();
    ctx.arc(cx, cy, flagR, 0, Math.PI * 2);
    ctx.lineWidth = 6 * scale;
    ctx.strokeStyle = '#c49a37';
    ctx.stroke();
  }

  // 3. If user requested replacing text as well
  if (customConfig.replaceTextAlso) {
    if (textConfig.showTopText !== false && textConfig.topTemplate && textConfig.topTemplate.trim()) {
      const topText = resolveTemplateText(textConfig.topTemplate, country, textConfig.nameFormat);
      const topRotationRad = ((textConfig.topTextRotation || 0) * Math.PI) / 180;
      const topCenterAngle = -Math.PI / 2 + topRotationRad;
      const topCenterY = cy + (textConfig.topTextOffsetY || 0) * scale;
      const topFontSize = (textConfig.topFontSize ?? textConfig.fontSize) * scale;
      drawCurvedText(
        ctx,
        topText,
        cx,
        topCenterY,
        targetSize * customConfig.topRadius,
        topCenterAngle,
        Math.PI * 0.75,
        false,
        topFontSize,
        textConfig.letterSpacing * scale,
        textConfig.fontFamily,
        style.textStyleMode,
        style.customTextColor
      );
    }

    if (textConfig.showBottomText !== false && textConfig.bottomTemplate && textConfig.bottomTemplate.trim()) {
      const bottomText = resolveTemplateText(textConfig.bottomTemplate, country, textConfig.nameFormat);
      const bottomRotationRad = ((textConfig.bottomTextRotation || 0) * Math.PI) / 180;
      const bottomCenterAngle = Math.PI / 2 + bottomRotationRad;
      const bottomCenterY = cy + (textConfig.bottomTextOffsetY || 0) * scale;
      const bottomFontSize = (textConfig.bottomFontSize ?? textConfig.fontSize) * scale;
      drawCurvedText(
        ctx,
        bottomText,
        cx,
        bottomCenterY,
        targetSize * customConfig.bottomRadius,
        bottomCenterAngle,
        Math.PI * 0.75,
        true,
        bottomFontSize,
        textConfig.letterSpacing * scale,
        textConfig.fontFamily,
        style.textStyleMode,
        style.customTextColor
      );
    }
  }

  ctx.restore();
}

/**
 * Downloads a canvas as a transparent PNG file
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies canvas image blob to system clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
