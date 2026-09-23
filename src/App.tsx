import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Award,
  Sparkles,
  Upload,
  Globe2,
  CheckCircle,
  ShieldCheck,
  Download,
  Database,
  Undo2,
  Redo2,
} from 'lucide-react';
import { COUNTRIES, Country } from './data/countries';
import {
  BadgeStyleConfig,
  BadgeTextConfig,
  CustomFormatConfig,
  ApiConfig,
} from './types/badge';
import { BADGE_STYLES } from './services/badgeRenderer';
import { BadgePreview } from './components/BadgePreview';
import { CountryPicker } from './components/CountryPicker';
import { SettingsPanel } from './components/SettingsPanel';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { executeCustomApi } from './services/apiIntegrationService';

interface HistorySnapshot {
  selectedCountry: Country;
  style: BadgeStyleConfig;
  textConfig: BadgeTextConfig;
  customConfig?: CustomFormatConfig;
  customFlagUrl?: string;
}

export default function App() {
  // Default selected country: United States (matching uploaded Layer 14 image)
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);

  // Current badge style: Classic Gold Medallion (matching Layer 14 style)
  const [style, setStyle] = useState<BadgeStyleConfig>(BADGE_STYLES.gold_medallion);

  // Badge curved text & typography configuration
  const [textConfig, setTextConfig] = useState<BadgeTextConfig>({
    topTemplate: 'MADE IN {COUNTRY}',
    bottomTemplate: 'MADE IN {COUNTRY}',
    nameFormat: 'SHORT', // Default to USA, UK, GERMANY, etc.
    fontFamily: 'Montserrat',
    fontSize: 58,
    topFontSize: 58,
    bottomFontSize: 58,
    letterSpacing: 2,
    topRadius: 0.38,
    bottomRadius: 0.38,
    starType: 'single_star', // Single star on left & right like Layer 14
    starSize: 26,
    flagRadius: 0.29,
    showTopText: true,
    showBottomText: true,
    flagSource: 'original_official',
    flagOffsetX: 0,
    flagOffsetY: 0,
    flagScale: 1.0,
    topTextOffsetY: 0,
    topTextRotation: 0,
    bottomTextOffsetY: 0,
    bottomTextRotation: 0,
  });

  // Custom uploaded template format configuration
  const [customConfig, setCustomConfig] = useState<CustomFormatConfig | undefined>(undefined);

  // Custom API configuration
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    endpointUrl: '',
    responseMapping: 'direct_image',
  });
  const [customFlagUrl, setCustomFlagUrl] = useState<string | undefined>(undefined);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Settings active tab
  const [activeSettingsTab, setActiveSettingsTab] = useState<'text' | 'position' | 'badge' | 'upload'>('text');

  // Batch generator modal open state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // -------------------------------------------------------------
  // UNDO & REDO HISTORY ENGINE (Ctrl + Z and Ctrl + Shift + Z)
  // -------------------------------------------------------------
  const historyRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryActionRef = useRef<boolean>(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize history with initial state
  useEffect(() => {
    if (historyRef.current.length === 0) {
      historyRef.current = [
        {
          selectedCountry,
          style,
          textConfig,
          customConfig,
          customFlagUrl,
        },
      ];
      historyIndexRef.current = 0;
    }
  }, []);

  // Save new state snapshot with debouncing for continuous drag operations
  useEffect(() => {
    if (isHistoryActionRef.current) {
      isHistoryActionRef.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const currentIdx = historyIndexRef.current;
      const newSnapshot: HistorySnapshot = {
        selectedCountry,
        style,
        textConfig,
        customConfig,
        customFlagUrl,
      };

      // If nothing actually changed from the current history snapshot, skip
      if (currentIdx >= 0 && historyRef.current[currentIdx]) {
        const current = historyRef.current[currentIdx];
        if (
          current.selectedCountry.code === selectedCountry.code &&
          JSON.stringify(current.style) === JSON.stringify(style) &&
          JSON.stringify(current.textConfig) === JSON.stringify(textConfig) &&
          current.customFlagUrl === customFlagUrl &&
          JSON.stringify(current.customConfig) === JSON.stringify(customConfig)
        ) {
          return;
        }
      }

      // Truncate any redo future snapshots and append
      const updatedHistory = historyRef.current.slice(0, currentIdx + 1);
      updatedHistory.push(newSnapshot);

      // Limit history to 50 steps
      if (updatedHistory.length > 50) {
        updatedHistory.shift();
      }

      historyRef.current = updatedHistory;
      historyIndexRef.current = updatedHistory.length - 1;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCountry, style, textConfig, customConfig, customFlagUrl]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isHistoryActionRef.current = true;
      historyIndexRef.current -= 1;
      const targetState = historyRef.current[historyIndexRef.current];
      if (targetState) {
        setSelectedCountry(targetState.selectedCountry);
        setStyle(targetState.style);
        setTextConfig(targetState.textConfig);
        setCustomConfig(targetState.customConfig);
        setCustomFlagUrl(targetState.customFlagUrl);
      }
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isHistoryActionRef.current = true;
      historyIndexRef.current += 1;
      const targetState = historyRef.current[historyIndexRef.current];
      if (targetState) {
        setSelectedCountry(targetState.selectedCountry);
        setStyle(targetState.style);
        setTextConfig(targetState.textConfig);
        setCustomConfig(targetState.customConfig);
        setCustomFlagUrl(targetState.customFlagUrl);
      }
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Shift+Z (or Cmd+Z and Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? e.metaKey : e.ctrlKey;
      if (!isModifier) return;

      // Avoid capturing when user is actively editing a text input
      const target = e.target as HTMLElement | null;
      const isTextInput =
        target &&
        ((target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text') ||
          target.tagName === 'TEXTAREA');

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        if (!isTextInput) {
          e.preventDefault();
          handleUndo();
        }
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        if (!isTextInput) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // If user configured a custom API, re-fetch flag when selectedCountry changes
  useEffect(() => {
    if (apiConfig.endpointUrl && apiConfig.endpointUrl.trim()) {
      let isMounted = true;
      executeCustomApi(apiConfig, selectedCountry).then((res) => {
        if (isMounted && res.success && res.imageUrl) {
          setCustomFlagUrl(res.imageUrl);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setCustomFlagUrl(undefined);
    }
  }, [selectedCountry, apiConfig]);

  // Handle image upload from any source
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCustomConfig({
          imageSrc: src,
          imageElement: img,
          cropToCircle: true, // Cut corners to transparent circle
          centerX: 0.5,
          centerY: 0.5,
          flagRadius: 0.29,
          topRadius: 0.38,
          bottomRadius: 0.38,
          replaceCenterOnly: false,
          replaceTextAlso: true,
        });
        setActiveSettingsTab('upload');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  World Flag Seal &amp; Badge Studio
                </h1>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Transparent .PNG
                </span>
                {apiConfig.endpointUrl && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Custom API Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Generate "Made in [Country]" circular seals with circular flags, custom fonts &amp; transparent background
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Undo & Redo Shortcuts */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80 text-xs">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className="px-2 py-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                title="Undo (Ctrl + Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Undo</span>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className="px-2 py-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                title="Redo (Ctrl + Shift + Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Redo</span>
              </button>
            </div>

            {/* Custom API Button */}
            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                apiConfig.endpointUrl
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80'
              }`}
              title="Configure custom API endpoint for flag and badge assets"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{apiConfig.endpointUrl ? 'API Active' : 'Custom API'}</span>
            </button>

            {/* Direct file upload button */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Upload Format</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadImage(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
            </label>

            {/* Direct Download Badge CTA */}
            <button
              onClick={() => {
                const btn = document.getElementById('preview-header-download-btn') || document.getElementById('preview-bottom-download-btn');
                if (btn) (btn as HTMLButtonElement).click();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
              title="Download currently customized badge as transparent PNG"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Badge</span>
            </button>

            {/* Batch Generator CTA */}
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer"
              title="Batch generate all countries and download as .ZIP package"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Batch Countries (.ZIP)</span>
              <span className="sm:hidden">Batch .ZIP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
          {/* Left Column: Country Selector (3 cols on large screens) */}
          <div className="lg:col-span-3 h-[520px] lg:h-[760px]">
            <CountryPicker
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>

          {/* Center Column: Live Badge Canvas Preview & Download (5 cols) */}
          <div className="lg:col-span-5 min-h-[640px] lg:h-[760px] flex flex-col">
            <BadgePreview
              country={selectedCountry}
              style={style}
              textConfig={textConfig}
              onTextConfigChange={setTextConfig}
              customConfig={customConfig}
              onUploadImage={handleUploadImage}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
              customFlagUrl={customFlagUrl}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>

          {/* Right Column: Customization & Calibration Panel (4 cols) */}
          <div className="lg:col-span-4 h-[620px] lg:h-[760px]">
            <SettingsPanel
              style={style}
              onStyleChange={setStyle}
              textConfig={textConfig}
              onTextConfigChange={setTextConfig}
              customConfig={customConfig}
              onCustomConfigChange={setCustomConfig}
              onUploadImage={handleUploadImage}
              activeTab={activeSettingsTab}
              onTabChange={setActiveSettingsTab}
              onOpenApiModal={() => setIsApiModalOpen(true)}
              customFlagUrl={customFlagUrl}
              onCustomFlagUrlChange={setCustomFlagUrl}
            />
          </div>
        </div>
      </main>

      {/* Footer info & quality guarantees */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-3 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Zero-Background Guarantee: All output PNG files contain transparent alpha channels.</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>195+ Sovereign Nations</span>
            <span>·</span>
            <span>Up to 2048px Ultra-Res</span>
            <span>·</span>
            <span>Zero Server Uploads</span>
          </div>
        </div>
      </footer>

      {/* Batch World Generator Modal */}
      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        style={style}
        textConfig={textConfig}
        customConfig={customConfig}
      />

      {/* Custom API Modal */}
      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiConfig={apiConfig}
        onSaveApiConfig={setApiConfig}
        activeCountry={selectedCountry}
        onApplyApiFlagImage={(url) => setCustomFlagUrl(url)}
      />
    </div>
  );
}
