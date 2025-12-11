import React, { useRef, useState, useEffect } from 'react';
import { Camera, Video, Upload, StopCircle, RefreshCw, AlertCircle, Lightbulb, X } from 'lucide-react';
import { ImprovementPlan } from '../types';

interface MediaInputProps {
  onMediaCaptured: (blob: Blob, type: string) => void;
  onCancel: () => void;
  contextLabel: string;
  previousPlan?: ImprovementPlan;
}

const MediaInput: React.FC<MediaInputProps> = ({ onMediaCaptured, onCancel, contextLabel, previousPlan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'initial' | 'camera' | 'upload'>('initial');
  const [showDrillOverlay, setShowDrillOverlay] = useState(true);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setMode('camera');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not access camera/microphone. Please check permissions.");
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      onMediaCaptured(blob, 'video/webm');
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) { // Max 60 seconds
            stopRecording();
            return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        onMediaCaptured(file, file.type);
      } else {
        setError("Please upload a valid video or audio file.");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'initial') {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-6 animate-fade-in">
        
        {/* Left Col: Controls */}
        <div className="flex-1 p-6 bg-slate-800 rounded-3xl shadow-xl border border-slate-700">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Practice for: {contextLabel}</h3>
                <p className="text-gray-400">Choose how you want to provide your input.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <button 
                    onClick={startCamera}
                    className="flex items-center p-6 bg-slate-900 border-2 border-dashed border-vibe-600 rounded-2xl hover:bg-vibe-900/20 hover:border-vibe-400 transition-all group"
                >
                    <div className="w-12 h-12 bg-vibe-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <span className="block text-lg font-semibold text-white">Record Video</span>
                        <span className="text-sm text-gray-500">Use your camera</span>
                    </div>
                </button>

                <label className="flex items-center p-6 bg-slate-900 border-2 border-dashed border-slate-600 rounded-2xl hover:bg-slate-800 hover:border-slate-400 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <span className="block text-lg font-semibold text-white">Upload File</span>
                        <span className="text-sm text-gray-500">Video or Audio (Max 20MB)</span>
                    </div>
                    <input type="file" className="hidden" accept="video/*,audio/*" onChange={handleFileUpload} />
                </label>
            </div>
            
            <button onClick={onCancel} className="mt-8 w-full py-3 text-gray-400 hover:text-white transition-colors">
                Back to Context Selection
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2 text-red-200">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>

        {/* Right Col: Coach's Notes (If previous plan exists) */}
        {previousPlan && (
            <div className="w-full md:w-80 p-6 bg-gradient-to-b from-vibe-900/50 to-slate-900/50 rounded-3xl border border-vibe-500/30 shadow-lg">
                <div className="flex items-center gap-2 mb-4 text-vibe-300">
                    <Lightbulb className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Coach's Focus</h3>
                </div>
                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Try to say this</p>
                        <p className="text-white bg-slate-900 p-3 rounded-lg text-sm italic">
                            "{previousPlan.correction_example.what_you_should_say}"
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Body Language</p>
                        <p className="text-slate-200 text-sm">
                            {previousPlan.body_language_fix.instruction}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Immediate Drill</p>
                        <p className="text-white font-medium text-sm">
                            {previousPlan.immediate_drill.drill_content}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-fade-in">
        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-slate-800">
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
            />
            
            {/* Drill Overlay - Helper text while recording */}
            {previousPlan && showDrillOverlay && (
                <div className="absolute top-6 left-6 right-16 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-left transition-all hover:bg-black/80">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-vibe-300 text-xs font-bold uppercase tracking-wider">Coach's Challenge</span>
                    </div>
                    <p className="text-white text-lg font-medium leading-relaxed">
                        "{previousPlan.immediate_drill.drill_content}"
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        <span className="text-vibe-400 font-bold">Fix: </span> 
                        {previousPlan.body_language_fix.instruction}
                    </p>
                </div>
            )}
            
            {/* Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
                <div className="text-white font-mono text-xl mb-4 font-bold tracking-widest bg-black/50 px-4 py-1 rounded-full">
                    {formatTime(recordingTime)} / 0:60
                </div>
                
                <div className="flex items-center gap-6">
                    {!isRecording ? (
                        <button 
                            onClick={startRecording}
                            className="w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full border-4 border-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-red-900/50"
                        >
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </button>
                    ) : (
                        <button 
                            onClick={stopRecording}
                            className="w-16 h-16 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-transform hover:scale-105"
                        >
                            <StopCircle className="w-8 h-8 text-red-600 fill-current" />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                 <button 
                    onClick={onCancel} 
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    title="Cancel"
                >
                   <RefreshCw className="w-5 h-5" />
                </button>
                {previousPlan && (
                    <button 
                        onClick={() => setShowDrillOverlay(!showDrillOverlay)} 
                        className={`p-2 rounded-full transition-colors ${showDrillOverlay ? 'bg-vibe-600 text-white' : 'bg-black/50 text-gray-400'}`}
                        title="Toggle Tips"
                    >
                       <Lightbulb className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
        <p className="mt-4 text-gray-400 text-sm">
            {previousPlan 
                ? "Read the challenge above while recording to improve your score." 
                : "Make sure you are well-lit and your audio is clear."}
        </p>
    </div>
  );
};

export default MediaInput;