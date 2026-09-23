export type BadgeTemplateId =
  | 'gold_medallion'
  | 'silver_seal'
  | 'bronze_vintage'
  | 'royal_navy'
  | 'custom_uploaded';

export type TextCasing = 'SHORT' | 'UPPERCASE_FULL' | 'STANDARD' | 'ISO_CODE';
export type StarType = 'single_star' | 'three_stars' | 'dots' | 'diamonds' | 'none';
export type TextStyleMode = 'black_stamped' | 'embossed_metallic' | 'white_bold' | 'gold_sheen' | 'custom';
export type FlagLighting = 'subtle_dome' | 'flat' | 'glossy' | 'inner_vignette';

export interface BadgeStyleConfig {
  id: BadgeTemplateId;
  name: string;
  description: string;
  rimOuterColor: string;
  rimInnerColor: string;
  rimMidColor: string;
  bandColor: string;
  textStyleMode: TextStyleMode;
  customTextColor?: string;
  starsColor: string;
  innerBevelColor: string;
  innerBorderWidth: number;
  flagLighting: FlagLighting;
  flagSurfaceDome?: number; // 0 to 1 (3D convex spherical dome depth)
  flagSurfaceReflection?: number; // 0 to 1 (specular glass highlight sheen)
  flagSurfaceReflectionAngle?: number; // -90 to +90 degrees
}

export interface CustomFont {
  name: string;
  source: 'google' | 'file';
  urlOrBase64?: string;
}

export interface ApiConfig {
  endpointUrl: string;
  apiKey?: string;
  headerName?: string;
  responseMapping?: 'json_url' | 'direct_image' | 'base64';
  jsonPath?: string; // e.g. "data.url" or "image_url"
  notes?: string;
}

export type FlagSourceType = 'original_official' | 'circular_vector';

export type MovableElement = 'flag' | 'topText' | 'bottomText';

export interface BadgeTextConfig {
  showTopText: boolean; // Text remove toggle for top
  showBottomText: boolean; // Text remove toggle for bottom
  topTemplate: string; // e.g. "MADE IN {COUNTRY}"
  bottomTemplate: string; // e.g. "MADE IN {COUNTRY}"
  nameFormat: TextCasing;
  fontFamily: string; // Allows Montserrat, Cinzel, Oswald, or custom embedded fonts
  customFontUrl?: string; // Custom web font URL or @font-face source
  fontSize: number; // 40-100 (fallback / base font size)
  topFontSize?: number; // Separate top curved text size (20-100)
  bottomFontSize?: number; // Separate bottom curved text size (20-100)
  letterSpacing: number; // 0-20
  topRadius: number; // 0.30 - 0.45 of canvas size
  bottomRadius: number; // 0.30 - 0.45 of canvas size
  starType: StarType;
  starSize: number; // 15-40
  flagRadius: number; // 0.20 - 0.35 of canvas size
  arcSpanRatio?: number; // 0.5 to 1.0 - controls maximum circular arc spread
  // Original flag & positional movement controls
  flagSource?: FlagSourceType; // 'original_official' (real sovereign flag) vs 'circular_vector'
  flagOffsetX?: number; // X position offset in pixels (-200 to +200)
  flagOffsetY?: number; // Y position offset in pixels (-200 to +200)
  flagScale?: number; // Zoom/scale factor (0.5 to 2.5, default 1.0)
  topTextOffsetY?: number; // Top text vertical offset in pixels (-150 to +150)
  topTextRotation?: number; // Top text arc rotation in degrees (-180 to +180)
  bottomTextOffsetY?: number; // Bottom text vertical offset in pixels (-150 to +150)
  bottomTextRotation?: number; // Bottom text arc rotation in degrees (-180 to +180)
}

export interface CustomFormatConfig {
  imageSrc: string | null;
  imageElement: HTMLImageElement | null;
  cropToCircle: boolean; // Auto-cut corners to transparent PNG
  centerX: number; // 0 to 1
  centerY: number; // 0 to 1
  flagRadius: number; // 0.1 to 0.5
  topRadius: number;
  bottomRadius: number;
  replaceCenterOnly: boolean; // Keep base badge, only overlay new flag
  replaceTextAlso: boolean; // Erase base text and draw new curved text
  flagSurfaceDome?: number; // 0 to 1 (Flag 3D convex dome depth)
  flagSurfaceReflection?: number; // 0 to 1 (Flag specular glass sheen/reflection)
  flagSurfaceReflectionAngle?: number; // -90 to +90 degrees
  customFlagUrl?: string; // Custom uploaded flag image data URL or external URL
}

export interface ExportConfig {
  resolution: 512 | 1024 | 2048;
  includeTransparentBg: boolean; // Always true for transparent PNG
  namingPattern: 'made_in_{code}' | 'made_in_{country}' | '{country}_badge';
}
