import React, { useState } from 'react';
import { WorkstationFile } from '../types';
import { ZoomIn, ZoomOut, RotateCw, Download, Sliders, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { downloadTextAsFile } from '../services/fileService';

interface ImageViewerProps {
  file: WorkstationFile;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ file }) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);

  const isSvg = file.extension === 'svg';
  const imageSource = file.content?.startsWith('data:') || file.content?.startsWith('http')
    ? file.content
    : isSvg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(file.content || '')}`
    : `https://picsum.photos/1200/800?seed=${file.id}`;

  const resetFilters = () => {
    setZoom(100);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setInvert(0);
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between p-3.5 bg-obsidian-900 border-b border-obsidian-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{file.name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {file.extension.toUpperCase()} • Escala: {zoom}% • Rotación: {rotation}°
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-obsidian-850 px-2 py-1 rounded-lg border border-obsidian-750">
            <button
              onClick={() => setZoom((z) => Math.max(20, z - 15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-gold-400 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(300, z + 15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 hover:text-white border border-obsidian-750 rounded-lg transition"
            title="Rotar 90 grados"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={resetFilters}
            className="p-2 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 hover:text-white border border-obsidian-750 rounded-lg transition"
            title="Restablecer filtros"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview with Canvas / Image */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#1a202c_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
        <div
          className="transition-transform duration-200 shadow-2xl rounded-xl border border-gold-500/20 bg-obsidian-900/60 p-2"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) invert(${invert}%)`
          }}
        >
          <img
            src={imageSource}
            alt={file.name}
            className="max-h-[550px] max-w-full rounded-lg object-contain select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Bottom Adjustment Controls */}
      <div className="p-3 bg-obsidian-900 border-t border-obsidian-800 flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Brillo:</span>
          <input
            type="range"
            min="50"
            max="180"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-24 h-1 bg-obsidian-750 rounded accent-gold-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Contraste:</span>
          <input
            type="range"
            min="50"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-24 h-1 bg-obsidian-750 rounded accent-gold-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Escala de Grises:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={grayscale}
            onChange={(e) => setGrayscale(Number(e.target.value))}
            className="w-24 h-1 bg-obsidian-750 rounded accent-gold-400"
          />
        </div>
      </div>
    </div>
  );
};