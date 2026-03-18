import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { TrendingDown, TrendingUp, ShieldCheck, DollarSign, AlertTriangle } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';
import { ChatAssistant } from './ChatAssistant';
import { CostCharts } from './CostCharts';

interface DashboardProps {
  recommendations: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ recommendations }) => {
  const currentTotalCost = recommendations.reduce((sum, r) => sum + r.currentCost, 0);
  const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedSavings, 0);
  const optimizedTotalCost = currentTotalCost - totalSavings;
  const optimizationScore = currentTotalCost > 0 
    ? Math.round(100 - (totalSavings / currentTotalCost * 100)) 
    : 100;

  const distribution = [
    { name: 'Idle', value: recommendations.filter(r => r.status === 'Idle').length },
    { name: 'Over-provisioned', value: recommendations.filter(r => r.status === 'Over-provisioned').length },
    { name: 'Healthy', value: recommendations.filter(r => r.status === 'Healthy').length },
  ];

  const comparison = [
    { name: 'Current', cost: currentTotalCost },
    { name: 'Optimized', cost: optimizedTotalCost }
  ];

  const anomalies = recommendations.filter(r => r.isAnomaly);

  const dataSummary = {
    totalInstances: recommendations.length,
    currentCost: currentTotalCost,
    potentialSavings: totalSavings,
    optimizationScore,
    anomaliesCount: anomalies.length,
    recommendations: recommendations.map(r => ({
      id: r.instanceId,
      type: r.instanceType,
      action: r.action,
      savings: r.estimatedSavings,
      status: r.status,
      isAnomaly: r.isAnomaly
    }))
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          label="Current Monthly Cost" 
          value={`$${currentTotalCost.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5" />}
          color="zinc"
        />
        <StatCard 
          label="Estimated Savings" 
          value={`$${totalSavings.toLocaleString()}`} 
          icon={<TrendingDown className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard 
          label="Optimized Cost" 
          value={`$${optimizedTotalCost.toLocaleString()}`} 
          icon={<TrendingUp className="w-5 h-5" />}
          color="violet"
        />
        <StatCard 
          label="Optimization Score" 
          value={`${optimizationScore}%`} 
          icon={<ShieldCheck className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Anomaly Alert */}
      {anomalies.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h4 className="text-red-400 font-bold text-sm">Cost Anomalies Detected</h4>
            <p className="text-red-400/70 text-xs">We identified {anomalies.length} instances with unusually high costs compared to your infrastructure average.</p>
          </div>
        </div>
      )}

      {/* Charts & Chat Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CostCharts distribution={distribution} comparison={comparison} />
        </div>

        <div className="lg:col-span-1">
          <ChatAssistant dataSummary={dataSummary} />
        </div>
      </div>

      {/* Recommendations List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100">Optimization Recommendations</h2>
          <span className="text-sm text-zinc-500">{recommendations.length} instances analyzed</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.instanceId} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => {
  const colors: Record<string, string> = {
    zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
      </div>
    </div>
  );
};
