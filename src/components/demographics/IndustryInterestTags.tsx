'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Briefcase, Tag } from 'lucide-react';

export const IndustryInterestTags: React.FC = () => {
  const { filteredDemographics } = useAnalytics();
  const interests = filteredDemographics.professionalInterests || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Professional Domains & Industry Interests
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated professional backgrounds and domain interests extracted from bios and behavioral posting patterns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {interests.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 transition"
          >
            <div>
              <div className="font-bold text-xs text-white">{item.category}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {item.topKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-cyan-400">{item.percentage}%</span>
              <div className="text-[10px] text-slate-500">{item.count} authors</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
