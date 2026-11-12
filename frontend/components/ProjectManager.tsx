import React, { useState } from 'react';
import { ProjectItem, KanbanTask, WorkstationFile } from '../types';
import { 
  Kanban, Plus, CheckCircle2, Clock, AlertCircle, FileText, Trash2, 
  Edit3, Save, ExternalLink, Calendar, Tag, ChevronRight, Layers
} from 'lucide-react';
import { saveStoredProjects } from '../services/fileService';

interface ProjectManagerProps {
  projects: ProjectItem[];
  allFiles: WorkstationFile[];
  onUpdateProjects: (updated: ProjectItem[]) => void;
  onOpenFile: (file: WorkstationFile) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  allFiles,
  onUpdateProjects,
  onOpenFile
}) => {
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id || '');
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // New Project Form
  const [newProjectTitle, setNewProjectTitle] = useState<string>('');
  const [newProjectDesc, setNewProjectDesc] = useState<string>('');

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [newTaskFileId, setNewTaskFileId] = useState<string>('');

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim() || 'Proyecto de productividad YC.',
      color: '#d4af37',
      tasks: [],
      quickNotes: 'Notas del proyecto...\n- Objetivos clave\n- Archivos vinculados',
      associatedFileIds: [],
      createdAt: Date.now()
    };

    const updated = [...projects, newProj];
    onUpdateProjects(updated);
    setActiveProjectId(newProj.id);
    setNewProjectTitle('');
    setNewProjectDesc('');
    setShowNewProjectModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentProject) return;

    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      status: newTaskStatus,
      fileIds: newTaskFileId ? [newTaskFileId] : [],
      createdAt: Date.now()
    };

    const updatedProject: ProjectItem = {
      ...currentProject,
      tasks: [...currentProject.tasks, newTask]
    };

    const nextProjects = projects.map(p => p.id === currentProject.id ? updatedProject : p);
    onUpdateProjects(nextProjects);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowNewTaskModal(false);
  };

  const handleMoveTaskStatus = (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    if (!currentProject) return;
    const nextTasks = currentProject.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    const updatedProject = { ...currentProject, tasks: nextTasks };
    onUpdateProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentProject) return;
    const nextTasks = currentProject.tasks.filter(t => t.id !== taskId);
    const updatedProject = { ...currentProject, tasks: nextTasks };
    onUpdateProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
  };

  const handleUpdateNotes = (notes: string) => {
    if (!currentProject) return;
    const updatedProject = { ...currentProject, quickNotes: notes };
    onUpdateProjects(projects.map(p => p.id === currentProject.id ? updatedProject : p));
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Alta</span>;
      case 'medium':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Media</span>;
      case 'low':
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Normal</span>;
    }
  };

  const renderKanbanColumn = (status: 'todo' | 'in_progress' | 'done', title: string, colorClass: string) => {
    const tasks = currentProject?.tasks.filter(t => t.status === status) || [];
    return (
      <div className="flex-1 min-w-[280px] bg-obsidian-900 border border-obsidian-800 rounded-2xl p-4 flex flex-col shadow-xl">
        {/* Column Header */}
        <div className="flex items-center justify-between pb-3 border-b border-obsidian-800 mb-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">{title}</h4>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-obsidian-850 px-2 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>

        {/* Column Task Cards */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="h-28 flex items-center justify-center text-center text-slate-600 text-xs font-mono">
              Sin tareas pendientes
            </div>
          ) : (
            tasks.map(task => {
              const linkedFile = allFiles.find(f => task.fileIds.includes(f.id));
              return (
                <div
                  key={task.id}
                  className="bg-obsidian-850 border border-obsidian-750 hover:border-gold-500/40 rounded-xl p-3.5 shadow-md transition group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="text-xs font-bold text-slate-200 group-hover:text-gold-300 leading-snug">
                      {task.title}
                    </h5>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-400 font-sans mb-2.5 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Linked File Pill */}
                  {linkedFile && (
                    <div
                      onClick={() => onOpenFile(linkedFile)}
                      className="mb-2.5 flex items-center space-x-1.5 p-1.5 bg-obsidian-950 border border-obsidian-800 hover:border-gold-500/30 rounded-lg text-[10px] font-mono text-gold-300 cursor-pointer transition"
                      title="Abrir archivo vinculado"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[170px]">{linkedFile.name}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-auto" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-obsidian-800 text-[10px]">
                    {getPriorityBadge(task.priority)}

                    {/* Move Status Buttons */}
                    <div className="flex items-center space-x-1 font-mono">
                      {status !== 'todo' && (
                        <button
                          onClick={() => handleMoveTaskStatus(task.id, 'todo')}
                          className="px-1.5 py-0.5 rounded bg-obsidian-800 hover:bg-obsidian-750 text-slate-400 hover:text-white"
                          title="Mover a Por Hacer"
                        >
                          ←
                        </button>
                      )}
                      {status !== 'in_progress' && (
                        <button
                          onClick={() => handleMoveTaskStatus(task.id, 'in_progress')}
                          className="px-1.5 py-0.5 rounded bg-obsidian-800 hover:bg-obsidian-750 text-slate-400 hover:text-white"
                          title="Mover a En Curso"
                        >
                          {status === 'todo' ? '➔' : '←'}
                        </button>
                      )}
                      {status !== 'done' && (
                        <button
                          onClick={() => handleMoveTaskStatus(task.id, 'done')}
                          className="px-1.5 py-0.5 rounded bg-obsidian-800 hover:bg-obsidian-750 text-slate-400 hover:text-emerald-400"
                          title="Completar"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-obsidian-800 mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-400">
            <Kanban className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Gestor de Proyectos & Tableros Kanban
              <span className="text-xs px-2.5 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono">
                {projects.length} Proyectos
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Organización de tareas, archivos vinculados y notas de proyecto 100% locales
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center space-x-2">
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-obsidian-900 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-obsidian-850 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750 rounded-xl flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo Proyecto
          </button>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 text-xs font-bold bg-gold-500 text-obsidian-950 hover:bg-gold-400 rounded-xl flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,175,55,0.25)] transition"
          >
            <Plus className="w-4 h-4" /> Añadir Tarea
          </button>
        </div>
      </div>

      {/* Main Kanban Columns Area & Project Quick Notes */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Kanban Board (3 Columns) */}
        <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
          {renderKanbanColumn('todo', 'Por Hacer', 'bg-amber-400')}
          {renderKanbanColumn('in_progress', 'En Curso', 'bg-sky-400')}
          {renderKanbanColumn('done', 'Completado', 'bg-emerald-400')}
        </div>

        {/* Right Side: Quick Notes of Active Project */}
        {currentProject && (
          <div className="w-full lg:w-80 bg-obsidian-900 border border-obsidian-800 rounded-2xl p-4 flex flex-col shadow-xl shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 font-mono mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notas Rápidas del Proyecto
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              {currentProject.description}
            </p>
            <textarea
              value={currentProject.quickNotes}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              placeholder="Escriba apuntes rápidos o links a tareas..."
              className="flex-1 bg-obsidian-950 border border-obsidian-800 rounded-xl p-3 font-mono text-xs text-slate-200 resize-none focus:outline-none focus:border-gold-500 leading-relaxed"
            />
            <div className="mt-3 pt-2 border-t border-obsidian-800 flex justify-between text-[10px] font-mono text-slate-500">
              <span>Autoguardado Seguro</span>
              <span className="text-gold-400">YC Station</span>
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Crear Nuevo Proyecto</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Nombre del Proyecto:</label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="ej. Campaña Digital 2026"
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Descripción:</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Objetivos, alcance o notas iniciales..."
                  rows={3}
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-obsidian-850 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gold-500 text-obsidian-950 hover:bg-gold-400"
                >
                  Crear Tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Añadir Tarea al Proyecto</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Título de la Tarea:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="ej. Revisar contrato PDF y firmar"
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Descripción:</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detalles sobre entregables o instrucciones..."
                  rows={2}
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-gold-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Prioridad:</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    <option value="low">Normal</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Columna:</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as any)}
                    className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    <option value="todo">Por Hacer</option>
                    <option value="in_progress">En Curso</option>
                    <option value="done">Completado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Vincular Archivo del Espacio:</label>
                <select
                  value={newTaskFileId}
                  onChange={(e) => setNewTaskFileId(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-750 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                >
                  <option value="">-- Sin archivo vinculado --</option>
                  {allFiles.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-obsidian-850 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gold-500 text-obsidian-950 hover:bg-gold-400"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
