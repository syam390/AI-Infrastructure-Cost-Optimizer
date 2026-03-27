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
import { TrendingDown, TrendingUp, ShieldCheck, DollarSign, AlertTriangle, Download, Cpu, MemoryStick, HardDrive, Network } from 'lucide-react';
import Papa from 'papaparse';
import { RecommendationCard } from './RecommendationCard';
import { ChatAssistant } from './ChatAssistant';
import { CostCharts } from './CostCharts';

interface DashboardProps {
  recommendations: any[];
  realTimeMetrics?: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ recommendations: initialRecommendations, realTimeMetrics }) => {
  const [recommendations, setRecommendations] = React.useState(initialRecommendations);

  React.useEffect(() => {
    setRecommendations(initialRecommendations);
  }, [initialRecommendations]);

  const handleApply = (id: string) => {
    setRecommendations(prev => prev.map(r => 
      r.instanceId === id ? { ...r, applied: true } : r
    ));
  };

  const handleDismiss = (id: string) => {
    setRecommendations(prev => prev.map(r => 
      r.instanceId === id ? { ...r, dismissed: true } : r
    ));
  };

  const currentTotalCost = recommendations.reduce((sum, r) => sum + (r.currentCost || 0), 0);
  const totalSavings = recommendations.reduce((sum, r) => sum + (r.applied && !r.dismissed ? (r.estimatedSavings || 0) : 0), 0);
  const potentialSavings = recommendations.reduce((sum, r) => sum + (!r.applied && !r.dismissed ? (r.estimatedSavings || 0) : 0), 0);
  const optimizedTotalCost = currentTotalCost - totalSavings;
  const optimizationScore = currentTotalCost > 0 
    ? Math.round(100 - (potentialSavings / currentTotalCost * 100)) 
    : 100;

  const activeRecommendations = recommendations.filter(r => !r.dismissed);

  const distribution = [
    { name: 'Idle', value: activeRecommendations.filter(r => r.status === 'Idle').length },
    { name: 'Over-provisioned', value: activeRecommendations.filter(r => r.status === 'Over-provisioned').length },
    { name: 'Healthy', value: activeRecommendations.filter(r => r.status === 'Healthy').length },
  ];

  const comparison = [
    { name: 'Current', cost: currentTotalCost },
    { name: 'Optimized', cost: optimizedTotalCost }
  ];

  const utilization = activeRecommendations.map(r => ({
    name: r.instanceId,
    cpu: r.cpu,
    memory: r.memory
  })).slice(0, 10); // Show top 10 for clarity

  const anomalies = activeRecommendations.filter(r => r.isAnomaly);

  const handleExportCSV = () => {
    const exportData = recommendations.map(r => ({
      'Instance ID': r.instanceId,
      'Instance Type': r.instanceType,
      'CPU Avg (%)': r.cpu,
      'Memory Avg (%)': r.memory,
      'Current Cost ($)': r.currentCost,
      'Action': r.action,
      'Estimated Savings ($)': r.estimatedSavings,
      'Optimized Cost ($)': r.optimizedCost,
      'Status': r.status,
      'Is Anomaly': r.isAnomaly ? 'Yes' : 'No',
      'Applied': r.applied ? 'Yes' : 'No',
      'Dismissed': r.dismissed ? 'Yes' : 'No'
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `infrastructure_optimization_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dataSummary = {
    totalInstances: recommendations.length,
    currentCost: currentTotalCost,
    potentialSavings: potentialSavings,
    realizedSavings: totalSavings,
    optimizationScore,
    anomaliesCount: anomalies.length,
    recommendations: recommendations.map(r => ({
      id: r.instanceId,
      type: r.instanceType,
      action: r.action,
      savings: r.estimatedSavings,
      status: r.status,
      isAnomaly: r.isAnomaly,
      applied: !!r.applied,
      dismissed: !!r.dismissed
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

      {/* Real-Time Metrics */}
      {realTimeMetrics && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-zinc-100">Live System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              label="CPU Usage" 
              value={`${(realTimeMetrics.cpu || 0).toFixed(1)}%`} 
              icon={<Cpu className="w-5 h-5" />}
              color={(realTimeMetrics.cpu || 0) > 80 ? 'red' : 'emerald'}
            />
            <StatCard 
              label="Memory Usage" 
              value={`${(realTimeMetrics.memory || 0).toFixed(1)}%`} 
              icon={<MemoryStick className="w-5 h-5" />}
              color={(realTimeMetrics.memory || 0) > 80 ? 'red' : 'emerald'}
            />
            <StatCard 
              label="Disk Usage" 
              value={`${(realTimeMetrics.disk || 0).toFixed(1)}%`} 
              icon={<HardDrive className="w-5 h-5" />}
              color={(realTimeMetrics.disk || 0) > 80 ? 'red' : 'emerald'}
            />
            <StatCard 
              label="Network (Rx/Tx)" 
              value={`${((realTimeMetrics.network?.rx || 0) / 1024 / 1024).toFixed(1)} / ${((realTimeMetrics.network?.tx || 0) / 1024 / 1024).toFixed(1)} MB/s`} 
              icon={<Network className="w-5 h-5" />}
              color="zinc"
            />
          </div>
        </div>
      )}

      {/* Charts & Chat Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CostCharts distribution={distribution} comparison={comparison} utilization={utilization} />
        </div>

        <div className="lg:col-span-1">
          <ChatAssistant dataSummary={dataSummary} />
        </div>
      </div>

      {/* Recommendations List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-zinc-100">Optimization Recommendations</h2>
            <span className="text-sm text-zinc-500">{activeRecommendations.length} instances analyzed</span>
          </div>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl border border-zinc-700 transition-all text-sm font-medium shadow-lg shadow-black/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRecommendations.map((rec) => (
            <RecommendationCard 
              key={rec.instanceId} 
              recommendation={rec} 
              onApply={handleApply}
              onDismiss={handleDismiss}
            />
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
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
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
