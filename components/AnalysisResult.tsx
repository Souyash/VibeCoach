import React from 'react';
import { VibeCoachResponse } from '../types';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Play, ArrowRight, MessageSquare, User, Zap, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalysisResultProps {
  data: VibeCoachResponse;
  onRetry: () => void;
  previousScore?: number;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onRetry, previousScore }) => {
  const scoreData = [{ name: 'Score', value: data.analysis.score, fill: '#8b5cf6' }];
  
  // Dynamic color for score
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80'; // Green
    if (score >= 60) return '#facc15'; // Yellow
    return '#f87171'; // Red
  };

  scoreData[0].fill = getScoreColor(data.analysis.score);

  const getScoreComparison = () => {
    if (previousScore === undefined) return null;
    const diff = data.analysis.score - previousScore;
    if (diff > 0) return { icon: TrendingUp, text: `+${diff}`, color: 'text-green-400', label: 'Improved' };
    if (diff < 0) return { icon: TrendingDown, text: `${diff}`, color: 'text-red-400', label: 'Decreased' };
    return { icon: Minus, text: '0', color: 'text-gray-400', label: 'Same' };
  };

  const comparison = getScoreComparison();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-vibe-900/20 to-transparent"></div>
          <h3 className="text-gray-400 font-medium mb-2 relative z-10">Vibe Score</h3>
          <div className="h-48 w-full relative z-10 flex items-center justify-center">
            <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={20} 
                    data={scoreData} 
                    startAngle={90} 
                    endAngle={-270}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex flex-col items-center justify-center z-20">
              <span className="text-5xl font-bold text-white">{data.analysis.score}</span>
              {comparison && (
                  <div className={`flex items-center gap-1 mt-1 ${comparison.color} bg-black/20 px-2 py-0.5 rounded-full text-sm`}>
                      <comparison.icon className="w-3 h-3" />
                      <span className="font-bold">{comparison.text}</span>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Issue Card */}
        <div className="md:col-span-2 bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-700 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-bl-full pointer-events-none"></div>
             <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                    <Zap className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">Primary Weakness</h3>
                    <p className="text-slate-300 text-lg mt-2 leading-relaxed">"{data.analysis.primary_issue}"</p>
                </div>
             </div>
        </div>
      </div>

      {/* Improvement Plan Grid */}
      <h2 className="text-2xl font-bold text-white pl-2 border-l-4 border-vibe-500">Improvement Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verbal Correction */}
        <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4 text-vibe-400">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">Verbal Fix</h3>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 bg-red-900/20 border-l-2 border-red-500 rounded-r-lg">
                    <p className="text-xs text-red-400 uppercase font-bold mb-1">What You Said</p>
                    <p className="text-gray-300 italic">"{data.improvement_plan.correction_example.what_you_said}"</p>
                </div>
                <div className="flex justify-center">
                    <ArrowRight className="text-gray-600 transform rotate-90 md:rotate-0" />
                </div>
                <div className="p-4 bg-green-900/20 border-l-2 border-green-500 rounded-r-lg">
                    <p className="text-xs text-green-400 uppercase font-bold mb-1">Better Version</p>
                    <p className="text-white font-medium">"{data.improvement_plan.correction_example.what_you_should_say}"</p>
                </div>
            </div>
        </div>

        {/* Body Language Fix */}
        <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4 text-vibe-400">
                <User className="w-5 h-5" />
                <h3 className="font-semibold uppercase tracking-wider text-sm">Body Language</h3>
            </div>
            <div className="h-full flex flex-col justify-center">
                <div className="mb-4">
                    <span className="text-gray-500 text-sm">Detected Issue:</span>
                    <p className="text-white font-medium text-lg">{data.improvement_plan.body_language_fix.issue}</p>
                </div>
                <div className="p-4 bg-vibe-900/30 rounded-xl border border-vibe-700/50">
                    <p className="text-vibe-200 leading-relaxed">
                        <span className="font-bold text-vibe-400">Try this: </span>
                        {data.improvement_plan.body_language_fix.instruction}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Immediate Drill Section - The "Action" part */}
      <div className="bg-gradient-to-r from-vibe-900 to-indigo-900 rounded-3xl p-8 border border-vibe-700 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Play className="w-6 h-6 fill-white" /> 
                        Immediate Drill: {data.improvement_plan.immediate_drill.drill_name}
                    </h2>
                    <p className="text-indigo-200 mt-1">Don't just read it. Do it.</p>
                </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-400 uppercase font-bold mb-2">Instructions</p>
                <p className="text-white mb-4">{data.improvement_plan.immediate_drill.instructions}</p>
                
                <div className="p-6 bg-white/10 rounded-lg text-center">
                    <p className="text-2xl md:text-3xl font-serif text-white tracking-wide leading-relaxed">
                        "{data.improvement_plan.immediate_drill.drill_content}"
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={onRetry}
                    className="flex-1 py-4 bg-white text-vibe-900 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                </button>
                <div className="flex-1 flex items-center justify-center text-indigo-200 text-sm">
                    {data.next_step}
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisResult;