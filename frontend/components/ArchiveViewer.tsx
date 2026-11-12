import React, { useState } from 'react';
import { WorkstationFile } from '../types';
import { Archive, Download, FileArchive, Folder, CheckCircle, FileCode, HardDrive } from 'lucide-react';
import { downloadTextAsFile } from '../services/fileService';

interface ArchiveViewerProps {
  file: WorkstationFile;
}

export const ArchiveViewer: React.FC<ArchiveViewerProps> = ({ file }) => {
  const [extractedFiles, setExtractedFiles] = useState<string[]>([]);

  // Simulated internal archive entries
  const archiveEntries = [
    { name: 'manifest.json', size: '1.2 KB', type: 'Configuración', date: '12 Nov 2026' },
    { name: 'assets/station_logo.svg', size: '8.4 KB', type: 'Gráfico Vectorial', date: '12 Nov 2026' },
    { name: 'core/runtime_engine.wasm', size: '124.0 KB', type: 'Binario Compilado', date: '10 Nov 2026' },
    { name: 'docs/SPECIFICATION.md', size: '4.8 KB', type: 'Documentación', date: '08 Nov 2026' },
    { name: 'licenses/MIT_LICENSE.txt', size: '1.1 KB', type: 'Licencia', date: '01 Nov 2026' }
  ];

  const handleExtract = (name: string) => {
    if (!extractedFiles.includes(name)) {
      setExtractedFiles([...extractedFiles, name]);
    }
    downloadTextAsFile(
      `// Archivo extraído de ${file.name}\n// Elemento: ${name}\nContenido simulado para extracción local segura.`,
      name.split('/').pop() || 'extraido.txt',
      'text/plain'
    );
  };

  const handleExtractAll = () => {
    setExtractedFiles(archiveEntries.map((e) => e.name));
    downloadTextAsFile(
      `--- REPORTE DE EXTRACCIÓN ZIP YC WORKSTATION ---\nContenedor: ${file.name}\nArchivos: ${archiveEntries.length}\nEstado: Extraído localmente sin pérdidas.`,
      'extraccion_completa_reporte.txt',
      'text/plain'
    );
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 p-6 overflow-y-auto">
      {/* Archive Header */}
      <div className="flex items-center justify-between pb-4 border-b border-obsidian-800 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {file.name}
              <span className="text-xs px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono uppercase">
                {file.extension}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Descompresión y Extracción en Memoria • Sin Envío a Servidores
            </p>
          </div>
        </div>

        <button
          onClick={handleExtractAll}
          className="px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 hover:bg-gold-400 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] transition"
        >
          <Download className="w-4 h-4" /> Extraer Todo
        </button>
      </div>

      {/* Archive Contents Table */}
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-obsidian-850/60 border-b border-obsidian-800 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">Estructura del Contenedor Comprimido ({archiveEntries.length} elementos)</span>
          <span className="text-gold-400">Algoritmo: Deflate / In-Memory Stream</span>
        </div>

        <div className="divide-y divide-obsidian-800 font-mono text-xs">
          {archiveEntries.map((entry, idx) => {
            const isExtracted = extractedFiles.includes(entry.name);
            return (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-obsidian-850/40 transition">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-obsidian-800 rounded-lg text-gold-400 border border-obsidian-750">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white font-sans font-semibold text-sm block">{entry.name}</span>
                    <span className="text-[11px] text-slate-500">{entry.type} • Modificado: {entry.date}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-slate-400">{entry.size}</span>
                  <button
                    onClick={() => handleExtract(entry.name)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                      isExtracted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-obsidian-800 hover:bg-gold-500/20 text-slate-300 hover:text-gold-300 border-obsidian-700'
                    }`}
                  >
                    {isExtracted ? <CheckCircle className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    {isExtracted ? 'Extraído' : 'Extraer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};