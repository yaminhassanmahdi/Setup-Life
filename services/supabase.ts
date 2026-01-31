
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gyggbyrulemscxdapkhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Z2dieXJ1bGVtc2N4ZGFwa2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDMyNTcsImV4cCI6MjA4NTQxOTI1N30.9kMiKeF7ERiBIV394QBVPcFCru7cK-6mKyFo5mIArnI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Helpers to map between App Types (CamelCase) and DB (snake_case) ---

export const mapProjectToDB = (p: any, userId: string) => ({
  id: p.id,
  user_id: userId,
  name: p.name,
  vision: p.vision,
  category: p.category,
  status: p.status,
  created_at: p.createdAt
});

export const mapProjectFromDB = (p: any) => ({
  id: p.id,
  name: p.name,
  vision: p.vision,
  category: p.category,
  status: p.status,
  createdAt: p.created_at
});

export const mapTaskToDB = (t: any, userId: string) => ({
  id: t.id,
  user_id: userId,
  project_id: t.projectId,
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  estimated_hours: t.estimatedHours,
  deadline: t.deadline,
  created_at: t.createdAt
});

export const mapTaskFromDB = (t: any) => ({
  id: t.id,
  projectId: t.project_id,
  title: t.title,
  description: t.description,
  status: t.status,
  priority: t.priority,
  estimatedHours: Number(t.estimated_hours),
  deadline: t.deadline,
  createdAt: t.created_at
});

export const mapSubtaskToDB = (s: any, userId: string) => ({
    id: s.id,
    user_id: userId,
    task_id: s.taskId,
    title: s.title,
    is_completed: s.isCompleted
});

export const mapSubtaskFromDB = (s: any) => ({
    id: s.id,
    taskId: s.task_id,
    title: s.title,
    isCompleted: s.is_completed
});

export const mapGoalToDB = (g: any, userId: string) => ({
    id: g.id,
    user_id: userId,
    project_id: g.projectId,
    description: g.description
});

export const mapGoalFromDB = (g: any) => ({
    id: g.id,
    projectId: g.project_id,
    description: g.description
});

export const mapKPIToDB = (k: any, userId: string) => ({
    id: k.id,
    user_id: userId,
    project_id: k.projectId,
    name: k.name,
    current_value: k.currentValue,
    target_value: k.targetValue,
    unit: k.unit,
    update_frequency: k.updateFrequency
});

export const mapKPIFromDB = (k: any) => ({
    id: k.id,
    projectId: k.project_id,
    name: k.name,
    currentValue: Number(k.current_value),
    targetValue: Number(k.target_value),
    unit: k.unit,
    updateFrequency: k.update_frequency
});

export const mapHabitToDB = (h: any, userId: string) => ({
    id: h.id,
    user_id: userId,
    title: h.title,
    time_of_day: h.timeOfDay,
    last_completed_date: h.lastCompletedDate,
    streak: h.streak
});

export const mapHabitFromDB = (h: any) => ({
    id: h.id,
    title: h.title,
    timeOfDay: h.time_of_day,
    lastCompletedDate: h.last_completed_date,
    streak: h.streak
});

export const mapScheduleToDB = (s: any, userId: string) => ({
    id: s.id,
    user_id: userId,
    title: s.title,
    start_time: s.startTime,
    end_time: s.endTime,
    type: s.type,
    date: s.date,
    is_completed: s.isCompleted,
    description: s.description
});

export const mapScheduleFromDB = (s: any) => ({
    id: s.id,
    title: s.title,
    startTime: s.start_time,
    endTime: s.end_time,
    type: s.type,
    date: s.date,
    isCompleted: s.is_completed,
    description: s.description
});

export const mapWeeklyGoalToDB = (w: any, userId: string) => ({
    id: w.id,
    user_id: userId,
    week_start_date: w.weekStartDate,
    title: w.title,
    is_completed: w.isCompleted,
    category: w.category
});

export const mapWeeklyGoalFromDB = (w: any) => ({
    id: w.id,
    weekStartDate: w.week_start_date,
    title: w.title,
    isCompleted: w.is_completed,
    category: w.category
});

export const mapStrategicPlanToDB = (s: any, userId: string) => ({
  id: s.id,
  user_id: userId,
  horizon: s.horizon,
  title: s.title,
  description: s.description,
  category: s.category || 'Personal',
  start_date: s.startDate,
  end_date: s.endDate,
  progress: s.progress,
  is_achieved: s.isAchieved
});

export const mapStrategicPlanFromDB = (s: any) => ({
  id: s.id,
  horizon: s.horizon,
  title: s.title,
  description: s.description,
  category: s.category || 'Personal',
  startDate: s.start_date,
  endDate: s.end_date,
  progress: s.progress,
  isAchieved: s.is_achieved
});

export const mapPlanFromDB = (p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    features: p.features,
    isActive: p.is_active
});

// Helper: Fetch profile with retries to handle trigger latency
export const fetchProfileWithRetry = async (userId: string, retries = 5, delay = 500) => {
    for (let i = 0; i < retries; i++) {
        const { data, error } = await supabase.from('profiles').select('xp, role, onboarding_completed, unlocked_achievements').eq('id', userId).single();
        if (data) return data;
        // If error or no data, wait and retry
        if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
    return null;
}
