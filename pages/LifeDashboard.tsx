
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ScheduleItem, AIProposal, ProjectCategory, TimeOfDay, Habit } from '../types';
import { Sun, CheckCircle2, Clock, Calendar, Plus, Trash2, ArrowRight, Loader2, Sparkles, LayoutGrid, CalendarDays, Moon, Sunset, Coffee, Bell, ListChecks, X, Trophy } from 'lucide-react';
import { parseBrainDump } from '../services/geminiService';
import { ProposalModal } from '../components/ProposalModal';

export const LifeDashboard = () => {
  const { 
    habits, toggleHabit, deleteHabit, addHabit,
    schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem, 
    weeklyGoals, addWeeklyGoal, updateWeeklyGoal, deleteWeeklyGoal,
    applyAIProposal, xp 
  } = useApp();
  
  // View State
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [viewDate, setViewDate] = useState<'today' | 'tomorrow'>('today');
  const [isHabitsMobileOpen, setIsHabitsMobileOpen] = useState(false);

  // Gamification Calc
  const level = Math.floor(Math.sqrt(xp) / 5) + 1;
  const currentLevelBaseXP = Math.pow((level - 1) * 5, 2);
  const nextLevelBaseXP = Math.pow(level * 5, 2);
  const xpNeeded = nextLevelBaseXP - currentLevelBaseXP;
  const xpProgress = xp - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  // Dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const currentDateObj = viewDate === 'today' ? today : tomorrow;
  const dateKey = currentDateObj.toISOString().split('T')[0];
  const displayDate = currentDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Notifications Logic
  useEffect(() => {
    // Check permission
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const interval = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const currentDate = now.toISOString().split('T')[0];

        // Find tasks starting now
        const startingTasks = schedule.filter(s => 
            s.date === currentDate && 
            s.startTime === currentTime && 
            !s.isCompleted
        );

        startingTasks.forEach(task => {
            if (Notification.permission === 'granted') {
                new Notification(`Time for: ${task.title}`, {
                    body: `It's ${task.startTime}. Let's get this done!`,
                    icon: '/favicon.ico'
                });
            }
        });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [schedule]);

  // Helpers for Week View
  const getMonday = (d: Date) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  }
  const currentMonday = getMonday(today);
  const currentMondayStr = currentMonday.toISOString().split('T')[0];
  
  const weekDates = Array.from({length: 7}, (_, i) => {
      const d = new Date(currentMonday);
      d.setDate(d.getDate() + i);
      return d;
  });

  // Filtered Data
  const dailySchedule = schedule
    .filter(s => s.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
  const currentWeeklyGoals = weeklyGoals.filter(g => g.weekStartDate === currentMondayStr);

  // Planning State
  const [brainDump, setBrainDump] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [proposal, setProposal] = useState<AIProposal | null>(null);

  // Manual Add States
  const [isAddingManually, setIsAddingManually] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ScheduleItem>>({ title: '', startTime: '09:00', type: 'Task' });
  const [newWeeklyGoalTitle, setNewWeeklyGoalTitle] = useState('');

  // Edit Habit State
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState<{title: string, time: TimeOfDay}>({ title: '', time: 'Morning'});

  const handleAddHabit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newHabit.title) return;
      addHabit({
          id: crypto.randomUUID(),
          title: newHabit.title,
          timeOfDay: newHabit.time,
          lastCompletedDate: null,
          streak: 0
      });
      setNewHabit({title: '', time: 'Morning'});
      setIsAddingHabit(false);
  }

  const handleOrganizeLife = async () => {
      if (!brainDump.trim()) return;
      setIsPlanning(true);
      const contextDate = dateKey; 
      try {
        const result = await parseBrainDump(brainDump, contextDate);
        if (result) {
            setProposal(result);
            setBrainDump('');
        }
      } catch (e) {
          alert("AI Error. Try again.");
      } finally {
        setIsPlanning(false);
      }
  }

  const handleManualAddSchedule = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItem.title) return;
      addScheduleItem({
          id: crypto.randomUUID(),
          title: newItem.title,
          startTime: newItem.startTime || '09:00',
          endTime: newItem.endTime,
          type: newItem.type as any,
          date: dateKey,
          isCompleted: false,
          description: ''
      });
      setIsAddingManually(false);
      setNewItem({ title: '', startTime: '09:00', type: 'Task' });
  }

  const handleManualAddWeeklyGoal = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newWeeklyGoalTitle.trim()) return;
      addWeeklyGoal({
          id: crypto.randomUUID(),
          weekStartDate: currentMondayStr,
          title: newWeeklyGoalTitle,
          isCompleted: false,
          category: ProjectCategory.Personal // Default
      });
      setNewWeeklyGoalTitle('');
  }

  const HabitGroup = ({ title, icon, time }: { title: string, icon: React.ReactNode, time: TimeOfDay }) => {
      const filtered = habits.filter(h => h.timeOfDay === time);
      if (filtered.length === 0) return null;
      
      return (
          <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                  {icon} {title}
              </h4>
              <div className="space-y-1">
                {filtered.map(habit => {
                      const isDoneToday = habit.lastCompletedDate === new Date().toISOString().split('T')[0];
                      return (
                          <div key={habit.id} className="group relative flex items-center gap-2">
                              <button 
                                  onClick={() => toggleHabit(habit.id)}
                                  className={`flex-1 flex items-center justify-between p-3 md:p-2 rounded-lg border transition-all ${
                                      isDoneToday 
                                      ? 'bg-green-500/10 border-green-500/30 text-green-100' 
                                      : 'bg-background border-border hover:border-primary/50'
                                  }`}
                              >
                                  <span className={`text-sm ${isDoneToday ? 'line-through opacity-70' : ''}`}>{habit.title}</span>
                                  <div className="flex items-center gap-2">
                                      {isDoneToday && <CheckCircle2 size={14} className="text-green-500"/>}
                                      <span className="text-xl md:text-[10px] text-muted">🔥 {habit.streak}</span>
                                  </div>
                              </button>
                              <button 
                                  onClick={() => {
                                      if(confirm('Delete this habit?')) deleteHabit(habit.id)
                                  }}
                                  className="p-2 text-muted hover:text-red-400 bg-surface border border-border rounded-lg"
                                  title="Remove Habit"
                              >
                                  <Trash2 size={16}/>
                              </button>
                          </div>
                      )
                  })}
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      
      {/* MOBILE HEADER (Visible only on small screens) */}
      <div className="md:hidden p-4 border-b border-border bg-surface sticky top-0 z-30 shadow-lg">
          <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                  <h2 className="font-bold text-lg leading-tight">{displayDate}</h2>
                  <span className="text-xs text-muted">Focus Mode</span>
              </div>
              <div className="flex gap-2">
                <button 
                    onClick={() => setIsHabitsMobileOpen(true)}
                    className="p-2 bg-surface border border-border text-text rounded-lg hover:bg-white/5"
                >
                    <ListChecks size={20} />
                </button>
                <button 
                    onClick={() => setIsAddingManually(true)} 
                    className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20"
                >
                    <Plus size={20}/>
                </button>
              </div>
          </div>
          {/* Mobile Gamification Bar */}
          <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 border border-yellow-500/30">
                   <Trophy size={14} />
               </div>
               <div className="flex-1">
                    <div className="flex justify-between text-[10px] text-muted mb-1 font-bold uppercase">
                        <span>Lvl {level}</span>
                        <span>{Math.floor(xpProgress)} / {Math.floor(xpNeeded)} XP</span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                        <div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full" 
                            style={{ width: `${progressPercent}%` }} 
                        />
                    </div>
               </div>
          </div>
      </div>

      {/* LEFT COLUMN: Routine & Planning (Desktop) */}
      <div className="hidden md:flex w-80 border-r border-border bg-surface p-6 flex-col overflow-y-auto">
          <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sun className="text-yellow-500" />
              Daily Routine
          </h1>

          {/* Habits Section */}
          <div className="mb-8 flex-1">
              <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Habit Tracker</h3>
                  <button onClick={() => setIsAddingHabit(true)} className="text-xs text-primary hover:underline">+ Add</button>
              </div>
              
              <HabitGroup title="Morning" icon={<Coffee size={14} className="text-orange-400"/>} time="Morning" />
              <HabitGroup title="Afternoon" icon={<Sun size={14} className="text-yellow-400"/>} time="Afternoon" />
              <HabitGroup title="Evening" icon={<Sunset size={14} className="text-purple-400"/>} time="Evening" />
              <HabitGroup title="Anytime" icon={<CheckCircle2 size={14} className="text-blue-400"/>} time="Anytime" />
              
              {habits.length === 0 && <p className="text-xs text-muted italic">No habits set.</p>}
          </div>

          {/* Life Organizer Widget */}
          <div className="mt-auto bg-background p-4 rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
                  <Sparkles size={14} />
                  Organize Everything
              </h3>
              <p className="text-xs text-muted mb-2">Tell AI about projects, tasks, or your schedule for <span className="text-primary font-bold uppercase">{viewDate}</span>.</p>
              <textarea 
                  className="w-full bg-surface border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-accent mb-3 h-24 resize-none"
                  placeholder={`"Add a dentist appointment at 2pm..."`}
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
              />
              <button 
                  onClick={handleOrganizeLife}
                  disabled={isPlanning || !brainDump.trim()}
                  className="w-full py-2 bg-gradient-to-r from-accent to-purple-600 hover:opacity-90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                  {isPlanning ? <Loader2 className="animate-spin" size={16}/> : "Analyze & Organize"}
              </button>
          </div>
      </div>

      {/* CENTER: Main Content (Timeline) */}
      <div className="flex-1 flex flex-col bg-background relative h-full">
          
          {/* Desktop Header */}
          <div className="hidden md:flex p-6 border-b border-border justify-between items-center bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                  <div className="flex bg-surface rounded-lg p-1 border border-border">
                      <button onClick={() => setViewMode('day')} className={`p-2 rounded ${viewMode === 'day' ? 'bg-primary text-white' : 'text-muted'}`}><Clock size={20} /></button>
                      <button onClick={() => setViewMode('week')} className={`p-2 rounded ${viewMode === 'week' ? 'bg-primary text-white' : 'text-muted'}`}><CalendarDays size={20} /></button>
                  </div>
                  {viewMode === 'day' ? (
                      <div><h2 className="text-2xl font-bold text-white">{displayDate}</h2></div>
                  ) : (
                      <div><h2 className="text-2xl font-bold text-white">Weekly Plan</h2></div>
                  )}
              </div>
              {viewMode === 'day' && (
                  <div className="flex bg-surface rounded-lg p-1 border border-border">
                      <button onClick={() => setViewDate('today')} className={`px-4 py-1.5 rounded text-sm font-medium ${viewDate === 'today' ? 'bg-primary text-white' : 'text-muted'}`}>Today</button>
                      <button onClick={() => setViewDate('tomorrow')} className={`px-4 py-1.5 rounded text-sm font-medium ${viewDate === 'tomorrow' ? 'bg-primary text-white' : 'text-muted'}`}>Tomorrow</button>
                  </div>
              )}
          </div>

          {/* VIEW CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
              
              {/* === DAY VIEW === */}
              {viewMode === 'day' && (
                  <div className="relative pb-32 md:pb-0">
                       {/* Vertical Line - stops short of bottom to avoid overlap issues visually on mobile */}
                       <div className="absolute left-[4.5rem] md:left-[8.5rem] top-0 bottom-32 md:bottom-0 w-px bg-border block z-0" />

                       <div className="space-y-6 max-w-3xl relative z-10">
                           {/* Add Button Inline */}
                           <div className="flex justify-end mb-4 md:hidden">
                               <button 
                                  onClick={() => setIsAddingManually(true)}
                                  className="text-xs flex items-center gap-1 bg-surface border border-border px-3 py-1.5 rounded-full"
                               >
                                   <Plus size={14} /> Add Event
                               </button>
                           </div>

                           {dailySchedule.map((item) => (
                               <div key={item.id} className="flex gap-4 md:gap-6 group relative">
                                   {/* Time Column */}
                                   <div className="w-16 md:w-24 text-right pt-2 flex flex-col items-end shrink-0">
                                       <span className="text-base md:text-lg font-mono font-medium text-white">{item.startTime}</span>
                                       {item.endTime && <span className="text-[10px] md:text-xs text-muted">{item.endTime}</span>}
                                   </div>

                                   {/* Node on Line */}
                                   <div className="absolute left-[4.5rem] md:left-[8.5rem] -ml-1.5 mt-3 w-3 h-3 rounded-full border-2 border-background z-10 bg-primary shadow-sm" />

                                   {/* Content Card */}
                                   <div className={`flex-1 p-3 md:p-4 rounded-xl border transition-all ${
                                       item.isCompleted 
                                       ? 'bg-surface/50 border-border opacity-60' 
                                       : 'bg-surface border-border hover:border-primary/50 shadow-md'
                                   }`}>
                                       <div className="flex justify-between items-start">
                                           <div>
                                               <h4 className={`font-semibold text-base md:text-lg ${item.isCompleted ? 'line-through decoration-muted' : 'text-white'}`}>
                                                   {item.title}
                                               </h4>
                                               <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 md:mt-2 ${
                                                   item.type === 'Routine' ? 'bg-yellow-500/20 text-yellow-400' :
                                                   item.type === 'Appointment' ? 'bg-purple-500/20 text-purple-400' :
                                                   item.type === 'Work' ? 'bg-blue-500/20 text-blue-400' :
                                                   'bg-gray-500/20 text-gray-400'
                                               }`}>
                                                   {item.type}
                                               </span>
                                           </div>
                                           <div className="flex items-center gap-2">
                                               <button 
                                                   onClick={() => updateScheduleItem({...item, isCompleted: !item.isCompleted})}
                                                   className={`p-2 rounded-lg transition-colors ${item.isCompleted ? 'text-green-400 bg-green-900/20' : 'text-muted hover:bg-white/10'}`}
                                               >
                                                   <CheckCircle2 size={18} />
                                               </button>
                                               <button 
                                                   onClick={() => deleteScheduleItem(item.id)}
                                                   className="p-2 text-muted hover:text-red-400 hover:bg-red-900/20 rounded-lg hidden group-hover:block transition-all"
                                               >
                                                   <Trash2 size={18} />
                                               </button>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           ))}

                           {/* Empty State */}
                           {dailySchedule.length === 0 && (
                               <div className="flex flex-col items-center justify-center py-20 text-muted border-2 border-dashed border-border rounded-xl bg-surface/30">
                                   <Clock size={48} className="mb-4 opacity-50" />
                                   <p className="text-lg">No schedule for {viewDate}.</p>
                                   <p className="text-sm">Use the analyzer or add manually.</p>
                                   <button 
                                      onClick={() => setIsAddingManually(true)}
                                      className="mt-4 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg text-sm"
                                   >
                                       Add Item
                                   </button>
                               </div>
                           )}

                           {/* Mobile Chat Widget (At bottom of flow) - With Z-Index and BG to cover line */}
                           <div className="md:hidden mt-8 bg-surface p-4 rounded-xl border border-border relative z-20 shadow-xl">
                                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Sparkles size={14} className="text-accent" />
                                    Ask AI to Organize
                                </h3>
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm"
                                        placeholder="Add gym at 5pm..."
                                        value={brainDump}
                                        onChange={(e) => setBrainDump(e.target.value)}
                                    />
                                    <button onClick={handleOrganizeLife} disabled={isPlanning} className="bg-primary text-white p-2 rounded">
                                        {isPlanning ? <Loader2 className="animate-spin" size={16}/> : <ArrowRight size={16}/>}
                                    </button>
                                </div>
                           </div>
                       </div>
                  </div>
              )}

              {/* === WEEK VIEW (Simplified) === */}
              {viewMode === 'week' && (
                  <div className="space-y-8">
                       {/* Week view content same as before, essentially */}
                       <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                          {weekDates.map((date, i) => {
                              const dKey = date.toISOString().split('T')[0];
                              const daySchedule = schedule.filter(s => s.date === dKey).sort((a,b) => a.startTime.localeCompare(b.startTime));
                              const isToday = dKey === new Date().toISOString().split('T')[0];

                              return (
                                  <div key={i} className={`flex flex-col h-[200px] md:h-[400px] rounded-xl border ${isToday ? 'border-primary bg-primary/5' : 'border-border bg-surface/30'}`}>
                                      <div className={`p-3 border-b ${isToday ? 'border-primary/30' : 'border-border'}`}>
                                          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                          <p className={`text-xl font-bold ${isToday ? 'text-primary' : ''}`}>{date.getDate()}</p>
                                      </div>
                                      <div className="flex-1 p-2 overflow-y-auto space-y-2">
                                          {daySchedule.map(s => (
                                              <div key={s.id} className="text-[10px] p-2 bg-background rounded border border-border truncate" title={s.title}>
                                                  <span className="font-mono opacity-70 block mb-0.5">{s.startTime}</span>
                                                  {s.title}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Manual Add Schedule Modal */}
      {isAddingManually && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold mb-4">Add to Schedule ({viewDate})</h3>
                  <form onSubmit={handleManualAddSchedule} className="space-y-4">
                      <div>
                          <label className="block text-xs font-medium text-muted uppercase mb-1">Title</label>
                          <input 
                              autoFocus
                              type="text" 
                              className="w-full bg-background border border-border rounded p-2 focus:outline-none focus:border-primary"
                              placeholder="e.g., Dentist Appointment"
                              value={newItem.title}
                              onChange={e => setNewItem({...newItem, title: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-muted uppercase mb-1">Start Time</label>
                              <input 
                                  type="time" 
                                  className="w-full bg-background border border-border rounded p-2 focus:outline-none focus:border-primary [color-scheme:dark]"
                                  value={newItem.startTime}
                                  onChange={e => setNewItem({...newItem, startTime: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-muted uppercase mb-1">End Time</label>
                              <input 
                                  type="time" 
                                  className="w-full bg-background border border-border rounded p-2 focus:outline-none focus:border-primary [color-scheme:dark]"
                                  value={newItem.endTime || ''}
                                  onChange={e => setNewItem({...newItem, endTime: e.target.value})}
                              />
                          </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button type="button" onClick={() => setIsAddingManually(false)} className="px-4 py-2 rounded hover:bg-white/10 text-sm">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-primary hover:bg-blue-600 rounded text-sm font-medium text-white">Add Item</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Manual Add Habit Modal */}
      {isAddingHabit && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">Add Habit</h3>
                  <form onSubmit={handleAddHabit} className="space-y-4">
                      <input 
                          type="text" 
                          placeholder="Habit Title"
                          className="w-full bg-background border border-border rounded p-2 focus:border-primary focus:outline-none"
                          value={newHabit.title}
                          onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                      />
                      <select 
                          value={newHabit.time}
                          onChange={e => setNewHabit({...newHabit, time: e.target.value as any})}
                          className="w-full bg-background border border-border rounded p-2"
                      >
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                          <option value="Anytime">Anytime</option>
                      </select>
                      <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setIsAddingHabit(false)} className="px-3 py-2 text-sm">Cancel</button>
                          <button type="submit" className="px-3 py-2 bg-primary text-white rounded text-sm">Save</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Mobile Habits Overlay */}
      {isHabitsMobileOpen && (
        <div className="fixed inset-0 bg-surface z-50 flex flex-col p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ListChecks size={24} className="text-primary"/>
                    Your Routine
                </h2>
                <button onClick={() => setIsHabitsMobileOpen(false)} className="p-2 bg-background border border-border rounded-full">
                    <X size={20}/>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                <div className="mb-4">
                    <button 
                        onClick={() => { setIsHabitsMobileOpen(false); setIsAddingHabit(true); }}
                        className="w-full py-3 bg-primary/10 border border-primary/20 text-primary rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                        <Plus size={18}/> Add New Habit
                    </button>
                </div>
                <HabitGroup title="Morning" icon={<Coffee size={14} className="text-orange-400"/>} time="Morning" />
                <HabitGroup title="Afternoon" icon={<Sun size={14} className="text-yellow-400"/>} time="Afternoon" />
                <HabitGroup title="Evening" icon={<Sunset size={14} className="text-purple-400"/>} time="Evening" />
                <HabitGroup title="Anytime" icon={<CheckCircle2 size={14} className="text-blue-400"/>} time="Anytime" />
                {habits.length === 0 && <p className="text-center text-muted mt-10">No habits tracked yet.</p>}
            </div>
        </div>
      )}

      {/* AI Proposal Modal (Editable) */}
      <ProposalModal 
          isOpen={!!proposal}
          proposal={proposal}
          onClose={() => setProposal(null)}
          onConfirm={(edited) => {
              applyAIProposal(edited);
              setProposal(null);
          }}
      />
    </div>
  );
};
