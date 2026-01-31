import React, { useState, useEffect } from 'react';
import { AIProposal, ProjectCategory, ScheduleItem } from '../types';
import { Check, X, CalendarClock, Target, Plus, Trash2, Save } from 'lucide-react';

interface ProposalModalProps {
  proposal: AIProposal | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (editedProposal: AIProposal) => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({ proposal, isOpen, onClose, onConfirm }) => {
  const [editedProposal, setEditedProposal] = useState<AIProposal | null>(null);

  useEffect(() => {
    if (proposal) {
        // Deep copy to avoid reference issues
        setEditedProposal(JSON.parse(JSON.stringify(proposal)));
    }
  }, [proposal]);

  if (!isOpen || !editedProposal) return null;

  const handleScheduleChange = (index: number, field: keyof typeof editedProposal.schedule[0], value: string) => {
      if(!editedProposal) return;
      const newSchedule = [...editedProposal.schedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      setEditedProposal({ ...editedProposal, schedule: newSchedule });
  };

  const deleteScheduleItem = (index: number) => {
      if(!editedProposal) return;
      const newSchedule = editedProposal.schedule.filter((_, i) => i !== index);
      setEditedProposal({ ...editedProposal, schedule: newSchedule });
  }

  const addScheduleItem = () => {
      if(!editedProposal) return;
      // Default to "today" context if exists, or random
      const defaultDate = editedProposal.schedule.length > 0 ? editedProposal.schedule[0].date : new Date().toISOString().split('T')[0];
      setEditedProposal({
          ...editedProposal,
          schedule: [
              ...editedProposal.schedule, 
              { title: "New Task", startTime: "09:00", endTime: "10:00", type: "Task", date: defaultDate }
          ]
      })
  }

  const handleHabitChange = (index: number, field: 'title' | 'timeOfDay', value: string) => {
      const newHabits = [...editedProposal.habits];
      newHabits[index] = { ...newHabits[index], [field]: value };
      setEditedProposal({...editedProposal, habits: newHabits});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-xl font-bold text-white">Review & Edit Plan</h2>
            <p className="text-xs text-muted hidden sm:block">AI generated a plan. Tweak it before saving.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-8 flex-1">
          {/* Summary */}
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <h3 className="text-primary font-semibold mb-2">AI Summary</h3>
            <p className="text-text/90 text-sm leading-relaxed">{editedProposal.summary}</p>
          </div>

          {/* EDITABLE SCHEDULE */}
          <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                    <CalendarClock size={18} />
                    Proposed Schedule
                </h3>
                <button onClick={addScheduleItem} className="text-xs flex items-center gap-1 bg-background border border-border px-2 py-1 rounded hover:bg-white/5">
                    <Plus size={12} /> Add Item
                </button>
              </div>
              
              <div className="space-y-2">
                  {editedProposal.schedule.map((s, i) => (
                      <div key={i} className="bg-background border border-border p-2 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
                          <input 
                              type="time" 
                              className="bg-surface border border-border rounded px-2 py-1 text-sm font-mono focus:border-primary focus:outline-none w-24"
                              value={s.startTime}
                              onChange={(e) => handleScheduleChange(i, 'startTime', e.target.value)}
                          />
                          <input 
                              type="text" 
                              className="flex-1 bg-surface border border-border rounded px-2 py-1 text-sm focus:border-primary focus:outline-none"
                              value={s.title}
                              onChange={(e) => handleScheduleChange(i, 'title', e.target.value)}
                          />
                          <input 
                              type="date" 
                              className="bg-surface border border-border rounded px-2 py-1 text-xs text-muted w-28"
                              value={s.date}
                              onChange={(e) => handleScheduleChange(i, 'date', e.target.value)}
                          />
                          <select 
                             className="bg-surface border border-border rounded px-2 py-1 text-xs uppercase"
                             value={s.type}
                             onChange={(e) => handleScheduleChange(i, 'type', e.target.value)}
                          >
                              <option value="Task">Task</option>
                              <option value="Routine">Routine</option>
                              <option value="Work">Work</option>
                              <option value="Appointment">Appt</option>
                          </select>
                          <button onClick={() => deleteScheduleItem(i)} className="text-muted hover:text-red-400 p-1">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
                  {editedProposal.schedule.length === 0 && <p className="text-xs text-muted italic">No schedule items proposed.</p>}
              </div>
          </div>

          {/* EDITABLE HABITS */}
          {editedProposal.habits && editedProposal.habits.length > 0 && (
              <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-400">New Daily Habits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {editedProposal.habits.map((h, i) => (
                          <div key={i} className="flex gap-2 items-center bg-background border border-border p-2 rounded">
                              <input 
                                  value={h.title}
                                  onChange={(e) => handleHabitChange(i, 'title', e.target.value)}
                                  className="flex-1 bg-transparent text-sm focus:outline-none"
                              />
                              <select 
                                  value={h.timeOfDay}
                                  onChange={(e) => handleHabitChange(i, 'timeOfDay', e.target.value)}
                                  className="bg-surface text-[10px] uppercase rounded px-1 py-0.5 border border-border"
                              >
                                  <option value="Morning">Morning</option>
                                  <option value="Afternoon">Afternoon</option>
                                  <option value="Evening">Evening</option>
                                  <option value="Anytime">Anytime</option>
                              </select>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Projects & Tasks (Simplified Read/Delete for now, complex to fully edit in modal) */}
          {editedProposal.projects.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="bg-accent/20 text-accent px-2 py-0.5 rounded text-xs">NEW</span> Projects & Tasks
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {editedProposal.projects.map((p, idx) => (
                  <div key={idx} className="bg-background border border-border p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white">{p.name}</h4>
                    </div>
                    <p className="text-xs text-muted mt-1 mb-2 uppercase tracking-wider">{p.status}</p>
                    <div className="pl-2 border-l-2 border-border mt-2">
                        {editedProposal.tasks.filter(t => t.projectName === p.name).map((t, ti) => (
                            <p key={ti} className="text-xs text-gray-400 py-0.5">• {t.title}</p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-surface flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(editedProposal)}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-medium flex items-center gap-2"
          >
            <Check size={16} />
            Accept Plan
          </button>
        </div>
      </div>
    </div>
  );
};
