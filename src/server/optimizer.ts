export interface InstanceData {
  Instance_ID: string;
  Instance_Type: string;
  CPU_Avg: number;
  Memory_Avg: number;
  Cost: number;
}

export interface Recommendation {
  instanceId: string;
  instanceType: string;
  cpu: number;
  memory: number;
  currentCost: number;
  action: 'Stop' | 'Downsize' | 'Reserved' | 'Archive' | 'No Change';
  estimatedSavings: number;
  optimizedCost: number;
  status: 'Idle' | 'Over-provisioned' | 'Healthy';
}

export function analyzeInfrastructure(data: InstanceData[]): Recommendation[] {
  return data.map(item => {
    let action: 'Stop' | 'Downsize' | 'Reserved' | 'Archive' | 'No Change' = 'No Change';
    let status: 'Healthy' | 'Over-provisioned' | 'Idle' = 'Healthy';
    let estimatedSavings = 0;

    if (item.CPU_Avg < 10) {
      status = 'Idle';
      action = 'Stop';
      estimatedSavings = item.Cost;
    } else if (item.CPU_Avg < 25) {
      status = 'Over-provisioned';
      action = 'Downsize';
      estimatedSavings = item.Cost * 0.45;
    } else if (item.CPU_Avg > 70) {
      status = 'Healthy';
      action = 'Reserved'; // High usage suggests long-term commitment
      estimatedSavings = item.Cost * 0.3;
    } else {
      status = 'Healthy';
      action = 'No Change';
      estimatedSavings = 0;
    }

    return {
      instanceId: item.Instance_ID,
      instanceType: item.Instance_Type,
      cpu: item.CPU_Avg,
      memory: item.Memory_Avg,
      currentCost: item.Cost,
      action,
      estimatedSavings,
      optimizedCost: item.Cost - estimatedSavings,
      status
    };
  });
}
