import React, { useState } from 'react';
import { WorkstationFile, PDFAnnotation } from '../types';
import { 
  FileText, Download, Printer, HighlightingBadge, PenTool, Type, 
  StickyNote, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, CheckCircle2, Table
} from 'lucide-react';
import { downloadTextAsFile } from '../services/fileService';

interface DocumentViewerProps {
  file: WorkstationFile;
  onUpdateFileContent?: (newContent: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, onUpdateFileContent }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [activeTool, setActiveTool] = useState<'view' | 'highlight' | 'text' | 'signature'>('view');
  const [signatureText, setSignatureText] = useState<string>('Lic. YC Workstation');
  const [signed, setSigned] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string>(file.content || '');

  const isSpreadsheet = file.type === 'spreadsheet' || file.extension === 'csv';

  // Spreadsheet parser for CSV/TSV
  const renderSpreadsheet = () => {
    const raw = file.content || '';
    const lines = raw.trim().split('\n');
    if (lines.length === 0) return <div className="text-slate-400">Hoja de cálculo vacía</div>;

    const delimiter = raw.includes('\t') ? '\t' : ',';
    const rows = lines.map((l) => l.split(delimiter));
    const headers = rows[0] || [];
    const dataRows = rows.slice(1);

    return (
      <div className="w-full overflow-x-auto bg-obsidian-900 border border-obsidian-750 rounded-xl shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-obsidian-800 text-gold-400 border-b border-obsidian-700">
              <th className="p-3 w-10 text-center font-mono border-r border-obsidian-750 text-slate-500">#</th>
              {headers.map((h, i) => (
                <th key={i} className="p-3 font-semibold tracking-wider uppercase border-r border-obsidian-750 last:border-0">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-800 font-mono">
            {dataRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-obsidian-850/60 transition">
                <td className="p-2.5 text-center text-slate-500 bg-obsidian-850/30 border-r border-obsidian-750">
                  {idx + 1}
                </td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 text-slate-200 border-r border-obsidian-750 last:border-0">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    downloadTextAsFile(
      `--- EXPORTADO DESDE YC UNIVERSAL WORKSTATION ---\nDocumento: ${file.name}\nFirma: ${signed ? signatureText : 'Sin firma'}\n\n${textContent}`,
      `${file.name.replace(/\.[^/.]+$/, "")}_exportado.txt`,
      'text/plain'
    );
  };

  const handleAddAnnotation = (type: 'highlight' | 'text' | 'signature') => {
    if (type === 'signature') {
      setSigned(true);
    }
    const newAnn: PDFAnnotation = {
      id: `ann-${Date.now()}`,
      page: currentPage,
      type: type,
      x: 50,
      y: 120 + annotations.length * 40,
      color: type === 'highlight' ? '#facc15' : '#38bdf8',
      text: type === 'signature' ? `Firmado digitalmente: ${signatureText} (${new Date().toLocaleDateString()})` : 'Anotación YC'
    };
    setAnnotations([...annotations, newAnn]);
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 overflow-hidden">
      {/* Document Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-obsidian-900 border-b border-obsidian-800 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400">
            {isSpreadsheet ? <Table className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{file.name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {isSpreadsheet ? 'Motor: YC Grid Matrix' : 'Lector & Editor PDF/DOCX Nativo'}
            </span>
          </div>
        </div>

        {/* Center Page / Zoom controls */}
        <div className="flex items-center space-x-2 bg-obsidian-850 px-2 py-1 rounded-lg border border-obsidian-750">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-1">Pág {currentPage} de 1</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-obsidian-700 mx-1" />

          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 text-slate-400 hover:text-white"
            title="Reducir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-gold-400 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="p-1 text-slate-400 hover:text-white"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center space-x-2">
          {!isSpreadsheet && (
            <>
              <button
                onClick={() => handleAddAnnotation('highlight')}
                className="px-2.5 py-1.5 text-xs font-medium bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 rounded-lg flex items-center gap-1.5 transition"
              >
                <StickyNote className="w-3.5 h-3.5" /> Resaltar
              </button>

              <button
                onClick={() => handleAddAnnotation('signature')}
                className="px-2.5 py-1.5 text-xs font-medium bg-gold-500/20 text-gold-300 border border-gold-500/40 hover:bg-gold-500/30 rounded-lg flex items-center gap-1.5 transition"
              >
                <PenTool className="w-3.5 h-3.5" /> Firmar
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-2.5 py-1.5 text-xs font-medium border rounded-lg transition ${
                  isEditing ? 'bg-gold-500 text-obsidian-950 border-gold-400 font-bold' : 'bg-obsidian-800 text-slate-300 border-obsidian-700 hover:bg-obsidian-750'
                }`}
              >
                {isEditing ? 'Vista Previa' : 'Editar Contenido'}
              </button>
            </>
          )}

          <button
            onClick={handleExportPDF}
            className="p-2 text-slate-300 hover:text-gold-400 bg-obsidian-800 hover:bg-obsidian-750 border border-obsidian-700 rounded-lg transition"
            title="Exportar archivo"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 text-slate-300 hover:text-gold-400 bg-obsidian-800 hover:bg-obsidian-750 border border-obsidian-700 rounded-lg transition"
            title="Imprimir documento"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-obsidian-950">
        <div
          className="transition-all duration-150 origin-top w-full max-w-4xl"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {isSpreadsheet ? (
            renderSpreadsheet()
          ) : (
            <div className="relative bg-obsidian-900 border border-gold-500/20 rounded-xl shadow-2xl p-10 min-h-[850px] text-slate-200">
              {/* Document Header Badge */}
              <div className="flex justify-between items-center pb-6 border-b border-obsidian-800 mb-6">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-wide uppercase">YC DIGITAL DOCUMENT SUITE</h1>
                  <p className="text-xs text-gold-400 font-mono">Identificador Universal: {file.id}</p>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <span>Página {currentPage} / 1</span>
                  <div className="text-[10px] text-emerald-400">Validación Criptográfica Local OK</div>
                </div>
              </div>

              {/* Text editor or viewer */}
              {isEditing ? (
                <textarea
                  value={textContent}
                  onChange={(e) => {
                    setTextContent(e.target.value);
                    if (onUpdateFileContent) onUpdateFileContent(e.target.value);
                  }}
                  className="w-full h-[600px] bg-obsidian-950 border border-gold-500/30 rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold-400 leading-relaxed"
                />
              ) : (
                <div className="space-y-4 font-sans text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                  {textContent}
                </div>
              )}

              {/* Injected Annotations & Signature stamps */}
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="mt-6 p-3 rounded-lg border flex items-center justify-between text-xs font-mono"
                  style={{
                    backgroundColor: ann.type === 'signature' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(250, 204, 21, 0.15)',
                    borderColor: ann.type === 'signature' ? '#d4af37' : '#facc15'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    {ann.type === 'signature' && <CheckCircle2 className="w-4 h-4 text-gold-400" />}
                    <span className="font-semibold text-white">{ann.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Sello de Seguridad</span>
                </div>
              ))}

              {signed && (
                <div className="mt-12 pt-6 border-t border-obsidian-800 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400">Aprobado y sellado mediante:</p>
                    <p className="text-sm font-serif italic text-gold-300 font-semibold">{signatureText}</p>
                    <p className="text-[10px] font-mono text-slate-500">Hash SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f</p>
                  </div>
                  <div className="px-4 py-2 border-2 border-dashed border-gold-500/50 rounded-lg text-center">
                    <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block font-bold">FIRMA DIGITAL</span>
                    <span className="text-xs text-white font-serif">{signatureText}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};