
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle, X, CheckCircle2, Plus } from 'lucide-react';
import { ProjectCategory, ScheduleItem } from '../types';

export const UnifiedCalendar = () => {
  const { tasks, schedule, projects, addScheduleItem, updateScheduleItem } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modal State for adding new item
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemTime, setNewItemTime] = useState('09:00');

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
      const day = new Date(year, month, 1).getDay();
      return day === 0 ? 6 : day - 1; // Adjust to make Monday start (0=Mon, 6=Sun)
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Aggregate Items
  const getItemsForDay = (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(dateStr));
      const daySchedule = schedule.filter(s => s.date === dateStr);
      return { tasks: dayTasks, schedule: daySchedule, dateStr };
  };

  const handleCellClick = (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateStr);
  }

  const handleAddScheduleItem = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedDate || !newItemTitle.trim()) return;

      addScheduleItem({
          id: crypto.randomUUID(),
          title: newItemTitle,
          startTime: newItemTime,
          type: 'Task',
          date: selectedDate,
          isCompleted: false,
          description: ''
      });
      setNewItemTitle('');
      setNewItemTime('09:00');
  }

  const renderCells = () => {
      const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="h-24 md:h-32 bg-surface/30 border-r border-b border-border"></div>);
      const days = Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const { tasks: cellTasks, schedule: cellSchedule } = getItemsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
              <div 
                  key={day} 
                  onClick={() => handleCellClick(day)}
                  className={`h-24 md:h-32 border-r border-b border-border p-2 overflow-hidden hover:bg-white/5 transition-colors group relative cursor-pointer ${isToday ? 'bg-primary/5' : ''}`}
              >
                  <span className={`text-sm font-bold ${isToday ? 'text-primary bg-primary/20 px-2 py-0.5 rounded-full' : 'text-muted'}`}>{day}</span>
                  
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80%] pr-1 custom-scrollbar pointer-events-none">
                      {/* Deadlines */}
                      {cellTasks.map(t => {
                          const project = projects.find(p => p.id === t.projectId);
                          const colorClass = project?.category === ProjectCategory.Work ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                           project?.category === ProjectCategory.Education ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                           'bg-pink-500/20 text-pink-300 border-pink-500/30';
                          return (
                              <div key={t.id} className={`text-[10px] px-1.5 py-0.5 rounded border truncate flex items-center gap-1 ${colorClass}`}>
                                  <AlertCircle size={8} /> {t.title}
                              </div>
                          )
                      })}

                      {/* Schedule */}
                      {cellSchedule.map(s => (
                          <div key={s.id} className="text-[10px] text-muted truncate flex items-center gap-1 px-1">
                              <span className="text-gray-500 font-mono text-[9px]">{s.startTime}</span> {s.title}
                          </div>
                      ))}
                  </div>
              </div>
          );
      });

      return [...blanks, ...days];
  };

  // Details Modal Content
  const selectedDayItems = selectedDate ? (() => {
      const [y, m, d] = selectedDate.split('-').map(Number);
      // Re-filter here to ensure we have fresh state if updated
      const dayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(selectedDate));
      const daySchedule = schedule.filter(s => s.date === selectedDate).sort((a,b) => a.startTime.localeCompare(b.startTime));
      return { dayTasks, daySchedule, displayDate: new Date(y, m-1, d).toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'}) };
  })() : null;

  return (
    <div className="flex flex-col h-full bg-background text-text p-4 md:p-8">
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <CalendarIcon className="text-accent" /> Master Calendar
            </h1>
            <div className="flex items-center gap-4">
                <button onClick={goToToday} className="text-sm font-medium hover:text-primary">Today</button>
                <div className="flex items-center bg-surface border border-border rounded-lg">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-l-lg"><ChevronLeft size={20}/></button>
                    <span className="px-4 font-bold w-32 text-center hidden md:block">{monthNames[month]} {year}</span>
                    <span className="px-4 font-bold w-20 text-center md:hidden">{monthNames[month].slice(0,3)}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-r-lg"><ChevronRight size={20}/></button>
                </div>
            </div>
        </header>

        <div className="flex-1 border border-border rounded-xl bg-surface overflow-hidden flex flex-col">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-surface border-b border-border">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="p-2 text-center text-xs font-bold text-muted uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                {renderCells()}
            </div>
        </div>

        {/* DAY DETAILS MODAL */}
        {selectedDate && selectedDayItems && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-surface sticky top-0">
                        <h3 className="text-xl font-bold">{selectedDayItems.displayDate}</h3>
                        <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-white/10 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-6">
                        {/* Deadlines Section */}
                        {selectedDayItems.dayTasks.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <AlertCircle size={14}/> Deadlines Due
                                </h4>
                                <div className="space-y-2">
                                    {selectedDayItems.dayTasks.map(t => (
                                        <div key={t.id} className="p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                                            <p className="font-medium text-sm">{t.title}</p>
                                            <p className="text-xs text-muted">{projects.find(p => p.id === t.projectId)?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Schedule Section */}
                        <div>
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Clock size={14}/> Schedule
                            </h4>
                            <div className="space-y-2">
                                {selectedDayItems.daySchedule.map(s => (
                                    <div key={s.id} className="flex gap-3 items-center p-2 rounded hover:bg-white/5 group">
                                        <span className="font-mono text-sm text-muted w-10 shrink-0">{s.startTime}</span>
                                        <span className={`text-sm flex-1 ${s.isCompleted ? 'line-through text-muted' : ''}`}>{s.title}</span>
                                        <button 
                                            onClick={() => updateScheduleItem({...s, isCompleted: !s.isCompleted})}
                                            className={`p-1 rounded ${s.isCompleted ? 'text-green-400' : 'text-muted hover:text-white'}`}
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {selectedDayItems.daySchedule.length === 0 && (
                                    <p className="text-sm text-muted italic">Nothing scheduled.</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Add */}
                        <div className="pt-4 border-t border-border">
                            <h4 className="text-xs font-bold text-muted uppercase mb-2">Add Item</h4>
                            <form onSubmit={handleAddScheduleItem} className="flex gap-2">
                                <input 
                                    type="time" 
                                    className="bg-background border border-border rounded px-2 py-2 text-sm focus:outline-none"
                                    value={newItemTime}
                                    onChange={e => setNewItemTime(e.target.value)}
                                />
                                <input 
                                    className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                    placeholder="New Event..."
                                    value={newItemTitle}
                                    onChange={e => setNewItemTitle(e.target.value)}
                                />
                                <button type="submit" className="bg-primary text-white p-2 rounded">
                                    <Plus size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
