import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, Project, Goal, KPI, Task, Subtask, AIProposal, Habit, ProjectCategory, ScheduleItem, WeeklyGoal, TimeOfDay, TaskStatus, UserRole, StrategicPlan, Achievement } from '../types';
import { supabase, mapProjectToDB, mapProjectFromDB, mapTaskToDB, mapTaskFromDB, mapSubtaskToDB, mapSubtaskFromDB, mapGoalToDB, mapGoalFromDB, mapKPIToDB, mapKPIFromDB, mapHabitToDB, mapHabitFromDB, mapScheduleToDB, mapScheduleFromDB, mapWeeklyGoalToDB, mapWeeklyGoalFromDB, mapStrategicPlanToDB, mapStrategicPlanFromDB, fetchProfileWithRetry } from '../services/supabase';
import { User } from '@supabase/supabase-js';

// --- GAMIFICATION DEFINITIONS ---
export const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'first_step', title: 'First Step', description: 'Complete your first task', icon: 'CheckSquare', unlockedAt: null },
    { id: 'task_master', title: 'Task Master', description: 'Complete 10 tasks', icon: 'Trophy', unlockedAt: null },
    { id: 'momentum', title: 'Momentum', description: 'Reach a 3-day habit streak', icon: 'Flame', unlockedAt: null },
    { id: 'strategist', title: 'Strategist', description: 'Create a Strategic Plan', icon: 'Map', unlockedAt: null },
    { id: 'visionary', title: 'Visionary', description: 'Create 3 Projects', icon: 'Lightbulb', unlockedAt: null },
    { id: 'high_performer', title: 'High Performer', description: 'Complete a High Priority Task', icon: 'Zap', unlockedAt: null }
];

export const getRank = (level: number) => {
    if (level < 5) return "Aspiring Founder";
    if (level < 10) return "Indie Hacker";
    if (level < 20) return "Bootstrapper";
    if (level < 35) return "Series A Founder";
    if (level < 50) return "Unicorn Hunter";
    return "Titan of Industry";
};

interface AppContextType extends AppState {
  user: User | null;
  userRole: UserRole;
  isLoading: boolean;
  logout: () => void;
  
  completeOnboarding: () => void;

  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;

  addSubtask: (subtask: Subtask) => void;
  toggleSubtask: (id: string) => void;
  deleteSubtask: (id: string) => void;
  
  addGoal: (goal: Goal) => void;
  addKPI: (kpi: KPI) => void;
  updateKPI: (kpi: KPI) => void;
  deleteKPI: (id: string) => void;
  
  addHabit: (habit: Habit) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  updateHabit: (habit: Habit) => void;

  addScheduleItem: (item: ScheduleItem) => void;
  updateScheduleItem: (item: ScheduleItem) => void;
  deleteScheduleItem: (id: string) => void;
  addScheduleItems: (items: ScheduleItem[]) => void;

  addWeeklyGoal: (goal: WeeklyGoal) => void;
  updateWeeklyGoal: (goal: WeeklyGoal) => void;
  deleteWeeklyGoal: (id: string) => void;

  addStrategicPlan: (plan: StrategicPlan) => void;
  updateStrategicPlan: (plan: StrategicPlan) => void;
  deleteStrategicPlan: (id: string) => void;

  applyAIProposal: (proposal: AIProposal) => void;
  resetData: () => void;
  syncLocalToRemote: () => Promise<void>;
  
  // Helpers
  checkAchievements: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'founder_focus_data_v6';
const XP_HABIT = 10;
const XP_SCHEDULE = 20;
const XP_TASK = 50;
const XP_SUBTASK = 10;
const XP_PLAN_COMPLETE = 500;

const generateDefaults = (): AppState => {
  return {
    xp: 0,
    onboardingCompleted: false,
    projects: [],
    goals: [],
    kpis: [],
    tasks: [],
    subtasks: [],
    weeklyGoals: [],
    habits: [],
    schedule: [],
    strategicPlans: [],
    achievements: []
  };
};

const initialState: AppState = {
  xp: 0,
  onboardingCompleted: false,
  projects: [],
  goals: [],
  kpis: [],
  tasks: [],
  subtasks: [],
  habits: [],
  schedule: [],
  weeklyGoals: [],
  strategicPlans: [],
  achievements: []
};

// Helper to get the Monday of the current week for a given date
const getMonday = (d: Date) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check Auth & Fetch Data
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRemoteData(session.user);
      } else {
        loadLocalData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRemoteData(session.user);
      } else {
        loadLocalData();
        setUserRole('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load from LocalStorage (Fallback)
  const loadLocalData = () => {
    setIsLoading(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration logic for habits
        const migratedHabits = (parsed.habits || []).map((h: any) => ({
             ...h,
             timeOfDay: h.timeOfDay || 'Anytime'
        }));
        setState({ 
            ...initialState, 
            ...parsed, 
            xp: parsed.xp || 0, 
            habits: migratedHabits, 
            onboardingCompleted: parsed.onboardingCompleted ?? false,
            achievements: parsed.achievements || []
        });
      } catch (e) {
        console.error("Failed to load local state", e);
      }
    } else {
        setState(generateDefaults());
    }
    setIsLoading(false);
  }

  // 3. Fetch from Supabase
  const fetchRemoteData = async (currentUser: User) => {
    setIsLoading(true);
    const userId = currentUser.id;
    try {
        const [p, t, st, g, k, h, s, wg, sp] = await Promise.all([
            supabase.from('projects').select('*'),
            supabase.from('tasks').select('*'),
            supabase.from('subtasks').select('*'),
            supabase.from('goals').select('*'),
            supabase.from('kpis').select('*'),
            supabase.from('habits').select('*'),
            supabase.from('schedule').select('*'),
            supabase.from('weekly_goals').select('*'),
            supabase.from('strategic_plans').select('*')
        ]);

        if (p.error && p.error.message.includes('relation "projects" does not exist')) {
            alert("Database Error: Tables not found. Please run the schema.sql in your Supabase SQL Editor.");
            return;
        }

        const profileData = await fetchProfileWithRetry(userId);
        
        if (currentUser.email === 'admin@gmail.com' && profileData?.role !== 'admin') {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
            setUserRole('admin');
        } else if (profileData?.role) {
            setUserRole(profileData.role as UserRole);
        }

        setState({
            projects: (p.data || []).map(mapProjectFromDB),
            tasks: (t.data || []).map(mapTaskFromDB),
            subtasks: (st.data || []).map(mapSubtaskFromDB),
            goals: (g.data || []).map(mapGoalFromDB),
            kpis: (k.data || []).map(mapKPIFromDB),
            habits: (h.data || []).map(mapHabitFromDB),
            schedule: (s.data || []).map(mapScheduleFromDB),
            weeklyGoals: (wg.data || []).map(mapWeeklyGoalFromDB),
            strategicPlans: (sp.data || []).map(mapStrategicPlanFromDB),
            xp: profileData?.xp || 0,
            onboardingCompleted: profileData?.onboarding_completed || false,
            achievements: profileData?.unlocked_achievements || []
        });
    } catch (e) {
        console.error("Supabase fetch error", e);
    } finally {
        setIsLoading(false);
    }
  }

  // 4. Save to LocalStorage
  useEffect(() => {
    if (!isLoading) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  // --- XP Handler & Gamification ---
  const addXP = async (amount: number) => {
      const newXP = Math.max(0, state.xp + amount);
      setState(prev => ({ ...prev, xp: newXP }));
      if (user) {
          await supabase.from('profiles').upsert({ id: user.id, xp: newXP });
      }
      // Check achievements after XP change (and implicitly after action)
      checkAchievements();
  }

  const checkAchievements = async () => {
      // We operate on current state, but React state updates are async, so we might need a small delay or check against 'prev' in a useEffect.
      // For simplicity, we'll assume state is mostly up to date or we pass data in.
      // Actually, let's derive data from current state snapshot in setTimeout to let render cycle finish
      
      setTimeout(async () => {
          let newUnlocked: string[] = [];
          const currentUnlocked = new Set(state.achievements);

          const totalTasksDone = state.tasks.filter(t => t.status === TaskStatus.Done).length;
          
          if (totalTasksDone >= 1 && !currentUnlocked.has('first_step')) newUnlocked.push('first_step');
          if (totalTasksDone >= 10 && !currentUnlocked.has('task_master')) newUnlocked.push('task_master');
          if (state.habits.some(h => h.streak >= 3) && !currentUnlocked.has('momentum')) newUnlocked.push('momentum');
          if (state.strategicPlans.length > 0 && !currentUnlocked.has('strategist')) newUnlocked.push('strategist');
          if (state.projects.length >= 3 && !currentUnlocked.has('visionary')) newUnlocked.push('visionary');
          if (state.tasks.some(t => t.status === TaskStatus.Done && t.priority === 'High') && !currentUnlocked.has('high_performer')) newUnlocked.push('high_performer');

          if (newUnlocked.length > 0) {
              const updatedList = [...state.achievements, ...newUnlocked];
              setState(prev => ({ ...prev, achievements: updatedList }));
              
              if (user) {
                  await supabase.from('profiles').update({ unlocked_achievements: updatedList }).eq('id', user.id);
              }
              // Simple notification
              // alert(`Achievement Unlocked: ${newUnlocked.join(', ')}`); // Removed alert to be less intrusive, assume UI handles it
          }
      }, 500);
  }

  const logout = async () => {
      await supabase.auth.signOut();
      setState(generateDefaults());
      setUserRole('user');
  };

  const syncLocalToRemote = async () => {
      if (!user) return;
      if (!confirm("This will overwrite your cloud data with current local data. Continue?")) return;
      
      const { projects, tasks, subtasks, goals, kpis, habits, schedule, weeklyGoals, strategicPlans, xp, onboardingCompleted, achievements } = state;
      
      await Promise.all([
          ...projects.map(x => supabase.from('projects').upsert(mapProjectToDB(x, user.id))),
          ...tasks.map(x => supabase.from('tasks').upsert(mapTaskToDB(x, user.id))),
          ...subtasks.map(x => supabase.from('subtasks').upsert(mapSubtaskToDB(x, user.id))),
          ...goals.map(x => supabase.from('goals').upsert(mapGoalToDB(x, user.id))),
          ...kpis.map(x => supabase.from('kpis').upsert(mapKPIToDB(x, user.id))),
          ...habits.map(x => supabase.from('habits').upsert(mapHabitToDB(x, user.id))),
          ...schedule.map(x => supabase.from('schedule').upsert(mapScheduleToDB(x, user.id))),
          ...weeklyGoals.map(x => supabase.from('weekly_goals').upsert(mapWeeklyGoalToDB(x, user.id))),
          ...strategicPlans.map(x => supabase.from('strategic_plans').upsert(mapStrategicPlanToDB(x, user.id))),
          supabase.from('profiles').upsert({ id: user.id, xp, onboarding_completed: onboardingCompleted, unlocked_achievements: achievements })
      ]);
      alert("Sync complete!");
  }

  const completeOnboarding = async () => {
      setState(prev => ({ ...prev, onboardingCompleted: true }));
      if (user) {
          await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      }
  }

  // --- Modifiers ---

  const addProject = async (project: Project) => {
    setState(prev => ({ ...prev, projects: [...prev.projects, project] }));
    if (user) await supabase.from('projects').insert(mapProjectToDB(project, user.id));
    checkAchievements();
  };

  const updateProject = async (project: Project) => {
    setState(prev => ({ ...prev, projects: prev.projects.map(p => p.id === project.id ? project : p) }));
    if (user) await supabase.from('projects').update(mapProjectToDB(project, user.id)).eq('id', project.id);
  };

  const deleteProject = async (id: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      tasks: prev.tasks.filter(t => t.projectId !== id),
      goals: prev.goals.filter(g => g.projectId !== id),
      kpis: prev.kpis.filter(k => k.projectId !== id)
    }));
    if (user) await supabase.from('projects').delete().eq('id', id);
  };

  const addTask = async (task: Task) => {
    setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
    if (user) await supabase.from('tasks').insert(mapTaskToDB(task, user.id));
  };

  const updateTask = async (task: Task) => {
    setState(prev => {
        const oldTask = prev.tasks.find(t => t.id === task.id);
        let xpChange = 0;
        if (oldTask && oldTask.status !== TaskStatus.Done && task.status === TaskStatus.Done) xpChange = XP_TASK;
        else if (oldTask && oldTask.status === TaskStatus.Done && task.status !== TaskStatus.Done) xpChange = -XP_TASK;
        
        if (xpChange !== 0) addXP(xpChange); 
        return { ...prev, tasks: prev.tasks.map(t => t.id === task.id ? task : t) }
    });
    if (user) await supabase.from('tasks').update(mapTaskToDB(task, user.id)).eq('id', task.id);
    checkAchievements();
  };

  const deleteTask = async (id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id), subtasks: prev.subtasks.filter(s => s.taskId !== id) }));
    if (user) await supabase.from('tasks').delete().eq('id', id);
  };

  const addSubtask = async (subtask: Subtask) => {
      setState(prev => ({ ...prev, subtasks: [...prev.subtasks, subtask] }));
      if (user) await supabase.from('subtasks').insert(mapSubtaskToDB(subtask, user.id));
  }

  const toggleSubtask = async (id: string) => {
      let subtaskToUpdate: Subtask | undefined;
      setState(prev => {
          let xpChange = 0;
          const newSubtasks = prev.subtasks.map(s => {
              if (s.id !== id) return s;
              if (!s.isCompleted) xpChange = XP_SUBTASK; else xpChange = -XP_SUBTASK;
              if (xpChange !== 0) addXP(xpChange);
              subtaskToUpdate = { ...s, isCompleted: !s.isCompleted };
              return subtaskToUpdate;
          });
          return { ...prev, subtasks: newSubtasks };
      });
      if (user && subtaskToUpdate) await supabase.from('subtasks').update(mapSubtaskToDB(subtaskToUpdate, user.id)).eq('id', id);
  }

  const deleteSubtask = async (id: string) => {
      setState(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== id) }));
      if (user) await supabase.from('subtasks').delete().eq('id', id);
  }

  const addGoal = async (goal: Goal) => {
    setState(prev => ({ ...prev, goals: [...prev.goals, goal] }));
    if (user) await supabase.from('goals').insert(mapGoalToDB(goal, user.id));
  };

  const addKPI = async (kpi: KPI) => {
    setState(prev => ({ ...prev, kpis: [...prev.kpis, kpi] }));
    if (user) await supabase.from('kpis').insert(mapKPIToDB(kpi, user.id));
  };
  
  const updateKPI = async (kpi: KPI) => {
      setState(prev => ({ ...prev, kpis: prev.kpis.map(k => k.id === kpi.id ? kpi : k) }));
      if (user) await supabase.from('kpis').update(mapKPIToDB(kpi, user.id)).eq('id', kpi.id);
  }

  const deleteKPI = async (id: string) => {
      setState(prev => ({ ...prev, kpis: prev.kpis.filter(k => k.id !== id) }));
      if (user) await supabase.from('kpis').delete().eq('id', id);
  }

  const addHabit = async (habit: Habit) => {
      setState(prev => ({ ...prev, habits: [...prev.habits, habit] }));
      if (user) await supabase.from('habits').insert(mapHabitToDB(habit, user.id));
  };

  const updateHabit = async (habit: Habit) => {
      setState(prev => ({ ...prev, habits: prev.habits.map(h => h.id === habit.id ? habit : h) }));
      if (user) await supabase.from('habits').update(mapHabitToDB(habit, user.id)).eq('id', habit.id);
  };

  const toggleHabit = async (id: string) => {
      const today = new Date().toISOString().split('T')[0];
      let habitToUpdate: Habit | undefined;
      setState(prev => {
          let xpChange = 0;
          const newHabits = prev.habits.map(h => {
              if (h.id !== id) return h;
              const isCompletedToday = h.lastCompletedDate === today;
              if (!isCompletedToday) xpChange = XP_HABIT; else xpChange = -XP_HABIT;
              if (xpChange !== 0) addXP(xpChange);
              
              habitToUpdate = {
                  ...h,
                  lastCompletedDate: isCompletedToday ? null : today,
                  streak: isCompletedToday ? Math.max(0, h.streak - 1) : h.streak + 1 
              };
              return habitToUpdate;
          });
          return { ...prev, habits: newHabits };
      });
      if (user && habitToUpdate) await supabase.from('habits').update(mapHabitToDB(habitToUpdate, user.id)).eq('id', id);
      checkAchievements();
  }

  const deleteHabit = async (id: string) => {
      setState(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
      if (user) await supabase.from('habits').delete().eq('id', id);
  }

  const addScheduleItem = async (item: ScheduleItem) => {
      setState(prev => ({ ...prev, schedule: [...prev.schedule, item] }));
      if (user) await supabase.from('schedule').insert(mapScheduleToDB(item, user.id));
  }

  const updateScheduleItem = async (item: ScheduleItem) => {
      setState(prev => {
          let xpChange = 0;
          const oldItem = prev.schedule.find(s => s.id === item.id);
          if (oldItem && !oldItem.isCompleted && item.isCompleted) xpChange = XP_SCHEDULE;
          else if (oldItem && oldItem.isCompleted && !item.isCompleted) xpChange = -XP_SCHEDULE;
          if (xpChange !== 0) addXP(xpChange);
          return { ...prev, schedule: prev.schedule.map(s => s.id === item.id ? item : s) };
      });
      if (user) await supabase.from('schedule').update(mapScheduleToDB(item, user.id)).eq('id', item.id);
      checkAchievements();
  }

  const deleteScheduleItem = async (id: string) => {
      setState(prev => ({ ...prev, schedule: prev.schedule.filter(s => s.id !== id) }));
      if (user) await supabase.from('schedule').delete().eq('id', id);
  }

  const addScheduleItems = async (items: ScheduleItem[]) => {
      setState(prev => ({ ...prev, schedule: [...prev.schedule, ...items] }));
      if (user) await supabase.from('schedule').insert(items.map(i => mapScheduleToDB(i, user.id)));
  }

  const addWeeklyGoal = async (goal: WeeklyGoal) => {
      setState(prev => ({ ...prev, weeklyGoals: [...prev.weeklyGoals, goal] }));
      if (user) await supabase.from('weekly_goals').insert(mapWeeklyGoalToDB(goal, user.id));
  }

  const updateWeeklyGoal = async (goal: WeeklyGoal) => {
      setState(prev => ({ ...prev, weeklyGoals: prev.weeklyGoals.map(g => g.id === goal.id ? goal : g) }));
      if (user) await supabase.from('weekly_goals').update(mapWeeklyGoalToDB(goal, user.id)).eq('id', goal.id);
  }

  const deleteWeeklyGoal = async (id: string) => {
      setState(prev => ({ ...prev, weeklyGoals: prev.weeklyGoals.filter(g => g.id !== id) }));
      if (user) await supabase.from('weekly_goals').delete().eq('id', id);
  }

  const addStrategicPlan = async (plan: StrategicPlan) => {
    setState(prev => ({ ...prev, strategicPlans: [...prev.strategicPlans, plan] }));
    if (user) await supabase.from('strategic_plans').insert(mapStrategicPlanToDB(plan, user.id));
    checkAchievements();
  };

  const updateStrategicPlan = async (plan: StrategicPlan) => {
    setState(prev => {
        const oldPlan = prev.strategicPlans.find(p => p.id === plan.id);
        let xpChange = 0;
        if(oldPlan && !oldPlan.isAchieved && plan.isAchieved) xpChange = XP_PLAN_COMPLETE;
        else if(oldPlan && oldPlan.isAchieved && !plan.isAchieved) xpChange = -XP_PLAN_COMPLETE;
        if (xpChange !== 0) addXP(xpChange);
        
        return { ...prev, strategicPlans: prev.strategicPlans.map(p => p.id === plan.id ? plan : p) }
    });
    if (user) await supabase.from('strategic_plans').update(mapStrategicPlanToDB(plan, user.id)).eq('id', plan.id);
  };

  const deleteStrategicPlan = async (id: string) => {
      setState(prev => ({ ...prev, strategicPlans: prev.strategicPlans.filter(p => p.id !== id) }));
      if (user) await supabase.from('strategic_plans').delete().eq('id', id);
  }

  const resetData = async () => {
    if (user) {
         const confirmReset = window.confirm("⚠️ DANGER: This will PERMANENTLY DELETE all your cloud data (Projects, Tasks, XP, etc). This cannot be undone. Are you sure?");
         if (!confirmReset) return;
         
         setIsLoading(true);
         try {
             // Deleting projects cascades to tasks, goals, kpis, subtasks via DB constraints
             // Deleting other tables independently
             await Promise.all([
                supabase.from('projects').delete().eq('user_id', user.id), 
                supabase.from('habits').delete().eq('user_id', user.id),
                supabase.from('schedule').delete().eq('user_id', user.id),
                supabase.from('weekly_goals').delete().eq('user_id', user.id),
                supabase.from('strategic_plans').delete().eq('user_id', user.id),
                // Reset Profile Stats
                supabase.from('profiles').update({ xp: 0, onboarding_completed: false, unlocked_achievements: [] }).eq('id', user.id)
             ]);
         } catch(e) {
             console.error(e);
             alert("Failed to reset cloud data.");
         } finally {
             setIsLoading(false);
         }
    } else {
         if (!window.confirm("Are you sure you want to clear all local data?")) return;
    }

    setState(generateDefaults());
    window.location.reload();
  };

  const applyAIProposal = (proposal: AIProposal) => {
    // ... (No logic changes needed here for XP, as adding individual items calls the helpers)
    // Reuse existing logic
    const projectMap = new Map<string, string>();

    // 1. Projects
    proposal.projects.forEach(p => {
        const existing = state.projects.find(ep => ep.name.toLowerCase() === p.name.toLowerCase());
        let pid = existing?.id;
        if (!existing) {
            pid = crypto.randomUUID();
            addProject({
                id: pid,
                name: p.name,
                vision: p.vision,
                category: p.category,
                status: p.status,
                createdAt: new Date().toISOString()
            });
        }
        if(pid) projectMap.set(p.name, pid);
    });

    // 2. Goals & KPIs
    proposal.goals.forEach(g => {
        const pid = projectMap.get(g.projectName);
        if(pid) addGoal({ id: crypto.randomUUID(), projectId: pid, description: g.description });
    });
    proposal.kpis.forEach(k => {
        const pid = projectMap.get(k.projectName);
        if(pid) addKPI({ id: crypto.randomUUID(), projectId: pid, name: k.name, currentValue: k.currentValue, targetValue: k.targetValue, unit: k.unit, updateFrequency: k.updateFrequency });
    });

    // 3. Tasks
    proposal.tasks.forEach(t => {
        const pid = projectMap.get(t.projectName);
        if(pid) {
            const tid = crypto.randomUUID();
            addTask({ id: tid, projectId: pid, title: t.title, description: t.description, status: t.status, priority: t.priority, estimatedHours: t.estimatedHours, createdAt: new Date().toISOString() });
            t.subtasks?.forEach(st => addSubtask({ id: crypto.randomUUID(), taskId: tid, title: st, isCompleted: false }));
        }
    });

    // 4. Habits & Schedule
    proposal.habits.forEach(h => {
        if (!state.habits.some(ex => ex.title.toLowerCase() === h.title.toLowerCase())) {
            addHabit({ id: crypto.randomUUID(), title: h.title, timeOfDay: h.timeOfDay, lastCompletedDate: null, streak: 0 });
        }
    });
    
    const newScheduleItems: ScheduleItem[] = [];
    proposal.schedule.forEach(s => {
        newScheduleItems.push({ id: crypto.randomUUID(), title: s.title, startTime: s.startTime, endTime: s.endTime, type: s.type, date: s.date, isCompleted: false, description: s.description });
    });
    if (newScheduleItems.length > 0) addScheduleItems(newScheduleItems);

    if (proposal.weeklyGoals) {
        const currentMonday = getMonday(new Date());
        proposal.weeklyGoals.forEach(wg => addWeeklyGoal({ id: crypto.randomUUID(), weekStartDate: currentMonday, title: wg.title, category: wg.category, isCompleted: false }));
    }
    
    checkAchievements();
  };

  return (
    <AppContext.Provider value={{
      ...state,
      user,
      userRole,
      isLoading,
      logout,
      syncLocalToRemote,
      completeOnboarding,
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      deleteTask,
      addSubtask,
      toggleSubtask,
      deleteSubtask,
      addGoal,
      addKPI,
      updateKPI,
      deleteKPI,
      addHabit,
      toggleHabit,
      deleteHabit,
      updateHabit,
      addScheduleItem,
      updateScheduleItem,
      deleteScheduleItem,
      addScheduleItems,
      addWeeklyGoal,
      updateWeeklyGoal,
      deleteWeeklyGoal,
      addStrategicPlan,
      updateStrategicPlan,
      deleteStrategicPlan,
      applyAIProposal,
      resetData,
      checkAchievements
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};