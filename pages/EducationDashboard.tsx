import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, ProjectCategory, ProjectStatus, Priority } from '../types';
import { BookOpen, GraduationCap, Clock, Target, Library, CheckCircle2, Plus, ChevronRight, Bookmark, CalendarClock, AlertCircle, LayoutList } from 'lucide-react';
import { generateDailyPlan } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

export const EducationDashboard = () => {
  const { tasks, projects, goals, updateTask, addProject, addTask, userApiKey } = useApp();
  const [dailyAdvice, setDailyAdvice] = useState<string>("");
  const [focusTaskIds, setFocusTaskIds] = useState<string[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [isAddingAssignment, setIsAddingAssignment] = useState<string | null>(null); // Course ID
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentDate, setNewAssignmentDate] = useState("");
  const navigate = useNavigate();
  
  // TABS STATE
  const [activeTab, setActiveTab] = useState<'courses' | 'assignments' | 'schedule'>('courses');

  // Filter for EDUCATION context only
  const eduProjects = projects.filter(p => p.category === ProjectCategory.Education);
  const eduProjectIds = eduProjects.map(p => p.id);
  const eduTasks = tasks.filter(t => eduProjectIds.includes(t.projectId));
  const eduGoals = goals.filter(g => eduProjectIds.includes(g.projectId));

  // Computed Stats for Education
  const activeCourses = eduProjects.filter(p => p.status === 'Active').length;
  const pendingTasks = eduTasks.filter(t => t.status !== TaskStatus.Done).length;
  const completedTasks = eduTasks.filter(t => t.status === TaskStatus.Done).length;
  const totalHours = eduTasks
    .filter(t => t.status !== TaskStatus.Done)
    .reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

  const generatePlan = async () => {
      if (!userApiKey) {
          if(confirm("You need a Personal API Key to use AI features. Go to Settings?")) {
            navigate('/app/settings');
          }
          return;
      }
      setIsLoadingPlan(true);
      try {
        const activeTasks = eduTasks.filter(t => t.status !== TaskStatus.Done);
        const plan = await generateDailyPlan(activeTasks, eduGoals, userApiKey);
        if (plan) {
            setDailyAdvice(plan.advice);
            setFocusTaskIds(plan.top3TaskIds);
        }
      } catch(e) {
          alert("Error generating plan.");
      } finally {
        setIsLoadingPlan(false);
      }
  }

  const handleAddCourse = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCourseName.trim()) return;
      addProject({
          id: crypto.randomUUID(),
          name: newCourseName,
          vision: 'Mastering this subject',
          category: ProjectCategory.Education,
          status: ProjectStatus.Active,
          createdAt: new Date().toISOString()
      });
      setNewCourseName("");
      setIsAddingCourse(false);
  }

  const handleAddAssignment = (e: React.FormEvent, projectId: string) => {
      e.preventDefault();
      if (!newAssignmentTitle.trim()) return;
      addTask({
          id: crypto.randomUUID(),
          projectId,
          title: newAssignmentTitle,
          description: '',
          priority: Priority.Medium,
          estimatedHours: 1,
          status: TaskStatus.Backlog,
          deadline: newAssignmentDate || undefined,
          createdAt: new Date().toISOString()
      });
      setNewAssignmentTitle("");
      setNewAssignmentDate("");
      setIsAddingAssignment(null);
  }

  const focusTasks = eduTasks.filter(t => focusTaskIds.includes(t.id));

  // Sort tasks for Assignments View
  const upcomingDeadlines = eduTasks
      .filter(t => t.status !== TaskStatus.Done)
      .sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <span className="text-purple-400">Learning</span> 
              <span>OS</span>
          </h1>
          <p className="text-muted">Manage courses, exams, assignments, and self-study.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsAddingCourse(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 shadow-lg shadow-purple-900/20">
                <Plus size={16} /> Add Course
            </button>
            <button 
                onClick={generatePlan}
                disabled={isLoadingPlan}
                className="px-4 py-2 bg-surface hover:bg-border border border-border rounded-lg transition-colors text-sm font-medium flex items-center gap-2">
                {isLoadingPlan ? "Analyzing..." : "Study Plan"}
                <Target size={16} className="text-purple-400"/>
            </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-lg w-full md:w-fit shrink-0">
          <button 
             onClick={() => setActiveTab('courses')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'courses' ? 'bg-purple-600 text-white' : 'text-muted hover:text-white'}`}
          >
              <Bookmark size={16} /> Courses
          </button>
          <button 
             onClick={() => setActiveTab('assignments')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'assignments' ? 'bg-purple-600 text-white' : 'text-muted hover:text-white'}`}
          >
              <CalendarClock size={16} /> Assignments & Tasks
          </button>
          <button 
             onClick={() => setActiveTab('schedule')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-purple-600 text-white' : 'text-muted hover:text-white'}`}
          >
              <LayoutList size={16} /> Study Schedule
          </button>
      </div>

      {/* Stats Grid (Only on Overview/Courses tab to save space) */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <div className="bg-surface p-6 rounded-xl border border-border">
            <div className="flex justify-between items-start mb-4">
                <span className="text-muted text-sm font-medium">Active Courses</span>
                <BookOpen className="text-purple-400" size={20} />
            </div>
            <span className="text-3xl font-bold">{activeCourses}</span>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border">
            <div className="flex justify-between items-start mb-4">
                <span className="text-muted text-sm font-medium">Assignments Due</span>
                <Library className="text-blue-400" size={20} />
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
                <span className="text-muted text-sm font-medium">Study Hours Left</span>
                <Clock className="text-orange-400" size={20} />
            </div>
            <span className="text-3xl font-bold">{totalHours}h</span>
            </div>
        </div>
      )}

      {/* Manual Course Add Modal */}
      {isAddingCourse && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">Add New Course</h3>
                  <form onSubmit={handleAddCourse} className="space-y-4">
                      <input 
                          type="text" 
                          autoFocus
                          placeholder="Course Name (e.g. CS101, Piano)"
                          className="w-full bg-background border border-border rounded p-2 focus:border-purple-500 focus:outline-none"
                          value={newCourseName}
                          onChange={e => setNewCourseName(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsAddingCourse(false)} className="px-3 py-2 text-sm text-muted hover:text-white">Cancel</button>
                          <button type="submit" className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Create</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        
        {/* === COURSES TAB === */}
        {activeTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {eduProjects.length > 0 ? eduProjects.map(course => {
                  const courseTasks = tasks.filter(t => t.projectId === course.id && t.status !== TaskStatus.Done);
                  return (
                      <div key={course.id} className="bg-surface border border-border rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="text-lg font-bold">{course.name}</h3>
                                  <p className="text-xs text-muted uppercase tracking-wider">{courseTasks.length} pending assignments</p>
                              </div>
                              <button 
                                onClick={() => setIsAddingAssignment(course.id)}
                                className="text-xs flex items-center gap-1 bg-background border border-border px-2 py-1 rounded hover:bg-white/10"
                              >
                                  <Plus size={12}/> Add Assignment
                              </button>
                          </div>

                          {/* Quick Add Assignment Input */}
                          {isAddingAssignment === course.id && (
                              <form onSubmit={(e) => handleAddAssignment(e, course.id)} className="mb-4 flex flex-col gap-2">
                                  <input 
                                      autoFocus
                                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:border-purple-500 outline-none"
                                      placeholder="Assignment title..."
                                      value={newAssignmentTitle}
                                      onChange={e => setNewAssignmentTitle(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                     <input 
                                        type="date"
                                        className="bg-background border border-border rounded px-2 py-1 text-xs text-muted"
                                        value={newAssignmentDate}
                                        onChange={e => setNewAssignmentDate(e.target.value)}
                                     />
                                     <button type="submit" className="text-xs bg-purple-600 text-white px-3 rounded">Add</button>
                                     <button type="button" onClick={() => setIsAddingAssignment(null)} className="text-xs text-muted px-2">Cancel</button>
                                  </div>
                              </form>
                          )}

                          {/* Tasks List within Course */}
                          <div className="space-y-2">
                              {courseTasks.length > 0 ? courseTasks.slice(0, 3).map(t => (
                                  <div key={t.id} className="flex items-center gap-3 p-2 bg-background rounded border border-border/50">
                                      <button 
                                          onClick={() => updateTask({...t, status: TaskStatus.Done})}
                                          className="w-4 h-4 rounded border border-muted hover:border-green-500 hover:bg-green-500/20"
                                      />
                                      <div className="flex-1">
                                          <p className="text-sm">{t.title}</p>
                                          {t.deadline && <p className="text-[10px] text-red-300">Due: {t.deadline}</p>}
                                      </div>
                                      <span className={`text-[10px] px-1.5 rounded ${t.priority === 'High' ? 'bg-red-900/30 text-red-400' : 'bg-gray-800 text-muted'}`}>
                                          {t.priority}
                                      </span>
                                  </div>
                              )) : (
                                  <p className="text-xs text-muted italic p-2">No pending assignments. Great job!</p>
                              )}
                              {courseTasks.length > 3 && (
                                  <p className="text-xs text-center text-muted pt-1">+{courseTasks.length - 3} more</p>
                              )}
                          </div>
                      </div>
                  )
                }) : (
                    <div className="col-span-full p-8 border-2 border-dashed border-border rounded-xl text-center">
                        <BookOpen size={48} className="mx-auto text-muted mb-4 opacity-50" />
                        <p className="text-lg font-medium">No courses yet.</p>
                        <p className="text-muted text-sm mb-4">Add a university subject, online course, or skill you are learning.</p>
                        <button onClick={() => setIsAddingCourse(true)} className="text-purple-400 hover:underline">Add First Course</button>
                    </div>
                )}
            </div>
        )}

        {/* === ASSIGNMENTS & TASKS TAB === */}
        {activeTab === 'assignments' && (
            <div className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CalendarClock className="text-red-400" /> Assignments & Tasks
                    </h2>
                    <div className="space-y-3">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(task => {
                            let daysLeft = 999;
                            if (task.deadline) {
                                daysLeft = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                            }
                            const isUrgent = daysLeft <= 3;
                            const hasDeadline = !!task.deadline;
                            
                            return (
                                <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg border ${isUrgent && hasDeadline ? 'bg-red-900/10 border-red-900/30' : 'bg-background border-border'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded flex flex-col items-center justify-center border ${isUrgent && hasDeadline ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-surface border-border text-muted'}`}>
                                            {hasDeadline ? (
                                                <>
                                                    <span className="text-xs uppercase font-bold">{new Date(task.deadline!).toLocaleString('en-US', {month: 'short'})}</span>
                                                    <span className="text-xl font-bold">{new Date(task.deadline!).getDate()}</span>
                                                </>
                                            ) : <span className="text-xs">-</span>}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{task.title}</h3>
                                            <p className="text-sm text-muted">{eduProjects.find(p => p.id === task.projectId)?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {hasDeadline && (
                                            <span className={`text-sm font-bold ${isUrgent ? 'text-red-400' : 'text-green-400'}`}>
                                                {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                                            </span>
                                        )}
                                        <div className="mt-1">
                                            <button 
                                                onClick={() => updateTask({...task, status: TaskStatus.Done})}
                                                className="text-xs bg-surface border border-border px-2 py-1 rounded hover:bg-white/10"
                                            >
                                                Mark Done
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                             <div className="text-center py-10 text-muted">
                                 <CheckCircle2 className="mx-auto mb-2 opacity-50" size={32} />
                                 <p>No pending assignments or tasks.</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* === STUDY SCHEDULE TAB === */}
        {activeTab === 'schedule' && (
             <div className="space-y-6">
                {dailyAdvice && (
                    <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl flex gap-3">
                        <GraduationCap className="text-purple-400 shrink-0" />
                        <div>
                            <h3 className="font-bold text-purple-200 text-sm mb-1">AI Study Coach</h3>
                            <p className="text-sm text-purple-100/80 italic">"{dailyAdvice}"</p>
                        </div>
                    </div>
                )}
                
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Today's Study Focus</h2>
                    {focusTasks.length > 0 ? (
                        <div className="space-y-4">
                            {focusTasks.map(task => (
                                <div key={task.id} className="bg-background p-4 rounded-lg border border-border flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => updateTask({...task, status: TaskStatus.Done})}
                                            className="w-6 h-6 rounded-full border-2 border-muted hover:border-green-500 hover:bg-green-500/10 transition-colors"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-lg">{task.title}</h3>
                                            <p className="text-sm text-muted">
                                                {eduProjects.find(p => p.id === task.projectId)?.name} • {task.estimatedHours}h
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
                            <p>No study focus generated yet.</p>
                            <button onClick={generatePlan} className="text-purple-400 text-sm mt-2 hover:underline">Generate Study Plan</button>
                        </div>
                    )}
                </div>
             </div>
        )}

      </div>
    </div>
  );
};