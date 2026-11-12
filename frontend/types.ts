export type ModuleCategory = 
  | 'files'
  | 'media'
  | 'documents'
  | 'code'
  | 'images'
  | '3d'
  | 'archive'
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

export interface AudioTrack {
  id: string;
  name: string;
  artist?: string;
  url: string;
  duration?: number;
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