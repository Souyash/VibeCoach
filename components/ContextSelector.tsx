import React from 'react';
import { CONTEXT_OPTIONS } from '../constants';
import { Briefcase, Heart, Mic, TrendingUp, Coffee, ChevronRight } from 'lucide-react';

interface ContextSelectorProps {
  onSelect: (contextId: string) => void;
}

const ContextSelector: React.FC<ContextSelectorProps> = ({ onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'briefcase': return <Briefcase className="w-6 h-6" />;
      case 'heart': return <Heart className="w-6 h-6" />;
      case 'mic': return <Mic className="w-6 h-6" />;
      case 'trending-up': return <TrendingUp className="w-6 h-6" />;
      case 'coffee': return <Coffee className="w-6 h-6" />;
      default: return <Briefcase className="w-6 h-6" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-2 text-center">What's the Vibe?</h2>
      <p className="text-gray-400 text-center mb-8">Select the scenario you want to practice for.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONTEXT_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.label)}
            className="group relative p-6 bg-slate-800 hover:bg-vibe-900 border border-slate-700 hover:border-vibe-500 rounded-2xl transition-all duration-300 flex flex-col items-start text-left shadow-lg hover:shadow-vibe-500/20"
          >
            <div className="p-3 bg-slate-900 rounded-xl mb-4 text-vibe-400 group-hover:text-vibe-300 group-hover:scale-110 transition-transform duration-300">
              {getIcon(option.icon)}
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">{option.label}</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300">{option.description}</p>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <ChevronRight className="text-vibe-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContextSelector;