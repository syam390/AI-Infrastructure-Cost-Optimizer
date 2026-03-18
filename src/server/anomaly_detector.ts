import { InstanceData } from "./optimizer";

export interface Anomaly {
  instanceId: string;
  reason: string;
  severity: 'Low' | 'Medium' | 'High';
}

export function detectAnomalies(data: InstanceData[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  if (data.length === 0) return [];

  const costs = data.map(d => d.Cost);
  const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
  const stdDev = Math.sqrt(costs.map(x => Math.pow(x - avgCost, 2)).reduce((a, b) => a + b, 0) / costs.length);
  const threshold = avgCost + 1.5 * stdDev;

  data.forEach(item => {
    // Cost anomaly
    if (item.Cost > threshold && item.Cost > 200) {
      anomalies.push({
        instanceId: item.Instance_ID,
        reason: `Cost ($${item.Cost}) is significantly higher than the average ($${Math.round(avgCost)}).`,
        severity: item.Cost > avgCost + 3 * stdDev ? 'High' : 'Medium'
      });
    }

    // Performance anomaly (High CPU but low memory or vice versa)
    if (item.CPU_Avg > 90 && item.Memory_Avg < 20) {
      anomalies.push({
        instanceId: item.Instance_ID,
        reason: "Extreme CPU usage with very low memory utilization detected.",
        severity: 'Medium'
      });
    }
  });

  return anomalies;
}
