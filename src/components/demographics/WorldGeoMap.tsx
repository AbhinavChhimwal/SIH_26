'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Globe, MapPin, SmilePlus, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const WorldGeoMap: React.FC = () => {
  const { filteredDemographics, filters, updateFilter } = useAnalytics();
  const geoData = filteredDemographics.geographicDistribution || [];
  const [hoveredCountry, setHoveredCountry] = useState<any | null>(null);

  // SVG world map representation coordinates
  const COUNTRY_PIN_OFFSETS: Record<string, { x: number; y: number }> = {
    'United States': { x: 220, y: 160 },
    'United Kingdom': { x: 470, y: 120 },
    'Germany': { x: 500, y: 130 },
    'France': { x: 480, y: 145 },
    'India': { x: 670, y: 210 },
    'Japan': { x: 820, y: 165 },
    'Canada': { x: 210, y: 110 },
    'Australia': { x: 800, y: 340 },
    'Brazil': { x: 330, y: 280 },
    'Singapore': { x: 720, y: 250 },
    'South Korea': { x: 790, y: 165 },
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Global Audience Geographic Distribution & Regional Sentiment
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-border sentiment choropleth mapping inferred from geolocation tags, time zones, and linguistic markers
          </p>
        </div>

        {filters.selectedCountry && (
          <button
            onClick={() => updateFilter('selectedCountry', null)}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            Clear Country Filter ({filters.selectedCountry})
          </button>
        )}
      </div>

      {/* SVG Interactive World Map Canvas */}
      <div className="relative h-72 w-full rounded-xl border border-slate-800/80 bg-slate-950/90 overflow-hidden">
        {/* Stylized background world map outline */}
        <svg
          viewBox="0 0 960 420"
          className="h-full w-full opacity-35 pointer-events-none stroke-slate-700 fill-slate-900"
        >
          {/* North America */}
          <path d="M 120 80 Q 200 60 280 90 Q 310 140 260 220 Q 210 210 160 160 Z" />
          {/* South America */}
          <path d="M 270 240 Q 360 270 330 360 Q 290 380 270 290 Z" />
          {/* Europe */}
          <path d="M 450 90 Q 550 80 540 160 Q 470 170 440 130 Z" />
          {/* Africa */}
          <path d="M 460 180 Q 570 190 540 310 Q 480 320 450 240 Z" />
          {/* Asia */}
          <path d="M 560 80 Q 820 90 840 210 Q 720 280 570 190 Z" />
          {/* Australia */}
          <path d="M 750 290 Q 850 290 840 360 Q 760 370 740 320 Z" />
        </svg>

        {/* Dynamic Geo Pins */}
        <div className="absolute inset-0">
          {geoData.map((item) => {
            const pin = COUNTRY_PIN_OFFSETS[item.country] || { x: 480, y: 200 };
            const isSelected = filters.selectedCountry === item.country;
            const size = Math.max(16, Math.min(42, Math.round(item.percentage * 1.8)));

            return (
              <div
                key={item.country}
                onClick={() => updateFilter('selectedCountry', isSelected ? null : item.country)}
                onMouseEnter={() => setHoveredCountry(item)}
                onMouseLeave={() => setHoveredCountry(null)}
                style={{
                  left: `${(pin.x / 960) * 100}%`,
                  top: `${(pin.y / 420) * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              >
                <div
                  style={{ width: `${size}px`, height: `${size}px` }}
                  className={`relative flex items-center justify-center rounded-full transition transform group-hover:scale-125 ${
                    item.sentimentScore >= 0
                      ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300'
                      : 'bg-rose-500/30 border border-rose-400 text-rose-300'
                  } ${isSelected ? 'ring-4 ring-white shadow-xl scale-125' : ''}`}
                >
                  <span className="text-[9px] font-bold">{item.countryCode}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Country Tooltip */}
        {hoveredCountry && (
          <div className="absolute bottom-3 right-3 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>{hoveredCountry.country}</span>
            </div>
            <div className="mt-1 space-y-0.5 text-[11px] text-slate-300">
              <div>Share: <strong>{hoveredCountry.percentage}%</strong> of global discourse</div>
              <div>
                Net Polarity:{' '}
                <strong className={hoveredCountry.sentimentScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {hoveredCountry.sentimentScore >= 0 ? `+${hoveredCountry.sentimentScore}` : hoveredCountry.sentimentScore}
                </strong>
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                Dominant Vector: {hoveredCountry.dominantEmotion}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Country Leaderboard Table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {geoData.slice(0, 6).map((c) => (
          <div
            key={c.country}
            onClick={() => updateFilter('selectedCountry', filters.selectedCountry === c.country ? null : c.country)}
            className={`rounded-xl border p-2.5 cursor-pointer transition ${
              filters.selectedCountry === c.country
                ? 'border-emerald-500 bg-emerald-500/15'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="truncate">{c.country}</span>
              <span className="text-slate-400 font-mono text-[10px]">{c.percentage}%</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Polarity</span>
              <span
                className={`font-mono font-bold ${
                  c.sentimentScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {c.sentimentScore >= 0 ? `+${c.sentimentScore}` : c.sentimentScore}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
