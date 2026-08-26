'use client';

import React, { useState } from 'react';
import { Sliders, Sparkles, CheckCircle2, RotateCcw, Plus, Trash2 } from 'lucide-react';

export const ModelTuningStudio: React.FC = () => {
  const [sarcasmSensitivity, setSarcasmSensitivity] = useState<number>(75);
  const [anxietyThreshold, setAnxietyThreshold] = useState<number>(60);
  const [subjectivityWeight, setSubjectivityWeight] = useState<number>(50);

  const [customKeywords, setCustomKeywords] = useState<Array<{ phrase: string; emotion: string; weight: number }>>([
    { phrase: 'zero-day exploit', emotion: 'anxiety', weight: 0.95 },
    { phrase: 'groundbreaking', emotion: 'excitement', weight: 0.85 },
    { phrase: 'as if', emotion: 'sarcasm', weight: 0.90 },
    { phrase: 'lawsuit incoming', emotion: 'against', weight: 0.88 },
  ]);

  const [newPhrase, setNewPhrase] = useState('');
  const [newEmotion, setNewEmotion] = useState('sarcasm');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddKeyword = () => {
    if (!newPhrase.trim()) return;
    setCustomKeywords([...customKeywords, { phrase: newPhrase.trim().toLowerCase(), emotion: newEmotion, weight: 0.85 }]);
    setNewPhrase('');
    setIsSaved(false);
  };

  const handleRemove = (idx: number) => {
    setCustomKeywords(customKeywords.filter((_, i) => i !== idx));
    setIsSaved(false);
  };

  const handleSaveModel = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Live Model Calibration & Heuristic Lexicon Studio
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin model calibration studio to tune sarcasm sensitivities, emotion trigger weights, and domain vocabularies on the fly
          </p>
        </div>
        <div className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
          NLP Model: Sentix-RoBERTa-v2.5
        </div>
      </div>

      {/* Model Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Sarcasm Contrast Sensitivity</span>
            <span className="text-amber-400 font-mono">{sarcasmSensitivity}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={sarcasmSensitivity}
            onChange={(e) => { setSarcasmSensitivity(Number(e.target.value)); setIsSaved(false); }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[10px] text-slate-500">Tunes aggressive detection of ironic praise contradictions.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Anxiety Activation Baseline</span>
            <span className="text-rose-400 font-mono">{anxietyThreshold}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={anxietyThreshold}
            onChange={(e) => { setAnxietyThreshold(Number(e.target.value)); setIsSaved(false); }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <p className="text-[10px] text-slate-500">Regulates threat keyword classification thresholds.</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Subjectivity Dampener</span>
            <span className="text-purple-400 font-mono">{subjectivityWeight}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={subjectivityWeight}
            onChange={(e) => { setSubjectivityWeight(Number(e.target.value)); setIsSaved(false); }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <p className="text-[10px] text-slate-500">Balances factual claims vs opinion sentiment polarity.</p>
        </div>
      </div>

      {/* Domain Custom Lexicon Vocabulary */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Custom Domain Emotion Trigger Vocabularies:</span>
          <span className="text-[10px] text-slate-500">{customKeywords.length} active triggers</span>
        </div>

        {/* Add phrase row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            placeholder="Add new phrase (e.g. 'unacceptable outage')..."
            className="flex-1 h-8 rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
          <select
            value={newEmotion}
            onChange={(e) => setNewEmotion(e.target.value)}
            className="h-8 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer"
          >
            <option value="sarcasm">Sarcasm</option>
            <option value="anxiety">Anxiety</option>
            <option value="excitement">Excitement</option>
            <option value="supportive">Supportive</option>
            <option value="against">Against</option>
          </select>
          <button
            onClick={handleAddKeyword}
            className="flex items-center space-x-1 rounded-lg bg-purple-600 px-3 text-xs font-bold text-white hover:bg-purple-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Trigger</span>
          </button>
        </div>

        {/* Existing tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {customKeywords.map((kw, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs"
            >
              <span className="text-white font-semibold">"{kw.phrase}"</span>
              <span className="text-slate-500">→</span>
              <span className="text-[10px] uppercase font-bold text-purple-400">{kw.emotion}</span>
              <button
                onClick={() => handleRemove(idx)}
                className="text-slate-500 hover:text-rose-400 ml-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-1">
        {isSaved ? (
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Calibration weights applied live to sentiment engine!
          </span>
        ) : (
          <span className="text-xs text-slate-500">Weights calibrate live in memory for session.</span>
        )}

        <button
          onClick={handleSaveModel}
          className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-purple-500 hover:to-indigo-500 transition shadow-md shadow-purple-600/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Apply Model Calibration</span>
        </button>
      </div>
    </div>
  );
};
