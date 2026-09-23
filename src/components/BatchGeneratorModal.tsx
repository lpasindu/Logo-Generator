import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  Loader2,
  FolderArchive,
  Image as ImageIcon,
  CheckCircle2,
  Globe2,
} from 'lucide-react';
import { COUNTRIES, Country } from '../data/countries';
import { BadgeStyleConfig, BadgeTextConfig, CustomFormatConfig, CountryCustomSettings } from '../types/badge';
import { renderBadgeToCanvas, downloadCanvasAsPng } from '../services/badgeRenderer';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: BadgeStyleConfig;
  textConfig: BadgeTextConfig;
  customConfig?: CustomFormatConfig;
  countryCustomizations?: Record<string, CountryCustomSettings>;
}

interface GeneratedItem {
  country: Country;
  filename: string;
  dataUrl: string;
  blob: Blob;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  style,
  textConfig,
  customConfig,
  countryCustomizations,
}) => {
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(
    () => new Set(COUNTRIES.map((c) => c.code))
  );
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [resolution, setResolution] = useState<512 | 1024>(512);
  const [namingFormat, setNamingFormat] = useState<'slug' | 'code'>('slug');

  // Generation progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [currentCountryName, setCurrentCountryName] = useState('');
  const [generatedBadges, setGeneratedBadges] = useState<GeneratedItem[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const abortRef = useRef(false);

  if (!isOpen) return null;

  const displayedCountries = regionFilter === 'All'
    ? COUNTRIES
    : COUNTRIES.filter((c) => c.region === regionFilter);

  const toggleSelectAll = () => {
    if (selectedCodes.size === COUNTRIES.length) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(COUNTRIES.map((c) => c.code)));
    }
  };

  const toggleSelectRegion = (region: string) => {
    const next = new Set(selectedCodes);
    const inRegion = COUNTRIES.filter(c => c.region === region);
    const allSelected = inRegion.every(c => next.has(c.code));
    inRegion.forEach(c => {
      if (allSelected) next.delete(c.code);
      else next.add(c.code);
    });
    setSelectedCodes(next);
  };

  const toggleCountry = (code: string) => {
    const next = new Set(selectedCodes);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelectedCodes(next);
  };

  const handleStartBatch = async () => {
    const countriesToProcess = COUNTRIES.filter((c) => selectedCodes.has(c.code));
    if (countriesToProcess.length === 0) return;

    setIsGenerating(true);
    setProgressCount(0);
    setGeneratedBadges([]);
    setZipBlob(null);
    abortRef.current = false;

    const zip = new JSZip();
    const folder = zip.folder('transparent_country_badges');
    const items: GeneratedItem[] = [];

    // Reusable canvas to render
    const offscreenCanvas = document.createElement('canvas');

    for (let i = 0; i < countriesToProcess.length; i++) {
      if (abortRef.current) break;

      const c = countriesToProcess[i];
      setCurrentCountryName(c.name);
      setProgressCount(i + 1);

      // Country-specific isolated positioning or neutral default
      const cSettings = countryCustomizations?.[c.code];
      const countryTextConfig: BadgeTextConfig = {
        ...textConfig,
        flagOffsetX: cSettings?.flagOffsetX ?? 0,
        flagOffsetY: cSettings?.flagOffsetY ?? 0,
        flagScale: cSettings?.flagScale ?? 1.0,
        flagRotation: cSettings?.flagRotation ?? 0,
        flagSource: cSettings?.flagSource ?? textConfig.flagSource ?? 'original_official',
        topTextOffsetY: cSettings?.topTextOffsetY ?? 0,
        topTextRotation: cSettings?.topTextRotation ?? 0,
        bottomTextOffsetY: cSettings?.bottomTextOffsetY ?? 0,
        bottomTextRotation: cSettings?.bottomTextRotation ?? 0,
        topFontSize: cSettings?.topFontSize ?? textConfig.topFontSize,
        bottomFontSize: cSettings?.bottomFontSize ?? textConfig.bottomFontSize,
      };

      const countryCustomConfig = cSettings?.customFlagUrl
        ? { ...(customConfig || { imageSrc: null, imageElement: null, cropToCircle: true, centerX: 0.5, centerY: 0.5, flagRadius: 0.29, topRadius: 0.38, bottomRadius: 0.38, replaceCenterOnly: false, replaceTextAlso: true }), customFlagUrl: cSettings.customFlagUrl }
        : customConfig;

      // Render badge
      await renderBadgeToCanvas(
        offscreenCanvas,
        c,
        style,
        countryTextConfig,
        countryCustomConfig,
        resolution
      );

      // Extract transparent PNG blob
      const blob = await new Promise<Blob | null>((resolve) =>
        offscreenCanvas.toBlob(resolve, 'image/png')
      );

      if (blob) {
        const safeName = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const filename = namingFormat === 'slug'
          ? `made_in_${safeName}.png`
          : `made_in_${c.code.toLowerCase()}.png`;

        folder?.file(filename, blob);

        // Store first 50 thumbnails for preview gallery
        if (items.length < 60) {
          items.push({
            country: c,
            filename,
            dataUrl: offscreenCanvas.toDataURL('image/png'),
            blob,
          });
        }
      }

      // Small tick to allow UI to update
      await new Promise((r) => setTimeout(r, 10));
    }

    if (!abortRef.current) {
      setCurrentCountryName('Packaging and compressing transparent PNG badges into .ZIP file...');
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      setZipBlob(content);
      setGeneratedBadges(items);
      setIsGenerating(false);

      // Automatically trigger .ZIP download!
      try {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `world_made_in_badges_transparent_png_${resolution}px.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Auto download zip failed:', err);
      }

      // Celebrate completion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `world_made_in_badges_transparent_png_${resolution}px.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Batch All Countries Generator
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  .ZIP Package
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Batch render all countries and download a single compressed .ZIP file with transparent PNGs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {/* Resolution */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Output Resolution:
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setResolution(512)}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium transition-all ${
                    resolution === 512
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  512×512 (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setResolution(1024)}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium transition-all ${
                    resolution === 1024
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  1024×1024 (HD)
                </button>
              </div>
            </div>

            {/* Filename format */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                File Naming:
              </label>
              <select
                value={namingFormat}
                onChange={(e) => setNamingFormat(e.target.value as 'slug' | 'code')}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="slug">made_in_france.png (Full Name)</option>
                <option value="code">made_in_fr.png (ISO Code)</option>
              </select>
            </div>

            {/* Total Selected Counter */}
            <div className="flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-300">Selected Count:</span>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono text-amber-300 font-bold text-sm">
                  {selectedCodes.size} / {COUNTRIES.length} Countries
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                >
                  {selectedCodes.size === COUNTRIES.length ? 'Deselect All' : 'Select All 195'}
                </button>
              </div>
            </div>
          </div>

          {/* Live Progress Bar (if generating) */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-indigo-300 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>
                    Generating {progressCount} of {selectedCodes.size}:
                  </span>
                  <span className="text-white font-bold">{currentCountryName}</span>
                </div>
                <span className="font-mono text-amber-300 font-bold">
                  {Math.round((progressCount / selectedCodes.size) * 100)}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-150"
                  style={{ width: `${(progressCount / selectedCodes.size) * 100}%` }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleStop}
                  className="text-xs px-3 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                >
                  Stop Generation
                </button>
              </div>
            </div>
          )}

          {/* Completion Download Banner */}
          {zipBlob && !isGenerating && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-200">
                    Generation Complete! All Transparent PNGs Ready
                  </h4>
                  <p className="text-xs text-slate-400">
                    Package containing {selectedCodes.size} transparent badges is ready to download.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadZip}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Download All as .ZIP ({resolution}px PNGs)</span>
              </button>
            </div>
          )}

          {/* Region Tabs & Quick Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Filter by Continent:</span>
              <div className="flex items-center gap-2">
                {regionFilter !== 'All' && (
                  <button
                    onClick={() => toggleSelectRegion(regionFilter)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Toggle all in {regionFilter}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['All', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setRegionFilter(reg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    regionFilter === reg
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Country Checkbox Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-slate-800/80 scrollbar-thin">
              {displayedCountries.map((c) => {
                const checked = selectedCodes.has(c.code);
                return (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => toggleCountry(c.code)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors border ${
                      checked
                        ? 'bg-indigo-950/40 border-indigo-500/30 text-slate-200'
                        : 'bg-slate-900/40 border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <img
                      src={`https://hatscripts.github.io/circle-flags/flags/${c.code.toLowerCase()}.svg`}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-700/60"
                      loading="lazy"
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Previews Thumbnails Grid (if completed) */}
          {generatedBadges.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Transparent Badge Gallery ({generatedBadges.length} previewed)
                </span>
                <span className="text-slate-500">Click any badge to download individual transparent PNG</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800 scrollbar-thin">
                {generatedBadges.map((item) => (
                  <div
                    key={item.country.code}
                    className="group relative flex flex-col items-center p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all"
                  >
                    <div className="w-full aspect-square relative flex items-center justify-center p-1 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:8px_8px] rounded">
                      <img
                        src={item.dataUrl}
                        alt={item.country.name}
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center mt-1">
                      {item.country.shortName}
                    </span>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.dataUrl;
                        link.download = item.filename;
                        link.click();
                      }}
                      className="absolute inset-0 bg-slate-950/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 font-semibold text-xs gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PNG</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Guaranteed without background: All outputs have 100% transparent alpha.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            {zipBlob && !isGenerating && (
              <button
                onClick={handleDownloadZip}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                title="Download the compiled .ZIP file containing all generated transparent PNG badges"
              >
                <Download className="w-4 h-4" />
                <span>Download .ZIP ({generatedBadges.length} Badges)</span>
              </button>
            )}
            <button
              onClick={handleStartBatch}
              disabled={isGenerating || selectedCodes.size === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating ({progressCount}/{selectedCodes.size})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{zipBlob ? 'Regenerate .ZIP' : `Generate .ZIP (${selectedCodes.size} Countries)`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
