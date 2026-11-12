import React, { useState } from 'react';
import { WorkstationFile } from '../types';
import { 
  ArrowRightLeft, FileCode, Image as ImageIcon, Download, Copy, Check, Sparkles, RefreshCw 
} from 'lucide-react';
import { downloadTextAsFile, downloadBlobAsFile } from '../services/fileService';

interface FormatConverterProps {
  files: WorkstationFile[];
  onFileGenerated?: (newFile: WorkstationFile) => void;
}

export const FormatConverter: React.FC<FormatConverterProps> = ({ files, onFileGenerated }) => {
  const [activeCategory, setActiveCategory] = useState<'images' | 'data'>('images');

  // Image Conversion State
  const [selectedImageFileId, setSelectedImageFileId] = useState<string>('');
  const [targetImageFormat, setTargetImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageQuality, setImageQuality] = useState<number>(0.92);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
  const [isConvertingImage, setIsConvertingImage] = useState<boolean>(false);

  // Data / Text Conversion State
  const [inputDataType, setInputDataType] = useState<'csv' | 'json' | 'markdown'>('csv');
  const [targetDataType, setTargetDataType] = useState<'csv' | 'json' | 'markdown'>('json');
  const [dataInputContent, setDataInputContent] = useState<string>(
`Nombre,Departamento,Presupuesto,Estado
Sistema Alpha,Ingeniería,45000,Activo
Módulo YC Core,Investigación,32000,Producción
Visor 3D,Multimedia,18000,Completado`
  );
  const [dataOutputContent, setDataOutputContent] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const imageFiles = files.filter(f => f.type === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(f.extension));

  // --- Local Image Transcoding via Canvas ---
  const handleConvertImage = () => {
    setIsConvertingImage(true);
    const chosenFile = files.find(f => f.id === selectedImageFileId) || imageFiles[0];

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const src = chosenFile?.content?.startsWith('data:') || chosenFile?.content?.startsWith('http')
      ? chosenFile.content
      : chosenFile?.extension === 'svg'
      ? `data:image/svg+xml;utf8,${encodeURIComponent(chosenFile.content || '')}`
      : 'https://picsum.photos/800/600';

    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsConvertingImage(false);
        return;
      }
      // Fill background white if converting PNG/SVG with transparency to JPEG
      if (targetImageFormat === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const mime = `image/${targetImageFormat}`;
      const dataUrl = canvas.toDataURL(mime, imageQuality);
      setConvertedImageUrl(dataUrl);
      setIsConvertingImage(false);
    };
    img.onerror = () => {
      setIsConvertingImage(false);
      alert('Error cargando la imagen para procesar en el Canvas.');
    };
  };

  const handleDownloadConvertedImage = () => {
    if (!convertedImageUrl) return;
    const a = document.createElement('a');
    a.href = convertedImageUrl;
    a.download = `convertido_yc_${Date.now()}.${targetImageFormat === 'jpeg' ? 'jpg' : targetImageFormat}`;
    a.click();
  };

  // --- Local Data Conversion (CSV, JSON, Markdown) ---
  const convertCsvToJson = (csv: string): any[] => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        const val = values[i] ?? '';
        obj[h] = isNaN(Number(val)) || val === '' ? val : Number(val);
      });
      return obj;
    });
  };

  const convertJsonToCsv = (jsonStr: string): string => {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) return '';
    const headers = Object.keys(parsed[0]);
    const csvRows = [headers.join(',')];
    parsed.forEach(item => {
      const row = headers.map(h => item[h] !== undefined ? String(item[h]).replace(/,/g, ' ') : '');
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  };

  const convertJsonToMarkdown = (jsonStr: string): string => {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) return '# Documento\nSin datos tabulares';
    const headers = Object.keys(parsed[0]);
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = parsed.map(item => `| ${headers.map(h => String(item[h] ?? '')).join(' | ')} |`);
    return `${headerRow}\n${separatorRow}\n${dataRows.join('\n')}`;
  };

  const convertCsvToMarkdown = (csv: string): string => {
    const lines = csv.trim().split('\n');
    if (lines.length === 0) return '';
    const headers = lines[0].split(',').map(h => h.trim());
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = lines.slice(1).map(l => {
      const cells = l.split(',').map(c => c.trim());
      return `| ${cells.join(' | ')} |`;
    });
    return `${headerRow}\n${separatorRow}\n${dataRows.join('\n')}`;
  };

  const convertMarkdownToCsv = (md: string): string => {
    const lines = md.trim().split('\n').filter(l => l.includes('|'));
    if (lines.length < 2) return '';
    const parseRow = (line: string) => line.split('|').slice(1, -1).map(c => c.trim());
    const headers = parseRow(lines[0]);
    // Skip line 1 (the --- | --- line)
    const data = lines.slice(2).map(l => parseRow(l).join(','));
    return [headers.join(','), ...data].join('\n');
  };

  const handleExecuteDataConversion = () => {
    try {
      let result = '';
      if (inputDataType === 'csv' && targetDataType === 'json') {
        const json = convertCsvToJson(dataInputContent);
        result = JSON.stringify(json, null, 2);
      } else if (inputDataType === 'csv' && targetDataType === 'markdown') {
        result = convertCsvToMarkdown(dataInputContent);
      } else if (inputDataType === 'json' && targetDataType === 'csv') {
        result = convertJsonToCsv(dataInputContent);
      } else if (inputDataType === 'json' && targetDataType === 'markdown') {
        result = convertJsonToMarkdown(dataInputContent);
      } else if (inputDataType === 'markdown' && targetDataType === 'csv') {
        result = convertMarkdownToCsv(dataInputContent);
      } else if (inputDataType === 'markdown' && targetDataType === 'json') {
        const csv = convertMarkdownToCsv(dataInputContent);
        const json = convertCsvToJson(csv);
        result = JSON.stringify(json, null, 2);
      } else {
        result = dataInputContent;
      }
      setDataOutputContent(result);
    } catch (err: any) {
      setDataOutputContent(`Error de conversión de formato:\n${err.message}`);
    }
  };

  const handleCopyResult = () => {
    if (!dataOutputContent) return;
    navigator.clipboard.writeText(dataOutputContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadResult = () => {
    if (!dataOutputContent) return;
    const ext = targetDataType === 'json' ? 'json' : targetDataType === 'markdown' ? 'md' : 'csv';
    const mime = targetDataType === 'json' ? 'application/json' : targetDataType === 'markdown' ? 'text/markdown' : 'text/csv';
    downloadTextAsFile(dataOutputContent, `datos_convertidos_${Date.now()}.${ext}`, mime);
  };

  return (
    <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl p-6 shadow-xl flex flex-col">
      {/* Module Title */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-obsidian-800 mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Conversor Universal de Formatos Local
              <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono">100% OFFLINE</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Canvas Transcoder (PNG, JPG, WebP) & Transformador de Estructuras (CSV, JSON, Markdown)
            </p>
          </div>
        </div>

        {/* Category Switch */}
        <div className="flex items-center bg-obsidian-850 p-1 rounded-xl border border-obsidian-750">
          <button
            onClick={() => setActiveCategory('images')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === 'images' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" /> Imágenes
          </button>
          <button
            onClick={() => setActiveCategory('data')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeCategory === 'data' ? 'bg-gold-500 text-obsidian-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 inline mr-1.5" /> Datos & Estructuras
          </button>
        </div>
      </div>

      {/* --- Image Converter Section --- */}
      {activeCategory === 'images' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Seleccionar Imagen del Espacio:</label>
              <select
                value={selectedImageFileId}
                onChange={(e) => setSelectedImageFileId(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
              >
                <option value="">-- Imagen de Muestra del Sistema --</option>
                {imageFiles.map(img => (
                  <option key={img.id} value={img.id}>{img.name} ({img.extension.toUpperCase()})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Formato Destino:</label>
                <select
                  value={targetImageFormat}
                  onChange={(e) => setTargetImageFormat(e.target.value as any)}
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
                >
                  <option value="png">PNG (Sin pérdida)</option>
                  <option value="jpeg">JPG / JPEG (Fotográfico)</option>
                  <option value="webp">WebP (Alta compresión)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  Calidad: <span className="text-gold-400 font-bold">{Math.round(imageQuality * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                  className="w-full h-2 bg-obsidian-750 rounded accent-gold-400 mt-2"
                />
              </div>
            </div>

            <button
              onClick={handleConvertImage}
              disabled={isConvertingImage}
              className="w-full py-2.5 bg-gold-500 text-obsidian-950 hover:bg-gold-400 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition"
            >
              <RefreshCw className={`w-4 h-4 ${isConvertingImage ? 'animate-spin' : ''}`} />
              {isConvertingImage ? 'Procesando en Canvas...' : 'Convertir Formato Local'}
            </button>

            <div className="p-3 bg-obsidian-850 rounded-xl border border-obsidian-750 text-[11px] text-slate-400 font-mono">
              Procesamiento directo en la GPU/Canvas de su navegador. Cero peticiones de red o carga en servidores externos.
            </div>
          </div>

          {/* Image Preview Box */}
          <div className="bg-obsidian-950 border border-obsidian-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[260px]">
            {convertedImageUrl ? (
              <div className="text-center w-full">
                <img
                  src={convertedImageUrl}
                  alt="Resultado de conversión"
                  className="max-h-48 max-w-full mx-auto rounded-lg shadow-lg border border-gold-500/20 object-contain mb-3"
                />
                <button
                  onClick={handleDownloadConvertedImage}
                  className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 rounded-xl text-xs font-mono font-bold flex items-center gap-2 mx-auto transition"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar {targetImageFormat.toUpperCase()}
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs font-mono">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                Seleccione imagen y presione "Convertir Formato Local"
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Data & Structure Converter Section --- */}
      {activeCategory === 'data' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-obsidian-850/80 p-3 rounded-xl border border-obsidian-750">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Origen:</span>
              <select
                value={inputDataType}
                onChange={(e) => setInputDataType(e.target.value as any)}
                className="bg-obsidian-950 border border-obsidian-750 rounded-lg px-2.5 py-1 text-xs font-mono text-gold-300"
              >
                <option value="csv">CSV (Valores Separados)</option>
                <option value="json">JSON (Objetos Estructurados)</option>
                <option value="markdown">Markdown (Tablas MD)</option>
              </select>
            </div>

            <ArrowRightLeft className="w-4 h-4 text-gold-400 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Destino:</span>
              <select
                value={targetDataType}
                onChange={(e) => setTargetDataType(e.target.value as any)}
                className="bg-obsidian-950 border border-obsidian-750 rounded-lg px-2.5 py-1 text-xs font-mono text-gold-300"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>

            <button
              onClick={handleExecuteDataConversion}
              className="px-4 py-1.5 bg-gold-500 text-obsidian-950 font-bold rounded-lg text-xs hover:bg-gold-400 transition"
            >
              Transformar Estructura
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Entrada ({inputDataType.toUpperCase()}):</label>
              <textarea
                value={dataInputContent}
                onChange={(e) => setDataInputContent(e.target.value)}
                rows={9}
                className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-gold-500 resize-none leading-5"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-gold-400">Resultado ({targetDataType.toUpperCase()}):</label>
                {dataOutputContent && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyResult}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copySuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copySuccess ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                      onClick={handleDownloadResult}
                      className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Descargar
                    </button>
                  </div>
                )}
              </div>
              <textarea
                readOnly
                value={dataOutputContent}
                placeholder="Presione 'Transformar Estructura' para ver la salida..."
                rows={9}
                className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none resize-none leading-5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
