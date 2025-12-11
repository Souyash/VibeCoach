import React, { useState } from 'react';
import ContextSelector from './components/ContextSelector';
import MediaInput from './components/MediaInput';
import AnalysisResult from './components/AnalysisResult';
import { analyzeVibe } from './services/geminiService';
import { AppState, VibeCoachResponse } from './types';
import { Sparkles, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('context');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [history, setHistory] = useState<VibeCoachResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentAnalysis = history.length > 0 ? history[history.length - 1] : null;
  const previousAnalysis = history.length > 1 ? history[history.length - 2] : null;

  const handleContextSelect = (context: string) => {
    setSelectedContext(context);
    setAppState('input');
  };

  const handleMediaCaptured = async (blob: Blob, type: string) => {
    setAppState('analyzing');
    setError(null);
    try {
      const result = await analyzeVibe(blob, selectedContext, type);
      setHistory(prev => [...prev, result]);
      setAppState('results');
    } catch (err) {
      console.error(err);
      setError("Failed to analyze media. Please ensure your API key is set and try again.");
      setAppState('input');
    }
  };

  const handleRetry = () => {
    setAppState('input');
    // We do NOT clear history here, allowing the input screen to access the last plan
  };

  const resetApp = () => {
    setAppState('context');
    setSelectedContext('');
    setHistory([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-vibe-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 bg-gradient-to-tr from-vibe-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-vibe-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">VibeCoach</span>
          </div>
          {appState !== 'context' && (
            <div className="flex items-center gap-3">
               {history.length > 0 && (
                  <div className="hidden sm:block text-xs font-mono text-slate-500">
                    Attempt #{history.length + (appState === 'results' ? 0 : 1)}
                  </div>
               )}
               <div className="text-sm text-slate-400 bg-slate-800 py-1 px-3 rounded-full">
                Mode: <span className="text-vibe-400 font-medium">{selectedContext}</span>
               </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {appState === 'context' && (
          <ContextSelector onSelect={handleContextSelect} />
        )}

        {appState === 'input' && (
          <div className="animate-fade-in">
             <MediaInput 
                contextLabel={selectedContext} 
                onMediaCaptured={handleMediaCaptured} 
                onCancel={() => setAppState('context')}
                previousPlan={currentAnalysis?.improvement_plan}
             />
             {error && (
               <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-center">
                 {error}
               </div>
             )}
          </div>
        )}

        {appState === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-800 border-t-vibe-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-vibe-500" />
                </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white">Analyzing Vibe...</h2>
            <p className="text-slate-400 mt-2">Checking tone, body language, and content.</p>
          </div>
        )}

        {appState === 'results' && currentAnalysis && (
          <AnalysisResult 
            data={currentAnalysis} 
            onRetry={handleRetry}
            previousScore={previousAnalysis?.analysis.score}
          />
        )}

      </main>
    </div>
  );
};

export default App;