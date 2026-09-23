import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Grid,
  Sparkles,
  Upload,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Flag,
  Type,
  ShieldCheck,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Country } from '../data/countries';
import { BadgeStyleConfig, BadgeTextConfig, CustomFormatConfig, MovableElement } from '../types/badge';
import { renderBadgeToCanvas, downloadCanvasAsPng, copyCanvasToClipboard } from '../services/badgeRenderer';

interface BadgePreviewProps {
  country: Country;
  style: BadgeStyleConfig;
  textConfig: BadgeTextConfig;
  onTextConfigChange?: (updater: (prev: BadgeTextConfig) => BadgeTextConfig) => void;
  customConfig?: CustomFormatConfig;
  onUploadImage: (file: File) => void;
  onOpenBatchModal: () => void;
  customFlagUrl?: string;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const BadgePreview: React.FC<BadgePreviewProps> = ({
  country,
  style,
  textConfig,
  onTextConfigChange,
  customConfig,
  onUploadImage,
  onOpenBatchModal,
  customFlagUrl,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [exportRes, setExportRes] = useState<512 | 1024 | 2048>(1024);
  const [bgMode, setBgMode] = useState<'checker_dark' | 'checker_light' | 'pure_dark'>('checker_dark');
  const [zoom, setZoom] = useState(1);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Movable element state
  const [selectedElement, setSelectedElement] = useState<MovableElement>('flag');
  const [hoveredElement, setHoveredElement] = useState<MovableElement | null>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [dragStart, setDragStart] = useState<{
    clientX: number;
    clientY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    initialRotation: number;
  } | null>(null);

  // Redraw canvas whenever country, style, textConfig, customConfig, or customFlagUrl change
  const renderCurrent = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderBadgeToCanvas(
      canvasRef.current,
      country,
      style,
      textConfig,
      customConfig,
      1024,
      customFlagUrl
    );
  }, [country, style, textConfig, customConfig, customFlagUrl]);

  useEffect(() => {
    renderCurrent();
  }, [renderCurrent]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const exportCanvas = document.createElement('canvas');
      await renderBadgeToCanvas(
        exportCanvas,
        country,
        style,
        textConfig,
        customConfig,
        exportRes,
        customFlagUrl
      );
      const safeCountry = country.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      downloadCanvasAsPng(exportCanvas, `made_in_${safeCountry}_badge_${exportRes}px.png`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const success = await copyCanvasToClipboard(canvasRef.current);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUploadImage(file);
      }
    }
  };

  // Convert client pointer event into 0-1024 canvas space
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1024;
    const y = ((e.clientY - rect.top) / rect.height) * 1024;
    return { x, y, rectWidth: rect.width, rectHeight: rect.height };
  };

  // Detect element from canvas coordinates
  const detectElement = (x: number, y: number): MovableElement => {
    const dx = x - 512;
    const dy = y - 512;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const flagRadiusPx = (textConfig.flagRadius || 0.29) * 1024;

    if (dist <= flagRadiusPx + 20) {
      return 'flag';
    } else if (y < 512) {
      return 'topText';
    } else {
      return 'bottomText';
    }
  };

  // Pointer Down: Start Dragging & Select Element
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    const clickedElement = detectElement(coords.x, coords.y);
    setSelectedElement(clickedElement);
    setIsDraggingCanvas(true);

    if (clickedElement === 'flag') {
      setDragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        initialOffsetX: textConfig.flagOffsetX || 0,
        initialOffsetY: textConfig.flagOffsetY || 0,
        initialRotation: 0,
      });
    } else if (clickedElement === 'topText') {
      setDragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        initialOffsetX: 0,
        initialOffsetY: textConfig.topTextOffsetY || 0,
        initialRotation: textConfig.topTextRotation || 0,
      });
    } else if (clickedElement === 'bottomText') {
      setDragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        initialOffsetX: 0,
        initialOffsetY: textConfig.bottomTextOffsetY || 0,
        initialRotation: textConfig.bottomTextRotation || 0,
      });
    }
  };

  // Pointer Move: Drag smoothly
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const coords = getCanvasCoords(e);

    if (coords && !isDraggingCanvas) {
      setHoveredElement(detectElement(coords.x, coords.y));
    }

    if (!isDraggingCanvas || !dragStart || !onTextConfigChange) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleRatio = 1024 / rect.width;
    const deltaX = (e.clientX - dragStart.clientX) * scaleRatio;
    const deltaY = (e.clientY - dragStart.clientY) * scaleRatio;

    if (selectedElement === 'flag') {
      const newX = Math.round(Math.max(-180, Math.min(180, dragStart.initialOffsetX + deltaX)));
      const newY = Math.round(Math.max(-180, Math.min(180, dragStart.initialOffsetY + deltaY)));
      onTextConfigChange((prev) => ({
        ...prev,
        flagOffsetX: newX,
        flagOffsetY: newY,
      }));
    } else if (selectedElement === 'topText') {
      const newY = Math.round(Math.max(-120, Math.min(120, dragStart.initialOffsetY + deltaY)));
      const newRot = Math.round(Math.max(-90, Math.min(90, dragStart.initialRotation + deltaX * 0.25)));
      onTextConfigChange((prev) => ({
        ...prev,
        topTextOffsetY: newY,
        topTextRotation: newRot,
      }));
    } else if (selectedElement === 'bottomText') {
      const newY = Math.round(Math.max(-120, Math.min(120, dragStart.initialOffsetY + deltaY)));
      const newRot = Math.round(Math.max(-90, Math.min(90, dragStart.initialRotation + deltaX * 0.25)));
      onTextConfigChange((prev) => ({
        ...prev,
        bottomTextOffsetY: newY,
        bottomTextRotation: newRot,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingCanvas(false);
    setDragStart(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Nudge selected element with click buttons
  const nudge = (dx: number, dy: number) => {
    if (!onTextConfigChange) return;

    if (selectedElement === 'flag') {
      onTextConfigChange((prev) => ({
        ...prev,
        flagOffsetX: Math.round(Math.max(-180, Math.min(180, (prev.flagOffsetX || 0) + dx))),
        flagOffsetY: Math.round(Math.max(-180, Math.min(180, (prev.flagOffsetY || 0) + dy))),
      }));
    } else if (selectedElement === 'topText') {
      onTextConfigChange((prev) => ({
        ...prev,
        topTextOffsetY: Math.round(Math.max(-120, Math.min(120, (prev.topTextOffsetY || 0) + dy))),
        topTextRotation: Math.round(Math.max(-90, Math.min(90, (prev.topTextRotation || 0) + dx * 0.5))),
      }));
    } else if (selectedElement === 'bottomText') {
      onTextConfigChange((prev) => ({
        ...prev,
        bottomTextOffsetY: Math.round(Math.max(-120, Math.min(120, (prev.bottomTextOffsetY || 0) + dy))),
        bottomTextRotation: Math.round(Math.max(-90, Math.min(90, (prev.bottomTextRotation || 0) + dx * 0.5))),
      }));
    }
  };

  // Rotate text
  const rotateText = (deltaDeg: number) => {
    if (!onTextConfigChange) return;
    if (selectedElement === 'topText') {
      onTextConfigChange((prev) => ({
        ...prev,
        topTextRotation: Math.round(Math.max(-90, Math.min(90, (prev.topTextRotation || 0) + deltaDeg))),
      }));
    } else if (selectedElement === 'bottomText') {
      onTextConfigChange((prev) => ({
        ...prev,
        bottomTextRotation: Math.round(Math.max(-90, Math.min(90, (prev.bottomTextRotation || 0) + deltaDeg))),
      }));
    }
  };

  // Zoom flag
  const zoomFlag = (deltaScale: number) => {
    if (!onTextConfigChange) return;
    onTextConfigChange((prev) => ({
      ...prev,
      flagScale: Math.round(Math.max(0.5, Math.min(2.5, (prev.flagScale || 1.0) + deltaScale)) * 100) / 100,
    }));
  };

  // Reset position
  const resetSelectedPosition = () => {
    if (!onTextConfigChange) return;
    if (selectedElement === 'flag') {
      onTextConfigChange((prev) => ({
        ...prev,
        flagOffsetX: 0,
        flagOffsetY: 0,
        flagScale: 1.0,
      }));
    } else if (selectedElement === 'topText') {
      onTextConfigChange((prev) => ({
        ...prev,
        topTextOffsetY: 0,
        topTextRotation: 0,
      }));
    } else if (selectedElement === 'bottomText') {
      onTextConfigChange((prev) => ({
        ...prev,
        bottomTextOffsetY: 0,
        bottomTextRotation: 0,
      }));
    }
  };

  const resetAllPositions = () => {
    if (!onTextConfigChange) return;
    onTextConfigChange((prev) => ({
      ...prev,
      flagOffsetX: 0,
      flagOffsetY: 0,
      flagScale: 1.0,
      topTextOffsetY: 0,
      topTextRotation: 0,
      bottomTextOffsetY: 0,
      bottomTextRotation: 0,
    }));
  };

  // Current coordinates for visual readout
  const flagX = textConfig.flagOffsetX || 0;
  const flagY = textConfig.flagOffsetY || 0;
  const flagScalePercent = Math.round((textConfig.flagScale || 1.0) * 100);
  const flagRadiusPx = (textConfig.flagRadius || 0.29) * 1024;

  const topTextY = textConfig.topTextOffsetY || 0;
  const topTextRot = textConfig.topTextRotation || 0;
  const bottomTextY = textConfig.bottomTextOffsetY || 0;
  const bottomTextRot = textConfig.bottomTextRotation || 0;

  return (
    <div className="flex flex-col h-full bg-slate-900/70 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Action & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-200">
              {country.name}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium">
              {country.shortName}
            </span>
          </div>

          <span className="hidden sm:inline text-xs text-slate-500">·</span>
          <span className="hidden sm:inline text-xs text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Flag (FlagCDN · Non-AI)</span>
          </span>
        </div>

        {/* View & Resolution Controls */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo Shortcuts */}
          {onUndo && (
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 hover:bg-slate-700 transition-colors"
                title="Undo (Ctrl + Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 hover:bg-slate-700 transition-colors"
                title="Redo (Ctrl + Shift + Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Guide toggle button */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              showGuides
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle interactive on-canvas movement guides"
          >
            {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Guides</span>
          </button>

          {/* Background Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => setBgMode('checker_dark')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                bgMode === 'checker_dark' ? 'bg-slate-700 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dark Checkerboard (Verify Transparent PNG)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dark Grid</span>
            </button>
            <button
              onClick={() => setBgMode('checker_light')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                bgMode === 'checker_light' ? 'bg-slate-700 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Light Checkerboard"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Light Grid</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/60 text-xs">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 transition-colors font-mono text-[11px]"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Header Download Button */}
          <button
            id="preview-header-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            title="Download Transparent PNG Badge Immediately"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Interactive Element Selection Bar (Clickable) */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/70 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Move className="w-3 h-3 text-amber-400" />
            <span>Click to Move:</span>
          </span>

          {/* Flag selection button */}
          <button
            onClick={() => setSelectedElement('flag')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              selectedElement === 'flag'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Center Flag</span>
          </button>

          {/* Top text selection button */}
          <button
            onClick={() => setSelectedElement('topText')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              selectedElement === 'topText'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Top Text</span>
          </button>

          {/* Bottom text selection button */}
          <button
            onClick={() => setSelectedElement('bottomText')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
              selectedElement === 'bottomText'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-1 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Bottom Text</span>
          </button>
        </div>

        {/* Position Reset Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetSelectedPosition}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors text-[11px]"
            title="Reset position of selected element to center"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset {selectedElement === 'flag' ? 'Flag' : selectedElement === 'topText' ? 'Top Text' : 'Bottom Text'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Display Area */}
      <div
        ref={containerRef}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleFileDrop}
        className={`relative flex-1 flex items-center justify-center p-3 min-h-[220px] overflow-hidden select-none transition-colors ${
          bgMode === 'checker_dark'
            ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950'
            : bgMode === 'checker_light'
            ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] bg-slate-200'
            : 'bg-slate-950'
        }`}
      >
        {/* Canvas Display Element with interactive dragging */}
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="relative transition-transform duration-150 ease-out drop-shadow-2xl flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`max-w-[75vw] max-h-[36vh] sm:max-w-[340px] sm:max-h-[340px] lg:max-w-[390px] lg:max-h-[390px] aspect-square object-contain select-none touch-none ${
              isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          />

          {/* SVG Visual Overlay Guide for Movable Elements */}
          {showGuides && (
            <svg
              viewBox="0 0 1024 1024"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            >
              {/* Highlight for Center Flag */}
              {selectedElement === 'flag' && (
                <g className="transition-all duration-75">
                  {/* Dashed circular selection boundary */}
                  <circle
                    cx={512}
                    cy={512}
                    r={flagRadiusPx}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={4}
                    strokeDasharray="10 6"
                    className="animate-[spin_40s_linear_infinite]"
                    style={{ transformOrigin: '512px 512px' }}
                  />
                  {/* Flag Center Crosshair */}
                  <line
                    x1={512 + flagX - 18}
                    y1={512 + flagY}
                    x2={512 + flagX + 18}
                    y2={512 + flagY}
                    stroke="#f59e0b"
                    strokeWidth={3}
                  />
                  <line
                    x1={512 + flagX}
                    y1={512 + flagY - 18}
                    x2={512 + flagX}
                    y2={512 + flagY + 18}
                    stroke="#f59e0b"
                    strokeWidth={3}
                  />
                  <circle
                    cx={512 + flagX}
                    cy={512 + flagY}
                    r={5}
                    fill="#f59e0b"
                  />
                </g>
              )}

              {/* Highlight for Top Text */}
              {selectedElement === 'topText' && (
                <g className="transition-all duration-75">
                  <circle
                    cx={512}
                    cy={512 + topTextY}
                    r={textConfig.topRadius * 1024}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    strokeDasharray="8 6"
                  />
                </g>
              )}

              {/* Highlight for Bottom Text */}
              {selectedElement === 'bottomText' && (
                <g className="transition-all duration-75">
                  <circle
                    cx={512}
                    cy={512 + bottomTextY}
                    r={textConfig.bottomRadius * 1024}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    strokeDasharray="8 6"
                  />
                </g>
              )}
            </svg>
          )}
        </div>

        {/* Drag & Drop Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-sm border-2 border-dashed border-amber-400 rounded-2xl flex flex-col items-center justify-center text-amber-200 z-30 pointer-events-none">
            <Upload className="w-12 h-12 mb-2 animate-bounce text-amber-400" />
            <p className="text-base font-semibold">Drop your badge image here</p>
            <p className="text-xs text-amber-300/80">Supports PNG, JPG, WebP</p>
          </div>
        )}

        {/* Live Interaction Badge / Position Indicator */}
        <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-2 pointer-events-none z-20">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950/85 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-sm shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {selectedElement === 'flag' ? (
              <span>Flag: X {flagX > 0 ? `+${flagX}` : flagX}px · Y {flagY > 0 ? `+${flagY}` : flagY}px · Zoom {flagScalePercent}%</span>
            ) : selectedElement === 'topText' ? (
              <span>Top Text: Y {topTextY > 0 ? `+${topTextY}` : topTextY}px · Rot {topTextRot}°</span>
            ) : (
              <span>Bottom Text: Y {bottomTextY > 0 ? `+${bottomTextY}` : bottomTextY}px · Rot {bottomTextRot}°</span>
            )}
          </div>
        </div>

        {/* Hover / Click Instruction Badge */}
        <div className="absolute top-3 left-4 flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800/80 text-[10px] text-slate-400 backdrop-blur-sm">
          <Move className="w-3 h-3 text-amber-400" />
          <span>Click &amp; drag canvas to move or use arrows below</span>
        </div>
      </div>

      {/* Interactive Click-to-Move D-Pad & Controls Bar */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Nudge Arrow Buttons (Click to Move 5px) */}
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 mr-1 font-medium">Nudge:</span>
          <button
            onClick={() => nudge(-5, 0)}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
            title="Move Left 5px"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => nudge(0, -5)}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
            title="Move Up 5px"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => nudge(0, 5)}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
            title="Move Down 5px"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => nudge(5, 0)}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
            title="Move Right 5px"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Element Quick Modifiers */}
        {selectedElement === 'flag' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Flag Zoom:</span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => zoomFlag(-0.05)}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 font-bold"
                title="Zoom Out Flag"
              >
                -
              </button>
              <span className="px-1.5 text-[11px] font-mono text-amber-300">{flagScalePercent}%</span>
              <button
                onClick={() => zoomFlag(0.05)}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 font-bold"
                title="Zoom In Flag"
              >
                +
              </button>
            </div>

            {/* Flag source toggle */}
            <button
              onClick={() => {
                if (!onTextConfigChange) return;
                onTextConfigChange((prev) => ({
                  ...prev,
                  flagSource: prev.flagSource === 'circular_vector' ? 'original_official' : 'circular_vector',
                }));
              }}
              className="ml-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] font-medium"
              title="Toggle between Original Sovereign Flag and Circular Vector"
            >
              {textConfig.flagSource === 'circular_vector' ? '⭕ Circular Icon' : '🏛️ Official Real Flag'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Arc Rotation:</span>
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => rotateText(-4)}
                className="p-1 rounded text-slate-300 hover:text-amber-300 hover:bg-slate-800"
                title="Rotate Counter-Clockwise 4°"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <span className="px-1.5 text-[11px] font-mono text-amber-300">
                {selectedElement === 'topText' ? `${topTextRot}°` : `${bottomTextRot}°`}
              </span>
              <button
                onClick={() => rotateText(4)}
                className="p-1 rounded text-slate-300 hover:text-amber-300 hover:bg-slate-800"
                title="Rotate Clockwise 4°"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Global Reset */}
        <button
          onClick={resetAllPositions}
          className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
        >
          Reset All
        </button>
      </div>

      {/* Bottom Export & Generation Action Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20 shadow-2xl">
        {/* Export Resolution Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Export Size:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setExportRes(512)}
              className={`px-2.5 py-1 rounded transition-colors ${
                exportRes === 512 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              512px
            </button>
            <button
              onClick={() => setExportRes(1024)}
              className={`px-2.5 py-1 rounded transition-colors ${
                exportRes === 1024 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              1024px <span className="text-[10px] opacity-80">(HD)</span>
            </button>
            <button
              onClick={() => setExportRes(2048)}
              className={`px-2.5 py-1 rounded transition-colors ${
                exportRes === 2048 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              2048px <span className="text-[10px] opacity-80">(4K)</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all active:scale-95"
            title="Copy PNG to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download Single PNG */}
          <button
            id="preview-bottom-download-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download Transparent PNG</span>
          </button>

          {/* Batch Generate All Countries */}
          <button
            onClick={onOpenBatchModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Batch World</span>
          </button>
        </div>
      </div>
    </div>
  );
};
