'use client';

import React from 'react';
import { WorldGeoMap } from '@/components/demographics/WorldGeoMap';
import { AgeGenderPyramid } from '@/components/demographics/AgeGenderPyramid';
import { PersonaClusterCards } from '@/components/demographics/PersonaClusterCards';
import { IndustryInterestTags } from '@/components/demographics/IndustryInterestTags';
import { Users, Globe, Shield } from 'lucide-react';

export default function DemographicsPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-blue-950/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Vector C: Automated Demographic Profiling & Audience Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregate, privacy-preserving models inferring age cohorts, global choropleth distributions, languages, professional domains, and persona clusters
            </p>
          </div>
        </div>
      </div>

      {/* Global Geo Map & Regional Choropleth */}
      <WorldGeoMap />

      {/* Age & Gender Distributions */}
      <AgeGenderPyramid />

      {/* Persona Clusters */}
      <PersonaClusterCards />

      {/* Professional Domains & Industry Tags */}
      <IndustryInterestTags />
    </div>
  );
}
