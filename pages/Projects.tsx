
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus, TaskStatus, ProjectCategory, Priority, Subtask, KPI } from '../types';
import { ChevronRight, MoreVertical, Plus, FolderKanban, Trash2, CheckSquare, ListTodo, ChevronDown, ChevronUp, Edit2, Check, X, Clock, ArrowLeft } from 'lucide-react';

export const Projects = () => {
  const { 
    projects, tasks, goals, kpis, subtasks,
    addProject, deleteProject, 
    addTask, addKPI, deleteKPI, updateKPI,
    addSubtask, toggleSubtask, deleteSubtask, updateTask
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | 'All'>('All');
  const [newProjectCategory, setNewProjectCategory] = useState<ProjectCategory>(ProjectCategory.Work);
  
  // Creation States for selected project
  const [isAddingKPI, setIsAddingKPI] = useState(false);
  const [newKPI, setNewKPI] = useState({ name: '', target: '', unit: '' });
  
  // KPI Edit State
  const [editingKPIId, setEditingKPIId] = useState<string | null>(null);
  const [tempKPIValue, setTempKPIValue] = useState<string>('');

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: Priority.Medium, estimatedHours: 1, deadline: '' });

  // UI State for Task Expansion
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<{[taskId: string]: string}>({});

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const projectGoals = goals.filter(g => g.projectId === selectedProjectId);
  const projectKPIs = kpis.filter(k => k.projectId === selectedProjectId);

  const filteredProjects = categoryFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === categoryFilter);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    addProject({
      id: crypto.randomUUID(),
      name: newProjectName,
      vision: '',
      status: ProjectStatus.Active,
      category: newProjectCategory,
      createdAt: new Date().toISOString()
    });
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const handleAddKPI = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedProjectId || !newKPI.name) return;
      addKPI({
          id: crypto.randomUUID(),
          projectId: selectedProjectId,
          name: newKPI.name,
          currentValue: 0,
          targetValue: Number(newKPI.target) || 100,
          unit: newKPI.unit || '%',
          updateFrequency: 'Weekly'
      });
      setNewKPI({ name: '', target: '', unit: '' });
      setIsAddingKPI(false);
  }
  
  const startEditKPI = (kpi: KPI) => {
      setEditingKPIId(kpi.id);
      setTempKPIValue(kpi.currentValue.toString());
  }
  
  const saveKPIUpdate = (kpi: KPI) => {
      const newVal = Number(tempKPIValue);
      if(!isNaN(newVal)) {
          updateKPI({ ...kpi, currentValue: newVal });
      }
      setEditingKPIId(null);
  }
  
  const cancelEditKPI = () => {
      setEditingKPIId(null);
      setTempKPIValue('');
  }

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedProjectId || !newTask.title) return;
      addTask({
          id: crypto.randomUUID(),
          projectId: selectedProjectId,
          title: newTask.title,
          description: '',
          priority: newTask.priority,
          estimatedHours: Number(newTask.estimatedHours) || 1,
          status: TaskStatus.Backlog,
          deadline: newTask.deadline || undefined,
          createdAt: new Date().toISOString()
      });
      setNewTask({ title: '', priority: Priority.Medium, estimatedHours: 1, deadline: '' });
      setIsAddingTask(false);
  }

  const toggleTaskExpansion = (taskId: string) => {
      const newSet = new Set(expandedTasks);
      if(newSet.has(taskId)) newSet.delete(taskId);
      else newSet.add(taskId);
      setExpandedTasks(newSet);
  }

  const handleAddSubtask = (taskId: string) => {
      const title = newSubtaskInputs[taskId];
      if(!title?.trim()) return;
      
      addSubtask({
          id: crypto.randomUUID(),
          taskId: taskId,
          title: title,
          isCompleted: false
      });
      
      setNewSubtaskInputs(prev => ({ ...prev, [taskId]: '' }));
  }

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden">
      {/* Project List Sidebar - Hidden on mobile if project selected */}
      <div className={`w-full md:w-80 border-r border-border bg-surface flex-col ${selectedProjectId ? 'hidden md:flex' : 'flex'} h-full`}>
        <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Projects</h2>
                <button 
                    onClick={() => setIsCreatingProject(true)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
            {/* Filter Tabs */}
            <div className="flex p-1 bg-background rounded-lg gap-1">
                <button 
                    onClick={() => setCategoryFilter('All')}
                    className={`flex-1 py-1 text-[10px] rounded-md font-medium transition-colors ${categoryFilter === 'All' ? 'bg-surface text-white shadow' : 'text-muted hover:text-white'}`}>
                    All
                </button>
                <button 
                    onClick={() => setCategoryFilter(ProjectCategory.Work)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-medium transition-colors ${categoryFilter === ProjectCategory.Work ? 'bg-blue-500/20 text-blue-400' : 'text-muted hover:text-white'}`}>
                    Work
                </button>
                <button 
                    onClick={() => setCategoryFilter(ProjectCategory.Education)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-medium transition-colors ${categoryFilter === ProjectCategory.Education ? 'bg-purple-500/20 text-purple-400' : 'text-muted hover:text-white'}`}>
                    Edu
                </button>
                <button 
                    onClick={() => setCategoryFilter(ProjectCategory.Personal)}
                    className={`flex-1 py-1 text-[10px] rounded-md font-medium transition-colors ${categoryFilter === ProjectCategory.Personal ? 'bg-pink-500/20 text-pink-400' : 'text-muted hover:text-white'}`}>
                    Life
                </button>
            </div>
        </div>

        {isCreatingProject && (
          <form onSubmit={handleCreateProject} className="p-4 border-b border-border space-y-2">
            <input
              autoFocus
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <select 
               value={newProjectCategory}
               onChange={e => setNewProjectCategory(e.target.value as ProjectCategory)}
               className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
            >
                <option value={ProjectCategory.Work}>Work</option>
                <option value={ProjectCategory.Education}>Education</option>
                <option value={ProjectCategory.Personal}>Personal</option>
            </select>
            <div className="flex justify-end gap-2">
                 <button type="button" onClick={() => setIsCreatingProject(false)} className="text-xs px-2 py-1">Cancel</button>
                 <button type="submit" className="text-xs bg-primary px-2 py-1 rounded">Create</button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredProjects.map(project => {
            const progress = tasks.filter(t => t.projectId === project.id && t.status === TaskStatus.Done).length;
            const total = tasks.filter(t => t.projectId === project.id).length;
            const percent = total === 0 ? 0 : Math.round((progress / total) * 100);

            return (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full text-left p-4 border-b border-border hover:bg-white/5 transition-colors ${
                  selectedProjectId === project.id ? 'bg-white/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium truncate">{project.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    project.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        project.category === ProjectCategory.Work ? 'border-blue-500/30 text-blue-400' : 
                        project.category === ProjectCategory.Education ? 'border-purple-500/30 text-purple-400' : 
                        'border-pink-500/30 text-pink-400'
                    }`}>
                        {project.category}
                    </span>
                </div>
                <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Details - Full screen on mobile if selected */}
      <div className={`flex-1 overflow-y-auto bg-background p-4 md:p-8 ${selectedProjectId ? 'block' : 'hidden md:block'}`}>
        {selectedProject ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
                <button 
                    onClick={() => setSelectedProjectId(null)}
                    className="flex items-center gap-2 text-muted hover:text-white"
                >
                    <ArrowLeft size={18} /> Back to Projects
                </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedProject.name}</h1>
                <p className="text-muted text-lg">{selectedProject.vision || "No vision statement yet."}</p>
              </div>
              <button 
                onClick={() => {
                   if(confirm('Are you sure you want to delete this project?')) {
                       deleteProject(selectedProject.id);
                       setSelectedProjectId(null);
                   }
                }}
                className="text-red-400 hover:text-red-300 text-sm hover:bg-red-900/20 px-3 py-1.5 rounded transition-colors self-end md:self-auto">
                Delete Project
              </button>
            </div>

            {/* Goals & KPIs */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Goals */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4 text-accent">Goals</h3>
                <ul className="space-y-3">
                  {projectGoals.length > 0 ? projectGoals.map(g => (
                    <li key={g.id} className="flex items-start gap-3 text-sm">
                      <ChevronRight size={16} className="mt-0.5 text-muted shrink-0" />
                      <span>{g.description}</span>
                    </li>
                  )) : <p className="text-muted text-sm italic">No goals defined.</p>}
                </ul>
              </div>

              {/* KPIs */}
              <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-green-400">KPIs</h3>
                    <button onClick={() => setIsAddingKPI(true)} className="text-xs text-muted hover:text-white bg-background border border-border px-2 py-1 rounded">+ Add</button>
                </div>
                
                {isAddingKPI && (
                    <form onSubmit={handleAddKPI} className="mb-4 bg-background p-3 rounded border border-border">
                        <input 
                            placeholder="KPI Name (e.g. ARR)" 
                            className="w-full bg-surface border border-border rounded p-1 mb-2 text-sm"
                            value={newKPI.name}
                            onChange={e => setNewKPI({...newKPI, name: e.target.value})}
                            autoFocus
                        />
                        <div className="flex gap-2 mb-2">
                             <input 
                                placeholder="Target" 
                                type="number"
                                className="w-1/2 bg-surface border border-border rounded p-1 text-sm"
                                value={newKPI.target}
                                onChange={e => setNewKPI({...newKPI, target: e.target.value})}
                            />
                            <input 
                                placeholder="Unit" 
                                className="w-1/2 bg-surface border border-border rounded p-1 text-sm"
                                value={newKPI.unit}
                                onChange={e => setNewKPI({...newKPI, unit: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAddingKPI(false)} className="text-xs text-muted hover:text-white">Cancel</button>
                            <button type="submit" className="text-xs bg-primary text-white px-2 py-1 rounded">Save</button>
                        </div>
                    </form>
                )}

                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                  {projectKPIs.length > 0 ? projectKPIs.map(k => (
                    <div key={k.id} className="group relative">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{k.name}</span>
                        <div className="flex items-center gap-2">
                            {editingKPIId === k.id ? (
                                <div className="flex items-center gap-1">
                                   <input 
                                      type="number" 
                                      className="w-16 bg-background border border-border rounded px-1 py-0.5 text-xs focus:outline-none focus:border-primary"
                                      value={tempKPIValue}
                                      onChange={e => setTempKPIValue(e.target.value)}
                                      autoFocus
                                      onKeyDown={e => e.key === 'Enter' && saveKPIUpdate(k)}
                                   />
                                   <button onClick={() => saveKPIUpdate(k)}><Check size={14} className="text-green-400"/></button>
                                   <button onClick={cancelEditKPI}><X size={14} className="text-red-400"/></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group-hover:bg-white/5 rounded px-1 transition-colors">
                                    <span 
                                        onClick={() => startEditKPI(k)}
                                        className="font-mono text-xs cursor-pointer hover:text-white" 
                                        title="Click to edit value"
                                    >
                                        {k.currentValue} / {k.targetValue} {k.unit}
                                    </span>
                                </div>
                            )}
                            <button onClick={() => deleteKPI(k.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                                <Trash2 size={12} />
                            </button>
                        </div>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div 
                          className="bg-green-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (k.currentValue / k.targetValue) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  )) : <p className="text-muted text-sm italic">No KPIs tracked.</p>}
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="bg-surface border border-border rounded-xl p-6 mb-20 md:mb-0">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Tasks</h3>
                  <button 
                    onClick={() => setIsAddingTask(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                      <Plus size={16} /> Add Task
                  </button>
              </div>

              {isAddingTask && (
                  <form onSubmit={handleAddTask} className="mb-6 bg-background p-4 rounded-lg border border-border animate-in fade-in slide-in-from-top-2">
                      <div className="grid gap-3">
                          <input 
                            placeholder="Task Title"
                            className="w-full bg-surface border border-border rounded p-2 text-sm focus:border-primary focus:outline-none"
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                            autoFocus
                          />
                          <div className="flex flex-col md:flex-row gap-3">
                              <select 
                                className="bg-surface border border-border rounded p-2 text-sm"
                                value={newTask.priority}
                                onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                              >
                                  <option value={Priority.High}>High Priority</option>
                                  <option value={Priority.Medium}>Medium Priority</option>
                                  <option value={Priority.Low}>Low Priority</option>
                              </select>
                              <input 
                                type="number"
                                placeholder="Hours"
                                className="w-24 bg-surface border border-border rounded p-2 text-sm"
                                value={newTask.estimatedHours}
                                onChange={e => setNewTask({...newTask, estimatedHours: Number(e.target.value)})}
                              />
                              <input 
                                type="date"
                                className="bg-surface border border-border rounded p-2 text-sm text-muted"
                                value={newTask.deadline}
                                onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                              />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                              <button type="button" onClick={() => setIsAddingTask(false)} className="text-sm px-3 py-1.5 rounded hover:bg-white/10">Cancel</button>
                              <button type="submit" className="text-sm px-3 py-1.5 bg-primary rounded text-white hover:bg-blue-600">Create Task</button>
                          </div>
                      </div>
                  </form>
              )}

              <div className="space-y-3">
                {projectTasks.map(task => {
                   const thisTaskSubtasks = subtasks.filter(s => s.taskId === task.id);
                   const isExpanded = expandedTasks.has(task.id);
                   
                   return (
                   <div key={task.id} className="bg-background border border-border rounded-lg overflow-hidden transition-all">
                     {/* Main Task Row */}
                     <div className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer" onClick={() => toggleTaskExpansion(task.id)}>
                         <div className="flex items-center gap-3 overflow-hidden">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleTaskExpansion(task.id); }}
                                className="text-muted hover:text-white flex-shrink-0"
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <div 
                                onClick={(e) => { e.stopPropagation(); updateTask({...task, status: task.status === TaskStatus.Done ? TaskStatus.InProgress : TaskStatus.Done}) }}
                                className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center flex-shrink-0 ${
                                    task.status === TaskStatus.Done ? 'bg-green-500 border-green-500' : 'border-muted hover:border-primary'
                                }`}
                            >
                                {task.status === TaskStatus.Done && <CheckSquare size={10} className="text-white" />}
                            </div>
                            <span className={`${task.status === TaskStatus.Done ? 'line-through text-muted' : ''} font-medium truncate`}>{task.title}</span>
                            <span className="text-xs text-muted ml-2 flex-shrink-0">({thisTaskSubtasks.filter(s => s.isCompleted).length}/{thisTaskSubtasks.length})</span>
                         </div>
                         <div className="flex items-center gap-3 flex-shrink-0">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                 task.priority === Priority.High ? 'bg-red-900/30 text-red-400' : 
                                 task.priority === Priority.Medium ? 'bg-yellow-900/30 text-yellow-400' : 
                                 'bg-blue-900/30 text-blue-400'
                             }`}>
                                 {task.priority}
                             </span>
                             <span className="text-xs text-muted font-mono hidden md:inline">{task.estimatedHours}h</span>
                         </div>
                     </div>
                     
                     {/* Subtasks Section */}
                     {isExpanded && (
                         <div className="bg-surface/30 border-t border-border p-4 pl-12 animate-in slide-in-from-top-1">
                             <div className="flex items-center gap-2 mb-3">
                                <Clock size={14} className="text-muted" />
                                <span className="text-xs text-muted">Deadline:</span>
                                <input 
                                    type="date"
                                    className="bg-transparent text-xs text-text border border-border rounded px-2 py-1 focus:border-primary focus:outline-none"
                                    value={task.deadline ? task.deadline.split('T')[0] : ''}
                                    onChange={(e) => updateTask({...task, deadline: e.target.value})}
                                />
                             </div>

                             <div className="space-y-2 mb-3">
                                 {thisTaskSubtasks.map(st => (
                                     <div key={st.id} className="flex items-center justify-between group">
                                         <div className="flex items-center gap-3">
                                             <button 
                                                onClick={() => toggleSubtask(st.id)}
                                                className={`w-3 h-3 rounded border flex items-center justify-center ${
                                                    st.isCompleted ? 'bg-accent border-accent' : 'border-muted'
                                                }`}
                                             >
                                                {st.isCompleted && <CheckSquare size={8} className="text-white" />}
                                             </button>
                                             <span className={`text-sm ${st.isCompleted ? 'line-through text-muted' : 'text-gray-300'}`}>{st.title}</span>
                                         </div>
                                         <button onClick={() => deleteSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400">
                                             <Trash2 size={14} />
                                         </button>
                                     </div>
                                 ))}
                                 {thisTaskSubtasks.length === 0 && <p className="text-xs text-muted italic">No subtasks yet.</p>}
                             </div>
                             
                             <div className="flex gap-2">
                                 <input 
                                    placeholder="Add subtask..."
                                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                    value={newSubtaskInputs[task.id] || ''}
                                    onChange={e => setNewSubtaskInputs({...newSubtaskInputs, [task.id]: e.target.value})}
                                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask(task.id)}
                                 />
                                 <button 
                                    onClick={() => handleAddSubtask(task.id)}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary text-xs px-2 py-1 rounded"
                                 >
                                     Add
                                 </button>
                             </div>
                         </div>
                     )}
                   </div>
                )})}
                {projectTasks.length === 0 && (
                    <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted">
                        No tasks yet. Use the Brain Dump to generate some or create one manually!
                    </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted">
            <FolderKanban size={48} className="mb-4 opacity-50" />
            <p>Select a project to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
