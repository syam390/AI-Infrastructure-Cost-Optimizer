import React, { useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';

interface RealTimeMonitoringProps {
  onDataLoaded: (data: any[]) => void;
}

export const RealTimeMonitoring: React.FC<RealTimeMonitoringProps> = ({ onDataLoaded }) => {
  const [isStarting, setIsStarting] = useState(false);

  const startMonitoring = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/realtime');
      const metrics = await res.json();
      
      const cpu = metrics.cpu || 0;
      const memory = metrics.memory || 0;

      // Create a mock instance based on the real-time metrics
      const instanceData = [
        {
          Instance_ID: 'local-node-01',
          Instance_Type: 'bare-metal',
          CPU_Avg: cpu,
          Memory_Avg: memory,
          Cost: 150,
          Environment: 'Production',
          Critical: 'Yes',
          Application_Name: 'Core Services'
        },
        {
          Instance_ID: 'dev-worker-01',
          Instance_Type: 't3.medium',
          CPU_Avg: cpu * 0.2, // Simulate low usage
          Memory_Avg: memory * 0.5,
          Cost: 45,
          Environment: 'Development',
          Critical: 'No',
          Application_Name: 'Background Jobs'
        },
        {
          Instance_ID: 'staging-web-01',
          Instance_Type: 't3.large',
          CPU_Avg: cpu * 0.4, // Simulate medium usage
          Memory_Avg: memory * 0.8,
          Cost: 85,
          Environment: 'Staging',
          Critical: 'No',
          Application_Name: 'Frontend App'
        }
      ];
      
      onDataLoaded(instanceData);
    } catch (error) {
      console.error("Failed to fetch real-time metrics", error);
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50 transition-colors">
      <div className="flex flex-col items-center gap-4 text-zinc-400">
        <div className={`p-4 rounded-full transition-colors ${isStarting ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800'}`}>
          {isStarting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Activity className="w-8 h-8" />}
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">Real-Time Monitoring</p>
          <p className="text-sm opacity-60">Collect live system metrics from this server</p>
        </div>
        
        <button
          onClick={startMonitoring}
          disabled={isStarting}
          className={`mt-4 px-6 py-3 rounded-lg font-medium transition-colors ${
            isStarting 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {isStarting ? 'Starting...' : 'Start Monitoring'}
        </button>
      </div>
    </div>
  );
};
