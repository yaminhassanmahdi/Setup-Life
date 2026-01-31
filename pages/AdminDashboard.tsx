import React, { useEffect, useState } from 'react';
import { supabase, mapPlanFromDB } from '../services/supabase';
import { Plan } from '../types';
import { useApp } from '../context/AppContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, CreditCard, LayoutDashboard, Plus, Check, FolderKanban, CheckSquare, Shield, ArrowUpCircle, X, Save, Search, ArrowLeft, RefreshCw } from 'lucide-react';

export const AdminDashboard = () => {
  const { userRole } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans'>('overview');
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Plan Creation State
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', features: '' });
  
  // User Search
  const [userSearch, setUserSearch] = useState('');

  // Stats
  const [stats, setStats] = useState({
      totalUsers: 0,
      totalProjects: 0,
      totalTasks: 0
  });

  // Mock Purchase Requests
  const [mockPurchases, setMockPurchases] = useState([
      { id: 1, user: 'newfounder@example.com', plan: 'Pro Founder', status: 'Pending Approval' },
      { id: 2, user: 'student@university.edu', plan: 'Student Tier', status: 'Pending Approval' }
  ]);

  useEffect(() => {
      if (userRole === 'admin') {
          fetchData();
      }
  }, [userRole]);

  const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      
      try {
          // 1. Fetch Users & Profiles
          const { data: usersData, error: usersError } = await supabase.from('profiles').select('*').order('xp', { ascending: false });
          
          if (usersError) {
              console.error("Error fetching users:", usersError);
              setFetchError(usersError.message);
          } else if (usersData) {
              setUsers(usersData);
              setStats(prev => ({ ...prev, totalUsers: usersData.length }));
          }

          // 2. Fetch Plans
          const { data: plansData } = await supabase.from('plans').select('*').order('price', { ascending: true });
          if (plansData) setPlans(plansData.map(mapPlanFromDB));

          // 3. System Wide Counts
          const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
          const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
          
          setStats(prev => ({ 
              ...prev, 
              totalProjects: projectCount || 0,
              totalTasks: taskCount || 0
          }));
      } catch (e: any) {
          setFetchError(e.message || "Unknown error occurred");
      } finally {
          setIsLoading(false);
      }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPlan.name || !newPlan.price) return;

      const featuresArray = newPlan.features.split(',').map(s => s.trim()).filter(s => s);
      
      const { error } = await supabase.from('plans').insert({
          name: newPlan.name,
          price: Number(newPlan.price),
          features: featuresArray,
          is_active: true
      });

      if (error) {
          alert("Error creating plan: " + error.message);
      } else {
          setNewPlan({ name: '', price: '', features: '' });
          setIsAddingPlan(false);
          fetchData();
      }
  }

  const promoteToAdmin = async (userId: string) => {
      if(!confirm("Are you sure you want to promote this user to Admin? They will have full access.")) return;
      
      const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
      if (error) {
          alert("Error updating role: " + error.message);
      } else {
          alert("User promoted successfully.");
          fetchData();
      }
  }

  const approvePurchase = (id: number) => {
      setMockPurchases(prev => prev.filter(p => p.id !== id));
      alert("Purchase request approved. Subscription active.");
  }

  if (userRole !== 'admin') {
      return <Navigate to="/app" />;
  }

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-text h-full overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Shield className="text-red-500" /> Admin Command Center
                </h1>
                <p className="text-muted">Manage system users, pricing plans, and global analytics.</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => navigate('/app')}
                    className="px-4 py-2 bg-surface hover:bg-white/5 border border-border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to App
                </button>
                <div className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-bold border border-red-900/50 flex items-center">
                    SUPER ADMIN
                </div>
            </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-white'}`}
            >
                <LayoutDashboard size={16} /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-white'}`}
            >
                <Users size={16} /> Users View
            </button>
            <button 
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'plans' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-white'}`}
            >
                <CreditCard size={16} /> Plans & Billing
            </button>
        </div>

        {/* === TAB CONTENT === */}
        
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface border border-border p-6 rounded-xl flex items-center gap-4">
                        <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted uppercase font-bold">Total Users</p>
                            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                    </div>
                    <div className="bg-surface border border-border p-6 rounded-xl flex items-center gap-4">
                        <div className="p-4 rounded-full bg-purple-500/20 text-purple-400">
                            <FolderKanban size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted uppercase font-bold">Total Projects</p>
                            <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
                        </div>
                    </div>
                    <div className="bg-surface border border-border p-6 rounded-xl flex items-center gap-4">
                        <div className="p-4 rounded-full bg-green-500/20 text-green-400">
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted uppercase font-bold">Total Tasks</p>
                            <p className="text-3xl font-bold text-white">{stats.totalTasks}</p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-4">Recent Activity</h3>
                        <p className="text-muted text-sm italic">Activity log coming soon...</p>
                    </div>
                    <div className="bg-surface border border-border rounded-xl p-6">
                         <h3 className="font-bold mb-4">System Health</h3>
                         <div className="flex items-center gap-2 text-green-400 bg-green-900/10 p-3 rounded">
                            <Check size={16} />
                            <span className="text-sm font-medium">All Systems Operational</span>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-[600px] animate-in fade-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-blue-400" /> User Directory
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={fetchData}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Refresh List"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input 
                                placeholder="Search email..." 
                                className="bg-background border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:border-primary outline-none w-64" 
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                {fetchError && (
                    <div className="bg-red-900/20 border border-red-900/50 p-3 rounded text-sm text-red-300 mb-4">
                        Error fetching users: {fetchError}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-xs uppercase text-muted bg-surface sticky top-0 z-10">
                            <tr>
                                <th className="p-3 border-b border-border">User Email</th>
                                <th className="p-3 border-b border-border">Role</th>
                                <th className="p-3 border-b border-border">XP Level</th>
                                <th className="p-3 border-b border-border">Status</th>
                                <th className="p-3 border-b border-border text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredUsers.map((u: any) => (
                                <tr key={u.id} className="border-b border-border hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-medium flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs text-white font-bold">
                                            {u.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        {u.email || 'No Email'}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${u.role === 'admin' ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-blue-900/20 text-blue-400 border-blue-900/30'}`}>
                                            {u.role?.toUpperCase() || 'USER'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-yellow-500 font-mono font-bold">{u.xp} XP</td>
                                    <td className="p-3">
                                        <span className="text-green-400 text-xs flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        {u.role !== 'admin' && (
                                            <button 
                                                onClick={() => promoteToAdmin(u.id)}
                                                className="text-xs bg-surface border border-border hover:bg-white/10 px-3 py-1.5 rounded flex items-center gap-1 ml-auto transition-colors"
                                                title="Promote to Admin"
                                            >
                                                <ArrowUpCircle size={14} className="text-green-400"/> Promote
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted italic">
                                        No users found matching "{userSearch}". 
                                        {users.length === 0 && (
                                            <span className="block mt-2 text-xs">
                                                (Note: Users must sign in at least once after the 'profiles' table creation to appear here.)
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'plans' && (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
                {/* PLANS MANAGEMENT */}
                <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="text-green-400" /> Subscription Plans
                        </h2>
                        <button 
                            onClick={() => setIsAddingPlan(!isAddingPlan)}
                            className={`text-xs border px-3 py-1.5 rounded hover:bg-white/10 flex items-center gap-1 transition-colors ${isAddingPlan ? 'border-red-500 text-red-400' : 'border-primary text-primary bg-primary/10'}`}
                        >
                            {isAddingPlan ? <X size={14}/> : <Plus size={14} />} {isAddingPlan ? 'Cancel' : 'Add New Plan'}
                        </button>
                    </div>

                    {isAddingPlan && (
                        <form onSubmit={handleAddPlan} className="mb-6 p-4 border border-dashed border-primary/30 rounded-xl bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase mb-1 block">Plan Name</label>
                                    <input 
                                        placeholder="e.g. Enterprise Tier" 
                                        className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:border-green-500 outline-none transition-colors"
                                        value={newPlan.name}
                                        onChange={e => setNewPlan({...newPlan, name: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase mb-1 block">Price (Monthly)</label>
                                    <input 
                                        type="number"
                                        placeholder="29.99" 
                                        className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:border-green-500 outline-none transition-colors"
                                        value={newPlan.price}
                                        onChange={e => setNewPlan({...newPlan, price: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted uppercase mb-1 block">Features (Comma Separated)</label>
                                <textarea 
                                    placeholder="Unlimited Projects, AI Analytics, Priority Support..." 
                                    className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:border-green-500 outline-none h-20 resize-none transition-colors"
                                    value={newPlan.features}
                                    onChange={e => setNewPlan({...newPlan, features: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white text-sm py-2 rounded-lg font-bold hover:bg-green-700 flex justify-center items-center gap-2 transition-colors">
                                <Save size={16} /> Create Plan
                            </button>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map(plan => (
                            <div key={plan.id} className="p-4 bg-background border border-border rounded-xl relative group hover:border-primary/50 transition-all">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-lg">{plan.name}</span>
                                    <span className="text-xl font-bold text-green-400">${plan.price}</span>
                                </div>
                                <div className="h-px bg-border w-full my-2" />
                                <ul className="space-y-2">
                                    {plan.features && plan.features.map((f, i) => (
                                        <li key={i} className="text-sm text-muted flex items-center gap-2">
                                            <Check size={12} className="text-primary" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                {plan.isActive ? (
                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                ) : (
                                     <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                 {/* PURCHASE REQUESTS */}
                 <div className="bg-surface border border-border rounded-xl p-6 h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Approval Queue</h2>
                        {mockPurchases.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{mockPurchases.length}</span>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {mockPurchases.map(p => (
                             <div key={p.id} className="p-4 bg-background border border-border rounded-xl flex flex-col gap-3 text-sm hover:border-white/20 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-green-400 text-base">{p.plan}</p>
                                        <p className="text-xs text-muted">{p.user}</p>
                                    </div>
                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30">PENDING</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => approvePurchase(p.id)}
                                        className="flex-1 text-xs bg-green-600/20 text-green-400 border border-green-600/50 px-3 py-2 rounded-lg hover:bg-green-600/30 flex justify-center items-center gap-2 transition-colors font-medium"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button 
                                        onClick={() => setMockPurchases(prev => prev.filter(x => x.id !== p.id))}
                                        className="text-xs bg-surface border border-border px-3 py-2 rounded-lg hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 text-muted transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {mockPurchases.length === 0 && (
                            <div className="text-center py-10 text-muted border-2 border-dashed border-border rounded-xl bg-background/50">
                                <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">All clear!</p>
                                <p className="text-xs opacity-70">No pending subscription requests.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

// Simple icon component for empty state
const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);