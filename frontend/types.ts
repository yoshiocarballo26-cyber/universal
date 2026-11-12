export type ModuleCategory = 
  | 'files'
  | 'media'
  | 'documents'
  | 'code'
  | 'images'
  | '3d'
  | 'archive'
  | 'projects'
  | 'clipboard'
  | 'tools';

export type FileTypeCategory =
  | 'audio'
  | 'video'
  | 'image'
  | 'document'
  | 'code'
  | 'archive'
  | 'model3d'
  | 'spreadsheet'
  | 'presentation'
  | 'unknown';

export interface WorkstationFile {
  id: string;
  name: string;
  path: string; // e.g. "/Proyectos/demo.js"
  size: number;
  type: FileTypeCategory;
  extension: string;
  mimeType: string;
  lastModified: number;
  content?: string; // Text content, base64 or DataURL
  blob?: Blob;
  isVirtualFolder?: boolean;
  metadata?: Record<string, any>;
  favorite?: boolean;
}

export interface CompatibilityMatrixItem {
  extension: string;
  name: string;
  category: FileTypeCategory;
  canOpen: boolean;
  canView: boolean;
  canPlay: boolean;
  canEdit: boolean;
  canExport: boolean;
  primaryModule: ModuleCategory;
  engine: string;
  status: 'completado' | 'nativo' | 'virtualizado' | 'próximamente';
}

export interface TabItem {
  id: string;
  fileId: string;
  title: string;
  category: FileTypeCategory;
  extension: string;
  isDirty?: boolean;
}

export interface SubtitleCue {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface PlaylistItem {
  id: string;
  fileId: string;
  title: string;
  type: 'audio' | 'video';
  duration?: number;
  extension: string;
}

export interface PDFAnnotation {
  id: string;
  page: number;
  type: 'highlight' | 'note' | 'signature' | 'text';
  x: number;
  y: number;
  color: string;
  text?: string;
  signatureData?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  tags: string[];
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  fileIds: string[]; // Linked workstation files
  createdAt: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  color: string;
  tasks: KanbanTask[];
  quickNotes: string;
  associatedFileIds: string[];
  createdAt: number;
}

export interface ClipboardItem {
  id: string;
  content: string;
  source: string;
  type: 'text' | 'code' | 'json' | 'image-data';
  timestamp: number;
  favorite?: boolean;
}
