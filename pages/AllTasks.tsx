import React from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';

export const AllTasks = () => {
  const { tasks, updateTask, projects } = useApp();

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
      updateTask({ ...task, status });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const columns = Object.values(TaskStatus);

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <h1 className="text-3xl font-bold mb-6">Kanban Board</h1>
      
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(status => (
          <div 
            key={status}
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={handleDragOver}
            className="flex-shrink-0 w-80 bg-surface rounded-xl border border-border flex flex-col h-full"
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider">{status}</h3>
                <span className="bg-background px-2 py-0.5 rounded text-xs text-muted">
                    {tasks.filter(t => t.status === status).length}
                </span>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {tasks.filter(t => t.status === status).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-background p-4 rounded-lg border border-border cursor-move hover:border-primary/50 shadow-sm transition-all group"
                >
                  <p className="font-medium text-sm mb-2 group-hover:text-primary transition-colors">{task.title}</p>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                        {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                    </span>
                    <div className="flex gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded ${
                             task.priority === 'High' ? 'bg-red-900/30 text-red-400' : 
                             task.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 
                             'bg-blue-900/30 text-blue-400'
                        }`}>{task.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
