import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { parseBrainDump } from '../services/geminiService';
import { AIProposal } from '../types';
import { ProposalModal } from '../components/ProposalModal';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const BrainDump = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proposal, setProposal] = useState<AIProposal | null>(null);
  const { applyAIProposal } = useApp();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await parseBrainDump(input);
      setProposal(result);
    } catch (error) {
      alert("Something went wrong with the AI analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (proposal) {
      applyAIProposal(proposal);
      setProposal(null);
      setInput('');
      navigate('/app/projects');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="text-accent" />
          Brain Dump
        </h1>
        <p className="text-muted text-lg">
          Unload your thoughts, meeting notes, or new project ideas here. 
          The AI will structure them into projects, goals, and actionable tasks.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative flex-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I want to start a new SaaS called 'DevTool'. The vision is to help junior devs debug faster. I need to build a landing page, set up the auth system (NextAuth), and write the initial marketing copy. Priority is high for the MVP. Also, for my 'Fitness' project, I need to add a goal to run a 5k next month..."
            className="w-full h-full bg-surface border border-border rounded-xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono leading-relaxed"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !input.trim()}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all
              ${isAnalyzing || !input.trim() 
                ? 'bg-surface text-muted cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-primary/20'}
            `}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" />
                Structuring Chaos...
              </>
            ) : (
              <>
                Analyze & Structure
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <ProposalModal 
        isOpen={!!proposal}
        proposal={proposal}
        onClose={() => setProposal(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};