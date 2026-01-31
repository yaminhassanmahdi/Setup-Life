
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, FolderKanban, CheckSquare, Settings as SettingsIcon, Home, Briefcase, Trophy, Shield, GraduationCap, Calendar as CalendarIcon, Map, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Layout = () => {
  const { xp, userRole } = useApp();
  const navigate = useNavigate();
  
  // Gamification Logic
  // Level formula: Sqrt(XP) / 5 + 1. Example: XP 100 = Level 3. XP 400 = Level 5.
  const level = Math.floor(Math.sqrt(xp) / 5) + 1;
  // Calculate Progress
  const currentLevelBaseXP = Math.pow((level - 1) * 5, 2);
  const nextLevelBaseXP = Math.pow(level * 5, 2);
  const xpNeeded = nextLevelBaseXP - currentLevelBaseXP;
  const xpProgress = xp - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-primary/20 text-primary border-r-2 border-primary' 
        : 'text-muted hover:bg-surface hover:text-text'
    }`;

  const mobileNavClass = ({ isActive }: { isActive: boolean }) => 
    `flex flex-col items-center justify-center w-full py-2 transition-colors ${
      isActive 
        ? 'text-primary' 
        : 'text-muted hover:text-text'
    }`;

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">S</span>
            Setup Life
          </h1>
        </div>

        {/* Player Profile Widget */}
        <div className="px-6 mb-6">
            <button 
                onClick={() => navigate('/app/profile')}
                className="w-full bg-gradient-to-br from-background to-surface rounded-xl p-4 border border-border group hover:border-primary/50 transition-all text-left"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-yellow-500/20 rounded-lg text-yellow-500">
                             <Trophy size={16} />
                        </div>
                        <div>
                             <span className="text-xs text-muted uppercase font-bold block">Level {level}</span>
                             <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">Founder</span>
                        </div>
                    </div>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/50">
                    <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-1000 ease-out relative" 
                        style={{ width: `${progressPercent}%` }} 
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted font-mono">
                    <span>{Math.floor(xpProgress)} XP</span>
                    <span>{Math.floor(xpNeeded)} XP Next</span>
                </div>
            </button>
        </div>

        <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
          
          {/* Main Section */}
          <div>
              <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Life OS</p>
              <div className="space-y-1">
                <NavLink to="/app" end className={navClass}>
                    <Home size={20} />
                    <span>Main Home</span>
                </NavLink>
                <NavLink to="/app/calendar" className={navClass}>
                    <CalendarIcon size={20} />
                    <span>Calendar</span>
                </NavLink>
                <NavLink to="/app/brain-dump" className={navClass}>
                    <BrainCircuit size={20} />
                    <span>Brain Dump</span>
                </NavLink>
                <NavLink to="/app/roadmap" className={navClass}>
                    <Map size={20} />
                    <span>Roadmap</span>
                </NavLink>
              </div>
          </div>

          {/* Work Section */}
          <div>
              <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Work OS</p>
              <div className="space-y-1">
                <NavLink to="/app/work" className={navClass}>
                    <Briefcase size={20} />
                    <span>Professional</span>
                </NavLink>
                <NavLink to="/app/projects" className={navClass}>
                    <FolderKanban size={20} />
                    <span>Projects</span>
                </NavLink>
                <NavLink to="/app/tasks" className={navClass}>
                    <CheckSquare size={20} />
                    <span>All Tasks</span>
                </NavLink>
              </div>
          </div>

          {/* Learning Section */}
          <div>
              <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">Learning OS</p>
              <div className="space-y-1">
                <NavLink to="/app/education" className={navClass}>
                    <GraduationCap size={20} />
                    <span>Educational</span>
                </NavLink>
              </div>
          </div>

        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {userRole === 'admin' && (
              <button onClick={() => navigate('/admin')} className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-muted hover:bg-surface hover:text-text bg-red-900/10 border border-red-900/20">
                  <Shield size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">Admin Panel</span>
              </button>
          )}
          <NavLink to="/app/profile" className={navClass}>
            <UserCircle size={20} />
            <span>My Profile</span>
          </NavLink>
          <NavLink to="/app/settings" className={navClass}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50 flex justify-around items-center px-2 pb-safe">
        <NavLink to="/app" end className={mobileNavClass}>
            <Home size={20} />
            <span className="text-[10px] mt-1">Life</span>
        </NavLink>
        <NavLink to="/app/roadmap" className={mobileNavClass}>
            <Map size={20} />
            <span className="text-[10px] mt-1">Map</span>
        </NavLink>
        <NavLink to="/app/calendar" className={mobileNavClass}>
            <CalendarIcon size={20} />
            <span className="text-[10px] mt-1">Cal</span>
        </NavLink>
        <NavLink to="/app/education" className={mobileNavClass}>
            <GraduationCap size={20} />
            <span className="text-[10px] mt-1">Learn</span>
        </NavLink>
        <NavLink to="/app/projects" className={mobileNavClass}>
            <FolderKanban size={20} />
            <span className="text-[10px] mt-1">Projs</span>
        </NavLink>
      </nav>
    </div>
  );
};
