
import React from 'react';
import { useApp, getRank, ACHIEVEMENTS_LIST } from '../context/AppContext';
import { Trophy, Star, CheckSquare, Zap, Target, Lock, Flame, Medal, Lightbulb, Map } from 'lucide-react';
import { TaskStatus } from '../types';

export const Profile = () => {
  const { xp, user, tasks, habits, achievements } = useApp();

  // Level Calculations
  const level = Math.floor(Math.sqrt(xp) / 5) + 1;
  const currentLevelBaseXP = Math.pow((level - 1) * 5, 2);
  const nextLevelBaseXP = Math.pow(level * 5, 2);
  const xpNeeded = nextLevelBaseXP - currentLevelBaseXP;
  const xpProgress = xp - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));
  
  const rank = getRank(level);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // Icon Mapper
  const getIcon = (name: string) => {
      switch(name) {
          case 'CheckSquare': return <CheckSquare size={24} />;
          case 'Trophy': return <Trophy size={24} />;
          case 'Flame': return <Flame size={24} />;
          case 'Map': return <Map size={24} />;
          case 'Lightbulb': return <Lightbulb size={24} />;
          case 'Zap': return <Zap size={24} />;
          default: return <Star size={24} />;
      }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
        {/* HERO HEADER */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Avatar / Level Badge */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-surface border-4 border-primary flex items-center justify-center text-4xl font-bold shadow-xl shadow-primary/20">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full border-2 border-background shadow-lg">
                        Lvl {level}
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-4xl font-bold">{user?.email?.split('@')[0]}</h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-yellow-400 font-bold tracking-wide uppercase text-sm border border-white/5">
                        <Medal size={14} /> {rank}
                    </div>
                    
                    <div className="max-w-md mt-4">
                        <div className="flex justify-between text-xs text-muted mb-1 font-mono">
                            <span>{Math.floor(xpProgress)} XP</span>
                            <span>{Math.floor(xpNeeded)} XP to Level {level + 1}</span>
                        </div>
                        <div className="h-3 bg-surface rounded-full overflow-hidden border border-white/10">
                             <div 
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 relative"
                                style={{ width: `${progressPercent}%` }}
                             >
                                 <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm min-w-[150px] text-center">
                    <p className="text-3xl font-bold text-yellow-500">{xp}</p>
                    <p className="text-xs text-muted uppercase tracking-widest">Total XP</p>
                </div>
            </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface border border-border p-6 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                <CheckSquare className="text-green-400 mb-2" size={32} />
                <span className="text-2xl font-bold">{completedTasks}</span>
                <span className="text-xs text-muted uppercase mt-1">Tasks Completed</span>
            </div>
            <div className="bg-surface border border-border p-6 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                <Flame className="text-orange-400 mb-2" size={32} />
                <span className="text-2xl font-bold">{longestStreak}</span>
                <span className="text-xs text-muted uppercase mt-1">Best Habit Streak</span>
            </div>
            <div className="bg-surface border border-border p-6 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                <Target className="text-blue-400 mb-2" size={32} />
                <span className="text-2xl font-bold">{completionRate}%</span>
                <span className="text-xs text-muted uppercase mt-1">Completion Rate</span>
            </div>
            <div className="bg-surface border border-border p-6 rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                <Trophy className="text-yellow-400 mb-2" size={32} />
                <span className="text-2xl font-bold">{achievements.length}</span>
                <span className="text-xs text-muted uppercase mt-1">Badges Earned</span>
            </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ACHIEVEMENTS_LIST.map(ach => {
                    const isUnlocked = achievements.includes(ach.id);
                    return (
                        <div 
                            key={ach.id} 
                            className={`relative p-4 rounded-xl border flex items-center gap-4 transition-all ${
                                isUnlocked 
                                ? 'bg-gradient-to-br from-surface to-primary/10 border-primary/50 shadow-lg shadow-primary/5' 
                                : 'bg-surface border-border opacity-60 grayscale'
                            }`}
                        >
                            <div className={`p-3 rounded-full ${isUnlocked ? 'bg-primary text-white' : 'bg-background text-muted'}`}>
                                {isUnlocked ? getIcon(ach.icon) : <Lock size={24} />}
                            </div>
                            <div>
                                <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-muted'}`}>{ach.title}</h3>
                                <p className="text-xs text-muted">{ach.description}</p>
                            </div>
                            {isUnlocked && (
                                <div className="absolute top-2 right-2 text-primary opacity-20">
                                    <Trophy size={48} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    </div>
  );
};
