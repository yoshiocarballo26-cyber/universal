import { WorkstationFile, ProjectItem, ClipboardItem } from '../types';
import { INITIAL_FILES } from '../constants';

const FILES_STORAGE_KEY = 'yc_universal_workstation_files_v2';
const PROJECTS_STORAGE_KEY = 'yc_workstation_projects_v1';
const CLIPBOARD_STORAGE_KEY = 'yc_workstation_clipboard_v1';

export const getStoredFiles = (): WorkstationFile[] => {
  try {
    const raw = localStorage.getItem(FILES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(INITIAL_FILES));
      return INITIAL_FILES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FILES;
  } catch (err) {
    console.error('Error loading files from localStorage', err);
    return INITIAL_FILES;
  }
};

export const saveStoredFiles = (files: WorkstationFile[]): void => {
  try {
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  } catch (err) {
    console.error('Error saving files to localStorage', err);
  }
};

export const getStoredProjects = (): ProjectItem[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      const initialProjects: ProjectItem[] = [
        {
          id: 'proj-alpha',
          title: 'Sistema Operativo YC Workstation',
          description: 'Desarrollo de módulos universales locales, visualizadores y pipelines offline.',
          color: '#d4af37',
          associatedFileIds: ['f-readme', 'f-code-demo'],
          quickNotes: 'Prioridades:\n- Mantener cero dependencias externas de pago.\n- Procesamiento de audio/video y render WebGL continuo.',
          createdAt: Date.now() - 86400000,
          tasks: [
            {
              id: 'task-1',
              title: 'Subtítulos SRT y VTT dinámicos',
              description: 'Integrar parser y sincronización de texto sobre video en milisegundos.',
              status: 'done',
              priority: 'high',
              fileIds: ['f-sample-audio'],
              createdAt: Date.now() - 36000000
            },
            {
              id: 'task-2',
              title: 'Conversor local de formatos',
              description: 'Pipeline de transcodificación de imágenes Canvas (PNG, JPG, WebP) y datos (CSV, JSON, Markdown).',
              status: 'done',
              priority: 'high',
              fileIds: ['f-csv-data'],
              createdAt: Date.now() - 25000000
            },
            {
              id: 'task-3',
              title: 'Portapapeles universal persistente',
              description: 'Historial seguro en memoria local con acceso rápido y copia con 1 clic.',
              status: 'in_progress',
              priority: 'medium',
              fileIds: ['f-readme'],
              createdAt: Date.now() - 12000000
            }
          ]
        }
      ];
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initialProjects));
      return initialProjects;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading projects', e);
    return [];
  }
};

export const saveStoredProjects = (projects: ProjectItem[]): void => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects', e);
  }
};

export const getStoredClipboard = (): ClipboardItem[] => {
  try {
    const raw = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (!raw) {
      const initialClipboard: ClipboardItem[] = [
        {
          id: 'clip-1',
          content: 'https://yc-universal-workstation.local/workspace',
          source: 'Navegación Sistema',
          type: 'text',
          timestamp: Date.now() - 3600000,
          favorite: true
        },
        {
          id: 'clip-2',
          content: '{\n  "status": "ONLINE",\n  "offlineStorage": "LocalStorage v2",\n  "cryptographicSeals": true\n}',
          source: 'quantum_engine.js',
          type: 'json',
          timestamp: Date.now() - 1800000,
          favorite: false
        }
      ];
      localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(initialClipboard));
      return initialClipboard;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading clipboard', e);
    return [];
  }
};

export const saveStoredClipboard = (items: ClipboardItem[]): void => {
  try {
    localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving clipboard', e);
  }
};

export const detectFileType = (fileName: string, mimeType?: string): { category: WorkstationFile['type']; extension: string } => {
  const parts = fileName.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus', 'aac'].includes(ext)) {
    return { category: 'audio', extension: ext };
  }
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) {
    return { category: 'video', extension: ext };
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif', 'tiff'].includes(ext)) {
    return { category: 'image', extension: ext };
  }
  if (['pdf'].includes(ext)) {
    return { category: 'document', extension: ext };
  }
  if (['docx', 'doc', 'odt', 'rtf', 'epub'].includes(ext)) {
    return { category: 'document', extension: ext };
  }
  if (['csv', 'tsv', 'xlsx', 'xls', 'ods'].includes(ext)) {
    return { category: 'spreadsheet', extension: ext };
  }
  if (['stl', 'obj', 'gltf', 'glb', 'ply'].includes(ext)) {
    return { category: 'model3d', extension: ext };
  }
  if (['zip', 'tar', 'gz', '7z', 'bz2', 'rar'].includes(ext)) {
    return { category: 'archive', extension: ext };
  }
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'xml', 'yaml', 'yml', 'md', 'txt', 'log', 'sh', 'py', 'sql', 'srt', 'vtt'].includes(ext)) {
    return { category: 'code', extension: ext };
  }

  // Fallback check on MIME
  if (mimeType?.startsWith('audio/')) return { category: 'audio', extension: ext || 'mp3' };
  if (mimeType?.startsWith('video/')) return { category: 'video', extension: ext || 'mp4' };
  if (mimeType?.startsWith('image/')) return { category: 'image', extension: ext || 'png' };

  return { category: 'unknown', extension: ext };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9._\- \(\)]/g, '_').trim();
};

export const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadTextAsFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlobAsFile(blob, filename);
};
