import React, { useState, useRef, useEffect } from 'react';
import { WorkstationFile, PlaylistItem, SubtitleCue } from '../types';
import { 
  Play, Pause, Volume2, VolumeX, FastForward, Rewind, Music, Radio, 
  Sliders, ListMusic, Subtitles, Upload, ArrowUp, ArrowDown, Trash2, Plus, FileText, Check
} from 'lucide-react';

interface MediaPlayerProps {
  file: WorkstationFile;
  allMediaFiles?: WorkstationFile[];
  onSelectTrack?: (file: WorkstationFile) => void;
}

// SRT and WebVTT Parser
export function parseSubtitles(rawText: string): SubtitleCue[] {
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const cues: SubtitleCue[] = [];
  let currentStart = 0;
  let currentEnd = 0;
  let currentTextLines: string[] = [];
  let cueId = 1;

  const parseTimestamp = (timeStr: string): number => {
    // 00:00:20,000 or 00:00:20.000 or 00:20.000
    const clean = timeStr.trim().replace(',', '.');
    const parts = clean.split(':');
    if (parts.length === 3) {
      const h = parseFloat(parts[0]) || 0;
      const m = parseFloat(parts[1]) || 0;
      const s = parseFloat(parts[2]) || 0;
      return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const m = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]) || 0;
      return m * 60 + s;
    }
    return 0;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('WEBVTT') || line.startsWith('NOTE')) {
      if (currentTextLines.length > 0 && currentEnd > currentStart) {
        cues.push({
          id: cueId++,
          start: currentStart,
          end: currentEnd,
          text: currentTextLines.join('\n')
        });
        currentTextLines = [];
      }
      continue;
    }

    if (line.includes('-->')) {
      if (currentTextLines.length > 0 && currentEnd > currentStart) {
        cues.push({
          id: cueId++,
          start: currentStart,
          end: currentEnd,
          text: currentTextLines.join('\n')
        });
        currentTextLines = [];
      }
      const [startStr, endStr] = line.split('-->');
      currentStart = parseTimestamp(startStr.trim().split(' ')[0]);
      currentEnd = parseTimestamp(endStr.trim().split(' ')[0]);
    } else if (/^\d+$/.test(line) && lines[i + 1]?.includes('-->')) {
      // Cue index number
      continue;
    } else if (currentEnd > 0) {
      currentTextLines.push(line);
    }
  }

  if (currentTextLines.length > 0 && currentEnd > currentStart) {
    cues.push({
      id: cueId++,
      start: currentStart,
      end: currentEnd,
      text: currentTextLines.join('\n')
    });
  }

  return cues;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
  file, 
  allMediaFiles = [], 
  onSelectTrack 
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [bassGain, setBassGain] = useState<number>(3);
  const [trebleGain, setTrebleGain] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'player' | 'playlist' | 'subtitles' | 'equalizer' | 'metadata'>('player');

  // Playlist State
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([
    {
      id: 'p-1',
      fileId: file.id,
      title: file.name,
      type: file.type === 'video' ? 'video' : 'audio',
      duration: 180,
      extension: file.extension
    },
    {
      id: 'p-2',
      fileId: 'demo-orbit-echo',
      title: 'Orbit_Echoes_Spatial.flac',
      type: 'audio',
      duration: 245,
      extension: 'flac'
    },
    {
      id: 'p-3',
      fileId: 'demo-synthetic-drone',
      title: 'Obsidian_Drone_Sequence.wav',
      type: 'audio',
      duration: 310,
      extension: 'wav'
    }
  ]);

  // Subtitles State
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([
    { id: 1, start: 1, end: 5, text: "Bienvenido a YC Universal Workstation" },
    { id: 2, start: 6, end: 12, text: "Reproducción con decodificación de audio y video 100% offline" },
    { id: 3, start: 13, end: 20, text: "Subtítulos sincronizados con precisión de milisegundos" },
    { id: 4, start: 22, end: 32, text: "Soporte completo para archivos SRT, VTT y listas de reproducción" }
  ]);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [activeSubtitleText, setActiveSubtitleText] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const srtInputRef = useRef<HTMLInputElement | null>(null);

  const isVideo = file.type === 'video';

  // Sincronizar subtítulo activo según currentTime
  useEffect(() => {
    if (!subtitlesEnabled || subtitles.length === 0) {
      setActiveSubtitleText('');
      return;
    }
    const currentCue = subtitles.find(cue => currentTime >= cue.start && currentTime <= cue.end);
    setActiveSubtitleText(currentCue ? currentCue.text : '');
  }, [currentTime, subtitles, subtitlesEnabled]);

  // Ensure current file is in playlist
  useEffect(() => {
    const exists = playlist.find(p => p.fileId === file.id);
    if (!exists) {
      setPlaylist(prev => [
        {
          id: `p-${Date.now()}`,
          fileId: file.id,
          title: file.name,
          type: file.type === 'video' ? 'video' : 'audio',
          duration: 180,
          extension: file.extension
        },
        ...prev
      ]);
    }
  }, [file]);

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
      osc.frequency.setValueAtTime(146.83, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 3);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
    } catch (e) {
      console.warn('AudioContext not active', e);
    }
  };

  const stopSyntheticAudio = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
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
            handleTrackEnded();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    }
  };

  const handleTrackEnded = () => {
    setIsPlaying(false);
    stopSyntheticAudio();
    // Auto advance to next in playlist
    const currentIndex = playlist.findIndex(item => item.fileId === file.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      const nextItem = playlist[currentIndex + 1];
      const foundFile = allMediaFiles.find(f => f.id === nextItem.fileId);
      if (foundFile && onSelectTrack) {
        onSelectTrack(foundFile);
      }
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

  // Reorder playlist items
  const movePlaylistItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= playlist.length) return;
    const updated = [...playlist];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setPlaylist(updated);
  };

  const removePlaylistItem = (id: string) => {
    setPlaylist(playlist.filter(item => item.id !== id));
  };

  // Handle Subtitle File Upload
  const handleLoadSubtitleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const subFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const parsed = parseSubtitles(text);
          setSubtitles(parsed);
          setSubtitlesEnabled(true);
        }
      };
      reader.readAsText(subFile);
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 p-6 overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-obsidian-800 mb-6 gap-3">
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
              HTML5 Native WebAudio/Video Core • Subtítulos SRT/VTT • Cola de Reproducción
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-obsidian-900 border border-obsidian-750 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'player' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reproductor
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'playlist' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" /> Lista ({playlist.length})
          </button>
          <button
            onClick={() => setActiveTab('subtitles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'subtitles' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5" /> Subtítulos
          </button>
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'equalizer' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ecualizador
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'metadata' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Metadatos
          </button>
        </div>
      </div>

      {activeTab === 'player' && (
        <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full">
          {/* Visual Display Screen */}
          <div className="relative rounded-2xl bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-gold-500/20 shadow-2xl p-6 flex flex-col items-center justify-center min-h-[340px] overflow-hidden group">
            {isVideo ? (
              <div className="w-full h-full flex items-center justify-center bg-black/70 rounded-xl relative overflow-hidden min-h-[300px]">
                <video
                  ref={videoRef}
                  className="w-full max-h-[380px] rounded-lg"
                  src={file.content?.startsWith('http') || file.content?.startsWith('data:') ? file.content : undefined}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 180)}
                />

                {!file.content?.startsWith('data:') && !file.content?.startsWith('http') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-obsidian-900/90 backdrop-blur-sm">
                    <Radio className="w-16 h-16 text-gold-400 mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-white">Canal de Video Digital</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Suba un archivo MP4/WebM desde el explorador para reproducción nativa directa.
                    </p>
                  </div>
                )}

                {/* Subtitles Overlay Banner */}
                {subtitlesEnabled && activeSubtitleText && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none z-20">
                    <div className="bg-black/85 backdrop-blur-md text-amber-200 border border-gold-500/40 px-5 py-2 rounded-xl text-center text-sm md:text-base font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.8)] max-w-xl animate-fade-in">
                      {activeSubtitleText}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Audio Visualizer Waves with Subtitles Display */
              <div className="flex flex-col items-center justify-center w-full relative">
                <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-obsidian-850 border border-gold-500/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] mb-6">
                  <Music className={`w-14 h-14 text-gold-400 transition-transform ${isPlaying ? 'scale-110' : 'scale-100'}`} />
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border border-gold-400/40 animate-ping" />
                  )}
                </div>

                {/* Active Subtitle Text on Audio */}
                {subtitlesEnabled && activeSubtitleText && (
                  <div className="mb-4 bg-obsidian-850/90 border border-gold-500/30 px-4 py-1.5 rounded-lg text-amber-300 text-xs font-mono font-medium max-w-md text-center">
                    "{activeSubtitleText}"
                  </div>
                )}

                {/* Simulated Graphic Equalizer Bars */}
                <div className="flex items-end justify-center gap-1.5 h-14 w-full max-w-md px-4">
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
          <div className="mt-6 bg-obsidian-900/90 border border-obsidian-800 rounded-2xl p-6 backdrop-blur-md">
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
              {/* Speed Buttons & Subtitle Quick Toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-obsidian-850 p-1 rounded-lg border border-obsidian-750">
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

                <button
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border flex items-center gap-1.5 transition ${
                    subtitlesEnabled 
                      ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' 
                      : 'bg-obsidian-850 text-slate-500 border-obsidian-750'
                  }`}
                  title="Activar/Desactivar Subtítulos"
                >
                  <Subtitles className="w-3.5 h-3.5" /> CC
                </button>
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

      {/* Playlist Management Tab */}
      {activeTab === 'playlist' && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 max-w-3xl mx-auto w-full shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-obsidian-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-gold-400" /> Cola y Lista de Reproducción
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Reordena pistas, cambia el orden de reproducción y selecciona temas directamente.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {playlist.map((item, idx) => {
              const isCurrent = item.fileId === file.id;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition ${
                    isCurrent
                      ? 'bg-gold-500/10 border-gold-500/40 text-gold-300'
                      : 'bg-obsidian-850/60 border-obsidian-750 text-slate-300 hover:bg-obsidian-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center font-mono text-xs text-slate-500">{idx + 1}</span>
                    <div className="p-2 bg-obsidian-800 rounded-lg text-gold-400">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        {item.title}
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500 text-obsidian-950 font-bold uppercase font-mono">
                            Reproduciendo
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.extension.toUpperCase()} • {formatTime(item.duration || 180)}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Reordering */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => movePlaylistItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => movePlaylistItem(idx, 'down')}
                      disabled={idx === playlist.length - 1}
                      className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removePlaylistItem(item.id)}
                      className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subtitles Manager Tab */}
      {activeTab === 'subtitles' && (
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 max-w-3xl mx-auto w-full shadow-2xl">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-obsidian-800 mb-6 gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Subtitles className="w-5 h-5 text-gold-400" /> Administrador de Subtítulos (SRT / VTT)
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Carga archivos .srt o .vtt para sincronización en tiempo real con el reproductor.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={srtInputRef}
                accept=".srt,.vtt,.txt"
                onChange={handleLoadSubtitleFile}
                className="hidden"
              />
              <button
                onClick={() => srtInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl hover:bg-gold-400 flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" /> Cargar SRT / VTT
              </button>
            </div>
          </div>

          {/* Subtitles List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
            {subtitles.map((cue) => {
              const isCurrentCue = currentTime >= cue.start && currentTime <= cue.end;
              return (
                <div
                  key={cue.id}
                  onClick={() => {
                    setCurrentTime(cue.start);
                    if (videoRef.current) videoRef.current.currentTime = cue.start;
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isCurrentCue
                      ? 'bg-gold-500/15 border-gold-500/50 text-gold-200 shadow-md'
                      : 'bg-obsidian-850/60 border-obsidian-750 text-slate-300 hover:bg-obsidian-850'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-gold-400 font-bold">#{cue.id}</span>
                    <span className="text-slate-400">
                      {formatTime(cue.start)} ➔ {formatTime(cue.end)}
                    </span>
                  </div>
                  <p className="text-sm font-sans">{cue.text}</p>
                </div>
              );
            })}
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
              <span className="text-slate-400">Pistas en Cola:</span>
              <span className="text-slate-200">{playlist.length} archivos</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Subtítulos Cargados:</span>
              <span className="text-emerald-400 font-semibold">{subtitles.length} líneas ({subtitlesEnabled ? 'Activos' : 'Pausados'})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
