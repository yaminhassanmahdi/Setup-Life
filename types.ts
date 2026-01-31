
export enum ProjectStatus {
  Active = 'Active',
  Paused = 'Paused',
  Archived = 'Archived'
}

export enum ProjectCategory {
  Work = 'Work',
  Personal = 'Personal',
  Education = 'Education'
}

export enum TaskStatus {
  Backlog = 'Backlog',
  InProgress = 'In Progress',
  Blocked = 'Blocked',
  Done = 'Done'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export type UserRole = 'user' | 'admin';

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodEnd: string;
}

export interface Project {
  id: string;
  name: string;
  vision: string;
  category: ProjectCategory;
  status: ProjectStatus;
  createdAt: string;
}

export interface Goal {
  id: string;
  projectId: string;
  description: string;
}

export interface KPI {
  id: string;
  projectId: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  updateFrequency: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  deadline?: string;
  createdAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
}

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';

export interface Habit {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  lastCompletedDate: string | null; // ISO Date string (YYYY-MM-DD)
  streak: number;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // HH:mm format (24h)
  endTime?: string;
  type: 'Routine' | 'Appointment' | 'Work' | 'Task';
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  description?: string;
}

export interface WeeklyGoal {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday of the week)
  title: string;
  isCompleted: boolean;
  category: ProjectCategory;
}

// --- NEW STRATEGY TYPES ---
export type PlanHorizon = '1 Year' | '6 Months' | '3 Months' | '1 Month' | '2 Weeks';

export interface StrategicPlan {
  id: string;
  horizon: PlanHorizon;
  title: string;
  description?: string;
  category: ProjectCategory; // Added category
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  progress: number; // 0-100
  isAchieved: boolean;
}

// --- GAMIFICATION TYPES ---
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    unlockedAt: string | null; // Date ISO or null if locked
}

export interface AppState {
  xp: number;
  onboardingCompleted: boolean;
  projects: Project[];
  goals: Goal[];
  kpis: KPI[];
  tasks: Task[];
  subtasks: Subtask[];
  habits: Habit[];
  schedule: ScheduleItem[];
  weeklyGoals: WeeklyGoal[];
  strategicPlans: StrategicPlan[]; 
  achievements: string[]; // List of Achievement IDs unlocked
}

// AI Proposal Types (Structure received from Gemini)
export interface AIProposal {
  summary: string;
  habits: { title: string; timeOfDay: TimeOfDay }[]; 
  weeklyGoals: { 
    title: string;
    category: ProjectCategory;
  }[];
  schedule: { 
    title: string;
    startTime: string;
    endTime?: string;
    type: 'Routine' | 'Appointment' | 'Work' | 'Task';
    date: string;
    description?: string;
  }[];
  projects: {
    name: string;
    vision: string;
    category: ProjectCategory; 
    status: ProjectStatus;
  }[];
  goals: {
    projectName: string;
    description: string;
  }[];
  kpis: {
    projectName: string;
    name: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    updateFrequency: string;
  }[];
  tasks: {
    projectName: string;
    title: string;
    description: string;
    priority: Priority;
    estimatedHours: number;
    status: TaskStatus;
    subtasks: string[];
  }[];
}
