import React, { useState } from 'react';
import {
  Laptop,
  Download,
  Check,
  FolderArchive,
  MonitorDown,
  Sparkles,
  X,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { generatePortablePcZip } from '../services/portablePcBundleService';

interface PortablePcModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortablePcModal: React.FC<PortablePcModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const zipBlob = await generatePortablePcZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'World_Flag_Badge_Studio_Portable_PC.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 6000);
    } catch (err) {
      console.error('Failed to generate portable PC bundle:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Portable PC &amp; Desktop Edition
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Offline
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Use on your PC without an internet connection or server.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          {/* Option 1: Native PC Desktop App (PWA) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <MonitorDown className="w-4 h-4" />
                </div>
                {isInstalled ? (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Installed
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Recommended
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-200">
                Install as Desktop PC App
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Installs directly into Windows (Start Menu / Taskbar) or macOS (Dock / Applications). Launches in its own window and works fully offline.
              </p>
            </div>

            <div>
              {isInstalled ? (
                <div className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Installed on this PC</span>
                </div>
              ) : isInstallable ? (
                <button
                  onClick={async () => {
                    await install();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <MonitorDown className="w-4 h-4" />
                  <span>Install to PC Desktop</span>
                </button>
              ) : (
                <div className="w-full py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] text-center">
                  Install via browser menu or URL bar (Desktop App)
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Standalone Offline .ZIP Package */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Zero Install (.zip)
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-200">
                Download Portable .ZIP
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Download a self-contained offline folder. Extract and double-click to run on any PC, laptop, or USB drive without internet or server.
              </p>
            </div>

            <div>
              <button
                onClick={handleDownloadZip}
                disabled={isDownloadingZip}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isDownloadingZip ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isDownloadingZip ? 'Compressing .ZIP...' : 'Download Portable .ZIP'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success message banner */}
        {zipSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Download complete!</strong> Unzip anywhere on your PC and double-click <code>Launch_Badge_Studio_Windows.bat</code> or <code>index.html</code> to run offline!
            </span>
          </div>
        )}

        {/* PC Features Checklist */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] space-y-2 text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Portable Edition Highlights:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Independent flag positioning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Full 250+ country catalog</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>High-res transparent PNGs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Zero telemetry or online lock</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
