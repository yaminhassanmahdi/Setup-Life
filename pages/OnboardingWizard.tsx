import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseBrainDump } from '../services/geminiService';
import { Sparkles, ArrowRight, Loader2, FileText, HelpCircle, X } from 'lucide-react';

export const OnboardingWizard = () => {
  const { applyAIProposal, completeOnboarding, onboardingCompleted } = useApp();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: If already onboarded, redirect immediately.
  useEffect(() => {
      if (onboardingCompleted) {
          navigate('/app');
      }
  }, [onboardingCompleted, navigate]);

  const handleFinish = async () => {
      if (!input.trim()) return;
      setLoading(true);

      const prompt = `
          NEW USER ONBOARDING CONTEXT:
          The user has provided a complete dump of their life, work, education, and goals.
          
          User Input:
          "${input}"
          
          INSTRUCTIONS:
          1. Extract all Projects (Work, Personal, Education).
          2. Create Goals and KPIs for these projects.
          3. Extract specific Tasks and Assignments.
          4. Build a Schedule for tomorrow based on their routine/context.
          5. Identify daily Habits.
      `;
      
      try {
          // NOTE: We do NOT pass userApiKey here. 
          // This forces geminiService to use the Environment Variable (Platform Key) for onboarding.
          const proposal = await parseBrainDump(prompt, new Date().toISOString().split('T')[0]);
          
          if (proposal) {
              applyAIProposal(proposal);
              await completeOnboarding(); 
              navigate('/app');
          } else {
              alert("Failed to generate plan. Please try again or add more detail.");
          }
      } catch (e) {
          console.error(e);
          alert("Error generating plan. Please try again.");
      } finally {
          setLoading(false);
      }
  }

  const handleSkip = async () => {
      await completeOnboarding();
      navigate('/app');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-surface border border-border rounded-2xl p-8 shadow-2xl relative">
          
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 text-muted hover:text-white text-sm flex items-center gap-1 px-3 py-1 rounded hover:bg-white/5 transition-colors"
          >
            Skip Setup <X size={14} />
          </button>
          
          <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                  <Sparkles size={14} /> AI INITIALIZATION
              </div>
              <h1 className="text-3xl font-bold mb-2">Tell us everything.</h1>
              <p className="text-muted text-lg">
                  To build your Operating System, we need context. Paste your entire life here: 
                  Projects, Education background, Current Courses, Life Goals, and Daily Routines.
              </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl mb-6 flex gap-3">
              <HelpCircle className="text-blue-400 shrink-0 mt-1" size={20} />
              <div className="text-sm text-blue-100">
                  <p className="font-bold mb-1">Tip: Ask ChatGPT to help you write this.</p>
                  <p className="opacity-80 italic mb-2">
                      "Write a comprehensive summary of my life including my professional projects, 
                      current educational courses and assignments, personal life goals, and my ideal daily schedule. 
                      Write It on my behalf first person view."
                  </p>
                  <p className="opacity-80">Then copy and paste the result below.</p>
              </div>
          </div>

          <div className="relative mb-6">
              <textarea 
                  className="w-full h-64 bg-background border border-border rounded-xl p-4 text-base focus:outline-none focus:border-primary resize-none font-mono leading-relaxed"
                  placeholder="I am a software engineer building a SaaS called 'FounderFocus'. I am also studying Computer Science at University, taking 'Algorithms' and 'Linear Algebra'. My goal is to launch the MVP by next month. I like to workout in the mornings at 7am..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
              />
              <FileText className="absolute bottom-4 right-4 text-muted opacity-20" size={48} />
          </div>

          <div className="flex justify-between items-center">
              <button 
                  onClick={handleSkip}
                  className="text-muted hover:text-white text-sm px-4 py-2"
              >
                  I'll do this manually later
              </button>

              <button 
                disabled={!input.trim() || loading}
                onClick={handleFinish}
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl font-bold disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-primary/20 text-lg transition-all"
              >
                  {loading ? (
                      <>
                        <Loader2 className="animate-spin" /> Analyzing & Building OS...
                      </>
                  ) : (
                      <>
                        Initialize System <ArrowRight size={20} />
                      </>
                  )}
              </button>
          </div>
          
          <p className="text-center text-xs text-muted mt-6">
              This information is processed once to set up your workspace and is not shared with third parties.
          </p>
      </div>
    </div>
  );
};