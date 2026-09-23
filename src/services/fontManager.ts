/**
 * Utility to register and load custom web fonts dynamically
 * Supports Google Fonts, standard Web Open Font Format (WOFF/WOFF2/TTF/OTF),
 * data URLs, and local uploaded font files.
 */

const loadedFontFaces = new Set<string>();

/**
 * Loads a Google Font by family name dynamically
 */
export async function loadGoogleFont(fontFamily: string): Promise<boolean> {
  const sanitized = fontFamily.trim();
  if (!sanitized || loadedFontFaces.has(`google_${sanitized}`)) {
    return true;
  }

  try {
    const encoded = encodeURIComponent(sanitized);
    const linkId = `google-font-${sanitized.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700;800;900&display=swap`;
      document.head.appendChild(link);
    }

    // Wait until document.fonts has the font loaded
    if (document.fonts) {
      await document.fonts.load(`bold 48px "${sanitized}"`);
    }
    loadedFontFaces.add(`google_${sanitized}`);
    return true;
  } catch (err) {
    console.error('Failed to load Google font:', fontFamily, err);
    return false;
  }
}

/**
 * Loads a custom font from a File (TTF, OTF, WOFF, WOFF2)
 */
export async function loadFontFromFile(file: File, fontName?: string): Promise<string> {
  const chosenName = (fontName || file.name.replace(/\.[^/.]+$/, '')).trim();
  const buffer = await file.arrayBuffer();

  const fontFace = new FontFace(chosenName, buffer, {
    weight: 'bold',
    style: 'normal',
  });

  const loadedFace = await fontFace.load();
  document.fonts.add(loadedFace);
  loadedFontFaces.add(`file_${chosenName}`);
  return chosenName;
}

/**
 * Loads a font from an arbitrary external URL (e.g. .woff2 or raw url)
 */
export async function loadFontFromUrl(fontName: string, url: string): Promise<boolean> {
  try {
    const fontFace = new FontFace(fontName, `url(${url})`, {
      weight: 'bold',
      style: 'normal',
    });
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    loadedFontFaces.add(`url_${fontName}`);
    return true;
  } catch (err) {
    console.error('Failed to load font from URL:', url, err);
    return false;
  }
}

/**
 * Curated popular badge fonts available with 1-click
 */
export const PRESET_BADGE_FONTS = [
  { name: 'Montserrat', category: 'Modern Geometric Sans (Default)' },
  { name: 'Cinzel', category: 'Classic Medallion Roman Serif' },
  { name: 'Oswald', category: 'Industrial Bold Condensed' },
  { name: 'Playfair Display', category: 'Luxury Editorial Serif' },
  { name: 'Bebas Neue', category: 'High-Impact Clean Sans' },
  { name: 'Alfa Slab One', category: 'Heavy Stamped Slab Serif' },
  { name: 'Abril Fatface', category: 'Dramatic Vintage Display' },
  { name: 'Righteous', category: 'Retro Industrial Curved' },
  { name: 'Cabin', category: 'Clear Stamped Modern' },
  { name: 'Barlow Semi Condensed', category: 'Aviation & Marine Seal' },
];
