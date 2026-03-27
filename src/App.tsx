import { useState, useEffect } from 'react';
import { Cloud, RefreshCcw, LayoutDashboard, Database, Activity } from 'lucide-react';
import { UploadData } from './components/UploadData';
import { Dashboard } from './components/Dashboard';
import { RealTimeMonitoring } from './components/RealTimeMonitoring';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any[] | null>(null);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'upload' | 'realtime'>('upload');
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (dataSource === 'realtime' && data) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/realtime');
          const metrics = await res.json();
          setRealTimeMetrics(metrics);
          
          const cpu = metrics.cpu || 0;
          const memory = metrics.memory || 0;

          // Update the instance data with new metrics
          const updatedData = [
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
          
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: updatedData })
          });
          
          if (response.ok) {
            const result = await response.json();
            setRecommendations(result.recommendations);
          }
        } catch (error) {
          console.error("Real-time update failed:", error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [dataSource, data]);

  const handleDataLoaded = async (parsedData: any[]) => {
    setLoading(true);
    try {
      console.log("Sending data for analysis:", parsedData.length, "items");
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
      }
      
      const result = await response.json();
      setData(parsedData);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error instanceof Error ? error.message : "Analysis failed. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setRecommendations(null);
    setRealTimeMetrics(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-violet-500/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CostOptimizer<span className="text-violet-500">.ai</span></span>
          </div>
          
          {data && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-4 py-2 rounded-lg hover:bg-zinc-900"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset Analysis</span>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto flex flex-col gap-12 pt-12"
            >
              <div className="text-center flex flex-col gap-4">
                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                  Optimize your cloud <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">infrastructure costs.</span>
                </h1>
                <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
                  Upload your infrastructure usage data or monitor in real-time to let our AI analyze over-provisioned resources and save up to 40% on your monthly bill.
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setDataSource('upload')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    dataSource === 'upload' 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  Upload Dataset
                </button>
                <button
                  onClick={() => setDataSource('realtime')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    dataSource === 'realtime' 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  Real-Time Monitoring
                </button>
              </div>

              {dataSource === 'upload' ? (
                <UploadData onDataLoaded={handleDataLoaded} />
              ) : (
                <RealTimeMonitoring onDataLoaded={handleDataLoaded} />
              )}

              {loading && (
                <div className="flex items-center justify-center gap-3 text-violet-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Analyzing infrastructure...</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-zinc-900">
                <div className="flex flex-col gap-2">
                  <LayoutDashboard className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-semibold">Smart Dashboard</h3>
                  <p className="text-xs text-zinc-500">Real-time visualization of your cloud spending.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold">Data Analysis</h3>
                  <p className="text-xs text-zinc-500">Deep dive into CPU and Memory utilization.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Cloud className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-semibold">AI Insights</h3>
                  <p className="text-xs text-zinc-500">Personalized recommendations powered by Gemini.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-12"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Infrastructure Analysis</h1>
                <p className="text-zinc-500">
                  {dataSource === 'realtime' 
                    ? 'Real-time monitoring of local infrastructure.' 
                    : `Based on the uploaded dataset of ${data.length} instances.`}
                </p>
              </div>
              
              {recommendations && <Dashboard recommendations={recommendations} realTimeMetrics={realTimeMetrics} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-900 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
          <p>© 2026 AI Infrastructure Cost Optimizer. Built with Gemini.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-zinc-300 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
