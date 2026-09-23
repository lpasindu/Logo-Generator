import React, { useRef } from 'react';
import {
  Type,
  Palette,
  Upload,
  RotateCcw,
  RotateCw,
  Sliders,
  Check,
  HelpCircle,
  FileImage,
  Eye,
  EyeOff,
  Plus,
  FolderOpen,
  Sparkles,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flag,
  ShieldCheck,
  Sun,
  Layers,
  CircleDot,
  ImagePlus,
  Sparkle,
} from 'lucide-react';
import {
  BadgeStyleConfig,
  BadgeTextConfig,
  CustomFormatConfig,
  StarType,
  TextStyleMode,
  FlagSourceType,
} from '../types/badge';
import { BADGE_STYLES } from '../services/badgeRenderer';
import { PRESET_BADGE_FONTS, loadGoogleFont, loadFontFromFile } from '../services/fontManager';
import { Country } from '../data/countries';

interface SettingsPanelProps {
  country?: Country;
  style: BadgeStyleConfig;
  onStyleChange: (style: BadgeStyleConfig) => void;
  textConfig: BadgeTextConfig;
  onTextConfigChange: (config: BadgeTextConfig) => void;
  customConfig?: CustomFormatConfig;
  onCustomConfigChange: (config: CustomFormatConfig | undefined) => void;
  onUploadImage: (file: File) => void;
  activeTab: 'text' | 'position' | 'badge' | 'upload';
  onTabChange: (tab: 'text' | 'position' | 'badge' | 'upload') => void;
  onOpenApiModal?: () => void;
  customFlagUrl?: string;
  onCustomFlagUrlChange?: (url: string | undefined) => void;
  onResetCurrentFlagPosition?: () => void;
  onApplyPositionToAllFlags?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  country,
  style,
  onStyleChange,
  textConfig,
  onTextConfigChange,
  customConfig,
  onCustomConfigChange,
  onUploadImage,
  activeTab,
  onTabChange,
  onOpenApiModal,
  customFlagUrl,
  onCustomFlagUrlChange,
  onResetCurrentFlagPosition,
  onApplyPositionToAllFlags,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fontFileInputRef = useRef<HTMLInputElement | null>(null);
  const customFlagFileInputRef = useRef<HTMLInputElement | null>(null);

  const [googleFontInput, setGoogleFontInput] = React.useState('');
  const [fontLoadingStatus, setFontLoadingStatus] = React.useState<string | null>(null);

  const handleCustomFlagFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (onCustomFlagUrlChange) {
          onCustomFlagUrlChange(dataUrl);
        }
        if (customConfig && onCustomConfigChange) {
          onCustomConfigChange({
            ...customConfig,
            customFlagUrl: dataUrl,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  // Embed font from local TTF, OTF, WOFF, WOFF2 file
  const handleFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFontLoadingStatus(`Loading font ${file.name}...`);
      try {
        const loadedFontName = await loadFontFromFile(file);
        onTextConfigChange({
          ...textConfig,
          fontFamily: loadedFontName,
        });
        setFontLoadingStatus(`Embedded "${loadedFontName}" successfully!`);
        setTimeout(() => setFontLoadingStatus(null), 3000);
      } catch (err) {
        setFontLoadingStatus('Failed to parse font file');
        setTimeout(() => setFontLoadingStatus(null), 3000);
      }
    }
  };

  // Embed font from Google Fonts
  const handleAddGoogleFont = async (fontName: string) => {
    if (!fontName.trim()) return;
    setFontLoadingStatus(`Loading "${fontName}" from Google Fonts...`);
    try {
      await loadGoogleFont(fontName);
      onTextConfigChange({
        ...textConfig,
        fontFamily: fontName.trim(),
      });
      setFontLoadingStatus(`Embedded "${fontName}" successfully!`);
      setGoogleFontInput('');
      setTimeout(() => setFontLoadingStatus(null), 3000);
    } catch {
      setFontLoadingStatus(`Could not load "${fontName}"`);
      setTimeout(() => setFontLoadingStatus(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 shadow-xl">
      {/* Navigation Tabs - Clean grid alignment */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-4 text-xs font-semibold">
        <button
          onClick={() => onTabChange('text')}
          className={`h-9 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'text'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Text & Slogans"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text</span>
        </button>

        <button
          onClick={() => onTabChange('position')}
          className={`h-9 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'position'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Move Flag & Move Text with Click"
        >
          <Move className="w-3.5 h-3.5" />
          <span>Move</span>
        </button>

        <button
          onClick={() => onTabChange('badge')}
          className={`h-9 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'badge'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Badge Style & Rims"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Style</span>
        </button>

        <button
          onClick={() => onTabChange('upload')}
          className={`h-9 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors relative cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Custom Uploaded Badge Template"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Format</span>
          {customConfig?.imageSrc && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
          )}
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
        {/* ============================================================ */}
        {/* TAB 1: TEXT & SLOGANS & CUSTOM FONTS & REMOVAL */}
        {/* ============================================================ */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {/* Top Text Arc with Direct REMOVE / HIDE Button */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-200">
                    Top Arc Text:
                  </label>
                  {textConfig.showTopText === false && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                      Hidden / Removed
                    </span>
                  )}
                </div>

                {/* TEXT REMOVE / TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      showTopText: textConfig.showTopText === false ? true : false,
                    })
                  }
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                    textConfig.showTopText === false
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-rose-300 hover:border-rose-400/50'
                  }`}
                  title={textConfig.showTopText === false ? 'Restore top text' : 'Remove top text from badge'}
                >
                  {textConfig.showTopText === false ? (
                    <>
                      <Eye className="w-3 h-3 text-rose-400" />
                      <span>Restore Text</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-400" />
                      <span>Remove Text</span>
                    </>
                  )}
                </button>
              </div>

              {textConfig.showTopText !== false ? (
                <>
                  <input
                    type="text"
                    value={textConfig.topTemplate}
                    onChange={(e) =>
                      onTextConfigChange({ ...textConfig, topTemplate: e.target.value })
                    }
                    placeholder="MADE IN {COUNTRY}"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      'MADE IN {COUNTRY}',
                      'PROUDLY MADE IN {COUNTRY}',
                      'PRODUCT OF {COUNTRY}',
                      'ORIGIN: {COUNTRY}',
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          onTextConfigChange({ ...textConfig, topTemplate: s })
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-2 text-[11px] text-slate-500 italic flex items-center justify-between">
                  <span>Top curved text is currently removed from circular badge.</span>
                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({ ...textConfig, showTopText: true })
                    }
                    className="text-amber-400 underline hover:text-amber-300 text-[11px] not-italic"
                  >
                    Enable
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Text Arc with Direct REMOVE / HIDE Button */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-200">
                    Bottom Arc Text:
                  </label>
                  {textConfig.showBottomText === false && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                      Hidden / Removed
                    </span>
                  )}
                </div>

                {/* TEXT REMOVE / TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      showBottomText: textConfig.showBottomText === false ? true : false,
                    })
                  }
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                    textConfig.showBottomText === false
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-rose-300 hover:border-rose-400/50'
                  }`}
                  title={textConfig.showBottomText === false ? 'Restore bottom text' : 'Remove bottom text from badge'}
                >
                  {textConfig.showBottomText === false ? (
                    <>
                      <Eye className="w-3 h-3 text-rose-400" />
                      <span>Restore Text</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-400" />
                      <span>Remove Text</span>
                    </>
                  )}
                </button>
              </div>

              {textConfig.showBottomText !== false ? (
                <>
                  <input
                    type="text"
                    value={textConfig.bottomTemplate}
                    onChange={(e) =>
                      onTextConfigChange({ ...textConfig, bottomTemplate: e.target.value })
                    }
                    placeholder="MADE IN {COUNTRY}"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                  {/* Quick suggestions */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      'MADE IN {COUNTRY}',
                      'PREMIUM QUALITY',
                      'AUTHENTIC PRODUCT',
                      'SINCE 1990',
                    ].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          onTextConfigChange({ ...textConfig, bottomTemplate: s })
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-2 text-[11px] text-slate-500 italic flex items-center justify-between">
                  <span>Bottom curved text is currently removed from circular badge.</span>
                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({ ...textConfig, showBottomText: true })
                    }
                    className="text-amber-400 underline hover:text-amber-300 text-[11px] not-italic"
                  >
                    Enable
                  </button>
                </div>
              )}
            </div>

            {/* Quick Remove All / Restore All Text Shortcut */}
            <div className="flex items-center justify-end gap-2 text-[11px]">
              {(textConfig.showTopText === false || textConfig.showBottomText === false) ? (
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      showTopText: true,
                      showBottomText: true,
                    })
                  }
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Restore All Text</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      showTopText: false,
                      showBottomText: false,
                    })
                  }
                  className="text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Remove All Text (Flag Seal Only)</span>
                </button>
              )}
            </div>

            {/* ============================================================ */}
            {/* EMBED CUSTOM FONT SECTION */}
            {/* ============================================================ */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>Embed Custom Font:</span>
                </label>
                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Active: {textConfig.fontFamily}
                </span>
              </div>

              {fontLoadingStatus && (
                <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30 font-medium">
                  {fontLoadingStatus}
                </div>
              )}

              {/* 1. Upload local font file (TTF, OTF, WOFF, WOFF2) */}
              <div className="flex items-center gap-2">
                <input
                  ref={fontFileInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fontFileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Font File (.ttf, .otf, .woff2)</span>
                </button>
              </div>

              {/* 2. Embed via Google Fonts input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleFontInput}
                  onChange={(e) => setGoogleFontInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddGoogleFont(googleFontInput);
                  }}
                  placeholder="Enter any Google Font name (e.g. Anton, Poppins)..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddGoogleFont(googleFontInput)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shrink-0"
                >
                  Embed
                </button>
              </div>

              {/* Curated Font Preset Grid */}
              <div className="space-y-1 pt-1">
                <div className="text-[11px] text-slate-400 font-medium">
                  Popular Medallion &amp; Seal Typography:
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin pr-1">
                  {PRESET_BADGE_FONTS.map((f) => {
                    const isSelected = textConfig.fontFamily === f.name;
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={async () => {
                          await loadGoogleFont(f.name);
                          onTextConfigChange({
                            ...textConfig,
                            fontFamily: f.name,
                          });
                        }}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="text-xs truncate">{f.name}</div>
                        <div className="text-[9px] text-slate-500 truncate">{f.category}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Country Name Casing / Format */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-200">
                Country Name Format:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(
                  [
                    { id: 'SHORT', label: 'Short Name (USA, UK)' },
                    { id: 'UPPERCASE_FULL', label: 'Full Uppercase' },
                    { id: 'STANDARD', label: 'Title Case (France)' },
                    { id: 'ISO_CODE', label: 'ISO Code (US, FR)' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() =>
                      onTextConfigChange({ ...textConfig, nameFormat: fmt.id })
                    }
                    className={`py-1.5 px-2.5 rounded-lg border text-left text-xs transition-colors ${
                      textConfig.nameFormat === fmt.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Style / Finish */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-200">
                Text Engraving / Color:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'black_stamped', label: 'Black Stamped (Layer 14)' },
                  { id: 'embossed_metallic', label: '3D Embossed Gold' },
                  { id: 'gold_sheen', label: 'Golden Sheen' },
                  { id: 'white_bold', label: 'White Bold' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      onStyleChange({
                        ...style,
                        textStyleMode: m.id as TextStyleMode,
                      })
                    }
                    className={`py-1.5 px-2.5 rounded-lg border text-left text-xs transition-colors ${
                      style.textStyleMode === m.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Perfect Round Text Layout: Arc Distance, Letter Spacing & Font Size */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-amber-300/90">
                Perfect Circular Round Text Calibration:
              </div>

              {/* Letter Spacing */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Circular Letter Spacing:</span>
                  <span className="font-mono text-amber-400">{textConfig.letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={textConfig.letterSpacing}
                  onChange={(e) =>
                    onTextConfigChange({
                      ...textConfig,
                      letterSpacing: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Independent Font Sizing Panel (Separate for Top and Bottom Text) */}
              <div className="space-y-3 p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" />
                    <span>Independent Font Sizing (Top & Bottom):</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const topSz = textConfig.topFontSize ?? textConfig.fontSize;
                      onTextConfigChange({
                        ...textConfig,
                        bottomFontSize: topSz,
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors"
                    title="Make bottom text font size match top text"
                  >
                    Sync Bottom to Top
                  </button>
                </div>

                {/* Top Text Font Size */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300 font-medium">Top Arc Font Size:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = textConfig.topFontSize ?? textConfig.fontSize;
                          onTextConfigChange({
                            ...textConfig,
                            topFontSize: Math.max(20, cur - 2),
                          });
                        }}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                        title="Decrease top font size by 2px"
                      >
                        -
                      </button>
                      <span className="font-mono text-amber-400 font-bold px-1 min-w-[40px] text-center">
                        {textConfig.topFontSize ?? textConfig.fontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = textConfig.topFontSize ?? textConfig.fontSize;
                          onTextConfigChange({
                            ...textConfig,
                            topFontSize: Math.min(100, cur + 2),
                          });
                        }}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                        title="Increase top font size by 2px"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    step="2"
                    value={textConfig.topFontSize ?? textConfig.fontSize}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        topFontSize: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Bottom Text Font Size */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300 font-medium">Bottom Arc Font Size:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = textConfig.bottomFontSize ?? textConfig.fontSize;
                          onTextConfigChange({
                            ...textConfig,
                            bottomFontSize: Math.max(20, cur - 2),
                          });
                        }}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                        title="Decrease bottom font size by 2px"
                      >
                        -
                      </button>
                      <span className="font-mono text-amber-400 font-bold px-1 min-w-[40px] text-center">
                        {textConfig.bottomFontSize ?? textConfig.fontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = textConfig.bottomFontSize ?? textConfig.fontSize;
                          onTextConfigChange({
                            ...textConfig,
                            bottomFontSize: Math.min(100, cur + 2),
                          });
                        }}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                        title="Increase bottom font size by 2px"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    step="2"
                    value={textConfig.bottomFontSize ?? textConfig.fontSize}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        bottomFontSize: Number(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Top Arc Distance */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Top Circular Arc Radius:</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(textConfig.topRadius * 1000)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.32"
                  max="0.43"
                  step="0.005"
                  value={textConfig.topRadius}
                  onChange={(e) =>
                    onTextConfigChange({
                      ...textConfig,
                      topRadius: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Bottom Arc Distance */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Bottom Circular Arc Radius:</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(textConfig.bottomRadius * 1000)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.32"
                  max="0.43"
                  step="0.005"
                  value={textConfig.bottomRadius}
                  onChange={(e) =>
                    onTextConfigChange({
                      ...textConfig,
                      bottomRadius: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Separators: Stars / Dots */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-200">
                Side Dividers / Emblems:
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'single_star', label: '★ Star' },
                  { id: 'three_stars', label: '★★★ 3 Stars' },
                  { id: 'dots', label: '● Dots' },
                  { id: 'none', label: 'None' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() =>
                      onTextConfigChange({
                        ...textConfig,
                        starType: st.id as StarType,
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg border text-center text-xs transition-colors ${
                      textConfig.starType === st.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: MOVE & ALIGNMENT (MOVABLE FLAG & TEXT WITH CLICK)        */}
        {/* ============================================================ */}
        {activeTab === 'position' && (
          <div className="space-y-4">
            {/* Per-Flag Position Isolation Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-white">
                    Per-Flag Position Isolation
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Position &amp; scaling adjustments here are saved <strong className="text-amber-300 font-semibold">strictly for {country?.name || 'this country'}</strong>. Switching countries will not shift other flags.
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                {onResetCurrentFlagPosition && (
                  <button
                    type="button"
                    onClick={onResetCurrentFlagPosition}
                    className="flex-1 h-7.5 text-[11px] px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-rose-300 border border-slate-700/80 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Reset this flag back to default center (0, 0, 100%)"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset This Flag</span>
                  </button>
                )}
                {onApplyPositionToAllFlags && (
                  <button
                    type="button"
                    onClick={onApplyPositionToAllFlags}
                    className="flex-1 h-7.5 text-[11px] px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Apply this exact position to all countries"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Apply to All Flags</span>
                  </button>
                )}
              </div>
            </div>

            {/* Real Flag Guarantee Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>Authentic Sovereign Flags</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    100% Non-AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  Real national flags loaded directly from FlagCDN with sovereign accuracy, heraldic crests, 50 stars, and exact colors.
                </p>
              </div>
            </div>

            {/* Flag Source Picker */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-200">
                Flag Style Source:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      flagSource: 'original_official',
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                    (textConfig.flagSource || 'original_official') === 'original_official'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <Flag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Real Flag</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Full authentic state flag from FlagCDN (Never AI)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      flagSource: 'circular_vector',
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                    textConfig.flagSource === 'circular_vector'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <span className="text-amber-400">⭕</span>
                    <span>Circular Icon</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    Curated circular emblem vector
                  </span>
                </button>
              </div>
            </div>

            {/* Move Center Flag with Click */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Move className="w-3.5 h-3.5 text-amber-400" />
                  <span>Center Flag Position (Click to Move)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      flagOffsetX: 0,
                      flagOffsetY: 0,
                      flagScale: 1.0,
                    })
                  }
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Center Flag</span>
                </button>
              </div>

              {/* D-Pad Buttons for Flag - Aligned 3x3 Grid */}
              <div className="flex items-center justify-center p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="grid grid-cols-3 gap-1.5 w-[132px]">
                  <div className="w-10 h-10"></div>
                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetY: Math.max(-180, (textConfig.flagOffsetY || 0) - 10),
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                    title="Move Flag Up 10px"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10"></div>

                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetX: Math.max(-180, (textConfig.flagOffsetX || 0) - 10),
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                    title="Move Flag Left 10px"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetX: 0,
                        flagOffsetY: 0,
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 flex items-center justify-center transition-all text-xs font-bold border border-slate-800 cursor-pointer"
                    title="Reset to exact center"
                  >
                    •
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetX: Math.min(180, (textConfig.flagOffsetX || 0) + 10),
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                    title="Move Flag Right 10px"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10"></div>
                  <button
                    type="button"
                    onClick={() =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetY: Math.min(180, (textConfig.flagOffsetY || 0) + 10),
                      })
                    }
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                    title="Move Flag Down 10px"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10"></div>
                </div>
              </div>

              {/* Sliders for Flag Positioning */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Horizontal (X) Offset:</span>
                    <span className="font-mono text-amber-300">
                      {(textConfig.flagOffsetX || 0) > 0 ? `+${textConfig.flagOffsetX}` : textConfig.flagOffsetX || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={textConfig.flagOffsetX || 0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetX: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-amber-500 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Vertical (Y) Offset:</span>
                    <span className="font-mono text-amber-300">
                      {(textConfig.flagOffsetY || 0) > 0 ? `+${textConfig.flagOffsetY}` : textConfig.flagOffsetY || 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-150"
                    max="150"
                    value={textConfig.flagOffsetY || 0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        flagOffsetY: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-amber-500 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Flag Zoom Scale:</span>
                    <span className="font-mono text-amber-300">
                      {Math.round((textConfig.flagScale || 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.2"
                    step="0.05"
                    value={textConfig.flagScale || 1.0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        flagScale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Flag Circular Window Radius:</span>
                    <span className="font-mono text-amber-300">
                      {Math.round(textConfig.flagRadius * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.20"
                    max="0.36"
                    step="0.01"
                    value={textConfig.flagRadius}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        flagRadius: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-amber-500 bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Move Top Text with Click */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Type className="w-3.5 h-3.5 text-sky-400" />
                  <span>Top Curved Text Position</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      topTextOffsetY: 0,
                      topTextRotation: 0,
                      topRadius: 0.38,
                    })
                  }
                  className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Top Text</span>
                </button>
              </div>

              {/* Quick Click Buttons for Top Text */}
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      topTextOffsetY: Math.max(-120, (textConfig.topTextOffsetY || 0) - 6),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Move Top Text Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Up</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      topTextOffsetY: Math.min(120, (textConfig.topTextOffsetY || 0) + 6),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Move Top Text Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Down</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      topTextRotation: Math.max(-90, (textConfig.topTextRotation || 0) - 5),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Rotate Arc Counter-Clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-5°</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      topTextRotation: Math.min(90, (textConfig.topTextRotation || 0) + 5),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Rotate Arc Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+5°</span>
                </button>
              </div>

              {/* Sliders for Top Text */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Arc Rotation:</span>
                    <span className="font-mono text-sky-300">{textConfig.topTextRotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={textConfig.topTextRotation || 0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        topTextRotation: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Vertical Shift (Y):</span>
                    <span className="font-mono text-sky-300">{textConfig.topTextOffsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={textConfig.topTextOffsetY || 0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        topTextOffsetY: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Arc Radius:</span>
                    <span className="font-mono text-sky-300">
                      {Math.round(textConfig.topRadius * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.45"
                    step="0.01"
                    value={textConfig.topRadius}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        topRadius: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Move Bottom Text with Click */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Type className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bottom Curved Text Position</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      bottomTextOffsetY: 0,
                      bottomTextRotation: 0,
                      bottomRadius: 0.38,
                    })
                  }
                  className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Bottom Text</span>
                </button>
              </div>

              {/* Quick Click Buttons for Bottom Text */}
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      bottomTextOffsetY: Math.max(-120, (textConfig.bottomTextOffsetY || 0) - 6),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Move Bottom Text Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Up</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      bottomTextOffsetY: Math.min(120, (textConfig.bottomTextOffsetY || 0) + 6),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Move Bottom Text Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Down</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      bottomTextRotation: Math.max(-90, (textConfig.bottomTextRotation || 0) - 5),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Rotate Arc Counter-Clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-5°</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onTextConfigChange({
                      ...textConfig,
                      bottomTextRotation: Math.min(90, (textConfig.bottomTextRotation || 0) + 5),
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1"
                  title="Rotate Arc Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+5°</span>
                </button>
              </div>

              {/* Sliders for Bottom Text */}
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Arc Rotation:</span>
                    <span className="font-mono text-sky-300">{textConfig.bottomTextRotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={textConfig.bottomTextRotation || 0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        bottomTextRotation: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Vertical Shift (Y):</span>
                    <span className="font-mono text-sky-300">{textConfig.bottomTextOffsetY || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={textConfig.bottomTextOffsetY || 0}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        bottomTextOffsetY: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Arc Radius:</span>
                    <span className="font-mono text-sky-300">
                      {Math.round(textConfig.bottomRadius * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.45"
                    step="0.01"
                    value={textConfig.bottomRadius}
                    onChange={(e) =>
                      onTextConfigChange({
                        ...textConfig,
                        bottomRadius: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-sky-400 bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Re-center Everything */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  onTextConfigChange({
                    ...textConfig,
                    flagOffsetX: 0,
                    flagOffsetY: 0,
                    flagScale: 1.0,
                    topTextOffsetY: 0,
                    topTextRotation: 0,
                    bottomTextOffsetY: 0,
                    bottomTextRotation: 0,
                  })
                }
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reset All Positions &amp; Alignments to Center</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: BADGE STYLE & FINISH */}
        {/* ============================================================ */}
        {activeTab === 'badge' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Preset Medallion Finishes:
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'gold_medallion',
                    name: 'Classic Gold Medallion (Layer 14 Match)',
                    desc: 'Dual-bevel metallic outer rim, stamped black arc text, side 5-pt stars, convex dome',
                    border: 'border-amber-500/50 bg-amber-500/10 text-amber-200',
                  },
                  {
                    id: 'silver_seal',
                    name: 'Platinum Silver Medallion',
                    desc: 'Polished rhodium rim, brushed radial concentric grooves, crisp black lettering',
                    border: 'border-slate-400/50 bg-slate-400/10 text-slate-200',
                  },
                  {
                    id: 'bronze_vintage',
                    name: 'Antique Bronze & Brass',
                    desc: 'Warm aged metallic copper tones, weathered artisan seal finish',
                    border: 'border-orange-600/50 bg-orange-600/10 text-orange-200',
                  },
                  {
                    id: 'royal_navy',
                    name: 'Royal Navy & Gold',
                    desc: 'Navy blue enamel text band paired with polished gold outer & inner rim',
                    border: 'border-blue-500/50 bg-blue-500/10 text-blue-200',
                  },
                ].map((preset) => {
                  const isSelected = style.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        const found = BADGE_STYLES[preset.id];
                        if (found) onStyleChange(found);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? `${preset.border} ring-1 ring-amber-400`
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inner Flag Window Size */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-200">
                Flag Circle Window Size:
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Center Circle Radius:</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(textConfig.flagRadius * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.22"
                  max="0.36"
                  step="0.005"
                  value={textConfig.flagRadius}
                  onChange={(e) =>
                    onTextConfigChange({
                      ...textConfig,
                      flagRadius: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Lighting FX */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Flag Surface Dome &amp; Reflection:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'subtle_dome', label: '3D Convex' },
                    { id: 'glossy', label: 'High Gloss' },
                    { id: 'flat', label: 'Pure Flat' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() =>
                        onStyleChange({
                          ...style,
                          flagLighting: l.id as any,
                        })
                      }
                      className={`py-1.5 px-2 rounded-lg border text-center text-xs transition-colors ${
                        style.flagLighting === l.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CUSTOM UPLOADED FORMAT */}
        {/* ============================================================ */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Custom Flag File Input */}
            <input
              ref={customFlagFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomFlagFileChange}
              className="hidden"
            />

            {/* Upload Badge Image file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 1. Custom Flag Inset Option (Upload or change Flag in Custom Format) */}
            <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom Flag Image:</span>
                </div>
                {(customFlagUrl || customConfig?.customFlagUrl) && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    Custom Flag Active
                  </span>
                )}
              </div>

              {(customFlagUrl || customConfig?.customFlagUrl) ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700/80">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={customFlagUrl || customConfig?.customFlagUrl}
                      alt="Custom Flag"
                      className="w-10 h-7 object-cover rounded border border-slate-600 shadow-sm"
                    />
                    <div className="text-left">
                      <div className="text-[11px] font-semibold text-white">Custom Uploaded Flag</div>
                      <div className="text-[10px] text-emerald-400">Rendering inside center seal</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => customFlagFileInputRef.current?.click()}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onCustomFlagUrlChange) onCustomFlagUrlChange(undefined);
                        if (customConfig && onCustomConfigChange) {
                          onCustomConfigChange({
                            ...customConfig,
                            customFlagUrl: undefined,
                          });
                        }
                      }}
                      className="text-[11px] px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                      title="Reset to official country flag"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => customFlagFileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4 text-amber-400" />
                  <span>Add Custom Flag (PNG, SVG, JPG)</span>
                </button>
              )}
            </div>

            {/* 2. Flag Surface Dome and Reflection Controls */}
            <div className="space-y-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flag Surface Dome & Reflection:</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      if (customConfig && onCustomConfigChange) {
                        onCustomConfigChange({
                          ...customConfig,
                          flagSurfaceDome: 0,
                          flagSurfaceReflection: 0,
                        });
                      } else {
                        onStyleChange({
                          ...style,
                          flagSurfaceDome: 0,
                          flagSurfaceReflection: 0,
                        });
                      }
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white"
                  >
                    Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (customConfig && onCustomConfigChange) {
                        onCustomConfigChange({
                          ...customConfig,
                          flagSurfaceDome: 0.45,
                          flagSurfaceReflection: 0.4,
                        });
                      } else {
                        onStyleChange({
                          ...style,
                          flagSurfaceDome: 0.45,
                          flagSurfaceReflection: 0.4,
                        });
                      }
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:text-white"
                  >
                    Glass Dome
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (customConfig && onCustomConfigChange) {
                        onCustomConfigChange({
                          ...customConfig,
                          flagSurfaceDome: 0.75,
                          flagSurfaceReflection: 0.7,
                        });
                      } else {
                        onStyleChange({
                          ...style,
                          flagSurfaceDome: 0.75,
                          flagSurfaceReflection: 0.7,
                        });
                      }
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 hover:text-white"
                  >
                    High Gloss
                  </button>
                </div>
              </div>

              {/* 3D Convex Dome Depth */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Flag 3D Convex Dome:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {Math.round(
                      (customConfig?.flagSurfaceDome !== undefined
                        ? customConfig.flagSurfaceDome
                        : style.flagSurfaceDome !== undefined
                        ? style.flagSurfaceDome
                        : 0.4) * 100
                    )}
                    %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={
                    customConfig?.flagSurfaceDome !== undefined
                      ? customConfig.flagSurfaceDome
                      : style.flagSurfaceDome !== undefined
                      ? style.flagSurfaceDome
                      : 0.4
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (customConfig && onCustomConfigChange) {
                      onCustomConfigChange({
                        ...customConfig,
                        flagSurfaceDome: val,
                      });
                    }
                    onStyleChange({
                      ...style,
                      flagSurfaceDome: val,
                    });
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Specular Glass Reflection Sheen */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Glass Specular Reflection:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {Math.round(
                      (customConfig?.flagSurfaceReflection !== undefined
                        ? customConfig.flagSurfaceReflection
                        : style.flagSurfaceReflection !== undefined
                        ? style.flagSurfaceReflection
                        : 0.35) * 100
                    )}
                    %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={
                    customConfig?.flagSurfaceReflection !== undefined
                      ? customConfig.flagSurfaceReflection
                      : style.flagSurfaceReflection !== undefined
                      ? style.flagSurfaceReflection
                      : 0.35
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (customConfig && onCustomConfigChange) {
                      onCustomConfigChange({
                        ...customConfig,
                        flagSurfaceReflection: val,
                      });
                    }
                    onStyleChange({
                      ...style,
                      flagSurfaceReflection: val,
                    });
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Reflection Angle */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Reflection Light Angle:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {(customConfig?.flagSurfaceReflectionAngle ?? style.flagSurfaceReflectionAngle ?? -35)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-75"
                  max="75"
                  step="5"
                  value={customConfig?.flagSurfaceReflectionAngle ?? style.flagSurfaceReflectionAngle ?? -35}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (customConfig && onCustomConfigChange) {
                      onCustomConfigChange({
                        ...customConfig,
                        flagSurfaceReflectionAngle: val,
                      });
                    }
                    onStyleChange({
                      ...style,
                      flagSurfaceReflectionAngle: val,
                    });
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Upload Custom Template Card */}
            {!customConfig?.imageSrc ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Custom Badge Base Template:
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-7 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-950/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-7 h-7 text-amber-400 animate-pulse" />
                  <span className="text-xs font-semibold">Click to Upload Custom Badge Template</span>
                  <span className="text-[10px] text-slate-500">Overlay dynamic flags & text on your custom seal</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Custom Badge Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={customConfig.imageSrc}
                      alt="Custom template"
                      className="w-12 h-12 object-contain rounded-md border border-slate-700 bg-slate-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Custom Template Active</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Calibrating center flag and text
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => onCustomConfigChange(undefined)}
                      className="text-xs px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                      title="Reset to procedural Gold Medallion"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Calibrator Controls */}
                <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Center Flag Window Calibration:</span>
                  </div>

                  {/* Flag Radius */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Center Flag Radius:</span>
                      <span className="font-mono text-amber-400">
                        {Math.round(customConfig.flagRadius * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.15"
                      max="0.42"
                      step="0.01"
                      value={customConfig.flagRadius}
                      onChange={(e) =>
                        onCustomConfigChange({
                          ...customConfig,
                          flagRadius: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Flag Center X */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Center Position X:</span>
                      <span className="font-mono text-amber-400">
                        {Math.round(customConfig.centerX * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.40"
                      max="0.60"
                      step="0.005"
                      value={customConfig.centerX}
                      onChange={(e) =>
                        onCustomConfigChange({
                          ...customConfig,
                          centerX: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Flag Center Y */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Center Position Y:</span>
                      <span className="font-mono text-amber-400">
                        {Math.round(customConfig.centerY * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.40"
                      max="0.60"
                      step="0.005"
                      value={customConfig.centerY}
                      onChange={(e) =>
                        onCustomConfigChange({
                          ...customConfig,
                          centerY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Auto-crop outside corners toggle (guarantees transparent PNG!) */}
                  <label className="flex items-center gap-2 pt-2 border-t border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customConfig.cropToCircle}
                      onChange={(e) =>
                        onCustomConfigChange({
                          ...customConfig,
                          cropToCircle: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      Auto-cut corners to transparent circle PNG
                    </span>
                  </label>

                  {/* Replace text also toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customConfig.replaceTextAlso}
                      onChange={(e) =>
                        onCustomConfigChange({
                          ...customConfig,
                          replaceTextAlso: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      Also overlay dynamic "Made in [Country]" text
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer shortcut to Custom API Modal */}
      {onOpenApiModal && (
        <div className="pt-3 mt-auto border-t border-slate-800/80">
          <button
            type="button"
            onClick={onOpenApiModal}
            className="w-full py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 hover:text-amber-300 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:animate-ping" />
              <span className="font-semibold">Add / Configure Custom API</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-400">
              Own Microservice &rarr;
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
