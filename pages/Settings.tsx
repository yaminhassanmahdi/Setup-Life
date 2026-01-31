import React, { useState } from 'react';
import { Settings as SettingsIcon, LogIn, Cloud, RefreshCw, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/supabase';

export const Settings = () => {
  const { user, userRole, logout, syncLocalToRemote } = useApp();
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsAuthLoading(true);
      setAuthError('');
      
      try {
          if (authMode === 'signup') {
              const { error } = await supabase.auth.signUp({ email, password });
              if (error) throw error;
          } else {
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) throw error;
          }
          setEmail('');
          setPassword('');
      } catch (err: any) {
          setAuthError(err.message);
      } finally {
          setIsAuthLoading(false);
      }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="text-muted" /> Settings
      </h1>

      {/* --- AUTH SECTION --- */}
      <div className="bg-surface border border-border rounded-xl p-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Cloud className="text-primary" /> Cloud Sync (Supabase)
          </h2>
          
          {user ? (
              <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-900/50 p-4 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                          <LogIn size={20} />
                      </div>
                      <div>
                          <p className="font-bold text-green-400">Logged in as {user.email}</p>
                          <div className="flex items-center gap-2 text-xs text-muted">
                              <span>Role: <span className="text-white font-mono uppercase">{userRole}</span></span>
                              <span>•</span>
                              <span>Data Synced</span>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                        onClick={() => syncLocalToRemote()}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                          <RefreshCw size={16} /> Force Sync Local Data
                      </button>
                      <button 
                        onClick={logout}
                        className="px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                      >
                          <LogOut size={16} /> Logout
                      </button>
                  </div>
              </div>
          ) : (
              <div className="space-y-4">
                  <p className="text-sm text-muted">Sign in to sync your data across devices and ensure it's never lost.</p>
                  
                  <form onSubmit={handleAuth} className="space-y-3">
                      <input 
                          type="email" 
                          placeholder="Email" 
                          className="w-full bg-background border border-border rounded px-4 py-2"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                      />
                      <input 
                          type="password" 
                          placeholder="Password" 
                          className="w-full bg-background border border-border rounded px-4 py-2"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                      />
                      
                      {authError && <p className="text-xs text-red-400">{authError}</p>}
                      
                      <div className="flex flex-col gap-2">
                          <button 
                            type="submit" 
                            disabled={isAuthLoading}
                            className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50"
                          >
                              {isAuthLoading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
                          </button>
                          
                          <div className="text-center text-xs">
                              <span className="text-muted">{authMode === 'login' ? "Don't have an account? " : "Already have an account? "}</span>
                              <button 
                                type="button"
                                className="text-primary hover:underline"
                                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                              >
                                  {authMode === 'login' ? 'Sign Up' : 'Login'}
                              </button>
                          </div>
                      </div>
                  </form>
              </div>
          )}
      </div>
    </div>
  );
};