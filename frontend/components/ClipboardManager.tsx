import React, { useState } from 'react';
import { ClipboardItem } from '../types';
import { 
  ClipboardList, Copy, Check, Trash2, Star, Plus, FileCode, Type, ExternalLink 
} from 'lucide-react';
import { saveStoredClipboard } from '../services/fileService';

interface ClipboardManagerProps {
  items: ClipboardItem[];
  onUpdateItems: (items: ClipboardItem[]) => void;
}

export const ClipboardManager: React.FC<ClipboardManagerProps> = ({ items, onUpdateItems }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState<string>('');
  const [newSource, setNewSource] = useState<string>('Nota manual');
  const [newType, setNewType] = useState<ClipboardItem['type']>('text');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item);
    onUpdateItems(updated);
    saveStoredClipboard(updated);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    onUpdateItems(updated);
    saveStoredClipboard(updated);
  };

  const handleCreateSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newItem: ClipboardItem = {
      id: `clip-${Date.now()}`,
      content: newContent.trim(),
      source: newSource.trim() || 'Portapapeles YC',
      type: newType,
      timestamp: Date.now(),
      favorite: false
    };

    const updated = [newItem, ...items];
    onUpdateItems(updated);
    saveStoredClipboard(updated);
    setNewContent('');
    setShowAddModal(false);
  };

  const filteredItems = items.filter(item => 
    item.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.source.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-obsidian-800 mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Portapapeles Interno & Historial de Recortes
              <span className="text-xs px-2.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono">
                {items.length} Fragmentos
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Almacenamiento persistente local de textos, código y snippets con copia rápida en 1 clic
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Buscar en el portapapeles..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="bg-obsidian-900 border border-obsidian-750 px-3 py-2 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 hover:bg-gold-400 rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition"
          >
            <Plus className="w-4 h-4" /> Nuevo Recorte
          </button>
        </div>
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-600 font-mono text-xs">
            <ClipboardList className="w-12 h-12 mb-3 text-slate-700" />
            No hay recortes almacenados en el portapapeles.
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-obsidian-900 border border-obsidian-800 hover:border-gold-500/30 rounded-2xl p-4 transition shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-obsidian-800 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-obsidian-800 text-gold-400 border border-obsidian-750 uppercase text-[10px]">
                    {item.type}
                  </span>
                  <span className="text-slate-400 truncate max-w-[200px]">{item.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFavorite(item.id)}
                    className={`p-1 rounded hover:bg-obsidian-800 transition ${
                      item.favorite ? 'text-gold-400' : 'text-slate-500'
                    }`}
                    title="Favorito"
                  >
                    <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-obsidian-800 transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Snippet Content */}
              <pre className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-850 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-40 selection:bg-gold-500/30">
                {item.content}
              </pre>

              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{new Date(item.timestamp).toLocaleString()}</span>
                <button
                  onClick={() => handleCopy(item.id, item.content)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    copiedId === item.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gold-500/20 text-gold-300 border border-gold-500/30 hover:bg-gold-500/30'
                  }`}
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === item.id ? '¡Copiado!' : 'Copiar al Portapapeles'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Snippet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Añadir Recorte al Portapapeles</h3>
            <form onSubmit={handleCreateSnippet} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Origen / Etiqueta:</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="ej. API Endpoints, Token de Acceso"
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Tipo de Contenido:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                >
                  <option value="text">Texto Plano</option>
                  <option value="code">Código / Script</option>
                  <option value="json">Estructura JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Contenido:</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Pegue o escriba aquí el contenido del recorte..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-obsidian-850 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gold-500 text-obsidian-950 hover:bg-gold-400"
                >
                  Guardar Recorte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
