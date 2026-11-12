import React, { useState } from 'react';
import { WorkstationFile } from '../types';
import { Code, Save, Play, Copy, Check, Sparkles, RefreshCw, FileCode } from 'lucide-react';
import { downloadTextAsFile } from '../services/fileService';

interface CodeEditorProps {
  file: WorkstationFile;
  onSaveContent: (newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ file, onSaveContent }) => {
  const [content, setContent] = useState<string>(file.content || '');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const lines = content.split('\n');
  const isHtml = file.extension === 'html';
  const isMarkdown = file.extension === 'md';
  const isJs = file.extension === 'js' || file.extension === 'ts';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveContent(content);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRunJs = () => {
    if (!isJs) return;
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ')),
        error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' '))
      };
      const runFn = new Function('console', content);
      runFn(customConsole);
      setExecutionOutput(logs.length > 0 ? logs.join('\n') : 'Ejecución exitosa sin salida en consola.');
    } catch (err: any) {
      setExecutionOutput(`Error de sintaxis o tiempo de ejecución:\n${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 overflow-hidden font-sans">
      {/* Code Editor Header Bar */}
      <div className="flex items-center justify-between p-3.5 bg-obsidian-900 border-b border-obsidian-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {file.name}
              <span className="text-[10px] px-2 py-0.5 rounded bg-obsidian-800 text-gold-300 font-mono uppercase border border-obsidian-700">
                {file.extension}
              </span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {lines.length} líneas • {content.length} caracteres • Autoguardado Activo
            </span>
          </div>
        </div>

        {/* View mode toggle for HTML / Markdown */}
        {(isHtml || isMarkdown) && (
          <div className="flex items-center bg-obsidian-850 p-1 rounded-lg border border-obsidian-750">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activeTab === 'editor' ? 'bg-gold-500 text-obsidian-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Código
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                activeTab === 'preview' ? 'bg-gold-500 text-obsidian-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vista Previa
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {isJs && (
            <button
              onClick={handleRunJs}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg flex items-center gap-1.5 transition"
              title="Ejecutar script en entorno aislado local"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Ejecutar
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-white bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 rounded-lg transition"
            title="Copiar código"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 text-xs font-bold bg-gold-500 text-obsidian-950 hover:bg-gold-400 rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.25)] transition"
          >
            <Save className="w-4 h-4" /> {savedSuccess ? 'Guardado!' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'editor' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers gutter */}
            <div className="w-12 bg-obsidian-900/60 border-r border-obsidian-800 text-right pr-2 pt-4 select-none font-mono text-xs text-slate-600 leading-6">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-obsidian-950 p-4 font-mono text-xs text-slate-200 leading-6 resize-none focus:outline-none focus:ring-0 border-none selection:bg-gold-500/30"
              placeholder="// Escriba su código o texto aquí..."
            />
          </div>
        ) : (
          /* Live Preview Mode for HTML or Markdown */
          <div className="flex-1 bg-obsidian-900 p-8 overflow-y-auto">
            {isHtml ? (
              <iframe
                title="Preview"
                sandbox="allow-scripts"
                srcDoc={content}
                className="w-full h-full bg-white rounded-xl border border-obsidian-700 shadow-2xl"
              />
            ) : (
              <div className="max-w-3xl mx-auto bg-obsidian-950 border border-obsidian-800 rounded-2xl p-8 font-sans leading-relaxed text-slate-200 shadow-xl prose prose-invert">
                <div className="whitespace-pre-line">{content}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* JavaScript Output Console Console */}
      {executionOutput !== null && (
        <div className="border-t border-obsidian-800 bg-obsidian-900 p-4 max-h-48 overflow-y-auto font-mono text-xs">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span className="text-gold-400 font-bold uppercase tracking-wider">Consola de Salida Local</span>
            <button
              onClick={() => setExecutionOutput(null)}
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>
          <pre className="text-slate-200 bg-obsidian-950 p-3 rounded-lg border border-obsidian-800 whitespace-pre-wrap">
            {executionOutput}
          </pre>
        </div>
      )}
    </div>
  );
};