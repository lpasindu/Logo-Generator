import React, { useState, useMemo } from 'react';
import { Search, Globe2, Check, X } from 'lucide-react';
import { COUNTRIES, Country, getFlagUrl } from '../data/countries';

interface CountryPickerProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

const REGIONS = ['All', 'Americas', 'Europe', 'Asia', 'Africa', 'Oceania'] as const;

// Quick access top trading nations
const POPULAR_CODES = ['US', 'GB', 'DE', 'FR', 'IT', 'JP', 'CA', 'AU', 'KR', 'CH', 'BR', 'IN', 'CN', 'ES', 'NL'];

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const filteredCountries = useMemo(() => {
    let list = COUNTRIES;
    if (selectedRegion !== 'All') {
      list = list.filter((c) => c.region === selectedRegion);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, selectedRegion]);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 p-4 shadow-xl">
      {/* Header with Search */}
      <div className="space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-100">Select Country Flag</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredCountries.length} countries
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or code (e.g. USA, France, DE)..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin text-xs">
          {REGIONS.map((region) => {
            const isActive = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>

        {/* Quick Popular Presets */}
        <div className="pt-1 border-t border-slate-800/60">
          <div className="text-[11px] text-slate-500 mb-1.5 flex items-center justify-between">
            <span>Popular:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CODES.map((code) => {
              const c = COUNTRIES.find((item) => item.code === code);
              if (!c) return null;
              const isSelected = selectedCountry.code === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => onSelectCountry(c)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] border transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/80 text-amber-300 font-semibold'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <img
                    src={getFlagUrl(c.code)}
                    alt=""
                    className="w-4 h-4 rounded-full object-cover border border-amber-500/20"
                    loading="lazy"
                  />
                  <span>{c.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Country List / Grid */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin divide-y divide-slate-800/40">
        {filteredCountries.map((c) => {
          const isSelected = selectedCountry.code === c.code;
          return (
            <button
              key={c.code}
              onClick={() => onSelectCountry(c)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0 shadow-sm ring-1 ring-amber-500/20 flex items-center justify-center">
                  <img
                    src={getFlagUrl(c.code)}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium truncate flex items-center gap-1.5">
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Badge: <span className="text-amber-400/90">{c.shortName}</span> · {c.code}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="shrink-0 p-1 text-amber-400">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}

        {filteredCountries.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            No country matches "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
