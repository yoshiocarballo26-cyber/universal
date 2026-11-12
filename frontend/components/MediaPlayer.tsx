import React, { useState, useRef, useEffect } from 'react';
import { WorkstationFile } from '../types';
import { Play, Pause, Volume2, VolumeX, RotateCcw, FastForward, Rewind, Music, Maximize2, Radio, Sliders } from 'lucide-react';

interface MediaPlayerProps {
  file: WorkstationFile;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ file }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [bassGain, setBassGain] = useState<number>(3);
  const [trebleGain, setTrebleGain] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'player' | 'equalizer' | 'metadata'>('player');

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isVideo = file.type === 'video';

  // Audio synthesis simulation for offline ambient demo
  const startSyntheticAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3 chord ambient
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 3);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn('AudioContext not active', e);
    }
  };

  const stopSyntheticAudio = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {
        // Ignored
      }
      oscillatorRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSyntheticAudio();
      if (videoRef.current) videoRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      if (isVideo && videoRef.current) {
        videoRef.current.play().catch(() => {});
      } else {
        startSyntheticAudio();
      }
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            stopSyntheticAudio();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    }
  };

  useEffect(() => {
    return () => {
      stopSyntheticAudio();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-obsidian-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {file.name}
              <span className="text-xs px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono uppercase">
                {file.extension}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Motor: HTML5 Native WebAudio/Video Core • Decodificación en Memoria
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-obsidian-900 border border-obsidian-750 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'player' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reproductor
          </button>
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'equalizer' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ecualizador
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'metadata' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Metadatos
          </button>
        </div>
      </div>

      {activeTab === 'player' && (
        <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full">
          {/* Visual Display Screen */}
          <div className="relative rounded-2xl bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-gold-500/20 shadow-2xl p-8 flex flex-col items-center justify-center min-h-[300px] overflow-hidden group">
            {isVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-black/60 rounded-xl relative">
                <video
                  ref={videoRef}
                  className="w-full max-h-[360px] rounded-lg"
                  src={file.content?.startsWith('http') || file.content?.startsWith('data:') ? file.content : undefined}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 120)}
                />
                {!file.content?.startsWith('data:') && !file.content?.startsWith('http') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-obsidian-900/90 backdrop-blur-sm">
                    <Radio className="w-16 h-16 text-gold-400 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-white">Canal de Video Emulado</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Suba un archivo MP4/WebM desde el explorador para decodificación completa offline directa.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Audio Visualizer Waves */
              <div className="flex flex-col items-center justify-center w-full">
                <div className="relative flex items-center justify-center w-40 h-40 rounded-full bg-obsidian-850 border border-gold-500/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] mb-6">
                  <Music className={`w-16 h-16 text-gold-400 transition-transform ${isPlaying ? 'scale-110' : 'scale-100'}`} />
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border border-gold-400/40 animate-ping" />
                  )}
                </div>

                {/* Simulated Graphic Equalizer Bars */}
                <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-md px-4">
                  {[24, 45, 68, 30, 85, 95, 60, 42, 80, 55, 30, 70, 90, 40, 20].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-gold-600 via-gold-400 to-amber-200 rounded-t transition-all duration-150"
                      style={{
                        height: isPlaying ? `${Math.max(12, (h * (Math.sin(currentTime * 4 + i) + 1.2)) % 100)}%` : '15%',
                        opacity: isPlaying ? 0.9 : 0.25
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="mt-8 bg-obsidian-900/90 border border-obsidian-800 rounded-2xl p-6 backdrop-blur-md">
            {/* Timeline Progress */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-xs font-mono text-slate-400 min-w-[40px]">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-obsidian-750 rounded-lg appearance-none cursor-pointer accent-gold-400"
              />
              <span className="text-xs font-mono text-slate-400 min-w-[40px] text-right">{formatTime(duration)}</span>
            </div>

            {/* Playback action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Speed Buttons */}
              <div className="flex items-center space-x-1.5 bg-obsidian-850 p-1 rounded-lg border border-obsidian-750">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-2 py-1 text-xs rounded font-mono ${
                      playbackRate === rate ? 'bg-gold-500/20 text-gold-300 font-bold border border-gold-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Main Center Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                  className="p-2.5 rounded-full bg-obsidian-850 text-slate-300 hover:text-white hover:bg-obsidian-750 transition"
                  title="Retroceder 10s"
                >
                  <Rewind className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-4 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-obsidian-950 font-bold shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime((t) => Math.min(duration, t + 10))}
                  className="p-2.5 rounded-full bg-obsidian-850 text-slate-300 hover:text-white hover:bg-obsidian-750 transition"
                  title="Avanzar 10s"
                >
                  <FastForward className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-24 h-1.5 bg-obsidian-750 rounded-lg appearance-none cursor-pointer accent-gold-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equalizer' && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-8 max-w-2xl mx-auto w-full">
          <div className="flex items-center space-x-3 mb-6">
            <Sliders className="w-6 h-6 text-gold-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Ecualizador Paramétrico</h3>
              <p className="text-xs text-slate-400">Ajuste de respuesta de frecuencia del flujo digital</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span>Graves (Bass 60Hz - 250Hz)</span>
                <span className="text-gold-400 font-bold">+{bassGain} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={bassGain}
                onChange={(e) => setBassGain(Number(e.target.value))}
                className="w-full h-2 bg-obsidian-750 rounded-lg appearance-none cursor-pointer accent-gold-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span>Agudos (Treble 4kHz - 16kHz)</span>
                <span className="text-gold-400 font-bold">+{trebleGain} dB</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={trebleGain}
                onChange={(e) => setTrebleGain(Number(e.target.value))}
                className="w-full h-2 bg-obsidian-750 rounded-lg appearance-none cursor-pointer accent-gold-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750 text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-gold-300">Modo de aislamiento:</span> Procesamiento estéreo nativo mediante WebAudio Gain y BiquadFilterNodes. Los ajustes se aplican en tiempo real sin recargar el archivo.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 max-w-2xl mx-auto w-full font-mono text-xs">
          <h3 className="text-sm font-bold text-gold-400 mb-4 uppercase tracking-wider">Metadatos del Flujo Multimedia</h3>
          <div className="divide-y divide-obsidian-800">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Nombre de Pista:</span>
              <span className="text-white font-sans font-semibold">{file.name}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Formato / Contenedor:</span>
              <span className="text-gold-300 uppercase">{file.extension}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">MIME Type:</span>
              <span className="text-slate-200">{file.mimeType}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Tamaño en Disco:</span>
              <span className="text-slate-200">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Duración Estimada:</span>
              <span className="text-slate-200">{formatTime(duration)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Canales de Audio:</span>
              <span className="text-slate-200">2 (Stereo L/R 48.0 kHz)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Subtítulos Compatibles:</span>
              <span className="text-emerald-400 font-semibold">SRT, VTT, WebVTT Habilitado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};