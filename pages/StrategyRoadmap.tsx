import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PlanHorizon, StrategicPlan, ProjectCategory } from '../types';
import { breakdownPlan } from '../services/geminiService';
import { Map, Plus, Target, CalendarDays, Loader2, Award, CheckCircle2, Trash2, ArrowRight, Briefcase, User, GraduationCap, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StrategyRoadmap = () => {
    const { strategicPlans, addStrategicPlan, updateStrategicPlan, deleteStrategicPlan, weeklyGoals, userApiKey } = useApp();
    const navigate = useNavigate();
    
    // UI States
    const [activeCategory, setActiveCategory] = useState<'Master' | ProjectCategory>('Master');
    const [isAdding, setIsAdding] = useState<PlanHorizon | null>(null);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [isBreakingDown, setIsBreakingDown] = useState<string | null>(null); // Plan ID

    const handleAdd = (horizon: PlanHorizon) => {
        if(!newItemTitle.trim()) return;
        
        // Default to Personal if Master is selected, otherwise use active category
        const categoryToUse = activeCategory === 'Master' ? ProjectCategory.Personal : activeCategory;

        addStrategicPlan({
            id: crypto.randomUUID(),
            horizon: horizon,
            title: newItemTitle,
            description: '',
            category: categoryToUse,
            startDate: new Date().toISOString().split('T')[0],
            progress: 0,
            isAchieved: false
        });
        setNewItemTitle('');
        setIsAdding(null);
    }

    const handleBreakdown = async (plan: StrategicPlan) => {
        if (!userApiKey) {
            if(confirm("You need a Personal API Key to use AI features. Go to Settings?")) {
                navigate('/app/settings');
            }
            return;
        }

        setIsBreakingDown(plan.id);
        const nextHorizon = getNextHorizon(plan.horizon);
        if(!nextHorizon) {
            setIsBreakingDown(null);
            return; 
        }

        try {
            const subTitles = await breakdownPlan(plan.title, plan.horizon, userApiKey);
            if (subTitles) {
                subTitles.forEach(title => {
                    addStrategicPlan({
                        id: crypto.randomUUID(),
                        horizon: nextHorizon,
                        title: title,
                        description: `Breakdown from: ${plan.title}`,
                        category: plan.category, // Inherit category
                        startDate: new Date().toISOString().split('T')[0],
                        progress: 0,
                        isAchieved: false
                    });
                });
            } else {
                alert("AI couldn't generate a breakdown. Try adding details manually.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to AI.");
        } finally {
            setIsBreakingDown(null);
        }
    }

    const getNextHorizon = (h: PlanHorizon): PlanHorizon | null => {
        if (h === '1 Year') return '3 Months';
        if (h === '3 Months') return '1 Month';
        if (h === '1 Month') return '2 Weeks';
        return null;
    }

    // Filter plans based on active category
    const getFilteredPlans = (horizon: PlanHorizon) => {
        return strategicPlans.filter(p => {
            const matchesHorizon = p.horizon === horizon;
            const matchesCategory = activeCategory === 'Master' || p.category === activeCategory;
            return matchesHorizon && matchesCategory;
        });
    }

    // Components for Horizon Sections
    const HorizonSection = ({ title, horizon, icon, colorClass }: { title: string, horizon: PlanHorizon, icon: React.ReactNode, colorClass: string }) => {
        const items = getFilteredPlans(horizon);

        return (
            <div className="bg-surface/30 border border-border rounded-xl p-4 md:p-6 min-h-[200px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${colorClass}`}>
                        {icon} {title}
                    </h3>
                    <button 
                        onClick={() => setIsAdding(horizon)}
                        className="p-1 hover:bg-white/10 rounded"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {isAdding === horizon && (
                    <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input 
                            autoFocus
                            placeholder={`New ${title}...`}
                            className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm focus:border-primary outline-none"
                            value={newItemTitle}
                            onChange={e => setNewItemTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd(horizon)}
                        />
                        <button onClick={() => handleAdd(horizon)} className="bg-primary px-3 py-2 rounded text-white text-xs">Add</button>
                        <button onClick={() => setIsAdding(null)} className="text-muted px-2">X</button>
                    </div>
                )}

                <div className="space-y-3 flex-1">
                    {items.map(plan => (
                        <div key={plan.id} className="bg-background border border-border rounded-lg p-3 group relative hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className={`font-medium text-sm ${plan.isAchieved ? 'line-through text-muted' : ''}`}>{plan.title}</h4>
                                    {activeCategory === 'Master' && (
                                        <span className={`text-[10px] px-1.5 rounded-full ${
                                            plan.category === ProjectCategory.Work ? 'bg-blue-900/30 text-blue-400' :
                                            plan.category === ProjectCategory.Education ? 'bg-purple-900/30 text-purple-400' :
                                            'bg-pink-900/30 text-pink-400'
                                        }`}>
                                            {plan.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => updateStrategicPlan({...plan, isAchieved: !plan.isAchieved, progress: !plan.isAchieved ? 100 : 0})}
                                        className="p-1 text-green-400 hover:bg-green-900/20 rounded"
                                        title="Mark Achieved"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => deleteStrategicPlan(plan.id)}
                                        className="p-1 text-red-400 hover:bg-red-900/20 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Slider */}
                            <div className="mb-2">
                                <div className="flex justify-between text-[10px] text-muted mb-1">
                                    <span>Progress</span>
                                    <span>{plan.progress}%</span>
                                </div>
                                <input 
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={plan.progress}
                                    onChange={(e) => updateStrategicPlan({...plan, progress: Number(e.target.value)})}
                                    className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                />
                            </div>

                            {/* "Win the Plan" Action */}
                            {horizon !== '2 Weeks' && !plan.isAchieved && (
                                <button 
                                    onClick={() => handleBreakdown(plan)}
                                    disabled={isBreakingDown === plan.id}
                                    className="w-full mt-2 py-1.5 bg-surface hover:bg-white/5 border border-dashed border-border text-xs text-muted flex items-center justify-center gap-2 rounded transition-colors"
                                >
                                    {isBreakingDown === plan.id ? <Loader2 className="animate-spin" size={12}/> : <ArrowRight size={12} />}
                                    {horizon === '1 Year' ? 'Plan Quarters' : 'Break Down'}
                                </button>
                            )}
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-xs text-muted italic p-2 text-center">No plans set.</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col overflow-hidden">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                    <Map className="text-amber-500" />
                    Strategy Roadmap
                </h1>
                <p className="text-muted mb-4">Align your daily actions with your yearly vision.</p>
                
                {/* Category Tabs */}
                <div className="flex gap-1 bg-surface p-1 rounded-lg w-full md:w-fit">
                    <button 
                        onClick={() => setActiveCategory('Master')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeCategory === 'Master' ? 'bg-amber-600 text-white' : 'text-muted hover:text-white'}`}
                    >
                        <LayoutGrid size={16} /> Master
                    </button>
                    <button 
                        onClick={() => setActiveCategory(ProjectCategory.Work)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeCategory === ProjectCategory.Work ? 'bg-blue-600 text-white' : 'text-muted hover:text-white'}`}
                    >
                        <Briefcase size={16} /> Work
                    </button>
                    <button 
                        onClick={() => setActiveCategory(ProjectCategory.Personal)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeCategory === ProjectCategory.Personal ? 'bg-pink-600 text-white' : 'text-muted hover:text-white'}`}
                    >
                        <User size={16} /> Personal
                    </button>
                    <button 
                        onClick={() => setActiveCategory(ProjectCategory.Education)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeCategory === ProjectCategory.Education ? 'bg-purple-600 text-white' : 'text-muted hover:text-white'}`}
                    >
                        <GraduationCap size={16} /> Education
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pb-10">
                
                {/* 1 YEAR (The North Star) */}
                <div className="mb-8">
                    <HorizonSection 
                        title="1 Year Vision" 
                        horizon="1 Year" 
                        icon={<Target />} 
                        colorClass="text-amber-400" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* 6 MONTHS */}
                    <HorizonSection 
                        title="6 Months" 
                        horizon="6 Months" 
                        icon={<CalendarDays />} 
                        colorClass="text-blue-400" 
                    />
                    
                    {/* 3 MONTHS */}
                    <HorizonSection 
                        title="3 Months (Quarter)" 
                        horizon="3 Months" 
                        icon={<CalendarDays />} 
                        colorClass="text-purple-400" 
                    />

                    {/* 1 MONTH */}
                    <HorizonSection 
                        title="1 Month" 
                        horizon="1 Month" 
                        icon={<CalendarDays />} 
                        colorClass="text-green-400" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 2 WEEKS */}
                    <HorizonSection 
                        title="2 Weeks Sprint" 
                        horizon="2 Weeks" 
                        icon={<CalendarDays />} 
                        colorClass="text-pink-400" 
                    />

                    {/* WEEKLY GOALS (Existing integration) */}
                    <div className="bg-surface/30 border border-border rounded-xl p-4 md:p-6 min-h-[200px] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                <Award className="text-white" /> Weekly Execution
                            </h3>
                        </div>
                        <div className="space-y-3 flex-1">
                            {weeklyGoals.filter(wg => activeCategory === 'Master' || wg.category === activeCategory).map(wg => (
                                <div key={wg.id} className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
                                    <span className={`text-sm ${wg.isCompleted ? 'line-through text-muted' : ''}`}>{wg.title}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border border-white/20 text-muted`}>
                                        {wg.category}
                                    </span>
                                </div>
                            ))}
                            {weeklyGoals.filter(wg => activeCategory === 'Master' || wg.category === activeCategory).length === 0 && (
                                <p className="text-xs text-muted italic p-2 text-center">Manage weekly goals in Life OS.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};