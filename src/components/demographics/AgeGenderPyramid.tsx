'use client';

import React from 'react';
import { useAnalytics } from '@/lib/store/useAnalyticsStore';
import { Users, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const AgeGenderPyramid: React.FC = () => {
  const { filteredDemographics } = useAnalytics();
  const ageData = filteredDemographics.ageDistribution || [];
  const genderData = filteredDemographics.genderDistribution || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Age Brackets Distribution */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Age Bracket Demographics
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregate distribution across cohorts (13-17 up to 55+)
            </p>
          </div>
          <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
            6 Cohorts
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#fff',
                }}
              />
              <Bar dataKey="percentage" name="Audience Share (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
          <span>Primary Demographic: <strong className="text-white">25-34 (Young Professionals)</strong></span>
          <span>Inference Confidence: <strong className="text-emerald-400">93.1%</strong></span>
        </div>
      </div>

      {/* Gender & Identity Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Gender & Persona Identity Split
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inferred from public profile metadata, stylistic markers, and interest signals
            </p>
          </div>
          <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
            Anonymized
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genderData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} unit="%" tickLine={false} />
              <YAxis type="category" dataKey="gender" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#fff',
                }}
              />
              <Bar dataKey="percentage" name="Share (%)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
          <span>Privacy Standard: <strong className="text-slate-300">Differential Privacy $k$-Anonymity</strong></span>
          <span>Sample Base: <strong className="text-white">Representative Slice</strong></span>
        </div>
      </div>
    </div>
  );
};
