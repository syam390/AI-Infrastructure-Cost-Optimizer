import React, { useEffect, useState } from 'react';
import { Cpu, MemoryStick, DollarSign, Info, Sparkles, Check, X, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface RecommendationCardProps {
  recommendation: any;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onApply, onDismiss }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    setLoading(true);
    setExplanation('Generating AI explanation...');
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId: recommendation.instanceId,
          instanceType: recommendation.instanceType,
          cpu: recommendation.cpu,
          action: recommendation.action
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.explanation || "Failed to generate AI explanation.");
      }
      
      setExplanation(data.explanation || "No explanation generated.");
    } catch (error: any) {
      setExplanation(error.message || "Failed to generate AI explanation.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Idle': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Over-provisioned': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Stop': return 'bg-red-500 text-white';
      case 'Downsize': return 'bg-amber-500 text-white';
      default: return 'bg-zinc-700 text-zinc-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-zinc-900 border ${recommendation.applied ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-zinc-800'} flex flex-col gap-6 relative overflow-hidden`}
    >
      {recommendation.applied && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold py-1 w-24 text-center transform translate-x-7 translate-y-3 rotate-45 shadow-md">
            APPROVED
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{recommendation.instanceId}</h3>
          <p className="text-sm text-zinc-500 font-mono">{recommendation.instanceType}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(recommendation.status)}`}>
            {recommendation.status}
          </span>
          {recommendation.riskLevel && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(recommendation.riskLevel)}`}>
              Risk: {recommendation.riskLevel}
            </span>
          )}
          {recommendation.isAnomaly && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <Info className="w-3 h-3" />
              ANOMALY DETECTED
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU</span>
          </div>
          <p className="text-sm font-medium text-zinc-200">{(recommendation.cpu || 0).toFixed(1)}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <MemoryStick className="w-3.5 h-3.5" />
            <span>Memory</span>
          </div>
          <p className="text-sm font-medium text-zinc-200">{(recommendation.memory || 0).toFixed(1)}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cost</span>
          </div>
          <p className="text-sm font-medium text-zinc-200">${(recommendation.currentCost || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">AI Recommendation</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-tight ${getActionColor(recommendation.action)}`}>
            {recommendation.action}
          </span>
          {recommendation.estimatedSavings > 0 && (
            <span className="text-emerald-400 text-sm font-bold">
              Save ${(recommendation.estimatedSavings || 0).toFixed(2)}
            </span>
          )}
        </div>
        
        {explanation ? (
          <p className={`text-sm leading-relaxed ${loading ? 'text-zinc-600 italic' : 'text-zinc-400'}`}>
            {explanation}
          </p>
        ) : (
          <button 
            onClick={fetchExplanation}
            disabled={loading}
            className="text-xs bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg px-3 py-2 flex items-center justify-center gap-2 transition-colors w-full mt-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate AI Explanation
          </button>
        )}
        {recommendation.warning && (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{recommendation.warning}</span>
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-zinc-700/50 flex justify-between items-center text-xs text-zinc-500">
          <span>Status:</span>
          <span className="font-medium text-zinc-300">{recommendation.manualApprovalStatus}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-2">
        <button
          onClick={() => onApply(recommendation.instanceId)}
          disabled={recommendation.applied || recommendation.action === 'No Change'}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            recommendation.applied || recommendation.action === 'No Change'
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
          }`}
        >
          <Check className="w-4 h-4" />
          {recommendation.applied ? 'Approved' : 'Approve'}
        </button>
        <button
          onClick={() => onDismiss(recommendation.instanceId)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700 hover:border-zinc-600"
        >
          <X className="w-4 h-4" />
          Dismiss
        </button>
      </div>
    </motion.div>
  );
};
