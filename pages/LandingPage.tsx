
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, Grid, Calendar, BarChart3, Brain, Network, BatteryWarning, 
  Sparkles, Sliders, Target, CloudUpload, GitFork, CheckSquare, Zap, 
  List, Kanban, CalendarClock, Medal, LineChart, RefreshCw, PartyPopper, 
  Trophy, CheckCircle2, XCircle, Check, X
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background-dark font-display text-slate-100 selection:bg-primary/30 min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
              <Layout size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Setup Life</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors" onClick={() => scrollToSection('problem')}>The Problem</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors" onClick={() => scrollToSection('solution')}>Solution</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors" onClick={() => scrollToSection('features')}>Features</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors" onClick={() => scrollToSection('how-it-works')}>Process</button>
          </nav>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/auth?mode=login')}
                className="hidden sm:block text-sm font-medium text-white px-4 hover:text-primary transition-colors"
            >
                Log in
            </button>
            <button 
                onClick={() => navigate('/auth?mode=signup')}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
                Get Early Access
            </button>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-8 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Now in Private Beta
                </div>
                <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white md:text-6xl">
                  Turn messy ideas into <span className="text-primary">daily execution.</span>
                </h1>
                <p className="text-lg leading-relaxed text-slate-400">
                  The AI-powered personal chief of staff that structures your chaos, prioritizes your energy, and drives project execution from thought to finish.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate('/auth?mode=signup')}
                    className="flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
                  >
                    Start organizing for real
                  </button>
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-bold text-white transition-all hover:bg-slate-700"
                  >
                    See how it works
                  </button>
                </div>
              </div>

              {/* App Mockup Visual */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary/20 to-purple-500/20 blur-2xl"></div>
                <div className="relative rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                  {/* Sidebar */}
                  <div className="flex h-full">
                    <div className="w-16 border-r border-white/5 bg-slate-950 p-3 flex flex-col gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary"><Grid size={16} /></div>
                      <div className="w-8 h-8 rounded flex items-center justify-center text-slate-600"><Calendar size={16} /></div>
                      <div className="w-8 h-8 rounded flex items-center justify-center text-slate-600"><BarChart3 size={16} /></div>
                    </div>
                    {/* Content Mockup */}
                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-32 bg-slate-800 rounded"></div>
                        <div className="h-8 w-8 rounded-full bg-slate-800"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5 flex flex-col gap-3">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Today's Top 3</div>
                          <div className="flex flex-col gap-2">
                            <div className="h-3 w-full bg-slate-700 rounded-sm"></div>
                            <div className="h-3 w-4/5 bg-slate-700 rounded-sm"></div>
                            <div className="h-3 w-2/3 bg-slate-700 rounded-sm"></div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col gap-2">
                          <div className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Insight</div>
                          <div className="text-[10px] text-slate-300">"Project 'Nebula' is stalling. Breaking down the next 3 steps for you..."</div>
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg bg-slate-950/50 border border-white/5 p-4 flex flex-col gap-4">
                        <div className="flex gap-4">
                          <div className="h-4 w-12 bg-primary/20 rounded-full border border-primary/30"></div>
                          <div className="h-4 w-12 bg-slate-800 rounded-full"></div>
                          <div className="h-4 w-12 bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 flex-1">
                          {[1,2,3].map(i => (
                              <div key={i} className="bg-slate-800/30 rounded-md border border-white/5 p-2">
                                <div className="h-2 w-full bg-slate-700 rounded-full mb-2"></div>
                                <div className="h-10 w-full bg-slate-900/50 rounded-sm border border-white/5"></div>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 bg-slate-950/40" id="problem">
          <div className="mx-auto max-w-[800px] px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl mb-8">
              Your ideas aren't the problem.<br/><span className="text-slate-500">Execution is.</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                <Brain className="text-primary text-3xl" size={40} />
                <p className="text-sm font-medium text-slate-300">Information Overload</p>
              </div>
              <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                <Network className="text-primary text-3xl" size={40} />
                <p className="text-sm font-medium text-slate-300">Lack of Structure</p>
              </div>
              <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                <BatteryWarning className="text-primary text-3xl" size={40} />
                <p className="text-sm font-medium text-slate-300">Decision Fatigue</p>
              </div>
            </div>
            <p className="text-xl text-slate-400 font-light italic">
              "It's time for a system that actually works as hard as your brain does."
            </p>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-24" id="solution">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="flex flex-col gap-4 mb-16 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                A system that thinks with you, not for you
              </h2>
              <p className="text-slate-400 max-w-2xl">Designed for clarity, control, and daily momentum without the overhead of traditional project managers.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="group flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 transition-all hover:border-primary/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Sparkles />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-white">AI Structuring</h3>
                  <p className="text-slate-400 leading-relaxed">AI breaks down your complex, messy ideas into logical actionable steps instantly. No more staring at a blank page.</p>
                </div>
              </div>
              <div className="group flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 transition-all hover:border-primary/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Sliders />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-white">Manual Control</h3>
                  <p className="text-slate-400 leading-relaxed">You remain the pilot. Every AI suggestion is editable. You decide the priorities, the timing, and the logic.</p>
                </div>
              </div>
              <div className="group flex flex-col gap-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 transition-all hover:border-primary/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Target />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-white">Daily Execution</h3>
                  <p className="text-slate-400 leading-relaxed">A focused, zero-clutter dashboard designed to get the most important things done every single day. No noise, just progress.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Timeline) */}
        <section className="py-24 bg-slate-950/20" id="how-it-works">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">From Mind to Momentum</h2>
              <p className="text-slate-400">The four steps to clarity</p>
            </div>
            <div className="relative grid md:grid-cols-4 gap-8">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-slate-800 -z-10"></div>
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border-4 border-background-dark ring-2 ring-slate-800 text-white shadow-xl">
                  <CloudUpload size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-white">1. Dump</h4>
                  <p className="text-sm text-slate-400 leading-relaxed px-4">Clear your mind of raw ideas, voice notes, or messy texts.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border-4 border-background-dark ring-2 ring-slate-800 text-white shadow-xl">
                  <GitFork size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-white">2. Structure</h4>
                  <p className="text-sm text-slate-400 leading-relaxed px-4">AI identifies objectives and organizes them into a cohesive plan.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border-4 border-background-dark ring-2 ring-slate-800 text-white shadow-xl">
                  <CheckSquare size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-white">3. Approve</h4>
                  <p className="text-sm text-slate-400 leading-relaxed px-4">You review, refine, and commit to the steps. You are the final authority.</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary border-4 border-background-dark ring-2 ring-primary/30 text-white shadow-xl shadow-primary/20">
                  <Zap size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-lg font-bold text-white">4. Execute</h4>
                  <p className="text-sm text-slate-400 leading-relaxed px-4">Focus and finish with 100% clarity on what needs to happen next.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="py-24" id="features">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Execution requires better tools, not more tools.</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                    <List className="text-primary mb-3" />
                    <h4 className="font-bold text-white mb-1">AI Breakdown</h4>
                    <p className="text-xs text-slate-500">Transform vague tasks into 5-minute sub-tasks.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                    <Kanban className="text-primary mb-3" />
                    <h4 className="font-bold text-white mb-1">Fluid Kanban</h4>
                    <p className="text-xs text-slate-500">Visual momentum tracking that doesn't feel like a chore.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                    <CalendarClock className="text-primary mb-3" />
                    <h4 className="font-bold text-white mb-1">Weekly Rituals</h4>
                    <p className="text-xs text-slate-500">Automated planning sessions to start every Monday with a win.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                    <Medal className="text-primary mb-3" />
                    <h4 className="font-bold text-white mb-1">Gamification</h4>
                    <p className="text-xs text-slate-500">Earn XP for deep work and project completion.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                    <LineChart className="text-primary mb-3" />
                    <h4 className="font-bold text-white mb-1">Energy Mapping</h4>
                    <p className="text-xs text-slate-500">Match tasks to your biological peak energy levels.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
                    <RefreshCw className="text-primary mb-3" />
                    <h4 className="font-bold text-white mb-1">Universal Sync</h4>
                    <p className="text-xs text-slate-500">Integrates with Calendar, Slack, and Notion.</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square flex items-center justify-center p-8">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#198ae6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="z-10 w-full max-w-sm space-y-4">
                  <div className="p-6 bg-slate-950 rounded-xl border border-primary/20 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-bold text-white">Project Progress</span>
                      <span className="text-xs font-bold text-primary">82%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                      <div className="h-full bg-primary" style={{ width: '82%' }}></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <PartyPopper size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Milestone Reached!</p>
                        <p className="text-[10px] text-slate-500">+450 XP Awarded</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gaming System Section */}
        <section className="py-24 bg-primary/5 border-y border-primary/10">
          <div className="mx-auto max-w-[900px] px-6 text-center">
            <Trophy className="text-primary mx-auto mb-6" size={48} />
            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Progress you can't fake</h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              We've built a logic-based reward system that only triggers on actual project completion. Level up your productivity through real deep work, not just checking off grocery lists.
            </p>
            <div className="inline-flex gap-8 items-center py-4 px-8 bg-slate-900/80 rounded-full border border-slate-800 shadow-xl">
              <div className="text-left">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Level</div>
                <div className="text-xl font-bold text-white">Executive Director</div>
              </div>
              <div className="h-10 w-px bg-slate-800"></div>
              <div className="text-left">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Global Rank</div>
                <div className="text-xl font-bold text-primary">Top 4%</div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24">
          <div className="mx-auto max-w-[1000px] px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white">Is this for you?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-px bg-slate-800 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
              {/* Column 1 */}
              <div className="bg-slate-950 p-10 flex flex-col gap-8">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <CheckCircle2 />
                  This is for you if...
                </h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-slate-300">
                    <Check className="text-primary mt-0.5" size={18} />
                    <span>You have high-level vision but struggle with daily task breakdown.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Check className="text-primary mt-0.5" size={18} />
                    <span>You're tired of complex PM tools that require 10 clicks to add a task.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-300">
                    <Check className="text-primary mt-0.5" size={18} />
                    <span>You want an AI that acts as a partner, not a spam generator.</span>
                  </li>
                </ul>
              </div>
              {/* Column 2 */}
              <div className="bg-slate-950 p-10 flex flex-col gap-8">
                <h3 className="text-xl font-bold text-slate-500 flex items-center gap-2">
                  <XCircle />
                  Not for you if...
                </h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-slate-500">
                    <X className="text-slate-700 mt-0.5" size={18} />
                    <span>You prefer simple to-do lists without project context.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-500">
                    <X className="text-slate-700 mt-0.5" size={18} />
                    <span>You need a team collaboration suite for 50+ people.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-500">
                    <X className="text-slate-700 mt-0.5" size={18} />
                    <span>You enjoy the "organization porn" of manual tagging.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[900px] px-6 text-center">
            <div className="relative p-12 md:p-20 rounded-[2.5rem] bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="relative z-10 flex flex-col gap-8">
                <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Stop managing tasks.<br/>Start executing plans.
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                  Join 5,000+ early adopters who have reclaimed 10+ hours a week from the productivity void.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <input 
                    className="min-w-[300px] rounded-lg border border-slate-700 bg-slate-800/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Enter your email" 
                    type="email"
                  />
                  <button 
                    onClick={() => navigate('/auth?mode=signup')}
                    className="rounded-lg bg-primary px-10 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] hover:bg-primary/90 shadow-2xl shadow-primary/40"
                  >
                    Get early access
                  </button>
                </div>
                <p className="text-slate-600 text-sm">No credit card required. Private beta access granted weekly.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-background-dark py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2 opacity-50">
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-white">
                <Layout size={14} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">Setup Life</h2>
            </div>
            <div className="flex gap-12 text-sm text-slate-600">
              <a className="hover:text-primary transition-colors" href="#">Privacy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms</a>
              <a className="hover:text-primary transition-colors" href="#">Updates</a>
              <a className="hover:text-primary transition-colors" href="#">Contact</a>
            </div>
            <div className="text-slate-600 text-sm">
              © 2024 Setup Life. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
