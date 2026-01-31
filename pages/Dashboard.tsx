import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, ProjectCategory } from '../types';
import { PlayCircle, CheckCircle2, Clock, Target, AlertCircle } from 'lucide-react';
import { generateDailyPlan } from '../services/geminiService';

export const Dashboard = () => {
  const { tasks, projects, goals, updateTask } = useApp();
  const [dailyAdvice, setDailyAdvice] = useState<string>("");
  const [focusTaskIds, setFocusTaskIds] = useState<string[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Filter for WORK context only
  const workProjects = projects.filter(p => p.category === ProjectCategory.Work);
  const workProjectIds = workProjects.map(p => p.id);
  const workTasks = tasks.filter(t => workProjectIds.includes(t.projectId));
  const workGoals = goals.filter(g => workProjectIds.includes(g.projectId));

  // Computed Stats for WORK
  const activeProjects = workProjects.filter(p => p.status === 'Active').length;
  const pendingTasks = workTasks.filter(t => t.status !== TaskStatus.Done).length;
  const completedTasks = workTasks.filter(t => t.status === TaskStatus.Done).length;
  const totalHours = workTasks
    .filter(t => t.status !== TaskStatus.Done)
    .reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const generatePlan = async () => {
      setIsLoadingPlan(true);
      const activeTasks = workTasks.filter(t => t.status !== TaskStatus.Done);
      const plan = await generateDailyPlan(activeTasks, workGoals);
      if (plan) {
          setDailyAdvice(plan.advice);
          setFocusTaskIds(plan.top3TaskIds);
      }
      setIsLoadingPlan(false);
  }

  const focusTasks = workTasks.filter(t => focusTaskIds.includes(t.id));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <span className="text-primary">Professional</span> 
              <span>Dashboard</span>
          </h1>
          <p className="text-muted">Operational execution for your ventures.</p>
        </div>
        <button 
            onClick={generatePlan}
            disabled={isLoadingPlan}
            className="px-4 py-2 bg-surface hover:bg-border border border-border rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
            {isLoadingPlan ? "Thinking..." : "Generate Focus"}
            <Target size={16} className="text-accent"/>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted text-sm font-medium">Active Ventures</span>
            <PlayCircle className="text-primary" size={20} />
          </div>
          <span className="text-3xl font-bold">{activeProjects}</span>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted text-sm font-medium">Work Tasks</span>
            <Clock className="text-orange-400" size={20} />
          </div>
          <span className="text-3xl font-bold">{pendingTasks}</span>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted text-sm font-medium">Completed</span>
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <span className="text-3xl font-bold">{completedTasks}</span>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-4">
            <span className="text-muted text-sm font-medium">Backlog Hours</span>
            <AlertCircle className="text-accent" size={20} />
          </div>
          <span className="text-3xl font-bold">{totalHours}h</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Daily Focus */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 min-h-[300px]">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="text-red-500" size={20} />
                Focus Mode
            </h2>
            
            {dailyAdvice && (
                <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-blue-100 leading-relaxed italic">
                    "{dailyAdvice}"
                </div>
            )}

            {focusTasks.length > 0 ? (
                <div className="space-y-4">
                    {focusTasks.map(task => (
                        <div key={task.id} className="bg-background p-4 rounded-lg border border-border flex items-center justify-between group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => updateTask({...task, status: TaskStatus.Done})}
                                    className="w-6 h-6 rounded-full border-2 border-muted hover:border-green-500 hover:bg-green-500/10 transition-colors"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    <p className="text-sm text-muted">
                                        {workProjects.find(p => p.id === task.projectId)?.name} • {task.estimatedHours}h
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium
                                ${task.priority === 'High' ? 'bg-red-900/30 text-red-400' : 
                                  task.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 
                                  'bg-blue-900/30 text-blue-400'}`}>
                                {task.priority}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-lg">
                    <p>No focus tasks generated yet.</p>
                    <button onClick={generatePlan} className="text-primary text-sm mt-2 hover:underline">Generate Plan</button>
                </div>
            )}
          </div>
        </div>

        {/* Right Col: High Priority Backlog */}
        <div className="space-y-6">
             <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Work Backlog (High)</h2>
                <div className="space-y-3">
                    {workTasks
                        .filter(t => t.priority === 'High' && t.status !== TaskStatus.Done)
                        .slice(0, 5)
                        .map(task => (
                        <div key={task.id} className="p-3 bg-background rounded border border-border text-sm">
                            <p className="font-medium truncate">{task.title}</p>
                            <div className="flex justify-between mt-2 text-xs text-muted">
                                <span>{workProjects.find(p => p.id === task.projectId)?.name}</span>
                                <span>{task.estimatedHours}h</span>
                            </div>
                        </div>
                    ))}
                    {workTasks.filter(t => t.priority === 'High' && t.status !== TaskStatus.Done).length === 0 && (
                        <p className="text-muted text-sm">No high priority tasks.</p>
                    )}
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};
