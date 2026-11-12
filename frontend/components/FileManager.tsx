import React, { useState, useRef } from 'react';
import { WorkstationFile, ModuleCategory, FileTypeCategory } from '../types';
import { 
  FolderPlus, Upload, Search, Star, Trash2, Edit3, Grid, List, 
  FileText, Music, Video, Image, Box, FileArchive, Table, Code, Eye, 
  ExternalLink, HardDrive, Info
} from 'lucide-react';
import { formatFileSize, sanitizeFileName, detectFileType } from '../services/fileService';

interface FileManagerProps {
  files: WorkstationFile[];
  onOpenFile: (file: WorkstationFile) => void;
  onCreateNewFile: (name: string, category: FileTypeCategory, content?: string) => void;
  onDeleteFile: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUploadLocalFile: (file: File) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  onOpenFile,
  onCreateNewFile,
  onDeleteFile,
  onToggleFavorite,
  onUploadLocalFile
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFileType, setNewFileType] = useState<FileTypeCategory>('code');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getIconForType = (type: FileTypeCategory) => {
    switch (type) {
      case 'audio': return <Music className="w-5 h-5 text-amber-400" />;
      case 'video': return <Video className="w-5 h-5 text-rose-400" />;
      case 'image': return <Image className="w-5 h-5 text-emerald-400" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'spreadsheet': return <Table className="w-5 h-5 text-emerald-400" />;
      case 'model3d': return <Box className="w-5 h-5 text-purple-400" />;
      case 'archive': return <FileArchive className="w-5 h-5 text-yellow-400" />;
      case 'code':
      default: return <Code className="w-5 h-5 text-gold-400" />;
    }
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.extension.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'favorite') return f.favorite;
    return f.type === selectedFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanName = sanitizeFileName(newFileName);
    onCreateNewFile(cleanName, newFileType);
    setNewFileName('');
    setShowCreateModal(false);
  };

  const handleNativeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadLocalFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 text-slate-100 overflow-hidden">
      {/* Top Action Bar */}
      <div className="p-4 bg-obsidian-900 border-b border-obsidian-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, extensión o ruta universal..."
            className="w-full bg-obsidian-950 border border-obsidian-750 pl-9 pr-4 py-2 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 transition"
          />
        </div>

        {/* View mode & Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Hidden File Upload Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleNativeUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-semibold bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 hover:text-white border border-obsidian-750 rounded-xl flex items-center gap-2 transition"
            title="Importar archivo desde su disco local"
          >
            <Upload className="w-4 h-4 text-gold-400" /> Importar Archivo
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 hover:bg-gold-400 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] transition"
          >
            <FolderPlus className="w-4 h-4" /> Crear Archivo
          </button>

          <div className="h-6 w-px bg-obsidian-800 mx-1" />

          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg border transition ${
              viewMode === 'grid' ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' : 'bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg border transition ${
              viewMode === 'list' ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' : 'bg-obsidian-850 text-slate-400 border-obsidian-750 hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Categories Pill Bar */}
      <div className="px-4 py-2.5 bg-obsidian-900/60 border-b border-obsidian-800/80 flex items-center space-x-2 overflow-x-auto text-xs font-mono">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'favorite', label: 'Favoritos' },
          { id: 'document', label: 'Documentos' },
          { id: 'spreadsheet', label: 'Hojas de Cálculo' },
          { id: 'code', label: 'Código & Texto' },
          { id: 'audio', label: 'Audio' },
          { id: 'video', label: 'Video' },
          { id: 'image', label: 'Imágenes' },
          { id: 'model3d', label: 'Modelos 3D' },
          { id: 'archive', label: 'Comprimidos' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id)}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              selectedFilter === cat.id
                ? 'bg-gold-500 text-obsidian-950 font-bold shadow-sm'
                : 'bg-obsidian-850/60 text-slate-400 hover:text-white border border-obsidian-750/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Files Display */}
      <div className="flex-1 p-6 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <Info className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">No se encontraron archivos</p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Importe un archivo o cree uno nuevo para comenzar a trabajar.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onOpenFile(file)}
                className="group relative bg-obsidian-900/80 hover:bg-obsidian-850 border border-obsidian-800 hover:border-gold-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-obsidian-800 group-hover:bg-gold-500/10 border border-obsidian-700 group-hover:border-gold-500/30 transition">
                    {getIconForType(file.type)}
                  </div>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFavorite(file.id)}
                      className={`p-1.5 rounded-lg hover:bg-obsidian-750 transition ${
                        file.favorite ? 'text-gold-400' : 'text-slate-500 hover:text-white'
                      }`}
                      title="Marcar favorito"
                    >
                      <Star className={`w-4 h-4 ${file.favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-obsidian-750 transition"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-bold text-white group-hover:text-gold-300 truncate transition leading-tight">
                    {file.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">{file.path}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-obsidian-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="uppercase text-gold-400 font-semibold">{file.extension}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-obsidian-850 text-slate-400 border-b border-obsidian-750 font-mono">
                  <th className="p-3.5">Nombre</th>
                  <th className="p-3.5">Ruta</th>
                  <th className="p-3.5">Tipo</th>
                  <th className="p-3.5">Tamaño</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800 font-mono">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => onOpenFile(file)}
                    className="hover:bg-obsidian-850/60 cursor-pointer transition"
                  >
                    <td className="p-3.5 flex items-center space-x-3">
                      {getIconForType(file.type)}
                      <span className="font-sans font-bold text-white hover:text-gold-300">{file.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">{file.path}</td>
                    <td className="p-3.5 text-gold-400 uppercase">{file.extension}</td>
                    <td className="p-3.5 text-slate-400">{formatFileSize(file.size)}</td>
                    <td className="p-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleFavorite(file.id)}
                        className={`p-1.5 rounded hover:bg-obsidian-750 ${
                          file.favorite ? 'text-gold-400' : 'text-slate-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${file.favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        className="p-1.5 rounded hover:bg-obsidian-750 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Crear Nuevo Archivo</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              YC Universal Workstation asignará el motor correspondiente según el tipo seleccionado.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Nombre del Archivo:</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="ej. notas_proyecto.md"
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Categoría & Motor:</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as FileTypeCategory)}
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
                >
                  <option value="code">Código / Texto Plano (.js, .ts, .md, .txt)</option>
                  <option value="document">Documento / PDF (.pdf, .docx, .odt)</option>
                  <option value="spreadsheet">Hoja de Cálculo (.csv, .xlsx)</option>
                  <option value="model3d">Modelo 3D Tridimensional (.stl, .obj)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-obsidian-850 hover:bg-obsidian-800 text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gold-500 text-obsidian-950 hover:bg-gold-400 transition"
                >
                  Crear en Memoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};