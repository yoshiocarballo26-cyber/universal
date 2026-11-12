import { CompatibilityMatrixItem, WorkstationFile } from './types';

export const COMPATIBILITY_MATRIX: CompatibilityMatrixItem[] = [
  // Multimedia - Audio
  { extension: 'mp3', name: 'Audio MPEG-3', category: 'audio', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'HTML5 WebAudio API + Visualizer', status: 'nativo' },
  { extension: 'wav', name: 'Waveform Audio', category: 'audio', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'HTML5 WebAudio API', status: 'nativo' },
  { extension: 'ogg', name: 'Ogg Vorbis Audio', category: 'audio', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'HTML5 Audio Engine', status: 'nativo' },
  { extension: 'flac', name: 'Free Lossless Audio Codec', category: 'audio', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'Browser Native Codec', status: 'nativo' },
  { extension: 'm4a', name: 'MPEG-4 Audio', category: 'audio', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'HTML5 Audio', status: 'nativo' },
  { extension: 'opus', name: 'Opus Interactive Audio', category: 'audio', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'WebAudio Codec', status: 'nativo' },

  // Multimedia - Video
  { extension: 'mp4', name: 'MPEG-4 Video', category: 'video', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'HTML5 Video Engine', status: 'nativo' },
  { extension: 'webm', name: 'WebM Open Media', category: 'video', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'VP8/VP9 Native Decoder', status: 'nativo' },
  { extension: 'mov', name: 'QuickTime Movie', category: 'video', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'media', engine: 'Browser QuickTime / MP4', status: 'nativo' },
  { extension: 'mkv', name: 'Matroska Video Container', category: 'video', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: false, primaryModule: 'media', engine: 'HTML5 Container Support', status: 'nativo' },

  // Documentos & PDF
  { extension: 'pdf', name: 'Portable Document Format', category: 'document', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'documents', engine: 'YC PDF Suite & Annotator', status: 'completado' },
  { extension: 'docx', name: 'Microsoft Word OpenXML', category: 'document', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'documents', engine: 'Universal Document Parser', status: 'virtualizado' },
  { extension: 'doc', name: 'Documento Word Legado', category: 'document', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: false, primaryModule: 'documents', engine: 'Legacy Text Reader', status: 'virtualizado' },
  { extension: 'odt', name: 'OpenDocument Text', category: 'document', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'documents', engine: 'ODF Parser Engine', status: 'virtualizado' },
  { extension: 'rtf', name: 'Rich Text Format', category: 'document', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'documents', engine: 'RTF Tokenizer', status: 'nativo' },
  { extension: 'epub', name: 'Electronic Publication', category: 'document', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: true, primaryModule: 'documents', engine: 'EPUB / eBook Pagination', status: 'virtualizado' },
  { extension: 'csv', name: 'Comma Separated Values', category: 'spreadsheet', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'documents', engine: 'YC Grid Matrix & Parser', status: 'completado' },
  { extension: 'xlsx', name: 'Excel Workbook', category: 'spreadsheet', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'documents', engine: 'Structured Sheet Engine', status: 'completado' },

  // Código & Texto
  { extension: 'txt', name: 'Texto Plano', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'Monaco Core Buffer', status: 'completado' },
  { extension: 'md', name: 'Markdown Formatted', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'Markdown Live Renderer', status: 'completado' },
  { extension: 'js', name: 'JavaScript ECMAScript', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'JS Syntax Highlighter & Runner', status: 'completado' },
  { extension: 'ts', name: 'TypeScript Source', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'TS Syntax Lexer', status: 'completado' },
  { extension: 'html', name: 'HyperText Markup Language', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'HTML Live Previewer', status: 'completado' },
  { extension: 'css', name: 'Cascading Style Sheets', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'CSS Analyzer', status: 'completado' },
  { extension: 'json', name: 'JavaScript Object Notation', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'JSON Schema Inspector & Tree', status: 'completado' },
  { extension: 'xml', name: 'eXtensible Markup Language', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'XML DOM Parser', status: 'completado' },
  { extension: 'yaml', name: 'YAML Ain\'t Markup Language', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'YAML Parser', status: 'completado' },
  { extension: 'log', name: 'System Log Stream', category: 'code', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'code', engine: 'Log Streamer with Filters', status: 'completado' },

  // Imágenes
  { extension: 'png', name: 'Portable Network Graphics', category: 'image', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'images', engine: 'Canvas 2D Matrix Engine', status: 'completado' },
  { extension: 'jpg', name: 'JPEG Image', category: 'image', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'images', engine: 'Canvas 2D Matrix Engine', status: 'completado' },
  { extension: 'jpeg', name: 'JPEG Image', category: 'image', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'images', engine: 'Canvas 2D Matrix Engine', status: 'completado' },
  { extension: 'webp', name: 'WebP Modern Image', category: 'image', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'images', engine: 'WebP GPU Pipeline', status: 'completado' },
  { extension: 'svg', name: 'Scalable Vector Graphics', category: 'image', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'images', engine: 'Vector XML Renderer', status: 'completado' },
  { extension: 'gif', name: 'Graphics Interchange Format', category: 'image', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: 'images', engine: 'Animated Canvas Decoder', status: 'completado' },
  { extension: 'bmp', name: 'Bitmap Image', category: 'image', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'images', engine: 'Direct Pixel Array Engine', status: 'nativo' },

  // Modelos 3D
  { extension: 'obj', name: 'Wavefront 3D Object', category: 'model3d', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: true, primaryModule: '3d', engine: 'Three.js OBJ Parser Engine', status: 'completado' },
  { extension: 'stl', name: 'Stereolithography CAD', category: 'model3d', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: true, primaryModule: '3d', engine: 'Three.js STL Mesh Engine', status: 'completado' },
  { extension: 'gltf', name: 'GL Transmission Format', category: 'model3d', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: '3d', engine: 'Three.js GLTFLoader', status: 'completado' },
  { extension: 'glb', name: 'Binary GLTF Container', category: 'model3d', canOpen: true, canView: true, canPlay: true, canEdit: false, canExport: true, primaryModule: '3d', engine: 'Three.js GLTFLoader', status: 'completado' },
  { extension: 'ply', name: 'Polygon File Format', category: 'model3d', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: false, primaryModule: '3d', engine: 'Three.js BufferGeometry Engine', status: 'completado' },

  // Compresión & Archivos
  { extension: 'zip', name: 'ZIP Archive Container', category: 'archive', canOpen: true, canView: true, canPlay: false, canEdit: true, canExport: true, primaryModule: 'archive', engine: 'Universal In-Memory Zip Engine', status: 'completado' },
  { extension: 'tar', name: 'Tarball Archive', category: 'archive', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: true, primaryModule: 'archive', engine: 'Tar Block Streamer', status: 'completado' },
  { extension: 'gz', name: 'GZip Compressed File', category: 'archive', canOpen: true, canView: true, canPlay: false, canEdit: false, canExport: false, primaryModule: 'archive', engine: 'Decompression Stream Native', status: 'nativo' }
];

export const INITIAL_FILES: WorkstationFile[] = [
  {
    id: 'f-readme',
    name: 'BIENVENIDO_YC_WORKSTATION.md',
    path: '/Documentos/BIENVENIDO_YC_WORKSTATION.md',
    size: 2480,
    type: 'code',
    extension: 'md',
    mimeType: 'text/markdown',
    lastModified: Date.now() - 3600000,
    favorite: true,
    content: `# YC UNIVERSAL WORKSTATION
### Plataforma universal de archivos, multimedia, productividad y creación digital
**Edición Obsidiana y Oro** | Funcionamiento 100% Offline y Seguro

---

## Capacidades Implementadas:
1. **Reproductor Multimedia**:
   - Audio: Reproductor de onda, control de velocidad (0.5x - 2.5x), volumen, ecualizador estéreo, metadatos y listas.
   - Video: Soporte MP4, WebM, subtítulos, pantalla completa y PIP.

2. **Lector y Editor de Documentos & PDF**:
   - Visualización y paginación de PDF.
   - Herramientas de anotación: resaltador, inserción de texto, notas adhesivas y firma manuscrita digital.
   - Exportación directa e impresión de documentos.
   - Visor de hojas de cálculo (CSV / TSV) con cuadrícula interactiva.

3. **Editor de Código y Texto**:
   - Modos: Markdown en tiempo real, JavaScript, TypeScript, HTML, CSS, JSON, XML, LOG.
   - Conteo de líneas, autoguardado en almacenamiento seguro, búsqueda y formateador.

4. **Visor y Editor de Imágenes**:
   - Zoom suave con rueda, rotación a 90°, inversión, filtros (brillo, contraste, escala de grises, sepia).
   - Conversión de formato inmediata a PNG/JPG.

5. **Visor 3D Tridimensional (Three.js)**:
   - Renderizado con iluminación cinemática, vista de alambre (wireframe), rotación orbital interactiva.
   - Generador y lector de modelos STL, OBJ y geometrías paramétricas.

6. **Compresión y Explorador de Archivos**:
   - Simulación y empaquetado de archivos ZIP.
   - Búsqueda universal instantánea, filtros, ordenación y propiedades detalladas.
`
  },
  {
    id: 'f-code-demo',
    name: 'quantum_engine.js',
    path: '/Proyectos/quantum_engine.js',
    size: 1420,
    type: 'code',
    extension: 'js',
    mimeType: 'application/javascript',
    lastModified: Date.now() - 7200000,
    favorite: true,
    content: `// YC Universal Workstation - Core Engine Demo
class QuantumWorkstationEngine {
  constructor(config = {}) {
    this.name = "YC Universal Station";
    this.version = "2.4.0";
    this.theme = "Obsidian-Gold";
    this.memoryProtection = true;
    this.offlineReady = true;
  }

  initialize() {
    console.log(\`[YC CORE] Inicializando \${this.name} v\${this.version}\`);
    this.loadModules();
    return { status: "ONLINE", encrypted: true };
  }

  loadModules() {
    const modules = ['FileSystem', 'MediaPlayback', 'DocViewer', 'CodeEditor', 'Three3D', 'Archiver'];
    modules.forEach(mod => console.log(\` -> Módulo activo: \${mod}\`));
  }
}

const engine = new QuantumWorkstationEngine();
engine.initialize();`
  },
  {
    id: 'f-csv-data',
    name: 'metricas_financieras_2026.csv',
    path: '/Finanzas/metricas_financieras_2026.csv',
    size: 890,
    type: 'spreadsheet',
    extension: 'csv',
    mimeType: 'text/csv',
    lastModified: Date.now() - 14400000,
    favorite: false,
    content: `Mes,Ingresos,Costos Operativos,Rendimiento Neto,Margen %
Enero,45000,12000,33000,73.3%
Febrero,52000,13500,38500,74.0%
Marzo,61000,15000,46000,75.4%
Abril,59000,14200,44800,75.9%
Mayo,68000,16100,51900,76.3%
Junio,75000,17000,58000,77.3%
Julio,82000,18500,63500,77.4%
Agosto,90000,20000,70000,77.7%`
  },
  {
    id: 'f-sample-pdf',
    name: 'contrato_servicios_digitales.pdf',
    path: '/Legal/contrato_servicios_digitales.pdf',
    size: 4520,
    type: 'document',
    extension: 'pdf',
    mimeType: 'application/pdf',
    lastModified: Date.now() - 86400000,
    favorite: true,
    content: `CONTRATO DE SERVICIOS DIGITALES Y LICENCIA YC WORKSTATION

Fecha de emisión: 12 de Noviembre de 2026
Entidad: YC UNIVERSAL SYSTEM TECHNOLOGIES

1. OBJETO Y DECLARACIONES
El presente instrumento estipula el acceso ilimitado a la suite YC Workstation para operaciones de productividad, lectura, reproducción multimedia, cálculo dimensional e ingeniería.

2. CLÁUSULA DE PRIVACIDAD TOTAL
Todo archivo, audio, documento, plano tridimensional o registro procesado permanecerá en el entorno local del usuario sin transmisión a servidores no autorizados.

3. DERECHOS DE AUTORÍA Y EXPORTACIÓN
El usuario es propietario absoluto de los documentos generados, notas firmadas y exportaciones digitales producidas mediante las herramientas integradas.

4. VALIDEZ DE FIRMA DIGITAL
Las rúbricas vectoriales insertadas en este entorno gozan de conformidad para auditoría interna y registro contractual.`
  },
  {
    id: 'f-sample-audio',
    name: 'Sinfonia_Cosmica_Obsidiana.mp3',
    path: '/Musica/Sinfonia_Cosmica_Obsidiana.mp3',
    size: 320000,
    type: 'audio',
    extension: 'mp3',
    mimeType: 'audio/mp3',
    lastModified: Date.now() - 172800000,
    favorite: true,
    // Synthesized WebAudio triggerable sound placeholder
    content: 'synthesized:cosmic_ambient'
  },
  {
    id: 'f-sample-image',
    name: 'arquitectura_gold_station.svg',
    path: '/Imagenes/arquitectura_gold_station.svg',
    size: 2150,
    type: 'image',
    extension: 'svg',
    mimeType: 'image/svg+xml',
    lastModified: Date.now() - 250000000,
    favorite: true,
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d11" />
      <stop offset="100%" stop-color="#161a22" />
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d4af37" />
      <stop offset="50%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#b89222" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="600" height="400" fill="url(#bg)" />
  <circle cx="300" cy="200" r="140" stroke="url(#gold)" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="8 6"/>
  <circle cx="300" cy="200" r="100" stroke="url(#gold)" stroke-width="3" fill="#11141a" filter="url(#glow)"/>
  <polygon points="300,130 360,240 240,240" stroke="url(#gold)" stroke-width="4" fill="none" />
  <circle cx="300" cy="200" r="12" fill="url(#gold)" />
  <text x="300" y="340" fill="url(#gold)" font-family="sans-serif" font-size="20" font-weight="bold" letter-spacing="4" text-anchor="middle">YC WORKSTATION ARCHITECTURE</text>
  <text x="300" y="365" fill="#94a3b8" font-family="monospace" font-size="12" letter-spacing="2" text-anchor="middle">CORE • MODULAR • LOCAL FIRST</text>
</svg>`
  },
  {
    id: 'f-sample-3d',
    name: 'prisma_geometrico.stl',
    path: '/Modelos3D/prisma_geometrico.stl',
    size: 5120,
    type: 'model3d',
    extension: 'stl',
    mimeType: 'model/stl',
    lastModified: Date.now() - 320000000,
    favorite: true,
    content: 'stl-geometry:icosahedron'
  },
  {
    id: 'f-sample-archive',
    name: 'recursos_sistema_v1.zip',
    path: '/Archivos/recursos_sistema_v1.zip',
    size: 18450,
    type: 'archive',
    extension: 'zip',
    mimeType: 'application/zip',
    lastModified: Date.now() - 400000000,
    favorite: false,
    content: 'archive-manifest:config.json,license.txt,assets/logo.svg'
  }
];