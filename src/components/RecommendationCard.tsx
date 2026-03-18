import React, { useEffect, useState } from 'react';
import { Cpu, MemoryStick, DollarSign, Info, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface RecommendationCardProps {
  recommendation: any;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [explanation, setExplanation] = useState<string>('Generating AI explanation...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExplanation() {
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
        const { explanation } = await response.json();
        setExplanation(explanation);
      } catch (error) {
        setExplanation("Failed to generate AI explanation.");
      } finally {
        setLoading(false);
      }
    }
    fetchExplanation();
  }, [recommendation]);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{recommendation.instanceId}</h3>
          <p className="text-sm text-zinc-500 font-mono">{recommendation.instanceType}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(recommendation.status)}`}>
            {recommendation.status}
          </span>
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
          <p className="text-sm font-medium text-zinc-200">{recommendation.cpu}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <MemoryStick className="w-3.5 h-3.5" />
            <span>Memory</span>
          </div>
          <p className="text-sm font-medium text-zinc-200">{recommendation.memory}%</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cost</span>
          </div>
          <p className="text-sm font-medium text-zinc-200">${recommendation.currentCost}</p>
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
              Save ${recommendation.estimatedSavings.toFixed(2)}
            </span>
          )}
        </div>
        <p className={`text-sm leading-relaxed ${loading ? 'text-zinc-600 italic' : 'text-zinc-400'}`}>
          {explanation}
        </p>
      </div>
    </motion.div>
  );
};
