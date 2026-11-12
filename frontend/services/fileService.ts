import { WorkstationFile, FileTypeCategory } from './types';
import { INITIAL_FILES } from './constants';

const STORAGE_KEY = 'yc_universal_workstation_files_v2';

export const getStoredFiles = (): WorkstationFile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FILES));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (err) {
    console.error('Error saving files to localStorage', err);
  }
};

export const detectFileType = (fileName: string, mimeType?: string): { category: FileTypeCategory; extension: string } => {
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
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'xml', 'yaml', 'yml', 'md', 'txt', 'log', 'sh', 'py', 'sql'].includes(ext)) {
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