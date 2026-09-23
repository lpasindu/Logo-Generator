import React, { useState } from 'react';
import {
  Globe,
  Key,
  Database,
  Play,
  CheckCircle,
  AlertCircle,
  Trash2,
  HelpCircle,
  Sparkles,
  Link,
  Code,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ApiConfig } from '../types/badge';
import { Country } from '../data/countries';
import { executeCustomApi, ApiResponseResult } from '../services/apiIntegrationService';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  onSaveApiConfig: (config: ApiConfig) => void;
  activeCountry: Country;
  onApplyApiFlagImage?: (imageUrl: string) => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onSaveApiConfig,
  activeCountry,
  onApplyApiFlagImage,
}) => {
  const [config, setConfig] = useState<ApiConfig>(apiConfig);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiResponseResult | null>(null);

  if (!isOpen) return null;

  const handleTestApi = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await executeCustomApi(config, activeCountry);
      setTestResult(res);
      if (res.success && res.imageUrl && onApplyApiFlagImage) {
        onApplyApiFlagImage(res.imageUrl);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveApiConfig(config);
    onClose();
  };

  const handlePresetSelect = (preset: {
    name: string;
    url: string;
    jsonPath?: string;
    mapping: 'json_url' | 'direct_image' | 'base64';
    notes: string;
  }) => {
    setConfig({
      ...config,
      endpointUrl: preset.url,
      jsonPath: preset.jsonPath || '',
      responseMapping: preset.mapping,
      notes: preset.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Custom API Integration
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Own API / Microservice
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connect your proprietary flag service, DAM, CMS, or dynamic seal backend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin text-xs">
          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ready-to-use API Templates:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  name: 'Circle-Flags Official Vector CDN',
                  url: 'https://hatscripts.github.io/circle-flags/flags/{code_lower}.svg',
                  mapping: 'direct_image' as const,
                  notes: 'Fast SVG circular country emblems designed for round logos',
                },
                {
                  name: 'REST Countries Public API',
                  url: 'https://restcountries.com/v3.1/alpha/{code}',
                  jsonPath: '0.flags.svg',
                  mapping: 'json_url' as const,
                  notes: 'Returns official UN-recognized state coat & flag metadata',
                },
                {
                  name: 'FlagCDN Ultra-Res WebP',
                  url: 'https://flagcdn.com/w640/{code_lower}.webp',
                  mapping: 'direct_image' as const,
                  notes: 'Direct 640px compressed WebP graphic',
                },
                {
                  name: 'Custom Self-Hosted Microservice',
                  url: 'https://api.yourdomain.com/v1/badges/{code}?format=circle',
                  jsonPath: 'data.seal_url',
                  mapping: 'json_url' as const,
                  notes: 'Proprietary enterprise assets endpoint with auth token support',
                },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-400/60 text-left transition-all group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-amber-300">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                    {p.url}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint URL Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-amber-400" />
                <span>API Endpoint URL:</span>
              </label>
              <span className="text-[11px] text-amber-400/90 font-mono">
                Variables: &#123;code&#125;, &#123;code_lower&#125;, &#123;country&#125;
              </span>
            </div>
            <input
              type="text"
              value={config.endpointUrl}
              onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
              placeholder="https://api.example.com/flags/{code_lower}.svg or https://my-server.com/badge?country={code}"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Authentication & Custom Headers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Key / Secret Token (Optional):</span>
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk_live_... or token string"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span>Header Name:</span>
              </label>
              <input
                type="text"
                value={config.headerName || ''}
                onChange={(e) => setConfig({ ...config, headerName: e.target.value })}
                placeholder="Authorization (Default) or X-API-Key"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Response Parser Mapping */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Response Type:
              </label>
              <select
                value={config.responseMapping || 'direct_image'}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    responseMapping: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="direct_image">Direct Image / SVG stream</option>
                <option value="json_url">JSON Object containing image URL</option>
                <option value="base64">Base64 Encoded Image Data</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                JSON Path (if JSON response):
              </label>
              <input
                type="text"
                value={config.jsonPath || ''}
                onChange={(e) => setConfig({ ...config, jsonPath: e.target.value })}
                placeholder="e.g. data.flag_url or 0.flags.svg"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Test API Live Request */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Live Request for:</span>
                <span className="font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {activeCountry.name} ({activeCountry.code})
                </span>
              </div>

              <button
                type="button"
                onClick={handleTestApi}
                disabled={isTesting || !config.endpointUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTesting ? 'Calling Endpoint...' : 'Send Test Request'}</span>
              </button>
            </div>

            {/* Test Output Panel */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1.5">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{testResult.success ? 'API Response Successful' : 'Request Error'}</span>
                  <span className="text-[11px] font-mono opacity-80">
                    ({testResult.statusText || testResult.error})
                  </span>
                </div>

                {testResult.imageUrl && (
                  <div className="flex items-center gap-3 mt-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <img
                      src={testResult.imageUrl}
                      alt="API Output"
                      className="w-10 h-10 rounded-full object-cover border border-amber-400/50 shadow-sm"
                    />
                    <div className="truncate flex-1 font-mono text-[10px] text-slate-300">
                      <div>Resolved Image Source:</div>
                      <div className="truncate text-amber-400">{testResult.imageUrl}</div>
                    </div>
                  </div>
                )}

                {testResult.rawJson && (
                  <pre className="mt-2 p-2 bg-slate-950/80 rounded-md font-mono text-[10px] text-slate-300 max-h-28 overflow-y-auto">
                    {JSON.stringify(testResult.rawJson, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setConfig({ endpointUrl: '' });
              setTestResult(null);
            }}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Configuration</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
            >
              Save &amp; Apply API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
