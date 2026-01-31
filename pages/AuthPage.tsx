import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Loader2, ArrowLeft } from 'lucide-react';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    // CRITICAL: Store role in metadata for RLS policies
                    role: email === 'admin@gmail.com' ? 'admin' : 'user'
                }
            }
        });
        if (error) throw error;
        // If email confirmation is disabled in Supabase, this will log us in.
        // If enabled, it sends an email.
        window.location.reload(); 
      } else {
        // LOGIN MODE
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        
        // Special logic for Admin Auto-Provisioning (Dev Helper)
        if (signInError && email === 'admin@gmail.com' && signInError.message.includes("Invalid login credentials")) {
            console.log("Admin account not found. Auto-creating...");
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { role: 'admin' } }
            });
            
            if (signUpError) throw new Error("Could not auto-create admin. " + signUpError.message);
            
            alert("Admin account created! You will be logged in now.");
            window.location.reload();
            return;

        } else if (signInError) {
            throw signInError;
        } else {
            // Success normal login
            navigate('/app');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
        </button>
      </div>
      
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-primary text-white font-bold text-2xl mb-4">S</div>
            <h1 className="text-2xl font-bold">{mode === 'login' ? 'Welcome Back' : 'Start Your Journey'}</h1>
            <p className="text-muted text-sm mt-2">Access your Setup Life workspace</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    className="w-full bg-background border border-border rounded-lg p-3 focus:border-primary focus:outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Password</label>
                <input 
                    type="password" 
                    required
                    className="w-full bg-background border border-border rounded-lg p-3 focus:border-primary focus:outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/10 p-2 rounded border border-red-900/20">{error}</p>}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
        </form>

        <div className="mt-6 text-center text-sm">
            <span className="text-muted">{mode === 'login' ? "New here? " : "Already have an account? "}</span>
            <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary hover:underline font-medium"
            >
                {mode === 'login' ? 'Create an account' : 'Login'}
            </button>
        </div>
      </div>
    </div>
  );
};