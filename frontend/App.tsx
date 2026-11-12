import React, { useState, useEffect } from 'react';
import { 
  WorkstationFile, TabItem, ModuleCategory, FileTypeCategory 
} from './types';
import { 
  COMPATIBILITY_MATRIX, INITIAL_FILES 
} from './constants';
import { 
  getStoredFiles, saveStoredFiles, detectFileType, downloadTextAsFile 
} from './services/fileService';
import { FileManager } from './components/FileManager';
import { MediaPlayer } from './components/MediaPlayer';
import { DocumentViewer } from './components/DocumentViewer';
import { CodeEditor } from './components/CodeEditor';
import { ImageViewer } from './components/ImageViewer';
import { ThreeViewer } from './components/ThreeViewer';
import { ArchiveViewer } from './components/ArchiveViewer';
import { UtilityTools } from './components/UtilityTools';

import { 
  FolderGit2, Disc, FileText, Code2, Image as ImgIcon, Box, 
  Archive, Wrench, X, Shield, Plus, Download, Radio, Laptop, CheckCircle
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<WorkstationFile[]>([]);
  const [activeModule, setActiveModule] = useState<ModuleCategory>('files');
  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<boolean>(true);

  // Initialize stored files
  useEffect(() => {
    const loaded = getStoredFiles();
    setFiles(loaded);
    // Open initial README tab for immediate exploration
    const readme = loaded.find((f) => f.name.includes('BIENVENIDO'));
    if (readme) {
      setOpenTabs([
        {
          id: `tab-${readme.id}`,
          fileId: readme.id,
          title: readme.name,
          category: readme.type,
          extension: readme.extension
        }
      ]);
      setActiveTabId(`tab-${readme.id}`);
    }
  }, []);

  const handleOpenFile = (file: WorkstationFile) => {
    // Check if tab already exists
    const existing = openTabs.find((t) => t.fileId === file.id);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTab: TabItem = {
        id: `tab-${file.id}-${Date.now()}`,
        fileId: file.id,
        title: file.name,
        category: file.type,
        extension: file.extension
      };
      setOpenTabs([...openTabs, newTab]);
      setActiveTabId(newTab.id);
    }

    // Switch view module to match file type
    if (file.type === 'audio' || file.type === 'video') setActiveModule('media');
    else if (file.type === 'document' || file.type === 'spreadsheet') setActiveModule('documents');
    else if (file.type === 'code') setActiveModule('code');
    else if (file.type === 'image') setActiveModule('images');
    else if (file.type === 'model3d') setActiveModule('3d');
    else if (file.type === 'archive') setActiveModule('archive');
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const updated = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(updated);
    if (activeTabId === tabId) {
      setActiveTabId(updated.length > 0 ? updated[updated.length - 1].id : null);
    }
  };

  const handleCreateNewFile = (name: string, category: FileTypeCategory, customContent?: string) => {
    const { extension } = detectFileType(name);
    const newFile: WorkstationFile = {
      id: `f-${Date.now()}`,
      name: name,
      path: `/${name}`,
      size: customContent ? customContent.length : 120,
      type: category,
      extension: extension || 'txt',
      mimeType: 'text/plain',
      lastModified: Date.now(),
      content: customContent || (category === 'code' ? '// Nuevo archivo YC Workstation\n' : 'Documento en blanco creado.')
    };

    const nextFiles = [newFile, ...files];
    setFiles(nextFiles);
    saveStoredFiles(nextFiles);
    handleOpenFile(newFile);
  };

  const handleDeleteFile = (id: string) => {
    const nextFiles = files.filter((f) => f.id !== id);
    setFiles(nextFiles);
    saveStoredFiles(nextFiles);
    // Close tab if open
    setOpenTabs(openTabs.filter((t) => t.fileId !== id));
  };

  const handleToggleFavorite = (id: string) => {
    const nextFiles = files.map((f) => (f.id === id ? { ...f, favorite: !f.favorite } : f));
    setFiles(nextFiles);
    saveStoredFiles(nextFiles);
  };

  const handleUploadLocalFile = async (rawFile: File) => {
    const { category, extension } = detectFileType(rawFile.name, rawFile.type);

    let content = '';
    if (category === 'code' || category === 'document' || category === 'spreadsheet' || extension === 'svg') {
      content = await rawFile.text();
    } else {
      // Store Base64 for images or audio/media preview
      content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(rawFile);
      });
    }

    const newFile: WorkstationFile = {
      id: `f-uploaded-${Date.now()}`,
      name: rawFile.name,
      path: `/Importados/${rawFile.name}`,
      size: rawFile.size,
      type: category,
      extension: extension,
      mimeType: rawFile.type || 'application/octet-stream',
      lastModified: rawFile.lastModified || Date.now(),
      content: content
    };

    const nextFiles = [newFile, ...files];
    setFiles(nextFiles);
    saveStoredFiles(nextFiles);
    handleOpenFile(newFile);
  };

  const handleUpdateFileContent = (newContent: string) => {
    const activeTab = openTabs.find((t) => t.id === activeTabId);
    if (!activeTab) return;

    const nextFiles = files.map((f) => {
      if (f.id === activeTab.fileId) {
        return {
          ...f,
          content: newContent,
          size: newContent.length,
          lastModified: Date.now()
        };
      }
      return f;
    });

    setFiles(nextFiles);
    saveStoredFiles(nextFiles);
  };

  // Resolve current active file for main workspace
  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const activeFile = activeTab ? files.find((f) => f.id === activeTab.fileId) : null;

  return (
    <div className="flex h-screen w-screen bg-obsidian-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Global Left Navigation Sidebar */}
      <aside className="w-16 md:w-64 bg-obsidian-900 border-r border-obsidian-800 flex flex-col justify-between shrink-0 select-none z-20">
        <div>
          {/* Brand Header */}
          <div className="h-14 flex items-center px-4 border-b border-obsidian-800 bg-obsidian-950/40">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.35)] shrink-0">
              <span className="font-bold text-obsidian-950 text-sm tracking-tighter">YC</span>
            </div>
            <div className="ml-3 hidden md:block">
              <h1 className="text-xs font-bold text-white tracking-widest uppercase">WORKSTATION</h1>
              <p className="text-[10px] text-gold-400 font-mono tracking-tight">UNIVERSAL SYSTEM</p>
            </div>
          </div>

          {/* Module Nav Links */}
          <nav className="p-2 space-y-1 mt-2">
            {[
              { id: 'files', label: 'Explorador', icon: <FolderGit2 className="w-4 h-4" /> },
              { id: 'media', label: 'Multimedia & Audio', icon: <Disc className="w-4 h-4" /> },
              { id: 'documents', label: 'Documentos & PDF', icon: <FileText className="w-4 h-4" /> },
              { id: 'code', label: 'Editor de Código', icon: <Code2 className="w-4 h-4" /> },
              { id: 'images', label: 'Visor de Imágenes', icon: <ImgIcon className="w-4 h-4" /> },
              { id: '3d', label: 'Modelado 3D', icon: <Box className="w-4 h-4" /> },
              { id: 'archive', label: 'Compresión & ZIP', icon: <Archive className="w-4 h-4" /> },
              { id: 'tools', label: 'Matriz & Herramientas', icon: <Wrench className="w-4 h-4" /> }
            ].map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id as ModuleCategory)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-300 border border-gold-500/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                      : 'text-slate-400 hover:text-white hover:bg-obsidian-850'
                  }`}
                  title={item.label}
                >
                  <span className={`${isActive ? 'text-gold-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="ml-3 hidden md:block">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Offline & System Status Footer */}
        <div className="p-3 border-t border-obsidian-800 bg-obsidian-950/60 hidden md:block text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              100% Offline
            </span>
            <span className="text-gold-400">PWA Lista</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {files.length} archivos en almacenamiento local
          </div>
        </div>
      </aside>

      {/* 2. Main Central Workstation Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-obsidian-950">
        {/* Top Header Tabs Bar */}
        <header className="h-12 bg-obsidian-900 border-b border-obsidian-800 flex items-center justify-between px-3 shrink-0">
          {/* Scrollable Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar flex-1 max-w-4xl py-1">
            {openTabs.map((tab) => {
              const isCurrent = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    // Match module to tab category
                    if (tab.category === 'audio' || tab.category === 'video') setActiveModule('media');
                    else if (tab.category === 'document' || tab.category === 'spreadsheet') setActiveModule('documents');
                    else if (tab.category === 'code') setActiveModule('code');
                    else if (tab.category === 'image') setActiveModule('images');
                    else if (tab.category === 'model3d') setActiveModule('3d');
                    else if (tab.category === 'archive') setActiveModule('archive');
                  }}
                  className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all border shrink-0 ${
                    isCurrent
                      ? 'bg-obsidian-800 text-gold-300 border-gold-500/40 shadow-sm'
                      : 'bg-obsidian-900 text-slate-400 hover:text-white border-transparent hover:bg-obsidian-850'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{tab.title}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, tab.id)}
                    className="p-0.5 rounded hover:bg-obsidian-700 text-slate-500 hover:text-rose-400 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => setActiveModule('files')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-gold-300 hover:bg-obsidian-850 transition"
              title="Abrir nuevo archivo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick System Badge */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="hidden sm:inline-block text-slate-500">YC Station OS</span>
            <span className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20 text-[10px]">
              OBSIDIAN & GOLD
            </span>
          </div>
        </header>

        {/* Workspace Display Area Based on Module */}
        <section className="flex-1 flex overflow-hidden">
          {activeModule === 'files' && (
            <FileManager
              files={files}
              onOpenFile={handleOpenFile}
              onCreateNewFile={handleCreateNewFile}
              onDeleteFile={handleDeleteFile}
              onToggleFavorite={handleToggleFavorite}
              onUploadLocalFile={handleUploadLocalFile}
            />
          )}

          {activeModule === 'media' && (
            activeFile ? (
              <MediaPlayer file={activeFile} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Disc className="w-16 h-16 text-slate-700 mb-4 animate-spin-slow" />
                <h3 className="text-lg font-bold text-white">Reproductor Multimedia YC</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Abra una pista de audio (MP3, WAV, FLAC, OGG) o video (MP4, WebM) desde el explorador.
                </p>
                <button
                  onClick={() => setActiveModule('files')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl"
                >
                  Ir al Explorador
                </button>
              </div>
            )
          )}

          {activeModule === 'documents' && (
            activeFile ? (
              <DocumentViewer
                file={activeFile}
                onUpdateFileContent={handleUpdateFileContent}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <FileText className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-white">Lector & Editor Universal de Documentos</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Compatible con PDF, DOCX, CSV, RTF y libros digitales.
                </p>
                <button
                  onClick={() => setActiveModule('files')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl"
                >
                  Seleccionar Documento
                </button>
              </div>
            )
          )}

          {activeModule === 'code' && (
            activeFile ? (
              <CodeEditor
                file={activeFile}
                onSaveContent={handleUpdateFileContent}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Code2 className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-white">Editor de Código & Texto</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Soporte Markdown, JavaScript, HTML, CSS, JSON, YAML y LOG.
                </p>
                <button
                  onClick={() => setActiveModule('files')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl"
                >
                  Abrir Archivo de Código
                </button>
              </div>
            )
          )}

          {activeModule === 'images' && (
            activeFile ? (
              <ImageViewer file={activeFile} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <ImgIcon className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-white">Visor & Conversor de Imágenes</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Zoom suave, rotación, ajuste de brillo y soporte SVG nativo.
                </p>
                <button
                  onClick={() => setActiveModule('files')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl"
                >
                  Elegir Imagen
                </button>
              </div>
            )
          )}

          {activeModule === '3d' && (
            activeFile ? (
              <ThreeViewer file={activeFile} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Box className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-white">Visor Tridimensional Three.js</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Visualice archivos STL, OBJ y geometrías tridimensionales interactivas.
                </p>
                <button
                  onClick={() => setActiveModule('files')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl"
                >
                  Explorar Modelos 3D
                </button>
              </div>
            )
          )}

          {activeModule === 'archive' && (
            activeFile ? (
              <ArchiveViewer file={activeFile} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Archive className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-white">Compresión & Extracción Segura</h3>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Inspeccione contenedores ZIP y extraiga elementos sin salir de su navegador.
                </p>
                <button
                  onClick={() => setActiveModule('files')}
                  className="mt-4 px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 rounded-xl"
                >
                  Abrir Archivo Comprimido
                </button>
              </div>
            )
          )}

          {activeModule === 'tools' && (
            <UtilityTools />
          )}
        </section>
      </main>
    </div>
  );
}